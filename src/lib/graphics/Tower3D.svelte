<script>
	import { onMount } from 'svelte';
	import { initializeWebGPU } from './engine/WebGPUContext.js';
	import { createRenderPipelinePoints } from './engine/RenderPipelinePoints.js';
	import Camera from './engine/Camera.js';
	import CameraController from './engine/CameraController.js';
	import { buildTower, QUAD } from './lattice.js';
	import { towerParams, zoom } from '$lib/store/store.js';

	let canvas;
	let supported = true;

	let device, context, camera, controller, pipeline;
	let paramsBuffer, quadBuffer, instanceBuffer;
	let instanceCount = 0;
	let raf = null;
	let dragging = false;
	let params;
	let builtLevels = -1;

	const GAP = 0.62;

	function resize() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
		const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
		if (canvas.width !== w || canvas.height !== h) {
			canvas.width = w;
			canvas.height = h;
			if (camera) camera.updateAspect(w, h);
		}
	}

	function rebuild(levels) {
		const { data, count } = buildTower({ levels, gap: GAP });
		instanceCount = count;
		builtLevels = levels;
		if (instanceBuffer) instanceBuffer.destroy();
		instanceBuffer = device.createBuffer({
			label: 'tower instances',
			size: data.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});
		device.queue.writeBuffer(instanceBuffer, 0, data);
		// keep the tower centred in view
		controller.target[1] = ((levels - 1) * GAP) / 2;
		controller.updateCameraPosition();
	}

	function writeParams() {
		device.queue.writeBuffer(paramsBuffer, 0, new Float32Array([params.pointSize, 0, 0, 0]));
	}

	function frame() {
		if (params.spin && !dragging) {
			controller.theta += 0.0022;
			controller.updateCameraPosition();
		}
		resize();

		const encoder = device.createCommandEncoder();
		const view = context.getCurrentTexture().createView();
		const pass = encoder.beginRenderPass({
			colorAttachments: [
				{ view, loadOp: 'clear', storeOp: 'store', clearValue: { r: 0.02, g: 0.02, b: 0.03, a: 1 } }
			]
		});
		pass.setPipeline(pipeline.pipeline);
		pass.setBindGroup(0, pipeline.bindGroup);
		pass.setVertexBuffer(0, instanceBuffer);
		pass.setVertexBuffer(1, quadBuffer);
		pass.draw(6, instanceCount, 0, 0);
		pass.end();
		device.queue.submit([encoder.finish()]);
		raf = requestAnimationFrame(frame);
	}

	// interaction: drag to orbit, wheel to zoom
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
		zoom.update((z) => Math.min(Math.max(z + e.deltaY * 0.0012, 0.4), 2.4));
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
			camera = new Camera(device, canvas.width, canvas.height);
			controller = new CameraController(camera);
			controller.baseDistance = 9;
			controller.distance = 9;
			controller.phi = Math.PI / 2.6;

			paramsBuffer = device.createBuffer({
				size: 16,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
			});
			quadBuffer = device.createBuffer({
				size: QUAD.byteLength,
				usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
			});
			device.queue.writeBuffer(quadBuffer, 0, QUAD);
			pipeline = createRenderPipelinePoints(device, camera, paramsBuffer);

			unsub = towerParams.subscribe((p) => {
				params = p;
				if (!device) return;
				writeParams();
				if (p.levels !== builtLevels) rebuild(p.levels);
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
