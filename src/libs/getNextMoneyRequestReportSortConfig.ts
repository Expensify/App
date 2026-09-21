import type {SortOrder} from '@components/Search/types';
import type {SortableColumnName} from '@libs/ReportUtils';

import CONST from '@src/CONST';

type MoneyRequestReportSortConfig = {
    sortBy: SortableColumnName;
    sortOrder: SortOrder;
};

/**
 * Computes the next sort config for the money request report transaction table.
 * When switching back to the Date column from another column, restore Date/ASC
 * (the view default that gates RBR pre-sort). Active Date toggles and other
 * columns keep the order produced by SortableHeaderText.
 */
function getNextMoneyRequestReportSortConfig(
    prevState: MoneyRequestReportSortConfig,
    selectedSortBy: SortableColumnName,
    selectedSortOrder: SortOrder,
): MoneyRequestReportSortConfig {
    const shouldRestoreDefaultDateSort =
        selectedSortBy === CONST.SEARCH.TABLE_COLUMNS.DATE && prevState.sortBy !== CONST.SEARCH.TABLE_COLUMNS.DATE;

    return {
        ...prevState,
        sortBy: selectedSortBy,
        sortOrder: shouldRestoreDefaultDateSort ? CONST.SEARCH.SORT_ORDER.ASC : selectedSortOrder,
    };
}

export default getNextMoneyRequestReportSortConfig;
export type {MoneyRequestReportSortConfig};
