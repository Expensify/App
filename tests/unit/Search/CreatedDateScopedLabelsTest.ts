import {getExpenseHeaders} from '@components/Search/SearchTableHeader';

import {FILTER_VIEW_MAP, getFilterViewLabelKey, getSearchColumnTranslationKey, getTableMinWidth, isCreatedDateType} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

/**
 * Issue #98148: the "Created" / "Created date" rename is scoped to report-style Search types only.
 * `type:expense-report` and `type:invoice` (invoice is treated like a report). Every other Search type
 * (expense, trip, chat, task) and the opened single-report table (which reuses getExpenseHeaders) keep
 * "Date". These tests lock that scoping in on the column label, the filter label and the column width so
 * a future edit can't silently widen it to every type or drop invoice back to "Date".
 */
describe('Created date scoped labels (#98148)', () => {
    const DATE = CONST.SEARCH.TABLE_COLUMNS.DATE;
    const {EXPENSE, EXPENSE_REPORT, TASK, TRIP, INVOICE} = CONST.SEARCH.DATA_TYPES;

    describe('isCreatedDateType (shared predicate)', () => {
        it('is true only for the report-style types', () => {
            expect(isCreatedDateType(EXPENSE_REPORT)).toBe(true);
            expect(isCreatedDateType(INVOICE)).toBe(true);
        });

        it('is false for expense, trip, task and no type', () => {
            expect(isCreatedDateType(EXPENSE)).toBe(false);
            expect(isCreatedDateType(TRIP)).toBe(false);
            expect(isCreatedDateType(TASK)).toBe(false);
            expect(isCreatedDateType()).toBe(false);
        });
    });

    describe('getSearchColumnTranslationKey (column header, Sort by, Edit columns, saved search, CSV current view)', () => {
        it('returns "Created" for the DATE column in expense-report and invoice search', () => {
            expect(getSearchColumnTranslationKey(DATE, EXPENSE_REPORT)).toBe('search.filters.created');
            expect(getSearchColumnTranslationKey(DATE, INVOICE)).toBe('search.filters.created');
        });

        it('keeps "Date" for the DATE column in expense, trip and task', () => {
            expect(getSearchColumnTranslationKey(DATE, EXPENSE)).toBe('common.date');
            expect(getSearchColumnTranslationKey(DATE, TRIP)).toBe('common.date');
            expect(getSearchColumnTranslationKey(DATE, TASK)).toBe('common.date');
        });

        it('defaults to "Date" when no type is passed (e.g. the opened single-report table)', () => {
            expect(getSearchColumnTranslationKey(DATE)).toBe('common.date');
        });
    });

    describe('getFilterViewLabelKey (filter menu row, applied chip, filter subpage title)', () => {
        it('returns "Created date" for the DATE filter in expense-report and invoice search', () => {
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, EXPENSE_REPORT)).toBe('search.filters.createdDate');
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, INVOICE)).toBe('search.filters.createdDate');
        });

        it('keeps "Date" for the DATE filter in expense, trip and with no type', () => {
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, EXPENSE)).toBe('common.date');
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, TRIP)).toBe('common.date');
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE)).toBe('common.date');
        });

        it('does not touch non-date filters, even in report-style search', () => {
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED, EXPENSE_REPORT)).toBe(FILTER_VIEW_MAP[CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED].labelKey);
        });
    });

    describe('column builders (getExpenseHeaders is shared by expense, invoice, trip and the opened report)', () => {
        it('keeps the DATE header on "Date" by default (expense/trip and the opened single-report table)', () => {
            const dateColumn = getExpenseHeaders().find((column) => column.columnName === DATE);
            expect(dateColumn?.translationKey).toBe('common.date');
        });

        it('labels the DATE header "Created" when built for the report-style (invoice) variant', () => {
            const dateColumn = getExpenseHeaders(undefined, true).find((column) => column.columnName === DATE);
            expect(dateColumn?.translationKey).toBe('search.filters.created');
        });
    });

    describe('getTableMinWidth (horizontal-scroll budget)', () => {
        it('gives the DATE column the wider "Created" budget in expense-report and invoice search', () => {
            const expenseWidth = getTableMinWidth([DATE], EXPENSE);
            expect(getTableMinWidth([DATE], EXPENSE_REPORT)).toBeGreaterThan(expenseWidth);
            expect(getTableMinWidth([DATE], INVOICE)).toBeGreaterThan(expenseWidth);
        });

        it('keeps the narrower "Date" budget for trip and task', () => {
            const expenseWidth = getTableMinWidth([DATE], EXPENSE);
            expect(getTableMinWidth([DATE], TRIP)).toBe(expenseWidth);
            expect(getTableMinWidth([DATE], TASK)).toBe(expenseWidth);
        });
    });
});
