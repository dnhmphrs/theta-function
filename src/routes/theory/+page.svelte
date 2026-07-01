<svelte:head>
	<title>theory — θ[a,b](z, τ)</title>
	<meta name="description" content="The theta function with characteristics: its two variables and two characteristics." />
</svelte:head>

<div class="ui overlay">
	<article>
		<a class="back" href="/">← visualiser</a>

		<h1>The theta function with characteristics</h1>

		<p class="lead">
			Everything on the canvas is one complex function of a complex variable,
			drawn by <em>domain colouring</em>. It has two variables and two
			characteristics — four knobs in total — and the panel lets you turn each one.
		</p>

		<div class="formula">
			θ[a,b](z, τ) = <span class="sum">Σ</span><sub>n∈ℤ</sub>
			exp( iπ (n+a)² τ + 2πi (n+a)(z + b) )
		</div>

		<h2>The two variables</h2>

		<p>
			<b>z</b> — the <em>argument</em>. It ranges over the complex plane, and that
			plane is exactly what fills the screen: the horizontal axis is Re&nbsp;z, the
			vertical axis is Im&nbsp;z. Drag to pan across it, scroll to zoom.
		</p>
		<p>
			<b>τ</b> — the <em>modular parameter</em>. It sets the shape of the period
			lattice the function repeats over. It must live in the upper half-plane
			(Im&nbsp;τ&nbsp;&gt;&nbsp;0), or the series diverges. <b>Re&nbsp;τ</b> shears
			the lattice sideways; <b>Im&nbsp;τ</b> sets its height — larger Im&nbsp;τ makes
			the sum converge faster and the pattern calmer, smaller Im&nbsp;τ crowds the
			zeros together.
		</p>

		<h2>The two characteristics</h2>

		<p>
			<b>a</b> and <b>b</b> are real numbers (only their values mod&nbsp;1 matter).
			They shift the whole summation: <b>a</b> offsets the lattice index n → n+a,
			which translates the function in the <em>τ-direction</em>; <b>b</b> shifts the
			argument z → z+b, translating it in the <em>real direction</em>. Changing them
			slides the lattice of zeros around without changing its shape.
		</p>

		<h2>The four Jacobi thetas</h2>

		<p>
			When a and b are each either 0 or ½ you recover the four classical Jacobi
			theta functions — the preset buttons:
		</p>

		<table>
			<thead><tr><th></th><th>a</th><th>b</th></tr></thead>
			<tbody>
				<tr><td>θ₁</td><td>½</td><td>½</td></tr>
				<tr><td>θ₂</td><td>½</td><td>0</td></tr>
				<tr><td>θ₃</td><td>0</td><td>0</td></tr>
				<tr><td>θ₄</td><td>0</td><td>½</td></tr>
			</tbody>
		</table>

		<p class="note">
			θ₁ is the odd one: it vanishes at the origin, which is why its preset shows a
			zero sitting dead centre.
		</p>

		<h2>Reading the colours</h2>

		<p>
			Each pixel is coloured by the complex value θ at that point:
		</p>
		<ul>
			<li><b>Hue</b> is the phase arg&nbsp;θ — a full loop of colour is a full turn 2π.</li>
			<li><b>Brightness</b> grows with the magnitude |θ|; the black dots are the
				<em>zeros</em>, where θ&nbsp;=&nbsp;0 and every hue meets.</li>
			<li>With <b>contours</b> on, the faint rings are level sets of |θ| and the
				radial spokes are level sets of the phase.</li>
		</ul>

		<p>
			The zeros form a perfect lattice: exactly one per period cell, spaced by 1 and
			by τ. That single zero, repeated, is the whole story of the theta function —
			everything else follows from its quasi-periodicity.
		</p>

		<a class="back bottom" href="/">← back to the visualiser</a>
	</article>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		overflow-y: auto;
		background: #ffffff;
		-webkit-overflow-scrolling: touch;
	}

	/* plain white page — override the global light-on-dark text colour */
	.overlay,
	.overlay * {
		color: #1a1a1a;
	}

	article {
		max-width: 42rem;
		margin: 0 auto;
		padding: clamp(2rem, 8vh, 6rem) var(--margin) 5rem;
	}

	.back {
		display: inline-block;
		font-size: 13px;
		opacity: 0.7;
		margin-bottom: 2.5rem;
	}

	.back:hover {
		opacity: 1;
	}

	.back.bottom {
		margin-top: 3rem;
		margin-bottom: 0;
	}

	h1 {
		font-size: 24px;
		margin-bottom: 1.4rem;
		letter-spacing: 0.04em;
	}

	h2 {
		font-size: 15px;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		opacity: 0.75;
		margin: 2.4rem 0 0.9rem;
	}

	p {
		margin-bottom: 1rem;
		line-height: 1.75;
		opacity: 0.92;
	}

	.lead {
		font-size: 15px;
		opacity: 1;
	}

	b {
		font-weight: 700;
		opacity: 1;
	}

	em {
		font-style: italic;
	}

	.formula {
		font-family: var(--font-header), serif;
		font-size: 16px;
		text-align: center;
		padding: 1.4rem 1rem;
		margin: 1.6rem 0;
		border-top: 1px solid rgba(0, 0, 0, 0.15);
		border-bottom: 1px solid rgba(0, 0, 0, 0.15);
		letter-spacing: 0.02em;
		line-height: 1.6;
	}

	.formula .sum {
		font-size: 20px;
		vertical-align: -2px;
	}

	ul {
		margin: 0 0 1rem 1.1rem;
	}

	li {
		margin-bottom: 0.5rem;
		line-height: 1.7;
		opacity: 0.92;
	}

	table {
		border-collapse: collapse;
		margin: 0.5rem 0 1rem;
		font-variant-numeric: tabular-nums;
	}

	th,
	td {
		padding: 5px 22px 5px 0;
		text-align: left;
		border-bottom: 1px solid rgba(0, 0, 0, 0.12);
	}

	th {
		opacity: 0.55;
		font-weight: 400;
	}

	.note {
		font-size: 13px;
		opacity: 0.65;
		font-style: italic;
	}
</style>
