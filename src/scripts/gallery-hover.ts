export function initGalleryHovers(selector: string) {
  const container = document.querySelector(selector);
  if (!container) return;

  container.querySelectorAll<HTMLElement>('[data-gallery-hover]').forEach((wrapper) => {
    const video = wrapper.querySelector<HTMLVideoElement>('[data-gallery-hover-video]');
    if (!video) return;

    wrapper.addEventListener('mouseenter', () => {
      wrapper.classList.add('is-hovering');
      video.currentTime = 0;
      video.play();
    });

    wrapper.addEventListener('mouseleave', () => {
      wrapper.classList.remove('is-hovering');
      video.pause();
    });
  });
}
