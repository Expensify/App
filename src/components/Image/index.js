import React, {useCallback, useEffect} from 'react';
import {Image as RNImage} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import {defaultProps, imagePropTypes} from './imagePropTypes';
import RESIZE_MODES from './resizeModes';

function Image(props) {
    /**
     * Check if the image source is a URL - if so the `encryptedAuthToken` is appended
     * to the source.
     * @returns {Object} - the configured image source
     */
    const getImageSource = useCallback(() => {
        const source = props.source;
        let imageSource = source;
        if (props.isAuthTokenRequired) {
            // There is currently a `react-native-web` bug preventing the authToken being passed
            // in the headers of the image request so the authToken is added as a query param.
            // On native the authToken IS passed in the image request headers
            const authToken = lodashGet(props, 'session.encryptedAuthToken', null);
            imageSource = {uri: `${source.uri}?encryptedAuthToken=${encodeURIComponent(authToken)}`};
        }

        return imageSource;
    }, [props]);

    /**
     * The natural image dimensions are retrieved using the updated source
     * and as a result the `onLoad` event needs to be manually invoked to return these dimensions
     */
    const configureOnLoad = useCallback(() => {
        // If an onLoad callback was specified then manually call it and pass
        // the natural image dimensions to match the native API
        if (props.onLoad == null) {
            return;
        }

        const imageSource = getImageSource();
        RNImage.getSize(imageSource.uri, (width, height) => {
            props.onLoad({nativeEvent: {width, height}});
        });
    }, [getImageSource, props]);

    useEffect(() => {
        configureOnLoad();
    }, [configureOnLoad, props]);

    // Omit the props which the underlying RNImage won't use
    const forwardedProps = _.omit(props, ['source', 'onLoad', 'session', 'isAuthTokenRequired']);
    const source = getImageSource();

    return (
        <RNImage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...forwardedProps}
            source={source}
        />
    );
}

Image.propTypes = imagePropTypes;
Image.defaultProps = defaultProps;

const ImageWithOnyx = withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(Image);
ImageWithOnyx.resizeMode = RESIZE_MODES;
export default ImageWithOnyx;
