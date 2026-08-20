import {getExpenseHeaders} from '@components/Search/SearchTableHeader';

import {FILTER_VIEW_MAP, getFilterViewLabelKey, getSearchColumnTranslationKey, getTableMinWidth} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

/**
 * Issue #98148: the "Created" / "Created date" rename is scoped to `type:expense-report` only.
 * Every other Search type (and the opened single-report table, which reuses getExpenseHeaders)
 * keeps "Date". These tests lock that scoping in on the column label, the filter label and the
 * column width so a future edit can't silently widen it back to every type.
 */
describe('Created date scoped labels (#98148)', () => {
    const DATE = CONST.SEARCH.TABLE_COLUMNS.DATE;
    const {EXPENSE, EXPENSE_REPORT, TASK, TRIP, INVOICE} = CONST.SEARCH.DATA_TYPES;

    describe('getSearchColumnTranslationKey (column header, Sort by, Edit columns, saved search, CSV current view)', () => {
        it('returns "Created" for the DATE column only in expense-report search', () => {
            expect(getSearchColumnTranslationKey(DATE, EXPENSE_REPORT)).toBe('search.filters.created');
        });

        it('keeps "Date" for the DATE column in every other type', () => {
            expect(getSearchColumnTranslationKey(DATE, EXPENSE)).toBe('common.date');
            expect(getSearchColumnTranslationKey(DATE, TASK)).toBe('common.date');
            expect(getSearchColumnTranslationKey(DATE, TRIP)).toBe('common.date');
            expect(getSearchColumnTranslationKey(DATE, INVOICE)).toBe('common.date');
        });

        it('defaults to "Date" when no type is passed (e.g. the opened single-report table)', () => {
            expect(getSearchColumnTranslationKey(DATE)).toBe('common.date');
        });
    });

    describe('getFilterViewLabelKey (filter menu row, applied chip, filter subpage title)', () => {
        it('returns "Created date" for the DATE filter only in expense-report search', () => {
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, EXPENSE_REPORT)).toBe('search.filters.createdDate');
        });

        it('keeps "Date" for the DATE filter in other types and with no type', () => {
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, EXPENSE)).toBe('common.date');
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE)).toBe('common.date');
        });

        it('does not touch non-date filters, even in expense-report search', () => {
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED, EXPENSE_REPORT)).toBe(FILTER_VIEW_MAP[CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED].labelKey);
        });
    });

    describe('column builders', () => {
        it('keeps the expense DATE header on "Date" (also drives the opened single-report table)', () => {
            const dateColumn = getExpenseHeaders().find((column) => column.columnName === DATE);
            expect(dateColumn?.translationKey).toBe('common.date');
        });
    });

    describe('getTableMinWidth (horizontal-scroll budget)', () => {
        it('gives the DATE column the wider "Created" budget only in expense-report search', () => {
            const reportWidth = getTableMinWidth([DATE], EXPENSE_REPORT);
            const expenseWidth = getTableMinWidth([DATE], EXPENSE);
            expect(reportWidth).toBeGreaterThan(expenseWidth);
        });
    });
});
