import { Component, DOCUMENT, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import { Motion, clamp } from '../core/motion';
import { Theme, hexToRgb } from '../core/theme';

const VERTEX = `#version 300 es
in vec3 aFrom;
in vec3 aTo;
in vec4 aRand;
uniform float uMix;
uniform float uTime;
uniform float uAspect;
uniform float uScale;
uniform float uSize;
uniform float uBurst;
uniform float uWave;
uniform vec2 uOffset;
uniform vec2 uRot;
uniform vec2 uMouse;
out float vAlpha;
out float vTint;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main() {
  // Each particle leaves and arrives on its own schedule, so shapes flow into each other.
  float t = clamp(uMix * 1.7 - aRand.x * 0.7, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec3 p = mix(aFrom, aTo, t);

  vec3 dir = normalize(aRand.yzw - 0.5);
  float mid = sin(t * 3.14159);
  p += dir * mid * (0.35 + aRand.x * 0.9);          // scatter mid-morph
  p += dir * uBurst * (0.1 + aRand.y * 0.35);       // scroll speed loosens the form
  p += 0.03 * vec3(                                 // slow breathing
    sin(uTime * 0.7 + aRand.y * 40.0),
    cos(uTime * 0.6 + aRand.z * 40.0),
    sin(uTime * 0.5 + aRand.w * 40.0));
  p.y += uWave * 0.16 * sin(p.x * 1.6 + uTime * 0.8) * cos(p.z * 1.3 - uTime * 0.5);

  p.xz = rot(uRot.y) * p.xz;
  p.yz = rot(uRot.x) * p.yz;
  p *= uScale;
  p.xy += uOffset;

  float w = 5.0 - p.z;                               // camera sits at z = 5
  const float f = 2.41421;                           // 1 / tan(45deg / 2)
  vec2 clip = vec2(p.x * f / uAspect, p.y * f);

  // The pointer parts the cloud like a finger through sand.
  vec2 d = clip / w - uMouse;
  d.x *= uAspect;
  float len = length(d) + 1e-4;
  clip += (d / len) * exp(-len * len * 16.0) * 0.16 * w * vec2(1.0 / uAspect, 1.0);

  gl_Position = vec4(clip, 0.0, w);
  gl_PointSize = uSize * (0.55 + aRand.y * 1.5) * (5.0 / w);
  vAlpha = clamp(1.9 - w * 0.26, 0.12, 1.0) * (1.0 - mid * 0.45);
  vTint = aRand.z;
}`;

const FRAGMENT = `#version 300 es
precision mediump float;
in float vAlpha;
in float vTint;
uniform vec3 uColA;
uniform vec3 uColB;
uniform float uOpacity;
out vec4 outColor;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  float a = smoothstep(0.25, 0.0, d);
  vec3 color = mix(uColA, uColB, smoothstep(0.35, 1.0, vTint));
  outColor = vec4(color * a * vAlpha * uOpacity, 1.0);
}`;

/** How a shape is staged: where it sits, how big, how much it spins and how bright. */
interface Staging {
  /** Section whose arrival forms this shape. */
  id: string;
  x: number;
  y: number;
  scale: number;
  spin: number;
  wave: number;
  opacity: number;
  /** Staging on narrow screens, where the form sits behind the text. */
  narrow: { x: number; y: number; scale: number; opacity: number };
}

const STAGES: readonly Staging[] = [
  { id: 'top', x: 1.25, y: 0.35, scale: 1.05, spin: 1, wave: 0, opacity: 0.9, narrow: { x: 0, y: 0.75, scale: 0.62, opacity: 0.8 } },
  { id: 'about', x: 1.7, y: 0.1, scale: 0.95, spin: 1, wave: 0, opacity: 0.42, narrow: { x: 0, y: 0, scale: 0.6, opacity: 0.3 } },
  { id: 'work', x: 0, y: -0.25, scale: 1.1, spin: 0.14, wave: 1, opacity: 0.5, narrow: { x: 0, y: -0.2, scale: 0.7, opacity: 0.4 } },
  { id: 'experience', x: -2.35, y: 0, scale: 1, spin: 1, wave: 0, opacity: 0.42, narrow: { x: 0, y: 0, scale: 0.62, opacity: 0.26 } },
  { id: 'stack', x: 0.9, y: 0, scale: 1.05, spin: 0.45, wave: 0, opacity: 0.4, narrow: { x: 0, y: 0, scale: 0.6, opacity: 0.3 } },
  { id: 'contact', x: 0, y: 0.95, scale: 1, spin: 0, wave: 0, opacity: 0.78, narrow: { x: 0, y: 0.35, scale: 0.36, opacity: 0.2 } },
];

const TAU = Math.PI * 2;
const rand = Math.random;
const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;

/** Shape generators: each fills `n` xyz triples. */
const SHAPES: readonly ((n: number, doc: Document) => Float32Array)[] = [
  // Sphere: an even shell with a thin halo of dust.
  (n) => {
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const y = 1 - (2 * (i + 0.5)) / n;
      const ring = Math.sqrt(1 - y * y);
      const a = i * 2.39996323;
      const r = i % 7 === 0 ? 1.7 + rand() * 0.9 : 1.5 + gauss() * 0.02;
      out.set([Math.cos(a) * ring * r, y * r, Math.sin(a) * ring * r], i * 3);
    }
    return out;
  },
  // Trefoil knot.
  (n) => {
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = (i / n) * TAU;
      const r = 2 + Math.cos(3 * u);
      const tube = 0.2 * Math.cbrt(rand());
      const a = rand() * TAU;
      const b = Math.acos(2 * rand() - 1);
      out.set(
        [
          r * Math.cos(2 * u) * 0.6 + tube * Math.sin(b) * Math.cos(a),
          r * Math.sin(2 * u) * 0.6 + tube * Math.sin(b) * Math.sin(a),
          Math.sin(3 * u) * 0.75 + tube * Math.cos(b),
        ],
        i * 3,
      );
    }
    return out;
  },
  // Terrain: a dotted landscape receding into the distance.
  (n) => {
    const out = new Float32Array(n * 3);
    const cols = Math.ceil(Math.sqrt(n * 1.6));
    const rows = Math.ceil(n / cols);
    for (let i = 0; i < n; i++) {
      const x = ((i % cols) / (cols - 1) - 0.5) * 9;
      const z = (Math.floor(i / cols) / (rows - 1) - 0.5) * 6;
      const y = 0.4 * (Math.sin(x * 1.3) + Math.cos(z * 1.7) * Math.sin(x * 0.6 + 1)) - 1.15;
      out.set([x, y, z], i * 3);
    }
    return out;
  },
  // Double helix with rungs.
  (n) => {
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const k = i / n;
      const a = k * TAU * 4.5;
      const y = (k - 0.5) * 4.6;
      const j = 0.035;
      if (i % 5 === 0) {
        const rung = Math.round(k * 46) / 46;
        const ra = rung * TAU * 4.5;
        const m = (rand() - 0.5) * 2 * 0.85;
        out.set([Math.cos(ra) * m, (rung - 0.5) * 4.6, Math.sin(ra) * m], i * 3);
      } else {
        const side = i % 2 ? Math.PI : 0;
        out.set(
          [Math.cos(a + side) * 0.85 + gauss() * j, y + gauss() * j, Math.sin(a + side) * 0.85 + gauss() * j],
          i * 3,
        );
      }
    }
    return out;
  },
  // Spiral galaxy, tilted toward the viewer.
  (n) => {
    const out = new Float32Array(n * 3);
    const tilt = 1.05;
    for (let i = 0; i < n; i++) {
      const r = Math.pow(rand(), 0.62) * 2.3;
      const a = (i % 3) * (TAU / 3) + r * 1.7 + gauss() * 0.32;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const y = gauss() * 0.1 * (2.6 - r);
      out.set([x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)], i * 3);
    }
    return out;
  },
  // A word, sampled from text drawn to an offscreen canvas.
  (n, doc) => {
    const out = new Float32Array(n * 3);
    const canvas = doc.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 320;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const points: number[] = [];
    if (ctx) {
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '800 250px "Bricolage Grotesque Variable", "Arial Black", Arial, sans-serif';
      ctx.fillText('HELLO', 600, 172);
      const pixels = ctx.getImageData(0, 0, 1200, 320).data;
      for (let y = 0; y < 320; y += 2) {
        for (let x = 0; x < 1200; x += 2) if (pixels[(y * 1200 + x) * 4 + 3] > 128) points.push(x, y);
      }
    }
    if (!points.length) return SHAPES[0](n, doc);
    const count = points.length / 2;
    for (let i = 0; i < n; i++) {
      const pick = Math.floor(rand() * count) * 2;
      out.set(
        [((points[pick] + rand() * 2 - 600) / 600) * 2.75, (-(points[pick + 1] + rand() * 2 - 160) / 600) * 2.75, gauss() * 0.07],
        i * 3,
      );
    }
    return out;
  },
];

