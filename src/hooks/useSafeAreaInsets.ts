import type {EdgeInsets} from 'react-native-safe-area-context';
// eslint-disable-next-line no-restricted-imports
import {useSafeAreaInsets as useSafeAreaInsetsInternal} from 'react-native-safe-area-context';
import useKeyboardState from './useKeyboardState';
import useStyleUtils from './useStyleUtils';

function useSafeAreaInsets(): EdgeInsets {
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsetsInternal();
    const {isKeyboardShown} = useKeyboardState();
    const adjustedInsets = StyleUtils.getSafeAreaInsets(insets);

    return {
        ...adjustedInsets,
        bottom: isKeyboardShown ? 0 : insets.bottom,
    };
}

export default useSafeAreaInsets;
