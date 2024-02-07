import React, {useEffect, useMemo} from 'react';
import {Image as RNImage} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ImageOnyxProps, ImageOwnProps, ImageProps} from './types';

function Image(props: ImageProps) {
    const {source: propsSource, isAuthTokenRequired = false, onLoad, session, ...forwardedProps} = props;
    /**
     * Check if the image source is a URL - if so the `encryptedAuthToken` is appended
     * to the source.
     */
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

    /**
     * The natural image dimensions are retrieved using the updated source
     * and as a result the `onLoad` event needs to be manually invoked to return these dimensions
     */
    useEffect(() => {
        // If an onLoad callback was specified then manually call it and pass
        // the natural image dimensions to match the native API
        if (onLoad == null) {
            return;
        }

        if (typeof source === 'object' && 'uri' in source && source.uri) {
            RNImage.getSize(source.uri, (width, height) => {
                onLoad({nativeEvent: {width, height}});
            });
        }
    }, [onLoad, source]);

    return (
        <RNImage
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
