import React, {useState} from 'react';
import PropTypes from 'prop-types';
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

const defaultProps = {
    style: {},
    onMeasure: () => {},
    isAuthTokenRequired: false,
};

const ImageWithSizeCalculation = (props) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <View
            style={[
                styles.w100,
                styles.h100,
                ...props.style,
            ]}
        >
            <Image
                style={[
                    styles.w100,
                    styles.h100,
                ]}
                source={{uri: props.url}}
                isAuthTokenRequired={props.isAuthTokenRequired}
                resizeMode={Image.resizeMode.contain}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
                onError={() => Log.hmmm('Unable to fetch image to calculate size', {url: props.url})}
                onLoad={(event) => {
                    props.onMeasure({
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

ImageWithSizeCalculation.displayName = 'ImageWithSizeCalculation';
ImageWithSizeCalculation.propTypes = propTypes;
ImageWithSizeCalculation.defaultProps = defaultProps;
export default React.memo(ImageWithSizeCalculation);
