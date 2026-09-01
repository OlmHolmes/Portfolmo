import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrollToPlugin);

if (typeof document !== 'undefined') {
  ScrollTrigger.normalizeScroll(true);
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  // Images/video in the project list can still change its height (and
  // therefore the page's total scroll length) after fonts are ready and
  // after About's own late-created trigger has refreshed things. A final
  // refresh once everything (including images) has finished loading keeps
  // every trigger's measured start/end honest.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger, SplitText, ScrollToPlugin };
