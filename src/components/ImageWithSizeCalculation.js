import React, {PureComponent} from 'react';
import {Image} from 'react-native';
import PropTypes from 'prop-types';
import Log from '../libs/Log';
import styles from '../styles/styles';

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
        this.isComponentMounted = false;
    }

    componentDidMount() {
        // If the component unmounts by the time getSize() is finished, it will throw a warning
        // So this is to prevent setting state if the component isn't mounted
        this.isComponentMounted = true;
        this.calculateImageSize();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.url === this.props.url) {
            return;
        }

        this.calculateImageSize();
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
    }

    calculateImageSize() {
        if (!this.props.url) {
            return;
        }

        Image.getSize(this.props.url, (width, height) => {
            if (!width || !height || !this.isComponentMounted) {
                // Image didn't load properly or component unmounted before we got the result
                return;
            }

            this.props.onMeasure({width, height});
        }, (error) => {
            Log.hmmm('Unable to fetch image to calculate size', {error, url: this.props.url});
        });
    }

    render() {
        return (
            <Image
                style={[
                    styles.w100,
                    styles.h100,
                    this.props.style,
                ]}
                source={{uri: this.props.url}}
                resizeMode="contain"
            />
        );
    }
}

ImageWithSizeCalculation.propTypes = propTypes;
ImageWithSizeCalculation.defaultProps = defaultProps;
export default ImageWithSizeCalculation;
