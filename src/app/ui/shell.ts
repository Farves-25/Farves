import {
  Component,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Magnetic, Scramble } from '../core/directives';
import { Motion } from '../core/motion';
import { navLinks, profile } from '../data/content';
import { CommandMenuState } from './command-menu';

/** CSS-only intro curtain: it never waits on JavaScript, so it can't stall the page. */
@Component({
  selector: 'app-preloader',
  host: { 'aria-hidden': 'true' },
  template: `
    <div class="name">{{ name }}</div>
    <div class="count"></div>
    <div class="bar"></div>
  `,
  styles: `
    @property --pre {
      syntax: '<integer>';
      inherits: true;
      initial-value: 0;
    }

    :host {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: none;
      padding: var(--gutter);
      background: var(--bone);
      color: var(--ink);
      animation:
        count 1.15s cubic-bezier(0.65, 0, 0.2, 1) forwards,
        lift 0.95s var(--ease-io) 1.2s forwards;
    }

    .name {
      font-family: var(--mono);
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .count {
      position: absolute;
      right: var(--gutter);
      bottom: calc(var(--gutter) - 0.1em);
      font-size: clamp(6rem, 24vw, 22rem);
      font-weight: 800;
      font-stretch: 75%;
      line-height: 0.8;
      letter-spacing: -0.05em;
      font-variant-numeric: tabular-nums;
      counter-reset: pre var(--pre);
    }

    .count::after {
      content: counter(pre);
    }

    .bar {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 4px;
      background: var(--accent);
      transform-origin: left;
      animation: bar 1.15s cubic-bezier(0.65, 0, 0.2, 1) both;
    }

    @media (prefers-reduced-motion: no-preference) {
      :host {
        display: block;
      }
    }

    @keyframes count {
      to {
        --pre: 100;
      }
    }

    @keyframes bar {
      from {
        transform: scaleX(0);
      }
    }

    @keyframes lift {
      to {
        transform: translate3d(0, -100%, 0);
        visibility: hidden;
      }
    }
  `,
})
export class Preloader {
  protected readonly name = `${profile.firstName} ${profile.lastName} — Portfolio`;
}

@Component({
  selector: 'app-nav',
  imports: [Magnetic, Scramble],
  host: { '[class.away]': 'away()' },
  template: `
    <header>
      <a class="mark" href="#top" aria-label="Farves Safiyudeen, back to top">
        <span class="tag" aria-hidden="true">&lt;</span>Farves<span class="tag" aria-hidden="true"> /&gt;</span>
      </a>
      <nav aria-label="Primary">
        <ul>
          @for (link of links; track link.href) {
            <li>
              <a class="link" [href]="link.href" appScramble="hover">{{ link.label }}</a>
            </li>
          }
        </ul>
      </nav>
      <div class="end">
        <button type="button" class="menu" aria-haspopup="dialog" (click)="menu.open.set(true)">
          Menu <kbd>{{ shortcut() }}</kbd>
        </button>
        <a class="cta" href="#contact" appMagnetic="0.3">Let's talk</a>
      </div>
    </header>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0 0 auto;
      z-index: 50;
      color: #fff;
      mix-blend-mode: difference;
      transition: transform 0.7s var(--ease);
    }

    :host(.away:not(:focus-within)) {
      transform: translate3d(0, -110%, 0);
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--nav-h);
      padding-inline: var(--gutter);
      animation: drop 1.2s var(--ease) calc(var(--intro) + 0.2s) both;
    }

    .mark {
      display: inline-flex;
      align-items: baseline;
      font-family: var(--mono);
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .tag {
      opacity: 0.55;
      white-space: pre;
      transition:
        opacity 0.4s,
        translate 0.6s var(--ease);
    }

    .mark:hover .tag {
      opacity: 1;
    }

    .mark:hover .tag:first-child {
      translate: -0.2em 0;
    }

    .mark:hover .tag:last-child {
      translate: 0.2em 0;
    }

    ul {
      display: none;
      gap: clamp(1.25rem, 2.5vw, 2.5rem);
    }

    .end {
      display: flex;
      align-items: center;
      gap: clamp(0.9rem, 2vw, 1.75rem);
    }

    .menu kbd {
      display: none;
      margin-left: 0.4rem;
      padding: 0.2rem 0.4rem;
      border: 1px solid currentColor;
      border-radius: 0.3rem;
      font-size: 0.6rem;
    }

    .link,
    .menu,
    .cta {
      font-family: var(--mono);
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .link {
      position: relative;
      display: inline-block;
      padding-block: 0.5rem;
    }

    .link::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0.25rem;
      width: 100%;
      height: 1px;
      background: currentColor;
      transform: scaleX(0);
      transform-origin: right;
      transition: transform 0.6s var(--ease);
    }

    .link:hover::after,
    .link:focus-visible::after {
      transform: scaleX(1);
      transform-origin: left;
    }

    .cta {
      display: inline-block;
      padding: 0.7rem 1.15rem;
      border: 1px solid currentColor;
      border-radius: 99px;
      transition:
        translate 0.6s var(--ease),
        background-color 0.4s,
        color 0.4s;
    }

    .cta:hover {
      background: #fff;
      color: #000;
    }

    @media (min-width: 800px) {
      ul {
        display: flex;
      }

      .menu kbd {
        display: inline-block;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      header {
        animation: none;
      }
    }

    @keyframes drop {
      from {
        opacity: 0;
        transform: translate3d(0, -100%, 0);
      }
    }
  `,
})
export class Nav {
  protected readonly links = navLinks;
  protected readonly away = signal(false);
  protected readonly menu = inject(CommandMenuState);
  protected readonly shortcut = signal('Ctrl K');