const BONE: [number, number, number] = [0.925, 0.906, 0.875];

/**
 * One persistent 3D particle sculpture behind the whole page. Scrolling from section to
 * section morphs it between forms; the pointer tilts it and parts the cloud.
 */
@Component({
  selector: 'app-particles',
  host: { 'aria-hidden': 'true' },
  template: `<canvas #canvas></canvas>`,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 2s ease 1s;
    }

    canvas.on {
      opacity: 1;
    }
  `,
})
export class Particles {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly theme = inject(Theme);
  private readonly doc = inject(DOCUMENT);

  constructor() {
    const motion = inject(Motion);
    afterNextRender(() => this.paint(motion));
  }

  private paint(motion: Motion): void {
    const doc = this.doc;
    const canvas = this.canvas().nativeElement;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'aFrom');
    gl.bindAttribLocation(program, 1, 'aTo');
    gl.bindAttribLocation(program, 2, 'aRand');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const narrowQuery = matchMedia('(max-width: 899px)');
    const count = narrowQuery.matches ? 26000 : 70000;

    const upload = (data: Float32Array) => {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return buffer;
    };
    const shapes = SHAPES.map((make) => upload(make(count, doc)));
    // Redraw the word once the display font has loaded.
    doc.fonts?.ready.then(() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, shapes[5]);
      gl.bufferData(gl.ARRAY_BUFFER, SHAPES[5](count, doc), gl.STATIC_DRAW);
      bound = -1;
    });

    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < seeds.length; i++) seeds[i] = rand();
    upload(seeds);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(0.043, 0.043, 0.047, 1);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const u = {
      mix: uniform('uMix'),
      time: uniform('uTime'),
      aspect: uniform('uAspect'),
      scale: uniform('uScale'),
      size: uniform('uSize'),
      burst: uniform('uBurst'),
      wave: uniform('uWave'),
      offset: uniform('uOffset'),
      rot: uniform('uRot'),
      mouse: uniform('uMouse'),
      colA: uniform('uColA'),
      colB: uniform('uColB'),
      opacity: uniform('uOpacity'),
    };
    gl.uniform3fv(u.colB, BONE);

    let width = 0;
    let height = 0;
    let narrow = false;
    let dpr = 1;
    let bound = -1;
    let lastAccent = '';
    let burst = 0;
    /** Scroll positions where each shape is fully formed (`at`) and where it starts to leave (`leave`). */
    let keys: { at: number; leave: number }[] = [];
    const target = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0 };

    motion.onMeasure(() => {
      dpr = Math.min(devicePixelRatio || 1, 1.75);
      width = Math.round(canvas.clientWidth * dpr);
      height = Math.round(canvas.clientHeight * dpr);
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      narrow = narrowQuery.matches;

      keys = STAGES.map(({ id }, index) => {
        const el = doc.getElementById(id);
        if (!el) return { at: Infinity, leave: Infinity };
        const top = el.getBoundingClientRect().top + scrollY;
        const at = index === 0 ? 0 : top - innerHeight * 0.25;
        return { at, leave: Math.max(at, top + el.offsetHeight - innerHeight * 1.15) };
      });
    });

    addEventListener(
      'pointermove',
      (event) => {
        target.x = (event.clientX / innerWidth) * 2 - 1;
        target.y = 1 - (event.clientY / innerHeight) * 2;
      },
      { passive: true },
    );

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    motion.onFrame((f) => {
      if (!width || doc.hidden) return;

      const accent = this.theme.palette().accent;
      if (accent !== lastAccent) {
        lastAccent = accent;
        gl.uniform3fv(u.colA, hexToRgb(accent));
      }

      // Which two shapes are we between, and how far along?
      let from = 0;
      for (let i = 0; i < keys.length; i++) if (f.scroll >= keys[i].at) from = i;
      const to = Math.min(from + 1, keys.length - 1);
      const span = keys[to].at - keys[from].leave;
      const raw = to === from || span <= 0 ? 0 : clamp((f.scroll - keys[from].leave) / span);
      const t = raw * raw * (3 - 2 * raw);

      const pair = from * 10 + to;
      if (pair !== bound) {
        bound = pair;
        gl.bindBuffer(gl.ARRAY_BUFFER, shapes[from]);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, shapes[to]);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
      }

      const a = STAGES[from];
      const b = STAGES[to];
      const pick = (s: Staging) => (narrow ? { ...s, ...s.narrow } : s);
      const sa = pick(a);
      const sb = pick(b);
      const aspect = width / height;

      const k = 1 - Math.pow(0.92, f.dt / 16.7);
      mouse.x += (target.x - mouse.x) * k;
      mouse.y += (target.y - mouse.y) * k;
      burst += (Math.min(Math.abs(f.velocity) / 60, 1) - burst) * 0.08;

      const time = motion.reduced ? 0 : f.time / 1000;
      const angle = (time * 0.16) % TAU;
      gl.uniform1f(u.mix, raw);
      gl.uniform1f(u.time, time);
      gl.uniform1f(u.aspect, aspect);
      gl.uniform1f(u.scale, lerp(sa.scale, sb.scale, t));
      gl.uniform1f(u.size, (narrow ? 1.7 : 2.1) * dpr);
      gl.uniform1f(u.burst, motion.reduced ? 0 : burst);
      gl.uniform1f(u.wave, motion.reduced ? 0 : lerp(a.wave, b.wave, t));
      gl.uniform2f(u.offset, lerp(sa.x, sb.x, t), lerp(sa.y, sb.y, t));
      const turn = (s: Staging) => (s.spin >= 1 ? angle : s.spin * Math.sin(time * 0.3));
      gl.uniform2f(u.rot, -mouse.y * 0.22 + 0.12, lerp(turn(a), turn(b), t) + mouse.x * 0.3);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform1f(u.opacity, lerp(sa.opacity, sb.opacity, t) * 0.55);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, count);
      canvas.classList.add('on');
    });
  }
}
