import type {StyleProp, ViewStyle} from 'react-native';
import type ZoomRange from '@components/MultiGestureCanvas/types';

type ImageViewProps = {
    /** Whether source url requires authentication */
    isAuthTokenRequired?: boolean;

    /** Handles scale changed event in image zoom component. Used on native only */
    onScaleChanged: (scale: number) => void;

    /** URL to full-sized image */
    url: string;

    /** image file name */
    fileName: string;

    /** Handles errors while displaying the image */
    onError?: () => void;

    /** Whether this AttachmentView is shown as part of a AttachmentCarousel */
    isUsedInCarousel?: boolean;

    /** When "isUsedInCarousel" is set to true, determines whether there is only one item in the carousel */
    isSingleCarouselItem?: boolean;

    /** The index of the carousel item */
    carouselItemIndex?: number;

    /** The index of the currently active carousel item */
    carouselActiveItemIndex?: number;

    /** Function for handle on press */
    onPress?: () => void;

    /** Additional styles to add to the component */
    style?: StyleProp<ViewStyle>;

    /** Range of zoom that can be applied to the content by pinching or double tapping. */
    zoomRange?: ZoomRange;
};

type ImageLoadNativeEventData = {
    width: number;
    height: number;
};

export type {ImageViewProps, ImageLoadNativeEventData};
