export async function safePlay(media: HTMLMediaElement): Promise<void> {
  if (!media) return;
  try {
    await media.play();
    return;
  } catch (err) {
    // If autoplay was blocked, attempt to mute and retry (common mobile pattern)
    console.warn('[mediaHelpers] initial play blocked', err);
    try {
      media.muted = true;
      await media.play();
      console.debug('[mediaHelpers] play succeeded after muting');
      // leave media muted so autoplay can continue; caller may unmute after user gesture
      return;
    } catch (err2) {
      console.warn('[mediaHelpers] play still blocked after muting', err2);
      // Fallback: attach a one-time user gesture to try again
      attachGestureToPlay(media);
      return;
    }
  }
}

function attachGestureToPlay(media: HTMLMediaElement) {
  const handler = async () => {
    try {
      await media.play();
      console.debug('[mediaHelpers] play succeeded after user gesture');
    } catch (e) {
      console.warn('[mediaHelpers] play failed after user gesture', e);
    } finally {
      removeListeners();
    }
  };

  const removeListeners = () => {
    document.removeEventListener('pointerdown', handler);
    document.removeEventListener('touchstart', handler);
    document.removeEventListener('click', handler);
  };

  document.addEventListener('pointerdown', handler, { once: true });
  document.addEventListener('touchstart', handler, { once: true });
  document.addEventListener('click', handler, { once: true });
}

export function setupUserGestureUnlock(callback: () => void) {
  const handler = () => {
    try {
      callback();
    } catch (e) {
      console.warn('[mediaHelpers] user gesture callback error', e);
    } finally {
      document.removeEventListener('pointerdown', handler);
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('click', handler);
    }
  };

  document.addEventListener('pointerdown', handler, { once: true });
  document.addEventListener('touchstart', handler, { once: true });
  document.addEventListener('click', handler, { once: true });
}

export default {};
