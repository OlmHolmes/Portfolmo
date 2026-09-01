export function initContactOverlay(selector: string) {
  const photo = document.querySelector<HTMLElement>(selector);
  if (!photo) return;

  const img = photo.querySelector<HTMLImageElement>('img');
  const email = photo.querySelector<HTMLElement>('.contact__overlay-link--email');
  const phone = photo.querySelector<HTMLElement>('.contact__overlay-link--phone');
  const insta = photo.querySelector<HTMLElement>('.contact__overlay-link--instagram');
  if (!img || !email || !phone || !insta) return;

  // object-fit:contain letterboxes the image inside .contact__photo, so
  // positioning the links off the container edges (via CSS %) can land them
  // in the empty letterbox band instead of on the actual photo. Position
  // them off the image's real rendered rect instead, reusing Instagram's
  // (CSS-set) left inset so all three line up at the same distance from
  // the edge.
  function position() {
    const inset = insta!.getBoundingClientRect().left - photo!.getBoundingClientRect().left;
    const boxW = photo!.clientWidth;
    const boxH = photo!.clientHeight;
    if (!boxW || !boxH || !img!.naturalWidth || !img!.naturalHeight) return;

    const boxRatio = boxW / boxH;
    const naturalRatio = img!.naturalWidth / img!.naturalHeight;

    let renderedW: number;
    let renderedH: number;
    let offsetX: number;
    let offsetY: number;

    if (naturalRatio > boxRatio) {
      renderedW = boxW;
      renderedH = boxW / naturalRatio;
      offsetX = 0;
      offsetY = (boxH - renderedH) / 2;
    } else {
      renderedH = boxH;
      renderedW = boxH * naturalRatio;
      offsetX = (boxW - renderedW) / 2;
      offsetY = 0;
    }

    email!.style.left = `${offsetX + inset}px`;
    email!.style.top = `${offsetY + inset}px`;
    phone!.style.left = `${offsetX + inset}px`;
    phone!.style.bottom = `${boxH - (offsetY + renderedH) + inset}px`;
  }

  if (img.complete) position();
  else img.addEventListener('load', position);
  window.addEventListener('resize', position);
}
