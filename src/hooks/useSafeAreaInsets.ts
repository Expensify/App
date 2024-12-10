import type {EdgeInsets} from 'react-native-safe-area-context';
// eslint-disable-next-line no-restricted-imports
import {useSafeAreaInsets as useSafeAreaInsetsInternal} from 'react-native-safe-area-context';
import useStyleUtils from './useStyleUtils';

/**
 * Note: if you're looking for a hook to implement safe area padding in your screen, please either:
 * - use a <ScreenWrapper> component and set `includeSafeAreaPaddingBottom` to `true`. Or
 * - use the `useStyledSafeAreaInsets` hook.
 *
 * This hook is only meant for internal use cases where you need to access the raw safe area insets.
 */
function useSafeAreaInsets(): EdgeInsets {
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsetsInternal();
    const adjustedInsets = StyleUtils.getSafeAreaInsets(insets);

    return adjustedInsets;
}

export default useSafeAreaInsets;
