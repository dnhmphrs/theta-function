<script>
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { initializeWebGPU } from './engine/WebGPUContext.js';
	import { createRenderPipelinePlanes } from './engine/RenderPipelinePlanes.js';
	import { createRenderPipelineLines } from './engine/RenderPipelineLines.js';
	import Camera from './engine/Camera.js';
	import CameraController from './engine/CameraController.js';
	import { towerSlices, buildThreads, QUAD } from './lattice.js';
	import { thetaParams, towerParams, zoom } from '$lib/store/store.js';

	let canvas;
	let supported = true;

	let device, context, camera, controller, planes, lines;
	let paramsBuffer, quadBuffer, instanceBuffer, threadBuffer;
	let threadCount = 0;
	let sliceList = [];
	let tp, op;
	let dirty = true;
	let raf = null;
	let dragging = false;

	const MAX_INSTANCES = 17; // 2·8 + 1
	const instanceData = new Float32Array(MAX_INSTANCES * 4);
	const TERMS = 24;

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

	function fitCamera() {
		const H = Math.max(op.slices * op.gap, tp.scale) * 1.7;
		controller.baseDistance = H / 0.12;
		controller.distance = (H / 0.12) * get(zoom);
		controller.target = [tp.centerRe, 0, tp.centerIm];
		controller.updateCameraPosition();
	}

	function writeParams() {
		device.queue.writeBuffer(
			paramsBuffer,
			0,
			new Float32Array([
				tp.tauRe, tp.tauIm,
				tp.a, tp.b,
				tp.centerRe, tp.centerIm,
				tp.scale, TERMS,
				op.contours ? 1 : 0, 0.62,
				0, 0
			])
		);
	}

	function rebuild() {
		sliceList = towerSlices(op);
		const t = buildThreads({ ...op, ...tp });
		threadCount = t.count;
		if (threadBuffer) threadBuffer.destroy();
		if (t.data.byteLength > 0) {
			threadBuffer = device.createBuffer({
				size: t.data.byteLength,
				usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
			});
			device.queue.writeBuffer(threadBuffer, 0, t.data);
		} else {
			threadBuffer = null;
		}
		fitCamera();
		writeParams();
	}

	// order the (few) planes far-to-near for correct transparency
	function writeSortedInstances() {
		const v = camera.viewMatrix; // column-major
		const cx = tp.centerRe;
		const cz = tp.centerIm;
		const sorted = [...sliceList].sort((A, B) => {
			const za = v[2] * cx + v[6] * A.y + v[10] * cz + v[14];
			const zb = v[2] * cx + v[6] * B.y + v[10] * cz + v[14];
			return za - zb; // most negative (farthest) first
		});
		for (let i = 0; i < sorted.length; i++) {
			instanceData[i * 4] = sorted[i].y;
			instanceData[i * 4 + 1] = sorted[i].lambda;
			instanceData[i * 4 + 2] = sorted[i].tnorm;
			instanceData[i * 4 + 3] = 0;
		}
		device.queue.writeBuffer(instanceBuffer, 0, instanceData, 0, sorted.length * 4);
		return sorted.length;
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
				{ view, loadOp: 'clear', storeOp: 'store', clearValue: { r: 0.02, g: 0.02, b: 0.03, a: 1 } }
			]
		});

		if (op.planes) {
			const n = writeSortedInstances();
			pass.setPipeline(planes.pipeline);
			pass.setBindGroup(0, planes.bindGroup);
			pass.setVertexBuffer(0, instanceBuffer);
			pass.setVertexBuffer(1, quadBuffer);
			pass.draw(6, n, 0, 0);
		}

		if (op.threads && threadBuffer) {
			pass.setPipeline(lines.pipeline);
			pass.setBindGroup(0, lines.bindGroup);
			pass.setVertexBuffer(0, threadBuffer);
			pass.draw(threadCount, 1, 0, 0);
		}

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
		zoom.update((z) => Math.min(Math.max(z + e.deltaY * 0.0012, 0.35), 3));
	}

	onMount(() => {
		let unmounted = false;
		let unsubA = () => {};
		let unsubB = () => {};

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
				size: 48,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
			});
			quadBuffer = device.createBuffer({
				size: QUAD.byteLength,
				usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
			});
			device.queue.writeBuffer(quadBuffer, 0, QUAD);
			instanceBuffer = device.createBuffer({
				size: MAX_INSTANCES * 16,
				usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
			});

			planes = createRenderPipelinePlanes(device, camera, paramsBuffer);
			lines = createRenderPipelineLines(device, camera);

			unsubA = thetaParams.subscribe((p) => {
				tp = p;
				dirty = true;
			});
			unsubB = towerParams.subscribe((p) => {
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
			unsubA();
			unsubB();
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
