import type GetReceiptContainerCompactModeStyle from './types';

const getReceiptContainerCompactModeStyle: GetReceiptContainerCompactModeStyle = (maxWidth, maxHeight) => ({
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    height: 'auto',
    maxWidth,
    maxHeight,
    minHeight: 0,
    marginBottom: 12,
});

export default getReceiptContainerCompactModeStyle;
