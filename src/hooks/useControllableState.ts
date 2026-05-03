import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';

type UseControllableStateProps<T> = {
    /** Defined → controlled (consumer owns state); undefined → uncontrolled. */
    value?: T;
    defaultValue: T;
    onChange?: (next: T) => void;
};

function isUpdaterFn<T>(next: SetStateAction<T>): next is (prev: T) => T {
    return typeof next === 'function';
}

/** Radix-style controlled/uncontrolled state with a referentially-stable setter. StrictMode-safe. */
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
