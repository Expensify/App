import Log from '@libs/Log';

import type {Dispatch, SetStateAction} from 'react';

import {useInsertionEffect, useRef, useState} from 'react';

function isUpdater<T>(action: SetStateAction<T>): action is (previous: T) => T {
    return typeof action === 'function';
}

function useControlledState<T>(controlledValue: T | undefined, defaultValue: T, onChange?: (next: T) => void): [T, Dispatch<SetStateAction<T>>] {
    // setValue is permanently stable (React's setState contract) and reads the latest values via refs — a shape OXC can't memoize, so opt both compilers out to avoid a divergence.
    'use no memo';
    const isControlled = controlledValue !== undefined;
    const [internal, setInternal] = useState(controlledValue !== undefined ? controlledValue : defaultValue);
    const current = controlledValue !== undefined ? controlledValue : internal;

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
