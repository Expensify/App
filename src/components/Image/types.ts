import type {ImagePrefetchOptions, ImageSource} from 'expo-image';
import type {ImageRequireSource, ImageResizeMode, ImageStyle, ImageURISource, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {FullScreenLoadingIndicatorIconSize} from '@components/FullscreenLoadingIndicator';
import type CONST from '@src/CONST';

type ExpoImageSource = ImageSource | number | ImageSource[];

type ImageObjectPosition = ValueOf<typeof CONST.IMAGE_OBJECT_POSITION>;

type ImageOnLoadEvent = {
    nativeEvent: {
        width: number;
        height: number;
    };
};

type BaseImageProps = {
    /** The static asset or URI source of the image */
    source: ExpoImageSource | Omit<ImageURISource, 'cache'> | ImageRequireSource | undefined;

    /** Event for when the image is fully loaded and returns the natural dimensions of the image */
    onLoad?: (event: ImageOnLoadEvent) => void;

    /** Blur radius to apply to the image */
    blurRadius?: number;

    /** Styles for the Image */
    style?: StyleProp<ImageStyle>;

    /** The image cache policy */
    cachePolicy?: ImagePrefetchOptions['cachePolicy'];
};

type ImageOwnProps = BaseImageProps & {
    /** By default, when the image width is greater than its height, its aspectRatio is set to 1. If you want the aspectRatio to be calculated instead of set to 1 in these cases, set the value of this prop to true  */
    shouldCalculateAspectRatioForWideImage?: boolean;

    /** Should an auth token be included in the image request */
    isAuthTokenRequired?: boolean;

    /** How should the image fit within its container */
    resizeMode?: ImageResizeMode;

    /** The size of the loading indicator */
    loadingIconSize?: FullScreenLoadingIndicatorIconSize;

    /** The style of the loading indicator */
    loadingIndicatorStyles?: StyleProp<ViewStyle>;

    /** Event for when the image begins loading */
    onLoadStart?: () => void;

    /** Event for when the image finishes loading */
    onLoadEnd?: () => void;

    /** Error handler */
    onError?: () => void;

    /** Progress events while the image is downloading */
    onProgress?: () => void;

    /** The object position of image */
    objectPosition?: ImageObjectPosition;

    /**
     *  Called when the image should wait for a valid session to reload
     *  At the moment this function is called, the image is not in cache anymore
     *  cf https://github.com/Expensify/App/issues/51888
     */
    waitForSession?: () => void;

    /** If you want to calculate the image height dynamically instead of using aspectRatio, pass the width in this property */
    imageWidthToCalculateHeight?: number;

    /** Whether the image should use the full height of the container */
    shouldUseFullHeight?: boolean;
};

type ImageProps = ImageOwnProps;

export type {BaseImageProps, ImageProps, ImageOnLoadEvent, ImageObjectPosition};
