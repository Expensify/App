import variables from '@styles/variables';
import type GetImageCompactModeStyle from './types';

const getImageCompactModeStyle: GetImageCompactModeStyle = (maxWidth, availableWidth, aspectRatio) => {
    const fullWidthLimit = availableWidth / variables.receiptPreviewMaxHeight;
    const isTall = aspectRatio && aspectRatio <= fullWidthLimit;

    // Cap ratio to 16:9 so wide images don't stretch outside the bounds of the screen.
    const cappedRatio = aspectRatio ? Math.min(aspectRatio, 16 / 9) : 16 / 9;

    return {
        width: '100%',
        maxWidth,
        minHeight: 180,
        maxHeight: variables.receiptPreviewMaxHeight,
        aspectRatio: isTall ? undefined : cappedRatio,
        height: isTall ? variables.receiptPreviewMaxHeight : 'auto',
        flexShrink: 1,
        alignSelf: 'center',
        marginHorizontal: 0,
    };
};

export default getImageCompactModeStyle;
