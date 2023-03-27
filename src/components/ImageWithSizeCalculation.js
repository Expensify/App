import React from 'react';
import {View} from 'react-native';
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

/**
 * Preloads an image by getting the size and passing dimensions via callback.
 * Image size must be provided by parent via width and height props. Useful for
 * performing some calculation on a network image after fetching dimensions so
 * it can be appropriately resized.
 */
const ImageWithSizeCalculation = (
    url,
    onMeasure = () => {},
    style = {},
    isAuthTokenRequired = false,
) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <View
            style={[
                styles.w100,
                styles.h100,
                ...style,
            ]}
        >
            <Image
                style={[
                    styles.w100,
                    styles.h100,
                ]}
                source={{uri: url}}
                isAuthTokenRequired={isAuthTokenRequired}
                resizeMode={Image.resizeMode.contain}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
                onError={() => Log.hmmm('Unable to fetch image to calculate size', {url})}
                onLoad={(event) => {
                    onMeasure({
                        width: event.nativeEvent.width,
                        height: event.nativeEvent.height,
                    });
                }}
            />
            {isLoading && (
                <FullscreenLoadingIndicator
                    style={[styles.opacity1, styles.bgTransparent]}
                />
            )}
        </View>
    );
};

ImageWithSizeCalculation.propTypes = propTypes;
export default React.memo(ImageWithSizeCalculation);
