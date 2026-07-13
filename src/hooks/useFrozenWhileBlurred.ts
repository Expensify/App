import {useState} from 'react';

/**
 * Freezes a value while the screen is blurred, returning the last value seen while focused.
 *
 * Onyx subscriptions cannot be paused, so a background write (e.g. a message sent in an RHP layered on top of a
 * blurred screen) still hands derived values fresh references every render. Passing such a churning reference into a
 * `memo()`-wrapped child breaks its boundary and re-renders it even though it isn't visible. This hook absorbs that
 * churn: while `isFocused` is false it keeps returning the reference captured at the last focused render, so a
 * downstream `memo()` short-circuits. On refocus it resyncs to the live value, so the child reflects anything that
 * changed while blurred.
 *
 * Uses the "storing information from previous renders" pattern
 * (https://react.dev/reference/react/useState#storing-information-from-previous-renders) — the equality guard bounds
 * the re-render to a single extra pass and keeps the setState-during-render from looping.
 */
function useFrozenWhileBlurred<T>(value: T, isFocused: boolean): T {
    const [frozen, setFrozen] = useState(value);

    if (isFocused && !Object.is(frozen, value)) {
        setFrozen(value);
    }

    return isFocused ? value : frozen;
}

export default useFrozenWhileBlurred;
