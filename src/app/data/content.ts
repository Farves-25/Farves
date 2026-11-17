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
    { label: 'GitHub', href: 'https://github.com/Farves-25' },
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
  "I'm an Angular engineer with 3.5+ years of shipping production software in Agile teams — multi-portal booking platforms, multi-tenant SaaS, and the component systems underneath them. I obsess over the things users _feel_ but _never_ _notice:_ an interface that answers instantly, a focus ring exactly where it should be, state that never lies.";

export interface Stat {
  value: number;
  decimals: number;
  suffix: string;
  label: string;
}

export const stats: readonly Stat[] = [
  { value: 3.5, decimals: 1, suffix: '+', label: 'Years building production Angular' },
  { value: 6, decimals: 0, suffix: '', label: 'Production portals & panels across 2 products' },
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
  /** Two accent colours used for the card glow and case-study theme. */
  palette: readonly [string, string];
  /** Cover screenshot (path under /public). */
  image: string;
  /** Alt text for the cover screenshot. */
  imageAlt: string;
  /** Deployed app. */
  live: string;
  /** Source repository. */
  github: string;

  // ----- Case-study page -----
  role: string;
  timeline: string;
  team: string;
  overview: string;
  challenge: string;
  approach: readonly { title: string; body: string }[];
  /** Screens shown on the case-study page: a screenshot plus its caption. */
  shots: readonly { src: string; caption: string }[];
  outcome: string;
  results: readonly { value: string; label: string }[];
}

/**
 * Selected work. Each entry renders one card in the gallery and one page at /work/<slug>.
 */
