import {TAB_SELECTOR_SCROLL_MARGIN_INLINE_PX} from './const';
import type {ScrollToTabProps} from './types';

function scrollToTab({containerX, tabX, tabWidth, animated = true, containerRef, containerWidth}: ScrollToTabProps) {
    if (!containerRef.current) {
        return;
    }

    const leftSideCut = containerX > tabX;
    const rightSideCut = tabX + tabWidth >= containerX + containerWidth - TAB_SELECTOR_SCROLL_MARGIN_INLINE_PX;
    if (!leftSideCut && !rightSideCut) {
        return;
    }

    if (rightSideCut) {
        const rightSideCutLength = tabX + tabWidth - (containerWidth + containerX);
        containerRef.current.scrollTo({x: containerX + rightSideCutLength + TAB_SELECTOR_SCROLL_MARGIN_INLINE_PX, animated});
        return;
    }

    containerRef.current.scrollTo({x: tabX - TAB_SELECTOR_SCROLL_MARGIN_INLINE_PX, animated});
}

export default scrollToTab;
