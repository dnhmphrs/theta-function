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

// Universal theta tower — contour bundles of θ[a,b](u+vτ, τ) over the unit
// (u,v) torus square, stacked up the Im τ axis (the universal elliptic curve).
export const towerParams = writable({
	tauRe: 0.0, // Re τ (shared by every slice)
	tauImLo: 0.3, // Im τ at the bottom slice
	tauImHi: 1.2, // Im τ at the top slice
	a: 0.0, // characteristic a
	b: 0.0, // characteristic b
	field: 2, // 0 = |θ|, 1 = arg θ, 2 = ‖θ‖ (normalised)
	slices: 26, // number of transverse slices
	mouseChar: true // mouse moves (a,b) in the fundamental domain
});

// camera zoom (shared with the orbit controller)
export const zoom = writable(1.0);

// parked — used by the 3D/camera path in graphics/engine/_parked
export const mousePosition = writable(false);
export const viewportSize = writable(false);
