import {
  Component,
  DOCUMENT,
  ElementRef,
  Service,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Motion } from '../core/motion';
import { Theme } from '../core/theme';
import { navLinks, profile } from '../data/content';

interface Command {
  id: string;
  group: string;
  label: string;
  hint?: string;
  run: () => void;
}

/** Shared open state so any component (nav button, keyboard shortcut) can summon the menu. */
@Service()
export class CommandMenuState {
  readonly open = signal(false);
}

/**
 * Ctrl/⌘ + K command menu. Doubles as the navigation menu on small screens.
 * Built on a native <dialog>, so focus trapping, Escape and focus return come for free.
 */
@Component({
  selector: 'app-command-menu',
  template: `
    <dialog #dialog aria-label="Command menu" (close)="state.open.set(false)" (click)="backdrop($event)">
      <div class="panel" data-lenis-prevent>
        <div class="field">
          <span class="prompt" aria-hidden="true">&gt;</span>
          <input
            #field
            type="text"
            role="combobox"
            autocomplete="off"
            spellcheck="false"
            placeholder="Where to? Type a command…"
            aria-label="Search commands"
            aria-expanded="true"
            aria-controls="command-list"
            aria-autocomplete="list"
            [attr.aria-activedescendant]="results().length ? 'command-' + results()[active()].id : null"
            [value]="query()"
            (input)="search(field.value)"
            (keydown)="keys($event)"
          />
          <kbd>Esc</kbd>
        </div>

        <ul id="command-list" role="listbox" aria-label="Commands">
          @for (command of results(); track command.id) {
            <li
              role="option"
              [id]="'command-' + command.id"
              [attr.aria-selected]="$index === active()"
              [class.active]="$index === active()"
              (pointermove)="active.set($index)"
              (click)="execute(command)"
            >
              <span class="group">{{ command.group }}</span>
              <span class="name">{{ command.label }}</span>
              @if (command.hint) {
                <span class="hint">{{ command.hint }}</span>
              }
            </li>
          } @empty {
            <li class="empty" role="option" aria-selected="false" aria-disabled="true">
              Nothing matches “{{ query() }}” — but my inbox is always open.
            </li>
          }
        </ul>

        <p class="legend" aria-hidden="true">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> run</span>
          <span><kbd>{{ shortcut() }}</kbd> toggle</span>
        </p>
      </div>
    </dialog>
  `,
  styles: `
    dialog {
      width: min(40rem, calc(100vw - 2rem));
      max-height: none;
      margin: 14vh auto auto;
      padding: 0;
      overflow: visible;
      border: 0;
      background: none;
      color: var(--bone);
    }

    dialog::backdrop {
      background: rgb(5 5 6 / 0.72);
      backdrop-filter: blur(10px);
    }

    .panel {
      overflow: hidden;
      border: 1px solid var(--rule);
      border-radius: 1.1rem;
      background: var(--ink-2);
      box-shadow: 0 2.5rem 6rem rgb(0 0 0 / 0.6);
    }

    .field {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 1.1rem 1.25rem;
      border-bottom: 1px solid var(--rule);
    }

    .prompt {
      font-family: var(--mono);
      font-weight: 700;
      color: var(--accent);
    }

    input {
      flex: 1;
      min-width: 0;
      border: 0;
      outline: 0;
      background: none;
      color: inherit;
      font: inherit;
      font-size: 1.1rem;
      letter-spacing: -0.01em;
    }

    input::placeholder {
      color: var(--mute);
      opacity: 1;
    }

    kbd {
      padding: 0.2rem 0.45rem;
      border: 1px solid var(--rule);
      border-radius: 0.35rem;
      color: var(--mute);
    }

    ul {
      max-height: min(23rem, 48vh);
      padding: 0.5rem;
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    li {
      display: grid;
      grid-template-columns: 4.5rem 1fr auto;
      align-items: baseline;
      gap: 1rem;
      padding: 0.7rem 0.85rem;
      border-radius: 0.6rem;
      cursor: pointer;
    }

    .group,
    .hint {
      font-family: var(--mono);
      font-size: 0.65rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--mute);
    }

    .name {
      font-weight: 500;
      letter-spacing: -0.01em;
    }

    li.active {
      background: var(--accent);
      color: var(--ink);
    }

    li.active :is(.group, .hint) {
      color: var(--ink);
    }

    .empty {
      display: block;
      color: var(--mute);
      cursor: default;
    }

    .legend {
      display: none;
      gap: 1.5rem;
      padding: 0.8rem 1.25rem;
      border-top: 1px solid var(--rule);
      font-family: var(--mono);
      font-size: 0.65rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--mute);
    }

    .legend span {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    kbd {
      white-space: nowrap;
    }

    @media (max-width: 600px) {
      li {
        grid-template-columns: 4.5rem 1fr;
      }

      .hint {
        display: none;
      }
    }

    @media (hover: hover) and (pointer: fine) and (min-width: 601px) {
      .legend {
        display: flex;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      dialog[open] .panel {
        animation: enter 0.5s var(--ease);
      }

      dialog[open]::backdrop {
        animation: dim 0.4s ease;
      }
    }

    @keyframes enter {
      from {
        opacity: 0;
        transform: translate3d(0, 1.25rem, 0) scale(0.97);
      }
    }

    @keyframes dim {
      from {
        opacity: 0;
      }
    }
  `,
})
export class CommandMenu {
  protected readonly state = inject(CommandMenuState);
  private readonly motion = inject(Motion);
  private readonly theme = inject(Theme);
  private readonly doc = inject(DOCUMENT);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly query = signal('');
  protected readonly active = signal(0);
  protected readonly shortcut = signal('Ctrl K');

