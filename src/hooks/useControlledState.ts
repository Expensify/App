import {useLayoutEffect, useRef, useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import Log from '@libs/Log';

function useControlledState<T>(controlledValue: T | undefined, defaultValue: T, onChange?: (next: T) => void): [T, Dispatch<SetStateAction<T>>] {
    const isControlled = controlledValue !== undefined;
    const [internal, setInternal] = useState(isControlled ? (controlledValue as T) : defaultValue);
    const current = isControlled ? (controlledValue as T) : internal;

    const currentRef = useRef(current);
    const cachedRef = useRef(current);
    const onChangeRef = useRef(onChange);
    const isControlledRef = useRef(isControlled);

    useLayoutEffect(() => {
        currentRef.current = current;
        cachedRef.current = current;
        onChangeRef.current = onChange;
        if (__DEV__ && isControlledRef.current !== isControlled) {
            Log.warn(
                `[useControlledState] component is changing ${isControlledRef.current ? 'a controlled' : 'an uncontrolled'} input to ${isControlled ? 'controlled' : 'uncontrolled'}. Components should not switch between controlled and uncontrolled.`,
            );
        }
        isControlledRef.current = isControlled;
    });

    const [setValue] = useState<Dispatch<SetStateAction<T>>>(() => {
        const isUpdater = (a: SetStateAction<T>): a is (prevState: T) => T => typeof a === 'function';
        const apply: Dispatch<SetStateAction<T>> = (action) => {
            const resolved = isUpdater(action) ? action(cachedRef.current) : action;
            // Dedup against the committed value when controlled (so a retry after a silent parent rejection still fires
            // onChange) and against the pending value when uncontrolled (so chained same-tick updates compose).
            const dedupeAgainst = isControlledRef.current ? currentRef.current : cachedRef.current;
            if (Object.is(resolved, dedupeAgainst)) {
                return;
            }
            cachedRef.current = resolved;
            if (!isControlledRef.current) {
                setInternal(resolved);
            }
            onChangeRef.current?.(resolved);
        };
        return apply;
    });

    return [current, setValue];
}

export default useControlledState;
