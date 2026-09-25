import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {MenuItemHelpTextProps} from './types';

import BaseMenuItemHelpText from './BaseMenuItemHelpText';

/** The trailing help line of a `MenuItem.Root`, rendered under `MenuItem.Row` and inside the row's press target */
function MenuItemHelpText({message, isError = false}: MenuItemHelpTextProps) {
    const styles = useThemeStyles();

    return (
        <BaseMenuItemHelpText
            isError={isError}
            message={message}
            style={styles.menuItemError}
        />
    );
}

export default MenuItemHelpText;
