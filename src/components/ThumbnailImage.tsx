import React, {useCallback, useEffect, useState} from 'react';
import type {ImageSourcePropType, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useThumbnailDimensions from '@hooks/useThumbnailDimensions';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
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
};

type UpdateImageSizeParams = {
    width: number;
    height: number;
};

function ThumbnailImage({
    previewSourceURL,
    altText,
    style,
    isAuthTokenRequired,
    imageWidth = 200,
    imageHeight = 200,
    shouldDynamicallyResize = true,
    fallbackIcon = Expensicons.Gallery,
    fallbackIconSize = variables.iconSizeSuperLarge,
    fallbackIconColor,
    fallbackIconBackground,
    objectPosition = CONST.IMAGE_OBJECT_POSITION.INITIAL,
}: ThumbnailImageProps) {
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
        ({width, height}: UpdateImageSizeParams) => {
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
        [previewSourceURL, imageDimensions, shouldDynamicallyResize],
    );

    const sizeStyles = shouldDynamicallyResize ? [thumbnailDimensionsStyles] : [styles.w100, styles.h100];

    if (failedToLoad || previewSourceURL === '') {
        const fallbackColor = StyleUtils.getBackgroundColorStyle(fallbackIconBackground ?? theme.border);

        return (
            <View style={[style, styles.overflowHidden, fallbackColor]}>
                <View style={[...sizeStyles, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon
                        src={isOffline ? Expensicons.OfflineCloud : fallbackIcon}
                        height={fallbackIconSize}
                        width={fallbackIconSize}
                        fill={fallbackIconColor ?? theme.border}
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={[style, styles.overflowHidden]}>
            <View style={[...sizeStyles, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <ImageWithSizeCalculation
                    url={previewSourceURL}
                    altText={altText}
                    onMeasure={updateImageSize}
                    onLoadFailure={() => setFailedToLoad(true)}
                    isAuthTokenRequired={isAuthTokenRequired}
                    objectPosition={objectPosition}
                />
            </View>
        </View>
    );
}

ThumbnailImage.displayName = 'ThumbnailImage';
export default React.memo(ThumbnailImage);
