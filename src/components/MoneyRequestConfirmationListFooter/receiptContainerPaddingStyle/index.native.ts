import type GetReceiptContainerPaddingStyle from './types';

const getReceiptContainerPaddingStyle: GetReceiptContainerPaddingStyle = (shouldRestrictHeight, pt10Style) => {
    if (shouldRestrictHeight) {
        return pt10Style;
    }
    return undefined;
};

export default getReceiptContainerPaddingStyle;
