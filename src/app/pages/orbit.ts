import { Title } from '@angular/platform-browser';
import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { Magnetic, Reveal, Scramble } from '../core/directives';
import { Motion } from '../core/motion';
import { Theme } from '../core/theme';
import { briefOptions, profile } from '../data/content';
import { About, Marquee } from '../sections/about';
import { Experience, Stack } from '../sections/experience';
import { Hero } from '../sections/hero';
import { Work } from '../sections/work';
import { CommandMenu, Hud } from '../ui/command-menu';
import { Particles } from '../ui/particles';
import { Cursor, Nav, Preloader } from '../ui/shell';

const joinList = (items: readonly string[]) =>
  items.length < 2
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

/** Closing section: the particles spell a greeting above the call to action. */
@Component({
  selector: 'app-finale',
  imports: [Reveal, Scramble, Magnetic],
  host: { tabindex: '-1' },
  template: `
    <footer>
      <section aria-labelledby="finale-title">
        <p class="label" appReveal appScramble>(05) — Contact</p>
        <h2 class="headline lines" id="finale-title" appReveal>
          <span class="line"><span>Let's build something <em>great.</em></span></span>
        </h2>

        <div class="brief" appReveal="100">
          <p class="label" id="finale-brief">Skip the blank page — what are you looking for?</p>
          <ul class="chips" aria-labelledby="finale-brief">
            @for (option of options; track option) {
              <li>
                <button
                  type="button"
                  class="chip"
                  [attr.aria-pressed]="picked().includes(option)"
                  (click)="toggle(option)"
                >
                  {{ option }}
                </button>
              </li>
            }
          </ul>
          <p class="draft" aria-live="polite">“{{ draft() }}”</p>
        </div>

        <div class="actions" appReveal="180">
          <a class="mail" [href]="mailto()" appMagnetic="0.2" data-cursor="Send">
            <span>{{ picked().length ? 'Send this brief' : p.email }}</span>
            <span aria-hidden="true">↗</span>
          </a>
          <button type="button" class="label link" (click)="copy()">
            {{ copied() ? 'Copied to clipboard' : 'Copy email address' }}
          </button>
          <span class="sr-only" aria-live="polite">{{ copied() ? 'Email address copied' : '' }}</span>
        </div>
      </section>

      <div class="base">
        <ul class="socials">
          @for (social of p.socials; track social.href) {
            <li>
              <a class="label link" [href]="social.href" target="_blank" rel="noopener noreferrer">
                {{ social.label }}<span class="sr-only"> (opens in a new tab)</span>
                <span aria-hidden="true"> ↗</span>
              </a>
            </li>
          }
        </ul>
        <button type="button" class="label link" (click)="theme.cycle()">
          Accent: {{ theme.palette().name }}<span class="sr-only"> — change colour</span>
          <span aria-hidden="true"> ⟳</span>
        </button>
        <p class="label">{{ p.location }}</p>
        <p class="label">© 2026 {{ p.firstName }} {{ p.lastName }}</p>
        <a class="label link" href="#top">Back to top ↑</a>
      </div>
    </footer>
  `,
  styles: `
    :host {
      position: relative;
      z-index: 1;
      display: block;
    }

    footer {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      min-height: 100svh;
      /* The upper half of the screen belongs to the particle word. */
      padding-top: 46svh;
    }

    section {
      display: grid;
      gap: clamp(1rem, 2.2vh, 1.75rem);
      justify-items: center;
      padding: 0 var(--gutter) clamp(1.5rem, 3vh, 2.5rem);
      text-align: center;
    }

    .label {
      color: var(--bone);
    }

    .headline {
      font-size: clamp(2.4rem, 6.2vw, 6rem);
      font-weight: 800;
      font-stretch: 75%;
      line-height: 0.9;
      letter-spacing: -0.045em;
      text-wrap: balance;
    }

    .headline em {
      color: var(--accent);
      letter-spacing: -0.03em;
    }

    .brief {
      display: grid;
      gap: 0.9rem;
      justify-items: center;
      max-width: 52rem;
    }

    .brief .label {
      color: var(--mute);
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.45rem;
    }

    .chip {
      padding: 0.5rem 0.95rem;
      border: 1px solid var(--rule);
      border-radius: 99px;
      background: rgb(11 11 12 / 0.6);
      font-size: 0.92rem;
      font-weight: 500;
      transition:
        background-color 0.3s,
        border-color 0.3s,
        color 0.3s,
        scale 0.5s var(--ease);
    }

    .chip:hover {
      border-color: var(--accent);
    }

    .chip:active {
      scale: 0.94;
    }

    .chip[aria-pressed='true'] {
      border-color: var(--accent);
      background: var(--accent);
      color: var(--ink);
    }

    .draft {
      min-height: 1.3em;
      font-family: var(--serif);
      font-style: italic;
      font-size: clamp(1.15rem, 1.7vw, 1.6rem);
      line-height: 1.2;
      color: var(--mute);
      text-wrap: balance;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 1rem 2rem;
    }

    .mail {
      display: inline-flex;
      align-items: center;
      gap: 0.9rem;
      max-width: 100%;
      padding: clamp(0.9rem, 1.3vw, 1.25rem) clamp(1.25rem, 2.2vw, 2rem);
      border-radius: 99px;
      background: var(--accent);
      color: var(--ink);
      font-size: clamp(1rem, 1.6vw, 1.5rem);
      font-weight: 700;
      font-stretch: 88%;
      letter-spacing: -0.02em;
      overflow-wrap: anywhere;
    }

    .link {
      display: inline-block;
      padding-block: 0.35rem;
      border-bottom: 1px solid transparent;
      color: var(--bone);
      transition: border-color 0.3s;
    }

    .link:hover,
    .actions .link {
      border-color: currentColor;
    }

    .base {
      display: grid;
      gap: 0.75rem;
      justify-items: start;
      padding: 1.1rem var(--gutter) 1.4rem;
      border-top: 1px solid var(--rule);
      background: rgb(11 11 12 / 0.7);
    }

    .base p {
      color: var(--mute);
    }

    .socials {
      display: flex;
      gap: 1.5rem;
    }

    @media (min-width: 900px) {
      .base {
        grid-template-columns: 1fr auto auto auto auto;
        align-items: center;
        gap: 2.25rem;
      }
    }
  `,
})
export class Finale {
  protected readonly p = profile;
  protected readonly theme = inject(Theme);
  protected readonly options = briefOptions;
  protected readonly copied = signal(false);
  protected readonly picked = signal<readonly string[]>([]);

