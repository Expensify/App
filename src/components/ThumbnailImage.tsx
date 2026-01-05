import React, {useCallback, useEffect, useState} from 'react';
import type {ImageSourcePropType, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useThumbnailDimensions from '@hooks/useThumbnailDimensions';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {Dimensions} from '@src/types/utils/Layout';
import AttachmentDeletedIndicator from './AttachmentDeletedIndicator';
import type {FullScreenLoadingIndicatorIconSize} from './FullscreenLoadingIndicator';
import Icon from './Icon';
import type {ImageObjectPosition} from './Image/types';
import ImageWithSizeCalculation from './ImageWithSizeCalculation';

// Cache for the dimensions of the thumbnails to avoid flickering incorrect size when the
// image has already been loaded once. This caches the dimensions based on the URL of
// the image.
const thumbnailDimensionsCache = new Map<string, {width: number; height: number}>();

type ThumbnailImageProps = {
    /** Source URL for the preview image */
    previewSourceURL: string | ImageSourcePropType;

    /** alt text for the image */
    altText?: string;

    /** Any additional styles to apply */
    style?: StyleProp<ViewStyle>;

    /** Whether the image requires an authToken */
    isAuthTokenRequired: boolean;

    /** Width of the thumbnail image */
    imageWidth?: number;

    /** Height of the thumbnail image */
    imageHeight?: number;

    /** The size of the loading indicator */
    loadingIconSize?: FullScreenLoadingIndicatorIconSize;

    /** The style of the loading indicator */
    loadingIndicatorStyles?: StyleProp<ViewStyle>;

    /** If the image fails to load – show the provided fallback icon */
    fallbackIcon?: IconAsset;

    /** The size of the fallback icon */
    fallbackIconSize?: number;

    /** The color of the fallback icon */
    fallbackIconColor?: string;

    /** The background color of fallback icon */
    fallbackIconBackground?: string;

    /** Should the image be resized on load or just fit container */
    shouldDynamicallyResize?: boolean;

    /** The object position of image */
    objectPosition?: ImageObjectPosition;

    /** Whether the image is deleted */
    isDeleted?: boolean;

    /** Callback fired when the image fails to load */
    onLoadFailure?: () => void;

    /** Callback fired when the image has been measured */
    onMeasure?: () => void;

    /** Callback to be called when the image loads */
    onLoad?: (event: {nativeEvent: {width: number; height: number}}) => void;
};

function ThumbnailImage({
    previewSourceURL,
    altText,
    style,
    isAuthTokenRequired,
    imageWidth = 200,
    imageHeight = 200,
    shouldDynamicallyResize = true,
    loadingIconSize,
    fallbackIcon,
    fallbackIconSize = variables.iconSizeSuperLarge,
    fallbackIconColor,
    fallbackIconBackground,
    objectPosition = CONST.IMAGE_OBJECT_POSITION.INITIAL,
    isDeleted,
    onLoadFailure,
    onMeasure,
    loadingIndicatorStyles,
    onLoad,
}: ThumbnailImageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Gallery', 'OfflineCloud']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const [failedToLoad, setFailedToLoad] = useState(false);
    const cachedDimensions = shouldDynamicallyResize && typeof previewSourceURL === 'string' ? thumbnailDimensionsCache.get(previewSourceURL) : null;
    const [imageDimensions, setImageDimensions] = useState({width: cachedDimensions?.width ?? imageWidth, height: cachedDimensions?.height ?? imageHeight});
    const {thumbnailDimensionsStyles} = useThumbnailDimensions(imageDimensions.width, imageDimensions.height);
    const StyleUtils = useStyleUtils();

    useEffect(() => {
        setFailedToLoad(false);
    }, [isOffline, previewSourceURL]);

    /**
     * Update the state with the computed thumbnail sizes.
     * @param Params - width and height of the original image.
     */
    const updateImageSize = useCallback(
        ({width, height}: Dimensions) => {
            if (
                !shouldDynamicallyResize ||
                // If the provided dimensions are good avoid caching them and updating state.
                (imageDimensions.width === width && imageDimensions.height === height)
            ) {
                return;
            }

            if (typeof previewSourceURL === 'string') {
                thumbnailDimensionsCache.set(previewSourceURL, {width, height});
            }

            setImageDimensions({width, height});
        },
        [previewSourceURL, imageDimensions.width, imageDimensions.height, shouldDynamicallyResize],
    );

    const sizeStyles = shouldDynamicallyResize ? [thumbnailDimensionsStyles] : [styles.w100, styles.h100];

    if (failedToLoad || previewSourceURL === '') {
        const fallbackColor = StyleUtils.getBackgroundColorStyle(fallbackIconBackground ?? theme.border);

        return (
            <View style={[style, styles.overflowHidden, fallbackColor]}>
                <View style={[...sizeStyles, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon
                        src={isOffline ? icons.OfflineCloud : (fallbackIcon ?? icons.Gallery)}
                        height={fallbackIconSize}
                        width={fallbackIconSize}
                        fill={fallbackIconColor ?? theme.border}
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.thumbnailImageContainerHighlight, style, styles.overflowHidden]}>
            {!!isDeleted && <AttachmentDeletedIndicator containerStyles={[...sizeStyles]} />}
            <View style={[...sizeStyles, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <ImageWithSizeCalculation
                    url={previewSourceURL}
                    altText={altText}
                    onMeasure={(args) => {
                        updateImageSize(args);
                        onMeasure?.();
                    }}
                    onLoadFailure={() => {
                        setFailedToLoad(true);
                        onLoadFailure?.();
                    }}
                    isAuthTokenRequired={isAuthTokenRequired}
                    objectPosition={objectPosition}
                    loadingIconSize={loadingIconSize}
                    loadingIndicatorStyles={loadingIndicatorStyles}
                    onLoad={onLoad}
                />
            </View>
        </View>
    );
}

ThumbnailImage.displayName = 'ThumbnailImage';

export default React.memo(ThumbnailImage);
