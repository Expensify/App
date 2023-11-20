import React from 'react';
import RNFastImage from 'react-native-fast-image';
import {withOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {FastImageSource, ImageOnyxProps, ImageProps} from './types';

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
                rest.onLoad?.(evt);
            }}
        />
    );
}

const ImageWithOnyx = withOnyx<ImageProps, ImageOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(Image);

ImageWithOnyx.displayName = 'Image';

export default ImageWithOnyx;
