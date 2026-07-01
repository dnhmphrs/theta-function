<script>
	import Tower3D from '$lib/graphics/Tower3D.svelte';
	import { towerParams } from '$lib/store/store.js';
</script>

<svelte:head>
	<title>tower — θ zero-lattices</title>
	<meta name="description" content="A 3D tower of hexagonal theta zero-lattices, tightening with level." />
</svelte:head>

<Tower3D />

<header class="ui masthead">
	<h1>zero-lattice tower</h1>
	<p>stacked hexagonal grids of θ zeros, tightening with level</p>
</header>

<nav class="ui nav">
	<a href="/">← plane</a>
	<a href="/theory">theory →</a>
</nav>

<div class="ui panel">
	<div class="row">
		<span class="label">levels</span>
		<input type="range" min="1" max="8" step="1" bind:value={$towerParams.levels} />
		<span class="val">{$towerParams.levels}</span>
	</div>
	<div class="row">
		<span class="label">size</span>
		<input type="range" min="0.01" max="0.08" step="0.005" bind:value={$towerParams.pointSize} />
		<span class="val">{$towerParams.pointSize.toFixed(3)}</span>
	</div>
	<label class="toggle">
		<input type="checkbox" bind:checked={$towerParams.spin} />
		spin
	</label>
</div>

<p class="ui hint">drag to orbit · scroll to zoom</p>

<style>
	.masthead {
		position: fixed;
		top: var(--margin);
		left: var(--margin);
	}
	.masthead h1 {
		font-size: 20px;
		letter-spacing: 0.06em;
	}
	.masthead p {
		font-size: 12px;
		opacity: 0.6;
		margin-top: 2px;
	}

	.nav {
		position: fixed;
		top: var(--margin);
		right: var(--margin);
		display: flex;
		gap: 1.4rem;
		font-size: 13px;
	}
	.nav a {
		opacity: 0.8;
	}
	.nav a:hover {
		opacity: 1;
	}

	.panel {
		position: fixed;
		left: var(--margin);
		bottom: var(--margin);
		width: 232px;
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 9px;
		background: rgba(20, 20, 20, 0.55);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(208, 208, 208, 0.12);
		border-radius: 4px;
		user-select: none;
	}
	.row {
		display: grid;
		grid-template-columns: 44px 1fr 42px;
		align-items: center;
		gap: 8px;
	}
	.label {
		font-size: 12px;
		opacity: 0.85;
	}
	.val {
		font-size: 12px;
		opacity: 0.55;
		font-variant-numeric: tabular-nums;
		text-align: right;
	}
	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 1px;
		background: rgba(208, 208, 208, 0.35);
		cursor: pointer;
	}
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 11px;
		height: 11px;
		border-radius: 50%;
		background: var(--primary);
	}
	input[type='range']::-moz-range-thumb {
		width: 11px;
		height: 11px;
		border: none;
		border-radius: 50%;
		background: var(--primary);
	}
	.toggle {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		opacity: 0.85;
		cursor: pointer;
	}
	.toggle input {
		accent-color: var(--primary);
		cursor: pointer;
	}
	.hint {
		position: fixed;
		right: var(--margin);
		bottom: var(--margin);
		font-size: 11px;
		opacity: 0.4;
	}
	@media (max-width: 768px) {
		.panel {
			width: calc(100vw - 2 * var(--margin));
		}
		.hint {
			display: none;
		}
	}
</style>
