import Log from '@libs/Log';

// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';

import {AccessibilityInfo} from 'react-native';

/**
 * Returns `false` on Android when `sendAccessibilityEvent` throws on a stale native handle so the caller can fall
 * through to the retry budget. iOS silently no-ops on a stale handle and returns `true` (no way to distinguish).
 */
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
