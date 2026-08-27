import { gsap, ScrollTrigger } from './gsap-setup';

export function initProjectReel(
  sectionSelector: string,
  windowSelector: string,
  listSelector: string,
  panelSelector: string
) {
  const section = document.querySelector<HTMLElement>(sectionSelector);
  const win = document.querySelector<HTMLElement>(windowSelector);
  const list = document.querySelector<HTMLElement>(listSelector);
  const panel = document.querySelector<HTMLElement>(panelSelector);
  if (!section || !win || !list || !panel) return;

  const rows = Array.from(list.querySelectorAll<HTMLAnchorElement>('[data-project-row]'));
  if (rows.length === 0) return;

  const media = panel.querySelector<HTMLElement>('[data-panel-media]');
  const overview = panel.querySelector<HTMLElement>('[data-panel-overview]');
  const tagsEl = panel.querySelector<HTMLElement>('[data-panel-tags]');
  const clientRow = panel.querySelector<HTMLElement>('[data-panel-client-row]');
  const clientEl = panel.querySelector<HTMLElement>('[data-panel-client]');
  const dateEl = panel.querySelector<HTMLElement>('[data-panel-date]');
  const link = panel.querySelector<HTMLAnchorElement>('[data-panel-link]');
  if (!media || !overview || !tagsEl || !clientRow || !clientEl || !dateEl || !link) return;

  function computeTargets(): number[] {
    const centerY = win!.offsetHeight / 2;
    return rows.map((row) => centerY - (row.offsetTop + row.offsetHeight / 2));
  }

  let targets = computeTargets();

  function setActive(index: number) {
    const row = rows[index];
    rows.forEach((r, i) => r.classList.toggle('is-active', i === index));

    const type = row.dataset.previewType === 'video' ? 'video' : 'img';
    media!.innerHTML = '';
    const mediaEl = document.createElement(type);
    mediaEl.setAttribute('src', row.dataset.previewSrc ?? '');
    if (type === 'video') {
      mediaEl.setAttribute('muted', '');
      mediaEl.setAttribute('loop', '');
      mediaEl.setAttribute('autoplay', '');
      mediaEl.setAttribute('playsinline', '');
    }
    media!.appendChild(mediaEl);

    overview!.textContent = row.dataset.overview ?? '';

    const tags: string[] = JSON.parse(row.dataset.tags ?? '[]');
    tagsEl!.innerHTML = '';
    tags.forEach((tag) => {
      const line = document.createElement('span');
      line.textContent = tag;
      tagsEl!.appendChild(line);
    });

    const client = row.dataset.client ?? '';
    const date = row.dataset.date ?? '';
    clientRow!.style.display = client || date ? '' : 'none';
    clientEl!.textContent = client;
    dateEl!.textContent = date;

    link!.href = row.href;

    gsap.fromTo(panel!, { autoAlpha: 0.4 }, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' });
  }

  let current = -1;

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: `+=${rows.length * 500}`,
    pin: true,
    scrub: 0.8,
    onRefresh: () => {
      targets = computeTargets();
    },
    onUpdate: (self) => {
      const virtual = self.progress * (rows.length - 1);
      const i0 = Math.floor(virtual);
      const i1 = Math.min(rows.length - 1, i0 + 1);
      const frac = virtual - i0;
      const y = gsap.utils.interpolate(targets[i0], targets[i1], frac);
      gsap.set(list, { y });

      const activeIndex = Math.round(virtual);
      if (activeIndex !== current) {
        current = activeIndex;
        setActive(activeIndex);
      }
    },
  });

  gsap.set(list, { y: targets[0] });
  current = 0;
  setActive(0);
}
