import useIsCompactPopover from '@components/MenuItem/hooks/useIsCompactPopover';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type MenuItemContentProps = PropsWithChildren<{
    /** Overrides for the cell, e.g. a tighter gap between its lines */
    style?: StyleProp<ViewStyle>;
}>;

/**
 * The flexible middle cell of a `MenuItem.Row`. Stacks its children vertically and takes up all
 * the horizontal space left over by the leading and trailing cells.
 */
function MenuItemContent({children, style}: MenuItemContentProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const isCompactPopover = useIsCompactPopover();

    return <View style={[styles.menuItemContent, StyleUtils.getMenuItemTextContainerStyle(isCompactPopover), style]}>{children}</View>;
}

export default MenuItemContent;
