// threads.wgsl — lines: poles branching up into the next level's zeros.
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
	let warm = vec3<f32>(1.0, 0.62, 0.24);
	let cool = vec3<f32>(0.35, 0.72, 1.0);
	return vec4<f32>(mix(warm, cool, in.t) * 0.55, 1.0);
}
