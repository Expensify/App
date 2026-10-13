import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

/** The background flash for an expense field row that just appeared, so the form points out the field it started asking for. */
function useFieldRowHighlightStyle(shouldHighlight: boolean) {
    const theme = useTheme();
    return useAnimatedHighlightStyle({
        shouldHighlight,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.appBG,
        borderRadius: variables.componentBorderRadiusNormal,
        itemEnterDelay: 0,
    });
}

export default useFieldRowHighlightStyle;
