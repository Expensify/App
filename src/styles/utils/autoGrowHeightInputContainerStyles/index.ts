/**
 * Sizes the AutoGrowHeightInputContainer slot so an auto-growing input fills the space its form gives it.
 */
import variables from '@styles/variables';

import type {ViewStyle} from 'react-native';

// Web forms bound their content to the viewport, so a very short viewport can squeeze the slot to nothing. Forms that opt in keep one input row instead.
const getAutoGrowHeightInputContainerStyles = (shouldKeepMinimumHeight: boolean): ViewStyle => ({
    flex: 1,
    ...(shouldKeepMinimumHeight ? {minHeight: variables.componentSizeLarge} : {}),
});

export default getAutoGrowHeightInputContainerStyles;
