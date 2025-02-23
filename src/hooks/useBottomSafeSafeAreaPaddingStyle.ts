import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useStyledSafeAreaInsets from './useStyledSafeAreaInsets';

type UseBottomSafeAreaPaddingStyleParams = {
    addBottomSafeAreaPadding?: boolean;
    style?: StyleProp<ViewStyle>;
    paddingBottom?: number;
};

function useBottomSafeSafeAreaPaddingStyle(params?: UseBottomSafeAreaPaddingStyleParams) {
    const {paddingBottom: safeAreaPaddingBottom} = useStyledSafeAreaInsets(true);

    const {addBottomSafeAreaPadding, style, paddingBottom} = params ?? {};

    return useMemo<StyleProp<ViewStyle>>(() => {
        if (addBottomSafeAreaPadding) {
            let totalPaddingBottom = safeAreaPaddingBottom + (paddingBottom ?? 0);
            if (style) {
                const contentContainerStyleFlattened = style === undefined ? undefined : StyleSheet.flatten(style);
                const stylePaddingBottom = contentContainerStyleFlattened?.paddingBottom;
                totalPaddingBottom += typeof stylePaddingBottom === 'number' ? stylePaddingBottom : 0;
            }

            return [style, {paddingBottom: totalPaddingBottom}];
        }
        return style;
    }, [addBottomSafeAreaPadding, style, paddingBottom, safeAreaPaddingBottom]);
}

export default useBottomSafeSafeAreaPaddingStyle;
