// RenderPipelineThreads.js — depth-tested line pass for the pole→zero threads.
import shaderCode from './shaders/threads.wgsl';

export function createRenderPipelineThreads(device, camera) {
	const format = navigator.gpu.getPreferredCanvasFormat();
	const module = device.createShaderModule({ label: 'threads shader', code: shaderCode });
	const { projectionBuffer, viewBuffer } = camera.getBuffers();

	const bindGroupLayout = device.createBindGroupLayout({
		entries: [
			{ binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
			{ binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }
		]
	});

	const pipeline = device.createRenderPipeline({
		label: 'Threads Pipeline',
		layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
		vertex: {
			module,
			entryPoint: 'vertex_main',
			buffers: [
				{
					arrayStride: 16, // vec4 (x, y, z, t)
					attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x4' }]
				}
			]
		},
		fragment: { module, entryPoint: 'fragment_main', targets: [{ format }] },
		primitive: { topology: 'line-list' },
		depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less' }
	});

	const bindGroup = device.createBindGroup({
		layout: bindGroupLayout,
		entries: [
			{ binding: 0, resource: { buffer: projectionBuffer } },
			{ binding: 1, resource: { buffer: viewBuffer } }
		]
	});

	return { pipeline, bindGroup };
}
