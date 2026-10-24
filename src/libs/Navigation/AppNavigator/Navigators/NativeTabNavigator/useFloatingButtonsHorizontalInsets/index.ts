import type FloatingButtonsHorizontalInsets from './types';

const NO_INSETS: FloatingButtonsHorizontalInsets = {left: 0, right: 0};

/** The tab host already sits inside the horizontal safe area, so the floating buttons need no insets of their own. */
function useFloatingButtonsHorizontalInsets(): FloatingButtonsHorizontalInsets {
    return NO_INSETS;
}

export default useFloatingButtonsHorizontalInsets;
