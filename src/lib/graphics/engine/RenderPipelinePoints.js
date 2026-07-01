// RenderPipelinePoints.js — depth-tested instanced billboards for the lattice.
import shaderCode from './shaders/points.wgsl';

export function createRenderPipelinePoints(device, camera, paramsBuffer) {
	const format = navigator.gpu.getPreferredCanvasFormat();
	const module = device.createShaderModule({ label: 'points shader', code: shaderCode });
	const { projectionBuffer, viewBuffer } = camera.getBuffers();

	const bindGroupLayout = device.createBindGroupLayout({
		entries: [
			{ binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
			{ binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
			{ binding: 2, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }
		]
	});

	const pipeline = device.createRenderPipeline({
		label: 'Points Pipeline',
		layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
		vertex: {
			module,
			entryPoint: 'vertex_main',
			buffers: [
				{
					arrayStride: 16, // per-instance vec4 (x, y, z, colorT)
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
		fragment: { module, entryPoint: 'fragment_main', targets: [{ format }] },
		primitive: { topology: 'triangle-list' },
		depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less' }
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
