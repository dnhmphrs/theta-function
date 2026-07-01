<script>
	import Tower3D from '$lib/graphics/Tower3D.svelte';
	import TowerControls from '$lib/components/TowerControls.svelte';
</script>

<svelte:head>
	<title>tower — dyadic θ refinement</title>
	<meta name="description" content="A tower of hexagonal lattices refining up the imaginary axis, poles feeding zeros." />
</svelte:head>

<Tower3D />

<header class="ui masthead">
	<h1>refinement tower</h1>
	<p>hexagonal lattices doubling up the Im axis — poles branch into zeros</p>
</header>

<nav class="ui nav">
	<a href="/">← plane</a>
	<a href="/theory">theory →</a>
</nav>

<TowerControls />

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
