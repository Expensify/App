import {useState} from 'react';

import useIsScreenFocused from './useIsScreenFocused';
import useResponsiveLayout from './useResponsiveLayout';

/**
 * Keeps a screen showing what the user last saw while the RHP covers part of it.
 * Returns the live value while the screen has focus, and the value from when it last had focus otherwise,
 * so changes made from the RHP show once it closes instead of shifting the layout visible beside it.
 */
function useLastFocusedValue<TValue>(value: TValue): TValue {
    const isFocused = useIsScreenFocused();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [lastFocusedValue, setLastFocusedValue] = useState(value);

    // On narrow layout the RHP covers the whole screen, so changes can apply while it is hidden.
    // Holding them would make the screen jump as the user navigates back to it.
    const shouldUseLiveValue = isFocused || shouldUseNarrowLayout;

    if (shouldUseLiveValue && !Object.is(lastFocusedValue, value)) {
        // The updater form stores the value as is, even when it is a function
        setLastFocusedValue(() => value);
    }

    return shouldUseLiveValue ? value : lastFocusedValue;
}

export default useLastFocusedValue;
