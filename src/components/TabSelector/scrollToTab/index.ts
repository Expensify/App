import {NO_REACH} from '@components/HorizontalSafeArea/useHorizontalSafeAreaReach';

import variables from '@styles/variables';

import type {ScrollToTabProps} from './types';

function scrollToTab({containerX, tabX, tabWidth, animated = true, containerRef, containerWidth, safeAreaReach = NO_REACH}: ScrollToTabProps) {
    if (!containerRef.current) {
        return;
    }

    const visibleLeft = containerX + safeAreaReach.left;
    const visibleRight = containerX + containerWidth - safeAreaReach.right;
    const isTabLeftSideCut = visibleLeft > tabX;
    const isTabRightSideCut = tabX + tabWidth >= visibleRight - variables.tabSelectorScrollMarginInline;

    if (!isTabLeftSideCut && !isTabRightSideCut) {
        return;
    }

    if (isTabRightSideCut) {
        const tabCutLengthOnRight = tabX + tabWidth - visibleRight;
        containerRef.current.scrollTo({x: containerX + tabCutLengthOnRight + variables.tabSelectorScrollMarginInline, animated});
        return;
    }

    containerRef.current.scrollTo({x: tabX - safeAreaReach.left - variables.tabSelectorScrollMarginInline, animated});
}

export default scrollToTab;
