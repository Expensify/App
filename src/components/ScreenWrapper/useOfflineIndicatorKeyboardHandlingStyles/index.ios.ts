import useKeyboardDismissibleFlashListValues from '@components/KeyboardDismissibleFlashList/useKeyboardDismissibleFlashListValues';

import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';

import type {ViewStyle} from 'react-native';

import {useAnimatedStyle} from 'react-native-reanimated';

const useOfflineIndicatorKeyboardHandlingStyles = () => {
    const StyleUtils = useStyleUtils();
    const {keyboardHeight} = useKeyboardDismissibleFlashListValues();
    const {paddingBottom} = useSafeAreaPaddings(true);

    return useAnimatedStyle<ViewStyle>(() => StyleUtils.getOfflineIndicatorKeyboardHandlingStyles(keyboardHeight, paddingBottom));
};

export default useOfflineIndicatorKeyboardHandlingStyles;
