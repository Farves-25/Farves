import {
  Component,
  DOCUMENT,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Magnetic, Reveal, Scramble, Tilt } from '../core/directives';
import { Motion, clamp } from '../core/motion';
import { Theme } from '../core/theme';
import { profile, projects } from '../data/content';
import { Cursor } from '../ui/shell';

const pad = (n: number) => `${n}`.padStart(2, '0');

/**
 * Case-study page for one project (/work/:slug).
 * Everything it shows comes from the project's entry in data/content.ts.
 */
@Component({
  selector: 'app-project',
  imports: [RouterLink, Reveal, Scramble, Tilt, Magnetic, Cursor],
  styleUrl: './project.css',
  template: `
    <header class="bar">
      <a class="mark" routerLink="/" aria-label="Farves Safiyudeen, home">
        <span class="tag" aria-hidden="true">&lt;</span>Farves<span class="tag" aria-hidden="true"> /&gt;</span>
      </a>
      <a class="label back" routerLink="/" fragment="work"><span aria-hidden="true">← </span>All work</a>
      <a class="label cta" routerLink="/" fragment="contact" appMagnetic="0.3">Let's talk</a>
    </header>

    @if (project(); as item) {
      <main id="main" tabindex="-1" [style.--a]="item.palette[0]" [style.--b]="item.palette[1]">
        <!-- Title -->
        <section class="intro" aria-labelledby="project-title">
          <p class="label crumbs">
            <span>Case study {{ pad(index() + 1) }} / {{ pad(total) }}</span>
            <span class="flag">Sample content</span>
          </p>
          <h1 class="title" id="project-title">
            <span class="sr-only">{{ item.name }}</span>
            <span class="letters" aria-hidden="true">
              @for (ch of letters(); track $index) {
                <span class="ch" [style.--i]="$index">{{ ch }}</span>
              }
            </span>
          </h1>
          <p class="kind">{{ item.kind }}</p>

          <dl class="facts">
            <div>
              <dt class="label">Role</dt>
              <dd>{{ item.role }}</dd>
            </div>
            <div>
              <dt class="label">Timeline</dt>
              <dd>{{ item.timeline }}</dd>
            </div>
            <div>
              <dt class="label">Team</dt>
              <dd>{{ item.team }}</dd>
            </div>
            <div>
              <dt class="label">Stack</dt>
              <dd>{{ item.tags.join(' · ') }}</dd>
            </div>
          </dl>
        </section>

        <!-- Cover -->
        <div class="cover" #cover aria-hidden="true">
          <div class="art">
            <span class="numeral">{{ pad(index() + 1) }}</span>
            <div class="window">
              <div class="chrome"><i></i><i></i><i></i></div>
              <div class="screen">
                <div class="side"><b></b><b></b><b></b><b></b><b></b></div>
                <div class="pane">
                  <div class="tiles"><u></u><u></u><u></u></div>
                  <div class="chart">
                    <s></s><s></s><s></s><s></s><s></s><s></s><s></s><s></s><s></s><s></s>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Overview -->
        <section class="block" aria-labelledby="project-overview">
          <h2 class="label" id="project-overview" appReveal appScramble>(01) — Overview</h2>
          <p class="lede" appReveal="80">{{ item.overview }}</p>
        </section>

        <!-- Story -->
        <section class="block" aria-labelledby="project-challenge">
          <h2 class="label" id="project-challenge" appReveal appScramble>(02) — The challenge</h2>
          <div class="prose" appReveal="80">
            <p class="pull">{{ item.challenge }}</p>
          </div>
        </section>

        <section class="block" aria-labelledby="project-approach">
          <h2 class="label" id="project-approach" appReveal appScramble>(03) — The approach</h2>
          <ol class="steps">
            @for (step of item.approach; track step.title) {
              <li [appReveal]="$index * 90">
                <span class="label n">{{ pad($index + 1) }}</span>
                <h3>{{ step.title }}</h3>
                <p>{{ step.body }}</p>
              </li>
            }
          </ol>
        </section>

        <!-- Screens -->
        <section class="shots" aria-labelledby="project-screens">
          <h2 class="label" id="project-screens" appReveal appScramble>(04) — Screens</h2>
          <ul>
            @for (shot of item.shots; track shot) {
              <li [appReveal]="$index * 100">
                <figure>
                  <div class="frame" appTilt aria-hidden="true">
                    <div class="mock" [class]="'v' + ($index % 3)">
                      <b></b><b></b><b></b><b></b><b></b><b></b>
                    </div>
                  </div>
                  <figcaption class="label">{{ pad($index + 1) }} — {{ shot }}</figcaption>
                </figure>
              </li>
            }
          </ul>
        </section>

        <!-- Outcome -->
        <section class="block" aria-labelledby="project-outcome">
          <h2 class="label" id="project-outcome" appReveal appScramble>(05) — The outcome</h2>
          <div class="prose">
            <p class="pull" appReveal="80">{{ item.outcome }}</p>
            <dl class="results">
              @for (result of item.results; track result.label) {
                <div [appReveal]="120 + $index * 90">
                  <dt class="label">{{ result.label }}</dt>
                  <dd>{{ result.value }}</dd>
                </div>
              }
            </dl>
            <p class="label fine" appReveal="300">Figures are placeholders until the real case study lands.</p>
          </div>
        </section>

        <!-- Next -->
        <a
          class="next"
          [routerLink]="['/work', next().slug]"
          [style.--a]="next().palette[0]"
          [style.--b]="next().palette[1]"
          data-cursor="Next"
        >
          <span class="label">Next project — {{ pad(nextIndex() + 1) }} / {{ pad(total) }}</span>
          <span class="next-name">{{ next().name }} <span class="arrow" aria-hidden="true">→</span></span>
          <span class="next-kind">{{ next().kind }}</span>
        </a>
      </main>
    } @else {
      <main id="main" class="missing" tabindex="-1">
        <p class="label">404 — No such project</p>
        <h1 class="title small">Nothing here <em>yet.</em></h1>
        <a class="label cta" routerLink="/" fragment="work">Back to all work</a>
      </main>
    }

    <footer class="base">
      <p class="label">© 2026 {{ me.firstName }} {{ me.lastName }}</p>
      <a class="label" [href]="'mailto:' + me.email">{{ me.email }}</a>
      <a class="label" routerLink="/" fragment="work">All work ↑</a>
    </footer>

    <app-cursor />
  `,
})
export class Project {
  /** Bound from the route parameter. */
  readonly slug = input<string>();

