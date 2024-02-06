import type {ImageSource} from 'expo-image';
import type {ImageRequireSource, ImageResizeMode, ImageStyle, ImageURISource, StyleProp} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {Session} from '@src/types/onyx';

type ExpoImageSource = ImageSource | number | ImageSource[];

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

type ImageOwnProps = {
    /** Styles for the Image */
    style?: StyleProp<ImageStyle>;

    /** The static asset or URI source of the image */
    source: ExpoImageSource | Omit<ImageURISource, 'cache'> | ImageRequireSource | undefined;

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

    /** Event for when the image is fully loaded and returns the natural dimensions of the image */
    onLoad?: (event: ImageOnLoadEvent) => void;

    /** Progress events while the image is downloading */
    onProgress?: () => void;
};

type ImageProps = ImageOnyxProps & ImageOwnProps;

export type {ImageOwnProps, ImageOnyxProps, ImageProps, ExpoImageSource, ImageOnLoadEvent};
