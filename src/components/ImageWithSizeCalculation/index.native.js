import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import FastImage from 'react-native-fast-image';

const propTypes = {
    // Url for image to display
    url: PropTypes.string.isRequired,

    // Any additional styles to apply
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    // Callback fired when the image has been measured.
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
    onImageLoad(width, height) {
        console.log(`Loaded ${this.props.url} with values w/h: ${width}/${height}`);
        this.props.onMeasure({width, height});
    }

    render() {
        return (
            <FastImage
                style={{
                    width: '100%',
                    height: '100%',
                    ...this.props.style,
                }}
                source={{
                    uri: this.props.url,
                }}
                resizeMode={FastImage.resizeMode.contain}
                onLoad={e => this.onImageLoad(e.nativeEvent.width, e.nativeEvent.height)}
            />
        );
    }
}

ImageWithSizeCalculation.propTypes = propTypes;
ImageWithSizeCalculation.defaultProps = defaultProps;
export default ImageWithSizeCalculation;
