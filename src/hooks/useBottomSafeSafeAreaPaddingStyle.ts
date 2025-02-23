import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useStyledSafeAreaInsets from './useStyledSafeAreaInsets';

type UseBottomSafeAreaPaddingStyleParams = {
    addBottomSafeAreaPadding?: boolean;
    style?: StyleProp<ViewStyle>;
    additionalPaddingBottom?: number;
};

function useBottomSafeSafeAreaPaddingStyle(params?: UseBottomSafeAreaPaddingStyleParams) {
    const {paddingBottom: safeAreaPaddingBottom} = useStyledSafeAreaInsets(true);

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
