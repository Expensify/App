import {useMenuItemState} from '@components/MenuItem/MenuItemContext';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type MenuItemContentProps = {
    /** The text blocks of the row (`MenuItem.Title`, `MenuItem.Description`, or any custom content),
     * stacked vertically in the order they are declared */
    children: ReactNode;

    /** Any additional styles to apply to the content container */
    style?: StyleProp<ViewStyle>;
};

/**
 * The flexible middle cell of a `MenuItem.Row`. Stacks its children vertically and takes up all
 * the horizontal space left over by the leading and trailing cells.
 */
function MenuItemContent({children, style}: MenuItemContentProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isCompact} = useMenuItemState();

    return <View style={[styles.justifyContentCenter, styles.flex1, styles.gap1, StyleUtils.getMenuItemTextContainerStyle(isCompact), style]}>{children}</View>;
}

MenuItemContent.displayName = 'MenuItemContent';

export type {MenuItemContentProps};
export default MenuItemContent;
