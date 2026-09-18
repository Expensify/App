import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRowHighlightAnimation from '@hooks/useRowHighlightAnimation';
import useStyleUtils from '@hooks/useStyleUtils';
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

/** Highlight animation plus the pressable styles a search-table row needs: row paddings, bottom radius on the last wide row. */
function useSearchTableItemHighlight({shouldHighlight = false, isSelected = false, isLastItem = false}: UseSearchTableItemHighlightParams = {}) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isLargeScreenWidth} = useResponsiveLayout();

    const animatedHighlightStyle = useRowHighlightAnimation({
        shouldHighlight,
        borderRadius: StyleUtils.getSearchTableHighlightBorderRadius(isLargeScreenWidth),
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
