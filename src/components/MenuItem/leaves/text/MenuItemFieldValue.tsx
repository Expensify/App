import React from 'react';

import type {MenuItemTitleTextProps} from './types';

import BaseMenuItemTitleText from './BaseMenuItemTitleText';

/**
 * The value a form field holds — the bottom line of a `MenuItem.Content`, under its
 * `MenuItem.FieldName`. Regular weight on purpose: the field name already carries the row, so bold
 * here would make the two lines compete.
 */
function MenuItemFieldValue(props: MenuItemTitleTextProps) {
    return (
        <BaseMenuItemTitleText
            {...props}
            slot="bottom"
        />
    );
}

export default MenuItemFieldValue;
