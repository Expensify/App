import useIsCompactPopover from '@components/MenuItem/hooks/useIsCompactPopover';
import {useMenuItemConfig} from '@components/MenuItem/MenuItemContext';

import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type MenuItemRowProps = PropsWithChildren<{
    /** Overrides the row layout when a caller needs different spacing between its cells */
    style?: StyleProp<ViewStyle>;
}>;

/** The main horizontal line of a menu item */
function MenuItemRow({children, style}: MenuItemRowProps) {
    const styles = useThemeStyles();
    const {isDisabled} = useMenuItemConfig();
    const isCompactPopover = useIsCompactPopover();

    return <View style={[styles.menuItemRow, style, isDisabled && styles.cursorDisabled, isCompactPopover && styles.alignItemsCenter]}>{children}</View>;
}

export default MenuItemRow;
