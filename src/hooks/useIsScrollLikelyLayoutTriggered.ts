import {useCallback, useRef} from 'react';
import useDebounce from './useDebounce';

export default function useIsScrollLikelyLayoutTriggered() {
    // A flag to indicate whether the onScroll callback is likely triggered by a layout change (caused by text change) or not
    const isScrollLayoutTriggered = useRef(false);

    /**
     * Reset isScrollLikelyLayoutTriggered to false.
     *
     * The function is debounced with a handpicked wait time to address 2 issues:
     * 1. There is a slight delay between onChangeText and onScroll
     * 2. Layout change will trigger onScroll multiple times
     */
    const debouncedLowerIsScrollLayoutTriggered = useDebounce(
        useCallback(() => (isScrollLayoutTriggered.current = false), []),
        500,
    );

    const raiseIsScrollLayoutTriggered = useCallback(() => {
        isScrollLayoutTriggered.current = true;
        debouncedLowerIsScrollLayoutTriggered();
    }, [debouncedLowerIsScrollLayoutTriggered]);

    return {isScrollLayoutTriggered, raiseIsScrollLayoutTriggered};
}
