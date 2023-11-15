import React, {useEffect, useMemo} from 'react';
import {Image as RNImage} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import RESIZE_MODES from './resizeModes';
import {ImageOnyxProps, ImageProps, ImagePropsWithOnyx} from './types';

function Image({source: propsSource, isAuthTokenRequired, onLoad, session, ...forwardedProps}: ImagePropsWithOnyx) {
    /**
     * Check if the image source is a URL - if so the `encryptedAuthToken` is appended
     * to the source.
     */
    const source = useMemo(() => {
        // There is currently a `react-native-web` bug preventing the authToken being passed
        // in the headers of the image request so the authToken is added as a query param.
        // On native the authToken IS passed in the image request headers
        const authToken = session?.encryptedAuthToken ?? null;

        if (isAuthTokenRequired && authToken && typeof propsSource !== 'number' && propsSource.uri) {
            return {uri: `${propsSource.uri}?encryptedAuthToken=${encodeURIComponent(authToken)}`};
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
        if (typeof onLoad !== 'function' || typeof source === 'number' || !source.uri) {
            return;
        }
        RNImage.getSize(source.uri, (width, height) => {
            onLoad({nativeEvent: {width, height}});
        });
    }, [onLoad, source]);

    return (
        <RNImage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...forwardedProps}
            source={source}
        />
    );
}

function imagePropsAreEqual(prevProps: ImageProps, nextProps: ImageProps) {
    return prevProps.source === nextProps.source;
}

Image.resizeMode = RESIZE_MODES;
Image.displayName = 'Image';

const ImageWithOnyx = React.memo(
    withOnyx<ImagePropsWithOnyx, ImageOnyxProps>({
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(Image),
    imagePropsAreEqual,
);

export default ImageWithOnyx;
