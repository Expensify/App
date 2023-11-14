import React from 'react';
import {ImageRequireSource, ImageURISource} from 'react-native';
import RNFastImage, {Source} from 'react-native-fast-image';
import {withOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import RESIZE_MODES from './resizeModes';
import {DimensionsCacheValue, ImageOnyxProps, ImagePropsWithOnyx} from './types';

const dimensionsCache = new Map<string, DimensionsCacheValue>();

function resolveDimensions(key: string) {
    return dimensionsCache.get(key);
}

function Image(props: ImagePropsWithOnyx) {
    // eslint-disable-next-line react/destructuring-assignment
    const {source, isAuthTokenRequired, session, ...rest} = props;

    let imageSource: Omit<ImageURISource, 'cache'> | ImageRequireSource | Source = source;
    if (typeof source !== 'number' && typeof source.uri === 'number') {
        imageSource = source.uri;
    }
    if (typeof source !== 'number' && isAuthTokenRequired) {
        const authToken = props.session?.encryptedAuthToken ?? null;
        imageSource = {
            ...source,
            headers: authToken
                ? {
                      [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: authToken,
                  }
                : undefined,
        };
    }

    return (
        <RNFastImage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            source={imageSource}
            onLoad={(evt) => {
                if (typeof source === 'number' || !source.uri) {
                    return;
                }
                const {width, height} = evt.nativeEvent;
                dimensionsCache.set(source.uri, {width, height});
                if (props.onLoad) {
                    props.onLoad(evt);
                }
            }}
        />
    );
}

Image.displayName = 'Image';
Image.resizeMode = RESIZE_MODES;
Image.resolveDimensions = resolveDimensions;

const ImageWithOnyx = withOnyx<ImagePropsWithOnyx, ImageOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(Image);

export default ImageWithOnyx;
