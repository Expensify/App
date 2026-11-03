import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';
import type {DimensionValue} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import useIsInSidePanel from './useIsInSidePanel';
import useResponsiveLayout from './useResponsiveLayout';

type ThumbnailDimensions = {
    thumbnailDimensionsStyles: {
        aspectRatio?: number | string | undefined;
        height?: DimensionValue | undefined;
        width?: DimensionValue | undefined;
    } & StyleProp<ViewStyle>;
};

export default function useThumbnailDimensions(width: number, height: number): ThumbnailDimensions {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isInSidePanel = useIsInSidePanel();
    // The side panel is as narrow as a phone screen even on wide layouts, so it needs the small thumbnail size to avoid clipping
    const fixedDimension = shouldUseNarrowLayout || isInSidePanel ? CONST.THUMBNAIL_IMAGE.SMALL_SCREEN.SIZE : CONST.THUMBNAIL_IMAGE.WIDE_SCREEN.SIZE;
    let thumbnailDimensionsStyles;
    if (!width || !height) {
        thumbnailDimensionsStyles = {
            width: fixedDimension,
            aspectRatio: CONST.THUMBNAIL_IMAGE.NAN_ASPECT_RATIO,
        };
    } else {
        const aspectRatio = (height && width / height) || 1;
        if (width > height) {
            thumbnailDimensionsStyles = {
                width: fixedDimension,
                aspectRatio,
            };
        } else {
            thumbnailDimensionsStyles = {
                height: fixedDimension,
                aspectRatio,
            };
        }
    }

    return {thumbnailDimensionsStyles};
}
