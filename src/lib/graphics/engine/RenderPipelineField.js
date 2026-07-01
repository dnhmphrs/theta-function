// RenderPipelineField.js — additive instanced contour-bundle slices.
import shaderCode from './shaders/field3d.wgsl';

export function createRenderPipelineField(device, camera, paramsBuffer) {
	const format = navigator.gpu.getPreferredCanvasFormat();
	const module = device.createShaderModule({ label: 'field3d shader', code: shaderCode });
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

	const additive = { srcFactor: 'one', dstFactor: 'one', operation: 'add' };
	const pipeline = device.createRenderPipeline({
		label: 'Field Pipeline',
		layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
		vertex: {
			module,
			entryPoint: 'vertex_main',
			buffers: [
				{
					arrayStride: 16, // per-instance vec4 (y, tauIm, tnorm, _)
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
			targets: [{ format, blend: { color: additive, alpha: additive } }]
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
