// lattice.js — geometry for the 3D scale-tower of the theta function.
//
// Each horizontal slice at height t shows θ(λz, τ; a, b) with λ = e^{rate·t}.
// A zero of that slice sits where λz equals a zero of θ[a,b](·,τ), i.e. at
//   z = ζ(m,n) / λ,   ζ(m,n) = ½(1+τ) − aτ − b + m + nτ   (m,n ∈ ℤ).
// So as we climb, every zero slides along the ray toward the origin — the
// zeros trace converging curves (the "line bundles") threaded through the stack.

// Slices from −slices..+slices with their height and scale λ.
// λ = e^{rate·|t|} makes the stack symmetric about the origin floor (t = 0,
// λ = 1, the plane view): the grid tightens going both up and down.
export function towerSlices({ slices, gap, rate }) {
	const out = [];
	for (let i = -slices; i <= slices; i++) {
		const t = i * gap;
		out.push({ i, y: t, lambda: Math.exp(rate * Math.abs(t)), tnorm: (i + slices) / (2 * slices || 1) });
	}
	return out;
}

// Line-list geometry (vec4 x,y,z,tnorm per vertex) for the zero threads.
export function buildThreads({ slices, gap, rate, tauRe, tauIm, a, b, centerRe, centerIm, scale }) {
	const S = towerSlices({ slices, gap, rate });
	const half = scale * 1.15; // keep threads within the plane footprint
	const inView = (x, z) => Math.abs(x - centerRe) <= half && Math.abs(z - centerIm) <= half;

	// zero of θ[a,b] in the base cell, plus a lattice range wide enough to fill view
	// (widest at the origin floor where λ = 1; higher slices pull zeros inward)
	const zx0 = 0.5 * (1 + tauRe) - a * tauRe - b;
	const zy0 = 0.5 * tauIm - a * tauIm;
	const M = Math.min(Math.ceil(half / Math.max(0.25, tauIm)) + 3, 40);

	const verts = [];
	for (let m = -M; m <= M; m++) {
		for (let n = -M; n <= M; n++) {
			const zx = zx0 + m + n * tauRe;
			const zy = zy0 + n * tauIm;
			// walk the slices, emitting a segment wherever both ends are in view
			for (let k = 0; k < S.length - 1; k++) {
				const A = S[k];
				const B = S[k + 1];
				const ax = zx / A.lambda;
				const az = zy / A.lambda;
				const bx = zx / B.lambda;
				const bz = zy / B.lambda;
				if (inView(ax, az) && inView(bx, bz)) {
					verts.push(ax, A.y, az, A.tnorm, bx, B.y, bz, B.tnorm);
				}
			}
		}
		if (verts.length > 240000) break; // hard cap
	}
	return { data: new Float32Array(verts), count: verts.length / 4 };
}

// Unit quad corners (two triangles) for a slice billboard/plane.
export const QUAD = new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]);
