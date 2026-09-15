import type {StyleProp, ViewStyle} from 'react-native';

/** The native tab bar reports its own height through the safe area, so no extra content padding is needed. */
function useFloatingTabBarContentInsetStyle(): StyleProp<ViewStyle> {
    return undefined;
}

export default useFloatingTabBarContentInsetStyle;
