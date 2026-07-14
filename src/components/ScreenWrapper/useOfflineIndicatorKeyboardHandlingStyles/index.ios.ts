import useKeyboardDismissibleFlatListValues from '@components/KeyboardDismissibleFlatList/useKeyboardDismissibleFlatListValues';

import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';

import {useAnimatedStyle} from 'react-native-reanimated';

import type UseOfflineIndicatorKeyboardHandlingStyles from './types';

const useOfflineIndicatorKeyboardHandlingStyles: UseOfflineIndicatorKeyboardHandlingStyles = () => {
    const StyleUtils = useStyleUtils();
    const {keyboardHeight} = useKeyboardDismissibleFlatListValues();
    const {paddingBottom} = useSafeAreaPaddings(true);

    return useAnimatedStyle(() => StyleUtils.getOfflineIndicatorKeyboardHandlingStyles(keyboardHeight, paddingBottom));
};

export default useOfflineIndicatorKeyboardHandlingStyles;
