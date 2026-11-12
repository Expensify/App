/**
 * The menu a table column's heading opens. The heading itself is the trigger, and each table composes the items its
 * columns support: sorting, plus its own items such as hiding or editing the columns.
 */
import * as PopoverMenu from '@components/PopoverMenu/v2';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type {WithRequiredSentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';

import SortItems from './ColumnHeaderMenuSortItems';
import Trigger from './ColumnHeaderMenuTrigger';

const MENU_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type ContentProps = {
    children: React.ReactNode;
};

/** The popover holding the menu's items, opening below the heading. */
function Content({children}: ContentProps) {
    return <PopoverMenu.Content anchorAlignment={MENU_ANCHOR_ALIGNMENT}>{children}</PopoverMenu.Content>;
}

type ClearSortItemProps = WithRequiredSentryLabel & {
    onSelect: () => void;
};

/** Returns the table to its unsorted order. */
function ClearSortItem({onSelect, sentryLabel}: ClearSortItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Close']);

    return (
        <PopoverMenu.Item
            text={translate('search.columnMenu.clearSort')}
            icon={icons.Close}
            onSelect={onSelect}
            sentryLabel={sentryLabel}
        />
    );
}

export {Root, Item, Separator} from '@components/PopoverMenu/v2';
export {Trigger, Content, SortItems, ClearSortItem};
export type {ColumnSorting} from './ColumnHeaderMenuSortItems';
