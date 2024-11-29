import type {EdgeInsets} from 'react-native-safe-area-context';
// eslint-disable-next-line no-restricted-imports
import {useSafeAreaInsets as useSafeAreaInsetsInternal} from 'react-native-safe-area-context';
import useStyleUtils from './useStyleUtils';

function useSafeAreaInsets(): EdgeInsets {
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsetsInternal();
    const adjustedInsets = StyleUtils.getSafeAreaInsets(insets);

    return adjustedInsets;
}

export default useSafeAreaInsets;
