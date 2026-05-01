import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';

type UseControllableStateProps<T> = {
    /** Controlled value. When defined, the consumer owns the state. */
    value?: T;
    /** Initial value used when uncontrolled (`value` is `undefined`). */
    defaultValue: T;
    /** Notification on transitions. In controlled mode it is the back-channel; in uncontrolled mode it fires after every real change. */
    onChange?: (next: T) => void;
};

function isUpdaterFn<T>(next: SetStateAction<T>): next is (prev: T) => T {
    return typeof next === 'function';
}

/**
 * Radix-style controlled/uncontrolled state. Returns the resolved value and a referentially-stable setter:
 * controlled mode calls `onChange` on real transitions; uncontrolled mode drives internal state and fires `onChange` once per change (StrictMode-safe).
 */
function useControllableState<T>({value, defaultValue, onChange}: UseControllableStateProps<T>): [T, Dispatch<SetStateAction<T>>] {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<T>(value !== undefined ? value : defaultValue);
    const resolvedValue: T = value !== undefined ? value : internalValue;

    const isControlledRef = useRef(isControlled);
    const resolvedValueRef = useRef(resolvedValue);
    const onChangeRef = useRef(onChange);
    useLayoutEffect(() => {
        isControlledRef.current = isControlled;
        resolvedValueRef.current = resolvedValue;
        onChangeRef.current = onChange;
    });

    const previousValueRef = useRef(resolvedValue);
    useEffect(() => {
        if (Object.is(previousValueRef.current, resolvedValue)) {
            return;
        }
        previousValueRef.current = resolvedValue;
        if (isControlled) {
            return;
        }
        onChange?.(resolvedValue);
    }, [resolvedValue, isControlled, onChange]);

    const [setValue] = useState<Dispatch<SetStateAction<T>>>(() => (next: SetStateAction<T>) => {
        if (isControlledRef.current) {
            const current = resolvedValueRef.current;
            const resolved = isUpdaterFn(next) ? next(current) : next;
            if (!Object.is(resolved, current)) {
                onChangeRef.current?.(resolved);
            }
            return;
        }
        setInternalValue(next);
    });

    return [resolvedValue, setValue];
}

export default useControllableState;
export type {UseControllableStateProps};
