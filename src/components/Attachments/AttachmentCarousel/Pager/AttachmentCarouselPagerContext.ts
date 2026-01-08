import type {ForwardedRef} from 'react';
import {createContext} from 'react';
import type {GestureType} from 'react-native-gesture-handler';
import type PagerView from 'react-native-pager-view';
import type {SharedValue} from 'react-native-reanimated';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';

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

type AttachmentCarouselPagerContextValue = {
    /** List of attachments displayed in the pager */
    pagerItems: AttachmentCarouselPagerItems[];

    /** Index of the currently active page */
    activePage: number;

    /** Ref to the active attachment */
    pagerRef?: ForwardedRef<PagerView | GestureType>;

    /** Indicates if the pager is currently scrolling */
    isPagerScrolling: SharedValue<boolean>;

    /** Indicates if scrolling is enabled for the attachment */
    isScrollEnabled: SharedValue<boolean>;

    /** Function to call after a tap event */
    onTap?: (shouldShowArrows?: boolean) => void;

    /** Function to call when the scale changes */
    onScaleChanged?: (scale: number) => void;

    /** Function to call after a swipe down event */
    onSwipeDown?: () => void;

    /** Callback for attachment errors */
    onAttachmentError?: (source: AttachmentSource, state?: boolean) => void;

    /** In case we need a gesture that should work simultaneously with panning in MultiGestureCanvas */
    externalGestureHandler?: GestureType;
};

const AttachmentCarouselPagerContext = createContext<AttachmentCarouselPagerContextValue | null>(null);

export default AttachmentCarouselPagerContext;
export type {AttachmentCarouselPagerContextValue};
