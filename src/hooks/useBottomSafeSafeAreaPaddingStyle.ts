import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import CONST from '@src/CONST';
import useNetwork from './useNetwork';
import useSafeAreaPaddings from './useSafeAreaPaddings';

/** The parameters for the useBottomSafeSafeAreaPaddingStyle hook. */
type UseBottomSafeAreaPaddingStyleParams = {
    /** Whether to add bottom safe area padding to the content. */
    addBottomSafeAreaPadding?: boolean;

    /** Whether to add bottom safe area padding to the content. */
    addOfflineIndicatorBottomSafeAreaPadding?: boolean;

    /** The style to adapt and add bottom safe area padding to. */
    style?: StyleProp<ViewStyle>;

    /** The style property to use for applying the bottom safe area padding. */
    styleProperty?: 'paddingBottom' | 'bottom';

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
    const {isOffline} = useNetwork();

    const {addBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding, style, styleProperty = 'paddingBottom', additionalPaddingBottom = 0} = params ?? {};

    return useMemo<StyleProp<ViewStyle>>(() => {
        let totalPaddingBottom: number | string = additionalPaddingBottom;

        // Add the safe area padding to the total padding if the flag is enabled
        if (addBottomSafeAreaPadding) {
            totalPaddingBottom += safeAreaPaddingBottom;
        }

        if (addOfflineIndicatorBottomSafeAreaPadding && isOffline) {
            totalPaddingBottom += CONST.OFFLINE_INDICATOR_HEIGHT;
        }

        // If there is no bottom safe area or additional padding, return the style as is
        if (totalPaddingBottom === 0) {
            return style;
        }

        // If a style is provided, flatten the style and add the padding to it
        if (style) {
            const contentContainerStyleFlattened = StyleSheet.flatten(style);
            const styleBottomSafeAreaPadding = contentContainerStyleFlattened?.[styleProperty];

            if (typeof styleBottomSafeAreaPadding === 'number') {
                totalPaddingBottom += styleBottomSafeAreaPadding;
            } else if (typeof styleBottomSafeAreaPadding === 'string') {
                totalPaddingBottom = `calc(${totalPaddingBottom}px + ${styleBottomSafeAreaPadding})`;
            } else if (styleBottomSafeAreaPadding !== undefined) {
                return style;
            }

            // The user of this hook can decide which style property to use for applying the padding.
            return [style, {[styleProperty]: totalPaddingBottom}];
        }

        // If no style is provided, return the padding as an object
        return {paddingBottom: totalPaddingBottom};
    }, [additionalPaddingBottom, addBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding, isOffline, style, safeAreaPaddingBottom, styleProperty]);
}

export default useBottomSafeSafeAreaPaddingStyle;
