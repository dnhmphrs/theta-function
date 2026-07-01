# parked

3D / camera / compute machinery from the original build, kept out of the active
render path for now. It is **not imported** anywhere and does not ship in the
bundle.

Parked here for the upcoming 3D surface view of the theta function:

- `Camera.js`, `CameraController.js` — perspective camera + orbit/zoom control
- `RenderPipeline3D.js`, `Scene.js`, `objects/Cube.js` — the old 3D cube pass
- `ComputePipeline.js` — demo compute pass
- `shaders/` — `basic2D`, `basic3D`, `compute`, `theta3D`

The active renderer is `../Engine.js` + `../RenderPipeline2D.js` +
`../shaders/theta.wgsl`, driven by the `thetaParams` store.
