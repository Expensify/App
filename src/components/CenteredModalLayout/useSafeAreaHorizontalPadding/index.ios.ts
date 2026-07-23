import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';

import type {StyleProp, ViewStyle} from 'react-native';

function useSafeAreaHorizontalPadding(): StyleProp<ViewStyle> {
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsets();

    const {paddingLeft, paddingRight} = StyleUtils.getPlatformSafeAreaPadding(insets);

    return {
        paddingLeft,
        paddingRight,
    };
}

export default useSafeAreaHorizontalPadding;
