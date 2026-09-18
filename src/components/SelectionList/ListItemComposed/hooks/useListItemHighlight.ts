import useRowHighlightAnimation from '@hooks/useRowHighlightAnimation';
import useThemeStyles from '@hooks/useThemeStyles';

type UseListItemHighlightParams = {
    /** Whether the row should play the highlight animation */
    shouldHighlight?: boolean;

    /** Whether the row is currently selected */
    isSelected?: boolean;
};

/** Highlight animation plus the pressable styles that let it show through. */
function useListItemHighlight({shouldHighlight = false, isSelected = false}: UseListItemHighlightParams = {}) {
    const styles = useThemeStyles();

    const animatedHighlightStyle = useRowHighlightAnimation({shouldHighlight, borderRadius: styles.selectionListPressableItemWrapper.borderRadius});

    return {
        animatedHighlightStyle,
        pressableStyle: [styles.selectionListPressableItemWrapper, styles.mh0, styles.bgTransparent, isSelected && styles.activeComponentBG],
        pressableWrapperStyle: [styles.mh5, animatedHighlightStyle],
    };
}

export default useListItemHighlight;
