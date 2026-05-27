import {AccessibilityInfo} from 'react-native';
// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports -- .android.ts only; the wrapper resolves to the native findNodeHandle, and the rule guards web bundles.
import findNodeHandle from '@src/utils/findNodeHandle';

function fireFocusEvent(view: View | RNText): void {
    if (findNodeHandle(view) == null) {
        return;
    }
    AccessibilityInfo.sendAccessibilityEvent(view, 'focus');
}

export default fireFocusEvent;
