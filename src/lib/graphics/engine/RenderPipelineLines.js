// RenderPipelineLines.js — line-list pass for the zero threads.
import shaderCode from './shaders/lines3d.wgsl';

export function createRenderPipelineLines(device, camera) {
	const format = navigator.gpu.getPreferredCanvasFormat();
	const module = device.createShaderModule({ label: 'lines3d shader', code: shaderCode });
	const { projectionBuffer, viewBuffer } = camera.getBuffers();

	const bindGroupLayout = device.createBindGroupLayout({
		entries: [
			{ binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
			{ binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }
		]
	});

	const pipeline = device.createRenderPipeline({
		label: 'Lines Pipeline',
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
		primitive: { topology: 'line-list' }
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