  protected readonly me = profile;
  protected readonly total = projects.length;
  protected readonly pad = pad;

  protected readonly index = computed(() => projects.findIndex((p) => p.slug === this.slug()));
  protected readonly project = computed(() => projects[this.index()]);
  protected readonly letters = computed(() => [...(this.project()?.name ?? '')]);
  protected readonly nextIndex = computed(() => (Math.max(this.index(), 0) + 1) % projects.length);
  protected readonly next = computed(() => projects[this.nextIndex()]);

  private readonly cover = viewChild<ElementRef<HTMLElement>>('cover');

  constructor() {
    const motion = inject(Motion);
    const title = inject(Title);
    const theme = inject(Theme);
    const doc = inject(DOCUMENT);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    // A new project (including "next project" on the same page) starts from the top.
    effect(() => {
      const item = this.project();
      title.setTitle(`${item ? item.name : 'Project'} — ${profile.firstName} ${profile.lastName}`);
      motion.jump(0);
    });

    afterNextRender(() => {
      theme.restore();
      // Coming back to the home page from here should not replay its intro curtain.
      doc.documentElement.classList.add('no-intro');
      if (motion.reduced) return;
      motion.observe(host, (_, f) => {
        const cover = this.cover()?.nativeElement;
        if (!cover) return;
        // The cover opens up from an inset card to full bleed as it rises into view.
        const p = clamp((f.scroll + f.vh - cover.offsetTop) / (f.vh * 0.9));
        cover.style.setProperty('--open', p.toFixed(4));
      });
    });
  }
}
