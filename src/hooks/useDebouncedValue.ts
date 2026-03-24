import {useEffect, useState} from 'react';
import CONST from '@src/CONST';

/**
 * Returns a debounced version of the given value. The returned value only updates
 * after the source value has stopped changing for the specified delay.
 *
 * Initializes as undefined so the first debounce cycle must complete before
 * `value === debouncedValue` can be true. This prevents false positives
 * on mount when using the hook to detect typing pauses.
 */
function useDebouncedValue<T>(value: T, delay: number = CONST.TIMING.USE_DEBOUNCED_STATE_DELAY): T {
    const [debouncedValue, setDebouncedValue] = useState<T | undefined>(undefined);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue as T;
}

export default useDebouncedValue;
