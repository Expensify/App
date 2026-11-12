/**
 * The menu a table column's heading opens. The heading itself is the trigger, and each table composes the items its
 * columns support: sorting, plus its own items such as hiding or editing the columns.
 */
import * as PopoverMenu from '@components/PopoverMenu/v2';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import React from 'react';

import SortItems from './ColumnHeaderMenuSortItems';
import Trigger from './ColumnHeaderMenuTrigger';

const MENU_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

/** The popover holding the menu's items, opening below the heading. */
function Content({children}: {children: React.ReactNode}) {
    return <PopoverMenu.Content anchorAlignment={MENU_ANCHOR_ALIGNMENT}>{children}</PopoverMenu.Content>;
}

export {Root, Item, Separator} from '@components/PopoverMenu/v2';
export {Trigger, Content, SortItems};
export type {ColumnSorting} from './ColumnHeaderMenuSortItems';
