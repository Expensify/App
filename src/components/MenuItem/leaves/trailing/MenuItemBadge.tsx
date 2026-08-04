import Badge from '@components/Badge';
import type {BadgeProps} from '@components/Badge';
import {useMenuItemState} from '@components/MenuItem/MenuItemContext';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

/**
 * A `Badge` that follows the menu item's focused state. Placement is up to the consumer:
 * inside `MenuItem.Trailing` (right), inside `MenuItem.Content` (below the title), or as a
 * direct child of the Root (its own row).
 */
function MenuItemBadge({badgeStyles, pressable, ...rest}: BadgeProps) {
    const styles = useThemeStyles();
    const {isActive} = useMenuItemState();

    return (
        <Badge
            {...rest}
            badgeStyles={[badgeStyles, isActive && !rest.success && styles.badgeDefaultActive]}
            pressable={pressable ?? !!rest.onPress}
        />
    );
}

export default MenuItemBadge;
