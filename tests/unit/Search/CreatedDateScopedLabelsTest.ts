import {getExpenseHeaders} from '@components/Search/SearchTableHeader';

import {FILTER_VIEW_MAP, getFilterViewLabelKey, getSearchColumnTranslationKey, getTableMinWidth, isCreatedDateType} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

/**
 * Issue #98148: the "Created" / "Created date" rename is scoped to `type:expense-report` only, whose date column
 * renders a non-editable report-created timestamp. Every other Search type keeps "Date": invoice, expense and trip
 * render the editable transaction date, chat/task stay simple, and the opened single-report table (which reuses
 * getExpenseHeaders) keeps "Date" too. These tests lock that scoping in on the column label, the filter label and
 * the column width so a future edit can't silently widen it to every type or flip invoice to "Created".
 */
describe('Created date scoped labels (#98148)', () => {
    const DATE = CONST.SEARCH.TABLE_COLUMNS.DATE;
    const {EXPENSE, EXPENSE_REPORT, TASK, TRIP, INVOICE} = CONST.SEARCH.DATA_TYPES;

    describe('isCreatedDateType (shared predicate)', () => {
        it('is true only for expense reports', () => {
            expect(isCreatedDateType(EXPENSE_REPORT)).toBe(true);
        });

        it('is false for invoice, expense, trip, task and no type', () => {
            expect(isCreatedDateType(INVOICE)).toBe(false);
            expect(isCreatedDateType(EXPENSE)).toBe(false);
            expect(isCreatedDateType(TRIP)).toBe(false);
            expect(isCreatedDateType(TASK)).toBe(false);
            expect(isCreatedDateType()).toBe(false);
        });
    });

    describe('getSearchColumnTranslationKey (column header, Sort by, Edit columns, saved search, CSV current view)', () => {
        it('returns "Created" for the DATE column in expense-report search', () => {
            expect(getSearchColumnTranslationKey(DATE, EXPENSE_REPORT)).toBe('search.filters.created');
        });

        it('keeps "Date" for the DATE column in invoice, expense, trip and task', () => {
            expect(getSearchColumnTranslationKey(DATE, INVOICE)).toBe('common.date');
            expect(getSearchColumnTranslationKey(DATE, EXPENSE)).toBe('common.date');
            expect(getSearchColumnTranslationKey(DATE, TRIP)).toBe('common.date');
            expect(getSearchColumnTranslationKey(DATE, TASK)).toBe('common.date');
        });

        it('defaults to "Date" when no type is passed (e.g. the opened single-report table)', () => {
            expect(getSearchColumnTranslationKey(DATE)).toBe('common.date');
        });
    });

    describe('getFilterViewLabelKey (filter menu row, applied chip, filter subpage title)', () => {
        it('returns "Created date" for the DATE filter in expense-report search', () => {
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, EXPENSE_REPORT)).toBe('search.filters.createdDate');
        });

        it('keeps "Date" for the DATE filter in invoice, expense, trip and with no type', () => {
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, INVOICE)).toBe('common.date');
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, EXPENSE)).toBe('common.date');
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, TRIP)).toBe('common.date');
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE)).toBe('common.date');
        });

        it('does not touch non-date filters, even in report-style search', () => {
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED, EXPENSE_REPORT)).toBe(FILTER_VIEW_MAP[CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED].labelKey);
        });
    });

    describe('column builders (getExpenseHeaders is shared by expense, invoice, trip and the opened report)', () => {
        it('always keeps the DATE header on "Date" (expense, invoice, trip and the opened single-report table)', () => {
            const dateColumn = getExpenseHeaders().find((column) => column.columnName === DATE);
            expect(dateColumn?.translationKey).toBe('common.date');
        });
    });

    describe('getTableMinWidth (horizontal-scroll budget)', () => {
        it('gives the DATE column the wider "Created" budget in expense-report search', () => {
            const expenseWidth = getTableMinWidth([DATE], EXPENSE);
            expect(getTableMinWidth([DATE], EXPENSE_REPORT)).toBeGreaterThan(expenseWidth);
        });

        it('keeps the narrower "Date" budget for invoice, trip and task', () => {
            const expenseWidth = getTableMinWidth([DATE], EXPENSE);
            expect(getTableMinWidth([DATE], INVOICE)).toBe(expenseWidth);
            expect(getTableMinWidth([DATE], TRIP)).toBe(expenseWidth);
            expect(getTableMinWidth([DATE], TASK)).toBe(expenseWidth);
        });
    });
});
