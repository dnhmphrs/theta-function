// RenderPipelinePlanes.js — instanced domain-coloured θ slices (transparent).
import shaderCode from './shaders/plane3d.wgsl';

export function createRenderPipelinePlanes(device, camera, paramsBuffer) {
	const format = navigator.gpu.getPreferredCanvasFormat();
	const module = device.createShaderModule({ label: 'plane3d shader', code: shaderCode });
	const { projectionBuffer, viewBuffer } = camera.getBuffers();

	const bindGroupLayout = device.createBindGroupLayout({
		entries: [
			{ binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
			{ binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
			// Params is read in both stages (vertex uses center/scale, fragment the rest)
			{
				binding: 2,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
				buffer: { type: 'uniform' }
			}
		]
	});

	// premultiplied "over": src + dst·(1−srcA)
	const blend = {
		color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
		alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' }
	};

	const pipeline = device.createRenderPipeline({
		label: 'Planes Pipeline',
		layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
		vertex: {
			module,
			entryPoint: 'vertex_main',
			buffers: [
				{
					arrayStride: 16, // per-instance vec4 (y, lambda, tnorm, _)
					stepMode: 'instance',
					attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x4' }]
				},
				{
					arrayStride: 8, // per-vertex quad corner
					stepMode: 'vertex',
					attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x2' }]
				}
			]
		},
		fragment: {
			module,
			entryPoint: 'fragment_main',
			targets: [{ format, blend }]
		},
		primitive: { topology: 'triangle-list' }
	});

	const bindGroup = device.createBindGroup({
		layout: bindGroupLayout,
		entries: [
			{ binding: 0, resource: { buffer: projectionBuffer } },
			{ binding: 1, resource: { buffer: viewBuffer } },
			{ binding: 2, resource: { buffer: paramsBuffer } }
		]
	});

	return { pipeline, bindGroup };
}
