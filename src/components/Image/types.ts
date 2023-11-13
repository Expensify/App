import {ImageRequireSource, ImageResizeMode, ImageStyle, ImageURISource, StyleProp} from 'react-native';
import {OnLoadEvent} from 'react-native-fast-image';
import {OnyxEntry} from 'react-native-onyx';
import {Session} from '@src/types/onyx';

type ImageOnyxProps = {
    /* Onyx Props */
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type ImageProps = {
    /** Styles for the Image */
    style?: StyleProp<ImageStyle>;

    /** The static asset or URI source of the image */
    source: ImageURISource | ImageRequireSource;

    /** Should an auth token be included in the image request */
    isAuthTokenRequired: boolean;

    /** How should the image fit within its container */
    resizeMode: ImageResizeMode;

    /** Event for when the image begins loading */
    onLoadStart: () => void;

    /** Event for when the image finishes loading */
    onLoadEnd: () => void;

    /** Event for when the image is fully loaded and returns the natural dimensions of the image */
    onLoad: (event: OnLoadEvent) => void;

    /** Progress events while the image is downloading */
    onProgress: () => void;
};

type ImagePropsWithOnyx = ImageOnyxProps & ImageProps;

export type {ImageProps, ImageOnyxProps, ImagePropsWithOnyx};
