import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Restores `window.scrollY` from `location.state.scrollY` (set when navigating away).
 * Mirrors the scroll-restore behaviour from the legacy `frontend/js/app.js`.
 */
export function useScrollRestoration() {
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { scrollY?: number } | null;
    if (state?.scrollY != null) {
      const id = window.requestAnimationFrame(() => {
        window.scrollTo({ top: state.scrollY, behavior: 'instant' as ScrollBehavior });
      });
      return () => window.cancelAnimationFrame(id);
    }
  }, [location.key, location.state]);
}
