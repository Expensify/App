import baseGetModalStyles from './baseGetModalStyles';

export default (type, windowDimensions, popoverAnchorPosition = {}, containerStyle = {}) => ({
    ...baseGetModalStyles(type, windowDimensions, popoverAnchorPosition, containerStyle),
    shouldAddTopSafeAreaPadding: false,
});
