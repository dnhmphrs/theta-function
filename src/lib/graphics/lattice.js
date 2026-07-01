// lattice.js — slice instances for the universal-theta contour tower.
// Each slice is the same unit (u,v) square; only τ (Im τ) changes up the stack.

export const QUAD = new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]);

// Returns Float32Array of vec4 (worldY, Im τ, tnorm, 0) per slice.
export function buildSlices({ count, height, tauImLo, tauImHi }) {
	const data = new Float32Array(count * 4);
	for (let i = 0; i < count; i++) {
		const t = count > 1 ? i / (count - 1) : 0.5;
		data[i * 4] = (t - 0.5) * height; // world height
		data[i * 4 + 1] = tauImLo + (tauImHi - tauImLo) * t; // Im τ
		data[i * 4 + 2] = t; // colour parameter
		data[i * 4 + 3] = 0;
	}
	return data;
}
