import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useSafeAreaPaddings from './useSafeAreaPaddings';

/** The parameters for the useBottomSafeSafeAreaPaddingStyle hook. */
type UseBottomSafeAreaPaddingStyleParams = {
    /** Whether to add bottom safe area padding to the content. */
    addBottomSafeAreaPadding?: boolean;

    /** The style to adapt and add bottom safe area padding to. */
    style?: StyleProp<ViewStyle>;

    /** The additional padding to add to the bottom of the content. */
    additionalPaddingBottom?: number;
};

/**
 * useBottomSafeSafeAreaPaddingStyle is a hook that creates or adapts a given style and adds bottom safe area padding.
 * It is useful for creating new styles or updating existing style props (e.g. contentContainerStyle).
 * @param params - The parameters for the hook.
 * @returns The style with bottom safe area padding applied.
 */
function useBottomSafeSafeAreaPaddingStyle(params?: UseBottomSafeAreaPaddingStyleParams) {
    const {paddingBottom: safeAreaPaddingBottom} = useSafeAreaPaddings(true);

    const {addBottomSafeAreaPadding, style, additionalPaddingBottom} = params ?? {};

    return useMemo<StyleProp<ViewStyle>>(() => {
        let totalPaddingBottom: number | string = additionalPaddingBottom ?? 0;

        // Add the safe area padding to the total padding if the flag is enabled
        if (addBottomSafeAreaPadding) {
            totalPaddingBottom += safeAreaPaddingBottom;
        }

        // If there is no bottom safe area or additional padding, return the style as is
        if (totalPaddingBottom === 0) {
            return style;
        }

        // If a style is provided, flatten the style and add the padding to it
        if (style) {
            const contentContainerStyleFlattened = StyleSheet.flatten(style);
            const stylePaddingBottom = contentContainerStyleFlattened?.paddingBottom;

            if (typeof stylePaddingBottom === 'number') {
                totalPaddingBottom += stylePaddingBottom;
            } else if (typeof stylePaddingBottom === 'string') {
                totalPaddingBottom = `calc(${totalPaddingBottom}px + ${stylePaddingBottom})`;
            } else if (stylePaddingBottom !== undefined) {
                return style;
            }

            return [style, {paddingBottom: totalPaddingBottom}];
        }

        // If no style is provided, return the padding as an object
        return {paddingBottom: totalPaddingBottom};
    }, [addBottomSafeAreaPadding, style, additionalPaddingBottom, safeAreaPaddingBottom]);
}

export default useBottomSafeSafeAreaPaddingStyle;
