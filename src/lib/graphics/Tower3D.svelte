<script>
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { initializeWebGPU } from './engine/WebGPUContext.js';
	import { createRenderPipelineSurface } from './engine/RenderPipelineSurface.js';
	import Camera from './engine/Camera.js';
	import CameraController from './engine/CameraController.js';
	import { buildGrid } from './lattice.js';
	import { towerParams, zoom } from '$lib/store/store.js';

	const RES = 220; // mesh resolution

	let canvas;
	let supported = true;

	let device, context, camera, controller, surface;
	let paramsBuffer, vertexBuffer, indexBuffer, depthTexture;
	let indexCount = 0;
	let op;
	let builtTiles = -1;
	let raf = null;
	let dragging = false;
	let dirty = true;

	function resize() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
		const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
		if (canvas.width !== w || canvas.height !== h) {
			canvas.width = w;
			canvas.height = h;
			if (camera) camera.updateAspect(w, h);
			if (depthTexture) depthTexture.destroy();
			depthTexture = device.createTexture({
				size: { width: w, height: h },
				format: 'depth24plus',
				usage: GPUTextureUsage.RENDER_ATTACHMENT
			});
		}
	}

	function fitCamera() {
		const extent = op.tiles + 0.5;
		const H = Math.max(extent, op.clampH) * 1.6;
		controller.baseDistance = H / 0.12;
		controller.distance = (H / 0.12) * get(zoom);
		controller.updateCameraPosition();
	}

	function rebuildMesh() {
		const extent = op.tiles + 0.5;
		const { positions, indices, indexCount: n } = buildGrid(RES, extent);
		indexCount = n;
		builtTiles = op.tiles;
		if (vertexBuffer) vertexBuffer.destroy();
		if (indexBuffer) indexBuffer.destroy();
		vertexBuffer = device.createBuffer({
			size: positions.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});
		device.queue.writeBuffer(vertexBuffer, 0, positions);
		indexBuffer = device.createBuffer({
			size: indices.byteLength,
			usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
		});
		device.queue.writeBuffer(indexBuffer, 0, indices);
		fitCamera();
	}

	function writeParams() {
		device.queue.writeBuffer(
			paramsBuffer,
			0,
			new Float32Array([
				1, 0, // ω₁
				op.tauRe, op.tauIm, // ω₂
				op.height, op.clampH,
				op.contours ? 1 : 0, 0
			])
		);
	}

	function frame() {
		if (dirty) {
			if (op.tiles !== builtTiles) rebuildMesh();
			writeParams();
			dirty = false;
		}
		resize();

		const encoder = device.createCommandEncoder();
		const view = context.getCurrentTexture().createView();
		const pass = encoder.beginRenderPass({
			colorAttachments: [
				{ view, loadOp: 'clear', storeOp: 'store', clearValue: { r: 0.03, g: 0.03, b: 0.04, a: 1 } }
			],
			depthStencilAttachment: {
				view: depthTexture.createView(),
				depthClearValue: 1.0,
				depthLoadOp: 'clear',
				depthStoreOp: 'store'
			}
		});
		pass.setPipeline(surface.pipeline);
		pass.setBindGroup(0, surface.bindGroup);
		pass.setVertexBuffer(0, vertexBuffer);
		pass.setIndexBuffer(indexBuffer, 'uint32');
		pass.drawIndexed(indexCount, 1, 0, 0, 0);
		pass.end();
		device.queue.submit([encoder.finish()]);
		raf = requestAnimationFrame(frame);
	}

	const overUI = (e) => e.target?.closest?.('.ui');
	function onDown(e) {
		if (overUI(e)) return;
		dragging = true;
		controller.startDrag(e.clientX, e.clientY);
	}
	function onMove(e) {
		if (dragging) controller.handleMouseMove(e.clientX, e.clientY);
	}
	function onUp() {
		dragging = false;
		if (controller) controller.endDrag();
	}
	function onWheel(e) {
		if (overUI(e)) return;
		zoom.update((z) => Math.min(Math.max(z + e.deltaY * 0.0012, 0.35), 3));
	}

	onMount(() => {
		let unmounted = false;
		let unsub = () => {};

		(async () => {
			const gpu = await initializeWebGPU(canvas);
			if (!gpu || unmounted) {
				supported = !!gpu;
				return;
			}
			device = gpu.device;
			context = gpu.context;

			resize();
			camera = new Camera(device, canvas.width, canvas.height, 'ortho');
			controller = new CameraController(camera);
			controller.phi = 1.05;
			controller.theta = 0.6;

			paramsBuffer = device.createBuffer({
				size: 32,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
			});
			surface = createRenderPipelineSurface(device, camera, paramsBuffer);

			unsub = towerParams.subscribe((p) => {
				op = p;
				dirty = true;
			});

			frame();
		})();

		window.addEventListener('resize', resize);
		window.addEventListener('pointerdown', onDown);
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('wheel', onWheel, { passive: true });

		return () => {
			unmounted = true;
			if (raf) cancelAnimationFrame(raf);
			window.removeEventListener('resize', resize);
			window.removeEventListener('pointerdown', onDown);
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('wheel', onWheel);
			unsub();
		};
	});
</script>

<canvas bind:this={canvas} class="tower"></canvas>
{#if !supported}
	<div class="fallback">This view needs WebGPU, which this browser doesn’t support.</div>
{/if}

<style>
	.tower {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		z-index: -1;
		touch-action: none;
	}
	.fallback {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-style: italic;
		opacity: 0.7;
	}
</style>
