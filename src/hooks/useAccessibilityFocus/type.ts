import type {RefObject} from 'react';

type UseAccessibilityFocusParams = {
    didScreenTransitionEnd: boolean;
    isFocused: boolean;
    ref: RefObject<unknown>;
    shouldMoveAccessibilityFocus: boolean;
};

type UseAccessibilityFocus = (params: UseAccessibilityFocusParams) => void;

export default UseAccessibilityFocus;
