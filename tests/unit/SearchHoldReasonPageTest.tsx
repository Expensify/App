import {render} from '@testing-library/react-native';

import type {SearchQueryJSON, SelectedTransactionInfo} from '@components/Search/types';

import {putOnHold} from '@libs/actions/IOU/Hold';
import {queueBulkExpenseAction} from '@libs/actions/Search';
import type {SearchKey} from '@libs/SearchKeyUtils';

import SearchHoldReasonPage from '@pages/Search/SearchHoldReasonPage';

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
let mockSubmitHoldReason: ((values: {comment: string}) => void) | undefined;
let mockEnabledWhenOffline: boolean | undefined;

let mockSearchKey: SearchKey | undefined;
let mockSelectedTransactions: Record<string, Partial<SelectedTransactionInfo>> = {};
let mockExcludedTransactions: Record<string, Partial<SelectedTransactionInfo>> = {};
jest.mock('@pages/iou/HoldReasonFormView', () => {
    function MockHoldReasonFormView({onSubmit, enabledWhenOffline}: {onSubmit: (values: {comment: string}) => void; enabledWhenOffline?: boolean}) {
        mockSubmitHoldReason = onSubmit;
        mockEnabledWhenOffline = enabledWhenOffline;
        return null;
    }
    return MockHoldReasonFormView;
});
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({currentSearchKey: mockSearchKey, currentSearchQueryJSON: mockQueryJSON}),
    useSearchResultsContext: () => ({currentSearchResults: undefined}),
    useSearchSelectionActions: () => ({clearSelectedTransactions: mockClearSelectedTransactions}),
    useSearchSelectionContext: () => ({
        selectedTransactionIDs: [],
        selectedTransactions: mockSelectedTransactions,
        excludedTransactions: mockExcludedTransactions,
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected,
    }),
}));
jest.mock('@libs/actions/Search', () => ({
    queueBulkExpenseAction: jest.fn(),
}));
jest.mock('@libs/actions/IOU/Hold', () => ({
    putOnHold: jest.fn(),
    putTransactionsOnHold: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));
jest.mock('@hooks/useDynamicBackPath', () => ({
    __esModule: true,
    default: () => '',
}));

function renderPage(areAllMatchingItemsSelected: boolean) {
    mockAreAllMatchingItemsSelected = areAllMatchingItemsSelected;
    const route = {name: SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP, key: 'hold', params: {backTo: ''}};
    // @ts-expect-error the page only reads route.name and route.params
    render(<SearchHoldReasonPage route={route} />);
}

describe('SearchHoldReasonPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockSubmitHoldReason = undefined;
        mockEnabledWhenOffline = undefined;
        mockSearchKey = undefined;
        mockSelectedTransactions = {tx1: {reportID: 'report1'}};
        mockExcludedTransactions = {tx2: {reportID: 'report1'}};
        await Onyx.clear();
    });

    it('sends the search key with the query, so the backend holds the same expenses the search shows', async () => {
        // Given "Select all" on the unapproved cash search, which only shows cash expenses
        mockSearchKey = CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH;
        renderPage(true);
        await waitForBatchedUpdatesWithAct();

        // When the user submits a reason
        mockSubmitHoldReason?.({comment: 'needs a receipt'});

        // Then the query sent to the backend keeps that search key
        const [, allMatchingQuery] = jest.mocked(queueBulkExpenseAction).mock.calls.at(0) ?? [];
        expect(JSON.parse(allMatchingQuery?.jsonQuery ?? '{}')).toMatchObject({searchKey: CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH});
    });

    it('sends an expense checked again inside a group deselected after Select all with the bulk hold', async () => {
        // Given "Select all" with the Travel group deselected, then one of its expenses checked again
        const travelGroupKey = `${CONST.SEARCH.GROUP_PREFIX}travel`;
        mockSelectedTransactions = {
            tx1: {reportID: 'report1', isSelected: true, canHold: true},
            tx3: {reportID: 'report1', isSelected: true, canHold: true, groupKey: travelGroupKey},
        };
        mockExcludedTransactions = {[travelGroupKey]: {reportID: 'report1'}};
        renderPage(true);
        await waitForBatchedUpdatesWithAct();

        // When the user submits a reason
        mockSubmitHoldReason?.({comment: 'needs a receipt'});

        // Then the expense checked again goes to the backend with the search, since the search leaves its group out
        const [, , rowsCheckedInExcludedGroups] = jest.mocked(queueBulkExpenseAction).mock.calls.at(0) ?? [];
        expect(Object.keys(rowsCheckedInExcludedGroups ?? {})).toEqual(['tx3']);
        expect(putOnHold).not.toHaveBeenCalled();
    });

    it('hands the search to the backend when Select all is checked', async () => {
        // Given the hold reason page opened with "Select all" checked and one expense deselected
        renderPage(true);
        await waitForBatchedUpdatesWithAct();

        // When the user submits a reason
        mockSubmitHoldReason?.({comment: 'needs a receipt'});

        // Then every matching expense is held by the backend, except the deselected one, and nothing is held per expense
        const [action, allMatchingQuery, , comment] = jest.mocked(queueBulkExpenseAction).mock.calls.at(0) ?? [];
        expect(action).toBe(CONST.SEARCH.BULK_ACTION_TYPES.HOLD);
        expect(allMatchingQuery?.excludedTransactionIDList).toEqual(['tx2']);
        expect(comment).toBe('needs a receipt');
        expect(putOnHold).not.toHaveBeenCalled();
        expect(mockClearSelectedTransactions).toHaveBeenCalled();
    });

    it('holds each selected expense when Select all is not checked', async () => {
        // Given the hold reason page opened with a manual selection
        renderPage(false);
        await waitForBatchedUpdatesWithAct();

        // When the user submits a reason
        mockSubmitHoldReason?.({comment: 'needs a receipt'});

        // Then the selected expense is held directly and nothing is queued on the backend
        expect(putOnHold).toHaveBeenCalledTimes(1);
        expect(queueBulkExpenseAction).not.toHaveBeenCalled();
    });

    it('keeps the reason form from submitting offline when Select all is checked', async () => {
        // Given the hold reason page opened with "Select all" checked
        renderPage(true);
        await waitForBatchedUpdatesWithAct();

        // Then the form is disabled offline, since the backend would hold whatever matches once the device reconnects
        expect(mockEnabledWhenOffline).toBe(false);
    });

    it('lets the reason form submit offline when Select all is not checked', async () => {
        // Given the hold reason page opened with a manual selection
        renderPage(false);
        await waitForBatchedUpdatesWithAct();

        // Then the form still works offline, since each selected expense is updated optimistically
        expect(mockEnabledWhenOffline).toBe(true);
    });
});
