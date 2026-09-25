import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {MenuItemIconProps} from './base/BaseMenuItemIcon';

import BaseMenuItemIcon from './base/BaseMenuItemIcon';

/** An icon glyph that takes only its own width */
function MenuItemIconNarrow({src}: MenuItemIconProps) {
    const styles = useThemeStyles();

    return (
        <BaseMenuItemIcon
            src={src}
            style={[styles.popoverMenuIcon, styles.wAuto]}
        />
    );
}

export default MenuItemIconNarrow;
