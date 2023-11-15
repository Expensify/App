import React from 'react';
import RNFastImage from 'react-native-fast-image';
import {withOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import RESIZE_MODES from './resizeModes';
import {DimensionsCacheValue, FastImageSource, ImageOnyxProps, ImageProps} from './types';

const dimensionsCache = new Map<string, DimensionsCacheValue>();

function resolveDimensions(key: string): DimensionsCacheValue | undefined {
    return dimensionsCache.get(key);
}

function Image({source, isAuthTokenRequired, session, ...rest}: ImageProps) {
    let imageSource: FastImageSource = source;
    if (typeof source !== 'number' && typeof source.uri === 'number') {
        imageSource = source.uri;
    }
    if (typeof imageSource !== 'number' && typeof source !== 'number' && isAuthTokenRequired) {
        const authToken = session?.encryptedAuthToken ?? null;
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
                if (rest.onLoad) {
                    rest.onLoad(evt);
                }
            }}
        />
    );
}

Image.displayName = 'Image';
Image.resizeMode = RESIZE_MODES;
Image.resolveDimensions = resolveDimensions;

const ImageWithOnyx = withOnyx<ImageProps, ImageOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(Image);

export default ImageWithOnyx;
