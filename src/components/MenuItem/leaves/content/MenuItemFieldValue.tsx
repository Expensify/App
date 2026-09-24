import React from 'react';

import type {MenuItemPrimaryTextProps} from './base/types';

import BaseMenuItemPrimaryText from './base/BaseMenuItemPrimaryText';

/** Value a field holds */
function MenuItemFieldValue(props: MenuItemPrimaryTextProps) {
    return (
        <BaseMenuItemPrimaryText
            {...props}
            slot="bottom"
        />
    );
}

export default MenuItemFieldValue;
