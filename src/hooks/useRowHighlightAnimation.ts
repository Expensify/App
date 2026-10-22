import variables from '@styles/variables';

import useAnimatedHighlightStyle from './useAnimatedHighlightStyle';
import useTheme from './useTheme';

type UseRowHighlightAnimationParams = {
    /** Whether the row should play the highlight animation */
    shouldHighlight?: boolean;

    /** Selected rows rest on activeComponentBG instead of highlightBG */
    isSelected?: boolean;

    /** Radius the animated style rounds the row with, only applied when `shouldApplyOtherStyles` is set */
    borderRadius?: number;

    /** Carry height and border radius in the animated style. False for rows that round their own corners */
    shouldApplyOtherStyles?: boolean;

    /** Show the row immediately instead of fading it in, for rows that are already on screen when the highlight starts */
    skipInitialFade?: boolean;

    /** Delay before the row fades in, defaults to CONST.ANIMATED_HIGHLIGHT_ENTRY_DELAY */
    itemEnterDelay?: number;
};

/** Highlight flash for a list row in theme colors, returned as the style for the row's pressable wrapper. */
function useRowHighlightAnimation({
    shouldHighlight = false,
    isSelected = false,
    borderRadius = variables.componentBorderRadius,
    shouldApplyOtherStyles = true,
    skipInitialFade,
    itemEnterDelay,
}: UseRowHighlightAnimationParams = {}) {
    const theme = useTheme();

    return useAnimatedHighlightStyle({
        borderRadius,
        shouldHighlight,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: isSelected ? theme.activeComponentBG : theme.highlightBG,
        shouldApplyOtherStyles,
        skipInitialFade,
        itemEnterDelay,
    });
}

export default useRowHighlightAnimation;
