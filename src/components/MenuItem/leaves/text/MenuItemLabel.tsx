import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type MenuItemLabelProps = {
    /** Text naming what the row holds */
    children: string;
};

/**
 * The label block of a `MenuItem.Content`, sitting above the row's value.
 *
 * Use this when the label and the value should read as one lockup — it lives inside `Root`, so it
 * shares the row's press target and hover background. Reach for the `MenuItemWithLabel` preset
 * instead when the label should stay outside both.
 */
function MenuItemLabel({children}: MenuItemLabelProps) {
    const styles = useThemeStyles();

    return <Text style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre]}>{children}</Text>;
}

export default MenuItemLabel;
