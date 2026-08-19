import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

type ContainerStyleParams = {
    /** Whether the header uses the headline style (taller bar). */
    shouldUseHeadlineHeader?: boolean;

    /** Additional styles to add to the outer bar. */
    style?: StyleProp<ViewStyle>;
};

/** Composed styles for the Header bar + zones. Left padding (pl2/pl0) is derived from block registration, not props. */
function useHeaderStyles({shouldUseHeadlineHeader = false, style}: ContainerStyleParams = {}) {
    const styles = useThemeStyles();

    /** Outer header bar. */
    const containerStyle: StyleProp<ViewStyle> = [styles.headerBar, shouldUseHeadlineHeader && styles.headerBarHeight, style];

    /** Inner flex row that lays out the three zones. */
    const innerRowStyle: StyleProp<ViewStyle> = [styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden, styles.mr3];

    return {containerStyle, innerRowStyle};
}

export default useHeaderStyles;
