import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

function useInsightChartPaddingStyle(): StyleProp<ViewStyle> {
    const styles = useThemeStyles();
    const {cardPaddingHorizontal, cardPaddingBottom} = useLayoutSpacing();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return [cardPaddingHorizontal, cardPaddingBottom, !shouldUseNarrowLayout && styles.pt3];
}

export default useInsightChartPaddingStyle;
