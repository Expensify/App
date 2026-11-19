import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import BaseMenuItemSpinner from './base/BaseMenuItemSpinner';

/** A spinner occupying the same slot as MenuItem.IconNarrow. */
function MenuItemSpinnerNarrow() {
    const styles = useThemeStyles();

    return <BaseMenuItemSpinner style={[styles.popoverMenuIcon, styles.wAuto]} />;
}

export default MenuItemSpinnerNarrow;
