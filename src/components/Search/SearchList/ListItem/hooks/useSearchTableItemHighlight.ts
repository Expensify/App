import useLayoutSpacing from '@hooks/useLayoutSpacing';
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

/**
 * Highlight animation plus the pressable styles a search-table row needs: row paddings, bottom radius on the last wide row.
 * `isSelected` is not forwarded to the animation: selection is painted on the pressable, not the animated wrapper.
 */
function useSearchTableItemHighlight({shouldHighlight = false, isSelected = false, isLastItem = false}: UseSearchTableItemHighlightParams = {}) {
    const styles = useThemeStyles();
    const {pageGutterMargin} = useLayoutSpacing();
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
        pressableWrapperStyle: [pageGutterMargin, animatedHighlightStyle, isLargeScreenWidth && isLastItem && [styles.tableBottomRadius, styles.overflowHidden]],
    };
}

export default useSearchTableItemHighlight;
