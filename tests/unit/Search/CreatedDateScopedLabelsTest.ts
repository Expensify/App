import {getExpenseHeaders} from '@components/Search/SearchTableHeader';

import {FILTER_VIEW_MAP, getFilterViewLabelKey, getSearchColumnTranslationKey, getTableMinWidth, isCreatedDateType} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import styles from '@src/styles';
import {defaultTheme} from '@src/styles/theme';
import createStyleUtils from '@src/styles/utils';
import variables from '@src/styles/variables';

const StyleUtils = createStyleUtils(defaultTheme, styles(defaultTheme));

describe('Created date scoped labels (#98148)', () => {
    const DATE = CONST.SEARCH.TABLE_COLUMNS.DATE;
    const {EXPENSE, EXPENSE_REPORT, TASK, TRIP, INVOICE} = CONST.SEARCH.DATA_TYPES;

    describe('isCreatedDateType (shared predicate)', () => {
        it('is true for expense reports and tasks (non-editable created timestamp)', () => {
            expect(isCreatedDateType(EXPENSE_REPORT)).toBe(true);
            expect(isCreatedDateType(TASK)).toBe(true);
        });

        it('is false for invoice, expense, trip and no type', () => {
            expect(isCreatedDateType(INVOICE)).toBe(false);
            expect(isCreatedDateType(EXPENSE)).toBe(false);
            expect(isCreatedDateType(TRIP)).toBe(false);
            expect(isCreatedDateType()).toBe(false);
        });
    });

    describe('getSearchColumnTranslationKey (column header, Sort by, Edit columns, saved search, CSV current view)', () => {
        it('returns "Created" for the DATE column in expense-report and task search', () => {
            expect(getSearchColumnTranslationKey(DATE, EXPENSE_REPORT)).toBe('search.filters.created');
            expect(getSearchColumnTranslationKey(DATE, TASK)).toBe('search.filters.created');
        });

        it('keeps "Date" for the DATE column in invoice, expense and trip', () => {
            expect(getSearchColumnTranslationKey(DATE, INVOICE)).toBe('common.date');
            expect(getSearchColumnTranslationKey(DATE, EXPENSE)).toBe('common.date');
            expect(getSearchColumnTranslationKey(DATE, TRIP)).toBe('common.date');
        });

        it('defaults to "Date" when no type is passed (e.g. the opened single-report table)', () => {
            expect(getSearchColumnTranslationKey(DATE)).toBe('common.date');
        });
    });

    describe('getFilterViewLabelKey (filter menu row, applied chip, filter subpage title)', () => {
        it('returns "Created date" for the DATE filter in expense-report and task search', () => {
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, EXPENSE_REPORT)).toBe('search.filters.createdDate');
            expect(getFilterViewLabelKey(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, TASK)).toBe('search.filters.createdDate');
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
        // Absolute values (24 is the leading checkbox) so a shift in the untouched-type budget can't pass.
        const CREATED_DATE_MIN_WIDTH = 24 + 72;
        const DATE_MIN_WIDTH = 24 + 48;

        it('gives the DATE column the wider "Created" budget in expense-report and task search', () => {
            expect(getTableMinWidth([DATE], EXPENSE_REPORT)).toBe(CREATED_DATE_MIN_WIDTH);
            expect(getTableMinWidth([DATE], TASK)).toBe(CREATED_DATE_MIN_WIDTH);
        });

        it('keeps the narrower "Date" budget for expense, invoice, trip and the opened report (no type)', () => {
            expect(getTableMinWidth([DATE], EXPENSE)).toBe(DATE_MIN_WIDTH);
            expect(getTableMinWidth([DATE], INVOICE)).toBe(DATE_MIN_WIDTH);
            expect(getTableMinWidth([DATE], TRIP)).toBe(DATE_MIN_WIDTH);
            expect(getTableMinWidth([DATE])).toBe(DATE_MIN_WIDTH);
        });
    });

    describe('getReportTableColumnStyles (DATE cell width)', () => {
        it('widens the DATE cell for the created-date column and keeps the narrow width otherwise', () => {
            expect(StyleUtils.getReportTableColumnStyles(DATE, {isDateColumnCreated: true})).toEqual(expect.objectContaining({width: variables.w80}));
            expect(StyleUtils.getReportTableColumnStyles(DATE, {isDateColumnCreated: false})).toEqual(expect.objectContaining({width: variables.w62}));
            expect(StyleUtils.getReportTableColumnStyles(DATE, {})).toEqual(expect.objectContaining({width: variables.w62}));
        });
    });
});
