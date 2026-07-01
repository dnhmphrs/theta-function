<script>
	import { onMount } from 'svelte';
	import Engine from './Engine.js';
	import { thetaParams } from '$lib/store/store.js';

	let canvas;
	let engine;
	let supported = true;

	// Drag to pan the z-view, wheel to zoom. Interaction is ignored while the
	// pointer is over UI (anything inside a `.ui` element).
	let dragging = false;
	let lastX = 0;
	let lastY = 0;

	const overUI = (event) => event.target?.closest?.('.ui');

	function onPointerDown(event) {
		if (overUI(event)) return;
		dragging = true;
		lastX = event.clientX;
		lastY = event.clientY;
	}

	function onPointerUp() {
		dragging = false;
	}

	function onPointerMove(event) {
		if (!dragging) return;
		const dx = event.clientX - lastX;
		const dy = event.clientY - lastY;
		lastX = event.clientX;
		lastY = event.clientY;
		thetaParams.update((p) => {
			const perPixel = (2 * p.scale) / window.innerHeight;
			return { ...p, centerRe: p.centerRe - dx * perPixel, centerIm: p.centerIm + dy * perPixel };
		});
	}

	function onWheel(event) {
		if (overUI(event)) return;
		thetaParams.update((p) => ({
			...p,
			scale: Math.min(Math.max(p.scale * Math.exp(event.deltaY * 0.001), 0.25), 8)
		}));
	}

	onMount(() => {
		let unmounted = false;
		(async () => {
			engine = new Engine(canvas);
			const ok = await engine.start();
			if (!unmounted) supported = ok !== false;
		})();

		const onResize = () => engine && engine.resize();
		window.addEventListener('resize', onResize);
		window.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('wheel', onWheel, { passive: true });

		return () => {
			unmounted = true;
			window.removeEventListener('resize', onResize);
			window.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('wheel', onWheel);
			engine && engine.stop();
		};
	});
</script>

<canvas bind:this={canvas} class="geometry"></canvas>

{#if !supported}
	<div class="fallback">This visualiser needs WebGPU, which this browser doesn’t support.</div>
{/if}

<style>
	.geometry {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		margin: 0;
		border: none;
		z-index: -1;
		touch-action: none;
	}

	.fallback {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		font-style: italic;
		opacity: 0.7;
		padding: 1rem;
	}
</style>
