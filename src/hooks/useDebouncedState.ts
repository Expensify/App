import CONST from '@src/CONST';

import debounce from 'lodash/debounce';
import {startTransition, useCallback, useEffect, useRef, useState} from 'react';

type UseDebouncedStateResult<T> = [value: T, debouncedValue: T, setValue: (value: T) => void, setDebouncedValue: (value: T) => void, cancelPendingUpdate: () => void];

/**
 * A React hook that provides a state and its debounced version.
 *
 * @param initialValue - The initial value of the state.
 * @param delay - The debounce delay in milliseconds. Defaults to USE_DEBOUNCED_STATE_DELAY = 300ms.
 * @returns A tuple containing:
 *          - The current state value.
 *          - The debounced state value.
 *          - A function to set both the current and debounced state values.
 *          - A function to set the debounced state value immediately.
 *          - A function to cancel a pending debounced update.
 *
 * @template T The type of the state value.
 *
 * @example
 * const [value, debouncedValue, setValue] = useDebouncedState<string>("", 300);
 */
function useDebouncedState<T>(initialValue: T, delay: number = CONST.TIMING.USE_DEBOUNCED_STATE_DELAY): UseDebouncedStateResult<T> {
    const [value, setValue] = useState(initialValue);
    const [debouncedValue, setDebouncedValue] = useState(initialValue);
    const debouncedSetDebouncedValue = useRef(
        debounce((newValue: T) => {
            startTransition(() => setDebouncedValue(newValue));
        }, delay),
    ).current;

    useEffect(() => () => debouncedSetDebouncedValue.cancel(), [debouncedSetDebouncedValue]);

    const handleSetValue = useCallback(
        (newValue: T) => {
            setValue(newValue);
            debouncedSetDebouncedValue(newValue);
        },
        [debouncedSetDebouncedValue],
    );

    return [value, debouncedValue, handleSetValue, setDebouncedValue, debouncedSetDebouncedValue.cancel];
}

export default useDebouncedState;
