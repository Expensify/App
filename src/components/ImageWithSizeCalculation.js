import React, {PureComponent} from 'react';
import {Image} from 'react-native';
import PropTypes from 'prop-types';
import Log from '../libs/Log';
import styles from '../styles/styles';
import makeCancellablePromise from '../libs/MakeCancellablePromise';

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
    componentDidMount() {
        this.calculateImageSize();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.url === this.props.url) {
            return;
        }

        this.calculateImageSize();
    }

    componentWillUnmount() {
        if (!this.getImageSizePromise) {
            return;
        }

        this.getImageSizePromise.cancel();
    }

    /**
     * @param {String} url
     * @returns {Promise}
     */
    getImageSize(url) {
        return new Promise((resolve, reject) => {
            Image.getSize(url, (width, height) => {
                resolve({width, height});
            }, (error) => {
                reject(error);
            });
        });
    }

    calculateImageSize() {
        if (!this.props.url) {
            return;
        }

        this.getImageSizePromise = makeCancellablePromise(this.getImageSize(this.props.url));
        this.getImageSizePromise.promise
            .then(({width, height}) => {
                if (!width || !height) {
                    // Image didn't load properly
                    return;
                }

                this.props.onMeasure({width, height});
            })
            .catch((error) => {
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
