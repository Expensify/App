import type {TupleToUnion} from 'type-fest';
import type {SortOrder} from '@components/Search/types';
import type {SortableColumnName} from '@components/SelectionList/types';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

const validSortableColumns = [
    CONST.SEARCH.TABLE_COLUMNS.DATE,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TAG,
    CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
];

type ValidSortableColumns = TupleToUnion<typeof validSortableColumns>;
type SortingProperties = {
    sortBy: ValidSortableColumns;
    sortOrder: SortOrder;
};

const isMoneyRequestReportSortableColumn = (value: SortableColumnName): value is ValidSortableColumns => {
    return validSortableColumns.find((val) => val === value) !== undefined;
};

function compareFactory({sortBy, sortOrder}: {sortBy: ValidSortableColumns; sortOrder: SortOrder}) {
    return (valueA: OnyxTypes.Transaction, valueB: OnyxTypes.Transaction) => {
        const key = sortBy === CONST.SEARCH.TABLE_COLUMNS.DATE ? 'created' : sortBy;
        const isAsc = sortOrder === CONST.SEARCH.SORT_ORDER.ASC;

        let a = valueA[key];
        let b = valueB[key];

        if (typeof a === 'string' && typeof b === 'string') {
            return isAsc ? a.localeCompare(b) : b.localeCompare(a);
        }

        if (typeof a === 'number' && typeof b === 'number') {
            if (sortBy === 'amount') {
                a = Math.abs(a);
                b = Math.abs(b);
            }
            return isAsc ? a - b : b - a;
        }

        return 0;
    };
}

export {isMoneyRequestReportSortableColumn, compareFactory};
export type {SortingProperties};
