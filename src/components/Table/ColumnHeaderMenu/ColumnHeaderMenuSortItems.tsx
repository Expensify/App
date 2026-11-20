/** The column menu's sort items: ascending and descending, with a checkmark on the order the table is sorted by. */
import * as PopoverMenu from '@components/PopoverMenu/v2';
import type {SortOrder} from '@components/Table/middlewares/sorting';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';

import getButtonState from '@libs/getButtonState';

import CONST from '@src/CONST';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';

/** A sortable column's sort state, and how its menu sorts the table by it. */
type ColumnSorting = {
    /** `undefined` when the table is sorted by another column, or not sorted. */
    activeSortOrder: SortOrder | undefined;

    onSort: (sortOrder: SortOrder) => void;
};

type ColumnHeaderMenuSortItemsProps = {
    sorting: ColumnSorting;

    sentryLabels: {
        ascending: SentryLabel;
        descending: SentryLabel;
    };
};

function ColumnHeaderMenuSortItems({sorting, sentryLabels}: ColumnHeaderMenuSortItemsProps) {
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong', 'Checkmark']);

    // `success` colors the checkmark of the active order, and would color the arrow beside it too. The arrow keeps its usual colors.
    const getSortIconFill = (isHovered: boolean) => StyleUtils.getIconFillColor({buttonState: getButtonState({isActive: isHovered}), isMenuIcon: true, isPane: true});

    const isAscendingActive = sorting.activeSortOrder === CONST.SEARCH.SORT_ORDER.ASC;
    const isDescendingActive = sorting.activeSortOrder === CONST.SEARCH.SORT_ORDER.DESC;

    return (
        <>
            <PopoverMenu.Item
                text={translate('search.columnMenu.sortAscending')}
                icon={icons.ArrowUpLong}
                rightIcon={isAscendingActive ? icons.Checkmark : undefined}
                success={isAscendingActive}
                iconFill={getSortIconFill}
                // The checkmark only shows the active order visually.
                accessibilityState={{selected: isAscendingActive}}
                onSelect={() => sorting.onSort(CONST.SEARCH.SORT_ORDER.ASC)}
                sentryLabel={sentryLabels.ascending}
            />
            <PopoverMenu.Item
                text={translate('search.columnMenu.sortDescending')}
                icon={icons.ArrowDownLong}
                rightIcon={isDescendingActive ? icons.Checkmark : undefined}
                success={isDescendingActive}
                iconFill={getSortIconFill}
                accessibilityState={{selected: isDescendingActive}}
                onSelect={() => sorting.onSort(CONST.SEARCH.SORT_ORDER.DESC)}
                sentryLabel={sentryLabels.descending}
            />
        </>
    );
}

export default ColumnHeaderMenuSortItems;
export type {ColumnSorting};
