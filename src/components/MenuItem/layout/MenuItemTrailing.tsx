import {useMenuItemState} from '@components/MenuItem/MenuItemContext';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type MenuItemTrailingProps = {
    /** The right-aligned cells (`MenuItem.Badge`, `MenuItem.RightLabel`, `MenuItem.BrickRoadIndicator`,
     * `MenuItem.Chevron`, `MenuItem.CopyButton`, or any custom content), laid out horizontally */
    children: ReactNode;

    /** Any additional styles to apply to the trailing container */
    style?: StyleProp<ViewStyle>;
};

/**
 * The right-side cell of a `MenuItem.Row`. A horizontal cluster for indicators and actions —
 * the consumer decides which to include and in what order.
 */
function MenuItemTrailing({children, style}: MenuItemTrailingProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isCompact} = useMenuItemState();

    return <View style={[styles.flexRow, styles.mlAuto, styles.alignItemsCenter, styles.gap2, StyleUtils.getMenuItemTextContainerStyle(isCompact), style]}>{children}</View>;
}

MenuItemTrailing.displayName = 'MenuItemTrailing';

export type {MenuItemTrailingProps};
export default MenuItemTrailing;
