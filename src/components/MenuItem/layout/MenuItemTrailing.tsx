import useIsCompactPopover from '@components/MenuItem/hooks/useIsCompactPopover';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';

import React from 'react';
import {View} from 'react-native';

type MenuItemTrailingProps = PropsWithChildren;

/** The right-side cell of a `MenuItem.Row` */
function MenuItemTrailing({children}: MenuItemTrailingProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const isCompactPopover = useIsCompactPopover();

    return <View style={[styles.menuItemTrailing, StyleUtils.getMenuItemTextContainerStyle(isCompactPopover)]}>{children}</View>;
}

export default MenuItemTrailing;
