import type ChildrenProps from '@src/types/utils/ChildrenProps';

import {useIsFocused} from '@react-navigation/core';
import React from 'react';

import OnyxFocusDefaultContext from './OnyxFocusDefaultContext';

/**
 * Makes navigation focus the default `subscribed` for every `useOnyx` in the subtree: while the screen
 * is blurred, subscriptions stay cache-warm but stop re-rendering; the first render after refocus reads
 * the latest value. An explicit `subscribed` option still wins — use `subscribed: true` for keys that
 * drive effects while blurred. Must be inside a navigator screen (`useIsFocused` throws otherwise) and
 * only covers descendants — wrap the whole screen component, not its children.
 */
function OnyxFocusBoundary({children}: ChildrenProps) {
    const isFocused = useIsFocused();
    return <OnyxFocusDefaultContext.Provider value={isFocused}>{children}</OnyxFocusDefaultContext.Provider>;
}

export default OnyxFocusBoundary;
