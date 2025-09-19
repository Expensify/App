import type {StyleProp, ViewStyle} from 'react-native';
import type {ZoomRange} from '@components/MultiGestureCanvas/types';

type ImageViewProps = {
    /** Whether source url requires authentication */
    isAuthTokenRequired?: boolean;

    /** URL to full-sized image */
    url: string;

    /** image file name */
    fileName: string;

    /** Handles errors while displaying the image */
    onError?: () => void;

    /** Additional styles to add to the component */
    style?: StyleProp<ViewStyle>;

    /** Range of zoom that can be applied to the content by pinching or double tapping. */
    zoomRange?: ZoomRange;
};

export default ImageViewProps;
