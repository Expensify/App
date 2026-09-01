import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type MenuItemTitleProps from './types';

import BaseMenuItemTitle from './BaseMenuItemTitle';

/**
 * The title of a `MenuItem.Content` for a row whose value has not been set yet. Muted and regular
 * weight, so it reads as a prompt rather than as content the way `MenuItem.Title` does.
 */
function MenuItemTitlePlaceholder({children}: MenuItemTitleProps) {
    const styles = useThemeStyles();

    return <BaseMenuItemTitle style={styles.colorMuted}>{children}</BaseMenuItemTitle>;
}

export default MenuItemTitlePlaceholder;
