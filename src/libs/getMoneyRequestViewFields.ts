import type {SearchColumnType} from '@components/Search/types';

import CONST from '@src/CONST';

import {isReportDetailsCustomColumn} from './SearchUIUtils';

// Table preferences must not hide the expense's existing editors.
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

const EXCLUDED_FIELDS = new Set<SearchColumnType>([
    CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
    CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT,
    CONST.SEARCH.TABLE_COLUMNS.TOTAL,
    CONST.SEARCH.TABLE_COLUMNS.HELD,
]);

/**
 * Maps report columns to expense editors. The receipt has its own panel, and Amount, Attendees and Date
 * already display their supporting table values. The header displays the held state.
 */
function mapReportColumnsToFields(tableColumns: SearchColumnType[]): SearchColumnType[] {
    const fields = tableColumns.flatMap((column) => {
        if (column === CONST.SEARCH.TABLE_COLUMNS.POSTED) {
            return tableColumns.includes(CONST.SEARCH.TABLE_COLUMNS.DATE) ? [] : [CONST.SEARCH.TABLE_COLUMNS.DATE];
        }
        if (column === CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE) {
            return tableColumns.includes(CONST.SEARCH.TABLE_COLUMNS.ATTENDEES) ? [] : [CONST.SEARCH.TABLE_COLUMNS.ATTENDEES];
        }
        return isReportDetailsCustomColumn(column) && !EXCLUDED_FIELDS.has(column) ? [column] : [];
    });

    // Amount is required even if an older or malformed preference omits it.
    return fields.includes(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT) ? [...new Set(fields)] : [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, ...new Set(fields)];
}

/** Resolve the same selection for the expense view and its field picker. */
function getMoneyRequestViewFields(tableColumns: SearchColumnType[] = [], savedFields?: string | null): SearchColumnType[] {
    const defaultFields = [...new Set([...DEFAULT_FIELDS, ...mapReportColumnsToFields(tableColumns)])];
    if (!savedFields) {
        return defaultFields;
    }

    try {
        const parsedFields: unknown = JSON.parse(savedFields);
        if (!Array.isArray(parsedFields)) {
            return defaultFields;
        }
        const fields = parsedFields.filter((column): column is SearchColumnType => typeof column === 'string' && isReportDetailsCustomColumn(column));
        return fields.length ? mapReportColumnsToFields(fields) : defaultFields;
    } catch {
        // An invalid stored preference must not make the expense editor unavailable.
        return defaultFields;
    }
}

export default getMoneyRequestViewFields;
