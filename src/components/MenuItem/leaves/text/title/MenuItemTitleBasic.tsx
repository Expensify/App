import React from 'react';

import type MenuItemTitleProps from './types';

import BaseMenuItemTitle from './BaseMenuItemTitle';

/**
 * The title of a `MenuItem.Content` at regular weight, for rows that pair a label with the value
 * it holds — there the bold of `MenuItem.Title` would compete with the value for attention.
 */
function MenuItemTitleBasic({children}: MenuItemTitleProps) {
    return <BaseMenuItemTitle>{children}</BaseMenuItemTitle>;
}

export default MenuItemTitleBasic;
