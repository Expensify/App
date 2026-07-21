import Log from '@libs/Log';

import type {Dispatch, SetStateAction} from 'react';

import {useInsertionEffect, useRef, useState} from 'react';

function useControlledState<T>(controlledValue: T | undefined, defaultValue: T, onChange?: (next: T) => void): [T, Dispatch<SetStateAction<T>>] {
    const isControlled = controlledValue !== undefined;
    const [internal, setInternal] = useState(isControlled ? (controlledValue as T) : defaultValue);
    const current = isControlled ? (controlledValue as T) : internal;

    const currentRef = useRef(current);
    const cachedRef = useRef(current);
    const onChangeRef = useRef(onChange);
    const isControlledRef = useRef(isControlled);

    useInsertionEffect(() => {
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
            const reference = isControlledRef.current ? currentRef.current : cachedRef.current;
            const resolved = isUpdater(action) ? action(reference) : action;
            if (Object.is(resolved, reference)) {
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
