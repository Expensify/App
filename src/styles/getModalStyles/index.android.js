import getBaseModalStyles from './getBaseModalStyles';

// Only apply top padding on iOS since it's the only platform using SafeAreaView
export default (type, windowDimensions, popoverAnchorPosition = {}, containerStyle = {}) => ({
    ...getBaseModalStyles(type, windowDimensions, popoverAnchorPosition, containerStyle),
    shouldAddTopSafeAreaPadding: false,
});
