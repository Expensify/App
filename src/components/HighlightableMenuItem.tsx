import type {ForwardedRef} from 'react';
import React from 'react';
import type {View} from 'react-native';
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

    /** Reference to the outer element */
    ref?: ForwardedRef<View>;
};

function HighlightableMenuItem({wrapperStyle, highlighted, ref, ...restOfProps}: Props) {
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
            ref={ref}
        />
    );
}

export default HighlightableMenuItem;
