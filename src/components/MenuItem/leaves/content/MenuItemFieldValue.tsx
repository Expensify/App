import React from 'react';

import type {MenuItemPrimaryTextProps} from './base/types';

import BaseMenuItemPrimaryText from './base/BaseMenuItemPrimaryText';

/**
 * The value a form field holds — the bottom line of a `MenuItem.Content`, under its
 * `MenuItem.FieldName`. Regular weight on purpose: the field name already carries the row, so bold
 * here would make the two lines compete.
 */
function MenuItemFieldValue(props: MenuItemPrimaryTextProps) {
    return (
        <BaseMenuItemPrimaryText
            {...props}
            slot="bottom"
        />
    );
}

export default MenuItemFieldValue;
