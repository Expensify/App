/** Which Search table columns users can pick and which they can't remove. Reads only CONST, so the query utils can use it without importing the UI utils. */
import type {SearchCustomColumnIds, SearchGroupBy} from '@components/Search/types';

import CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

const groupByRequiredColumns: Partial<Record<SearchGroupBy, SearchCustomColumnIds[]>> = {
    [CONST.SEARCH.GROUP_BY.FROM]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM],
    [CONST.SEARCH.GROUP_BY.CARD]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD],
    [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID],
    [CONST.SEARCH.GROUP_BY.CATEGORY]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY],
    [CONST.SEARCH.GROUP_BY.MERCHANT]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT],
    [CONST.SEARCH.GROUP_BY.TAG]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_TAG],
    [CONST.SEARCH.GROUP_BY.DAY]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_DAY],
    [CONST.SEARCH.GROUP_BY.MONTH]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH],
    [CONST.SEARCH.GROUP_BY.WEEK]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_WEEK],
    [CONST.SEARCH.GROUP_BY.YEAR]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_YEAR],
    [CONST.SEARCH.GROUP_BY.QUARTER]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_QUARTER],
    [CONST.SEARCH.GROUP_BY.APPROVER]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_APPROVER],
};

/** The columns users can pick for a table of this data type, or of this grouping. */
function getCustomColumns(value?: SearchDataTypes | SearchGroupBy): SearchCustomColumnIds[] {
    switch (value) {
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
            return Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE);
        case CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT:
            return Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE_REPORT);
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            return Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.INVOICE);
        case CONST.SEARCH.DATA_TYPES.TASK:
            return Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.TASK);
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.TRIP);
        case CONST.SEARCH.DATA_TYPES.CHAT:
            return Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.CHAT);
        case CONST.SEARCH.GROUP_BY.CARD:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.CARD);
        case CONST.SEARCH.GROUP_BY.FROM:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.FROM);
        case CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.WITHDRAWAL_ID);
        case CONST.SEARCH.GROUP_BY.CATEGORY:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.CATEGORY);
        case CONST.SEARCH.GROUP_BY.MERCHANT:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.MERCHANT);
        case CONST.SEARCH.GROUP_BY.TAG:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.TAG);
        case CONST.SEARCH.GROUP_BY.DAY:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.DAY);
        case CONST.SEARCH.GROUP_BY.MONTH:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.MONTH);
        case CONST.SEARCH.GROUP_BY.WEEK:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.WEEK);
        case CONST.SEARCH.GROUP_BY.YEAR:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.YEAR);
        case CONST.SEARCH.GROUP_BY.QUARTER:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.QUARTER);
        case CONST.SEARCH.GROUP_BY.APPROVER:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.APPROVER);
        default:
            return [];
    }
}

/**
 * Columns users can't remove. At least one column has to flex for the table to lay out, and the totals make sense in
 * every expense table, so they always stay. A search filtering by violations also keeps the column showing them.
 */
function getRequiredSearchColumns(shouldRequireViolationsColumn: boolean): Set<SearchCustomColumnIds> {
    const requiredColumns = new Set<SearchCustomColumnIds>([CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.TOTAL, ...Object.values(groupByRequiredColumns).flat()]);

    if (shouldRequireViolationsColumn) {
        requiredColumns.add(CONST.SEARCH.TABLE_COLUMNS.VIOLATIONS);
    }

    return requiredColumns;
}

export {groupByRequiredColumns, getCustomColumns, getRequiredSearchColumns};
