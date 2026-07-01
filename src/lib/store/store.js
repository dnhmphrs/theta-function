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
	mode: 1 // 0 = flat phase, 1 = with contours
});

// parked — used by the 3D/camera path in graphics/engine/_parked
export const mousePosition = writable(false);
export const viewportSize = writable(false);
export const zoom = writable(1.0);
