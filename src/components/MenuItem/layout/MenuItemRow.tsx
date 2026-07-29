import {useIsCompactMenu} from '@components/CompactMenuContext';
import {useMenuItemState} from '@components/MenuItem/MenuItemContext';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';

import React from 'react';
import {View} from 'react-native';

type MenuItemRowProps = PropsWithChildren;

/** The main horizontal line of a menu item */
function MenuItemRow({children}: MenuItemRowProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isDisabled} = useMenuItemState();
    const isCompactMenu = useIsCompactMenu();
    const isCompact = isCompactMenu && !shouldUseNarrowLayout;

    return <View style={[styles.flexRow, styles.pointerEventsAuto, styles.gap3, isDisabled && styles.cursorDisabled, isCompact && styles.alignItemsCenter]}>{children}</View>;
}

export default MenuItemRow;
