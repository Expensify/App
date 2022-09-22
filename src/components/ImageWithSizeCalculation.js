import React, {PureComponent} from 'react';
import {View, Image} from 'react-native';
import PropTypes from 'prop-types';
import Log from '../libs/Log';
import styles from '../styles/styles';
import FullscreenLoadingIndicator from './FullscreenLoadingIndicator';
import FastImage from '@pieter-pot/react-native-fast-image';

const propTypes = {
    /** Url for image to display */
    url: PropTypes.string.isRequired,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    /** Callback fired when the image has been measured. */
    onMeasure: PropTypes.func,
};

const defaultProps = {
    style: {},
    onMeasure: () => {},
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

    imageLoadingStart() {
        this.setState({isLoading: true});
    }

    imageLoadingEnd() {
        this.setState({isLoading: false});
    }

    imageLoadedSuccessfuly(event) {
        if (!event?.nativeEvent?.width || !event?.nativeEvent?.height) {
            // Image didn't load properly
            return;
        }

        this.props.onMeasure({width: event.nativeEvent.width, height: event.nativeEvent.height});
    }

    onError() {
        Log.hmmm('Unable to fetch image to calculate size', {url: this.props.url});
    }

    render() {
        return (
            <View
                style={[
                    styles.w100,
                    styles.h100,
                    this.props.style,
                ]}
            >
                {(this.state.isLoading) && (
                    <FullscreenLoadingIndicator
                        style={[styles.opacity1, styles.bgTransparent, { zIndex: 1 }]}
                    />
                )}
                <FastImage
                    style={[
                        styles.w100,
                        styles.h100,
                        { zIndex: 2 }
                    ]}
                    source={{uri: this.props.url}}
                    resizeMode={FastImage.resizeMode.contain}
                    onLoadStart={this.imageLoadingStart}
                    onLoadEnd={this.imageLoadingEnd}
                    onError={this.onError}
                    onLoad={this.imageLoadedSuccessfuly}
                />
            </View>
        );
    }
}

ImageWithSizeCalculation.propTypes = propTypes;
ImageWithSizeCalculation.defaultProps = defaultProps;
export default ImageWithSizeCalculation;
