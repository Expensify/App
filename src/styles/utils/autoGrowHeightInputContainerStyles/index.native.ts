import type {ViewStyle} from 'react-native';

// iOS forms keep intrinsic scrolling instead of bounding their content to the viewport, so the slot never needs a minimum height.
const getAutoGrowHeightInputContainerStyles = (): ViewStyle => ({
    flex: 1,
});

export default getAutoGrowHeightInputContainerStyles;
