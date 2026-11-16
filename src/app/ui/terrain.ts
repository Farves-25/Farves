import { Component, ElementRef, afterNextRender, inject, input, viewChild } from '@angular/core';
import { Motion, clamp } from '../core/motion';
import { Theme, hexToRgb } from '../core/theme';

const VERTEX = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

/**
 * A living topographic map: contour lines of a slowly drifting noise field.
 * The pointer raises a hill in the terrain and heats the lines around it;
 * a click or tap sends a shockwave through the landscape.
 */
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uFade;
uniform vec3 uBg;
uniform vec3 uLine;
uniform vec3 uHot;
uniform float uGlow;
uniform float uGain;
uniform vec3 uRip[3];
out vec4 outColor;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
    i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float contour(float v, float width) {
  float d = abs(fract(v) - 0.5);
  float w = fwidth(v);
  return 1.0 - smoothstep(w * (width - 0.6), w * (width + 0.6), d);
}

void main() {
  vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float dist = length(p - (uMouse - 0.5) * aspect);
  float t = uTime * 0.045;

  vec2 q = p * 1.05;
  q += 0.32 * vec2(snoise(vec3(q * 0.7, t)), snoise(vec3(q * 0.7 + 9.2, t)));
  float n = snoise(vec3(q, t * 1.3)) + 0.35 * snoise(vec3(q * 2.3, t * 1.7 + 4.0));
  n += 0.6 * exp(-dist * dist * 7.0);

  // Shockwaves: an expanding ring that lifts and drops the terrain as it passes.
  float shock = 0.0;
  for (int i = 0; i < 3; i++) {
    float age = uTime - uRip[i].z;
    if (age < 0.0 || age > 4.5) continue;
    float r = length(p - (uRip[i].xy - 0.5) * aspect) - age * 0.62;
    float ring = exp(-r * r * 26.0) * exp(-age * 0.9);
    n += 0.55 * sin(r * 24.0) * ring;
    shock += ring;
  }

  float v = n * 5.5;
  float minor = contour(v, 0.75);
  float major = contour(v * 0.25, 1.1);

  float heat = clamp(exp(-dist * dist * 3.2) + shock * 0.8, 0.0, 1.0);
  // On the accent surface text sits right on the map, so the pointer heats it far less.
  heat *= 0.3 + 0.7 * uGlow;
  vec3 lineColor = mix(uLine, uHot, clamp(heat * 1.5, 0.0, 1.0));
  float strength = (minor * (0.11 + 0.5 * heat) + major * (0.26 + 0.6 * heat)) * uGain;

  vec3 color = uBg + uHot * uGlow * (0.085 * heat + 0.05 * smoothstep(0.2, 1.4, n));
  color = mix(color, lineColor, clamp(strength, 0.0, 1.0));

  // Keep the lower third calm so the headline stays crisp.
  float uvY = gl_FragCoord.y / uRes.y;
  color = mix(uBg, color, mix(0.5, 1.0, smoothstep(0.0, 0.65, uvY)) * uFade);
  outColor = vec4(color, 1.0);
}`;

const INK: [number, number, number] = [0.043, 0.043, 0.047];
const BONE: [number, number, number] = [0.925, 0.906, 0.875];

/** Fills its (positioned) parent with the interactive contour map. */
@Component({
  selector: 'app-terrain',
  host: { 'aria-hidden': 'true' },
  template: `<canvas #canvas></canvas>`,
  styles: `
    :host {
      position: absolute;
      inset: 0;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 1.8s ease;
    }

    canvas.on {
      opacity: 1;
    }
  `,
})
export class Terrain {
  /** `dark`: bone lines on ink, heated by the accent. `accent`: ink lines on the accent. */
  readonly tone = input<'dark' | 'accent'>('dark');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly theme = inject(Theme);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(Motion);
    afterNextRender(() => this.paint(host, motion));
  }

  private paint(host: HTMLElement, motion: Motion): void {
    const surface = host.parentElement;
    const canvas = this.canvas().nativeElement;
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    if (!gl || !surface) return;

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
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // One oversized triangle covers the viewport with no diagonal seam.
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const u = {
      res: uniform('uRes'),
      time: uniform('uTime'),
      mouse: uniform('uMouse'),
      fade: uniform('uFade'),
      bg: uniform('uBg'),
      line: uniform('uLine'),
      hot: uniform('uHot'),
      glow: uniform('uGlow'),
      gain: uniform('uGain'),
      rip: uniform('uRip'),
    };

    const onAccent = this.tone() === 'accent';
    let width = 0;
    let height = 0;
    let visible = false;
    let fade = 1;
    let lastAccent = '';
    let redraw = true;
    const target = { x: 0.72, y: 0.62 };
    const mouse = { ...target };
    // Start at a random point in time so every visit draws a different map.
    const seed = Math.random() * 600;
    let now = seed;
    const ripples = new Float32Array(9).fill(-100);
    let nextRipple = 0;

    motion.onMeasure(() => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      width = Math.round(canvas.clientWidth * dpr);
      height = Math.round(canvas.clientHeight * dpr);
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      redraw = true;
    });

    motion.observe(surface, (box, f) => {
      fade = 1 - clamp((f.scroll - box.top) / box.height) * 0.6;
    });

    new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(host);

    const locate = (event: PointerEvent) => {
      const rect = surface.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) / rect.width,
        y: 1 - (event.clientY - rect.top) / rect.height,
      };
    };
    surface.addEventListener('pointermove', (event) => Object.assign(target, locate(event)), {
      passive: true,
    });
    if (!motion.reduced) {
      surface.addEventListener(
        'pointerdown',
        (event) => {
          const { x, y } = locate(event);
          ripples.set([x, y, now], nextRipple * 3);
          nextRipple = (nextRipple + 1) % 3;
        },
        { passive: true },
      );
    }

    motion.onFrame((f) => {
      if (!visible || !width || document.hidden) return;
      const accent = this.theme.palette().accent;
      if (accent !== lastAccent) {
        lastAccent = accent;
        redraw = true;
        const rgb = hexToRgb(accent);
        gl.uniform3fv(u.bg, onAccent ? rgb : INK);
        gl.uniform3fv(u.line, onAccent ? INK : BONE);
        gl.uniform3fv(u.hot, onAccent ? INK : rgb);
        gl.uniform1f(u.glow, onAccent ? 0 : 1);
        gl.uniform1f(u.gain, onAccent ? 0.34 : 1);
      }
      // Without motion the map is a still image, redrawn only when it has to change.
      if (motion.reduced && !redraw) return;
      redraw = false;

      if (!motion.reduced) now = seed + f.time / 1000;
      const k = 1 - Math.pow(0.93, f.dt / 16.7);
      mouse.x += (target.x - mouse.x) * k;
      mouse.y += (target.y - mouse.y) * k;
      gl.uniform2f(u.res, width, height);
      gl.uniform1f(u.time, now);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform1f(u.fade, fade);
      gl.uniform3fv(u.rip, ripples);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add('on');
    });
  }
}
