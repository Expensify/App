import {render} from '@testing-library/react-native';

import type {SearchQueryJSON} from '@components/Search/types';

import {putOnHold} from '@libs/actions/IOU/Hold';
import {queueBulkHoldExpenses} from '@libs/actions/Search';

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

jest.mock('@pages/iou/HoldReasonFormView', () => {
    function MockHoldReasonFormView({onSubmit}: {onSubmit: (values: {comment: string}) => void}) {
        mockSubmitHoldReason = onSubmit;
        return null;
    }
    return MockHoldReasonFormView;
});
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({currentSearchQueryJSON: mockQueryJSON}),
    useSearchResultsContext: () => ({currentSearchResults: undefined}),
    useSearchSelectionActions: () => ({clearSelectedTransactions: mockClearSelectedTransactions}),
    useSearchSelectionContext: () => ({
        selectedTransactionIDs: [],
        selectedTransactions: {tx1: {reportID: 'report1'}},
        excludedTransactions: {tx2: {reportID: 'report1'}},
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected,
    }),
}));
jest.mock('@libs/actions/Search', () => ({
    queueBulkHoldExpenses: jest.fn(),
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
        await Onyx.clear();
    });

    it('hands the search to the backend when Select all is checked', async () => {
        // Given the hold reason page opened with "Select all" checked and one expense deselected
        renderPage(true);
        await waitForBatchedUpdatesWithAct();

        // When the user submits a reason
        mockSubmitHoldReason?.({comment: 'needs a receipt'});

        // Then every matching expense is held by the backend, except the deselected one, and nothing is held per expense
        expect(queueBulkHoldExpenses).toHaveBeenCalledWith(expect.any(String), 'needs a receipt', ['tx2']);
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
        expect(queueBulkHoldExpenses).not.toHaveBeenCalled();
    });
});
