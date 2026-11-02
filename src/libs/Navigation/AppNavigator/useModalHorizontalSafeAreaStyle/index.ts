import type {ViewStyle} from 'react-native';

const NO_STYLE: ViewStyle = {};

/** The web modal navigators pad the horizontal safe area in their card style. */
function useModalHorizontalSafeAreaStyle(): ViewStyle {
    return NO_STYLE;
}

export default useModalHorizontalSafeAreaStyle;
