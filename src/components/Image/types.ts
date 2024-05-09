import type {ImageSource} from 'expo-image';
import type {ImageRequireSource, ImageResizeMode, ImageStyle, ImageURISource, StyleProp} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {Session} from '@src/types/onyx';

type ExpoImageSource = ImageSource | number | ImageSource[];

type ImageObjectPosition = ValueOf<typeof CONST.IMAGE_OBJECT_POSITION>;

type ImageOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

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
};

type ImageProps = ImageOnyxProps & ImageOwnProps;

export type {BaseImageProps, ImageOwnProps, ImageOnyxProps, ImageProps, ExpoImageSource, ImageOnLoadEvent, ImageObjectPosition};
