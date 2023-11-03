import {useMemo} from 'react';
import useWindowDimensions from './useWindowDimensions';

export default function useThumbnailDimensions(width: number, height: number) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const fixedDimenstion = isSmallScreenWidth ? 250 : 350;

    const thumbnailDimensionsStyles = useMemo(() => {
        const aspectRatio = width / height;
        if (width > height) {
            return {width: fixedDimenstion, aspectRatio};
        }
        return {height: fixedDimenstion, aspectRatio};
    }, [width, height, fixedDimenstion]);

    return {thumbnailDimensionsStyles};
}
