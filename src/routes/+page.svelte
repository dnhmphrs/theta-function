<script>
	import Controls from '$lib/components/Controls.svelte';
</script>

<svelte:head>
	<title>θ[a,b](z, τ) — theta function</title>
	<meta name="description" content="Interactive domain-coloured Riemann theta function with characteristics." />
</svelte:head>

<header class="ui masthead">
	<h1>θ[a,b](z,&thinsp;τ)</h1>
	<p>the theta function with characteristics</p>
</header>

<nav class="ui nav">
	<a href="/tower">℘ surface →</a>
	<a href="/theory">theory →</a>
</nav>

<Controls />

<p class="ui hint">drag to pan · scroll to zoom</p>

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

	.hint {
		position: fixed;
		right: var(--margin);
		bottom: var(--margin);
		font-size: 11px;
		opacity: 0.4;
	}

	@media (max-width: 768px) {
		.hint {
			display: none;
		}
	}
</style>
