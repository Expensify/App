import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Image as RNImage} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import {defaultProps, imagePropTypes} from './imagePropTypes';
import RESIZE_MODES from './resizeModes';

function Image(props) {
    const {source: propsSource, isAuthTokenRequired, onLoad, session, onLoadStart = () => {}, onLoadEnd = () => {}} = props;

    const [isLoading, setIsLoading] = useState(false);
    const isLoadedRef = useRef(null);
    /**
     * Check if the image source is a URL - if so the `encryptedAuthToken` is appended
     * to the source.
     */
    const source = useMemo(() => {
        if (isAuthTokenRequired) {
            // There is currently a `react-native-web` bug preventing the authToken being passed
            // in the headers of the image request so the authToken is added as a query param.
            // On native the authToken IS passed in the image request headers
            const authToken = lodashGet(session, 'encryptedAuthToken', null);
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
        if (onLoad == null) {
            return;
        }
        RNImage.getSize(source.uri, (width, height) => {
            onLoad({nativeEvent: {width, height}});
        });
    }, [onLoad, source]);

    /** Delay the loader to detect whether the image is being loaded from the cache or the internet. */
    useEffect(() => {
        if (isLoadedRef.current || !isLoading) {
            return;
        }
        const timeout = _.delay(() => {
            if (!isLoading || isLoadedRef.current) {
                return;
            }
            onLoadStart();
        }, 200);
        return () => clearTimeout(timeout);
    }, [isLoading]);

    // Omit the props which the underlying RNImage won't use
    const forwardedProps = _.omit(props, ['source', 'onLoad', 'session', 'isAuthTokenRequired', 'onLoadStart', 'onLoadEnd']);

    return (
        <RNImage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...forwardedProps}
            source={source}
            onLoadStart={() => setIsLoading(true)}
            onLoad={() => {
                isLoadedRef.current = true;
            }}
            onLoadEnd={() => {
                setIsLoading(false);
                isLoadedRef.current = true;
                onLoadEnd();
            }}
        />
    );
}

function imagePropsAreEqual(prevProps, nextProps) {
    return prevProps.source === nextProps.source;
}

Image.propTypes = imagePropTypes;
Image.defaultProps = defaultProps;

const ImageWithOnyx = React.memo(
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(Image),
    imagePropsAreEqual,
);
ImageWithOnyx.resizeMode = RESIZE_MODES;
export default ImageWithOnyx;
