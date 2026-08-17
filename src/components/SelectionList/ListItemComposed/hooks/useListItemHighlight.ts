import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

type ListItemHighlightVariant = 'default' | 'searchTable';

type UseListItemHighlightParams = {
    /** Whether the row should play the highlight animation */
    shouldHighlight?: boolean;

    /** Whether the row is currently selected */
    isSelected?: boolean;

    /** Highlight animation and pressable style variant */
    variant?: ListItemHighlightVariant;

    /** Whether this is the last row in a search table (affects bottom radius) */
    isLastItem?: boolean;
};

/**
 * Bundles the highlight animation with the pressable styles a row needs so the highlight rests on
 * the right background. Rows owning their own pressable layout (grouped and wide/narrow search rows)
 * take `animatedHighlightStyle` alone and ignore the pressable bundle.
 */
function useListItemHighlight({shouldHighlight = false, isSelected = false, variant = 'default', isLastItem = false}: UseListItemHighlightParams = {}) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {isLargeScreenWidth} = useResponsiveLayout();

    const isSearchTable = variant === 'searchTable';

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: isSearchTable ? StyleUtils.getSearchTableHighlightBorderRadius(isLargeScreenWidth) : styles.selectionListPressableItemWrapper.borderRadius,
        shouldHighlight,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
        shouldApplyOtherStyles: isSearchTable ? !isLargeScreenWidth : true,
    });

    if (!isSearchTable) {
        return {
            animatedHighlightStyle,
            pressableStyle: [styles.selectionListPressableItemWrapper, styles.mh0, shouldHighlight ? styles.bgTransparent : undefined, isSelected && styles.activeComponentBG],
            pressableWrapperStyle: [styles.mh5, animatedHighlightStyle],
        };
    }

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
                StyleUtils.getSearchTableRowPressableStyle(!!isLastItem, isSelected, {
                    vertical: variables.tableRowPaddingVertical,
                }),
        ],
        pressableWrapperStyle: [styles.mh5, animatedHighlightStyle, isLargeScreenWidth && isLastItem && [styles.tableBottomRadius, styles.overflowHidden]],
    };
}

export default useListItemHighlight;
