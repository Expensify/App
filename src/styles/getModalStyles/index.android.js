import getBaseModalStyles from './getBaseModalStyles';

// Overrides the value of shouldAddTopSafeAreaPadding to false
// Only apply top padding on iOS since it's the only platform using SafeAreaView
export default (type, windowDimensions, popoverAnchorPosition = {}, containerStyle = {}) => ({
    ...getBaseModalStyles(type, windowDimensions, popoverAnchorPosition, containerStyle),
    shouldAddTopSafeAreaPadding: false,
});
