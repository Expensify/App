import variables from '@styles/variables';
import type {ScrollToTabProps} from './types';

function scrollToTab({containerX, tabX, tabWidth, animated = true, containerRef, containerWidth}: ScrollToTabProps) {
    if (!containerRef.current) {
        return;
    }

    const isTabLeftSideCut = containerX > tabX;
    const isTabRightSideCut = tabX + tabWidth >= containerX + containerWidth - variables.tabSelectorScrollMarginInline;
    if (!isTabLeftSideCut && !isTabRightSideCut) {
        return;
    }

    if (isTabRightSideCut) {
        const tabCutLengthOnRight = tabX + tabWidth - (containerWidth + containerX);
        containerRef.current.scrollTo({x: containerX + tabCutLengthOnRight + variables.tabSelectorScrollMarginInline, animated});
        return;
    }

    containerRef.current.scrollTo({x: tabX - variables.tabSelectorScrollMarginInline, animated});
}

export default scrollToTab;
