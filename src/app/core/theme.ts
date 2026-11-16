import { DOCUMENT, Service, computed, inject, signal } from '@angular/core';

export interface Palette {
  name: string;
  /** Accent on dark surfaces, and the background of the contact section. */
  accent: string;
  /** Darker accent that stays readable as text on the light section. */
  accentInk: string;
}

/** Every pair is checked for WCAG AA contrast against the ink and bone surfaces. */
export const palettes: readonly Palette[] = [
  { name: 'Ember', accent: '#ff5a1f', accentInk: '#b53a08' },
  { name: 'Volt', accent: '#c6f04d', accentInk: '#4d6b00' },
  { name: 'Ion', accent: '#6f8cff', accentInk: '#2f47c9' },
  { name: 'Rose', accent: '#ff6fae', accentInk: '#b0195f' },
];

const STORAGE_KEY = 'accent';

export const hexToRgb = (hex: string): [number, number, number] => {
  const value = parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
};

/** The site-wide accent colour. CSS reads it from custom properties, WebGL from the signal. */
@Service()
export class Theme {
  private readonly doc = inject(DOCUMENT);
  private readonly index = signal(0);
  readonly palette = computed(() => palettes[this.index()]);

  /** Picks up the choice the inline script in index.html already applied before paint. */
  restore(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)?.split(',')[0];
      const found = palettes.findIndex((palette) => palette.accent === saved);
      if (found > 0) this.index.set(found);
    } catch {
      // Storage can be unavailable (private mode); the default palette stands.
    }
  }

  cycle(): void {
    this.index.update((index) => (index + 1) % palettes.length);
    const { accent, accentInk } = this.palette();
    const root = this.doc.documentElement;
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-ink', accentInk);
    try {
      localStorage.setItem(STORAGE_KEY, `${accent},${accentInk}`);
    } catch {
      // Not persisted this time; the colour still changes for the session.
    }
  }
}
