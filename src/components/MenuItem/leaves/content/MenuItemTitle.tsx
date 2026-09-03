import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {MenuItemPrimaryTextProps} from './base/types';

import BaseMenuItemPrimaryText from './base/BaseMenuItemPrimaryText';

/**
 * The name of the row itself — a navigation destination, a menu action, an entity. Bold, and the top
 * line of a `MenuItem.Content`. Pair it with `MenuItem.Description` for supporting text underneath.
 *
 * Reach for `MenuItem.FieldName` / `MenuItem.FieldValue` instead when the row is a form field, where
 * the top line names the field and the bottom line holds its value.
 */
function MenuItemTitle(props: MenuItemPrimaryTextProps) {
    const styles = useThemeStyles();

    return (
        <BaseMenuItemPrimaryText
            {...props}
            slot="top"
            style={styles.textStrong}
        />
    );
}

export default MenuItemTitle;
