import debounce from 'lodash/debounce';
import {useEffect, useRef, useState} from 'react';
import CONST from '@src/CONST';

/**
 * A React hook that provides a state and its debounced version.
 *
 * @param initialValue - The initial value of the state.
 * @param delay - The debounce delay in milliseconds. Defaults to SEARCH_OPTION_LIST_DEBOUNCE_TIME = 300ms.
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
function useDebouncedState<T>(initialValue: T, delay = CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME): [T, T, (value: T) => void] {
    const [value, setValue] = useState(initialValue);
    const [debouncedValue, setDebouncedValue] = useState(initialValue);
    const debouncedSetDebouncedValue = useRef(debounce(setDebouncedValue, delay)).current;

    useEffect(() => () => debouncedSetDebouncedValue.cancel(), [debouncedSetDebouncedValue]);

    const handleSetValue = (newValue: T) => {
        setValue(newValue);
        debouncedSetDebouncedValue(newValue);
    };

    return [value, debouncedValue, handleSetValue];
}

export default useDebouncedState;
