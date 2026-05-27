import {AccessibilityInfo} from 'react-native';
// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';

function fireFocusEvent(view: View | RNText): void {
    AccessibilityInfo.sendAccessibilityEvent(view, 'focus');
}

export default fireFocusEvent;
