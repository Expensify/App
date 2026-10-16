import {useMenuItemConfig} from '@components/MenuItem/MenuItemContext';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

import type {MenuItemHelpTextProps} from './types';

import BaseMenuItemHelpText from './BaseMenuItemHelpText';

/** The help line of a `MenuItem.Root`, rendered under `MenuItem.Row` and inside the row's press target */
function MenuItemHelpText({message, isError = false}: MenuItemHelpTextProps) {
    const styles = useThemeStyles();
    const {shouldAllowTextSelection} = useMenuItemConfig();

    return (
        <BaseMenuItemHelpText
            isError={isError}
            message={message}
            style={styles.menuItemError}
            messageStyle={shouldAllowTextSelection ? styles.userSelectNone : undefined}
            dataSet={shouldAllowTextSelection ? {[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true} : undefined}
        />
    );
}

export default MenuItemHelpText;
