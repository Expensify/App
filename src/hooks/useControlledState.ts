import Log from '@libs/Log';

import type {Dispatch, SetStateAction} from 'react';

import {useEffect, useRef, useState} from 'react';

function isUpdater<T>(action: SetStateAction<T>): action is (previous: T) => T {
    return typeof action === 'function';
}

function useControlledState<T>(controlledValue: T | undefined, defaultValue: T, onChange?: (next: T) => void): [T, Dispatch<SetStateAction<T>>] {
    const isControlled = controlledValue !== undefined;
    const [internal, setInternal] = useState(controlledValue !== undefined ? controlledValue : defaultValue);
    const current = controlledValue !== undefined ? controlledValue : internal;
    const cachedRef = useRef(current);
    const wasControlledRef = useRef(isControlled);
    useEffect(() => {
        if (__DEV__ && wasControlledRef.current !== isControlled) {
            Log.warn(
                `[useControlledState] component is changing ${wasControlledRef.current ? 'a controlled' : 'an uncontrolled'} input to ${isControlled ? 'controlled' : 'uncontrolled'}. Components should not switch between controlled and uncontrolled.`,
            );
        }
        wasControlledRef.current = isControlled;
    });

    const setValue: Dispatch<SetStateAction<T>> = (action) => {
        const reference = isControlled ? current : cachedRef.current;
        const resolved = isUpdater(action) ? action(reference) : action;
        if (Object.is(resolved, reference)) {
            return;
        }
        cachedRef.current = resolved;
        if (!isControlled) {
            setInternal(resolved);
        }
        onChange?.(resolved);
    };

    return [current, setValue];
}

export default useControlledState;
