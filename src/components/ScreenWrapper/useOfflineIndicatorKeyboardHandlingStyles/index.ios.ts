import type {ViewStyle} from 'react-native';
import {useAnimatedStyle} from 'react-native-reanimated';
import useKeyboardDismissibleFlatListValues from '@components/KeyboardDismissibleFlatList/useKeyboardDismissibleFlatListValues';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';

function useOfflineIndicatorKeyboardHandlingStyles(): ViewStyle {
    const StyleUtils = useStyleUtils();
    const {keyboardHeight} = useKeyboardDismissibleFlatListValues();
    const {paddingBottom} = useSafeAreaPaddings(true);

    return useAnimatedStyle(() => StyleUtils.getOfflineIndicatorKeyboardHandlingStyles(keyboardHeight, paddingBottom));
}

export default useOfflineIndicatorKeyboardHandlingStyles;
