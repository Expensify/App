import {useEffect, useRef} from 'react';

/**
 * Returns the value from the previous render — `undefined` on the first render.
 * Prefer this over `usePrevious` for transition detection that needs to distinguish "first render"
 * from "value changed to X"; `usePrevious` echoes the current value on first render.
 */
export default function usePreviousValue<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}
