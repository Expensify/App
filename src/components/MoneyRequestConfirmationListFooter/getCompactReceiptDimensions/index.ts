import CONST from '@src/CONST';
import type GetCompactReceiptDimensions from './types';

const getCompactReceiptDimensions: GetCompactReceiptDimensions = ({windowWidth, horizontalMargin, containerWidth, aspectRatio}) => {
    const maxWidth = CONST.IOU.COMPACT_RECEIPT.MAX_WIDTH;

    // This logic helps to keep the preview within the screen space and max allowed width,
    // while ensuring that the preview is not too small and neither too large.
    const availableWidth = Math.max(windowWidth - horizontalMargin * 2, 0);
    const compactReceiptMaxWidth = Math.min(maxWidth, availableWidth || maxWidth);
    const compactReceiptAspectRatio = aspectRatio && aspectRatio > 0 ? aspectRatio : CONST.IOU.COMPACT_RECEIPT.DEFAULT_ASPECT_RATIO;
    const effectiveCompactReceiptWidth = containerWidth > 0 ? containerWidth : compactReceiptMaxWidth;

    // While computing height from the receipt aspect ratio, we need to apply a tiny pixel
    // adjustment to avoid occasional hairline bottom gaps caused by cross-platform sub-pixel
    // rounding differences.
    // This prevents this issue: https://github.com/Expensify/App/pull/78859#issuecomment-3921758393
    const compactReceiptMaxHeight = Math.max(Math.round(effectiveCompactReceiptWidth / compactReceiptAspectRatio) - CONST.IOU.COMPACT_RECEIPT.MAX_HEIGHT_PIXEL_ADJUSTMENT, 0);

    return {
        compactReceiptMaxWidth,
        compactReceiptMaxHeight,
    };
};

export default getCompactReceiptDimensions;
