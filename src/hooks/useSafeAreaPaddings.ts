import {useContext, useMemo} from 'react';
import {ScreenWrapperStatusContext} from '@components/ScreenWrapper';
import useSafeAreaInsets from './useSafeAreaInsets';
import useStyleUtils from './useStyleUtils';

/**
 * Custom hook to get safe area padding values and styles.
 *
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
 * function MyScreen() {
 *   return (
 *      <ScreenWrapper>
 *          <MyComponent />
 *      </ScreenWrapper>
 *   );
 * }
 *
 * function MyComponent() {
 *     const { paddingTop, paddingBottom, safeAreaPaddingBottomStyle } = useSafeAreaPaddings();
 *
 *     // Use these values to style your component accordingly
 * }
 */
function useSafeAreaPaddings(enableEdgeToEdgeBottomSafeAreaPadding = false) {
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsets();
    const {paddingTop, paddingBottom} = useMemo(() => StyleUtils.getPlatformSafeAreaPadding(insets), [StyleUtils, insets]);

    const screenWrapperStatusContext = useContext(ScreenWrapperStatusContext);
    const isSafeAreaTopPaddingApplied = screenWrapperStatusContext?.isSafeAreaTopPaddingApplied ?? false;
    const isSafeAreaBottomPaddingApplied = screenWrapperStatusContext?.isSafeAreaBottomPaddingApplied ?? false;

    const adaptedPaddingBottom = isSafeAreaBottomPaddingApplied ? 0 : paddingBottom;
    const safeAreaPaddingBottomStyle = useMemo(
        () => ({paddingBottom: enableEdgeToEdgeBottomSafeAreaPadding ? paddingBottom : adaptedPaddingBottom}),
        [adaptedPaddingBottom, enableEdgeToEdgeBottomSafeAreaPadding, paddingBottom],
    );

    if (enableEdgeToEdgeBottomSafeAreaPadding) {
        return {
            paddingTop,
            paddingBottom,
            unmodifiedPaddings: {},
            insets,
            safeAreaPaddingBottomStyle,
        };
    }

    const adaptedInsets = {
        ...insets,
        top: isSafeAreaTopPaddingApplied ? 0 : insets?.top,
        bottom: isSafeAreaBottomPaddingApplied ? 0 : insets?.bottom,
    };

    return {
        paddingTop: isSafeAreaTopPaddingApplied ? 0 : paddingTop,
        paddingBottom: adaptedPaddingBottom,
        unmodifiedPaddings: {
            top: paddingTop,
            bottom: paddingBottom,
        },
        insets: adaptedInsets,
        safeAreaPaddingBottomStyle,
    };
}

export default useSafeAreaPaddings;
