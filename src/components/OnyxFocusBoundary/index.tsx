import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import {useIsFocused} from '@react-navigation/core';
import React, {useDeferredValue} from 'react';
// eslint-disable-next-line no-restricted-imports
import {useOnyx as originalUseOnyx} from 'react-native-onyx';

import OnyxFocusDefaultContext from './OnyxFocusDefaultContext';

/**
 * Makes navigation focus the default `subscribed` for every `useOnyx` in the subtree: blurred screens
 * stay cache-warm but stop re-rendering. An explicit `subscribed: true` opts a key out (e.g. for
 * effects that must run while blurred). Wrap the whole screen component — must be inside a navigator
 * screen, and only descendants are covered.
 *
 * `isFocused && deferredIsFocused`: blur closes the gate urgently, refocus opens it in the deferred
 * lane so the catch-up re-render yields to the navigation animation.
 */
function OnyxFocusBoundary({children}: ChildrenProps) {
    const isFocused = useIsFocused();
    const deferredIsFocused = useDeferredValue(isFocused);
    // Temporary Test Tools toggle, read once per boundary; off = `undefined` = "no boundary".
    const [shouldFollowFocus] = originalUseOnyx(ONYXKEYS.SHOULD_ONYX_SUBSCRIBED_FOLLOW_FOCUS);

    const subscribedDefault = shouldFollowFocus ? isFocused && deferredIsFocused : undefined;

    return <OnyxFocusDefaultContext.Provider value={subscribedDefault}>{children}</OnyxFocusDefaultContext.Provider>;
}

export default OnyxFocusBoundary;
