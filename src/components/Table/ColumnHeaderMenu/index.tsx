/**
 * The menu a table column's heading opens. The heading itself is the trigger, and each table composes the items its
 * columns support: sorting, plus its own items such as hiding or editing the columns.
 */
import * as PopoverMenu from '@components/PopoverMenu/v2';

import type {SearchColumnAlignment} from '@styles/utils';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import React from 'react';

import SortItems from './ColumnHeaderMenuSortItems';
import Trigger from './ColumnHeaderMenuTrigger';

const MENU_ANCHOR_ALIGNMENTS: Record<SearchColumnAlignment, AnchorAlignment> = {
    [CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.START]: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
    },
    [CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.CENTER]: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
    },
    [CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.END]: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
    },
};

type ContentProps = {
    /** Where the column's heading places its label. The menu lines up the same way, so it stays next to the label in a wide column. */
    alignment: SearchColumnAlignment;

    children: React.ReactNode;
};

/** The popover holding the menu's items, opening below the heading. */
function Content({alignment, children}: ContentProps) {
    return <PopoverMenu.Content anchorAlignment={MENU_ANCHOR_ALIGNMENTS[alignment]}>{children}</PopoverMenu.Content>;
}

const ColumnHeaderMenu = {
    Root: PopoverMenu.Root,

    /** The column's heading, which opens the menu. */
    Trigger,

    Content,

    /** Sorts the table by the column, ascending or descending. */
    SortItems,

    Item: PopoverMenu.Item,

    Separator: PopoverMenu.Separator,
};

export default ColumnHeaderMenu;
export type {ColumnSorting} from './ColumnHeaderMenuSortItems';