  protected readonly draft = computed(() => {
    const picked = this.picked();
    if (!picked.length) return 'Hi Farves — pick a few and I’ll write the first line for you.';
    return `Hi Farves — we’re looking for ${joinList(picked.map((item) => item[0].toLowerCase() + item.slice(1)))}. Let’s talk.`;
  });

  protected readonly mailto = computed(() => {
    const picked = this.picked();
    if (!picked.length) return `mailto:${this.p.email}`;
    const subject = encodeURIComponent(`Opportunity: ${picked.join(', ')}`);
    const body = encodeURIComponent(
      `Hi Farves,\n\nWe're looking for:\n${picked.map((item) => `  • ${item}`).join('\n')}\n\nA bit more about the role:\n\n`,
    );
    return `mailto:${this.p.email}?subject=${subject}&body=${body}`;
  });

  protected toggle(option: string): void {
    this.picked.update((picked) =>
      picked.includes(option) ? picked.filter((item) => item !== option) : [...picked, option],
    );
  }

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.p.email);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2400);
    } catch {
      // Clipboard can be blocked; the mailto link still works.
    }
  }
}

/** The 3D edition: one particle sculpture behind every section, morphing as you scroll. */
@Component({
  selector: 'app-orbit',
  imports: [
    Particles,
    Preloader,
    Nav,
    Cursor,
    CommandMenu,
    Hud,
    Hero,
    Marquee,
    About,
    Work,
    Experience,
    Stack,
    Finale,
  ],
  template: `
    <app-particles />
    <app-preloader />
    <app-nav />
    <main id="main" tabindex="-1">
      <app-hero id="top" bare />
      <app-marquee />
      <app-about id="about" />
      <app-work id="work" />
      <app-experience id="experience" bare />
      <app-stack id="stack" bare />
    </main>
    <app-finale id="contact" />
    <app-hud />
    <app-command-menu />
    <app-cursor />
    <div class="grain" aria-hidden="true"></div>
  `,
  styles: `
    main {
      position: relative;
      z-index: 1;
    }

    .grain {
      position: fixed;
      inset: 0;
      z-index: 80;
      pointer-events: none;
      opacity: 0.06;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .9 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }
  `,
})
export class Orbit {
  constructor() {
    const theme = inject(Theme);
    inject(Title).setTitle('Farves Safiyudeen — Angular Frontend Engineer');
    const motion = inject(Motion);
    afterNextRender(() => {
      theme.restore();
      // Arriving from a case study at /#work or /#contact: land on that section.
      const hash = location.hash;
      if (/^#[a-z]+$/.test(hash)) setTimeout(() => motion.jump(hash), 80);
    });
  }
}
