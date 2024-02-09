import lodashClamp from 'lodash/clamp';
import React, {useCallback, useEffect, useState} from 'react';
import type {ImageSourcePropType, StyleProp, ViewStyle} from 'react-native';
import {Dimensions, View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import useTheme from "@hooks/useTheme";
import variables from "@styles/variables";
import useNetwork from "@hooks/useNetwork";
import type IconAsset from "@src/types/utils/IconAsset";
import * as Expensicons from "./Icon/Expensicons";
import Icon from "./Icon";
import ImageWithSizeCalculation from './ImageWithSizeCalculation';

type ThumbnailImageProps = {
    /** Source URL for the preview image */
    previewSourceURL: string | ImageSourcePropType;

    /** Any additional styles to apply */
    style?: StyleProp<ViewStyle>;

    /** Whether the image requires an authToken */
    isAuthTokenRequired: boolean;

    /** Width of the thumbnail image */
    imageWidth?: number;

    /** Height of the thumbnail image */
    imageHeight?: number;

    fallbackIcon?: IconAsset;

    fallbackIconSize?: number;

    /** Should the image be resized on load or just fit container */
    shouldDynamicallyResize?: boolean;
};

type UpdateImageSizeParams = {
    width: number;
    height: number;
};

type CalculateThumbnailImageSizeResult = {
    thumbnailWidth?: number;
    thumbnailHeight?: number;
};

/**
 * Compute the thumbnails width and height given original image dimensions.
 *
 * @param width - Width of the original image.
 * @param height - Height of the original image.
 * @param windowHeight - Height of the device/browser window.
 * @returns - Object containing thumbnails width and height.
 */

function calculateThumbnailImageSize(width: number, height: number, windowHeight: number): CalculateThumbnailImageSizeResult {
    if (!width || !height) {
        return {};
    }
    // Width of the thumbnail works better as a constant than it does
    // a percentage of the screen width since it is relative to each screen
    // Note: Clamp minimum width 40px to support touch device
    let thumbnailScreenWidth = lodashClamp(width, 40, 250);
    const imageHeight = height / (width / thumbnailScreenWidth);
    // On mWeb, when soft keyboard opens, window height changes, making thumbnail height inconsistent. We use screen height instead.
    const screenHeight = DeviceCapabilities.canUseTouchScreen() ? Dimensions.get('screen').height : windowHeight;
    let thumbnailScreenHeight = lodashClamp(imageHeight, 40, screenHeight * 0.4);
    const aspectRatio = height / width;

    // If thumbnail height is greater than its width, then the image is portrait otherwise landscape.
    // For portrait images, we need to adjust the width of the image to keep the aspect ratio and vice-versa.
    if (thumbnailScreenHeight > thumbnailScreenWidth) {
        thumbnailScreenWidth = Math.round(thumbnailScreenHeight * (1 / aspectRatio));
    } else {
        thumbnailScreenHeight = Math.round(thumbnailScreenWidth * aspectRatio);
    }
    return {thumbnailWidth: Math.max(40, thumbnailScreenWidth), thumbnailHeight: Math.max(40, thumbnailScreenHeight)};
}

function ThumbnailImage({
                            previewSourceURL,
                            style,
                            isAuthTokenRequired,
                            imageWidth = 200,
                            imageHeight = 200,
                            shouldDynamicallyResize = true,
                            fallbackIcon = Expensicons.Gallery,
                            fallbackIconSize = variables.iconSizeSuperLarge,
                        }: ThumbnailImageProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();
    const {windowHeight} = useWindowDimensions();
    const initialDimensions = calculateThumbnailImageSize(imageWidth, imageHeight, windowHeight);
    const [currentImageWidth, setCurrentImageWidth] = useState(initialDimensions.thumbnailWidth);
    const [currentImageHeight, setCurrentImageHeight] = useState(initialDimensions.thumbnailHeight);
    const [failedToLoad, setFailedToLoad] = useState(false);

    useEffect(() => {
        setFailedToLoad(false);
    }, [isOffline, previewSourceURL]);

    /**
     * Update the state with the computed thumbnail sizes.
     * @param Params - width and height of the original image.
     */
    const updateImageSize = useCallback(
        ({width, height}: UpdateImageSizeParams) => {
            const {thumbnailWidth, thumbnailHeight} = calculateThumbnailImageSize(width, height, windowHeight);

            setCurrentImageWidth(thumbnailWidth);
            setCurrentImageHeight(thumbnailHeight);
        },
        [windowHeight],
    );

    const sizeStyles = shouldDynamicallyResize ? [StyleUtils.getWidthAndHeightStyle(currentImageWidth ?? 0, currentImageHeight)] : [styles.w100, styles.h100];

    if (failedToLoad) {
        return (
            <View style={[style, styles.overflowHidden, {
                backgroundColor: theme.hoverComponentBG,
                borderColor: theme.border,
            }]}>
                <View style={[...sizeStyles, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon
                        src={isOffline ? Expensicons.OfflineCloud : fallbackIcon}
                        height={fallbackIconSize}
                        width={fallbackIconSize}
                        fill={theme.border}
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
                    onMeasure={updateImageSize}
                    onLoadFailure={() => setFailedToLoad(true)}
                    isAuthTokenRequired={isAuthTokenRequired}
                />
            </View>
        </View>
    );
}

ThumbnailImage.displayName = 'ThumbnailImage';
export default React.memo(ThumbnailImage);
