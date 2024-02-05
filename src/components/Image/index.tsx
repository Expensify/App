import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import BaseImage from './BaseImage';
import type { ImageProps, ImageOwnProps, ImageOnyxProps } from './types';

function Image({source: propsSource, isAuthTokenRequired, session, ...forwardedProps}: ImageProps) {
    // Update the source to include the auth token if required
    const source = useMemo(() => {
        if (typeof propsSource === 'object' && 'uri' in propsSource && typeof propsSource.uri === 'number') {
            return propsSource.uri;
        }
        if (typeof propsSource !== 'number' && isAuthTokenRequired) {
            const authToken = session?.encryptedAuthToken;
            return {
                ...propsSource,
                headers: {
                    [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: authToken ?? '',
                },
            };
        }

        return propsSource;
        // The session prop is not required, as it causes the image to reload whenever the session changes. For more information, please refer to issue #26034.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propsSource, isAuthTokenRequired]);

    return (
        <BaseImage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...forwardedProps}
            source={source}
        />
    );
}

function imagePropsAreEqual(prevProps: ImageOwnProps, nextProps: ImageOwnProps) {
    return prevProps.source === nextProps.source;
}

const ImageWithOnyx = React.memo(
    withOnyx<ImageProps, ImageOnyxProps>({
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(Image),
    imagePropsAreEqual,
);

ImageWithOnyx.displayName = 'Image';

export default ImageWithOnyx;
