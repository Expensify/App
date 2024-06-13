import type {ForwardedRef} from 'react';
import {createContext} from 'react';
import type {GestureType} from 'react-native-gesture-handler';
import type PagerView from 'react-native-pager-view';
import type {SharedValue} from 'react-native-reanimated';
import type {AttachmentSource} from '@components/Attachments/types';

/** The pager items array is used within the pager to render and navigate between the images */
type AttachmentCarouselPagerItems = {
    /** The source of the image is used to identify each attachment/page in the pager */
    source: AttachmentSource;

    /** The index of the pager item determines the order of the images in the pager */
    index: number;

    /** The active state of the pager item determines whether the image is currently transformable with pinch, pan and tap gestures */
    isActive: boolean;
};

type AttachmentCarouselPagerContextValue = {
    /** The list of items that are shown in the pager */
    pagerItems: AttachmentCarouselPagerItems[];

    /** The index of the active page */
    activePage: number;

    /** The ref of the active attachment */
    pagerRef?: ForwardedRef<PagerView | GestureType>;

    /** The scroll state of the attachment */
    isPagerScrolling: SharedValue<boolean>;

    /** The scroll active of the attachment */
    isScrollEnabled: SharedValue<boolean>;

    /** The function to call after tap */
    onTap: () => void;

    /** The function to call after scale */
    onScaleChanged: (scale: number) => void;

    /** The function to call after swipe down */
    onSwipeDown: () => void;
};

const AttachmentCarouselPagerContext = createContext<AttachmentCarouselPagerContextValue | null>(null);

export default AttachmentCarouselPagerContext;
export type {AttachmentCarouselPagerContextValue};
