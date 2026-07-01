// points.wgsl — instanced billboard points for the zero-lattice tower.
@group(0) @binding(0) var<uniform> projection : mat4x4<f32>;
@group(0) @binding(1) var<uniform> view : mat4x4<f32>;
@group(0) @binding(2) var<uniform> params : vec4<f32>; // x = point half-size

struct VOut {
	@builtin(position) pos : vec4<f32>,
	@location(0) uv : vec2<f32>,
	@location(1) t : f32
};

@vertex
fn vertex_main(@location(0) inst : vec4<f32>, @location(1) corner : vec2<f32>) -> VOut {
	var out : VOut;
	// Billboard: offset in view space so the quad always faces the camera.
	let viewPos = view * vec4<f32>(inst.xyz, 1.0);
	out.pos = projection * (viewPos + vec4<f32>(corner * params.x, 0.0, 0.0));
	out.uv = corner;
	out.t = inst.w;
	return out;
}

fn palette(t : f32) -> vec3<f32> {
	let warm = vec3<f32>(1.0, 0.55, 0.20); // base plane
	let cool = vec3<f32>(0.30, 0.75, 1.00); // top of the tower
	return mix(warm, cool, t);
}

@fragment
fn fragment_main(in : VOut) -> @location(0) vec4<f32> {
	let d = length(in.uv);
	let a = smoothstep(1.0, 0.25, d); // soft round dot
	if (a <= 0.002) { discard; }
	// premultiplied colour for additive blending
	return vec4<f32>(palette(in.t) * a, a);
}
