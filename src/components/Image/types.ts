import {ImageRequireSource, ImageResizeMode, ImageStyle, ImageURISource, StyleProp} from 'react-native';
import {ImageStyle as FastImageStyle, OnLoadEvent, ResizeMode, Source} from 'react-native-fast-image';
import {OnyxEntry} from 'react-native-onyx';
import {Session} from '@src/types/onyx';

type ImageOnyxProps = {
    /* Onyx Props */
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type ImageOwnProps = {
    /** Styles for the Image */
    style?: StyleProp<ImageStyle & FastImageStyle>;

    /** The static asset or URI source of the image */
    source: Omit<ImageURISource, 'cache'> | ImageRequireSource | Omit<Source, 'cache'>;

    /** Should an auth token be included in the image request */
    isAuthTokenRequired?: boolean;

    /** How should the image fit within its container */
    resizeMode?: ImageResizeMode & ResizeMode;

    /** Event for when the image begins loading */
    onLoadStart?: () => void;

    /** Event for when the image finishes loading */
    onLoadEnd?: () => void;

    /** Error handler */
    onError?: () => void;

    /** Event for when the image is fully loaded and returns the natural dimensions of the image */
    onLoad?: (event: OnLoadEvent) => void;

    /** Progress events while the image is downloading */
    onProgress?: () => void;
};

type ImageProps = ImageOnyxProps & ImageOwnProps;

type DimensionsCacheValue = {
    width: number;
    height: number;
};

type FastImageSource = Omit<ImageURISource, 'cache'> | ImageRequireSource | Source;

export type {ImageOwnProps, ImageOnyxProps, ImageProps, DimensionsCacheValue, FastImageSource};
