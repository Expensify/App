import {useAttachmentCarouselPagerActions, useAttachmentCarouselPagerState} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import type {AttachmentCarouselPagerStateContextType} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';

import type {SharedValue} from 'react-native-reanimated';

import {useSharedValue} from 'react-native-reanimated';

type IconCarouselPagerProps = {
    pagerGesture: AttachmentCarouselPagerStateContextType['pagerGesture'];

    /** Whether horizontal pager scrolling is enabled. */
    isScrollEnabled: SharedValue<boolean>;

    /** Called when the icon receives a tap gesture. */
    onTap: () => void;

    /** Called when the user swipes down on the icon. */
    onSwipeDown: () => void;
};

/** Resolves attachment carousel pager callbacks for multi-gesture icon rendering. */
function useIconCarouselPager(): IconCarouselPagerProps {
    const isScrollingEnabledFallback = useSharedValue(false);
    const state = useAttachmentCarouselPagerState();
    const actions = useAttachmentCarouselPagerActions();

    if (state === null || actions === null) {
        return {
            pagerGesture: undefined,
            isScrollEnabled: isScrollingEnabledFallback,
            onTap: () => {},
            onSwipeDown: () => {},
        };
    }

    return {
        pagerGesture: state.pagerGesture,
        isScrollEnabled: state.isScrollEnabled,
        onTap: actions.onTap ?? (() => {}),
        onSwipeDown: actions.onSwipeDown ?? (() => {}),
    };
}

export default useIconCarouselPager;
