// RenderPipelineSurface.js — depth-tested mesh pass for the ℘ height-field.
import shaderCode from './shaders/weierstrass.wgsl';

export function createRenderPipelineSurface(device, camera, paramsBuffer) {
	const format = navigator.gpu.getPreferredCanvasFormat();
	const module = device.createShaderModule({ label: 'weierstrass shader', code: shaderCode });
	const { projectionBuffer, viewBuffer } = camera.getBuffers();

	const bindGroupLayout = device.createBindGroupLayout({
		entries: [
			{ binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
			{ binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
			{
				binding: 2,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
				buffer: { type: 'uniform' }
			}
		]
	});

	const pipeline = device.createRenderPipeline({
		label: 'Surface Pipeline',
		layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
		vertex: {
			module,
			entryPoint: 'vertex_main',
			buffers: [
				{
					arrayStride: 8, // vec2 (x, z)
					attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }]
				}
			]
		},
		fragment: { module, entryPoint: 'fragment_main', targets: [{ format }] },
		primitive: { topology: 'triangle-list', cullMode: 'none' },
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
