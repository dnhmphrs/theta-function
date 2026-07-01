# parked

Leftovers from the original cube demo, kept out of the active render path. Not
imported anywhere and not shipped in the bundle.

- `RenderPipeline3D.js`, `Scene.js`, `objects/Cube.js` — the old 3D cube pass
- `ComputePipeline.js` — demo compute pass
- `shaders/` — `basic2D`, `basic3D`, `compute`, `theta3D`

The camera (`../Camera.js`, `../CameraController.js`) was un-parked for the 3D
zero-lattice tower.

Active renderers:

- **2D plane** — `../../Engine.js` + `../RenderPipeline2D.js` + `shaders/theta.wgsl`
- **3D tower** — `../../Tower3D.svelte` + `../RenderPipelinePoints.js` +
  `shaders/points.wgsl` + `../../lattice.js`
