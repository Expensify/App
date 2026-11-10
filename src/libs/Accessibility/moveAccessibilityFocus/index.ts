import type MoveAccessibilityFocus from './types';

const moveAccessibilityFocus: MoveAccessibilityFocus = (target) => {
    if (!target) {
        return;
    }
    const element = 'current' in target ? target.current : target;
    element?.focus();
};

export default moveAccessibilityFocus;
