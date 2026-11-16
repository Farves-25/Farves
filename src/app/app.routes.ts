import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/orbit').then((m) => m.Orbit) },
  { path: 'work/:slug', loadComponent: () => import('./pages/project').then((m) => m.Project) },
  { path: 'v1', loadComponent: () => import('./pages/classic').then((m) => m.Classic) },
  { path: '**', redirectTo: '' },
];
