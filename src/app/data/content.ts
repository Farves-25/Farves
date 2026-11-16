/**
 * Single source of truth for everything the site says.
 * Edit this file to update copy — no component changes needed.
 */

export const profile = {
  firstName: 'Farves',
  lastName: 'Safiyudeen',
  role: 'Angular Frontend Engineer',
  title: 'Software Engineer II',
  location: 'Karaikal, India',
  availability: 'Open to new roles — remote & relocation',
  email: 'farvessafiyudeen25@gmail.com',
  lead: 'I engineer fast, accessible Angular applications — and the systems that keep them that way.',
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/farves-safiyudeen-50300225a' },
    { label: 'GitHub', href: 'https://github.com/Farves-dev' },
  ],
} as const;

/** Chips in the contact section. Picked ones are written into the email for the visitor. */
export const briefOptions = [
  'An Angular engineer',
  'A frontend lead',
  'A design system',
  'A performance rescue',
  'An accessibility audit',
  'A legacy migration',
  'A remote teammate',
  'Someone on-site',
] as const;

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'Stack', href: '#stack' },
] as const;

export const marquee = {
  top: ['Angular', 'Signals', 'RxJS', 'NgRx', 'TypeScript', 'Micro-frontends'],
  bottom: ['Performance', 'Accessibility', 'Design systems', 'Clean architecture', 'AI-native'],
} as const;

/** Wrap a word in _underscores_ to set it in the italic serif accent. */
export const manifesto =
  "I'm an Angular engineer with 3.5+ years of shipping production software — multi-portal booking platforms, multi-tenant SaaS, and the component systems underneath them. I obsess over the things users _feel_ but _never_ _notice:_ an interface that answers instantly, a focus ring exactly where it should be, state that never lies.";

export interface Stat {
  value: number;
  decimals: number;
  suffix: string;
  label: string;
}

export const stats: readonly Stat[] = [
  { value: 3.5, decimals: 1, suffix: '+', label: 'Years building production Angular' },
  { value: 8, decimals: 0, suffix: '', label: 'Apps, portals & admin panels shipped' },
  { value: 2.1, decimals: 1, suffix: ' AA', label: 'WCAG standard every component meets' },
  { value: 4, decimals: 0, suffix: '', label: 'Anthropic AI certifications' },
];

export const principles = [
  {
    title: 'Performance is a feature',
    body: 'Signals, OnPush, lazy routes and route-level code splitting — I budget milliseconds the way designers budget pixels.',
  },
  {
    title: 'Accessible by default',
    body: 'WCAG 2.1 AA is the floor, not a ticket for later. Keyboard paths, focus management and contrast are designed in from the first commit.',
  },
  {
    title: 'Owned end to end',
    body: 'From requirements to release to post-launch monitoring. I set conventions, review code, mentor teammates — and ship.',
  },
] as const;

export interface Project {
  /** URL segment: the case study lives at /work/<slug>. */
  slug: string;
  name: string;
  kind: string;
  year: string;
  blurb: string;
  tags: readonly string[];
  /** Two poster colours. */
  palette: readonly [string, string];

  // ----- Case-study page -----
  role: string;
  timeline: string;
  team: string;
  overview: string;
  challenge: string;
  approach: readonly { title: string; body: string }[];
  /** Captions for the screen placeholders (swap the frames for real screenshots later). */
  shots: readonly string[];
  outcome: string;
  results: readonly { value: string; label: string }[];
}

/**
 * PLACEHOLDER PROJECTS — replace with real case studies.
 * Each entry renders one card in the gallery and one page at /work/<slug>.
 * All text and figures below are sample content.
 */
