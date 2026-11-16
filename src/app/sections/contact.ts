import { Component, ElementRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { Magnetic, Reveal, Scramble } from '../core/directives';
import { Motion } from '../core/motion';
import { Theme } from '../core/theme';
import { briefOptions, profile } from '../data/content';
import { Terrain } from '../ui/terrain';

const joinList = (items: readonly string[]) =>
  items.length < 2
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

@Component({
  selector: 'app-contact',
  imports: [Reveal, Magnetic, Scramble, Terrain],
  host: { tabindex: '-1' },
  template: `
    <footer>
      <app-terrain tone="accent" />
      <section aria-labelledby="contact-title">
        <p class="label" appReveal appScramble>(05) — Contact</p>
        <h2 class="headline lines" id="contact-title" appReveal>
          <span class="line"><span>Let's build</span></span>
          <span class="line"><span>something <em>great.</em></span></span>
        </h2>

        <div class="row">
          <div class="brief" appReveal>
            <p class="label" id="brief-label">Skip the blank page — what are you looking for?</p>
            <ul class="chips" aria-labelledby="brief-label">
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
            <p class="draft" aria-live="polite">
              <span class="quote" aria-hidden="true">“</span>{{ draft() }}<span
                class="quote"
                aria-hidden="true"
                >”</span
              >
            </p>
          </div>

          <div class="actions" appReveal="120">
            <a class="mail" [href]="mailto()" appMagnetic="0.2" data-cursor="Send">
              <span class="mail-text">{{ picked().length ? 'Send this brief' : p.email }}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 19L19 5M19 5H8M19 5v11" />
              </svg>
            </a>
            <button type="button" class="label copy" (click)="copy()">
              {{ copied() ? 'Copied to clipboard' : 'Copy email address' }}
            </button>
            <span class="sr-only" aria-live="polite">{{ copied() ? 'Email address copied' : '' }}</span>
            <p class="label status"><span class="pulse"></span>{{ p.availability }}</p>
          </div>
        </div>
      </section>

      <div class="base">
        <ul class="socials">
          @for (social of p.socials; track social.href) {
            <li>
              <a class="label" [href]="social.href" target="_blank" rel="noopener noreferrer">
                {{ social.label }}<span class="sr-only"> (opens in a new tab)</span>
                <span aria-hidden="true"> ↗</span>
              </a>
            </li>
          }
        </ul>
        <button type="button" class="label swatch" (click)="theme.cycle()">
          Accent: {{ theme.palette().name }}<span class="sr-only"> — change colour</span>
          <span aria-hidden="true"> ⟳</span>
        </button>
        <p class="label">{{ p.location }}</p>
        <p class="label">© {{ year }} {{ p.firstName }} {{ p.lastName }}</p>
        <a class="label up" href="#top">Back to top ↑</a>
      </div>
    </footer>
  `,
  styles: `
    :host {
      --focus: var(--ink);
      position: relative;
      z-index: 1;
      display: block;
      overflow: clip;
      border-radius: clamp(1.5rem, 3vw, 3rem) clamp(1.5rem, 3vw, 3rem) 0 0;
      background: var(--accent);
      color: var(--ink);
      transform-origin: 50% 0;
      transition: background-color 0.5s;
    }

    :host ::selection {
      background: var(--ink);
      color: var(--accent);
    }

    footer {
      position: relative;
    }

    .label {
      color: var(--ink);
    }

    section {
      position: relative;
      display: grid;
      gap: clamp(2rem, 4vw, 4rem);
      padding: clamp(5rem, 10vw, 10rem) var(--gutter) clamp(3rem, 6vw, 6rem);
    }

    .headline {
      font-size: clamp(3.4rem, 13.4vw, 15rem);
      font-weight: 800;
      font-stretch: 75%;
      line-height: 0.82;
      letter-spacing: -0.05em;
    }

    .headline em {
      letter-spacing: -0.03em;
    }

    .row {
      display: grid;
      gap: 3rem;
      padding-top: clamp(1.5rem, 3vw, 3rem);
      border-top: 1px solid rgb(11 11 12 / 0.3);
    }

    .brief {
      display: grid;
      gap: 1.25rem;
      align-content: start;
      max-width: 44rem;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .chip {
      padding: 0.6rem 1rem;
      border: 1px solid var(--ink);
      border-radius: 99px;
      font-size: 0.95rem;
      font-weight: 500;
      letter-spacing: -0.01em;
      transition:
        background-color 0.35s,
        color 0.35s,
        scale 0.5s var(--ease);
    }

    .chip:hover {
      background: rgb(11 11 12 / 0.12);
    }

    .chip:active {
      scale: 0.94;
    }

    .chip[aria-pressed='true'] {
      background: var(--ink);
      color: var(--bone);
    }

    .draft {
      min-height: 2.6em;
      font-family: var(--serif);
      font-style: italic;
      font-size: clamp(1.4rem, 2.3vw, 2.3rem);
      line-height: 1.15;
      text-wrap: balance;
    }

    .actions {
      display: grid;
      gap: 1.25rem;
      justify-items: start;
      align-content: start;
    }

    .mail {
      display: inline-flex;
      align-items: center;
      gap: 1rem;
      max-width: 100%;
      padding: clamp(1rem, 1.6vw, 1.5rem) clamp(1.25rem, 2.4vw, 2.25rem);
      border-radius: 99px;
      background: var(--ink);
      color: var(--bone);
      font-size: clamp(1rem, 2.1vw, 2rem);
      font-weight: 600;
      font-stretch: 88%;
      letter-spacing: -0.02em;
    }

    .mail-text {
      overflow-wrap: anywhere;
    }

    .mail svg {
      flex-shrink: 0;
      width: 1.1em;
      height: 1.1em;
      fill: none;
      stroke: var(--accent);
      stroke-width: 2;
      transition: rotate 0.6s var(--ease);
    }

    .mail:hover svg {
      rotate: 45deg;
    }

    .copy {
      padding-block: 0.4rem;
      border-bottom: 1px solid currentColor;
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .pulse {
      background: var(--ink);
    }

    .base {
      position: relative;
      display: grid;
      gap: 1rem;
      justify-items: start;
      padding: 1.5rem var(--gutter) 2rem;
      border-top: 1px solid rgb(11 11 12 / 0.3);
    }

    .socials {
      display: flex;
      gap: 1.5rem;
    }

    .base :is(a, button) {
      display: inline-block;
      padding-block: 0.35rem;
      border-bottom: 1px solid transparent;
      transition: border-color 0.3s;
    }

    .base :is(a, button):hover {
      border-color: currentColor;
    }

    @media (min-width: 900px) {
      .row {
        grid-template-columns: 1fr auto;
        align-items: start;
      }

      .actions {
        justify-items: end;
      }

      .base {
        grid-template-columns: 1fr auto auto auto auto;
        align-items: center;
        gap: 2.5rem;
      }
    }
  `,
})
export class Contact {
  protected readonly p = profile;
  protected readonly theme = inject(Theme);
  protected readonly options = briefOptions;
  protected readonly year = 2026;
  protected readonly copied = signal(false);
  protected readonly picked = signal<readonly string[]>([]);

  /** The sentence the visitor is composing, rebuilt from whichever chips are on. */
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

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(Motion);
    afterNextRender(() => motion.rise(host));
  }

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
      // Clipboard can be blocked; the mailto link above still works.
    }
  }
}
