import ONYXKEYS from '@src/ONYXKEYS';

import {use} from 'react';
// eslint-disable-next-line no-restricted-imports
import {useOnyx as originalUseOnyx} from 'react-native-onyx';

import OnyxFocusDefaultContext from './OnyxFocusDefaultContext';

/**
 * The `subscribed` default from the nearest `OnyxFocusBoundary` (`true` when none, or while the
 * Test Tools toggle is off — same gate as the `useOnyx` wrapper). For call sites that import `useOnyx`
 * directly from `react-native-onyx` and bypass the wrapper:
 *
 *     const [value] = originalUseOnyx(key, {subscribed: useOnyxFocusDefault()});
 */
function useOnyxFocusDefault(): boolean {
    const [shouldSubscribedFollowFocus] = originalUseOnyx(ONYXKEYS.SHOULD_ONYX_SUBSCRIBED_FOLLOW_FOCUS);
    const contextDefault = use(OnyxFocusDefaultContext);
    return shouldSubscribedFollowFocus ? (contextDefault ?? true) : true;
}

export default useOnyxFocusDefault;
