import {useState} from 'react';

/**
 * Calls `onChange` during render whenever `value` changes, using React's
 * render-time state adjustment pattern.
 *
 * Unlike useEffect, there is no intermediate commit with stale state —
 * React discards the first render and immediately re-renders with whatever
 * state onChange sets, producing a single DOM commit.
 *
 * The callback must only call setState (or other render-safe operations).
 * Side effects (API calls, subscriptions, mutations) belong in useEffect.
 *
 * See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 */
function useOnValueChange<T>(value: T, onChange: (prevValue: T, nextValue: T) => void): void {
    const [prev, setPrev] = useState<T>(value);
    if (!Object.is(prev, value)) {
        setPrev(value);
        onChange(prev, value);
    }
}

export default useOnValueChange;
