import type {StyleProp, ViewStyle} from 'react-native';

/** The native tab bar keeps content clear of itself, through the safe area on iOS and by laying it out above the bar on Android, so no extra content padding is needed. */
function useFloatingTabBarContentInsetStyle(): StyleProp<ViewStyle> {
    return undefined;
}

export default useFloatingTabBarContentInsetStyle;
