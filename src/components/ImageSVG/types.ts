import type IconAsset from '@src/types/utils/IconAsset';

import type {ImageContentFit, ImageStyle} from 'expo-image';
import type {StyleProp, ViewStyle} from 'react-native';

type ImageSVGProps = {
    src: IconAsset | undefined;
    width?: number | `${number}%` | 'auto';
    height?: number | `${number}%` | 'auto';

    /** The fill color for the image. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    fill?: string;

    hovered?: boolean;
    pressed?: boolean;
    style?: StyleProp<ViewStyle & ImageStyle>;

    /** Determines how the image should be resized to fit its container */
    contentFit?: ImageContentFit;

    /** The pointer-events attribute allows us to define whether or when an element may be the target of a mouse event. */
    pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';

    /** The preserveAspectRatio attribute indicates how an element with a viewBox providing a given aspect ratio must fit into a viewport with a different aspect ratio. */
    preserveAspectRatio?: string;

    /** Whether the image should be hidden from screen readers */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'aria-hidden'?: boolean;

    testID?: string;

    /** Called when the image load either succeeds or fails */
    onLoadEnd?: () => void;
};

export default ImageSVGProps;
