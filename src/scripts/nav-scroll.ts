import { gsap } from './gsap-setup';

/**
 * A plain hash-link `href="#about"` jumps instantly (scroll-behavior:smooth
 * was deliberately removed globally elsewhere to fix an unrelated scroll-
 * stick bug). An instant jump can land scroll position deep inside, or past,
 * a pinned ScrollTrigger section's range in one frame instead of crossing it
 * gradually - GSAP's pin enter/leave logic assumes a continuous scroll and
 * can end up with two adjacent pinned sections (e.g. About and the project
 * list) both evaluating as "active" at once, which shows as their content
 * visibly overlapping. Animating the scroll with GSAP itself (same engine
 * driving ScrollTrigger/normalizeScroll) keeps the crossing gradual so each
 * section's pin state resolves in the right order, without touching the
 * global CSS scroll-behavior.
 */
export function initNavScroll(navSelector: string) {
  const links = document.querySelectorAll<HTMLAnchorElement>(`${navSelector} a[href*="#"]`);

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const url = new URL(link.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;

      const target = document.querySelector<HTMLElement>(url.hash);
      if (!target) return;

      e.preventDefault();
      gsap.to(window, {
        // Landing exactly on a pinned section's trigger start (rather than
        // past it) can leave ScrollTrigger's onEnter never firing - a
        // natural wheel/trackpad scroll always overshoots that boundary by
        // some amount, but this animated scroll's easing decelerates right
        // onto it. offsetY:-2 lands 2px further than the target's raw top,
        // unambiguously inside the pinned range instead of exactly on its
        // edge. See about-reveal.ts's ScrollTrigger (start:'top top').
        scrollTo: { y: target, offsetY: -2, autoKill: true },
        duration: 1,
        ease: 'power2.inOut',
        onComplete: () => history.pushState(null, '', url.hash),
      });
    });
  });
}
