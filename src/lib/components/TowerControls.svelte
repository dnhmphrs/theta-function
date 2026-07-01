<script>
	import { towerParams } from '$lib/store/store.js';

	const lattices = [
		{ name: 'hex', re: 0.5, im: 0.8660254 },
		{ name: 'square', re: 0.0, im: 1.0 },
		{ name: 'rhombic', re: 0.35, im: 0.7 }
	];
	const applyLattice = (l) => towerParams.update((s) => ({ ...s, tauRe: l.re, tauIm: l.im }));
	const isActive = (l, s) => Math.abs(s.tauRe - l.re) < 1e-3 && Math.abs(s.tauIm - l.im) < 1e-3;
</script>

<div class="ui panel">
	<div class="row" class:dim={$towerParams.mouseFund}>
		<span class="label">Re ω₂</span>
		<input type="range" min="-0.6" max="0.6" step="0.01" bind:value={$towerParams.tauRe}
			disabled={$towerParams.mouseFund} />
		<span class="val">{$towerParams.tauRe.toFixed(2)}</span>
	</div>
	<div class="row" class:dim={$towerParams.mouseFund}>
		<span class="label">Im ω₂</span>
		<input type="range" min="0.4" max="1.3" step="0.01" bind:value={$towerParams.tauIm}
			disabled={$towerParams.mouseFund} />
		<span class="val">{$towerParams.tauIm.toFixed(2)}</span>
	</div>

	<div class="presets">
		{#each lattices as l}
			<button class:active={isActive(l, $towerParams)} on:click={() => applyLattice(l)}>{l.name}</button>
		{/each}
	</div>

	<div class="row">
		<span class="label">levels</span>
		<input type="range" min="1" max="6" step="1" bind:value={$towerParams.levels} />
		<span class="val">{$towerParams.levels}</span>
	</div>
	<div class="row">
		<span class="label">gap</span>
		<input type="range" min="0.4" max="1.6" step="0.05" bind:value={$towerParams.gap} />
		<span class="val">{$towerParams.gap.toFixed(2)}</span>
	</div>

	<div class="toggles">
		<label class="toggle"><input type="checkbox" bind:checked={$towerParams.poles} /> poles</label>
		<label class="toggle"><input type="checkbox" bind:checked={$towerParams.zeros} /> zeros</label>
		<label class="toggle"><input type="checkbox" bind:checked={$towerParams.threads} /> threads</label>
	</div>

	<label class="toggle">
		<input type="checkbox" bind:checked={$towerParams.mouseFund} />
		mouse&nbsp;→&nbsp;ω₂
	</label>
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
		grid-template-columns: 46px 1fr 40px;
		align-items: center;
		gap: 8px;
	}
	.row.dim {
		opacity: 0.4;
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
	.presets {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6px;
	}
	.presets button {
		padding: 5px 0;
		background: transparent;
		border: 1px solid rgba(208, 208, 208, 0.2);
		border-radius: 3px;
		color: var(--primary);
		cursor: pointer;
		font-size: 11px;
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
