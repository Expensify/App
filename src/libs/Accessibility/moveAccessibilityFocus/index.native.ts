import {AccessibilityInfo} from 'react-native';
import type {ReactNativeElement} from 'react-native';
import type MoveAccessibilityFocus from './types';

const moveAccessibilityFocus: MoveAccessibilityFocus = (ref) => {
    const focusTarget = ref && 'current' in ref ? ref.current : ref;

    if (!focusTarget) {
        return;
    }

    AccessibilityInfo.sendAccessibilityEvent(focusTarget as ReactNativeElement, 'focus');

    if ('focus' in focusTarget && typeof focusTarget.focus === 'function') {
        focusTarget.focus();
    }
};

export default moveAccessibilityFocus;
