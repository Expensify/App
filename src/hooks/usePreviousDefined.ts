import {useEffect, useRef} from 'react';

/**
 * A hook that returns the previous value of a variable
 */
export default function usePreviousDefined<T>(value: T): T {
    const ref = useRef<T>(value);

    useEffect(() => {
        if (value === undefined) {
            return;
        }

        ref.current = value;
    }, [value]);

    // This is intentionally using the output of a ref, so that we can return the previous value
    // eslint-disable-next-line react-hooks/refs
    return ref.current;
}
