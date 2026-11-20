import {render} from '@testing-library/react-native';

import type * as OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON, SelectedTransactionInfo} from '@components/Search/types';

import {queueBulkExpenseAction, rejectMoneyRequestsOnSearch} from '@libs/actions/Search';

import SearchRejectReasonPage from '@pages/Search/SearchRejectReasonPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockQueryJSON: SearchQueryJSON = {
    inputQuery: 'type:expense status:all',
    hash: 12345,
    recentSearchHash: 12345,
    similarSearchHash: 12345,
    flatFilters: [],
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    view: CONST.SEARCH.VIEW.TABLE,
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: 'type', right: 'expense'},
};
const mockClearSelectedTransactions = jest.fn();
let mockAreAllMatchingItemsSelected = false;
let mockSubmitRejectReason: ((values: {comment: string}) => void) | undefined;
let mockEnabledWhenOffline: boolean | undefined;
let mockSelectedTransactions: Record<string, Partial<SelectedTransactionInfo>> = {};
let mockExcludedTransactions: Record<string, Partial<SelectedTransactionInfo>> = {};

jest.mock('@pages/iou/RejectReasonFormView', () => {
    function MockRejectReasonFormView({onSubmit, enabledWhenOffline}: {onSubmit: (values: {comment: string}) => void; enabledWhenOffline?: boolean}) {
        mockSubmitRejectReason = onSubmit;
        mockEnabledWhenOffline = enabledWhenOffline;
        return null;
    }
    return MockRejectReasonFormView;
});
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({currentSearchHash: 12345, currentSearchQueryJSON: mockQueryJSON}),
    useSearchResultsContext: () => ({currentSearchResults: undefined}),
    useSearchSelectionActions: () => ({clearSelectedTransactions: mockClearSelectedTransactions}),
    useSearchSelectionContext: () => ({
        selectedTransactionIDs: [],
        selectedTransactions: mockSelectedTransactions,
        excludedTransactions: mockExcludedTransactions,
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected,
    }),
}));
jest.mock('@components/OnyxListItemProvider', () => ({
    ...jest.requireActual<typeof OnyxListItemProvider>('@components/OnyxListItemProvider'),
    useAllReportsTransactionsAndViolations: () => undefined,
}));
jest.mock('@libs/actions/Search', () => ({
    queueBulkExpenseAction: jest.fn(),
    rejectMoneyRequestsOnSearch: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    dismissToSuperWideRHP: jest.fn(),
    goBack: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

function renderPage(areAllMatchingItemsSelected: boolean) {
    mockAreAllMatchingItemsSelected = areAllMatchingItemsSelected;
    const route = {name: SCREENS.SEARCH.SEARCH_REJECT_REASON_RHP, key: 'reject', params: {}};
    // @ts-expect-error the page only reads route.name and route.params
    render(<SearchRejectReasonPage route={route} />);
}

describe('SearchRejectReasonPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockSubmitRejectReason = undefined;
        mockEnabledWhenOffline = undefined;
        mockSelectedTransactions = {tx1: {reportID: 'report1'}};
        mockExcludedTransactions = {tx2: {reportID: 'report1'}};
        await Onyx.clear();
    });

    it('sends an expense checked again inside a group deselected after Select all with the bulk reject', async () => {
        // Given "Select all" with the Travel group deselected, then one of its expenses checked again
        const travelGroupKey = `${CONST.SEARCH.GROUP_PREFIX}travel`;
        mockSelectedTransactions = {
            tx1: {reportID: 'report1', isSelected: true, canReject: true},
            tx3: {reportID: 'report1', isSelected: true, canReject: true, groupKey: travelGroupKey},
        };
        mockExcludedTransactions = {[travelGroupKey]: {reportID: 'report1'}};
        renderPage(true);
        await waitForBatchedUpdatesWithAct();

        // When the user submits a reason
        mockSubmitRejectReason?.({comment: 'missing receipts'});

        // Then the expense checked again goes to the backend with the search, since the search leaves its group out
        const [, , rowsCheckedInExcludedGroups] = jest.mocked(queueBulkExpenseAction).mock.calls.at(0) ?? [];
        expect(Object.keys(rowsCheckedInExcludedGroups ?? {})).toEqual(['tx3']);
        expect(rejectMoneyRequestsOnSearch).not.toHaveBeenCalled();
    });

    it('hands the search to the backend when Select all is checked', async () => {
        // Given the reject reason page opened with "Select all" checked and one expense deselected
        renderPage(true);
        await waitForBatchedUpdatesWithAct();

        // When the user submits a reason
        mockSubmitRejectReason?.({comment: 'missing receipts'});

        // Then every matching expense is rejected by the backend, except the deselected one, and nothing is rejected from the app
        const [action, allMatchingQuery, , comment] = jest.mocked(queueBulkExpenseAction).mock.calls.at(0) ?? [];
        expect(action).toBe(CONST.SEARCH.BULK_ACTION_TYPES.REJECT);
        expect(allMatchingQuery?.excludedTransactionIDList).toEqual(['tx2']);
        expect(comment).toBe('missing receipts');
        expect(rejectMoneyRequestsOnSearch).not.toHaveBeenCalled();
        expect(mockClearSelectedTransactions).toHaveBeenCalled();
    });

    it('rejects the selected expenses from the app when Select all is not checked', async () => {
        // Given the reject reason page opened with a manual selection
        renderPage(false);
        await waitForBatchedUpdatesWithAct();

        // When the user submits a reason
        mockSubmitRejectReason?.({comment: 'missing receipts'});

        // Then the selected expenses are rejected directly and nothing is queued on the backend
        expect(rejectMoneyRequestsOnSearch).toHaveBeenCalledTimes(1);
        expect(queueBulkExpenseAction).not.toHaveBeenCalled();
    });

    it('keeps the reason form from submitting offline when Select all is checked', async () => {
        // Given the reject reason page opened with "Select all" checked
        renderPage(true);
        await waitForBatchedUpdatesWithAct();

        // Then the form is disabled offline, since the backend would reject whatever matches once the device reconnects
        expect(mockEnabledWhenOffline).toBe(false);
    });

    it('lets the reason form submit offline when Select all is not checked', async () => {
        // Given the reject reason page opened with a manual selection
        renderPage(false);
        await waitForBatchedUpdatesWithAct();

        // Then the form still works offline, since each selected expense is updated optimistically
        expect(mockEnabledWhenOffline).toBe(true);
    });
});
