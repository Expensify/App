import type {ImageContentFit, ImageProps, ImageStyle} from 'expo-image';
import type {StyleProp, ViewStyle} from 'react-native';
import type IconAsset from '@src/types/utils/IconAsset';

type ImageSVGProps = {
    /** The image cache policy */
    cachePolicy?: ImageProps['cachePolicy'];
    /** The asset to render. */
    src: IconAsset | undefined;

    /** The width of the image. */
    width?: number | `${number}%` | 'auto';

    /** The height of the image. */
    height?: number | `${number}%` | 'auto';

    /** The fill color for the image. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    fill?: string;

    /** Is image hovered */
    hovered?: boolean;

    /** Is image pressed */
    pressed?: boolean;

    /** Additional styles to add to the component */
    style?: StyleProp<ViewStyle & ImageStyle>;

    /** Determines how the image should be resized to fit its container */
    contentFit?: ImageContentFit;

    /** The pointer-events attribute allows us to define whether or when an element may be the target of a mouse event. */
    pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';

    /** The preserveAspectRatio attribute indicates how an element with a viewBox providing a given aspect ratio must fit into a viewport with a different aspect ratio. */
    preserveAspectRatio?: string;

    /** TestID for test */
    testID?: string;

    //* Called when the image load either succeeds or fails. */
    onLoadEnd?: () => void;
};

export default ImageSVGProps;
