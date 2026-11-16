import {
  Component,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reveal, Scramble, Tilt } from '../core/directives';
import { Box, Motion, clamp } from '../core/motion';
import { projects } from '../data/content';

/**
 * Project gallery. On wide screens the section pins and vertical scroll drives the
 * track sideways; on small screens (or with reduced motion) it is a native swipe rail.
 */
@Component({
  selector: 'app-work',
  imports: [Reveal, Scramble, Tilt, RouterLink],
  host: { tabindex: '-1' },
  template: `
    <section class="pin" aria-labelledby="work-title">
      <header class="head">
        <div>
          <p class="label" appReveal appScramble>(02) — Selected work</p>
          <h2 class="title lines" id="work-title" appReveal>
            <span class="line"><span>Selected <em>work</em></span></span>
          </h2>
        </div>
        <div class="aside" appReveal="150">
          <p class="label count" aria-hidden="true">
            <span class="now">0{{ active() }}</span> / 0{{ projects.length }}
          </p>
          <p class="note">Sample projects for now — open one to see the case-study layout.</p>
        </div>
      </header>

      <div class="rail" #rail tabindex="0" role="group" aria-label="Projects">
        <ul class="track" #track>
          @for (project of projects; track project.name) {
            <li class="card">
              <article>
                <a class="open" [routerLink]="['/work', project.slug]" data-cursor="View">
                <div
                  class="poster"
                  appTilt
                  [style.--a]="project.palette[0]"
                  [style.--b]="project.palette[1]"
                >
                  <div class="art" aria-hidden="true">
                    <span class="numeral">0{{ $index + 1 }}</span>
                    <div class="window">
                      <div class="chrome"><i></i><i></i><i></i></div>
                      <div class="screen">
                        <div class="side"><b></b><b></b><b></b><b></b></div>
                        <div class="pane">
                          <div class="chart">
                            <s></s><s></s><s></s><s></s><s></s><s></s><s></s><s></s>
                          </div>
                          <div class="rows"><u></u><u></u><u></u></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span class="label badge">Sample case study</span>
                </div>
                <div class="meta">
                  <h3>{{ project.name }}</h3>
                  <p class="label">{{ project.kind }} · {{ project.year }}</p>
                </div>
                </a>
                <p class="blurb">{{ project.blurb }}</p>
                <ul class="tags" aria-label="Technologies">
                  @for (tag of project.tags; track tag) {
                    <li class="label">{{ tag }}</li>
                  }
                </ul>
              </article>
            </li>
          }
          <li class="card next">
            <a href="#contact" data-cursor="Talk">
              <span class="label">Next up</span>
              <span class="pitch">Your product <em>could be</em> card number five.</span>
              <span class="label go">Start a conversation →</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="progress" aria-hidden="true"><span #bar></span></div>
    </section>
  `,
  styles: `
    :host {
      display: block;
      padding-block: clamp(4rem, 8vw, 8rem);
    }

    .pin {
      display: flex;
      flex-direction: column;
      gap: clamp(2rem, 4vw, 3.5rem);
    }

    .head {
      display: grid;
      gap: 1.5rem;
      padding-inline: var(--gutter);
    }

    .title {
      margin-top: 1rem;
      font-size: clamp(2.9rem, 7vw, 7rem);
      font-weight: 700;
      font-stretch: 80%;
      line-height: 0.9;
      letter-spacing: -0.045em;
    }

    .title em {
      color: var(--accent);
    }

    .aside {
      display: grid;
      gap: 0.6rem;
      align-content: end;
    }

    .count {
      display: none;
    }

    .now {
      color: var(--accent);
    }

    .note {
      max-width: 30ch;
      color: var(--mute);
      font-size: 0.95rem;
    }

    .rail {
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
    }

    .rail::-webkit-scrollbar {
      display: none;
    }

    .track {
      display: flex;
      gap: clamp(1rem, 2.5vw, 2.5rem);
      width: max-content;
      padding-inline: var(--gutter);
      will-change: transform;
    }

    .card {
      width: min(82vw, 30rem);
      scroll-snap-align: center;
    }

    article {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;
    }

    .open {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 1rem;
      min-height: 0;
      border-radius: 1.25rem;
    }

    .open h3 {
      transition: color 0.3s;
    }

    .open:hover h3 {
      color: var(--accent);
    }

    .poster {
      position: relative;
      flex: 1;
      min-height: 0;
      aspect-ratio: 4 / 3;
      overflow: hidden;
      border-radius: 1.25rem;
      background: var(--ink-2);
      isolation: isolate;
    }

    .art {
      position: absolute;
      inset: 0 -9%;
      display: grid;
      place-items: center;
      background:
        radial-gradient(70% 90% at 22% 12%, color-mix(in oklab, var(--a) 62%, transparent), transparent 70%),
        radial-gradient(90% 90% at 92% 100%, var(--b), transparent 72%),
        repeating-linear-gradient(90deg, rgb(255 255 255 / 0.045) 0 1px, transparent 1px 3.5rem),
        #121213;
      transform: translate3d(calc(var(--px, 0) * -7%), 0, 0) scale(1.02);
      transition: scale 1.2s var(--ease);
    }

    .poster::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(
        circle at var(--gx, 50%) var(--gy, 50%),
        rgb(255 255 255 / 0.2),
        transparent 42%
      );
      opacity: 0;
      transition: opacity 0.5s;
      pointer-events: none;
    }

    .numeral {
      position: absolute;
      right: 11%;
      bottom: -0.16em;
      font-size: clamp(9rem, 20vw, 20rem);
      font-weight: 800;
      font-stretch: 75%;
      line-height: 1;
      letter-spacing: -0.06em;
      color: var(--a);
      opacity: 0.2;
    }

    .window {
      position: relative;
      width: 58%;
      aspect-ratio: 16 / 10.5;
      display: flex;
      flex-direction: column;
      border: 1px solid rgb(255 255 255 / 0.14);
      border-radius: 0.8rem;
      background: rgb(11 11 12 / 0.88);
      box-shadow: 0 2.5rem 5rem -1.5rem rgb(0 0 0 / 0.7);
      rotate: -5deg;
      transition:
        rotate 1.2s var(--ease),
        scale 1.2s var(--ease);
    }

    .chrome {
      display: flex;
      gap: 0.35rem;
      padding: 0.6rem 0.75rem;
      border-bottom: 1px solid rgb(255 255 255 / 0.1);
    }

    .chrome i {
      width: 0.45rem;
      height: 0.45rem;
      border-radius: 50%;
      background: rgb(255 255 255 / 0.22);
    }

    .chrome i:first-child {
      background: var(--a);
    }

    .screen {
      flex: 1;
      display: grid;
      grid-template-columns: 22% 1fr;
      min-height: 0;
    }

    .side {
      display: grid;
      gap: 0.5rem;
      align-content: start;
      padding: 0.75rem;
      border-right: 1px solid rgb(255 255 255 / 0.1);
    }

    .side b {
      height: 0.4rem;
      border-radius: 99px;
      background: rgb(255 255 255 / 0.14);
    }

    .side b:first-child {
      width: 70%;
      background: var(--a);
    }

    .pane {
      display: grid;
      grid-template-rows: 1fr auto;
      gap: 0.75rem;
      padding: 0.75rem;
      min-height: 0;
    }

    .chart {
      display: flex;
      align-items: flex-end;
      gap: 6%;
      min-height: 0;
    }

    .chart s {
      flex: 1;
      height: var(--h);
      border-radius: 0.25rem 0.25rem 0 0;
      background: linear-gradient(var(--a), color-mix(in oklab, var(--a) 25%, transparent));
      transform-origin: bottom;
      transition: transform 0.9s var(--ease);
    }

    .chart s:nth-child(1) { --h: 35%; }
    .chart s:nth-child(2) { --h: 55%; }
    .chart s:nth-child(3) { --h: 42%; }
    .chart s:nth-child(4) { --h: 72%; }
    .chart s:nth-child(5) { --h: 58%; }
    .chart s:nth-child(6) { --h: 88%; }
    .chart s:nth-child(7) { --h: 66%; }
    .chart s:nth-child(8) { --h: 100%; }

    .rows {
      display: grid;
      gap: 0.4rem;
    }

    .rows u {
      height: 0.35rem;
      border-radius: 99px;
      background: rgb(255 255 255 / 0.12);
    }

    .rows u:last-child {
      width: 60%;
    }

    .badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      padding: 0.45rem 0.75rem;
      border-radius: 99px;
      background: var(--ink);
      color: var(--bone);
      font-size: 0.65rem;
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.25rem 1.5rem;
    }

    h3 {
      font-size: clamp(1.8rem, 3vw, 3rem);
      font-weight: 700;
      font-stretch: 80%;
      line-height: 1;
      letter-spacing: -0.04em;
    }

    .blurb {
      max-width: 46ch;
      color: var(--mute);
      font-size: 0.95rem;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tags li {
      padding: 0.35rem 0.7rem;
      border: 1px solid var(--rule);
      border-radius: 99px;
      font-size: 0.65rem;
    }

    .next a {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 3rem;
      height: 100%;
      min-height: 22rem;
      padding: clamp(1.5rem, 2.5vw, 2.5rem);
      border: 1px solid var(--rule);
      border-radius: 1.25rem;
      transition:
        background-color 0.5s,
        border-color 0.5s;
    }

    .next a:hover {
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 8%, transparent);
    }

    .pitch {
      font-size: clamp(2rem, 3.6vw, 3.75rem);
      font-weight: 700;
      font-stretch: 80%;
      line-height: 0.95;
      letter-spacing: -0.04em;
    }

    .pitch em {
      color: var(--accent);
    }

    .go {
      color: var(--bone);
    }

    .progress {
      display: none;
      height: 1px;
      margin-inline: var(--gutter);
      background: var(--rule);
    }

    .progress span {
      display: block;
      height: 100%;
      background: var(--accent);
      transform: scaleX(0);
      transform-origin: left;
    }

    @media (hover: hover) {
      .card:hover .poster::after {
        opacity: 1;
      }

      .card:hover .art {
        scale: 1.05;
      }

      .card:hover .window {
        rotate: 0deg;
        scale: 1.06;
      }

      .card:hover .chart s:nth-child(odd) {
        transform: scaleY(0.72);
      }
    }

    @media (min-width: 800px) {
      .head {
        grid-template-columns: 1fr auto;
        align-items: end;
      }

      .aside {
        justify-items: end;
        text-align: right;
      }
    }

    /* Pinned horizontal mode — toggled from script when the viewport allows it. */
    :host(.pinned) {
      padding-block: 0;
    }

    :host(.pinned) .pin {
      position: sticky;
      top: 0;
      height: 100vh;
      padding-block: calc(var(--nav-h) + 0.5rem) 1.75rem;
      overflow: clip;
      gap: clamp(1.25rem, 3vh, 2.5rem);
    }

    :host(.pinned) .rail {
      flex: 1;
      min-height: 0;
      overflow: visible;
    }

    :host(.pinned) .track {
      height: 100%;
    }

    :host(.pinned) .card {
      width: clamp(30rem, 46vw, 54rem);
    }

    :host(.pinned) .poster {
      aspect-ratio: auto;
    }

    :host(.pinned) .count,
    :host(.pinned) .progress {
      display: block;
    }

    :host(.pinned) .next {
      width: clamp(22rem, 30vw, 34rem);
    }
  `,
})
export class Work {
  protected readonly projects = projects;
  protected readonly active = signal(1);
  private readonly rail = viewChild.required<ElementRef<HTMLElement>>('rail');
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly bar = viewChild.required<ElementRef<HTMLElement>>('bar');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(Motion);

