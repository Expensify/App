import {act, renderHook} from '@testing-library/react-native';

import useSearchColumnEditing from '@components/Search/hooks/useSearchColumnEditing';
import type {SearchColumnType} from '@components/Search/types';

import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON, getFilterFromQuery} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const mockSearchKey = CONST.SEARCH.SEARCH_KEYS.EXPENSES;
jest.mock('@components/Search/SearchContext', () => ({useSearchQueryContext: () => ({currentSearchKey: mockSearchKey})}));

const SHOWN_COLUMNS: SearchColumnType[] = [
    CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
    CONST.SEARCH.TABLE_COLUMNS.DATE,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
];

const GROUP_FROM_SHOWN_COLUMNS: SearchColumnType[] = [
    CONST.SEARCH.TABLE_COLUMNS.AVATAR,
    CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM,
    CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
    CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
];

function getQueryJSON(query: string) {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON) {
        throw new Error(`Unparseable query: ${query}`);
    }
    return queryJSON;
}

function getNavigatedRouteParams() {
    const [[route] = ['']] = jest.mocked(Navigation.navigate).mock.calls;
    return new URLSearchParams(String(route).split('?').at(1));
}

function getSavedColumns() {
    return getQueryJSON(getNavigatedRouteParams().get('q') ?? '').columns;
}

