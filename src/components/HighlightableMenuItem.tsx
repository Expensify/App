import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import type {View} from 'react-native';
import {StyleSheet} from 'react-native';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useThemeStyles from '@hooks/useThemeStyles';
import MenuItem from './MenuItem';
import type {MenuItemProps} from './MenuItem';

type Props = MenuItemProps & {
    /** Should the menu item be highlighted? */
    highlighted?: boolean;
};

function HighlightableMenuItem({wrapperStyle, highlighted, ...restOfProps}: Props, ref: ForwardedRef<View>) {
    const styles = useThemeStyles();

    const flattenedWrapperStyles = StyleSheet.flatten(wrapperStyle);
    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight: highlighted ?? false,
        height: flattenedWrapperStyles?.height ? Number(flattenedWrapperStyles.height) : styles.sectionMenuItem.height,
        borderRadius: flattenedWrapperStyles?.borderRadius ? Number(flattenedWrapperStyles.borderRadius) : styles.sectionMenuItem.borderRadius,
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

HighlightableMenuItem.displayName = 'HighlightableMenuItem';

export default forwardRef(HighlightableMenuItem);
