import {useEffect, useState} from 'react';

/**
 * Returns an initially focused key that is cleared after the first render cycle.
 * This prevents FlashList from auto-scrolling when data changes cause the key
 * to transition from "not found" to "found" (e.g., clearing a search).
 *
 * Note: We use setTimeout instead of requestAnimationFrame because FlashList has a bug
 * where clearing the focused key via requestAnimationFrame causes the list to scroll
 * to the end unexpectedly.
 */
function useInitiallyFocusedKey(computeKey: () => string | undefined): string | undefined {
    const [initiallyFocusedKey, setInitiallyFocusedKey] = useState(computeKey);

    useEffect(() => {
        const id = setTimeout(() => {
            setInitiallyFocusedKey(undefined);
        });
        return () => clearTimeout(id);
    }, []);

    return initiallyFocusedKey;
}

export default useInitiallyFocusedKey;
