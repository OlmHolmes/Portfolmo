function naturalRatio(el: HTMLImageElement | HTMLVideoElement): Promise<number> {
  if (el instanceof HTMLImageElement) {
    if (el.complete && el.naturalWidth) return Promise.resolve(el.naturalWidth / el.naturalHeight);
    return new Promise((resolve) => {
      el.addEventListener('load', () => resolve(el.naturalWidth / el.naturalHeight), { once: true });
    });
  }
  if (el.readyState >= 1 && el.videoWidth) return Promise.resolve(el.videoWidth / el.videoHeight);
  return new Promise((resolve) => {
    el.addEventListener('loadedmetadata', () => resolve(el.videoWidth / el.videoHeight), { once: true });
  });
}

// Sizes a duo/trio row so every item sits at a shared height whose widths (at
// their own natural, un-cropped aspect ratio) sum exactly to the row's width —
// never overflowing it, never leaving a gap, never cropping any image. Each
// row is sized independently (a row of taller/narrower images naturally ends
// up taller than a row of wider ones) — don't equalize across rows.
export function initGalleryDuos(selector: string) {
  const container = document.querySelector(selector);
  if (!container) return;

  container.querySelectorAll<HTMLElement>('.project-detail__gallery-duo, .project-detail__gallery-trio').forEach((row) => {
    const items = Array.from(row.children) as HTMLElement[];
    if (items.length < 2) return;

    const heightTargets = items.map((item) =>
      item.matches('.project-detail__gallery-video--duo')
        ? item.querySelector<HTMLElement>('.project-detail__gallery-video-stage')
        : item
    );
    const mediaEls = items.map((item) =>
      item.matches('.project-detail__gallery-video--duo')
        ? item.querySelector<HTMLVideoElement>('video')
        : (item as HTMLImageElement)
    );
    if (heightTargets.some((t) => !t) || mediaEls.some((el) => !el)) return;

    Promise.all(mediaEls.map((el) => naturalRatio(el!))).then((ratios) => {
      const layout = () => {
        if (getComputedStyle(row).flexDirection === 'column') {
          heightTargets.forEach((t) => t!.style.removeProperty('height'));
          return;
        }
        const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
        const containerWidth = row.getBoundingClientRect().width;
        const totalGap = gap * (items.length - 1);
        const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
        const scale = parseFloat(row.dataset.scale || '1') || 1;
        const height = ((containerWidth - totalGap) / totalRatio) * scale;
        if (!isFinite(height) || height <= 0) return;
        heightTargets.forEach((t) => {
          t!.style.height = `${height}px`;
        });
      };
      layout();
      window.addEventListener('resize', layout);
    });
  });
}
