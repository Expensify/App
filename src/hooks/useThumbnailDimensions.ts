import {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {DimensionValue} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import CONST from '@src/CONST';
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
    const fixedDimension = shouldUseNarrowLayout ? CONST.THUMBNAIL_IMAGE.SMALL_SCREEN.SIZE : CONST.THUMBNAIL_IMAGE.WIDE_SCREEN.SIZE;
    const thumbnailDimensionsStyles = useMemo(() => {
        if (!width || !height) {
            return {width: fixedDimension, aspectRatio: CONST.THUMBNAIL_IMAGE.NAN_ASPECT_RATIO};
        }
        const aspectRatio = (height && width / height) || 1;
        if (width > height) {
            return {width: fixedDimension, aspectRatio};
        }
        return {height: fixedDimension, aspectRatio};
    }, [width, height, fixedDimension]);

    return {thumbnailDimensionsStyles};
}
