import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

type ContainerStyleParams = {
    /** Whether the header uses the headline style (taller bar). */
    shouldUseHeadlineHeader?: boolean;

    /** Whether we should show a border on the bottom of the bar. */
    shouldShowBorderBottom?: boolean;

    /** Additional styles to add to the outer bar. */
    style?: StyleProp<ViewStyle>;
};

/** Composed styles for the Header bar + zones. */
function useHeaderStyles({shouldUseHeadlineHeader = false, shouldShowBorderBottom = false, style}: ContainerStyleParams = {}) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    /** Outer header bar. */
    const containerStyle: StyleProp<ViewStyle> = [
        styles.headerBar,
        shouldUseHeadlineHeader && styles.headerBarHeight,
        shouldUseNarrowLayout && styles.headerBarHeightNarrow,
        shouldShowBorderBottom && styles.borderBottom,
        style,
    ];

    /** Inner flex row that lays out the zones. */
    const innerRowStyle: StyleProp<ViewStyle> = [styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden, styles.mr3];

    return {containerStyle, innerRowStyle};
}

export default useHeaderStyles;
