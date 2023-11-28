import {ComponentType, createContext, RefObject} from 'react';
import {SharedValue} from 'react-native-reanimated';

type AttachmentCarouselPagerContextValue = {
    canvasWidth: number;
    canvasHeight: number;
    isScrolling: SharedValue<boolean>;
    pagerRef: RefObject<ComponentType>;
    shouldPagerScroll: SharedValue<boolean>;
    onPinchGestureChange: (value?: boolean) => void;
    onTap: () => void;
    onSwipe: (value?: number) => void;
    onSwipeSuccess: () => void;
    onSwipeDown: () => void;
};

const AttachmentCarouselContextPager = createContext<AttachmentCarouselPagerContextValue | null>(null);

export default AttachmentCarouselContextPager;
