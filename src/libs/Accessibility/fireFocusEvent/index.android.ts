import {AccessibilityInfo, findNodeHandle, NativeModules} from 'react-native';
// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';

type AccessibilityFocusBridge = {
    setAccessibilityFocus: (reactTag: number) => void;
};

declare module 'react-native' {
    interface NativeModulesStatic {
        RNAccessibilityFocus?: AccessibilityFocusBridge;
    }
}

/*
 * `sendAccessibilityEvent('focus')` only dispatches a notification on Android; TalkBack ignores it
 * when it already has a focus claim. The native module performs `ACTION_ACCESSIBILITY_FOCUS`, the
 * only API that actually moves focus. JS fallback covers pre-rebuild dev bundles.
 */
function fireFocusEvent(view: View | RNText): void {
    const handle = findNodeHandle(view);
    if (handle == null) {
        return;
    }
    if (NativeModules.RNAccessibilityFocus) {
        NativeModules.RNAccessibilityFocus.setAccessibilityFocus(handle);
        return;
    }
    AccessibilityInfo.sendAccessibilityEvent(view, 'focus');
}

export default fireFocusEvent;
