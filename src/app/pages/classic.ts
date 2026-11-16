import { Title } from '@angular/platform-browser';
import { Component, afterNextRender, inject } from '@angular/core';
import { Theme } from '../core/theme';
import { CommandMenu, Hud } from '../ui/command-menu';
import { Cursor, Nav, Preloader } from '../ui/shell';
import { Home } from './home';

/** The first design (dark, terrain map). Served at /v1. */
@Component({
  selector: 'app-classic',
  imports: [Preloader, Nav, Cursor, CommandMenu, Hud, Home],
  template: `
    <app-preloader />
    <app-nav />
    <app-home />
    <app-hud />
    <app-command-menu />
    <app-cursor />
    <div class="grain" aria-hidden="true"></div>
  `,
  styles: `
    .grain {
      position: fixed;
      inset: 0;
      z-index: 80;
      pointer-events: none;
      opacity: 0.07;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .9 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }
  `,
})
export class Classic {
  constructor() {
    const theme = inject(Theme);
    inject(Title).setTitle('Farves Safiyudeen — Angular Frontend Engineer');
    afterNextRender(() => theme.restore());
  }
}
