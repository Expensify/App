// eslint-disable-next-line no-restricted-imports
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useStyleUtils from './useStyleUtils';

/**
 * Custom hook to get the styled safe area insets.
 * This hook utilizes the `SafeAreaInsetsContext` to retrieve the current safe area insets
 * and applies styling adjustments using the `useStyleUtils` hook.
 *
 * @returns  An object containing the styled safe area insets and additional styles.
 * @returns  .paddingTop The top padding adjusted for safe area.
 * @returns  .paddingBottom The bottom padding adjusted for safe area.
 * @returns  .insets The safe area insets object or undefined if not available.
 * @returns  .safeAreaPaddingBottomStyle An object containing the bottom padding style adjusted for safe area.
 *
 * @example
 * // How to use this hook in a component
 * function MyComponent() {
 *     const { paddingTop, paddingBottom, safeAreaPaddingBottomStyle } = useStyledSafeAreaInsets();
 *
 *     // Use these values to style your component accordingly
 * }
 */
function useStyledSafeAreaInsets() {
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsets();

    const {paddingTop, paddingBottom} = StyleUtils.getSafeAreaPadding(insets ?? undefined);
    return {
        paddingTop,
        paddingBottom,
        insets: insets ?? undefined,
        safeAreaPaddingBottomStyle: {paddingBottom},
    };
}

export default useStyledSafeAreaInsets;
