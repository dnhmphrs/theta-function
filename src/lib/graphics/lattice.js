// lattice.js — geometry for the dyadic θ/℘ refinement tower.
//
// Up the vertical (Im) axis each level is a hexagonal lattice 2× finer than the
// one below (the ×2 isogeny, where the θ-product identities live). A level's
// inherited points are the coarser lattice — the "poles"; the new points the
// refinement introduces are the "zeros". Each pole branches up into the six new
// zeros around it, so poles feed the next level's zeros.

const QUAD = new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]);
export { QUAD };

// e1, e2: lattice basis for a given cell size.
function basis(cell, tauRe, tauIm) {
	return { e1: [cell, 0], e2: [cell * tauRe, cell * tauIm] };
}

export function buildDyadicTower({ levels, gap, tauRe, tauIm, base = 1, radius = 3 }) {
	const pts = []; // vec4 (x, y, z, colorT)  colorT: 0 = pole, 1 = zero
	const threads = []; // vec4 (x, y, z, tHeight) per line vertex
	const R2 = radius * radius;
	const inR = (x, z) => x * x + z * z <= R2;

	for (let k = 0; k < levels; k++) {
		const cell = base / Math.pow(2, k);
		const y = k * gap;
		const { e1, e2 } = basis(cell, tauRe, tauIm);
		const M = Math.min(Math.ceil(radius / (cell * Math.min(1, tauIm))) + 1, 90);

		for (let m = -M; m <= M; m++) {
			for (let n = -M; n <= M; n++) {
				const x = m * e1[0] + n * e2[0];
				const z = m * e1[1] + n * e2[1];
				if (!inR(x, z)) continue;
				// level 0 is all seed poles; above, inherited (even,even) = pole
				const pole = k === 0 || (m % 2 === 0 && n % 2 === 0);
				pts.push(x, y, z, pole ? 0 : 1);

				// threads: each pole branches into the six new points one level up
				if (pole && k < levels - 1) {
					const hc = cell / 2;
					const f1 = [hc, 0];
					const f2 = [hc * tauRe, hc * tauIm];
					const dirs = [
						f1, [-f1[0], -f1[1]],
						f2, [-f2[0], -f2[1]],
						[f1[0] - f2[0], f1[1] - f2[1]], [f2[0] - f1[0], f2[1] - f1[1]]
					];
					const t0 = k / (levels - 1);
					const t1 = (k + 1) / (levels - 1);
					for (const d of dirs) {
						const nx = x + d[0];
						const nz = z + d[1];
						if (!inR(nx, nz)) continue;
						threads.push(x, y, z, t0, nx, y + gap, nz, t1);
					}
				}
			}
		}
		if (pts.length > 400000) break;
	}

	return {
		points: new Float32Array(pts),
		pointCount: pts.length / 4,
		threads: new Float32Array(threads),
		threadCount: threads.length / 4
	};
}