  private readonly commands: Command[] = [
    ...navLinks.map((link) => ({
      id: link.href.slice(1),
      group: 'Go to',
      label: link.label,
      run: () => this.motion.scrollTo(link.href),
    })),
    { id: 'contact', group: 'Go to', label: 'Contact', run: () => this.motion.scrollTo('#contact') },
    { id: 'top', group: 'Go to', label: 'Back to top', run: () => this.motion.scrollTo('#top') },
    {
      id: 'email',
      group: 'Hire',
      label: 'Write me an email',
      hint: profile.email,
      run: () => this.visit(`mailto:${profile.email}`, false),
    },
    {
      id: 'copy',
      group: 'Hire',
      label: 'Copy email address',
      run: () => void navigator.clipboard?.writeText(profile.email).catch(() => undefined),
    },
    ...profile.socials.map((social) => ({
      id: social.label.toLowerCase(),
      group: 'Open',
      label: social.label,
      hint: '↗',
      run: () => this.visit(social.href, true),
    })),
    {
      id: 'accent',
      group: 'Play',
      label: 'Change accent colour',
      hint: 'Ember · Volt · Ion · Rose',
      run: () => this.theme.cycle(),
    },
  ];

  protected readonly results = computed(() => {
    const terms = this.query().toLowerCase().split(/\s+/).filter(Boolean);
    return this.commands.filter((command) => {
      const haystack = `${command.group} ${command.label} ${command.hint ?? ''}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  });

  constructor() {
    afterNextRender(() => {
      if (/mac|iphone|ipad/i.test(navigator.userAgent)) this.shortcut.set('⌘ K');
      this.doc.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return;
        event.preventDefault();
        this.state.open.update((open) => !open);
      });
    });

    effect(() => {
      const open = this.state.open();
      const dialog = this.dialog().nativeElement;
      if (typeof dialog.showModal !== 'function') return;
      if (open && !dialog.open) {
        this.query.set('');
        this.active.set(0);
        dialog.showModal();
      } else if (!open && dialog.open) {
        dialog.close();
      }
      this.motion.lock(open);
    });
  }

  protected search(value: string): void {
    this.query.set(value);
    this.active.set(0);
  }

  protected keys(event: KeyboardEvent): void {
    const count = this.results().length;
    if (!count) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      this.active.update((index) => (index + step + count) % count);
      this.doc
        .getElementById(`command-${this.results()[this.active()].id}`)
        ?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.execute(this.results()[this.active()]);
    }
  }

  protected execute(command: Command): void {
    this.dialog().nativeElement.close();
    this.state.open.set(false);
    this.motion.lock(false);
    command.run();
  }

  /** A click that lands on the dialog element itself is a click on the backdrop. */
  protected backdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.state.open.set(false);
  }

  private visit(href: string, newTab: boolean): void {
    const link = this.doc.createElement('a');
    link.href = href;
    if (newTab) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    link.click();
  }
}

const SECTIONS = [
  { id: 'top', name: 'Index' },
  { id: 'about', name: 'About' },
  { id: 'work', name: 'Work' },
  { id: 'experience', name: 'Experience' },
  { id: 'stack', name: 'Stack' },
  { id: 'contact', name: 'Contact' },
];

/** A margin note showing which section you are in and how far down the page. */
@Component({
  selector: 'app-hud',
  host: { 'aria-hidden': 'true' },
  template: `
    <span class="rule"><i #fill></i></span>
    <span #section>01 / Index</span>
    <span #percent>000</span>
  `,
  styles: `
    :host {
      position: fixed;
      top: 50%;
      right: calc(var(--gutter) / 2);
      z-index: 40;
      display: none;
      align-items: center;
      gap: 1rem;
      writing-mode: vertical-rl;
      translate: 50% -50%;
      pointer-events: none;
      color: #fff;
      mix-blend-mode: difference;
      font-family: var(--mono);
      font-size: 0.625rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      animation: show 1.2s ease calc(var(--intro) + 0.9s) both;
    }

    .rule {
      position: relative;
      width: 1px;
      height: 5rem;
      background: rgb(255 255 255 / 0.28);
    }

    .rule i {
      position: absolute;
      inset: 0;
      background: #fff;
      transform: scaleY(0);
      transform-origin: top;
    }

    @media (min-width: 1100px) and (min-height: 620px) {
      :host {
        display: flex;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host {
        animation: none;
      }
    }

    @keyframes show {
      from {
        opacity: 0;
      }
    }
  `,
})
export class Hud {
  private readonly fill = viewChild.required<ElementRef<HTMLElement>>('fill');
  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly percent = viewChild.required<ElementRef<HTMLElement>>('percent');

  constructor() {
    const motion = inject(Motion);
    const doc = inject(DOCUMENT);

    afterNextRender(() => {
      const fill = this.fill().nativeElement;
      const section = this.section().nativeElement;
      const percent = this.percent().nativeElement;
      let tops: number[] = [];
      let range = 1;
      let lastIndex = -1;
      let lastPercent = -1;

      motion.onMeasure(() => {
        // Sections live in a lazy route, so they may not exist on the very first pass.
        tops = SECTIONS.map(({ id }) => {
          const el = doc.getElementById(id);
          return el ? el.getBoundingClientRect().top + scrollY : Infinity;
        });
        range = Math.max(1, doc.documentElement.scrollHeight - innerHeight);
      });

      motion.onFrame((f) => {
        if (!f.moved) return;
        const progress = Math.min(1, Math.max(0, f.scroll / range));
        fill.style.transform = `scaleY(${progress.toFixed(4)})`;

        const rounded = Math.round(progress * 100);
        if (rounded !== lastPercent) {
          lastPercent = rounded;
          percent.textContent = `${rounded}`.padStart(3, '0');
        }

        let index = 0;
        for (let i = 0; i < tops.length; i++) if (f.scroll + f.vh * 0.5 >= tops[i]) index = i;
        if (index !== lastIndex) {
          lastIndex = index;
          section.textContent = `0${index + 1} / ${SECTIONS[index].name}`;
        }
      });
    });
  }
}
