import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import BaseMenuItemSpinner from './base/BaseMenuItemSpinner';

/** A spinner occupying the same slot as MenuItem.Icon. */
function MenuItemSpinner() {
    const styles = useThemeStyles();

    return <BaseMenuItemSpinner style={styles.popoverMenuIcon} />;
}

export default MenuItemSpinner;
