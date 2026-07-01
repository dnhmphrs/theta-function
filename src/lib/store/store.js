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

// Weierstrass ℘ surface — real height-field over the period lattice ℤω₁ + ℤω₂.
// ω₁ = 1 is fixed; ω₂ = (tauRe, tauIm) sets the lattice shape (hexagonal by
// default). The height is Re ℘, so lattice points are poles.
export const towerParams = writable({
	tauRe: 0.5, // Re ω₂  (0.5, √3/2) ⇒ hexagonal, equal periods
	tauIm: 0.8660254, // Im ω₂
	tiles: 2, // how many lattice cells to show each way
	height: 0.14, // vertical scale of Re ℘
	clampH: 2.2, // cap on the pole spikes
	contours: true // height level-set lines
});

// camera zoom (shared with the orbit controller)
export const zoom = writable(1.0);

// parked — used by the 3D/camera path in graphics/engine/_parked
export const mousePosition = writable(false);
export const viewportSize = writable(false);