export const projects: readonly Project[] = [
  {
    slug: 'pulse',
    name: 'Pulse',
    kind: 'Real-time analytics dashboard',
    year: '2026',
    blurb: 'Live operational metrics streamed over WebSockets into a signal-driven dashboard.',
    tags: ['Angular', 'Signals', 'WebSockets'],
    palette: ['#ff5a1f', '#7a1d00'],
    role: 'Lead frontend engineer',
    timeline: '4 months · 2026',
    team: '2 engineers, 1 designer',
    overview:
      'Pulse turns a firehose of operational events into a dashboard a team can read at a glance — updating live, without ever feeling busy.',
    challenge:
      'Thousands of updates a second were re-rendering the whole screen. Charts stuttered, filters lagged, and the people relying on the numbers had stopped trusting them.',
    approach: [
      { title: 'Model the stream', body: 'One WebSocket feed, normalised into fine-grained signals so each tile only reacts to the data it shows.' },
      { title: 'Render on a budget', body: 'Updates are batched per animation frame and charts draw to canvas, keeping interaction smooth under load.' },
      { title: 'Design for glanceability', body: 'A strict hierarchy of colour and motion: only what changed, and only what matters, is allowed to move.' },
    ],
    shots: ['Live overview', 'Drill-down view', 'Alert rules'],
    outcome:
      'The dashboard stays responsive at peak load, and it became the screen the team keeps open all day.',
    results: [
      { value: '60fps', label: 'Sustained under live load' },
      { value: '−48%', label: 'Time to first insight' },
      { value: '12', label: 'Reusable chart components' },
    ],
  },
  {
    slug: 'atlas',
    name: 'Atlas',
    kind: 'Design system & component library',
    year: '2026',
    blurb: 'An accessible, themeable component library with documented patterns and tokens.',
    tags: ['Angular CDK', 'WCAG 2.1 AA', 'Design tokens'],
    palette: ['#c8f560', '#1f4d2b'],
    role: 'Design-system engineer',
    timeline: '6 months · 2026',
    team: '3 engineers, 2 designers',
    overview:
      'Atlas is one shared language for several products: tokens, components and patterns that make the accessible choice the default one.',
    challenge:
      'Every product had its own buttons, its own modals and its own accessibility bugs. Shipping a simple form meant rebuilding the same pieces again.',
    approach: [
      { title: 'Tokens first', body: 'Colour, type and spacing defined once as design tokens, themed per product without touching component code.' },
      { title: 'Accessible primitives', body: 'Focus management, keyboard support and ARIA handled inside the components, built on the Angular CDK.' },
      { title: 'Docs people use', body: 'Every component ships with live examples, do-and-don’t guidance and copy-paste snippets.' },
    ],
    shots: ['Component gallery', 'Theming playground', 'Usage guidelines'],
    outcome:
      'Teams ship consistent, accessible screens faster, and design reviews moved from pixels to product decisions.',
    results: [
      { value: '40+', label: 'Components documented' },
      { value: 'AA', label: 'WCAG 2.1 across the library' },
      { value: '3×', label: 'Faster screen delivery' },
    ],
  },
  {
    slug: 'nimbus',
    name: 'Nimbus',
    kind: 'AI-assisted workspace',
    year: '2026',
    blurb: 'A conversational workspace that streams model responses and tool calls into the UI.',
    tags: ['Claude API', 'MCP', 'RxJS'],
    palette: ['#8ea2ff', '#1c1f6b'],
    role: 'Frontend engineer',
    timeline: '3 months · 2026',
    team: '2 engineers',
    overview:
      'Nimbus is a workspace where people and an AI model work on the same document — with every response and tool call streamed into the interface as it happens.',
    challenge:
      'Streaming text, long-running tool calls and user edits all arrive at once. Naive rendering made the UI jump, lose scroll position and occasionally lose work.',
    approach: [
      { title: 'Streams as state', body: 'RxJS pipelines turn token streams and tool events into predictable UI state with clear cancellation.' },
      { title: 'Honest progress', body: 'Each tool call shows what it is doing and why, so waiting never feels like a frozen screen.' },
      { title: 'Never lose work', body: 'Optimistic edits, local drafts and conflict-free merging between the person and the model.' },
    ],
    shots: ['Conversation view', 'Tool-call timeline', 'Shared document'],
    outcome:
      'Responses feel instant, long tasks stay legible, and people keep their place no matter how much is streaming in.',
    results: [
      { value: '<100ms', label: 'To first streamed token on screen' },
      { value: '0', label: 'Lost edits in testing' },
      { value: '8', label: 'Tools integrated over MCP' },
    ],
  },
  {
    slug: 'vault',
    name: 'Vault',
    kind: 'Secure onboarding flow',
    year: '2025',
    blurb: 'A multi-step onboarding experience with resilient state and hardened auth.',
    tags: ['NgRx', 'OAuth 2.0', 'Signal Forms'],
    palette: ['#f3c9ff', '#5a1466'],
    role: 'Frontend engineer',
    timeline: '3 months · 2025',
    team: '3 engineers, 1 designer',
    overview:
      'Vault guides new customers through identity checks and account setup — a long, sensitive flow made to feel short and safe.',
    challenge:
      'People dropped out half-way: a refresh lost their progress, errors were vague, and session timeouts sent them back to step one.',
    approach: [
      { title: 'Resumable by design', body: 'Flow state lives in NgRx and is restored after a refresh, a timeout or a switch of device.' },
      { title: 'Validation that helps', body: 'Schema-based forms explain what is wrong, in plain language, at the moment it matters.' },
      { title: 'Hardened sessions', body: 'OAuth 2.0 with silent token refresh, route guards and interceptors that fail safely.' },
    ],
    shots: ['Step-by-step flow', 'Document upload', 'Review & confirm'],
    outcome:
      'More people finish what they start, and support hears about onboarding far less often.',
    results: [
      { value: '+31%', label: 'Onboarding completion' },
      { value: '−60%', label: 'Support tickets on sign-up' },
      { value: '100%', label: 'Flows resumable after refresh' },
    ],
  },
];

