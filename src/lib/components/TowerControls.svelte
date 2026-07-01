<script>
	import { towerParams } from '$lib/store/store.js';

	const fields = ['|θ|', 'arg θ', '‖θ‖'];
</script>

<div class="ui panel">
	<div class="row">
		<span class="label">Re τ</span>
		<input type="range" min="-0.6" max="0.6" step="0.01" bind:value={$towerParams.tauRe} />
		<span class="val">{$towerParams.tauRe.toFixed(2)}</span>
	</div>
	<div class="row">
		<span class="label">Im τ lo</span>
		<input type="range" min="0.1" max="0.9" step="0.01" bind:value={$towerParams.tauImLo} />
		<span class="val">{$towerParams.tauImLo.toFixed(2)}</span>
	</div>
	<div class="row">
		<span class="label">Im τ hi</span>
		<input type="range" min="0.6" max="2.0" step="0.01" bind:value={$towerParams.tauImHi} />
		<span class="val">{$towerParams.tauImHi.toFixed(2)}</span>
	</div>

	<div class="row" class:dim={$towerParams.mouseChar}>
		<span class="label">a</span>
		<input type="range" min="0" max="1" step="0.01" bind:value={$towerParams.a}
			disabled={$towerParams.mouseChar} />
		<span class="val">{$towerParams.a.toFixed(2)}</span>
	</div>
	<div class="row" class:dim={$towerParams.mouseChar}>
		<span class="label">b</span>
		<input type="range" min="0" max="1" step="0.01" bind:value={$towerParams.b}
			disabled={$towerParams.mouseChar} />
		<span class="val">{$towerParams.b.toFixed(2)}</span>
	</div>

	<div class="row">
		<span class="label">slices</span>
		<input type="range" min="6" max="48" step="1" bind:value={$towerParams.slices} />
		<span class="val">{$towerParams.slices}</span>
	</div>

	<div class="fields">
		{#each fields as f, i}
			<button class:active={$towerParams.field === i}
				on:click={() => towerParams.update((s) => ({ ...s, field: i }))}>{f}</button>
		{/each}
	</div>

	<label class="toggle">
		<input type="checkbox" bind:checked={$towerParams.mouseChar} />
		mouse&nbsp;→&nbsp;(a, b)
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
		grid-template-columns: 52px 1fr 36px;
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
	.fields {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6px;
	}
	.fields button {
		padding: 5px 0;
		background: transparent;
		border: 1px solid rgba(208, 208, 208, 0.2);
		border-radius: 3px;
		color: var(--primary);
		cursor: pointer;
		font-size: 12px;
		transition: border-color 0.15s, background 0.15s;
	}
	.fields button:hover {
		border-color: rgba(208, 208, 208, 0.55);
	}
	.fields button.active {
		background: rgba(208, 208, 208, 0.14);
		border-color: rgba(208, 208, 208, 0.7);
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
	@media (max-width: 768px) {
		.panel {
			width: calc(100vw - 2 * var(--margin));
		}
	}
</style>
