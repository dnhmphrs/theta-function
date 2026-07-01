// Camera.js — perspective or orthographic camera with an orbit target.
import { mat4, vec3 } from 'gl-matrix';

export default class Camera {
	constructor(device, width, height, mode = 'ortho') {
		this.device = device;
		this.mode = mode; // 'ortho' | 'perspective'
		this.projectionMatrix = mat4.create();
		this.viewMatrix = mat4.create();
		this.position = vec3.fromValues(0, 0, 5);
		this.target = vec3.fromValues(0, 0, 0);
		this.up = vec3.fromValues(0, 1, 0);
		this.aspect = width / height;
		this.orthoHalfHeight = 3; // world half-height of an orthographic view

		this.projectionBuffer = this.createBuffer(64);
		this.viewBuffer = this.createBuffer(64);
		this.modelBuffer = this.createBuffer(64);

		this.updateProjection();
		this.updateView();
	}

	createBuffer(size) {
		return this.device.createBuffer({
			size,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			label: 'Camera Buffer'
		});
	}

	getBuffers() {
		return {
			projectionBuffer: this.projectionBuffer,
			viewBuffer: this.viewBuffer,
			modelBuffer: this.modelBuffer
		};
	}

	updateAspect(width, height) {
		this.aspect = width / height;
		this.updateProjection();
	}

	updateProjection(near = 0.1, far = 200) {
		if (this.mode === 'ortho') {
			const hh = this.orthoHalfHeight;
			const hw = hh * this.aspect;
			mat4.ortho(this.projectionMatrix, -hw, hw, -hh, hh, -far, far);
		} else {
			mat4.perspective(this.projectionMatrix, Math.PI / 4, this.aspect, near, far);
		}
		this.writeProjection();
	}

	updateView() {
		mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
		this.writeView();
	}

	writeProjection() {
		if (this.device) this.device.queue.writeBuffer(this.projectionBuffer, 0, this.projectionMatrix);
	}

	writeView() {
		if (this.device) this.device.queue.writeBuffer(this.viewBuffer, 0, this.viewMatrix);
	}
}
