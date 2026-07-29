import {useMenuItemState} from '@components/MenuItem/MenuItemContext';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';

import React from 'react';
import {View} from 'react-native';

type MenuItemTrailingProps = PropsWithChildren;

/** The right-side cell of a `MenuItem.Row */
function MenuItemTrailing({children}: MenuItemTrailingProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isCompact} = useMenuItemState();

    return <View style={[styles.flexRow, styles.mlAuto, styles.alignItemsCenter, styles.gap2, StyleUtils.getMenuItemTextContainerStyle(isCompact)]}>{children}</View>;
}

export default MenuItemTrailing;
