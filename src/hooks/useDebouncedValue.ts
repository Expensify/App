import {useEffect, useState} from 'react';
import CONST from '@src/CONST';

/**
 * Returns a debounced version of the given value. The returned value only updates
 * after the source value has stopped changing for the specified delay.
 *
 * Useful for detecting when a user has paused typing by comparing
 * the original value to the debounced value: `value === debouncedValue`.
 */
function useDebouncedValue<T>(value: T, delay: number = CONST.TIMING.USE_DEBOUNCED_STATE_DELAY): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

export default useDebouncedValue;
