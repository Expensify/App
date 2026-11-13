import type {Primitive} from 'type-fest';

import {useState} from 'react';

import useIsScreenFocused from './useIsScreenFocused';
import useResponsiveLayout from './useResponsiveLayout';

/**
 * Keeps a screen showing what the user last saw while the RHP covers part of it.
 * Returns the live value while the screen has focus, and the value from when it last had focus otherwise,
 * so changes made from the RHP show once it closes instead of shifting the layout visible beside it.
 * Only primitives are accepted, since a value rebuilt on every render would never match the stored one and would set state on every render.
 */
function useDeferUntilScreenRevealed<TValue extends Primitive>(value: TValue): TValue {
    const isFocused = useIsScreenFocused();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [deferredValue, setDeferredValue] = useState(value);

    // On narrow layout the RHP covers the whole screen, so changes can apply while it is hidden.
    // Holding them would make the screen jump as the user navigates back to it.
    const shouldUseLiveValue = isFocused || shouldUseNarrowLayout;

    if (shouldUseLiveValue && !Object.is(deferredValue, value)) {
        setDeferredValue(value);
    }

    return shouldUseLiveValue ? value : deferredValue;
}

export default useDeferUntilScreenRevealed;
