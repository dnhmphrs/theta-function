// theta.wgsl — Riemann theta function with characteristics, domain-coloured.
//
//   θ[a,b](z, τ) = Σ_n  exp( iπ (n+a)² τ + 2πi (n+a)(z + b) )
//
// Two variables : z   (the plane we draw across the screen)
//                 τ   (the modular parameter, Im τ > 0)
// Two characteristics : a, b  (real, taken mod 1)

struct Params {
  resolution : vec2<f32>,  // canvas size in pixels
  tau        : vec2<f32>,  // τ = tau.x + i·tau.y
  chr        : vec2<f32>,  // characteristics (a, b)
  center     : vec2<f32>,  // centre of the z-view
  scale      : f32,        // half-height of the z-view
  terms      : f32,        // number of series terms (per side)
  mode       : f32,        // 0 = flat phase, 1 = with contours
  _pad       : f32,
};

@group(0) @binding(0) var<uniform> P : Params;

const PI = 3.14159265358979323846;

// θ[a,b](z, τ) evaluated as a truncated exponential series.
fn theta(z : vec2<f32>, tau : vec2<f32>, a : f32, b : f32) -> vec2<f32> {
  var sum = vec2<f32>(0.0, 0.0);          // (real, imag)
  let N = i32(P.terms);
  for (var n = -N; n <= N; n = n + 1) {
    let m = f32(n) + a;
    // exponent = iπ · A, with A = m²·τ + 2m·(z + b) (complex)
    let ar = m * m * tau.x + 2.0 * m * (z.x + b);
    let ai = m * m * tau.y + 2.0 * m * z.y;
    // exp(iπ(ar + i·ai)) = exp(-π·ai) · (cos(π·ar) + i·sin(π·ar))
    let f = exp(min(-PI * ai, 80.0));      // clamp guards against overflow
    sum.x += f * cos(PI * ar);
    sum.y += f * sin(PI * ar);
  }
  return sum;
}

fn hsv2rgb(h : f32, s : f32, v : f32) -> vec3<f32> {
  let k = vec3<f32>(5.0, 3.0, 1.0);
  let p = abs(fract(vec3<f32>(h) + k / 6.0) * 6.0 - 3.0);
  return v * mix(vec3<f32>(1.0), clamp(p - 1.0, vec3<f32>(0.0), vec3<f32>(1.0)), s);
}

@vertex
fn vertex_main(@builtin(vertex_index) i : u32) -> @builtin(position) vec4<f32> {
  // Single triangle covering the viewport.
  var pos = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 3.0, -1.0),
    vec2<f32>(-1.0,  3.0)
  );
  return vec4<f32>(pos[i], 0.0, 1.0);
}

@fragment
fn fragment_main(@builtin(position) frag : vec4<f32>) -> @location(0) vec4<f32> {
  let aspect = P.resolution.x / P.resolution.y;

  // Pixel → point z in the complex plane (y up).
  var ndc = (frag.xy / P.resolution) * 2.0 - vec2<f32>(1.0);
  ndc.y = -ndc.y;
  let z = P.center + vec2<f32>(ndc.x * aspect, ndc.y) * P.scale;

  let w = theta(z, P.tau, P.chr.x, P.chr.y);

  // Domain colouring: hue = phase, brightness rises with |θ| (zeros are black).
  let mag = length(w);
  let hue = atan2(w.y, w.x) / (2.0 * PI) + 0.5;
  var col = hsv2rgb(hue, 1.0, mag / (1.0 + mag));

  if (P.mode > 0.5) {
    // Modulus rings (log-spaced) + phase spokes trace the level structure.
    let ring  = fract(log2(1.0 + mag));
    let spoke = fract(hue * 12.0);
    let lines = smoothstep(0.0, 0.07, ring)  * smoothstep(0.0, 0.07, 1.0 - ring)
              * smoothstep(0.0, 0.07, spoke) * smoothstep(0.0, 0.07, 1.0 - spoke);
    col = col * mix(0.55, 1.0, lines);
  }

  return vec4<f32>(col, 1.0);
}
