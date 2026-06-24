import {AccessibilityInfo} from 'react-native';
// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';
import Log from '@libs/Log';

/** Returns false when `sendAccessibilityEvent` throws on a stale native handle — react-native-screens detach can leave the JS ref non-null while the RCTView is dead. */
function fireFocusEvent(view: View | RNText): boolean {
    try {
        AccessibilityInfo.sendAccessibilityEvent(view, 'focus');
        return true;
    } catch (error: unknown) {
        Log.warn('[fireFocusEvent] sendAccessibilityEvent threw', {error});
        return false;
    }
}

export default fireFocusEvent;
