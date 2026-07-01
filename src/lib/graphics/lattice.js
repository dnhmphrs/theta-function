// lattice.js — geometry for the 3D tower of theta zero-lattices.
//
// At the hexagonal modular point τ = e^{iπ/3} the zeros of θ(z, τ) form a
// hexagonal lattice in the z-plane. Level-n theta functions (an L²-orthogonal
// tower) carry n zeros per cell, so their zero grid packs ~√n tighter. We stack
// levels 1..N up the vertical axis, each a hexagonal grid over the flat z-plane.

const E1 = [1.0, 0.0]; // hexagonal lattice basis
const E2 = [0.5, Math.sqrt(3) / 2];

// Returns { data: Float32Array of vec4 (x, y, z, t) per zero, count }.
//  x,z — position in the z-plane basis; y — tower height; t — level in [0,1].
export function buildTower({ levels = 5, radius = 3.2, gap = 0.62, base = 1.0 } = {}) {
	const points = [];
	for (let k = 1; k <= levels; k++) {
		const spacing = base / Math.sqrt(k); // finer grid the higher we go
		const y = (k - 1) * gap;
		const t = levels > 1 ? (k - 1) / (levels - 1) : 0;
		const range = Math.ceil(radius / spacing) + 1;
		for (let m = -range; m <= range; m++) {
			for (let n = -range; n <= range; n++) {
				const x = spacing * (m * E1[0] + n * E2[0]);
				const z = spacing * (m * E1[1] + n * E2[1]);
				if (x * x + z * z <= radius * radius) points.push(x, y, z, t);
			}
		}
	}
	const data = new Float32Array(points);
	return { data, count: points.length / 4 };
}

// Unit quad corners (two triangles) used to billboard each zero.
export const QUAD = new Float32Array([
	-1, -1, 1, -1, 1, 1,
	-1, -1, 1, 1, -1, 1
]);
