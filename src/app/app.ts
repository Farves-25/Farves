import { Component, afterNextRender } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { profile } from './data/content';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <a class="skip" href="#main">Skip to content</a>
    <router-outlet />
  `,
  styles: `
    .skip {
      position: fixed;
      top: 0.75rem;
      left: 0.75rem;
      z-index: 200;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      background: #f2efe8;
      color: #0e0e10;
      font-weight: 600;
      transform: translate3d(0, -200%, 0);
    }

    .skip:focus-visible {
      transform: none;
    }
  `,
})
export class App {
  constructor() {
    afterNextRender(() => {
      // A note for whoever opens DevTools — usually the engineer vetting the candidate.
      console.log(
        `%c✺ Hello, fellow inspector.%c\nAngular, signals, one rAF loop, no UI libraries.\nIf you like what's under the hood: ${profile.email}`,
        'font: 700 16px/2 system-ui; color: #ff5a1f',
        'font: 12px/1.6 ui-monospace, monospace',
      );
    });
  }
}
