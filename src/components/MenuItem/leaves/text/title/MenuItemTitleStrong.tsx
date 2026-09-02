import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type MenuItemTitleProps from './types';

import BaseMenuItemTitle from './BaseMenuItemTitle';

/**
 * The bold title of a `MenuItem.Content` — for a title that carries the row on its own: a navigation
 * destination, a menu action, an entity name. Reach for `MenuItem.Title` when a description names the
 * field and the title is only the value it holds.
 */
function MenuItemTitleStrong(props: MenuItemTitleProps) {
    const styles = useThemeStyles();

    return (
        <BaseMenuItemTitle
            {...props}
            style={styles.textStrong}
        />
    );
}

export default MenuItemTitleStrong;
