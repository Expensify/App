import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';

import React from 'react';

type MenuItemDescriptionProps = PropsWithChildren;

/** The supporting text block of a `MenuItem.Content` */
function MenuItemDescription({children}: MenuItemDescriptionProps) {
    const styles = useThemeStyles();

    useMenuItemAccessibilityLabel(typeof children === 'string' || typeof children === 'number' ? String(children) : undefined);

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
