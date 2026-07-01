# theta-functions

An interactive, domain-coloured visualiser for the **theta function with
characteristics**

```
θ[a,b](z, τ) = Σ_n exp( iπ (n+a)² τ + 2πi (n+a)(z + b) )
```

rendered in a single WebGPU fragment shader.

- **Two variables** — `z` (the plane on screen) and `τ` (the modular
  parameter, Im τ > 0).
- **Two characteristics** — `a` and `b`, with presets for the four classical
  Jacobi thetas θ₁…θ₄.
- Drag to pan the z-plane, scroll to zoom. The `/theory` page explains how each
  knob works.

## Develop

```bash
yarn        # install
yarn dev    # http://localhost:3000
```

Requires a browser with WebGPU.

## Layout

```
src/lib/graphics/
  main.svelte              canvas + pan/zoom + WebGPU fallback
  Engine.js                minimal render loop (uniforms → full-screen pass)
  engine/
    WebGPUContext.js       device / context setup
    RenderPipeline2D.js    the theta pass
    shaders/theta.wgsl     the function + domain colouring
    _parked/               3D / camera / compute, parked for the 3D view
src/lib/components/Controls.svelte   the parameter panel
src/routes/theory/                   the write-up
```
