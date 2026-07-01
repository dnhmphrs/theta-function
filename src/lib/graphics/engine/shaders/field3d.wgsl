// field3d.wgsl — contour-bundle slices of the universal theta function.
//
// Each slice is the SAME unit torus square in lattice coordinates (u,v) ∈ [0,1]²;
// the argument is z = u + vτ. The vertical axis varies τ (Im τ). We draw contour
// bundles of the chosen field — |θ|, arg θ, or the normalized norm
// ‖θ‖ = |θ|·e^{-π v² Im τ} — so the complex data connects the slices.

@group(0) @binding(0) var<uniform> projection : mat4x4<f32>;
@group(0) @binding(1) var<uniform> view : mat4x4<f32>;

struct Params {
	tauRe : f32,
	a : f32,
	b : f32,
	field : f32, // 0 = |θ|, 1 = arg θ, 2 = ‖θ‖
	span : f32, // world size of the unit square
	terms : f32,
	_p0 : f32,
	_p1 : f32
};
@group(0) @binding(2) var<uniform> P : Params;

const PI = 3.14159265358979323846;

// per-instance: x = world height y, y = Im τ, z = tnorm (0..1 up the tower)
struct VOut {
	@builtin(position) pos : vec4<f32>,
	@location(0) uv : vec2<f32>,
	@location(1) tauIm : f32,
	@location(2) tnorm : f32
};

@vertex
fn vertex_main(@location(0) inst : vec4<f32>, @location(1) corner : vec2<f32>) -> VOut {
	var out : VOut;
	let uv = corner * 0.5 + vec2<f32>(0.5); // [0,1]²
	let world = vec3<f32>((uv.x - 0.5) * P.span, inst.x, (uv.y - 0.5) * P.span);
	out.pos = projection * view * vec4<f32>(world, 1.0);
	out.uv = uv;
	out.tauIm = inst.y;
	out.tnorm = inst.z;
	return out;
}

fn theta(z : vec2<f32>, tau : vec2<f32>, a : f32, b : f32, N : i32) -> vec2<f32> {
	var sum = vec2<f32>(0.0, 0.0);
	for (var n = -N; n <= N; n = n + 1) {
		let m = f32(n) + a;
		let ar = m * m * tau.x + 2.0 * m * (z.x + b);
		let ai = m * m * tau.y + 2.0 * m * z.y;
		let f = exp(min(-PI * ai, 80.0));
		sum.x += f * cos(PI * ar);
		sum.y += f * sin(PI * ar);
	}
	return sum;
}

fn hue2rgb(h : f32) -> vec3<f32> {
	let k = vec3<f32>(5.0, 3.0, 1.0);
	let p = abs(fract(vec3<f32>(h) + k / 6.0) * 6.0 - 3.0);
	return clamp(p - 1.0, vec3<f32>(0.0), vec3<f32>(1.0));
}

fn heightColor(t : f32) -> vec3<f32> {
	return mix(vec3<f32>(1.0, 0.55, 0.22), vec3<f32>(0.32, 0.72, 1.0), t);
}

@fragment
fn fragment_main(in : VOut) -> @location(0) vec4<f32> {
	let tau = vec2<f32>(P.tauRe, in.tauIm);
	let z = vec2<f32>(in.uv.x + in.uv.y * tau.x, in.uv.y * tau.y);
	let w = theta(z, tau, P.a, P.b, i32(P.terms));

	let mag = length(w);
	let phase = atan2(w.y, w.x) / (2.0 * PI) + 0.5;
	let norm = mag * exp(-PI * in.uv.y * in.uv.y * in.tauIm);

	var val = mag;
	if (P.field > 1.5) { val = norm; }

	// contour bundles + a bright zero thread
	var intensity : f32;
	var col : vec3<f32>;
	if (P.field > 0.5 && P.field < 1.5) {
		// arg θ level sets
		let band = fract(phase * 10.0);
		intensity = smoothstep(0.5, 0.0, abs(band - 0.5)) * 0.9;
		col = hue2rgb(phase);
	} else {
		// |θ| or ‖θ‖ level sets (log-spaced)
		let band = fract(log2(1.0 + val) * 2.5);
		intensity = smoothstep(0.5, 0.0, abs(band - 0.5)) * 0.8;
		col = heightColor(in.tnorm);
	}

	// zeros: where the field collapses, glow bright
	let zero = smoothstep(0.35, 0.0, val);
	intensity = max(intensity * 0.5, zero);
	col = mix(col, vec3<f32>(1.0), zero * 0.6);

	return vec4<f32>(col * intensity, intensity); // premultiplied, additive
}
