import React from 'react';
import {StyleSheet} from 'react-native';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import MenuItem from './MenuItem';
import type {MenuItemProps} from './MenuItem';

type Props = MenuItemProps & {
    /** Should the menu item be highlighted? */
    highlighted?: boolean;
};

function HighlightableMenuItem({wrapperStyle, highlighted, ...restOfProps}: Props) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const flattenedWrapperStyles = StyleSheet.flatten(wrapperStyle);
    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight: highlighted ?? false,
        height: flattenedWrapperStyles?.height ? Number(flattenedWrapperStyles.height) : styles.sectionMenuItem.height,
        borderRadius: flattenedWrapperStyles?.borderRadius ? Number(flattenedWrapperStyles.borderRadius) : styles.sectionMenuItem.borderRadius,
        highlightColor: theme.messageHighlightBG,
        highlightEndDelay: CONST.ANIMATED_HIGHLIGHT_WORKSPACE_FEATURE_ITEM_END_DELAY,
        highlightEndDuration: CONST.ANIMATED_HIGHLIGHT_WORKSPACE_FEATURE_ITEM_END_DURATION,
    });

    return (
        <MenuItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restOfProps}
            outerWrapperStyle={animatedHighlightStyle}
            wrapperStyle={wrapperStyle}
        />
    );
}

export default HighlightableMenuItem;