export const experience = [
  {
    period: 'Jun 2025 — Now',
    role: 'Software Engineer II, Frontend',
    company: 'Cresentrix Solutions',
    place: 'Karaikal, India',
    note: 'Promoted to SE II',
    points: [
      'Built the Angular frontend for a multi-portal event booking platform — a customer booking app plus dedicated organizer, vendor and admin panels.',
      'Integrated Seats.io for interactive seating and crowd handling, giving customers a smooth seat-selection experience.',
      'Delivered a multi-tenant school management SaaS covering the full student lifecycle, with a master admin panel for tenants and subscriptions.',
      'Designed the RxJS and NgRx state-management approach and component conventions used across the team.',
      'Mentor teammates on Angular, TypeScript and clean code through pair programming and reviews.',
    ],
    tags: ['Angular', 'Signals', 'NgRx', 'Seats.io', 'JWT / OAuth 2.0', 'Jasmine'],
  },
  {
    period: 'Feb 2023 — Jun 2025',
    role: 'Frontend Developer',
    company: 'Ahsan Solutions',
    place: 'Karaikal, India',
    note: '',
    points: [
      "Redesigned the company's official website as a modern, responsive Angular experience across desktop, tablet and mobile.",
      'Built a custom admin control panel so the team manages all site content without touching code.',
      'Cut load times with lazy loading, route-level code splitting and asset compression.',
      'Integrated REST APIs, JWT sessions and WebSocket-based real-time features.',
      'Owned modules end to end: requirements, implementation, review, CI/CD and post-release monitoring.',
    ],
    tags: ['Angular', 'TypeScript', 'REST', 'WebSockets', 'GitLab CI/CD', 'Figma'],
  },
] as const;

export const stack = [
  {
    name: 'Frontend',
    items: ['Angular 12 → latest', 'Signals', 'Standalone', 'RxJS', 'NgRx', 'TypeScript', 'SCSS'],
  },
  {
    name: 'Interface',
    items: ['Angular Material', 'Tailwind CSS', 'Responsive design', 'WCAG 2.1 AA', 'Figma'],
  },
  {
    name: 'Architecture',
    items: ['Component-driven', 'SOLID', 'Lazy loading', 'Micro-frontends'],
  },
  {
    name: 'Security & APIs',
    items: ['REST', 'WebSockets', 'JWT', 'OAuth 2.0', 'Interceptors', 'Route guards'],
  },
  {
    name: 'Quality',
    items: ['Jasmine', 'Karma', 'TDD', 'Code review', 'GitLab CI/CD', 'Docker'],
  },
  {
    name: 'AI-assisted',
    items: ['Claude Code', 'Claude API', 'Model Context Protocol', 'Agent Skills'],
  },
] as const;

export const certifications = [
  { name: 'Claude Code in Action', issuer: 'Anthropic', date: 'Apr 2026' },
  { name: 'Building with the Claude API', issuer: 'Anthropic', date: 'Apr 2026' },
  { name: 'Introduction to Model Context Protocol', issuer: 'Anthropic', date: 'Apr 2026' },
  { name: 'Introduction to Agent Skills', issuer: 'Anthropic', date: 'Mar 2026' },
] as const;

/** Supporting line under the headline statement in the About sheet of the poster design. */
export const statement =
  '3.5+ years shipping production Angular — multi-portal booking platforms, multi-tenant SaaS, and the component systems underneath them.';
