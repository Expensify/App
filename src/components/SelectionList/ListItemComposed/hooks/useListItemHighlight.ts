import useRowHighlightAnimation from '@hooks/useRowHighlightAnimation';
import useThemeStyles from '@hooks/useThemeStyles';

type UseListItemHighlightParams = {
    /** Whether the row should play the highlight animation */
    shouldHighlight?: boolean;

    /** Whether the row is currently selected */
    isSelected?: boolean;

    /** Key of the item this row shows, so a recycled row doesn't play for the item it replaced. */
    highlightKey: string | undefined;
};

/**
 * Highlight animation plus the pressable styles that let it show through.
 * `isSelected` is not forwarded to the animation: selection is painted on the pressable, not the animated wrapper.
 */
function useListItemHighlight({shouldHighlight = false, isSelected = false, highlightKey}: UseListItemHighlightParams) {
    const styles = useThemeStyles();

    const animatedHighlightStyle = useRowHighlightAnimation({shouldHighlight, highlightKey, borderRadius: styles.selectionListPressableItemWrapper.borderRadius});

    return {
        animatedHighlightStyle,
        pressableStyle: [styles.selectionListPressableItemWrapper, styles.mh0, styles.bgTransparent, isSelected && styles.activeComponentBG],
        pressableWrapperStyle: [styles.mh5, animatedHighlightStyle],
    };
}

export default useListItemHighlight;
