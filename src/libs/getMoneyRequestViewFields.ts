import type {SearchColumnType} from '@components/Search/types';

import CONST from '@src/CONST';

import {isReportDetailsCustomColumn} from './SearchUIUtils';

// Preserve the expense editor's established order until the user customizes the shared report columns.
const DEFAULT_FIELDS: SearchColumnType[] = [
    CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
    CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.DATE,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.VENDOR,
    CONST.SEARCH.TABLE_COLUMNS.TAG,
    CONST.SEARCH.TABLE_COLUMNS.CARD,
    CONST.SEARCH.TABLE_COLUMNS.TAX_RATE,
    CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT,
    CONST.SEARCH.TABLE_COLUMNS.ATTENDEES,
    CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE,
    CONST.SEARCH.TABLE_COLUMNS.BILLABLE,
];

/**
 * Receipts keep their own panel.
 * Table controls do not become expense fields.
 */
function getMoneyRequestViewFields(tableColumns: SearchColumnType[] = [], hasCustomColumns = false): SearchColumnType[] {
    const fields = tableColumns.filter((column) => isReportDetailsCustomColumn(column) && column !== CONST.SEARCH.TABLE_COLUMNS.RECEIPT);
    if (!hasCustomColumns) {
        return [...new Set([...DEFAULT_FIELDS, ...fields])];
    }

    // Amount is required even if an older or malformed preference omits it.
    return fields.includes(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT) ? [...new Set(fields)] : [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, ...new Set(fields)];
}

export default getMoneyRequestViewFields;
