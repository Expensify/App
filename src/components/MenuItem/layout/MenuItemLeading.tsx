import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';

import React from 'react';
import {View} from 'react-native';

type MenuItemLeadingProps = PropsWithChildren;

/** The leading cell of a `MenuItem.Row`. Sets no width of its own — it centers and sizes to its content */
function MenuItemLeading({children}: MenuItemLeadingProps) {
    const styles = useThemeStyles();

    return <View style={styles.menuItemLeading}>{children}</View>;
}

export default MenuItemLeading;
