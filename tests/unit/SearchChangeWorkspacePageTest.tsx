import {act, render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON} from '@components/Search/types';

import {queueBulkChangeReportPolicy} from '@libs/actions/Search';

import SearchChangeWorkspacePage from '@pages/Search/SearchChangeWorkspacePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockQueryJSON: SearchQueryJSON = {
    inputQuery: 'type:expense-report status:all',
    hash: 12345,
    recentSearchHash: 12345,
    similarSearchHash: 12345,
    flatFilters: [],
    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    view: CONST.SEARCH.VIEW.TABLE,
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: 'type', right: 'expense-report'},
};
const mockClearSelectedTransactions = jest.fn();
let mockAreAllMatchingItemsSelected = false;
let mockSelectRow: ((option: {policyID: string}) => void) | undefined;
let mockConfirm: (() => void) | undefined;

jest.mock('@components/SelectionList', () => {
    function MockSelectionList({onSelectRow, confirmButtonOptions}: {onSelectRow: (option: {policyID: string}) => void; confirmButtonOptions: {onConfirm: () => void}}) {
        mockSelectRow = onSelectRow;
        mockConfirm = confirmButtonOptions.onConfirm;
        return null;
    }
    return MockSelectionList;
});
jest.mock(
    '@components/BlockingViews/FullPageOfflineBlockingView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({currentSearchQueryJSON: mockQueryJSON}),
    useSearchResultsContext: () => ({currentSearchResults: undefined}),
    useSearchSelectionActions: () => ({clearSelectedTransactions: mockClearSelectedTransactions}),
    useSearchSelectionContext: () => ({
        selectedReports: [{reportID: 'report1'}, {reportID: 'report2'}],
        selectedTransactions: {},
        excludedTransactions: {tx3: {reportID: 'report3'}},
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected,
    }),
}));
jest.mock('@libs/actions/Search', () => ({
    queueBulkChangeReportPolicy: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    getActiveRoute: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

async function changeWorkspace(areAllMatchingItemsSelected: boolean) {
    mockAreAllMatchingItemsSelected = areAllMatchingItemsSelected;
    render(
        <OnyxListItemProvider>
            <SearchChangeWorkspacePage />
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
    act(() => mockSelectRow?.({policyID: 'policy2'}));
    await waitForBatchedUpdatesWithAct();
    mockConfirm?.();
}

function getQueuedQuery(): string {
    return jest.mocked(queueBulkChangeReportPolicy).mock.calls.at(0)?.at(0) ?? '';
}

describe('SearchChangeWorkspacePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockSelectRow = undefined;
        mockConfirm = undefined;
        await Onyx.clear();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy2`, {id: 'policy2', name: 'Workspace 2', type: CONST.POLICY.TYPE.TEAM, role: CONST.POLICY.ROLE.USER});
    });

    it('moves every matching report except the deselected ones when Select all is checked', async () => {
        // Given "Select all" on a reports search, with report3 deselected afterwards
        // When the user picks a workspace and saves
        await changeWorkspace(true);

        // Then the search goes to the backend without report3, and the selection is cleared
        expect(queueBulkChangeReportPolicy).toHaveBeenCalledWith(expect.any(String), 'policy2');
        expect(getQueuedQuery()).toContain('report3');
        expect(mockClearSelectedTransactions).toHaveBeenCalled();
    });

    it('moves only the picked reports when Select all is not checked', async () => {
        // Given two reports picked by hand
        // When the user picks a workspace and saves
        await changeWorkspace(false);

        // Then the backend gets a search for exactly those reports
        const queuedQuery = getQueuedQuery();
        expect(queueBulkChangeReportPolicy).toHaveBeenCalledWith(expect.any(String), 'policy2');
        expect(queuedQuery).toContain('report1');
        expect(queuedQuery).toContain('report2');
        expect(queuedQuery).not.toContain('report3');
    });
});
