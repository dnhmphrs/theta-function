// points.wgsl — instanced billboard points for the tower lattice.
@group(0) @binding(0) var<uniform> projection : mat4x4<f32>;
@group(0) @binding(1) var<uniform> view : mat4x4<f32>;
@group(0) @binding(2) var<uniform> params : vec4<f32>; // x = point half-size

struct VOut {
	@builtin(position) pos : vec4<f32>,
	@location(0) uv : vec2<f32>,
	@location(1) c : f32
};

@vertex
fn vertex_main(@location(0) inst : vec4<f32>, @location(1) corner : vec2<f32>) -> VOut {
	var out : VOut;
	// zeros are drawn a touch smaller than poles
	let size = params.x * mix(1.0, 0.6, inst.w);
	let viewPos = view * vec4<f32>(inst.xyz, 1.0);
	out.pos = projection * (viewPos + vec4<f32>(corner * size, 0.0, 0.0));
	out.uv = corner;
	out.c = inst.w;
	return out;
}

@fragment
fn fragment_main(in : VOut) -> @location(0) vec4<f32> {
	let d = length(in.uv);
	if (d > 1.0) { discard; }
	let warm = vec3<f32>(1.0, 0.62, 0.24); // pole
	let cool = vec3<f32>(0.35, 0.72, 1.0); // zero
	let base = mix(warm, cool, in.c);
	let shade = mix(1.0, 0.55, smoothstep(0.4, 1.0, d)); // round shading
	return vec4<f32>(base * shade, 1.0);
}
