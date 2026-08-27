export function initGalleryVideos(selector: string) {
  const container = document.querySelector(selector);
  if (!container) return;

  container.querySelectorAll<HTMLElement>('.project-detail__gallery-video').forEach((wrapper) => {
    const stage = wrapper.querySelector<HTMLElement>('.project-detail__gallery-video-stage');
    const video = wrapper.querySelector<HTMLVideoElement>('[data-gallery-video]');
    const toggle = wrapper.querySelector<HTMLButtonElement>('[data-gallery-video-toggle]');
    const seek = wrapper.querySelector<HTMLInputElement>('[data-gallery-video-seek]');
    const seekFill = wrapper.querySelector<HTMLElement>('[data-gallery-video-seek-fill]');
    const muteBtn = wrapper.querySelector<HTMLButtonElement>('[data-gallery-video-mute]');
    const volume = wrapper.querySelector<HTMLInputElement>('[data-gallery-video-volume]');
    const volumeFill = wrapper.querySelector<HTMLElement>('[data-gallery-video-volume-fill]');
    if (!stage || !video || !toggle) return;

    const setMuted = (muted: boolean) => {
      video.muted = muted;
      wrapper.classList.toggle('is-muted', muted);
    };
    setMuted(video.muted);

    const syncActive = () => {
      wrapper.classList.toggle('is-active', !video.paused);
    };
    syncActive();
    video.addEventListener('play', syncActive);
    video.addEventListener('pause', syncActive);

    const play = () => {
      setMuted(false);
      video.play();
    };
    const pause = () => {
      video.pause();
    };
    const togglePlay = () => {
      if (video.paused) play();
      else pause();
    };

    let hideIconTimer: ReturnType<typeof setTimeout> | undefined;
    const flashIcon = () => {
      wrapper.classList.add('show-icon');
      if (hideIconTimer) clearTimeout(hideIconTimer);
      hideIconTimer = setTimeout(() => {
        wrapper.classList.remove('show-icon');
      }, 1000);
    };

    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    const resetIdleTimer = () => {
      wrapper.classList.remove('is-idle');
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        wrapper.classList.add('is-idle');
      }, 1000);
    };
    stage.addEventListener('pointermove', resetIdleTimer);
    stage.addEventListener('pointerenter', resetIdleTimer);
    resetIdleTimer();

    stage.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-gallery-video-toggle], [data-gallery-video-controls]')) return;
      togglePlay();
      flashIcon();
    });

    toggle.addEventListener('click', () => {
      togglePlay();
      flashIcon();
    });

    let seeking = false;
    if (seek) {
      const updateSeekFill = () => {
        (seekFill ?? seek).style.setProperty('--fill', `${seek.value}%`);
      };
      video.addEventListener('timeupdate', () => {
        if (seeking || !video.duration) return;
        seek.value = String((video.currentTime / video.duration) * 100);
        updateSeekFill();
      });
      seek.addEventListener('pointerdown', () => {
        seeking = true;
      });
      seek.addEventListener('input', () => {
        updateSeekFill();
        if (video.duration) {
          video.currentTime = (Number(seek.value) / 100) * video.duration;
        }
      });
      seek.addEventListener('change', () => {
        seeking = false;
      });
      updateSeekFill();
    }

    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        setMuted(!video.muted);
      });
    }

    if (volume) {
      const updateVolumeFill = () => {
        (volumeFill ?? volume).style.setProperty('--fill', `${Number(volume.value) * 100}%`);
      };
      volume.addEventListener('input', () => {
        video.volume = Number(volume.value);
        setMuted(video.volume === 0);
        updateVolumeFill();
      });
      updateVolumeFill();
    }
  });
}
