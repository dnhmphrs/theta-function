// lattice.js — a flat grid mesh over the period lattice, displaced in the
// vertex shader by the Weierstrass ℘ height field.

// res×res vertices spanning [−extent, extent]² in the horizontal plane.
export function buildGrid(res, extent) {
	const positions = new Float32Array(res * res * 2);
	for (let j = 0; j < res; j++) {
		for (let i = 0; i < res; i++) {
			const k = (j * res + i) * 2;
			positions[k] = -extent + (2 * extent * i) / (res - 1);
			positions[k + 1] = -extent + (2 * extent * j) / (res - 1);
		}
	}

	const indices = new Uint32Array((res - 1) * (res - 1) * 6);
	let p = 0;
	for (let j = 0; j < res - 1; j++) {
		for (let i = 0; i < res - 1; i++) {
			const a = j * res + i;
			const b = a + 1;
			const c = a + res;
			const d = c + 1;
			indices[p++] = a; indices[p++] = c; indices[p++] = b;
			indices[p++] = b; indices[p++] = c; indices[p++] = d;
		}
	}

	return { positions, indices, indexCount: indices.length };
}
