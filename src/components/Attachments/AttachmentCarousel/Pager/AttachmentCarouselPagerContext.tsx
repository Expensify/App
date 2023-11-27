import {createContext, RefObject} from 'react';
import PagerView from 'react-native-pager-view';

type AttachmentCarouselPagerContextValue = {
    canvasWidth: number;
    canvasHeight: number;
    isScrolling: boolean;
    pagerRef: RefObject<PagerView>;
    shouldPagerScroll: boolean;
    onPinchGestureChange: () => void;
    onTap: () => void;
    onSwipe: () => void;
    onSwipeSuccess: () => void;
    onSwipeDown: () => void;
};

const AttachmentCarouselContextPager = createContext<AttachmentCarouselPagerContextValue | null>(null);

export default AttachmentCarouselContextPager;
