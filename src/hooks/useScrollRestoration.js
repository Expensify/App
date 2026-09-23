import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to preserve scroll position of a container when navigating away and back.
 *
 * @param {string} key - Unique key for the scroll position (e.g., route path).
 * @returns {React.RefObject} ref to attach to the scrollable element.
 */
export default function useScrollRestoration(key) {
    const location = useLocation();
    const containerRef = useRef(null);

    useEffect(() => {
        // Restore scroll position when component mounts
        const stored = sessionStorage.getItem(`scroll-${key}`);
        if (stored && containerRef.current) {
            containerRef.current.scrollTop = parseInt(stored, 10);
        }

        // Save scroll position when component unmounts or location changes
        return () => {
            if (containerRef.current) {
                sessionStorage.setItem(`scroll-${key}`, containerRef.current.scrollTop);
            }
        };
    }, [location]);

    return containerRef;
}
