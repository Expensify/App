import React from 'react';
import {Image as RNImage} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import {defaultProps, imagePropTypes} from './imagePropTypes';
import RESIZE_MODES from './resizeModes';

class Image extends React.Component {
    componentDidMount() {
        this.configureOnLoad();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.source === this.props.source) {
            return;
        }
        this.configureOnLoad();
    }

    /**
     * Check if the image source is a URL - if so the `encryptedAuthToken` is appended
     * to the source.
     * @returns {Object} - the configured image source
     */
    getImageSource() {
        const source = this.props.source;
        let imageSource = source;
        if (this.props.isAuthTokenRequired) {
            // There is currently a `react-native-web` bug preventing the authToken being passed
            // in the headers of the image request so the authToken is added as a query param.
            // On native the authToken IS passed in the image request headers
            const authToken = lodashGet(this.props, 'session.encryptedAuthToken', null);
            imageSource = {uri: `${source.uri}?encryptedAuthToken=${encodeURIComponent(authToken)}`};
        }

        return imageSource;
    }

    /**
     * The natural image dimensions are retrieved using the updated source
     * and as a result the `onLoad` event needs to be manually invoked to return these dimensions
     */
    configureOnLoad() {
        // If an onLoad callback was specified then manually call it and pass
        // the natural image dimensions to match the native API
        if (this.props.onLoad == null) {
            return;
        }

        const imageSource = this.getImageSource();
        RNImage.getSize(imageSource.uri, (width, height) => {
            this.props.onLoad({nativeEvent: {width, height}});
        });
    }

    render() {
        // Omit the props which the underlying RNImage won't use
        const forwardedProps = _.omit(this.props, ['source', 'onLoad', 'session', 'isAuthTokenRequired']);
        const source = this.getImageSource();

        return (
            <RNImage
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...forwardedProps}
                source={source}
            />
        );
    }
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
