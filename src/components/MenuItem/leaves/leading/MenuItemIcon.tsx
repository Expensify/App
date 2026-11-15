import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {MenuItemIconProps} from './base/BaseMenuItemIcon';

import BaseMenuItemIcon from './base/BaseMenuItemIcon';

/** An icon glyph, filled from the row's interaction state */
function MenuItemIcon({src, isLoading}: MenuItemIconProps) {
    const styles = useThemeStyles();

    return (
        <BaseMenuItemIcon
            src={src}
            isLoading={isLoading}
            style={styles.popoverMenuIcon}
        />
    );
}

export default MenuItemIcon;
