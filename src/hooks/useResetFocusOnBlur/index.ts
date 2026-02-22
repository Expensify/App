import {useEffect, useRef} from 'react';
import type {View} from 'react-native';

/**
 * Resets focusedIndex to -1 when focus leaves the container element.
 * Uses the DOM focusout event to detect when focus moves outside.
 */
function useResetFocusOnBlur(setFocusedIndex: (index: number) => void) {
    const containerRef = useRef<View>(null);

    useEffect(() => {
        const container = containerRef.current as unknown as HTMLElement | null;
        if (!container) {
            return;
        }
        const handleFocusOut = (event: FocusEvent) => {
            if (event.relatedTarget instanceof Node && container.contains(event.relatedTarget)) {
                return;
            }
            setFocusedIndex(-1);
        };
        container.addEventListener('focusout', handleFocusOut);
        return () => container.removeEventListener('focusout', handleFocusOut);
    }, [setFocusedIndex]);

    return containerRef;
}

export default useResetFocusOnBlur;
