import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Log from '../libs/Log';
import styles from '../styles/styles';
import FullscreenLoadingIndicator from './FullscreenLoadingIndicator';
import Image from './Image';

/**
 * Preloads an image by getting the size and passing dimensions via callback.
 * Image size must be provided by parent via width and height props. Useful for
 * performing some calculation on a network image after fetching dimensions so
 * it can be appropriately resized.
 */
const ImageWithSizeCalculation = (
    url,
    style = {},
    onMeasure = () => {},
    isAuthTokenRequired = false,
) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <View
            style={[
                styles.w100,
                styles.h100,
                this.props.style,
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
                onLoadEnd={() => setIsLoading(true)}
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

export default React.memo(ImageWithSizeCalculation);
