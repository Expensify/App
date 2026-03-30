import type MoveAccessibilityFocus from './types';
import type {FocusTarget} from './types';
import {isFocusTargetRef} from './utils';

function resolveFocusTarget(focusTarget: FocusTarget): HTMLOrSVGElement | null {
    const target = isFocusTargetRef(focusTarget) ? focusTarget.current : focusTarget;

    if (typeof target === 'number') {
        return null;
    }

    if (!target || typeof target !== 'object' || !('focus' in target)) {
        return null;
    }

    return target as HTMLOrSVGElement;
}

const moveAccessibilityFocus: MoveAccessibilityFocus = (focusTarget) => {
    if (!focusTarget) {
        return;
    }

    const resolvedFocusTarget = resolveFocusTarget(focusTarget);
    resolvedFocusTarget?.focus();
};

export default moveAccessibilityFocus;
