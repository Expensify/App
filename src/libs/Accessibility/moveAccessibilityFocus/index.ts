import type MoveAccessibilityFocus from './types';

const moveAccessibilityFocus: MoveAccessibilityFocus = (ref) => {
    const focusTarget = ref && 'current' in ref ? ref.current : ref;

    if (!focusTarget) {
        return;
    }

    if ('focus' in focusTarget && typeof focusTarget.focus === 'function') {
        focusTarget.focus();
    }
};

export default moveAccessibilityFocus;
