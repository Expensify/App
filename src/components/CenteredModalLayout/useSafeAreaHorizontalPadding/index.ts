import type {StyleProp, ViewStyle} from 'react-native';

function useSafeAreaHorizontalPadding(): StyleProp<ViewStyle> {
    return {
        paddingLeft: 0,
        paddingRight: 0,
    };
}

export default useSafeAreaHorizontalPadding;
