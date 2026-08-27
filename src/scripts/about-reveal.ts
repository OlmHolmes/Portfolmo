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
        for (let i = revealed; i < target; i++) {
          gsap.killTweensOf(words[i]);
          gsap.set(words[i], { display: 'inline-block' });
          gsap.to(words[i], { x: 0, duration: 0.6, ease: 'power2.out' });
        }
      } else if (target < revealed) {
        for (let i = target; i < revealed; i++) {
          gsap.killTweensOf(words[i]);
          gsap.to(words[i], {
            x: '50vw',
            duration: 0.6,
            ease: 'power2.in',
            onComplete: () => gsap.set(words[i], { display: 'none' }),
          });
        }
      }
      revealed = target;
    },
    onLeave: () => {
      for (let i = revealed; i < words.length; i++) {
        gsap.killTweensOf(words[i]);
        gsap.set(words[i], { display: 'inline-block', x: 0 });
      }
      revealed = words.length;
    },
    onLeaveBack: () => {
      for (let i = 0; i < revealed; i++) {
        gsap.killTweensOf(words[i]);
        gsap.set(words[i], { display: 'none', x: '50vw' });
      }
      revealed = 0;
    },
  });
}
