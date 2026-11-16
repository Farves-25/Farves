import {
  Component,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Motion, clamp } from '../core/motion';
import { Theme } from '../core/theme';
import { profile } from '../data/content';
import { Terrain } from '../ui/terrain';

const HEAVY = 800;
const LIGHT = 230;

@Component({
  selector: 'app-hero',
  imports: [Terrain],
  host: { tabindex: '-1', '[class.bare]': 'bare()' },
  template: `
    @if (!bare()) {
      <app-terrain />
    }
    <section class="inner" aria-labelledby="hero-name">
      <div class="top">
        <p class="label role"><span class="dash"></span>{{ p.role }}</p>
        <p class="label avail"><span class="pulse"></span>{{ p.availability }}</p>
      </div>

      <div class="main">
        <h1 class="sr-only" id="hero-name">{{ p.firstName }} {{ p.lastName }}</h1>
        <div class="name" #name>
          <div class="row">
            <span class="letters" aria-hidden="true">
              @for (ch of first; track $index) {
                <span class="ch" [style.--i]="$index">{{ ch }}</span>
              }
            </span>
            <button
              type="button"
              class="star"
              (click)="theme.cycle()"
              [attr.aria-label]="'Change accent colour. Current: ' + theme.palette().name"
            >
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <path
                  d="M32 2C34 20 44 30 62 32 44 34 34 44 32 62 30 44 20 34 2 32 20 30 30 20 32 2Z"
                />
              </svg>
            </button>
          </div>
          <div class="row">
            <span class="letters" aria-hidden="true">
              @for (ch of last; track $index) {
                <span class="ch" [style.--i]="$index + first.length">{{ ch }}</span>
              }
            </span>
          </div>
        </div>

        <div class="foot">
          <p class="lead">{{ p.lead }}</p>
          <p class="label meta">
            <span>{{ p.title }}</span>
            <span>{{ p.location }}</span>
          </p>
          <a class="label cue" href="#about">
            Scroll
            <span class="track"><span></span></span>
          </a>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      min-height: 100svh;
      overflow: clip;
      background:
        radial-gradient(
          60% 50% at 70% 30%,
          color-mix(in srgb, var(--accent) 14%, transparent),
          transparent 70%
        ),
        var(--ink);
    }

    :host(.bare) {
      background: none;
    }

    .inner {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 100svh;
      padding: calc(var(--nav-h) + 1.5rem) var(--gutter) clamp(1.25rem, 2.5vw, 2rem);
      transform: translate3d(0, calc(var(--hp, 0) * 22svh), 0);
      opacity: calc(1 - var(--hp, 0) * 1.15);
    }

    .top {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.75rem 2rem;
    }

    .top .label {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--bone);
    }

    .dash {
      width: 1.75rem;
      height: 1px;
      background: var(--accent);
    }

    .name {
      font-size: min(20.6vw, 34svh);
      font-weight: 800;
      font-stretch: 75%;
      line-height: 0.79;
      letter-spacing: -0.04em;
      text-transform: uppercase;
      margin-left: -0.035em;
      user-select: none;
    }

    .row {
      display: flex;
      white-space: nowrap;
    }

    .letters {
      display: block;
      overflow: hidden;
      padding-top: 0.05em;
    }

    .ch {
      display: inline-block;
    }

    .star {
      align-self: flex-start;
      width: 0.36em;
      height: 0.36em;
      margin: 0.02em 0 0 0.07em;
      border-radius: 50%;
      transition: scale 0.6s var(--ease);
    }

    .star:hover {
      scale: 1.18;
    }

    .star:active {
      scale: 0.86;
    }

    .star svg {
      display: block;
      width: 100%;
      height: 100%;
      fill: var(--accent);
      transition: fill 0.5s;
    }

    .foot {
      display: grid;
      gap: 1.25rem;
      margin-top: clamp(1.25rem, 2.6vw, 2.5rem);
      padding-top: clamp(1rem, 1.6vw, 1.5rem);
      border-top: 1px solid var(--rule);
    }

    .lead {
      max-width: 27ch;
      font-size: clamp(1.25rem, 1.75vw, 1.85rem);
      font-stretch: 90%;
      line-height: 1.22;
      letter-spacing: -0.015em;
      text-wrap: balance;
    }

    .meta {
      display: grid;
      gap: 0.35rem;
      align-content: start;
    }

    .cue {
      display: none;
      align-items: center;
      gap: 0.9rem;
      align-self: start;
      justify-self: end;
      color: var(--bone);
    }

    .track {
      position: relative;
      width: 3.5rem;
      height: 1px;
      overflow: hidden;
      background: var(--rule);
    }

    .track span {
      position: absolute;
      inset: 0;
      background: var(--accent);
    }

    @media (min-width: 800px) {
      .foot {
        grid-template-columns: 1.4fr 1fr auto;
        gap: 3rem;
      }

      .cue {
        display: inline-flex;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .ch {
        animation: rise 1.25s var(--ease) calc(var(--intro) + var(--i) * 38ms) both;
      }

      .star {
        animation: pop 1.2s var(--ease) calc(var(--intro) + 0.55s) both;
      }

      .star svg {
        animation: spin 14s linear infinite;
      }

      .top,
      .foot {
        animation: fade 1.4s var(--ease) calc(var(--intro) + 0.65s) both;
      }

      .track span {
        animation: sweep 2.2s var(--ease-io) infinite;
      }
    }

    @keyframes rise {
      from {
        transform: translate3d(0, 112%, 0) rotate(7deg);
      }
    }

    @keyframes pop {
      from {
        scale: 0;
      }
    }

    @keyframes spin {
      to {
        rotate: 360deg;
      }
    }

    @keyframes fade {
      from {
        opacity: 0;
        transform: translate3d(0, 1.5rem, 0);
      }
    }

    @keyframes sweep {
      0% {
        transform: translate3d(-101%, 0, 0);
      }
      50% {
        transform: none;
      }
      100% {
        transform: translate3d(101%, 0, 0);
      }
    }
  `,
})
export class Hero {
  /** Render without the built-in terrain map (a page-level scene takes its place). */
  readonly bare = input(false, { transform: booleanAttribute });
  protected readonly p = profile;
  protected readonly theme = inject(Theme);
  protected readonly first = [...profile.firstName];
  protected readonly last = [...profile.lastName];
  private readonly name = viewChild.required<ElementRef<HTMLElement>>('name');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(Motion);

