import {useMenuItemState} from '@components/MenuItem/MenuItemContext';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type MenuItemRowProps = {
    /** The main-line cells: `MenuItem.Icon`/`MenuItem.Avatar`, `MenuItem.Content`, `MenuItem.Trailing` */
    children: ReactNode;

    /** Any additional styles to apply to the row */
    style?: StyleProp<ViewStyle>;
};

/**
 * The main horizontal line of a menu item. A plain flex row — it never inspects its children;
 * the consumer decides which cells to include and in what order.
 */
function MenuItemRow({children, style}: MenuItemRowProps) {
    const styles = useThemeStyles();
    const {isDisabled, isCompact} = useMenuItemState();

    return <View style={[styles.flexRow, styles.pointerEventsAuto, styles.gap3, isDisabled && styles.cursorDisabled, isCompact && styles.alignItemsCenter, style]}>{children}</View>;
}

MenuItemRow.displayName = 'MenuItemRow';

export type {MenuItemRowProps};
export default MenuItemRow;
