import _ from 'underscore';
import React, {useState, useRef, useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Log from '../libs/Log';
import styles from '../styles/styles';
import FullscreenLoadingIndicator from './FullscreenLoadingIndicator';
import Image from './Image';

const propTypes = {
    /** Url for image to display */
    url: PropTypes.string.isRequired,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    /** Callback fired when the image has been measured. */
    onMeasure: PropTypes.func,

    /** Whether the image requires an authToken */
    isAuthTokenRequired: PropTypes.bool,
};

const defaultProps = {
    style: {},
    onMeasure: () => {},
    isAuthTokenRequired: false,
};

/**
 * Preloads an image by getting the size and passing dimensions via callback.
 * Image size must be provided by parent via width and height props. Useful for
 * performing some calculation on a network image after fetching dimensions so
 * it can be appropriately resized.
 *
 * @param {Object} props
 * @returns {React.Component}
 *
 */
function ImageWithSizeCalculation(props) {
    const isLoadedRef = useRef(null);
    const [isImageCached, setIsImageCached] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const onError = () => {
        Log.hmmm('Unable to fetch image to calculate size', {url: props.url});
    };

    const imageLoadedSuccessfully = (event) => {
        isLoadedRef.current = true;
        props.onMeasure({
            width: event.nativeEvent.width,
            height: event.nativeEvent.height,
        });
    };

    /** Delay the loader to detect whether the image is being loaded from the cache or the internet. */
    useEffect(() => {
        if (isLoadedRef.current || !isLoading) {
            return;
        }
        const timeout = _.delay(() => {
            if (!isLoading || isLoadedRef.current) {
                return;
            }
            setIsImageCached(false);
        }, 200);
        return () => clearTimeout(timeout);
    }, [isLoading]);

    return (
        <View style={[styles.w100, styles.h100, props.style]}>
            <Image
                style={[styles.w100, styles.h100]}
                source={{uri: props.url}}
                isAuthTokenRequired={props.isAuthTokenRequired}
                resizeMode={Image.resizeMode.cover}
                onLoadStart={() => {
                    if (isLoadedRef.current || isLoading) {
                        return;
                    }
                    setIsLoading(true);
                }}
                onLoadEnd={() => {
                    setIsLoading(false);
                    setIsImageCached(true);
                }}
                onError={onError}
                onLoad={imageLoadedSuccessfully}
            />
            {isLoading && !isImageCached && <FullscreenLoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />}
        </View>
    );
}

ImageWithSizeCalculation.propTypes = propTypes;
ImageWithSizeCalculation.defaultProps = defaultProps;
ImageWithSizeCalculation.displayName = 'ImageWithSizeCalculation';
export default React.memo(ImageWithSizeCalculation);
