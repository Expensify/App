import React from 'react';

import type MenuItemTitleProps from './types';

import BaseMenuItemTitle from './BaseMenuItemTitle';

/**
 * The title of a `MenuItem.Content` at regular weight, for rows that pair a description naming a
 * field with the value it holds — there the bold of `MenuItem.Title` would compete with the
 * description for attention.
 */
function MenuItemTitleBasic(props: MenuItemTitleProps) {
    return <BaseMenuItemTitle {...props} />;
}

export default MenuItemTitleBasic;
