import {useMemo} from 'react';
import CONST from '@src/CONST';
import useWindowDimensions from './useWindowDimensions';

export default function useThumbnailDimensions(width: number, height: number) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const fixedDimenstion = isSmallScreenWidth ? CONST.THUMBNAIL_IMAGE.SMALL_SCREEN.SIZE : CONST.THUMBNAIL_IMAGE.WIDE_SCREEN.SIZE;

    const thumbnailDimensionsStyles = useMemo(() => {
        const aspectRatio = width / height || 1;
        if (width > height) {
            return {width: fixedDimenstion, aspectRatio};
        }
        return {height: fixedDimenstion, aspectRatio};
    }, [width, height, fixedDimenstion]);

    return {thumbnailDimensionsStyles};
}
