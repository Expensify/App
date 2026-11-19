import useIsCompactPopover from '@components/MenuItem/hooks/useIsCompactPopover';
import {useMenuItemConfig} from '@components/MenuItem/MenuItemContext';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';

import React from 'react';
import {View} from 'react-native';

type MenuItemContentProps = PropsWithChildren;

/**
 * The flexible middle cell of a `MenuItem.Row`. Stacks its children vertically and takes up all
 * the horizontal space left over by the leading and trailing cells.
 */
function MenuItemContent({children}: MenuItemContentProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const isCompactPopover = useIsCompactPopover();
    const {isCompact} = useMenuItemConfig();

    return <View style={[styles.menuItemContent, StyleUtils.getMenuItemTextContainerStyle(isCompactPopover || isCompact)]}>{children}</View>;
}

export default MenuItemContent;
