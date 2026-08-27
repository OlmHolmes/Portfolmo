function textRight(el: Element): number {
  const range = document.createRange();
  range.selectNodeContents(el);
  const rects = range.getClientRects();
  let maxRight = -Infinity;
  for (const r of Array.from(rects)) maxRight = Math.max(maxRight, r.right);
  return maxRight;
}

// Pulls the gallery's right edge in to match the actual rightmost pixel of
// the meta column's printed text (Data/Cliente/Tag/Team) rather than the
// fixed 300px meta box, which is usually wider than what's actually printed.
export function alignGalleryToMeta(selector: string) {
  const gallery = document.querySelector<HTMLElement>(selector);
  const meta = document.querySelector<HTMLElement>('.project-detail__meta');
  if (!gallery || !meta) return;

  const align = () => {
    gallery.style.setProperty('--gallery-meta-inset', '0px');
    const values = Array.from(meta.querySelectorAll<HTMLElement>('.project-detail__meta-value'));
    let maxTextRight = -Infinity;
    values.forEach((value) => {
      const spans = Array.from(value.querySelectorAll<HTMLElement>('span'));
      const nodes = spans.length ? spans : [value];
      nodes.forEach((node) => {
        maxTextRight = Math.max(maxTextRight, textRight(node));
      });
    });
    if (!isFinite(maxTextRight)) return;
    const galleryRight = gallery.getBoundingClientRect().right;
    const inset = Math.max(0, galleryRight - maxTextRight);
    gallery.style.setProperty('--gallery-meta-inset', `${inset}px`);
  };

  align();
  window.addEventListener('resize', align);
  if (document.fonts) document.fonts.ready.then(align);
}
