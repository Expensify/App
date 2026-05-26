import {useState} from 'react';

/**
 * Returns the value before the most-recent change — undefined on the first render.
 * Distinct from `usePrevious`, which echoes the current value on first render.
 */
export default function usePreviousValue<T>(value: T): T | undefined {
    const [state, setState] = useState<{current: T; previous: T | undefined}>({current: value, previous: undefined});
    if (state.current !== value) {
        setState({current: value, previous: state.current});
    }
    return state.previous;
}
