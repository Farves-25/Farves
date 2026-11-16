import {
  Directive,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { Motion } from './motion';

/**
 * Adds `.in` the first time the host scrolls into view. The visual effect lives in
 * global CSS (`.rv`, `.rv.lines`), so the directive stays a one-liner in templates.
 */
@Directive({
  selector: '[appReveal]',
  host: { class: 'rv', '[style.--d]': 'delay()' },
})
export class Reveal {
  /** Delay in milliseconds. */
  readonly appReveal = input(0, { transform: numberAttribute });
  protected readonly delay = computed(() => `${this.appReveal() || 0}ms`);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(Motion);
    afterNextRender(() => motion.inView(el, () => el.classList.add('in')));
  }
}

/** Pulls the host toward the pointer while hovered. */
@Directive({
  selector: '[appMagnetic]',
  host: {
    class: 'magnetic',
    '(pointermove)': 'move($event)',
    '(pointerleave)': 'reset()',
  },
})
export class Magnetic {
  readonly appMagnetic = input(0.35, { transform: numberAttribute });
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly enabled = (() => {
    const motion = inject(Motion);
    return motion.finePointer && !motion.reduced;
  })();

  protected move(event: PointerEvent): void {
    if (!this.enabled) return;
    const rect = this.el.getBoundingClientRect();
    const strength = this.appMagnetic() || 0.35;
    const x = (event.clientX - rect.left - rect.width / 2) * strength;
    const y = (event.clientY - rect.top - rect.height / 2) * strength;
    this.el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
  }

  protected reset(): void {
    this.el.style.translate = '';
  }
}

/** Counts up from zero to the given value when scrolled into view. */
@Directive({ selector: '[appCount]' })
export class Count {
  readonly appCount = input.required<number>();
  readonly decimals = input(0);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(Motion);
    afterNextRender(() => {
      if (motion.reduced) return;
      motion.inView(el, () => {
        const text = el.firstChild;
        if (!text) return;
        const to = this.appCount();
        const decimals = this.decimals();
        const start = performance.now();
        const step = (now: number) => {
          const k = Math.min((now - start) / 1600, 1);
          text.nodeValue = (to * (1 - Math.pow(1 - k, 4))).toFixed(decimals);
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    });
  }
}

const GLYPHS = '!<>-_\/[]{}=+*^?#01';

/**
 * Decodes the host's text from noise. By default it plays once when scrolled into view;
 * `appScramble="hover"` replays it on every pointer enter. The host must contain only text.
 */
@Directive({
  selector: '[appScramble]',
  host: { '(pointerenter)': 'onEnter()' },
})
export class Scramble {
  readonly appScramble = input<'' | 'hover'>('');
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(Motion);
  private final = '';
  private running = false;

  constructor() {
    afterNextRender(() => {
      if (this.appScramble() !== 'hover') this.motion.inView(this.el, () => this.run());
    });
  }

  protected onEnter(): void {
    if (this.appScramble() === 'hover' && this.motion.finePointer) this.run();
  }

  private run(): void {
    const node = this.el.firstChild;
    if (this.running || this.motion.reduced || !node) return;
    this.final ||= node.nodeValue ?? '';
    const text = this.final;
    const start = performance.now();
    const duration = 380 + text.length * 22;
    let tick = 0;
    this.running = true;
    const step = (now: number) => {
      const done = Math.floor(Math.min((now - start) / duration, 1) * text.length);
      // Re-roll the noise every third frame so it reads as decoding, not static.
      if (tick++ % 3 === 0 || done === text.length) {
        let out = text.slice(0, done);
        for (let i = done; i < text.length; i++) {
          out += text[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        node.nodeValue = out;
      }
      if (done < text.length) requestAnimationFrame(step);
      else this.running = false;
    };
    requestAnimationFrame(step);
  }
}

/** Tilts the host in 3D toward the pointer and exposes `--gx/--gy` for a glare highlight. */
@Directive({
  selector: '[appTilt]',
  host: {
    class: 'tilt',
    '(pointermove)': 'move($event)',
    '(pointerleave)': 'reset()',
  },
})
export class Tilt {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly enabled = (() => {
    const motion = inject(Motion);
    return motion.finePointer && !motion.reduced;
  })();

  protected move(event: PointerEvent): void {
    if (!this.enabled) return;
    const rect = this.el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const style = this.el.style;
    style.setProperty('--rx', `${((0.5 - y) * 9).toFixed(2)}deg`);
    style.setProperty('--ry', `${((x - 0.5) * 11).toFixed(2)}deg`);
    style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
    style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
  }

  protected reset(): void {
    this.el.style.setProperty('--rx', '0deg');
    this.el.style.setProperty('--ry', '0deg');
  }
}
