import type {StyleProp, ViewStyle} from 'react-native';

/** UIKit insets the lists past the iOS tab bar, and Android reserves the bar's row below the content. */
function useTabBarContentInsetStyle(style?: StyleProp<ViewStyle>): StyleProp<ViewStyle> {
    return style;
}

export default useTabBarContentInsetStyle;
