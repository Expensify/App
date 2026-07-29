import {useMenuItemState} from '@components/MenuItem/MenuItemContext';

import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';

import React from 'react';
import {View} from 'react-native';

type MenuItemRowProps = PropsWithChildren;

/** The main horizontal line of a menu item */
function MenuItemRow({children}: MenuItemRowProps) {
    const styles = useThemeStyles();
    const {isDisabled, isCompact} = useMenuItemState();

    return <View style={[styles.flexRow, styles.pointerEventsAuto, styles.gap3, isDisabled && styles.cursorDisabled, isCompact && styles.alignItemsCenter]}>{children}</View>;
}

export default MenuItemRow;
