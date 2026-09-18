import variables from '@styles/variables';

import useAnimatedHighlightStyle from './useAnimatedHighlightStyle';
import useTheme from './useTheme';

type UseRowHighlightAnimationParams = {
    /** Whether the row should play the highlight animation */
    shouldHighlight?: boolean;

    /** Selected rows rest on activeComponentBG instead of highlightBG */
    isSelected?: boolean;

    borderRadius?: number;

    /** Carry height and border radius in the animated style. False for rows that round their own corners */
    shouldApplyOtherStyles?: boolean;
};

/** Highlight flash for a list row in theme colors, returned as the style for the row's pressable wrapper. */
function useRowHighlightAnimation({
    shouldHighlight = false,
    isSelected = false,
    borderRadius = variables.componentBorderRadius,
    shouldApplyOtherStyles = true,
}: UseRowHighlightAnimationParams = {}) {
    const theme = useTheme();

    return useAnimatedHighlightStyle({
        borderRadius,
        shouldHighlight,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: isSelected ? theme.activeComponentBG : theme.highlightBG,
        shouldApplyOtherStyles,
    });
}

export default useRowHighlightAnimation;
