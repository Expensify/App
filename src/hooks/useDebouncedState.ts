import Log from '@libs/Log';

import CONST from '@src/CONST';

import debounce from 'lodash/debounce';
import {useCallback, useEffect, useRef, useState} from 'react';

type UseDebouncedStateOptions<T> = {
    /** Called when the debounce timer fires with a value that differs from the previous debounced value, before the state update renders. */
    onDebouncedValueChange?: (value: T) => void;
};

/**
 * A React hook that provides a state and its debounced version.
 *
 * @param initialValue - The initial value of the state.
 * @param delay - The debounce delay in milliseconds. Defaults to USE_DEBOUNCED_STATE_DELAY = 300ms.
 * @param options - Optional `onDebouncedValueChange` callback.
 * @returns A tuple containing:
 *          - The current state value.
 *          - The debounced state value.
 *          - A function to set both the current and debounced state values.
 *
 * @template T The type of the state value.
 *
 * @example
 * const [value, debouncedValue, setValue] = useDebouncedState<string>("", 300);
 */
function useDebouncedState<T>(initialValue: T, delay: number = CONST.TIMING.USE_DEBOUNCED_STATE_DELAY, options?: UseDebouncedStateOptions<T>): [T, T, (value: T) => void] {
    const [value, setValue] = useState(initialValue);
    const [debouncedValue, setDebouncedValue] = useState(initialValue);
    const onDebouncedValueChangeRef = useRef(options?.onDebouncedValueChange);
    const lastDebouncedValueRef = useRef(initialValue);
    // The lazy initializer runs once, so the debounced function (and the refs it closes over) stays stable across renders.
    const [debouncedSetDebouncedValue] = useState(() =>
        debounce((newValue: T) => {
            if (!Object.is(lastDebouncedValueRef.current, newValue)) {
                lastDebouncedValueRef.current = newValue;
                try {
                    onDebouncedValueChangeRef.current?.(newValue);
                } catch (error) {
                    Log.warn('[useDebouncedState] onDebouncedValueChange threw an error', {error});
                }
            }
            setDebouncedValue(newValue);
        }, delay),
    );

    useEffect(() => {
        onDebouncedValueChangeRef.current = options?.onDebouncedValueChange;
    });

    useEffect(() => () => debouncedSetDebouncedValue.cancel(), [debouncedSetDebouncedValue]);

    const handleSetValue = useCallback(
        (newValue: T) => {
            setValue(newValue);
            debouncedSetDebouncedValue(newValue);
        },
        [debouncedSetDebouncedValue],
    );

    return [value, debouncedValue, handleSetValue];
}

export default useDebouncedState;
