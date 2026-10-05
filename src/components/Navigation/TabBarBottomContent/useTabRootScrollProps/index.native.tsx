import type {StyleProp, ViewStyle} from 'react-native';

import type TabRootScrollProps from './types';

/**
 * UIKit insets the end of the list past the translucent iOS tab bar that the content runs under, and Android reserves
 * the bar's row below the content, so the content container keeps its style.
 */
function useTabRootScrollProps(style?: StyleProp<ViewStyle>): TabRootScrollProps {
    return {contentContainerStyle: style, contentInsetAdjustmentBehavior: 'automatic'};
}

export default useTabRootScrollProps;
