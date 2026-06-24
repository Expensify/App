import {AccessibilityInfo} from 'react-native';
// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';
import Log from '@libs/Log';

/** A non-null JS ref doesn't mean the native handle is alive (react-native-screens detach). Catch + log so a stale-handle throw doesn't silently abort the restore. */
function fireFocusEvent(view: View | RNText): void {
    try {
        AccessibilityInfo.sendAccessibilityEvent(view, 'focus');
    } catch (error: unknown) {
        Log.warn('[fireFocusEvent] sendAccessibilityEvent threw', {error});
    }
}

export default fireFocusEvent;
