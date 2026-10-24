import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';

import type {StyleProp, ViewStyle} from 'react-native';

/**
 * The centered modal navigators span the whole window, so the backdrop reaches into the horizontal safe area and the
 * modal pads its own content out of it.
 */
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
