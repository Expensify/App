import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * A hook that tracks scrolling state to block certain actions during scroll events.
 * Since scroll events don't provide an "end" callback, this implements uses a timeout
 * to detect when scrolling has likely stopped (300ms delay).
 */
export default function useScrollBlocker() {
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startScrollBlock = useCallback(() => {
        setIsScrolling(true);
    }, []);

    const endScrollBlock = useCallback(() => {
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
        }, 300);
    }, []);

    useEffect(() => {
        return () => {
            if (!scrollTimeoutRef.current) {
                return;
            }
            clearTimeout(scrollTimeoutRef.current);
        };
    }, []);

    return {isScrolling, startScrollBlock, endScrollBlock};
}
