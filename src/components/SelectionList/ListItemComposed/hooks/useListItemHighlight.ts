import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type UseListItemHighlightParams = {
    /** Whether the row should play the highlight animation */
    shouldHighlight?: boolean;

    /** Whether the row is currently selected */
    isSelected?: boolean;
};

/**
 * Bundles the highlight animation with the pressable styles a row needs so the highlight rests on
 * the right background. Search-table rows use `useSearchTableItemHighlight` instead; rows owning
 * their own pressable layout (grouped and wide/narrow search rows) take `animatedHighlightStyle`
 * alone and ignore the pressable bundle.
 */
function useListItemHighlight({shouldHighlight = false, isSelected = false}: UseListItemHighlightParams = {}) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: styles.selectionListPressableItemWrapper.borderRadius,
        shouldHighlight,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
        shouldApplyOtherStyles: true,
    });

    return {
        animatedHighlightStyle,
        pressableStyle: [styles.selectionListPressableItemWrapper, styles.mh0, styles.bgTransparent, isSelected && styles.activeComponentBG],
        pressableWrapperStyle: [styles.mh5, animatedHighlightStyle],
    };
}

export default useListItemHighlight;
