import type {ImageSource} from 'expo-image';
import type {ImageRequireSource, ImageResizeMode, ImageStyle, ImageURISource, StyleProp} from 'react-native';
import type {ValueOf} from 'type-fest';
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

    /** Styles for the Image */
    style?: StyleProp<ImageStyle>;
};

type ImageOwnProps = BaseImageProps & {
    /** Should an auth token be included in the image request */
    isAuthTokenRequired?: boolean;

    /** How should the image fit within its container */
    resizeMode?: ImageResizeMode;

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

    /** Called when the image should wait for a valid session to reload
     *  At the moment this function is called, the image is not in cache anymore
     *  cf https://github.com/Expensify/App/issues/51888
     */
    waitForSession?: () => void;
};

type ImageProps = ImageOwnProps;

export type {BaseImageProps, ImageOwnProps, ImageProps, ExpoImageSource, ImageOnLoadEvent, ImageObjectPosition};
