import getBaseModalStyles from './getBaseModalStyles';

// Only apply top padding on iOS since it's the only platform using SafeAreaView
export default (type, windowDimensions, popoverAnchorPosition = {}, innerContainerStyle = {}) => ({
    ...getBaseModalStyles(type, windowDimensions, popoverAnchorPosition, innerContainerStyle),
    shouldAddTopSafeAreaMargin: false,
    shouldAddTopSafeAreaPadding: false,
});
