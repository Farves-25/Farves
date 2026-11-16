import {
  Component,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Reveal, Scramble } from '../core/directives';
import { Motion, clamp } from '../core/motion';
import { certifications, experience, stack } from '../data/content';

@Component({
  selector: 'app-experience',
  imports: [Reveal, Scramble],
  host: { tabindex: '-1', '[class.bare]': 'bare()' },
  template: `
    <section aria-labelledby="xp-title">
      <header class="head">
        <p class="label" appReveal appScramble>(03) — Experience</p>
        <h2 class="display lines" id="xp-title" appReveal>
          <span class="line"><span>Three years.</span></span>
          <span class="line"><span>One <em>promotion.</em></span></span>
          <span class="line"><span>Zero shortcuts.</span></span>
        </h2>
      </header>

      <ol class="roles" #roles>
        @for (job of jobs; track job.company) {
          <li class="role">
            <div class="when" appReveal>
              <p class="label">{{ job.period }}</p>
              @if (job.note) {
                <p class="label note">{{ job.note }}</p>
              }
            </div>
            <div class="what">
              <h3 appReveal>{{ job.role }}</h3>
              <p class="where" appReveal="60">{{ job.company }} — {{ job.place }}</p>
              <ul class="points">
                @for (point of job.points; track point) {
                  <li [appReveal]="$index * 70">{{ point }}</li>
                }
              </ul>
              <ul class="tags" aria-label="Technologies" appReveal>
                @for (tag of job.tags; track tag) {
                  <li class="label">{{ tag }}</li>
                }
              </ul>
            </div>
          </li>
        }
      </ol>
    </section>
  `,
  styles: `
    :host {
      --mute: #5a554e;
      --rule: rgb(11 11 12 / 0.16);
      --focus: var(--ink);
      position: relative;
      z-index: 1;
      display: block;
      padding: clamp(5rem, 10vw, 10rem) var(--gutter);
      border-radius: clamp(1.5rem, 3vw, 3rem) clamp(1.5rem, 3vw, 3rem) 0 0;
      background: var(--bone);
      color: var(--ink);
      transform-origin: 50% 0;
    }

    :host ::selection {
      background: var(--ink);
      color: var(--bone);
    }

    /* Dark, see-through variant for pages with a scene behind the content. */
    :host(.bare) {
      --mute: #9a958d;
      --rule: rgb(236 231 223 / 0.14);
      --focus: var(--accent);
      --accent-ink: var(--accent);
      border-radius: 0;
      background: none;
      color: var(--bone);
    }

    :host(.bare) ::selection {
      background: var(--accent);
      color: var(--ink);
    }

    :host(.bare) .note {
      background: var(--accent);
      color: var(--ink);
    }

    section {
      display: grid;
      gap: clamp(3rem, 7vw, 7rem);
    }

    .head {
      display: grid;
      gap: 1.5rem;
    }

    .display em {
      color: var(--accent-ink);
    }

    .roles {
      --lp: 1;
      position: relative;
      display: grid;
    }

    .roles::before,
    .roles::after {
      content: '';
      position: absolute;
      inset: 0 auto 0 0;
      width: 1px;
      background: var(--rule);
    }

    .roles::after {
      width: 2px;
      margin-left: -0.5px;
      background: var(--accent-ink);
      transform: scaleY(var(--lp));
      transform-origin: top;
    }

    .role {
      display: grid;
      gap: 1.25rem;
      padding: clamp(2rem, 4vw, 4rem) 0 clamp(2rem, 4vw, 4rem) clamp(1.5rem, 3vw, 3rem);
    }

    .role + .role {
      border-top: 1px solid var(--rule);
    }

    .when {
      display: grid;
      gap: 0.6rem;
      align-content: start;
      justify-items: start;
    }

    .note {
      padding: 0.3rem 0.65rem;
      border-radius: 99px;
      background: var(--ink);
      color: var(--bone);
      font-size: 0.65rem;
    }

    h3 {
      font-size: clamp(2rem, 4.6vw, 4.75rem);
      font-weight: 700;
      font-stretch: 80%;
      line-height: 0.95;
      letter-spacing: -0.04em;
      text-wrap: balance;
    }

    .where {
      margin-top: 0.75rem;
      font-family: var(--serif);
      font-style: italic;
      font-size: clamp(1.3rem, 2vw, 2rem);
      line-height: 1.2;
      color: var(--accent-ink);
    }

    .points {
      display: grid;
      margin-top: clamp(1.5rem, 3vw, 2.5rem);
      border-top: 1px solid var(--rule);
    }

    .points li {
      padding-block: 1rem;
      border-bottom: 1px solid var(--rule);
      max-width: 62ch;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1.75rem;
    }

    .tags li {
      padding: 0.35rem 0.7rem;
      border: 1px solid var(--rule);
      border-radius: 99px;
      font-size: 0.65rem;
    }

    @media (min-width: 900px) {
      .role {
        grid-template-columns: minmax(12rem, 1fr) 3fr;
        gap: 3rem;
      }

      .when {
        position: sticky;
        top: calc(var(--nav-h) + 1rem);
        align-self: start;
      }
    }
  `,
})
export class Experience {
  readonly bare = input(false, { transform: booleanAttribute });
  protected readonly jobs = experience;
  private readonly roles = viewChild.required<ElementRef<HTMLElement>>('roles');

