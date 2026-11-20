/** The column menu's pin items: pin the column to the left or right edge, or unpin it from the edge it's pinned to. */
import ColumnHeaderMenu from '@components/Table/ColumnHeaderMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import type {PinnedColumns, PinnedColumnSide} from '@libs/SearchPinnedColumnsUtils';
import {getPinnedSide} from '@libs/SearchPinnedColumnsUtils';

import CONST from '@src/CONST';

import React from 'react';

import type {SearchColumnType} from './types';

import {useSortableColumn} from './SortableColumnContext';

type SearchColumnPinItemsProps = {
    /** The query's pins, each edge in the order its columns were pinned. */
    pinnedColumns: PinnedColumns;

    /** Pins a column to an edge, or unpins it when no edge is given. */
    pinColumn: (column: SearchColumnType, side: PinnedColumnSide | undefined) => void;
};

/** A `SortableColumnMenu` child. A column pinned to an edge offers Unpin in place of pinning it there again. */
function SearchColumnPinItems({pinnedColumns, pinColumn}: SearchColumnPinItemsProps) {
    const {columnName} = useSortableColumn();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Pin']);

    const pinnedSide = getPinnedSide(pinnedColumns, columnName);
    const isPinnedLeft = pinnedSide === CONST.SEARCH.PINNED_COLUMN_SIDE.LEFT;
    const isPinnedRight = pinnedSide === CONST.SEARCH.PINNED_COLUMN_SIDE.RIGHT;

    return (
        <>
            <ColumnHeaderMenu.Item
                text={translate(isPinnedLeft ? 'search.columnMenu.unpin' : 'search.columnMenu.pinLeft')}
                icon={icons.Pin}
                onSelect={() => pinColumn(columnName, isPinnedLeft ? undefined : CONST.SEARCH.PINNED_COLUMN_SIDE.LEFT)}
                sentryLabel={isPinnedLeft ? CONST.SENTRY_LABEL.SEARCH.COLUMN_MENU_PIN.UNPIN : CONST.SENTRY_LABEL.SEARCH.COLUMN_MENU_PIN.LEFT}
            />
            <ColumnHeaderMenu.Item
                text={translate(isPinnedRight ? 'search.columnMenu.unpin' : 'search.columnMenu.pinRight')}
                icon={icons.Pin}
                onSelect={() => pinColumn(columnName, isPinnedRight ? undefined : CONST.SEARCH.PINNED_COLUMN_SIDE.RIGHT)}
                sentryLabel={isPinnedRight ? CONST.SENTRY_LABEL.SEARCH.COLUMN_MENU_PIN.UNPIN : CONST.SENTRY_LABEL.SEARCH.COLUMN_MENU_PIN.RIGHT}
            />
            <ColumnHeaderMenu.Separator />
        </>
    );
}

export default SearchColumnPinItems;
