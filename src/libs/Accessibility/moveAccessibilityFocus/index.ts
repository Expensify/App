import type MoveAccessibilityFocus from './types';

const moveAccessibilityFocus: MoveAccessibilityFocus = (ref) => {
    if (!ref || !('current' in ref) || !ref.current) {
        return;
    }
    ref.current.focus();
};

export default moveAccessibilityFocus;
