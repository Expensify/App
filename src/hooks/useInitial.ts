import {useRef} from 'react';

/**
 * A hook that returns the initial non-undefined value of a variable.
 *
 * @param value The value to evaluate.
 * @returns The first non-undefined value passed to the hook.
 */
function useInitial<T>(value: T | undefined): T | undefined {
    const initialValueRef = useRef<T | undefined>(undefined);
    if (initialValueRef.current === undefined && value !== undefined) {
        initialValueRef.current = value;
    }

    return initialValueRef.current;
}

export default useInitial;
