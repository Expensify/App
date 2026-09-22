import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Persist scroll position for each pathname.
 *
 * The hook stores the current scrollY in sessionStorage whenever the user scrolls.
 * When the component mounts (or the pathname changes), it restores the scroll
 * position from sessionStorage if available.
 *
 * This is a lightweight solution that works for both desktop and mobile browsers.
 */
export default function usePersistScroll() {
  const location = useLocation();

  useEffect(() => {
    const key = `scroll-${location.pathname}`;

    // Restore scroll position on mount
    const saved = sessionStorage.getItem(key);
    if (saved) {
      window.scrollTo(0, parseInt(saved, 10));
    }

    // Store scroll position on scroll
    const handleScroll = () => {
      sessionStorage.setItem(key, window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll);

    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);
}
