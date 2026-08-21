import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type MenuItemLabelProps = {
    /** Text to render as the label */
    children: string;
};

/** The label above a menu item's `Row` */
function MenuItemLabel({children}: MenuItemLabelProps) {
    const styles = useThemeStyles();

    return <Text style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre]}>{children}</Text>;
}

export default MenuItemLabel;
