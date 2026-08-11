import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';

import type {StyleProp, ViewStyle} from 'react-native';

// On iOS this centered modal is a native-stack `transparentModal`, presented as a UIKit VC on the window
// outside the app-level `<SafeAreaView edges={['left','right']}>`, so it inherits no horizontal safe-area padding.
// Android keeps it nested under that wrapper, so we apply this padding on iOS only to avoid double-padding.
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
