import {AccessibilityInfo} from 'react-native';
import type {NativeMethods} from 'react-native';
import type MoveAccessibilityFocus from './types';

const moveAccessibilityFocus: MoveAccessibilityFocus = (ref) => {
    const focusTarget = ref && 'current' in ref ? ref.current : ref;

    if (!focusTarget) {
        return;
    }

    AccessibilityInfo.sendAccessibilityEvent(focusTarget as NativeMethods, 'focus');

    if ('focus' in focusTarget && typeof focusTarget.focus === 'function') {
        focusTarget.focus();
    }
};

export default moveAccessibilityFocus;
