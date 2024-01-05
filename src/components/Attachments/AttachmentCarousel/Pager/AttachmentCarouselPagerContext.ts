import {createContext} from 'react';
import type PagerView from 'react-native-pager-view';
import type {SharedValue} from 'react-native-reanimated';

type AttachmentCarouselPagerContextType = {
    onTap: () => void;
    // onSwipe: (y: number) => void;
    // onSwipeSuccess: () => void;
    onScaleChanged: (scale: number) => void;
    pagerRef: React.Ref<PagerView>;
    shouldPagerScroll: SharedValue<boolean>;
    isSwipingInPager: SharedValue<boolean>;
};

const AttachmentCarouselPagerContext = createContext<AttachmentCarouselPagerContextType | null>(null);

export default AttachmentCarouselPagerContext;
export type {AttachmentCarouselPagerContextType};
