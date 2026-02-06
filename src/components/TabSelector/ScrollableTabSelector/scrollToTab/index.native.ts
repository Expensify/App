import {TAB_SELECTOR_SCROLL_MARGIN_INLINE_PX} from './const';
import type {ScrollToTabProps} from './types';

function scrollToTab({containerX, tabX, tabWidth, animated = true, containerRef, containerWidth}: ScrollToTabProps) {
    if (!containerRef.current) {
        return;
    }

    const isTabLeftSideCut = containerX > tabX;
    const isTabRightSideCut = tabX + tabWidth >= containerX + containerWidth - TAB_SELECTOR_SCROLL_MARGIN_INLINE_PX;
    if (!isTabLeftSideCut && !isTabRightSideCut) {
        return;
    }

    if (isTabRightSideCut) {
        const tabCutLengthOnRight = tabX + tabWidth - (containerWidth + containerX);
        containerRef.current.scrollTo({x: containerX + tabCutLengthOnRight + TAB_SELECTOR_SCROLL_MARGIN_INLINE_PX, animated});
        return;
    }

    containerRef.current.scrollTo({x: tabX - TAB_SELECTOR_SCROLL_MARGIN_INLINE_PX, animated});
}

export default scrollToTab;
