import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import type {View} from 'react-native';
import {StyleSheet} from 'react-native';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import MenuItem from './MenuItem';
import type {MenuItemProps} from './MenuItem';

type Props = MenuItemProps & {
    /** Should the menu item be highlighted? */
    highlighted?: boolean;
};

function HighlightableIOUMenuItem({wrapperStyle, highlighted, ...restOfProps}: Props, ref: ForwardedRef<View>) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const flattenedWrapperStyles = StyleSheet.flatten(wrapperStyle);
    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight: highlighted ?? false,
        borderRadius: flattenedWrapperStyles?.borderRadius ? Number(flattenedWrapperStyles.borderRadius) : styles.sectionMenuItem.borderRadius,
        highlightColor: theme.messageHighlightBG,
        itemEnterDelay: 0,
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

HighlightableIOUMenuItem.displayName = 'HighlightableIOUMenuItem';

export default forwardRef(HighlightableIOUMenuItem);
