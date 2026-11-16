import { Component } from '@angular/core';
import { About, Marquee } from '../sections/about';
import { Contact } from '../sections/contact';
import { Experience, Stack } from '../sections/experience';
import { Hero } from '../sections/hero';
import { Work } from '../sections/work';

@Component({
  selector: 'app-home',
  imports: [Hero, Marquee, About, Work, Experience, Stack, Contact],
  template: `
    <main id="main" tabindex="-1">
      <app-hero id="top" />
      <app-marquee />
      <app-about id="about" />
      <app-work id="work" />
      <app-experience id="experience" />
      <app-stack id="stack" />
    </main>
    <app-contact id="contact" />
  `,
})
export class Home {}