  constructor() {
    const motion = inject(Motion);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      if (motion.reduced) return;
      if (!this.bare()) motion.rise(host);
      const el = this.roles().nativeElement;
      motion.observe(el, (box, f) => {
        const p = clamp((f.scroll + f.vh * 0.6 - box.top) / box.height);
        el.style.setProperty('--lp', p.toFixed(4));
      });
    });
  }
}

@Component({
  selector: 'app-stack',
  imports: [Reveal, Scramble],
  host: { tabindex: '-1', '[class.bare]': 'bare()' },
  template: `
    <section aria-labelledby="stack-title">
      <header class="head">
        <p class="label" appReveal appScramble>(04) — Stack</p>
        <h2 class="display lines" id="stack-title" appReveal>
          <span class="line"><span>Sharp tools,</span></span>
          <span class="line"><span><em>used well.</em></span></span>
        </h2>
      </header>

      <ul class="groups">
        @for (group of groups; track group.name) {
          <li class="group" [appReveal]="$index * 60">
            <span class="label idx">0{{ $index + 1 }}</span>
            <h3>{{ group.name }}</h3>
            <p class="items">{{ group.items.join(' · ') }}</p>
          </li>
        }
      </ul>

      <div class="certs">
        <div class="certs-head" appReveal>
          <p class="label">Certified</p>
          <p class="pitch">
            AI is part of how I ship. I use Claude Code and the Claude API daily to shorten
            iteration and refactoring cycles — and I've done the coursework to do it properly.
          </p>
        </div>
        <ul class="cert-list">
          @for (cert of certs; track cert.name) {
            <li [appReveal]="$index * 80">
              <span class="cert-name">{{ cert.name }}</span>
              <span class="label">{{ cert.issuer }} · {{ cert.date }}</span>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    :host {
      position: relative;
      z-index: 1;
      display: block;
      padding: clamp(5rem, 10vw, 10rem) 0;
      background: var(--ink);
    }

    :host(.bare) {
      background: none;
    }

    section {
      display: grid;
      gap: clamp(3rem, 7vw, 7rem);
    }

    .head {
      display: grid;
      gap: 1.5rem;
      padding-inline: var(--gutter);
    }

    .groups {
      border-top: 1px solid var(--rule);
    }

    .group {
      position: relative;
      display: grid;
      gap: 0.5rem 2rem;
      align-items: baseline;
      padding: clamp(1.25rem, 2.2vw, 2rem) var(--gutter);
      border-bottom: 1px solid var(--rule);
      isolation: isolate;
    }

    .group::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      background: var(--accent);
      transform: scaleY(0);
      transform-origin: bottom;
      transition: transform 0.55s var(--ease);
    }

    h3 {
      font-size: clamp(2rem, 5vw, 5rem);
      font-weight: 700;
      font-stretch: 80%;
      line-height: 1;
      letter-spacing: -0.04em;
      transition: translate 0.55s var(--ease);
    }

    .items {
      font-family: var(--mono);
      font-size: 0.8rem;
      line-height: 1.7;
      color: var(--mute);
    }

    .idx,
    .items,
    h3 {
      transition:
        color 0.3s,
        translate 0.55s var(--ease);
    }

    @media (hover: hover) {
      .group:hover::before {
        transform: scaleY(1);
      }

      .group:hover :is(h3, .idx, .items) {
        color: var(--ink);
      }

      .group:hover h3 {
        translate: 1rem 0;
      }
    }

    .certs {
      display: grid;
      gap: 2.5rem;
      padding-inline: var(--gutter);
    }

    .certs-head {
      display: grid;
      gap: 1.25rem;
      align-content: start;
    }

    .pitch {
      max-width: 30ch;
      font-size: clamp(1.3rem, 2vw, 2rem);
      font-stretch: 90%;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }

    .cert-list {
      border-top: 1px solid var(--rule);
    }

    .cert-list li {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.35rem 2rem;
      padding-block: 1.15rem;
      border-bottom: 1px solid var(--rule);
    }

    .cert-name {
      font-size: clamp(1.1rem, 1.5vw, 1.4rem);
      font-weight: 500;
      letter-spacing: -0.01em;
    }

    @media (min-width: 900px) {
      .group {
        grid-template-columns: 4rem minmax(0, 1.1fr) minmax(0, 1fr);
      }

      .items {
        text-align: right;
      }

      .certs {
        grid-template-columns: 1fr 1.4fr;
        gap: clamp(3rem, 6vw, 6rem);
      }
    }
  `,
})
export class Stack {
  readonly bare = input(false, { transform: booleanAttribute });
  protected readonly groups = stack;
  protected readonly certs = certifications;
}
