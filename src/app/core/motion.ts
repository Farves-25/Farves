import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, PLATFORM_ID, Service, inject } from '@angular/core';
import Lenis from 'lenis';

export interface Frame {
  time: number;
  dt: number;
  scroll: number;
  /** Smoothed scroll delta in px per frame. */
  velocity: number;
  vw: number;
  vh: number;
  /** True when scroll position or layout changed since the previous frame. */
  moved: boolean;
}

export interface Box {
  top: number;
  height: number;
}

type FrameFn = (frame: Frame) => void;

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/**
 * One requestAnimationFrame loop for the whole site.
 * Layout reads happen in measure callbacks (on resize only), writes happen in frame
 * callbacks, so scrolling never forces a synchronous layout.
 */
@Service()
export class Motion {
  private readonly doc = inject(DOCUMENT);
  /** False on the server and in DOM shims that lack the APIs the motion layer needs. */
  readonly browser =
    isPlatformBrowser(inject(PLATFORM_ID)) &&
    typeof matchMedia === 'function' &&
    typeof IntersectionObserver === 'function';
  readonly reduced = this.browser && matchMedia('(prefers-reduced-motion: reduce)').matches;
  readonly finePointer = this.browser && matchMedia('(hover: hover) and (pointer: fine)').matches;

  private readonly frameFns = new Set<FrameFn>();
  private readonly measureFns = new Set<() => void>();
  private readonly frame: Frame = {
    time: 0,
    dt: 16,
    scroll: 0,
    velocity: 0,
    vw: 0,
    vh: 0,
    moved: true,
  };
  private lenis?: Lenis;
  private io?: IntersectionObserver;
  private readonly ioCallbacks = new WeakMap<Element, (() => void)[]>();
  private started = false;
  private dirty = true;
  private lastScroll = -1;

  /** Runs every animation frame. Returns an unsubscribe function. */
  onFrame(fn: FrameFn): () => void {
    this.start();
    this.frameFns.add(fn);
    return () => this.frameFns.delete(fn);
  }

  /** Runs on first frame and whenever layout may have changed. Do DOM reads here. */
  onMeasure(fn: () => void): () => void {
    this.start();
    this.measureFns.add(fn);
    this.dirty = true;
    return () => this.measureFns.delete(fn);
  }

  /** Calls back each frame the element is near the viewport and something moved. */
  observe(el: HTMLElement, cb: (box: Box, frame: Frame) => void): () => void {
    const box: Box = { top: 0, height: 0 };
    let wasNear = true;
    const offMeasure = this.onMeasure(() => {
      let top = 0;
      let node: HTMLElement | null = el;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      box.top = top;
      box.height = el.offsetHeight;
    });
    const offFrame = this.onFrame((f) => {
      if (!f.moved) return;
      const near =
        f.scroll + f.vh * 1.25 > box.top && f.scroll < box.top + box.height + f.vh * 0.25;
      // One extra call after leaving lets consumers settle on their clamped end state.
      if (near || wasNear) cb(box, f);
      wasNear = near;
    });
    return () => {
      offMeasure();
      offFrame();
    };
  }

  /** Fires once when the element first scrolls into view. */
  inView(el: Element, cb: () => void): void {
    if (!this.browser) return;
    this.io ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const fn of this.ioCallbacks.get(entry.target) ?? []) fn();
          this.ioCallbacks.delete(entry.target);
          this.io?.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    this.ioCallbacks.set(el, [...(this.ioCallbacks.get(el) ?? []), cb]);
    this.io.observe(el);
  }

  scrollTo(target: string | number): void {
    if (!this.browser) return;
    if (typeof target === 'number') {
      if (this.lenis) this.lenis.scrollTo(target, { duration: 1.2 });
      else scrollTo({ top: target, behavior: this.reduced ? 'auto' : 'smooth' });
      return;
    }
    const el = target === '#top' ? null : this.doc.querySelector<HTMLElement>(target);
    if (this.lenis) {
      this.lenis.scrollTo(el ?? 0, { duration: 1.4 });
    } else if (el) {
      el.scrollIntoView({ behavior: this.reduced ? 'auto' : 'smooth' });
    } else {
      scrollTo({ top: 0, behavior: this.reduced ? 'auto' : 'smooth' });
    }
    // Keep keyboard and screen-reader position in sync with the visual jump.
    (el ?? this.doc.body).focus({ preventScroll: true });
  }

  /** Jumps to a scroll position or element without animating. */
  jump(target: number | string): void {
    if (!this.browser) return;
    const to = typeof target === 'number' ? target : this.doc.querySelector<HTMLElement>(target);
    if (to === null) return;
    if (this.lenis) this.lenis.scrollTo(to, { immediate: true, force: true });
    else if (typeof to === 'number') scrollTo(0, to);
    else to.scrollIntoView();
  }

  /** Freezes page scrolling while an overlay is open. */
  lock(locked: boolean): void {
    if (!this.browser) return;
    if (this.lenis) locked ? this.lenis.stop() : this.lenis.start();
    else this.doc.documentElement.style.overflow = locked ? 'hidden' : '';
  }

  /** Lets a panel grow from a slightly inset card to full bleed as it scrolls in. */
  rise(el: HTMLElement): void {
    if (this.reduced) return;
    this.observe(el, (box, f) => {
      const p = clamp((f.scroll + f.vh - box.top) / (f.vh * 0.75));
      el.style.transform = p >= 1 ? '' : `scale(${(0.92 + 0.08 * p).toFixed(4)})`;
    });
  }

  private start(): void {
    if (this.started || !this.browser) return;
    this.started = true;

    if (!this.reduced) {
      this.lenis = new Lenis({ autoRaf: false, lerp: 0.11, anchors: false });
    }

    const markDirty = () => (this.dirty = true);
    addEventListener('resize', markDirty, { passive: true });
    new ResizeObserver(markDirty).observe(this.doc.body);
    this.doc.fonts?.ready.then(markDirty);

    this.doc.addEventListener('click', (event) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      const hash = link?.getAttribute('href');
      if (!hash || hash.length < 2) return;
      event.preventDefault();
      this.scrollTo(hash);
    });

    const tick = (time: number) => {
      requestAnimationFrame(tick);
      const f = this.frame;
      f.dt = Math.min(time - (f.time || time), 64) || 16;
      f.time = time;
      this.lenis?.raf(time);

      const resized = this.dirty;
      if (resized) {
        this.dirty = false;
        f.vw = innerWidth;
        f.vh = innerHeight;
        for (const fn of this.measureFns) fn();
      }

      f.scroll = this.lenis ? this.lenis.scroll : scrollY;
      const delta = this.lastScroll < 0 ? 0 : f.scroll - this.lastScroll;
      f.velocity += (delta - f.velocity) * 0.2;
      if (Math.abs(f.velocity) < 0.01) f.velocity = 0;
      f.moved = resized || delta !== 0;
      this.lastScroll = f.scroll;

      for (const fn of this.frameFns) fn(f);
    };
    requestAnimationFrame(tick);
  }
}
