<script>
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { initializeWebGPU } from './engine/WebGPUContext.js';
	import { createRenderPipelinePoints } from './engine/RenderPipelinePoints.js';
	import { createRenderPipelineThreads } from './engine/RenderPipelineThreads.js';
	import Camera from './engine/Camera.js';
	import CameraController from './engine/CameraController.js';
	import { buildDyadicTower, QUAD } from './lattice.js';
	import { towerParams, zoom } from '$lib/store/store.js';

	const RADIUS = 3;

	let canvas;
	let supported = true;

	let device, context, camera, controller, points, threads;
	let paramsBuffer, quadBuffer, poleBuffer, zeroBuffer, threadBuffer, depthTexture;
	let poleCount = 0, zeroCount = 0, threadCount = 0;
	let op;
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
		const H = Math.max(RADIUS, ((op.levels - 1) * op.gap) / 2 + 0.6) * 1.5;
		controller.baseDistance = H / 0.12;
		controller.distance = (H / 0.12) * get(zoom);
		controller.target = [0, ((op.levels - 1) * op.gap) / 2, 0];
		controller.updateCameraPosition();
	}

	function makeBuffer(data) {
		if (data.byteLength === 0) return null;
		const b = device.createBuffer({
			size: data.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});
		device.queue.writeBuffer(b, 0, data);
		return b;
	}

	function rebuild() {
		const t = buildDyadicTower({ ...op, radius: RADIUS });
		// split points into poles (colorT 0) and zeros (colorT 1) for toggling
		const poles = [], zeros = [];
		for (let i = 0; i < t.pointCount; i++) {
			const o = i * 4;
			const dst = t.points[o + 3] < 0.5 ? poles : zeros;
			dst.push(t.points[o], t.points[o + 1], t.points[o + 2], t.points[o + 3]);
		}
		poleBuffer?.destroy();
		zeroBuffer?.destroy();
		threadBuffer?.destroy();
		poleBuffer = makeBuffer(new Float32Array(poles));
		zeroBuffer = makeBuffer(new Float32Array(zeros));
		threadBuffer = makeBuffer(t.threads);
		poleCount = poles.length / 4;
		zeroCount = zeros.length / 4;
		threadCount = t.threadCount;
		fitCamera();
	}

	function frame() {
		if (dirty) {
			rebuild();
			dirty = false;
		}
		resize();

		const encoder = device.createCommandEncoder();
		const view = context.getCurrentTexture().createView();
		const pass = encoder.beginRenderPass({
			colorAttachments: [
				{ view, loadOp: 'clear', storeOp: 'store', clearValue: { r: 0.03, g: 0.03, b: 0.045, a: 1 } }
			],
			depthStencilAttachment: {
				view: depthTexture.createView(),
				depthClearValue: 1.0,
				depthLoadOp: 'clear',
				depthStoreOp: 'store'
			}
		});

		if (op.threads && threadBuffer) {
			pass.setPipeline(threads.pipeline);
			pass.setBindGroup(0, threads.bindGroup);
			pass.setVertexBuffer(0, threadBuffer);
			pass.draw(threadCount, 1, 0, 0);
		}

		pass.setPipeline(points.pipeline);
		pass.setBindGroup(0, points.bindGroup);
		pass.setVertexBuffer(1, quadBuffer);
		if (op.poles && poleBuffer) {
			pass.setVertexBuffer(0, poleBuffer);
			pass.draw(6, poleCount, 0, 0);
		}
		if (op.zeros && zeroBuffer) {
			pass.setVertexBuffer(0, zeroBuffer);
			pass.draw(6, zeroCount, 0, 0);
		}

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
		if (dragging) {
			controller.handleMouseMove(e.clientX, e.clientY);
			return;
		}
		// mouse moves ω₂ through the fundamental domain — the 3D echo of the 1D
		// plane view's mouse→τ. Re ω₂ ∈ [−0.5, 0.5], Im ω₂ ∈ [0.4, 1.3].
		if (op?.mouseFund && !overUI(e)) {
			const mx = e.clientX / window.innerWidth;
			const my = e.clientY / window.innerHeight;
			towerParams.update((s) => ({
				...s,
				tauRe: mx - 0.5,
				tauIm: 1.3 - Math.min(Math.max(my, 0), 1) * 0.9
			}));
		}
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
			controller.phi = 1.15;
			controller.theta = 0.6;

			paramsBuffer = device.createBuffer({
				size: 16,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
			});
			device.queue.writeBuffer(paramsBuffer, 0, new Float32Array([0.05, 0, 0, 0]));
			quadBuffer = device.createBuffer({
				size: QUAD.byteLength,
				usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
			});
			device.queue.writeBuffer(quadBuffer, 0, QUAD);

			points = createRenderPipelinePoints(device, camera, paramsBuffer);
			threads = createRenderPipelineThreads(device, camera);

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
