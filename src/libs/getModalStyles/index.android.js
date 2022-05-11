import getModalStyles from './getModalStyles';

export default (type, windowDimensions, popoverAnchorPosition, containerStyle) => ({
    ...getModalStyles(type, windowDimensions, popoverAnchorPosition, containerStyle),
    shouldAddTopSafeAreaPadding: false,
});
