import {useEffect, useState} from 'react';
import CONST from '@src/CONST';

/**
 * Returns a debounced version of the given value.
 * The first update must complete before equality checks can succeed.
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
