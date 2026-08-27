import { gsap } from './gsap-setup';

export function initCustomCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(dot);

  gsap.set(dot, { xPercent: -50, yPercent: -50 });
  const moveX = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power3.out' });
  const moveY = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power3.out' });

  window.addEventListener('mousemove', (e) => {
    moveX(e.clientX);
    moveY(e.clientY);
  });

  document.addEventListener('mouseover', (e) => {
    const el = e.target as HTMLElement;
    const target = el.closest('a, button');
    const isProjectRow = el.closest('.project-row');
    dot.classList.toggle('cursor-dot--hover', !!target && !isProjectRow);
  });

  document.body.classList.add('has-custom-cursor');
}
