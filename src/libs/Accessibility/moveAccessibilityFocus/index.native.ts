import {AccessibilityInfo} from 'react-native';
import type {HostInstance} from 'react-native';
import type MoveAccessibilityFocus from './types';
import type {FocusTarget} from './types';
import {isFocusTargetRef} from './utils';

function isHostInstance(focusTarget: unknown): focusTarget is HostInstance {
    return typeof focusTarget === 'object' && focusTarget !== null && ('setNativeProps' in focusTarget || 'measure' in focusTarget || 'focus' in focusTarget);
}

function resolveFocusTarget(focusTarget: FocusTarget): number | HostInstance | null {
    const target = isFocusTargetRef(focusTarget) ? focusTarget.current : focusTarget;

    if (typeof target === 'number') {
        return target;
    }

    if (isHostInstance(target)) {
        return target;
    }

    return null;
}

const moveAccessibilityFocus: MoveAccessibilityFocus = (focusTarget) => {
    if (!focusTarget) {
        return;
    }

    const resolvedFocusTarget = resolveFocusTarget(focusTarget);
    if (!resolvedFocusTarget) {
        return;
    }

    if (typeof resolvedFocusTarget === 'number') {
        AccessibilityInfo.setAccessibilityFocus(resolvedFocusTarget);
        return;
    }

    AccessibilityInfo.sendAccessibilityEvent(resolvedFocusTarget, 'focus');
};

export default moveAccessibilityFocus;
