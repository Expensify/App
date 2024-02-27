import React, {useCallback, useEffect, useState} from 'react';
import type {ImageSourcePropType, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useThumbnailDimensions from '@hooks/useThumbnailDimensions';
import variables from '@styles/variables';
import type IconAsset from '@src/types/utils/IconAsset';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
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

    /** If the image fails to load – show the provided fallback icon */
    fallbackIcon?: IconAsset;

    /** The size of the fallback icon */
    fallbackIconSize?: number;

    /** Should the image be resized on load or just fit container */
    shouldDynamicallyResize?: boolean;
};

type UpdateImageSizeParams = {
    width: number;
    height: number;
};

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
    const {isOffline} = useNetwork();
    const [failedToLoad, setFailedToLoad] = useState(false);
    const [imageDimensions, setImageDimensions] = useState({width: imageWidth, height: imageHeight});
    const {thumbnailDimensionsStyles} = useThumbnailDimensions(imageDimensions.width, imageDimensions.height);

    useEffect(() => {
        setFailedToLoad(false);
    }, [isOffline, previewSourceURL]);

    /**
     * Update the state with the computed thumbnail sizes.
     * @param Params - width and height of the original image.
     */
    const updateImageSize = useCallback(
        ({width, height}: UpdateImageSizeParams) => {
            if (!shouldDynamicallyResize) {
                return;
            }
            setImageDimensions({width, height});
        },
        [shouldDynamicallyResize],
    );

    const sizeStyles = shouldDynamicallyResize ? [thumbnailDimensionsStyles] : [styles.w100, styles.h100];

    if (failedToLoad) {
        return (
            <View style={[style, styles.overflowHidden, styles.hoveredComponentBG]}>
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
