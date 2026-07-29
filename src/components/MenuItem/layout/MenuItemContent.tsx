import {useIsCompactMenu} from '@components/CompactMenuContext';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type MenuItemContentProps = PropsWithChildren & {
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
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isCompactMenu = useIsCompactMenu();
    const isCompact = isCompactMenu && !shouldUseNarrowLayout;

    return <View style={[styles.justifyContentCenter, styles.flex1, styles.gap1, StyleUtils.getMenuItemTextContainerStyle(isCompact), style]}>{children}</View>;
}

export default MenuItemContent;
