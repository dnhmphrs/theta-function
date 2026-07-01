// weierstrass.wgsl — real height-field of the Weierstrass ℘ function over its
// period lattice Λ = ℤ·ω₁ + ℤ·ω₂.
//
//   ℘(z) = 1/z² + Σ_{ω≠0} [ 1/(z-ω)² − 1/ω² ]
//
// The horizontal plane is the lattice (two periods on equal footing — hexagonal
// when ω₂ = e^{iπ/3}); the height is the *real* value Re ℘, so lattice points
// are poles (spikes) and the surface carries the ℘(−z)=℘(z) symmetry.

@group(0) @binding(0) var<uniform> projection : mat4x4<f32>;
@group(0) @binding(1) var<uniform> view : mat4x4<f32>;

struct Params {
	w1 : vec2<f32>, // first period
	w2 : vec2<f32>, // second period
	heightScale : f32,
	clampH : f32,
	contours : f32,
	_pad : f32
};
@group(0) @binding(2) var<uniform> P : Params;

const RANGE : i32 = 4; // lattice sum half-width

fn cinv(w : vec2<f32>) -> vec2<f32> {
	return vec2<f32>(w.x, -w.y) / max(dot(w, w), 1e-5);
}
fn cmul(a : vec2<f32>, b : vec2<f32>) -> vec2<f32> {
	return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}
fn csq(a : vec2<f32>) -> vec2<f32> {
	return vec2<f32>(a.x * a.x - a.y * a.y, 2.0 * a.x * a.y);
}

// Re ℘(z) — the height.
fn weierRe(z : vec2<f32>) -> f32 {
	var sum = csq(cinv(z)); // 1/z²
	for (var m = -RANGE; m <= RANGE; m = m + 1) {
		for (var n = -RANGE; n <= RANGE; n = n + 1) {
			if (m == 0 && n == 0) { continue; }
			let w = f32(m) * P.w1 + f32(n) * P.w2;
			sum += csq(cinv(z - w)) - csq(cinv(w)); // 1/(z-ω)² − 1/ω²
		}
	}
	return sum.x;
}

fn height(z : vec2<f32>) -> f32 {
	return clamp(P.heightScale * weierRe(z), -P.clampH, P.clampH);
}

struct VOut {
	@builtin(position) pos : vec4<f32>,
	@location(0) world : vec3<f32>,
	@location(1) h : f32
};

@vertex
fn vertex_main(@location(0) xz : vec2<f32>) -> VOut {
	var out : VOut;
	let y = height(xz);
	let world = vec3<f32>(xz.x, y, xz.y);
	out.pos = projection * view * vec4<f32>(world, 1.0);
	out.world = world;
	out.h = y / P.clampH; // normalised height for colouring
	return out;
}

fn palette(t : f32) -> vec3<f32> {
	// deep blue valleys → warm peaks
	let low = vec3<f32>(0.15, 0.28, 0.55);
	let mid = vec3<f32>(0.55, 0.72, 0.72);
	let high = vec3<f32>(1.0, 0.72, 0.35);
	let s = clamp(t * 0.5 + 0.5, 0.0, 1.0);
	return select(mix(low, mid, s / 0.5), mix(mid, high, (s - 0.5) / 0.5), s > 0.5);
}

@fragment
fn fragment_main(in : VOut) -> @location(0) vec4<f32> {
	// faceted normal from screen-space derivatives of world position
	let normal = normalize(cross(dpdx(in.world), dpdy(in.world)));
	let lightDir = normalize(vec3<f32>(0.4, 0.9, 0.3));
	let diff = clamp(dot(normal, lightDir), 0.0, 1.0) * 0.7 + 0.35;

	var col = palette(in.h) * diff;

	if (P.contours > 0.5) {
		let band = fract(in.h * 8.0);
		let line = smoothstep(0.0, 0.06, band) * smoothstep(0.0, 0.06, 1.0 - band);
		col = col * mix(0.6, 1.0, line);
	}

	return vec4<f32>(col, 1.0);
}