describe('useSearchColumnEditing', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('hides a column by saving the shown columns without it, in the same order', () => {
        // Given an expense search showing a few columns
        const queryJSON = getQueryJSON('type:expense');
        const {result} = renderHook(() => useSearchColumnEditing(queryJSON, queryJSON, SHOWN_COLUMNS));

        // When Merchant is hidden from its menu
        act(() => result.current.hideColumn(CONST.SEARCH.TABLE_COLUMNS.MERCHANT));

        // Then the search reloads with every other shown column kept in place, so hiding doesn't reorder the table,
        // and it keeps its key the same way saving from the Columns page does, so a saved search stays selected
        const routeParams = getNavigatedRouteParams();
        expect(routeParams.get('searchKey')).toBe(mockSearchKey);
        expect(getQueryJSON(routeParams.get('q') ?? '').columns).toEqual([
            CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
            CONST.SEARCH.TABLE_COLUMNS.DATE,
            CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        ]);
    });

    it('hides a column from the current search while the table still shows the results from before a filter change', () => {
        // Given a table still showing an expense search with Merchant pinned, while the same search with a Draft filter loads
        const shownQueryJSON = getQueryJSON(`type:expense ${CONST.SEARCH.SYNTAX_ROOT_KEYS.LEFT_PINNED_COLUMNS}:${CONST.SEARCH.TABLE_COLUMNS.MERCHANT}`);
        const currentSearchQueryJSON = getQueryJSON(
            `type:expense status:${CONST.SEARCH.STATUS.EXPENSE.DRAFTS} ${CONST.SEARCH.SYNTAX_ROOT_KEYS.LEFT_PINNED_COLUMNS}:${CONST.SEARCH.TABLE_COLUMNS.MERCHANT}`,
        );
        const {result} = renderHook(() => useSearchColumnEditing(shownQueryJSON, currentSearchQueryJSON, SHOWN_COLUMNS));

        // When Category is hidden from its menu before the filtered results arrive
        act(() => result.current.hideColumn(CONST.SEARCH.TABLE_COLUMNS.CATEGORY));

        // Then the new search keeps the Draft filter and the pin, because hiding a column must not undo the filter the user just applied
        const savedQueryJSON = getQueryJSON(getNavigatedRouteParams().get('q') ?? '');
        expect(getFilterFromQuery(savedQueryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS).value).toEqual([CONST.SEARCH.STATUS.EXPENSE.DRAFTS]);
        expect([savedQueryJSON.leftPinnedColumns ?? []].flat()).toEqual([CONST.SEARCH.TABLE_COLUMNS.MERCHANT]);
        expect(savedQueryJSON.columns).toEqual([
            CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
            CONST.SEARCH.TABLE_COLUMNS.DATE,
            CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        ]);
    });

    it('does not save the Violations column when the search that is loading dropped the violation filter', () => {
        // Given a table still showing a search with a violation filter and its Violations column, while the same search without the filter loads
        const currentSearchColumns = `${CONST.SEARCH.TABLE_COLUMNS.DATE},${CONST.SEARCH.TABLE_COLUMNS.MERCHANT},${CONST.SEARCH.TABLE_COLUMNS.CATEGORY},${CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT}`;
        const shownQueryJSON = getQueryJSON(
            `type:expense has:${CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION} columns:${CONST.SEARCH.TABLE_COLUMNS.DATE},${CONST.SEARCH.TABLE_COLUMNS.MERCHANT},${CONST.SEARCH.TABLE_COLUMNS.CATEGORY},${CONST.SEARCH.TABLE_COLUMNS.VIOLATIONS},${CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT}`,
        );
        const currentSearchQueryJSON = getQueryJSON(`type:expense columns:${currentSearchColumns}`);
        const {result} = renderHook(() =>
            useSearchColumnEditing(shownQueryJSON, currentSearchQueryJSON, [
                CONST.SEARCH.TABLE_COLUMNS.DATE,
                CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
                CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
                CONST.SEARCH.TABLE_COLUMNS.VIOLATIONS,
                CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
            ]),
        );

        // When Category is hidden from its menu before the results without the filter arrive
        act(() => result.current.hideColumn(CONST.SEARCH.TABLE_COLUMNS.CATEGORY));

        // Then Violations isn't saved, because without a violation filter the table never shows it, the same as when the filters build the query
        expect(getSavedColumns()).toEqual([CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]);
    });

    it('keeps the Violations column saved when another column is hidden on a search with a violation filter', () => {
        // Given a search with a violation filter that saved the Violations column
        const queryJSON = getQueryJSON(
            `type:expense has:${CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION} columns:${CONST.SEARCH.TABLE_COLUMNS.DATE},${CONST.SEARCH.TABLE_COLUMNS.CATEGORY},${CONST.SEARCH.TABLE_COLUMNS.VIOLATIONS},${CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT}`,
        );
        const {result} = renderHook(() =>
            useSearchColumnEditing(queryJSON, queryJSON, [
                CONST.SEARCH.TABLE_COLUMNS.DATE,
                CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
                CONST.SEARCH.TABLE_COLUMNS.VIOLATIONS,
                CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
            ]),
        );

        // When Category is hidden from its menu
        act(() => result.current.hideColumn(CONST.SEARCH.TABLE_COLUMNS.CATEGORY));

        // Then Violations stays saved, because the filter still shows it
        expect(getSavedColumns()).toEqual([CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.VIOLATIONS, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]);
    });

    it('keeps a saved column the table does not show when another column is hidden', () => {
        // Given an expense report search that saved Amount debited, which the table drops when no row has a debited amount
        const queryJSON = getQueryJSON(
            `type:expense-report columns:${CONST.SEARCH.TABLE_COLUMNS.TO},${CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME},${CONST.SEARCH.TABLE_COLUMNS.AMOUNT_DEBITED},${CONST.SEARCH.TABLE_COLUMNS.TOTAL}`,
        );
        const {result} = renderHook(() =>
            useSearchColumnEditing(queryJSON, queryJSON, [CONST.SEARCH.TABLE_COLUMNS.TO, CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME, CONST.SEARCH.TABLE_COLUMNS.TOTAL]),
        );

        // When To is hidden from its menu
        act(() => result.current.hideColumn(CONST.SEARCH.TABLE_COLUMNS.TO));

        // Then Amount debited stays saved, so it comes back once a row has a debited amount
        expect(getSavedColumns()).toEqual([CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME, CONST.SEARCH.TABLE_COLUMNS.AMOUNT_DEBITED, CONST.SEARCH.TABLE_COLUMNS.TOTAL]);
    });

    it('offers no hide for the total column, which the table needs to lay out', () => {
        // Given an expense search
        const queryJSON = getQueryJSON('type:expense');
        const {result} = renderHook(() => useSearchColumnEditing(queryJSON, queryJSON, SHOWN_COLUMNS));

        // When the column menus are built
        // Then the total column's menu can't hide it, the same as the Columns page, while the other columns' menus can
        expect(result.current.hidableColumns.has(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT)).toBe(false);
        expect(result.current.hidableColumns.has(CONST.SEARCH.TABLE_COLUMNS.MERCHANT)).toBe(true);
    });

    it('offers hide for the optional columns of a grouped table, but not for the column it groups by', () => {
        // Given an expense search grouped by member, showing its default group columns
        const queryJSON = getQueryJSON('type:expense group-by:from');
        const {result} = renderHook(() => useSearchColumnEditing(queryJSON, queryJSON, GROUP_FROM_SHOWN_COLUMNS));

        // When the column menus are built
        // Then Expenses and Total can be hidden, the same as on the Columns page, while From stays because the groups are named by it
        expect(result.current.hidableColumns.has(CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES)).toBe(true);
        expect(result.current.hidableColumns.has(CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL)).toBe(true);
        expect(result.current.hidableColumns.has(CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM)).toBe(false);
    });

    it('keeps the saved expense columns when a group column is hidden', () => {
        // Given a grouped search that saved only expense columns, so its groups expand to those
        const queryJSON = getQueryJSON(`type:expense group-by:from columns:${CONST.SEARCH.TABLE_COLUMNS.MERCHANT},${CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT}`);
        const {result} = renderHook(() => useSearchColumnEditing(queryJSON, queryJSON, GROUP_FROM_SHOWN_COLUMNS));

        // When Expenses is hidden from its menu
        act(() => result.current.hideColumn(CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES));

        // Then the other shown group columns are saved alongside the expense columns, so expanding a group still shows the chosen expense columns
        expect(getSavedColumns()).toEqual([
            CONST.SEARCH.TABLE_COLUMNS.AVATAR,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
            CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        ]);
    });

    it('hides a group column from the saved group and expense columns, in the same order', () => {
        // Given a grouped search that saved both group and expense columns
        const queryJSON = getQueryJSON(
            `type:expense group-by:from columns:${CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM},${CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL},${CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES},${CONST.SEARCH.TABLE_COLUMNS.MERCHANT},${CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT}`,
        );
        const {result} = renderHook(() =>
            useSearchColumnEditing(queryJSON, queryJSON, [CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM, CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL, CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES]),
        );

        // When Total is hidden from its menu
        act(() => result.current.hideColumn(CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL));

        // Then only Total is dropped, so neither the group columns' order nor the expense columns change
        expect(getSavedColumns()).toEqual([
            CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
            CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        ]);
    });

    it('keeps the conversion amount columns the table drops when a grouped search with no saved columns hides a column', () => {
        // Given a search grouped by withdrawal with no saved columns, where no withdrawal has a conversion amount,
        // so the table drops Amount debited and Amount reimbursed
        const shownColumns: SearchColumnType[] = [
            CONST.SEARCH.TABLE_COLUMNS.AVATAR,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_STATUS,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_BANK_ACCOUNT,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
        ];
        const queryJSON = getQueryJSON('type:expense group-by:withdrawal-id');
        const {result} = renderHook(() => useSearchColumnEditing(queryJSON, queryJSON, shownColumns));

        // When Expenses is hidden from its menu
        act(() => result.current.hideColumn(CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES));

        // Then the conversion amount columns are saved in their default place, so they show once a withdrawal has a conversion amount
        // and the Columns page shows them checked, the same as saving from it
        expect(getSavedColumns()).toEqual([
            CONST.SEARCH.TABLE_COLUMNS.AVATAR,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_STATUS,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_BANK_ACCOUNT,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_AMOUNT_DEBITED,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_AMOUNT_REIMBURSED,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
        ]);
    });

    it('saves no expense columns with the group columns when a grouped search has no saved columns', () => {
        // Given a grouped search with no saved columns, so its expanded groups derive their expense columns from the data
        const queryJSON = getQueryJSON('type:expense group-by:from');
        const {result} = renderHook(() => useSearchColumnEditing(queryJSON, queryJSON, GROUP_FROM_SHOWN_COLUMNS));

        // When Expenses is hidden from its menu
        act(() => result.current.hideColumn(CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES));

        // Then only the shown group columns are saved, so expanded groups keep deriving their columns from the data
        // instead of switching to the static default list
        expect(getSavedColumns()).toEqual([CONST.SEARCH.TABLE_COLUMNS.AVATAR, CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM, CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL]);
    });
});
