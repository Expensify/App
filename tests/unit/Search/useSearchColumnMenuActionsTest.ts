import {act, renderHook} from '@testing-library/react-native';

import useSearchColumnMenuActions from '@components/Search/hooks/useSearchColumnMenuActions';
import type {SearchColumnType} from '@components/Search/types';

import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

let mockIsBetaEnabled = true;
const mockPinnableTableColumnsBeta = CONST.BETAS.PINNABLE_TABLE_COLUMNS;
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: (beta: string) => mockIsBetaEnabled && beta === mockPinnableTableColumnsBeta}));

const mockSearchKey = CONST.SEARCH.SEARCH_KEYS.EXPENSES;
jest.mock('@components/Search/SearchContext', () => ({useSearchQueryContext: () => ({currentSearchKey: mockSearchKey})}));

const SHOWN_COLUMNS: SearchColumnType[] = [
    CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
    CONST.SEARCH.TABLE_COLUMNS.DATE,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
];

function getQueryJSON(query: string) {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON) {
        throw new Error(`Unparseable query: ${query}`);
    }
    return queryJSON;
}

describe('useSearchColumnMenuActions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockIsBetaEnabled = true;
        jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('hides a column by saving the shown columns without it, in the same order', () => {
        // Given an expense search showing a few columns
        const {result} = renderHook(() => useSearchColumnMenuActions(getQueryJSON('type:expense'), SHOWN_COLUMNS));

        // When Merchant is hidden from its menu
        act(() => result.current?.getHideColumnHandler(CONST.SEARCH.TABLE_COLUMNS.MERCHANT)?.());

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

    it('offers no hide for the total column, which the table needs to lay out', () => {
        // Given an expense search
        const {result} = renderHook(() => useSearchColumnMenuActions(getQueryJSON('type:expense'), SHOWN_COLUMNS));

        // When the menu for the total column is built
        // Then it can't hide the column, the same as the Columns page
        expect(result.current?.getHideColumnHandler(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT)).toBeUndefined();
    });

    it('offers no hide on a grouped table, whose saved columns also cover the expenses its groups expand to', () => {
        // Given an expense search grouped by category
        const {result} = renderHook(() => useSearchColumnMenuActions(getQueryJSON('type:expense group-by:category'), SHOWN_COLUMNS));

        // When the menu for a column is built
        // Then it can't hide the column, since saving only the shown group columns would drop the expense columns
        expect(result.current?.getHideColumnHandler(CONST.SEARCH.TABLE_COLUMNS.MERCHANT)).toBeUndefined();
    });

    it('has no menus for a type whose columns users cannot pick', () => {
        // Given a task search, whose columns aren't customizable
        const queryJSON = getQueryJSON('type:task');

        // When its column menus are built
        const {result} = renderHook(() => useSearchColumnMenuActions(queryJSON, SHOWN_COLUMNS));

        // Then its headings get no menus
        expect(result.current).toBeUndefined();
    });

    it('has no menus without the beta', () => {
        // Given the pinnableTableColumns beta is off
        mockIsBetaEnabled = false;

        // When the column menus of an expense search are built
        const {result} = renderHook(() => useSearchColumnMenuActions(getQueryJSON('type:expense'), SHOWN_COLUMNS));

        // Then even an expense search gets no menus
        expect(result.current).toBeUndefined();
    });
});
