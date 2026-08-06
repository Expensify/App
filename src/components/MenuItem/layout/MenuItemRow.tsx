import useIsCompactPopover from '@components/MenuItem/hooks/useIsCompactPopover';
import {useMenuItemConfig} from '@components/MenuItem/MenuItemContext';

import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';

import React from 'react';
import {View} from 'react-native';

type MenuItemRowProps = PropsWithChildren;

/** The main horizontal line of a menu item */
function MenuItemRow({children}: MenuItemRowProps) {
    const styles = useThemeStyles();
    const {isDisabled} = useMenuItemConfig();
    const isCompactPopover = useIsCompactPopover();

    return <View style={[styles.menuItemRow, isDisabled && styles.cursorDisabled, isCompactPopover && styles.alignItemsCenter]}>{children}</View>;
}

export default MenuItemRow;
