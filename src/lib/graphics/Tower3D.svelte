<script>
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { initializeWebGPU } from './engine/WebGPUContext.js';
	import { createRenderPipelineField } from './engine/RenderPipelineField.js';
	import Camera from './engine/Camera.js';
	import CameraController from './engine/CameraController.js';
	import { buildSlices, QUAD } from './lattice.js';
	import { towerParams, zoom } from '$lib/store/store.js';

	const SPAN = 2.4; // world size of the unit (u,v) square
	const HEIGHT = 3.2; // vertical extent of the τ tower
	const TERMS = 20;
	const MAX_SLICES = 48;

	let canvas;
	let supported = true;

	let device, context, camera, controller, field;
	let paramsBuffer, quadBuffer, instanceBuffer;
	let sliceCount = 0;
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
		}
	}

	function fitCamera() {
		const H = Math.max(SPAN / 2, HEIGHT / 2) * 1.5;
		controller.baseDistance = H / 0.12;
		controller.distance = (H / 0.12) * get(zoom);
		controller.updateCameraPosition();
	}

	function writeParams() {
		device.queue.writeBuffer(
			paramsBuffer,
			0,
			new Float32Array([op.tauRe, op.a, op.b, op.field, SPAN, TERMS, 0, 0])
		);
	}

	function rebuild() {
		sliceCount = Math.min(op.slices, MAX_SLICES);
		const data = buildSlices({
			count: sliceCount,
			height: HEIGHT,
			tauImLo: op.tauImLo,
			tauImHi: op.tauImHi
		});
		device.queue.writeBuffer(instanceBuffer, 0, data);
		writeParams();
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
				{ view, loadOp: 'clear', storeOp: 'store', clearValue: { r: 0.02, g: 0.02, b: 0.03, a: 1 } }
			]
		});
		pass.setPipeline(field.pipeline);
		pass.setBindGroup(0, field.bindGroup);
		pass.setVertexBuffer(0, instanceBuffer);
		pass.setVertexBuffer(1, quadBuffer);
		pass.draw(6, sliceCount, 0, 0);
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
		// mouse moves (a,b) within the fundamental domain [0,1]² — like the 1D case
		if (op?.mouseChar && !overUI(e)) {
			const a = Math.min(Math.max(e.clientX / window.innerWidth, 0), 1);
			const b = Math.min(Math.max(e.clientY / window.innerHeight, 0), 1);
			towerParams.update((s) => ({ ...s, a, b }));
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
			controller.phi = 1.1;
			controller.theta = 0.7;

			paramsBuffer = device.createBuffer({
				size: 32,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
			});
			quadBuffer = device.createBuffer({
				size: QUAD.byteLength,
				usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
			});
			device.queue.writeBuffer(quadBuffer, 0, QUAD);
			instanceBuffer = device.createBuffer({
				size: MAX_SLICES * 16,
				usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
			});

			field = createRenderPipelineField(device, camera, paramsBuffer);

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
