import type {Attachment, AttachmentSource} from '@components/Attachments/types';

import type {ForwardedRef} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import type {NativeGesture, PanGesture} from 'react-native-gesture-handler';
import type PagerView from 'react-native-pager-view';
import type Animated from 'react-native-reanimated';
import type {AnimatedRef, SharedValue} from 'react-native-reanimated';

/** The pager items array is used within the pager to render and navigate between the images */
type AttachmentCarouselPagerItems = Pick<Attachment, 'attachmentID'> & {
    /** The source of the image is used to identify each attachment/page in the pager */
    source: AttachmentSource;

    /** URL to preview-sized attachment that is also used for the thumbnail */
    previewSource?: AttachmentSource;

    /** The index of the pager item determines the order of the images in the pager */
    index: number;

    /** The active state of the pager item determines whether the image is currently transformable with pinch, pan and tap gestures */
    isActive: boolean;
};

type AttachmentCarouselPagerStateContextType = {
    /** List of attachments displayed in the pager */
    pagerItems: AttachmentCarouselPagerItems[];

    /** Index of the currently active page */
    activePage: number;

    /** Ref to the pager: the PagerView on native and the attachment list on web */
    pagerRef?: ForwardedRef<PagerView> | AnimatedRef<Animated.FlatList<ListRenderItemInfo<Attachment>>>;

    /** The pan gesture that swipes between attachments on web. The pan gesture of the attachment needs to work simultaneously with it */
    pagerGesture?: PanGesture;

    /** Indicates if the pager is currently scrolling */
    isPagerScrolling: SharedValue<boolean>;

    /** Indicates if scrolling is enabled for the attachment */
    isScrollEnabled: SharedValue<boolean>;

    /** In case we need a gesture that should work simultaneously with panning in MultiGestureCanvas */
    externalGestureHandler?: NativeGesture;
};

type AttachmentCarouselPagerActionsContextType = {
    /** Function to call after a tap event */
    onTap?: (shouldShowArrows?: boolean) => void;

    /** Function to call when the scale changes */
    onScaleChanged?: (scale: number) => void;

    /** Function to call after a swipe down event */
    onSwipeDown?: () => void;

    onAttachmentError?: (source: AttachmentSource, state?: boolean) => void;
};

export type {AttachmentCarouselPagerStateContextType, AttachmentCarouselPagerActionsContextType};
