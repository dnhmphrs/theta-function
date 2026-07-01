import { writable } from 'svelte/store';

export const userType = writable(null);
export const screenType = writable(null);
export const isIframe = writable(true);
export const darkMode = writable(false);

export const screenSize = writable({ width: 0, height: 0 });

// theta visualiser — the two variables (z-view, τ) and two characteristics (a, b)
export const thetaParams = writable({
	tauRe: 0.0, // Re τ  — shear of the period lattice
	tauIm: 0.35, // Im τ  — height of the period lattice (must stay > 0)
	a: 0.0, // characteristic a
	b: 0.0, // characteristic b
	centerRe: 0.0, // z-view centre (real)
	centerIm: 0.0, // z-view centre (imag)
	scale: 2.0, // z-view half-height
	terms: 40, // series terms per side
	mode: 1, // 0 = flat phase, 1 = with contours
	mouseTau: true // when true the mouse drives τ live
});

// 3D tower — the same θ swept in scale (λ = e^t) up the vertical axis.
// The four variables (z-view, τ, a, b) live in thetaParams above and drive
// every slice; these are just the tower's display options.
export const towerParams = writable({
	slices: 4, // planes above centre (mirrored below)
	gap: 0.55, // vertical spacing between slices
	rate: 0.9, // how fast the scale λ grows per unit height
	planes: true, // domain-coloured complex plane on each slice
	contours: true, // |θ| / phase contour lines on the planes
	threads: true // zero curves threading between the planes
});

// camera zoom (shared with the orbit controller)
export const zoom = writable(1.0);

// parked — used by the 3D/camera path in graphics/engine/_parked
export const mousePosition = writable(false);
export const viewportSize = writable(false);
