import { Component, ElementRef, afterNextRender, inject, viewChild, viewChildren } from '@angular/core';
import { Count, Reveal, Scramble } from '../core/directives';
import { Motion, clamp } from '../core/motion';
import { manifesto, marquee, principles, stats } from '../data/content';

/** Two bands of oversized type that drift on their own and surge with scroll velocity. */
@Component({
  selector: 'app-marquee',
  host: { 'aria-hidden': 'true' },
  template: `
    @for (row of rows; track $index) {
      <div class="row" [class.outline]="$odd" #row>
        @for (copy of [0, 1]; track copy) {
          <div class="set">
            @for (word of row; track word) {
              <span>{{ word }}</span>
              <svg viewBox="0 0 64 64">
                <path
                  d="M32 2C34 20 44 30 62 32 44 34 34 44 32 62 30 44 20 34 2 32 20 30 30 20 32 2Z"
                />
              </svg>
            }
          </div>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      padding-block: clamp(3rem, 7vw, 7rem);
      overflow: clip;
      border-block: 1px solid var(--rule);
    }

    .row {
      display: flex;
      width: max-content;
      will-change: transform;
      font-size: clamp(3rem, 9.5vw, 10rem);
      font-weight: 700;
      font-stretch: 78%;
      line-height: 1.02;
      letter-spacing: -0.04em;
      text-transform: uppercase;
    }

    .set {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .outline {
      color: var(--ink);
      -webkit-text-stroke: 2px var(--dim);
      paint-order: stroke fill;
    }

    svg {
      flex-shrink: 0;
      width: 0.34em;
      height: 0.34em;
      margin-inline: 0.28em;
      fill: var(--accent);
    }
  `,
})
export class Marquee {
  protected readonly rows = [marquee.top, marquee.bottom];
  private readonly rowEls = viewChildren<ElementRef<HTMLElement>>('row');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(Motion);

    afterNextRender(() => {
      const rows = this.rowEls().map((ref, index) => ({
        el: ref.nativeElement,
        dir: index % 2 ? 1 : -1,
        span: 0,
        x: 0,
      }));
      let visible = false;
      new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(host);

      motion.onMeasure(() => {
        for (const row of rows) row.span = row.el.offsetWidth / 2;
        // Without motion, rest the two rows offset from each other.
        if (motion.reduced) rows[1]?.el.style.setProperty('transform', 'translate3d(-12%, 0, 0)');
      });
      if (motion.reduced) return;

      motion.onFrame((f) => {
        if (!visible) return;
        const speed = (0.6 + Math.min(Math.abs(f.velocity) * 0.22, 16)) * (f.dt / 16.7);
        const skew = clamp(f.velocity * 0.12, -7, 7);
        for (const row of rows) {
          if (!row.span) continue;
          row.x += speed * row.dir;
          if (row.x <= -row.span) row.x += row.span;
          if (row.x > 0) row.x -= row.span;
          row.el.style.transform = `translate3d(${row.x.toFixed(2)}px, 0, 0) skewX(${(skew * row.dir).toFixed(2)}deg)`;
        }
      });
    });
  }
}

interface Word {
  text: string;
  accent: boolean;
}

@Component({
  selector: 'app-about',
  imports: [Reveal, Count, Scramble],
  host: { tabindex: '-1' },
  template: `
    <section aria-labelledby="about-title">
      <header class="head">
        <p class="label" appReveal appScramble>(01) — About</p>
        <h2 class="sr-only" id="about-title">About</h2>
      </header>

      <p class="manifesto" #text [style.--n]="words.length">
        @for (word of words; track $index) {
          <span [class.accent]="word.accent" [style.--i]="$index">{{ word.text }} </span>
        }
      </p>

      <dl class="stats">
        @for (stat of stats; track stat.label) {
          <div class="stat" [appReveal]="$index * 90">
            <dt class="label">{{ stat.label }}</dt>
            <dd>
              <span [appCount]="stat.value" [decimals]="stat.decimals">{{ stat.value }}</span
              >{{ stat.suffix }}
            </dd>
          </div>
        }
      </dl>

      <ul class="principles">
        @for (item of principles; track item.title) {
          <li [appReveal]="$index * 110">
            <span class="label num">0{{ $index + 1 }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    :host {
      display: block;
      padding: clamp(5rem, 11vw, 11rem) var(--gutter);
    }

    section {
      display: grid;
      gap: clamp(3rem, 7vw, 7rem);
    }

    .manifesto {
      --p: 1;
      max-width: 22em;
      font-size: clamp(1.7rem, 4.3vw, 4.4rem);
      font-weight: 500;
      font-stretch: 88%;
      line-height: 1.08;
      letter-spacing: -0.03em;
    }

    .manifesto span {
      --w: clamp(0, var(--p) * (var(--n) + 6) - var(--i), 1);
      color: color-mix(in oklab, var(--bone) calc(var(--w) * 100%), var(--dim));
    }

    .manifesto .accent {
      font-family: var(--serif);
      font-style: italic;
      font-weight: 400;
      font-stretch: 100%;
      letter-spacing: -0.01em;
      color: color-mix(in oklab, var(--accent) calc(var(--w) * 100%), var(--dim));
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      border-top: 1px solid var(--rule);
    }

    .stat {
      display: grid;
      gap: 0.75rem;
      align-content: start;
      padding: clamp(1.25rem, 2.4vw, 2.25rem) 1rem clamp(1.25rem, 2.4vw, 2.25rem) 0;
      border-bottom: 1px solid var(--rule);
    }

    .stat dd {
      font-size: clamp(2.6rem, 6.4vw, 6.5rem);
      font-weight: 700;
      font-stretch: 78%;
      line-height: 0.9;
      letter-spacing: -0.045em;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .stat dt {
      order: 2;
      max-width: 20ch;
      line-height: 1.5;
    }

    .principles {
      display: grid;
      gap: 2.5rem;
    }

    .principles li {
      display: grid;
      gap: 0.75rem;
      align-content: start;
    }

    .num {
      color: var(--accent);
    }

    h3 {
      font-size: clamp(1.4rem, 2vw, 2rem);
      font-weight: 600;
      font-stretch: 88%;
      line-height: 1.1;
      letter-spacing: -0.025em;
    }

    .principles p {
      max-width: 38ch;
      color: var(--mute);
    }

    @media (min-width: 800px) {
      .stats {
        grid-template-columns: repeat(4, 1fr);
      }

      .stat:not(:first-child) {
        padding-left: clamp(1rem, 2vw, 2rem);
        border-left: 1px solid var(--rule);
      }

      .principles {
        grid-template-columns: repeat(3, 1fr);
        gap: clamp(2rem, 4vw, 4rem);
      }
    }
  `,
})
export class About {
  protected readonly stats = stats;
  protected readonly principles = principles;
  protected readonly words: Word[] = manifesto.split(' ').map((raw) => {
    const accent = raw.startsWith('_');
    return { text: accent ? raw.replaceAll('_', '') : raw, accent };
  });
  private readonly text = viewChild.required<ElementRef<HTMLElement>>('text');

  constructor() {
    const motion = inject(Motion);
    afterNextRender(() => {
      if (motion.reduced) return;
      const el = this.text().nativeElement;
      motion.observe(el, (box, f) => {
        const p = clamp((f.scroll + f.vh * 0.82 - box.top) / (box.height + f.vh * 0.3));
        el.style.setProperty('--p', p.toFixed(4));
      });
    });
  }
}
