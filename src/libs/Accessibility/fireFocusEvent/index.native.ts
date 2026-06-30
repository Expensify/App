import {AccessibilityInfo} from 'react-native';
// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';
import Log from '@libs/Log';

/** Catches stale-handle throws so the orchestrator isn't aborted on Android; iOS silently no-ops on a stale handle. */
function fireFocusEvent(view: View | RNText): void {
    try {
        AccessibilityInfo.sendAccessibilityEvent(view, 'focus');
    } catch (error: unknown) {
        Log.warn('[fireFocusEvent] sendAccessibilityEvent threw', {error});
    }
}

export default fireFocusEvent;
