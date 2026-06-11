export const enterFullscreen = () => {
  if (typeof window === 'undefined') return;
  const elem = document.documentElement;
  try {
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request blocked or failed:", err);
      });
    } else if ((elem as any).webkitRequestFullscreen) { /* Safari / iOS */
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) { /* IE11 */
      (elem as any).msRequestFullscreen();
    }
  } catch (err) {
    console.error("Error entering fullscreen:", err);
  }
};

export const exitFullscreen = () => {
  if (typeof window === 'undefined') return;
  try {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch((err) => {
        console.warn("Fullscreen exit failed:", err);
      });
    } else if ((document as any).webkitExitFullscreen) { /* Safari / iOS */
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) { /* IE11 */
      (document as any).msExitFullscreen();
    }
  } catch (err) {
    console.error("Error exiting fullscreen:", err);
  }
};

export const isFullscreenActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
};
