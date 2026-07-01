// plane3d.wgsl — a domain-coloured θ(λz, τ; a, b) plane for one tower slice.
@group(0) @binding(0) var<uniform> projection : mat4x4<f32>;
@group(0) @binding(1) var<uniform> view : mat4x4<f32>;

struct Params {
	tau : vec2<f32>,
	chr : vec2<f32>, // a, b
	center : vec2<f32>,
	scale : f32,
	terms : f32,
	mode : f32, // 0 = flat, 1 = contours
	alpha : f32
};
@group(0) @binding(2) var<uniform> P : Params;

const PI = 3.14159265358979323846;

// per-instance: x = height y, y = scale λ
struct VOut {
	@builtin(position) pos : vec4<f32>,
	@location(0) zc : vec2<f32>, // complex z at this fragment
	@location(1) lambda : f32
};

@vertex
fn vertex_main(@location(0) inst : vec4<f32>, @location(1) corner : vec2<f32>) -> VOut {
	var out : VOut;
	let zc = P.center + corner * P.scale; // complex coordinate on the plane
	let world = vec3<f32>(zc.x, inst.x, zc.y); // x = Re z, y = height, z = Im z
	out.pos = projection * view * vec4<f32>(world, 1.0);
	out.zc = zc;
	out.lambda = inst.y;
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

fn hsv2rgb(h : f32, s : f32, v : f32) -> vec3<f32> {
	let k = vec3<f32>(5.0, 3.0, 1.0);
	let p = abs(fract(vec3<f32>(h) + k / 6.0) * 6.0 - 3.0);
	return v * mix(vec3<f32>(1.0), clamp(p - 1.0, vec3<f32>(0.0), vec3<f32>(1.0)), s);
}

@fragment
fn fragment_main(in : VOut) -> @location(0) vec4<f32> {
	let w = theta(in.lambda * in.zc, P.tau, P.chr.x, P.chr.y, i32(P.terms));
	let mag = length(w);
	let hue = atan2(w.y, w.x) / (2.0 * PI) + 0.5;
	var col = hsv2rgb(hue, 1.0, mag / (1.0 + mag));

	if (P.mode > 0.5) {
		let ring = fract(log2(1.0 + mag));
		let spoke = fract(hue * 12.0);
		let lines = smoothstep(0.0, 0.07, ring) * smoothstep(0.0, 0.07, 1.0 - ring)
			* smoothstep(0.0, 0.07, spoke) * smoothstep(0.0, 0.07, 1.0 - spoke);
		col = col * mix(0.55, 1.0, lines);
	}

	return vec4<f32>(col * P.alpha, P.alpha); // premultiplied for over-blending
}
