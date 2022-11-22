import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import Log from '../libs/Log';
import styles from '../styles/styles';
import FullscreenLoadingIndicator from './FullscreenLoadingIndicator';
import ONYXKEYS from '../ONYXKEYS';
import chatAttachmentTokenHeaders from '../libs/chatAttachmentTokenHeaders';
import FastImage from './FastImage';

const propTypes = {
    /** Url for image to display */
    url: PropTypes.string.isRequired,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    /** Callback fired when the image has been measured. */
    onMeasure: PropTypes.func,

    /** Does the image require an authToken? */
    isAuthTokenRequired: PropTypes.bool,

    /* Onyx props */
    /** Session object */
    session: PropTypes.shape({
        /** An error message to display to the user */
        encryptedAuthToken: PropTypes.string,
    }),
};

const defaultProps = {
    style: {},
    onMeasure: () => {},
    isAuthTokenRequired: false,
    session: {
        encryptedAuthToken: false,
    },
};

/**
 * Preloads an image by getting the size and passing dimensions via callback.
 * Image size must be provided by parent via width and height props. Useful for
 * performing some calculation on a network image after fetching dimensions so
 * it can be appropriately resized.
 */
class ImageWithSizeCalculation extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
        };

        this.imageLoadingStart = this.imageLoadingStart.bind(this);
        this.imageLoadingEnd = this.imageLoadingEnd.bind(this);
        this.onError = this.onError.bind(this);
        this.imageLoadedSuccessfuly = this.imageLoadedSuccessfuly.bind(this);
    }

    onError() {
        Log.hmmm('Unable to fetch image to calculate size', {url: this.props.url});
    }

    imageLoadingStart() {
        this.setState({isLoading: true});
    }

    imageLoadingEnd() {
        this.setState({isLoading: false});
    }

    imageLoadedSuccessfuly(event) {
        if (!lodashGet(event, 'nativeEvent.width', false) || !lodashGet(event, 'nativeEvent.height', false)) {
            // Image didn't load properly
            return;
        }

        this.props.onMeasure({width: event.nativeEvent.width, height: event.nativeEvent.height});
    }

    render() {
        const headers = this.props.isAuthTokenRequired ? chatAttachmentTokenHeaders() : undefined;
        return (
            <View
                style={[
                    styles.w100,
                    styles.h100,
                    this.props.style,
                ]}
            >
                <FastImage
                    style={[
                        styles.w100,
                        styles.h100,
                    ]}
                    source={{
                        uri: this.props.url,
                        headers,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                    onLoadStart={this.imageLoadingStart}
                    onLoadEnd={this.imageLoadingEnd}
                    onError={this.onError}
                    onLoad={this.imageLoadedSuccessfuly}
                />
                {this.state.isLoading && (
                    <FullscreenLoadingIndicator
                        style={[styles.opacity1, styles.bgTransparent]}
                    />
                )}
            </View>
        );
    }
}

ImageWithSizeCalculation.propTypes = propTypes;
ImageWithSizeCalculation.defaultProps = defaultProps;
export default withOnyx({
    session: {key: ONYXKEYS.SESSION},
})(ImageWithSizeCalculation);
