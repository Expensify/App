import {useEffect, useRef} from 'react';

/**
 * Keeps the last defined value within its recording scope. Changing only the reset key does not
 * record an unchanged value in the new scope.
 */
function usePreviousDefined<T>(value: T): T;
function usePreviousDefined<T>(value: T, resetKey: unknown): T | undefined;
function usePreviousDefined<T>(value: T, resetKey?: unknown): T | undefined {
    const lastDefinedFallback = useRef({value, resetKey});
    const previousValue = useRef(value);

    useEffect(() => {
        // A session change can precede the navigation update. Do not assign that unchanged query to the new account.
        if (Object.is(previousValue.current, value)) {
            return;
        }
        previousValue.current = value;

        if (value === undefined) {
            return;
        }

        lastDefinedFallback.current = {value, resetKey};
    }, [value, resetKey]);

    // This is intentionally using the output of a ref, so that we can return the previous value
    // eslint-disable-next-line react-hooks/refs
    return value ?? (Object.is(lastDefinedFallback.current.resetKey, resetKey) ? lastDefinedFallback.current.value : undefined);
}

export default usePreviousDefined;