export const projects: readonly Project[] = [
  {
    slug: 'polyglotstudio',
    name: 'PolyGlotStudio',
    kind: 'Language-learning platform',
    year: '2026',
    blurb:
      'A language-acquisition app with live audio visualisers, speech verification and a spaced-repetition engine.',
    tags: ['Angular', 'Signals', 'Tailwind CSS', 'Supabase'],
    palette: ['#8b8bff', '#2a1f6b'],
    image: '/work/polyglotstudio-cover.webp',
    imageAlt: 'PolyGlotStudio welcome page in light mode',
    live: 'https://poly-glot-studio.vercel.app/',
    github: 'https://github.com/Farves-25/PolyGlotStudio',
    role: 'Frontend engineer — design & build',
    timeline: '2026',
    team: 'Solo project',
    overview:
      'PolyGlotStudio teaches real-life phrases in six languages — with native voices, pronunciation checks and a review schedule that adapts to what you forget.',
    challenge:
      'Language apps tend to be flashcards with a coat of paint. The goal was to make speaking, listening and grammar feel hands-on — in the browser, with no plugins, and in right-to-left scripts like Arabic as well.',
    approach: [
      {
        title: 'Hear it, say it, see it',
        body: 'Canvas oscilloscope and a 48-band spectrum analyser visualise the microphone live, while a Levenshtein-based engine scores what the Web Speech API heard against the target phrase.',
      },
      {
        title: 'Remembering, scheduled',
        body: 'A SuperMemo SM-2 implementation decides when each card returns. Progress syncs to Supabase and falls back to a local cache when offline.',
      },
      {
        title: 'Built for every script',
        body: 'Grammar and phonetics labs, a minimal-pair drill and an AI roleplay arena all support bidirectional text, with a carefully tuned light and dark theme.',
      },
    ],
    shots: [
      { src: '/work/polyglotstudio-1.webp', caption: 'Dashboard & analytics' },
      { src: '/work/polyglotstudio-2.webp', caption: 'Interactive voice studio' },
      { src: '/work/polyglotstudio-3.webp', caption: 'Phonetics & IPA lab' },
    ],
    outcome:
      'A complete learning environment — from first phrase to daily review — that runs entirely in the browser.',
    results: [
      { value: '6', label: 'Languages supported' },
      { value: '420+', label: 'Real-life phrases' },
      { value: '14', label: 'Life scenarios' },
    ],
  },
  {
    slug: 'pulsechat',
    name: 'PulseChat',
    kind: 'Realtime team chat',
    year: '2026',
    blurb:
      'A Slack-style workspace with channels, threads, mentions, reactions and a ⌘K command palette.',
    tags: ['Angular', 'Supabase Realtime', 'CDK', 'Tailwind CSS'],
    palette: ['#ff5a5f', '#5a1018'],
    image: '/work/pulsechat-cover.webp',
    imageAlt: 'PulseChat workspace showing the general channel with threaded replies and reactions',
    live: 'https://pulsechatwithyou.vercel.app/',
    github: 'https://github.com/Farves-25/PulseChat',
    role: 'Frontend engineer — design & build',
    timeline: '2026',
    team: 'Solo project',
    overview:
      'PulseChat is a realtime team-chat app: channels and DMs, threads in a side drawer, @mentions, reactions, pins, file sharing and presence — with a fully seeded demo workspace that needs no backend.',
    challenge:
      'Chat is deceptively hard: long histories with variable-height messages, many things updating at once, and a UI that must stay readable while it moves. All of it had to feel instant.',
    approach: [
      {
        title: 'A list that never lags',
        body: 'Variable-height virtual scrolling (CDK autosize) keeps long histories smooth, with day dividers, sender grouping and a jump-to-latest control.',
      },
      {
        title: 'Realtime, end to end',
        body: 'Supabase Realtime streams messages, reactions and channels; typing and presence travel over broadcast. Row-level security protects every table.',
      },
      {
        title: 'Keyboard-first',
        body: 'A ⌘K palette jumps to channels, people and actions; mention autocomplete, inline editing and shortcuts keep hands on the keys.',
      },
    ],
    shots: [
      { src: '/work/pulsechat-1.webp', caption: 'Sign-in & live demo' },
      { src: '/work/pulsechat-2.webp', caption: 'Channels, threads & reactions' },
      { src: '/work/pulsechat-3.webp', caption: 'Command palette' },
    ],
    outcome:
      'A polished, responsive workspace that works the moment you open it — with or without a backend.',
    results: [
      { value: '5', label: 'Accent palettes, dark & light' },
      { value: '⌘K', label: 'Command palette everywhere' },
      { value: '0', label: 'Setup needed for the demo' },
    ],
  },
  {
    slug: 'retrosync',
    name: 'RetroSync',
    kind: 'Live retrospective board',
    year: '2026',
    blurb:
      'A real-time retro canvas with drag-and-drop cards, voting, presence and facilitator controls.',
    tags: ['Angular CDK', 'Supabase', 'Realtime', 'Tailwind CSS'],
    palette: ['#7c5cff', '#1a1250'],
    image: '/work/retrosync-cover.webp',
    imageAlt: 'RetroSync board with four columns of retrospective cards and a facilitator toolbar',
    live: 'https://retrosyncboard.vercel.app/',
    github: 'https://github.com/Farves-25/RetroSync',
    role: 'Frontend engineer — design & build',
    timeline: '2026',
    team: 'Solo project',
    overview:
      'RetroSync gives distributed teams a shared canvas for sprint retrospectives: cards that move live, votes that tally instantly, and a facilitator who can blur cards and run a timer.',
    challenge:
      'A retro only works if everyone sees the same board at the same moment. Drag-and-drop, voting and presence all had to stay in sync across tabs and people without conflicts.',
    approach: [
      {
        title: 'Drag, drop, sync',
        body: 'Angular CDK drag-drop moves cards between columns optimistically, then reconciles through Supabase Realtime so every participant converges on the same order.',
      },
      {
        title: 'Facilitator controls',
        body: 'Stealth mode hides card text until the reveal, a shared timer keeps discussion honest, and columns can be added or recoloured on the fly.',
      },
      {
        title: 'Presence & voting',
        body: 'Live avatars show who is in the room; one vote per person per card is enforced in the database, not just the UI.',
      },
    ],
    shots: [
      { src: '/work/retrosync-1.webp', caption: 'Workspace dashboard' },
      { src: '/work/retrosync-2.webp', caption: 'Live retrospective board' },
      { src: '/work/retrosync-3.webp', caption: 'Sign-in' },
    ],
    outcome:
      'Retros that feel like standing at the same whiteboard — even when the team is in four time zones.',
    results: [
      { value: '4', label: 'Default retro columns' },
      { value: '1', label: 'Vote per person, enforced by the DB' },
      { value: 'Live', label: 'Cards, votes & presence' },
    ],
  },
  {
    slug: 'wandergrid',
    name: 'WanderGrid',
    kind: 'Live flight search',
    year: '2026',
    blurb:
      'Search real flight schedules and prices, see if today’s fare is good, then book with the seller.',
    tags: ['Angular', 'PWA', 'Node API', 'Tailwind CSS'],
    palette: ['#ff8a5c', '#5a2410'],
    image: '/work/wandergrid-cover.webp',
    imageAlt: 'WanderGrid home page in light mode with the headline “Real flights. Real prices. Right now.” and a search form',
    live: 'https://wandergrid.vercel.app/',
    github: 'https://github.com/Farves-25/WanderGrid',
    role: 'Full-stack engineer — design & build',
    timeline: '2026',
    team: 'Solo project',
    overview:
      'WanderGrid shows live Google Flights schedules and prices, tells you whether a fare is low, typical or high, and hands off to the airline or travel site that actually sells the ticket.',
    challenge:
      'Flight data is heavy, quota-limited and sensitive: the API key must never reach the browser, searches cost money, and results still have to feel fast and trustworthy.',
    approach: [
      {
        title: 'A thin, safe API',
        body: 'A small Node server validates requests, calls SerpApi, normalises the response and caches searches, so the key stays server-side and repeats are free.',
      },
      {
        title: 'Results you can judge',
        body: 'Price insights, price history, layover and delay warnings, CO₂ comparison and flexible filters — across round-trip, one-way and multi-city.',
      },
      {
        title: 'Yours to keep',
        body: 'Saved trips and price alerts live on-device, prices convert across ten currencies, and the installable PWA reads saved trips offline.',
      },
    ],
    shots: [
      { src: '/work/wandergrid-1.webp', caption: 'Home & flight search' },
      { src: '/work/wandergrid-2.webp', caption: 'Popular destinations' },
      { src: '/work/wandergrid-3.webp', caption: 'Book at the source' },
    ],
    outcome:
      'A fast, honest flight search that sends people to book directly — with no booking fees and no surprises.',
    results: [
      { value: '10', label: 'Display currencies' },
      { value: '100+', label: 'Airports searchable' },
      { value: 'PWA', label: 'Installable & offline-aware' },
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
      'Developed the Angular frontend for a multi-portal event booking platform with 4 role-based portals — customer booking app, organizer, vendor and admin panels — and integrated Seats.io for interactive seat selection and crowd handling.',
      'Built the Angular frontend for a multi-tenant school management SaaS, including a school admin panel covering the full student lifecycle, from admission to graduation.',
      'Developed a master admin panel giving the platform owner central control over all tenant schools and their subscriptions, completing a 2-panel (master and school) admin architecture.',
      'Own production modules built with Standalone Components, Signals and OnPush change detection, improving runtime performance alongside lazy loading.',
      'Designed the RxJS and NgRx state-management approach and component conventions adopted across the team.',
      'Built accessible UI to WCAG 2.1 AA; implemented JWT and OAuth 2.0 authentication, route guards and HTTP interceptors; wrote unit tests with Jasmine and Karma.',
      'Mentor teammates on Angular, TypeScript and clean code through pair programming and code reviews; use Claude Code and the Claude API to speed up feature work and refactoring.',
    ],
    tags: ['Angular', 'Signals', 'OnPush', 'NgRx', 'Seats.io', 'JWT / OAuth 2.0', 'Jasmine', 'Claude Code'],
  },
  {
    period: 'Feb 2023 — Jun 2025',
    role: 'Frontend Developer',
    company: 'Ahsan Solutions',
    place: 'Karaikal, India',
    note: '',
    points: [
      "Redesigned the company's official website as a responsive Angular application across 3 device classes (desktop, tablet, mobile), built from reusable components for easy maintenance.",
      'Built a custom admin control panel so the team can manage 100% of website content without code changes.',
      'Built responsive single-page applications from scratch with Angular, TypeScript and ES6+, converting Figma designs into cross-browser layouts.',
      'Improved load performance with lazy loading, route-level code splitting and asset compression.',
      'Integrated REST APIs, JWT session handling and WebSocket-based real-time features.',
      'Owned modules across all 5 delivery stages: requirements, implementation, peer review, CI/CD deployment and post-release monitoring.',
    ],
    tags: ['Angular', 'TypeScript', 'REST', 'WebSockets', 'GitLab CI/CD', 'Figma'],
  },
] as const;

