export function initContactReel(selector: string) {
  const reel = document.querySelector<HTMLElement>(selector);
  if (!reel) return;

  const img = reel.querySelector<HTMLImageElement>('[data-contact-reel-img]');
  if (!img) return;

  const covers: string[] = JSON.parse(reel.dataset.covers ?? '[]');
  if (covers.length < 2) return;

  let index = 0;
  setInterval(() => {
    index = (index + 1) % covers.length;
    img.src = covers[index];
  }, 1000);
}
