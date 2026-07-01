// Engine.js — minimal WebGPU renderer for the theta-function plane.
//
// The 3D / camera / compute machinery lives in ./engine/_parked and is not
// wired in yet; it is kept for the upcoming 3D surface view.
import { initializeWebGPU } from './engine/WebGPUContext.js';
import { createRenderPipeline2D } from './engine/RenderPipeline2D.js';
import { thetaParams } from '$lib/store/store.js';

const FLOAT_COUNT = 12; // Params: 6×vec2 + 4×f32 laid out to 48 bytes

export default class Engine {
	constructor(canvas) {
		this.canvas = canvas;
		this.device = null;
		this.context = null;
		this.pipeline2D = null;
		this.paramsBuffer = null;
		this.uniforms = new Float32Array(FLOAT_COUNT);
		this.params = null;
		this.running = false;
		this.raf = null;
		this.unsubscribe = null;
	}

	// Returns false when WebGPU is unavailable so the UI can show a fallback.
	async start() {
		const gpu = await initializeWebGPU(this.canvas);
		if (!gpu) return false;
		this.device = gpu.device;
		this.context = gpu.context;

		this.paramsBuffer = this.device.createBuffer({
			label: 'Theta Params',
			size: FLOAT_COUNT * 4,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		});

		this.pipeline2D = await createRenderPipeline2D(this.device, this.paramsBuffer);
		this.unsubscribe = thetaParams.subscribe((p) => (this.params = p));

		this.resize();
		this.running = true;
		this.render();
		return true;
	}

	resize() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const width = Math.max(1, Math.floor(this.canvas.clientWidth * dpr));
		const height = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));
		if (this.canvas.width !== width || this.canvas.height !== height) {
			this.canvas.width = width;
			this.canvas.height = height;
		}
	}

	writeUniforms() {
		const p = this.params;
		const u = this.uniforms;
		u[0] = this.canvas.width;
		u[1] = this.canvas.height;
		u[2] = p.tauRe;
		u[3] = Math.max(p.tauIm, 0.02); // keep Im τ > 0 for convergence
		u[4] = p.a;
		u[5] = p.b;
		u[6] = p.centerRe;
		u[7] = p.centerIm;
		u[8] = p.scale;
		u[9] = p.terms;
		u[10] = p.mode;
		u[11] = 0;
		this.device.queue.writeBuffer(this.paramsBuffer, 0, u);
	}

	render() {
		if (!this.running || !this.params) {
			this.raf = requestAnimationFrame(() => this.render());
			return;
		}
		this.resize();
		this.writeUniforms();

		const encoder = this.device.createCommandEncoder();
		const view = this.context.getCurrentTexture().createView();
		const pass = encoder.beginRenderPass({
			colorAttachments: [
				{ view, loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 1 } }
			]
		});
		pass.setPipeline(this.pipeline2D.pipeline);
		pass.setBindGroup(0, this.pipeline2D.bindGroup);
		pass.draw(3, 1, 0, 0);
		pass.end();
		this.device.queue.submit([encoder.finish()]);

		this.raf = requestAnimationFrame(() => this.render());
	}

	stop() {
		this.running = false;
		if (this.raf) cancelAnimationFrame(this.raf);
		if (this.unsubscribe) this.unsubscribe();
	}
}
