import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {MenuItemSupportingTextProps} from './base/types';

import BaseMenuItemSupportingText from './base/BaseMenuItemSupportingText';

/**
 * Text naming what the row holds, the top line of a `MenuItem.Content`.
 *
 * Use this when the label and the value should read as one lockup — it lives inside `Root`, so it
 * shares the row's press target and hover background. Reach for the `MenuItemWithLabel` preset
 * instead when the label should stay outside both.
 */
function MenuItemLabel(props: MenuItemSupportingTextProps) {
    const styles = useThemeStyles();

    return (
        <BaseMenuItemSupportingText
            {...props}
            slot="top"
            style={[styles.optionAlternateText, styles.pre]}
        />
    );
}

export default MenuItemLabel;
