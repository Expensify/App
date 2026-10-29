import Log from '@libs/Log';

import CONST from '@src/CONST';

import {useEffect, useEffectEvent, useState} from 'react';

type UseDebouncedStateOptions<T> = {
    /**
     * Called when the debounce timer fires with a value that differs from the previous debounced value, before the state update renders.
     * The delay is counted from the commit of the new value, and the callback is not called if the hook unmounts while a value is pending.
     */
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
 *          - A function to set the current state value; the debounced value follows it after the delay.
 *
 * @template T The type of the state value.
 *
 * @example
 * const [value, debouncedValue, setValue] = useDebouncedState<string>("", 300);
 */
function useDebouncedState<T>(initialValue: T, delay: number = CONST.TIMING.USE_DEBOUNCED_STATE_DELAY, options?: UseDebouncedStateOptions<T>): [T, T, (value: T) => void] {
    const [value, setValue] = useState(initialValue);
    const [debouncedValue, setDebouncedValue] = useState(initialValue);

    const flushDebouncedValue = useEffectEvent((nextValue: T) => {
        try {
            options?.onDebouncedValueChange?.(nextValue);
        } catch (error) {
            Log.warn('[useDebouncedState] onDebouncedValueChange threw an error', {error});
        }
        setDebouncedValue(nextValue);
    });

    useEffect(() => {
        if (Object.is(value, debouncedValue)) {
            return;
        }
        const timeoutID = setTimeout(() => flushDebouncedValue(value), delay);
        return () => clearTimeout(timeoutID);
    }, [value, debouncedValue, delay]);

    return [value, debouncedValue, setValue];
}

export default useDebouncedState;
