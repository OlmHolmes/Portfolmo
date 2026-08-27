import { gsap, ScrollTrigger, SplitText } from './gsap-setup';

export function initAboutReveal(sectionSelector: string, bodySelector: string) {
  const section = document.querySelector<HTMLElement>(sectionSelector);
  const body = document.querySelector<HTMLElement>(bodySelector);
  if (!section || !body) return;

  const split = new SplitText(body, { type: 'words' });
  const words = split.words;

  words.forEach((word) => {
    gsap.set(word, { display: 'none', x: '50vw' });
  });

  let revealed = 0;

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=6000',
    pin: true,
    anticipatePin: 1,
    scrub: 0.8,
    onUpdate: (self) => {
      const target = Math.min(words.length, Math.round((self.progress / 0.8) * words.length));

      if (target > revealed) {
        const toReveal = words.slice(revealed, target);
        gsap.killTweensOf(toReveal);
        gsap.set(toReveal, { display: 'inline-block' });
        gsap.to(toReveal, { x: 0, duration: 0.6, ease: 'power2.out' });
      } else if (target < revealed) {
        const toHide = words.slice(target, revealed);
        gsap.killTweensOf(toHide);
        gsap.to(toHide, {
          x: '50vw',
          duration: 0.6,
          ease: 'power2.in',
          onComplete: () => gsap.set(toHide, { display: 'none' }),
        });
      }
      revealed = target;
    },
    onLeave: () => {
      const toReveal = words.slice(revealed);
      gsap.killTweensOf(toReveal);
      gsap.set(toReveal, { display: 'inline-block', x: 0 });
      revealed = words.length;
    },
    onLeaveBack: () => {
      const toHide = words.slice(0, revealed);
      gsap.killTweensOf(toHide);
      gsap.set(toHide, { display: 'none', x: '50vw' });
      revealed = 0;
    },
  });
}
