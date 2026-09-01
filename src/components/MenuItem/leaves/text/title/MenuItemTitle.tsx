import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type MenuItemTitleProps from './types';

import BaseMenuItemTitle from './BaseMenuItemTitle';

/** The title block of a `MenuItem.Content`. Bold, single line */
function MenuItemTitle({children}: MenuItemTitleProps) {
    const styles = useThemeStyles();

    return <BaseMenuItemTitle style={styles.textStrong}>{children}</BaseMenuItemTitle>;
}

export default MenuItemTitle;