    afterNextRender(() => {
      const track = this.track().nativeElement;
      const bar = this.bar().nativeElement;
      const cards = Array.from(track.querySelectorAll<HTMLElement>('.card'));
      const wide = matchMedia('(min-width: 900px) and (min-height: 560px)');
      let pinned = false;
      let distance = 0;
      let centers: number[] = [];
      let lastBox: Box | undefined;

      motion.onMeasure(() => {
        pinned = wide.matches && !motion.reduced;
        host.classList.toggle('pinned', pinned);
        if (!pinned) {
          host.style.height = '';
          track.style.transform = '';
          return;
        }
        distance = Math.max(0, track.offsetWidth - innerWidth);
        host.style.height = `${innerHeight + distance}px`;
        centers = cards.map((card) => card.offsetLeft + card.offsetWidth / 2);
      });

      motion.observe(host, (box, f) => {
        lastBox = box;
        if (!pinned) return;
        const p = clamp((f.scroll - box.top) / Math.max(1, box.height - f.vh));
        const x = -p * distance;
        track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
        bar.style.transform = `scaleX(${p.toFixed(4)})`;

        let nearest = 0;
        let best = Infinity;
        centers.forEach((center, index) => {
          const offset = (center + x - f.vw / 2) / f.vw;
          cards[index].style.setProperty('--px', offset.toFixed(4));
          if (index < this.projects.length && Math.abs(offset) < best) {
            best = Math.abs(offset);
            nearest = index;
          }
        });
        if (this.active() !== nearest + 1) this.active.set(nearest + 1);
      });

      // Keyboard focus inside the pinned track: scroll the page so the card is on screen.
      track.addEventListener('focusin', (event) => {
        if (!pinned || !lastBox) return;
        const target = event.target as HTMLElement;
        const card = target.closest<HTMLElement>('.card');
        if (!card || !target.matches(':focus-visible')) return;
        this.rail().nativeElement.scrollLeft = 0;
        const x = clamp(card.offsetLeft + card.offsetWidth / 2 - innerWidth / 2, 0, distance);
        motion.scrollTo(lastBox.top + (x / Math.max(1, distance)) * (lastBox.height - innerHeight));
      });
    });
  }
}
