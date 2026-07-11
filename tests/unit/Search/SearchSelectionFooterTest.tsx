import {render} from '@testing-library/react-native';

import SearchSelectionFooter from '@components/Search/SearchSelectionFooter';
import type {SelectedTransactions} from '@components/Search/types';

import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

const mockSearchPageFooter = jest.fn(() => null);
let mockExcludedTransactions: SelectedTransactions = {};
let mockSearchType: SearchResults['search']['type'] = CONST.SEARCH.DATA_TYPES.EXPENSE;

jest.mock('@hooks/useSearchShouldCalculateTotals', () => ({
    __esModule: true,
    default: () => true,
}));

jest.mock('@components/Search/SearchPageFooter', () => ({
    __esModule: true,
    default: (props: unknown) => mockSearchPageFooter(props),
}));

jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionContext: () => ({
        selectedTransactions: {},
        excludedTransactions: mockExcludedTransactions,
        areAllMatchingItemsSelected: true,
    }),
    useSearchResultsContext: () => ({currentSearchResults: {data: {}}}),
    useSearchQueryContext: () => ({
        currentSearchKey: 'expenses',
        currentSearchQueryJSON: {type: mockSearchType, hash: 1},
    }),
}));

function makeTransaction(reportID: string, amount = 100): SelectedTransactions[string] {
    return {
        isSelected: true,
        canReject: false,
        canHold: false,
        canSplit: false,
        hasBeenSplit: false,
        canChangeReport: false,
        isHeld: false,
        canUnhold: false,
        isFromOneTransactionReport: false,
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        reportID,
        policyID: 'policy_1',
        amount,
        currency: 'USD',
    };
}

function makeSearchResults(count: number, total: number): OnyxEntry<SearchResults> {
    return {
        search: {
            type: mockSearchType,
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            offset: 0,
            hasMoreResults: true,
            hasResults: true,
            isLoading: false,
            count,
            total,
            currency: 'USD',
        },
        data: {},
    } as OnyxEntry<SearchResults>;
}

describe('SearchSelectionFooter all-matching exclusions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchType = CONST.SEARCH.DATA_TYPES.EXPENSE;
        mockExcludedTransactions = {};
    });

    it('subtracts excluded expenses from the server count and total', () => {
        mockExcludedTransactions = {tx_1: makeTransaction('report_1')};

        render(<SearchSelectionFooter searchResults={makeSearchResults(172, 36000)} />);

        expect(mockSearchPageFooter).toHaveBeenLastCalledWith(expect.objectContaining({count: 171, total: 35900, currency: 'USD'}));
    });

    it('counts multiple excluded transactions from one expense report as one excluded report', () => {
        mockSearchType = CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
        mockExcludedTransactions = {
            tx_1: makeTransaction('report_1'),
            tx_2: makeTransaction('report_1'),
        };

        render(<SearchSelectionFooter searchResults={makeSearchResults(10, 36000)} />);

        expect(mockSearchPageFooter).toHaveBeenLastCalledWith(expect.objectContaining({count: 9, total: 35800, currency: 'USD'}));
    });
});
