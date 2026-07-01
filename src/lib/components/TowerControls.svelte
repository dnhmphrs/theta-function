<script>
	import { thetaParams, towerParams } from '$lib/store/store.js';

	// same four characteristics as the plane view
	const presets = [
		{ name: 'θ₁', a: 0.5, b: 0.5 },
		{ name: 'θ₂', a: 0.5, b: 0.0 },
		{ name: 'θ₃', a: 0.0, b: 0.0 },
		{ name: 'θ₄', a: 0.0, b: 0.5 }
	];
	const applyPreset = (p) => thetaParams.update((s) => ({ ...s, a: p.a, b: p.b }));
	const isActive = (p, s) => Math.abs(s.a - p.a) < 1e-3 && Math.abs(s.b - p.b) < 1e-3;
	const fmt = (v) => (v < 0 ? '' : ' ') + v.toFixed(2);
</script>

<div class="ui panel">
	<div class="row">
		<span class="label">Re τ</span>
		<input type="range" min="-1" max="1" step="0.01" bind:value={$thetaParams.tauRe} />
		<span class="val">{fmt($thetaParams.tauRe)}</span>
	</div>
	<div class="row">
		<span class="label">Im τ</span>
		<input type="range" min="0.1" max="1.5" step="0.01" bind:value={$thetaParams.tauIm} />
		<span class="val">{fmt($thetaParams.tauIm)}</span>
	</div>
	<div class="row">
		<span class="label">a</span>
		<input type="range" min="0" max="1" step="0.01" bind:value={$thetaParams.a} />
		<span class="val">{fmt($thetaParams.a)}</span>
	</div>
	<div class="row">
		<span class="label">b</span>
		<input type="range" min="0" max="1" step="0.01" bind:value={$thetaParams.b} />
		<span class="val">{fmt($thetaParams.b)}</span>
	</div>

	<div class="presets">
		{#each presets as p}
			<button class:active={isActive(p, $thetaParams)} on:click={() => applyPreset(p)}>{p.name}</button>
		{/each}
	</div>

	<div class="row">
		<span class="label">slices</span>
		<input type="range" min="1" max="8" step="1" bind:value={$towerParams.slices} />
		<span class="val">{$towerParams.slices}</span>
	</div>

	<div class="toggles">
		<label class="toggle"><input type="checkbox" bind:checked={$towerParams.planes} /> planes</label>
		<label class="toggle"><input type="checkbox" bind:checked={$towerParams.contours} /> contours</label>
		<label class="toggle"><input type="checkbox" bind:checked={$towerParams.threads} /> threads</label>
	</div>
</div>

<style>
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
		grid-template-columns: 42px 1fr 42px;
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
		white-space: pre;
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
	.presets {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 6px;
	}
	.presets button {
		padding: 5px 0;
		background: transparent;
		border: 1px solid rgba(208, 208, 208, 0.2);
		border-radius: 3px;
		color: var(--primary);
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
	}
	.presets button:hover {
		border-color: rgba(208, 208, 208, 0.55);
	}
	.presets button.active {
		background: rgba(208, 208, 208, 0.14);
		border-color: rgba(208, 208, 208, 0.7);
	}
	.toggles {
		display: flex;
		justify-content: space-between;
		gap: 8px;
	}
	.toggle {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 11px;
		opacity: 0.85;
		cursor: pointer;
	}
	.toggle input {
		accent-color: var(--primary);
		cursor: pointer;
	}
	@media (max-width: 768px) {
		.panel {
			width: calc(100vw - 2 * var(--margin));
		}
	}
</style>
