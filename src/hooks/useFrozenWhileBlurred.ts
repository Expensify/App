import {useState} from 'react';

/**
 * Freezes a value while the screen is blurred, returning the last value seen while focused.
 *
 * Onyx subscriptions can't be paused, so a background write (e.g. a message sent in an RHP over a blurred screen)
 * still hands derived values fresh references every render, breaking a downstream `memo()` boundary and re-rendering
 * offscreen children. While blurred this returns the reference captured at the last focused render so `memo()`
 * short-circuits; on refocus it resyncs to the live value.
 */
function useFrozenWhileBlurred<T>(value: T, isFocused: boolean): T {
    const [frozen, setFrozen] = useState(value);

    if (isFocused && !Object.is(frozen, value)) {
        setFrozen(value);
    }

    return isFocused ? value : frozen;
}

export default useFrozenWhileBlurred;
