import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type MenuItemDescriptionProps = {
    /** Text to render as the description */
    children: string | number;
};

/** The supporting text block of a `MenuItem.Content` */
function MenuItemDescription({children}: MenuItemDescriptionProps) {
    const styles = useThemeStyles();

    useMenuItemAccessibilityLabel('description', String(children));

    return (
        <Text
            style={[styles.textLabelSupporting, styles.textLineHeightNormal, styles.breakWord]}
            numberOfLines={2}
        >
            {children}
        </Text>
    );
}

export default MenuItemDescription;
