// RenderPipeline2D.js — full-screen theta-function pass.
import shaderCode from './shaders/theta.wgsl';

export async function createRenderPipeline2D(device, paramsBuffer) {
	const format = navigator.gpu.getPreferredCanvasFormat();
	const module = device.createShaderModule({ label: 'theta shader', code: shaderCode });

	const pipeline = device.createRenderPipeline({
		label: 'Theta Pipeline',
		layout: 'auto',
		vertex: { module, entryPoint: 'vertex_main' },
		fragment: { module, entryPoint: 'fragment_main', targets: [{ format }] },
		primitive: { topology: 'triangle-list' }
	});

	const bindGroup = device.createBindGroup({
		label: 'Theta Bind Group',
		layout: pipeline.getBindGroupLayout(0),
		entries: [{ binding: 0, resource: { buffer: paramsBuffer } }]
	});

	return { pipeline, bindGroup };
}
