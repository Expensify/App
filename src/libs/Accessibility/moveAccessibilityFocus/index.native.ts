import {AccessibilityInfo} from 'react-native';
import type {NativeMethods} from 'react-native';
import type MoveAccessibilityFocus from './types';
import type {FocusTarget} from './types';

type FocusTargetRef = {
    current: unknown;
};

function isFocusTargetRef(focusTarget: FocusTarget): focusTarget is FocusTargetRef {
    return typeof focusTarget === 'object' && focusTarget !== null && 'current' in focusTarget;
}

function isNativeMethods(focusTarget: unknown): focusTarget is NativeMethods {
    return typeof focusTarget === 'object' && focusTarget !== null && ('setNativeProps' in focusTarget || 'measure' in focusTarget);
}

function resolveFocusTarget(focusTarget: FocusTarget): number | NativeMethods | null {
    const target = isFocusTargetRef(focusTarget) ? focusTarget.current : focusTarget;

    if (typeof target === 'number') {
        return target;
    }

    if (isNativeMethods(target)) {
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
