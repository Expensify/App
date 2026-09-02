import React from 'react';

import type MenuItemTitleProps from './types';

import BaseMenuItemTitle from './BaseMenuItemTitle';

/**
 * The title block of a `MenuItem.Content`, at regular weight. Reach for `MenuItem.TitleStrong` when
 * the title carries the row on its own — here the description names the field and the title is the
 * value it holds, so bold would make the two compete for attention.
 */
function MenuItemTitle(props: MenuItemTitleProps) {
    return <BaseMenuItemTitle {...props} />;
}

export default MenuItemTitle;
