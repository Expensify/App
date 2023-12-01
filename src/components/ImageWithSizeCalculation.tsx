import delay from 'lodash/delay';
import React, {useEffect, useRef, useState} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {OnLoadEvent} from 'react-native-fast-image';
import Log from '@libs/Log';
import useThemeStyles from '@styles/useThemeStyles';
import FullscreenLoadingIndicator from './FullscreenLoadingIndicator';
import Image from './Image';
import RESIZE_MODES from './Image/resizeModes';

type OnMeasure = (args: {width: number; height: number}) => void;

type ImageWithSizeCalculationProps = {
    /** Url for image to display */
    url: string;

    /** Any additional styles to apply */
    style?: StyleProp<ViewStyle>;

    /** Callback fired when the image has been measured. */
    onMeasure: OnMeasure;

    /** Whether the image requires an authToken */
    isAuthTokenRequired: boolean;
};

/**
 * Preloads an image by getting the size and passing dimensions via callback.
 * Image size must be provided by parent via width and height props. Useful for
 * performing some calculation on a network image after fetching dimensions so
 * it can be appropriately resized.
 */
function ImageWithSizeCalculation({url, style, onMeasure, isAuthTokenRequired}: ImageWithSizeCalculationProps) {
    const styles = useThemeStyles();
    const isLoadedRef = useRef<boolean | null>(null);
    const [isImageCached, setIsImageCached] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const onError = () => {
        Log.hmmm('Unable to fetch image to calculate size', {url});
    };

    const imageLoadedSuccessfully = (event: OnLoadEvent) => {
        isLoadedRef.current = true;
        onMeasure({
            width: event.nativeEvent.width,
            height: event.nativeEvent.height,
        });
    };

    /** Delay the loader to detect whether the image is being loaded from the cache or the internet. */
    useEffect(() => {
        if (isLoadedRef.current ?? !isLoading) {
            return;
        }
        const timeout = delay(() => {
            if (!isLoading || isLoadedRef.current) {
                return;
            }
            setIsImageCached(false);
        }, 200);
        return () => clearTimeout(timeout);
    }, [isLoading]);

    return (
        <View style={[styles.w100, styles.h100, style]}>
            <Image
                style={[styles.w100, styles.h100]}
                source={{uri: url}}
                isAuthTokenRequired={isAuthTokenRequired}
                resizeMode={RESIZE_MODES.cover}
                onLoadStart={() => {
                    if (isLoadedRef.current ?? isLoading) {
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

ImageWithSizeCalculation.displayName = 'ImageWithSizeCalculation';
export default React.memo(ImageWithSizeCalculation);
