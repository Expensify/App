import React, {useEffect, useMemo} from 'react';
import {Image as RNImage} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import {defaultProps, imagePropTypes} from './imagePropTypes';
import RESIZE_MODES from './resizeModes';

function Image(props) {
    const {source: propsSource, isAuthTokenRequired, onLoad, session} = props;
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
    }, [propsSource, isAuthTokenRequired, session]);

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

    // Omit the props which the underlying RNImage won't use
    const forwardedProps = _.omit(props, ['source', 'onLoad', 'session', 'isAuthTokenRequired']);

    return (
        <RNImage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...forwardedProps}
            source={source}
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
