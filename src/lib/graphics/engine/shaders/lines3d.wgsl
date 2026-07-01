// lines3d.wgsl — coloured 3D lines for the zero threads.
@group(0) @binding(0) var<uniform> projection : mat4x4<f32>;
@group(0) @binding(1) var<uniform> view : mat4x4<f32>;

struct VOut {
	@builtin(position) pos : vec4<f32>,
	@location(0) t : f32
};

@vertex
fn vertex_main(@location(0) v : vec4<f32>) -> VOut {
	var out : VOut;
	out.pos = projection * view * vec4<f32>(v.xyz, 1.0);
	out.t = v.w;
	return out;
}

@fragment
fn fragment_main(in : VOut) -> @location(0) vec4<f32> {
	let warm = vec3<f32>(1.0, 0.55, 0.20);
	let cool = vec3<f32>(0.30, 0.75, 1.00);
	return vec4<f32>(mix(warm, cool, in.t), 1.0);
}
