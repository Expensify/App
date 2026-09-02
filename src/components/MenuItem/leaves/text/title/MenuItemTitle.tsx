import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type MenuItemTitleProps from './types';

import BaseMenuItemTitle from './BaseMenuItemTitle';

/**
 * The title block of a `MenuItem.Content`. Bold, single line — for a title that carries the row on
 * its own: a navigation destination, a menu action, an entity name.
 */
function MenuItemTitle(props: MenuItemTitleProps) {
    const styles = useThemeStyles();

    return (
        <BaseMenuItemTitle
            {...props}
            style={styles.textStrong}
        />
    );
}

export default MenuItemTitle;
