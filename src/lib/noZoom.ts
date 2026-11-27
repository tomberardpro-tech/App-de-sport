/**
 * iOS (Safari et Chrome) ignore « user-scalable=no » depuis iOS 10.
 * On bloque donc les gestes de zoom à la main pour un comportement d'app native.
 */
export function disableZoom() {
  const stop = (e: Event) => e.preventDefault();
  // Pincement (événements propres à Safari iOS)
  document.addEventListener('gesturestart', stop, { passive: false });
  document.addEventListener('gesturechange', stop, { passive: false });
  document.addEventListener('gestureend', stop, { passive: false });
  // Pincement à deux doigts (autres navigateurs)
  document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  // Double-tap rapide
  let lastTouch = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    const target = e.target as HTMLElement | null;
    const isField = target?.closest('input, textarea');
    if (!isField && now - lastTouch < 300) e.preventDefault();
    lastTouch = now;
  }, { passive: false });
}
