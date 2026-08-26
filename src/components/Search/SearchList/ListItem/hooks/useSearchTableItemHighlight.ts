import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

type UseSearchTableItemHighlightParams = {
    /** Whether the row should play the highlight animation */
    shouldHighlight?: boolean;

    /** Whether the row is currently selected */
    isSelected?: boolean;

    /** Whether this is the last row in the table (affects bottom radius) */
    isLastItem?: boolean;
};

/**
 * Search-table flavor of `useListItemHighlight`: bundles the highlight animation with the pressable
 * styles a table row needs (table row paddings, bottom radius on the last wide-screen row).
 */
function useSearchTableItemHighlight({shouldHighlight = false, isSelected = false, isLastItem = false}: UseSearchTableItemHighlightParams = {}) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {isLargeScreenWidth} = useResponsiveLayout();

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: StyleUtils.getSearchTableHighlightBorderRadius(isLargeScreenWidth),
        shouldHighlight,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
        shouldApplyOtherStyles: !isLargeScreenWidth,
    });

    return {
        animatedHighlightStyle,
        pressableStyle: [
            styles.selectionListPressableItemWrapper,
            styles.pv3,
            styles.ph3,
            styles.bgTransparent,
            isSelected && styles.activeComponentBG,
            styles.mh0,
            isLargeScreenWidth &&
                StyleUtils.getSearchTableRowPressableStyle(isLastItem, isSelected, {
                    vertical: variables.tableRowPaddingVertical,
                }),
        ],
        pressableWrapperStyle: [styles.mh5, animatedHighlightStyle, isLargeScreenWidth && isLastItem && [styles.tableBottomRadius, styles.overflowHidden]],
    };
}

export default useSearchTableItemHighlight;
