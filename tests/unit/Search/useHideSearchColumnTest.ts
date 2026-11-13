import {act, renderHook} from '@testing-library/react-native';

import useHideSearchColumn from '@components/Search/hooks/useHideSearchColumn';
import type {SearchColumnType} from '@components/Search/types';

import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

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

describe('useHideSearchColumn', () => {
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
        const {result} = renderHook(() => useHideSearchColumn(getQueryJSON('type:expense'), SHOWN_COLUMNS));

        // When Merchant is hidden from its menu
        act(() => result.current.hideColumn(CONST.SEARCH.TABLE_COLUMNS.MERCHANT));

        // Then the search reloads with every other shown column kept in place, so hiding doesn't reorder the table,
        // and it keeps its key the same way saving from the Columns page does, so a saved search stays selected
        const [[route] = ['']] = jest.mocked(Navigation.navigate).mock.calls;
        const routeParams = new URLSearchParams(String(route).split('?').at(1));
        expect(routeParams.get('searchKey')).toBe(mockSearchKey);
        expect(getQueryJSON(routeParams.get('q') ?? '').columns).toEqual([
            CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
            CONST.SEARCH.TABLE_COLUMNS.DATE,
            CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        ]);
    });

    it('keeps a saved column the table does not show when another column is hidden', () => {
        // Given an expense report search that saved Amount debited, which the table drops when no row has a debited amount
        const queryJSON = getQueryJSON(
            `type:expense-report columns:${CONST.SEARCH.TABLE_COLUMNS.TO},${CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME},${CONST.SEARCH.TABLE_COLUMNS.AMOUNT_DEBITED},${CONST.SEARCH.TABLE_COLUMNS.TOTAL}`,
        );
        const {result} = renderHook(() => useHideSearchColumn(queryJSON, [CONST.SEARCH.TABLE_COLUMNS.TO, CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME, CONST.SEARCH.TABLE_COLUMNS.TOTAL]));

        // When To is hidden from its menu
        act(() => result.current.hideColumn(CONST.SEARCH.TABLE_COLUMNS.TO));

        // Then Amount debited stays saved, so it comes back once a row has a debited amount
        const [[route] = ['']] = jest.mocked(Navigation.navigate).mock.calls;
        const routeParams = new URLSearchParams(String(route).split('?').at(1));
        expect(getQueryJSON(routeParams.get('q') ?? '').columns).toEqual([
            CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME,
            CONST.SEARCH.TABLE_COLUMNS.AMOUNT_DEBITED,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL,
        ]);
    });

    it('offers no hide for the total column, which the table needs to lay out', () => {
        // Given an expense search
        const {result} = renderHook(() => useHideSearchColumn(getQueryJSON('type:expense'), SHOWN_COLUMNS));

        // When the column menus are built
        // Then the total column's menu can't hide it, the same as the Columns page, while the other columns' menus can
        expect(result.current.hidableColumns.has(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT)).toBe(false);
        expect(result.current.hidableColumns.has(CONST.SEARCH.TABLE_COLUMNS.MERCHANT)).toBe(true);
    });

    it('offers hide for the optional columns of a grouped table, but not for the column it groups by', () => {
        // Given an expense search grouped by member, showing its default group columns
        const {result} = renderHook(() => useHideSearchColumn(getQueryJSON('type:expense group-by:from'), GROUP_FROM_SHOWN_COLUMNS));

        // When the column menus are built
        // Then Expenses and Total can be hidden, the same as on the Columns page, while From stays because the groups are named by it
        expect(result.current.hidableColumns.has(CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES)).toBe(true);
        expect(result.current.hidableColumns.has(CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL)).toBe(true);
        expect(result.current.hidableColumns.has(CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM)).toBe(false);
    });

    it('keeps the saved expense columns when a group column is hidden', () => {
        // Given a grouped search that saved only expense columns, so its groups expand to those
        const queryJSON = getQueryJSON(`type:expense group-by:from columns:${CONST.SEARCH.TABLE_COLUMNS.MERCHANT},${CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT}`);
        const {result} = renderHook(() => useHideSearchColumn(queryJSON, GROUP_FROM_SHOWN_COLUMNS));

        // When Expenses is hidden from its menu
        act(() => result.current.hideColumn(CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES));

        // Then the other shown group columns are saved alongside the expense columns, so expanding a group still shows the chosen expense columns
        const [[route] = ['']] = jest.mocked(Navigation.navigate).mock.calls;
        const routeParams = new URLSearchParams(String(route).split('?').at(1));
        expect(getQueryJSON(routeParams.get('q') ?? '').columns).toEqual([
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
            useHideSearchColumn(queryJSON, [CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM, CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL, CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES]),
        );

        // When Total is hidden from its menu
        act(() => result.current.hideColumn(CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL));

        // Then only Total is dropped, so neither the group columns' order nor the expense columns change
        const [[route] = ['']] = jest.mocked(Navigation.navigate).mock.calls;
        const routeParams = new URLSearchParams(String(route).split('?').at(1));
        expect(getQueryJSON(routeParams.get('q') ?? '').columns).toEqual([
            CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM,
            CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
            CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        ]);
    });
});
