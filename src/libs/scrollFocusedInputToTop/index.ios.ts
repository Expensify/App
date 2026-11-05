import type {ScrollFocusedInputToTop} from './types';

/** Extra space left between the focused input and the top of the visible scroll area after scrolling. */
const EXTRA_SCROLL_PADDING = 16;

/**
 * Scrolls the focused input to the top of the scroll view. Meant to be called from the scroll view's `onLayout`.
 */
const scrollFocusedInputToTop: ScrollFocusedInputToTop = (scrollViewRef, scrollContentRef, inputRef) => {
    const input = inputRef.current;
    const scrollContent = scrollContentRef.current;
    if (!input || !scrollContent || !input.isFocused()) {
        return;
    }

    input.measureLayout(scrollContent, (_x, y) => {
        scrollViewRef.current?.scrollTo({y: Math.max(y - EXTRA_SCROLL_PADDING, 0), animated: false});
    });
};

export default scrollFocusedInputToTop;