    afterNextRender(() => {
      if (motion.reduced) return;
      motion.observe(host, (box, f) => {
        host.style.setProperty('--hp', clamp((f.scroll - box.top) / box.height).toFixed(4));
      });
      if (motion.finePointer) this.carve(host, motion);
    });
  }

  /**
   * The pointer carves the name: letters near it thin out along the variable font's
   * weight axis and swell back as it moves away.
   */
  private carve(host: HTMLElement, motion: Motion): void {
    let name = this.name().nativeElement;
    let letters: { el: HTMLElement; x: number; y: number; weight: number; applied: number }[] = [];
    let radius = 1;
    let active = false;
    let settled = true;
    let px = 0;
    let py = 0;

    const measure = () => {
      // offset* ignores transforms, so this is safe while the intro is still animating.
      for (const letter of letters) {
        letter.x = letter.el.offsetLeft + letter.el.offsetWidth / 2 - name.offsetLeft;
        letter.y = letter.el.offsetTop + letter.el.offsetHeight / 2 - name.offsetTop;
      }
      radius = parseFloat(getComputedStyle(name).fontSize) * 0.62;
    };

    /**
     * (Re)collects the letter elements. The template can be re-rendered underneath us
     * (hot reload during development), which would otherwise leave us animating
     * detached nodes while the visible ones sit still.
     */
    const collect = () => {
      name = host.querySelector<HTMLElement>('.name') ?? name;
      letters = Array.from(name.querySelectorAll<HTMLElement>('.ch')).map((el) => ({
        el,
        x: 0,
        y: 0,
        weight: HEAVY,
        applied: HEAVY,
      }));
      measure();
    };
    collect();
    motion.onMeasure(measure);

    host.addEventListener(
      'pointermove',
      (event) => {
        if (!name.isConnected) collect();
        const rect = name.getBoundingClientRect();
        px = event.clientX - rect.left;
        py = event.clientY - rect.top;
        active = true;
        settled = false;
      },
      { passive: true },
    );
    host.addEventListener('pointerleave', () => {
      active = false;
      settled = false;
    });

    motion.onFrame((f) => {
      if (settled) return;
      const k = 1 - Math.pow(0.86, f.dt / 16.7);
      let moving = false;
      for (const letter of letters) {
        const dx = letter.x - px;
        const dy = letter.y - py;
        const near = active ? Math.exp(-(dx * dx + dy * dy) / (radius * radius)) : 0;
        letter.weight += (HEAVY - (HEAVY - LIGHT) * near - letter.weight) * k;
        const rounded = Math.round(letter.weight / 4) * 4;
        if (rounded !== letter.applied) {
          letter.applied = rounded;
          letter.el.style.fontWeight = `${rounded}`;
          moving = true;
        }
      }
      if (!moving && !active) settled = true;
    });
  }
}
