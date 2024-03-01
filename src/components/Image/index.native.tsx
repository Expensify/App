import {Image as ImageComponent} from 'expo-image';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ImageOnyxProps, ImageProps} from './types';

const dimensionsCache = new Map();

function Image({source, isAuthTokenRequired = false, session, onLoad, ...rest}: ImageProps) {
    let imageSource = source;
    if (typeof source === 'object' && 'uri' in source && typeof source.uri === 'number') {
        imageSource = source.uri;
    }
    if (typeof imageSource === 'object' && typeof source === 'object' && isAuthTokenRequired) {
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
        <ImageComponent
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            source={imageSource}
            onLoad={(evt) => {
                const {width, height, url} = evt.source;
                dimensionsCache.set(url, {width, height});
                if (onLoad) {
                    onLoad({nativeEvent: {width, height}});
                }
            }}
        />
    );
}

Image.displayName = 'Image';

const ImageWithOnyx = withOnyx<ImageProps, ImageOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(Image);

export default ImageWithOnyx;
