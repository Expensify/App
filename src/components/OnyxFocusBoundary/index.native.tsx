import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import {useIsFocused} from '@react-navigation/core';
import React, {useDeferredValue} from 'react';
// eslint-disable-next-line no-restricted-imports
import {useOnyx as originalUseOnyx} from 'react-native-onyx';

import OnyxFocusDefaultContext from './OnyxFocusDefaultContext';

/**
 * Native variant — see index.tsx for the full contract. Blur closes in the deferred lane too:
 * at press time the JS thread is busy mounting the next screen and background writes land after
 * the transition, so an urgent close costs render time without muting anything.
 */
function OnyxFocusBoundary({children}: ChildrenProps) {
    const isFocused = useIsFocused();
    const deferredIsFocused = useDeferredValue(isFocused);
    // Temporary Test Tools toggle, read once per boundary; off = `undefined` = "no boundary".
    const [shouldFollowFocus] = originalUseOnyx(ONYXKEYS.SHOULD_ONYX_SUBSCRIBED_FOLLOW_FOCUS);

    const subscribedDefault = shouldFollowFocus ? deferredIsFocused : undefined;

    return <OnyxFocusDefaultContext.Provider value={subscribedDefault}>{children}</OnyxFocusDefaultContext.Provider>;
}

export default OnyxFocusBoundary;
