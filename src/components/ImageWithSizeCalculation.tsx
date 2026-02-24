import React, {useMemo} from 'react';
import type {ImageResizeMode, ImageSourcePropType, StyleProp, ViewStyle} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {FullScreenLoadingIndicatorIconSize} from './FullscreenLoadingIndicator';
import RESIZE_MODES from './Image/resizeModes';
import type {ImageObjectPosition} from './Image/types';
import ImageWithLoading from './ImageWithLoading';

type OnMeasure = (args: {width: number; height: number}) => void;

type OnLoadNativeEvent = {
    nativeEvent: {
        width: number;
        height: number;
    };
};

type ImageWithSizeCalculationProps = {
    /** Url for image to display */
    url: string | ImageSourcePropType;

    /** alt text for the image */
    altText?: string;

    /** Any additional styles to apply */
    style?: StyleProp<ViewStyle>;

    /** Callback fired when the image has been measured. */
    onMeasure: OnMeasure;

    onLoadFailure?: () => void;

    /** Whether the image requires an authToken */
    isAuthTokenRequired: boolean;

    /** The object position of image */
    objectPosition?: ImageObjectPosition;

    /** The size of the loading indicator */
    loadingIconSize?: FullScreenLoadingIndicatorIconSize;

    /** The style of the loading indicator */
    loadingIndicatorStyles?: StyleProp<ViewStyle>;

    /** Callback to be called when the image loads */
    onLoad?: (event: {nativeEvent: {width: number; height: number}}) => void;

    /** The resize mode of the image */
    resizeMode?: ImageResizeMode;
};

/**
 * Preloads an image by getting the size and passing dimensions via callback.
 * Image size must be provided by parent via width and height props. Useful for
 * performing some calculation on a network image after fetching dimensions so
 * it can be appropriately resized.
 */
function ImageWithSizeCalculation({
    url,
    altText,
    style,
    onMeasure,
    onLoadFailure,
    isAuthTokenRequired,
    objectPosition = CONST.IMAGE_OBJECT_POSITION.INITIAL,
    loadingIconSize,
    loadingIndicatorStyles,
    onLoad,
    resizeMode,
}: ImageWithSizeCalculationProps) {
    const styles = useThemeStyles();

    const source = useMemo(() => (typeof url === 'string' ? {uri: url} : url), [url]);

    const onError = () => {
        Log.hmmm('Unable to fetch image to calculate size', {url});
        onLoadFailure?.();
    };

    return (
        <ImageWithLoading
            containerStyles={[styles.w100, styles.h100, style]}
            style={[styles.w100, styles.h100]}
            source={source}
            aria-label={altText}
            isAuthTokenRequired={isAuthTokenRequired}
            resizeMode={resizeMode ?? RESIZE_MODES.cover}
            onError={onError}
            onLoad={(event: OnLoadNativeEvent) => {
                onMeasure({
                    width: event.nativeEvent.width,
                    height: event.nativeEvent.height,
                });
                onLoad?.(event);
            }}
            objectPosition={objectPosition}
            loadingIconSize={loadingIconSize}
            loadingIndicatorStyles={loadingIndicatorStyles}
        />
    );
}

ImageWithSizeCalculation.displayName = 'ImageWithSizeCalculation';

export default React.memo(ImageWithSizeCalculation);
