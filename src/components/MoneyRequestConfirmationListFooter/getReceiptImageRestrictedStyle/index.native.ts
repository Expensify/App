import variables from '@styles/variables';
import type GetReceiptImageRestrictedStyle from './types';

const getReceiptImageRestrictedStyle: GetReceiptImageRestrictedStyle = (maxWidth, availableWidth, aspectRatio) => {
    const fullWidthLimit = availableWidth / variables.receiptPreviewMaxHeight;
    const isTall = aspectRatio && aspectRatio <= fullWidthLimit;

    const cappedRatio = aspectRatio ? Math.min(aspectRatio, 16/9) : 16/9;

    return {
        width: '100%',
        maxWidth,
        maxHeight: variables.receiptPreviewMaxHeight,
        aspectRatio: isTall ? undefined : cappedRatio,
        height: isTall ? variables.receiptPreviewMaxHeight : 'auto',
        flexShrink: 1,
        alignSelf: 'center',
        marginHorizontal: 0,
    };
};

export default getReceiptImageRestrictedStyle;
