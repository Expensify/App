import type GetReceiptImageRestrictedStyle from './types';

const getReceiptImageRestrictedStyle: GetReceiptImageRestrictedStyle = (maxWidth, availableWidth, aspectRatio) => {
    const cappedRatio = aspectRatio ? Math.min(aspectRatio, 1) : 1;

    return {
        maxWidth,
        flexShrink: 1,
        alignSelf: 'center',
        width: '100%',
        marginHorizontal: 0,
        height: 'auto',
        aspectRatio: cappedRatio,
    };
};

export default getReceiptImageRestrictedStyle;