  constructor() {
    const motion = inject(Motion);
    afterNextRender(() => {
      if (/mac|iphone|ipad/i.test(navigator.userAgent)) this.shortcut.set('⌘ K');
      motion.onFrame((f) => {
        if (!f.moved) return;
        if (f.scroll < 120 || f.velocity < -1.5) this.away.set(false);
        else if (f.velocity > 1.5) this.away.set(true);
      });
    });
  }
}

/** A trailing ring that grows over links and carries a label over `[data-cursor]`. */
@Component({
  selector: 'app-cursor',
  host: { 'aria-hidden': 'true' },
  template: `<div class="ring"><span #label></span></div>`,
  styles: `
    :host {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 90;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.4s;
      will-change: transform;
    }

    :host(.on) {
      opacity: 1;
    }

    .ring {
      display: grid;
      place-items: center;
      width: 2.5rem;
      height: 2.5rem;
      margin: -1.25rem 0 0 -1.25rem;
      border: 1px solid rgb(236 231 223 / 0.55);
      border-radius: 50%;
      transition:
        scale 0.5s var(--ease),
        background-color 0.3s,
        border-color 0.3s;
    }

    span {
      font-family: var(--mono);
      font-size: 0.5rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--ink);
      opacity: 0;
      transition: opacity 0.3s;
    }

    :host(.link) .ring {
      scale: 1.7;
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 12%, transparent);
    }

    :host(.tag) .ring {
      scale: 2.6;
      border-color: var(--accent);
      background: var(--accent);
    }

    :host(.tag) span {
      opacity: 1;
    }
  `,
})
export class Cursor {
  private readonly label = viewChild.required<ElementRef<HTMLElement>>('label');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(Motion);

    afterNextRender(() => {
      if (!motion.finePointer || motion.reduced) return;
      const label = this.label().nativeElement;
      let tx = 0;
      let ty = 0;
      let x = 0;
      let y = 0;
      let seen = false;
      const place = () =>
        (host.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`);

      addEventListener(
        'pointermove',
        (event) => {
          tx = event.clientX;
          ty = event.clientY;
          if (!seen) {
            seen = true;
            x = tx;
            y = ty;
            place();
            host.classList.add('on');
          }
        },
        { passive: true },
      );

      addEventListener(
        'pointerover',
        (event) => {
          const target = event.target as Element | null;
          const tagged = target?.closest<HTMLElement>('[data-cursor]');
          const link = !tagged && !!target?.closest('a, button');
          if (tagged) label.textContent = tagged.dataset['cursor'] ?? '';
          host.classList.toggle('tag', !!tagged);
          host.classList.toggle('link', link);
        },
        { passive: true },
      );

      document.documentElement.addEventListener('pointerleave', () => {
        seen = false;
        host.classList.remove('on');
      });

      motion.onFrame((f) => {
        if (!seen) return;
        const k = 1 - Math.pow(0.82, f.dt / 16.7);
        const dx = tx - x;
        const dy = ty - y;
        if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) return;
        x += dx * k;
        y += dy * k;
        place();
      });
    });
  }
}

