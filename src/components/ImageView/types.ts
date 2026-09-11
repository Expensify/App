import type {Attachment} from '@components/Attachments/types';
import type {ZoomRange} from '@components/MultiGestureCanvas/types';

import type {StyleProp, ViewStyle} from 'react-native';

type ImageViewProps = Pick<Attachment, 'attachmentID'> & {
    /** Whether source url requires authentication */
    isAuthTokenRequired?: boolean;

    /** URL to full-sized image */
    url: string;

    fileName: string;

    /** Handles errors while displaying the image */
    onError?: () => void;

    style?: StyleProp<ViewStyle>;

    /** Range of zoom that can be applied to the content by pinching or double tapping. */
    zoomRange?: ZoomRange;
};

export default ImageViewProps;
