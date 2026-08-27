import { gsap, ScrollTrigger } from './gsap-setup';

export function initRevealOnScroll(selector: string) {
  const elements = document.querySelectorAll<HTMLElement>(selector);

  elements.forEach((element) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
        },
      }
    );
  });
}