export const stack = [
  {
    name: 'Frontend',
    items: ['Angular 12 → latest', 'Angular CLI', 'Signals', 'Standalone', 'RxJS', 'NgRx', 'TypeScript', 'JavaScript ES6+', 'HTML5', 'CSS3', 'SCSS', 'AngularJS'],
  },
  {
    name: 'Interface',
    items: ['Angular Material', 'Tailwind CSS', 'Bootstrap', 'Responsive design', 'Cross-browser', 'WCAG 2.1 AA', 'Figma'],
  },
  {
    name: 'Architecture',
    items: ['Component-driven', 'SOLID', 'Lazy loading', 'Code splitting', 'Micro-frontends', 'Performance optimisation'],
  },
  {
    name: 'Security & APIs',
    items: ['REST', 'WebSockets', 'JWT', 'OAuth 2.0', 'HTTP interceptors', 'Route guards', 'Authentication & authorization'],
  },
  {
    name: 'Testing',
    items: ['Jasmine', 'Karma', 'Playwright', 'Unit testing', 'E2E testing', 'TDD'],
  },
  {
    name: 'Tools & DevOps',
    items: ['Git', 'GitHub', 'GitHub Actions', 'GitLab CI/CD', 'Webpack', 'npm', 'Docker (basic)', 'Postman', 'Confluence', 'VS Code'],
  },
  {
    name: 'Ways of working',
    items: ['Agile', 'Scrum', 'Kanban', 'Code review', 'Pair programming', 'Mentoring'],
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
