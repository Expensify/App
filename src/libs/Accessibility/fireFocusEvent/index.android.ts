import {AccessibilityInfo} from 'react-native';
// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';

function fireFocusEvent(view: View | RNText): void {
    AccessibilityInfo.sendAccessibilityEvent(view, 'focus');
    // 'viewHoverEnter' (TYPE_VIEW_HOVER_ENTER) is the explore-by-touch signal TalkBack always honours; pure 'focus' (TYPE_VIEW_FOCUSED) is conditional and doesn't move accessibility focus reliably.
    AccessibilityInfo.sendAccessibilityEvent(view, 'viewHoverEnter');
}

export default fireFocusEvent;
