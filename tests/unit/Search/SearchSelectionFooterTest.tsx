import {render} from '@testing-library/react-native';

import SearchSelectionFooter from '@components/Search/SearchSelectionFooter';
import type {SelectedTransactionInfo, SelectedTransactions} from '@components/Search/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

jest.mock('@hooks/useSearchShouldCalculateTotals', () => jest.fn(() => true));

jest.mock('@libs/actions/Search', () => ({
    getFooterConvertedAmounts: jest.fn(),
}));

const mockSearchQueryContext: {current: {currentSearchHash: number; currentSearchKey: undefined; currentSearchQueryJSON: {hash: number; type: string} | undefined}} = {
    current: {currentSearchHash: 1, currentSearchKey: undefined, currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE}},
};
const mockSelectedTransactions: {current: SelectedTransactions} = {current: {}};
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => mockSearchQueryContext.current,
    useSearchResultsContext: () => ({currentSearchResults: undefined}),
    useSearchSelectionContext: () => ({selectedTransactions: mockSelectedTransactions.current, areAllMatchingItemsSelected: false, selectedReports: []}),
}));

const mockCapturedFooterProps: {current: {defaultCurrency?: string; currency?: string} | undefined} = {current: undefined};
jest.mock('@components/Search/SearchPageFooter', () => ({
    __esModule: true,
    default: (props: {defaultCurrency?: string; currency?: string}) => {
        mockCapturedFooterProps.current = props;
        return null;
    },
}));

// The currency of the selected expense — deliberately different from every other currency in this test so a leak
// from any wrong fallback source is easy to spot.
const SELECTED_EXPENSE_CURRENCY = 'JPY';

const ACCOUNT_ID = 1;

function buildSearchResults(currency: string | undefined): SearchResults {
    return {
        search: {
            count: 1,
            currency,
            total: -100,
            offset: 0,
            isLoading: false,
            hash: 1,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            hasMoreResults: false,
            hasResults: true,
        },
        data: {},
    };
}

function buildSelectedTransaction(currency: string): SelectedTransactionInfo {
    return {
        isSelected: true,
        canReject: false,
        canHold: false,
        canSplit: false,
        hasBeenSplit: false,
        canChangeReport: false,
        isHeld: false,
        canUnhold: false,
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        policyID: undefined,
        amount: 100,
        currency,
        isFromOneTransactionReport: false,
    };
}

describe('SearchSelectionFooter', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockSearchQueryContext.current = {currentSearchHash: 1, currentSearchKey: undefined, currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE}};
        mockSelectedTransactions.current = {transaction1: buildSelectedTransaction(SELECTED_EXPENSE_CURRENCY)};
        mockCapturedFooterProps.current = undefined;
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, localCurrencyCode: CONST.CURRENCY.USD}});
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();
    });

    it("falls back to the user's live payment currency when the search snapshot has no currency yet", async () => {
        // A fresh no-workspace account: the Expenses search snapshot has not populated search.currency yet, and the
        // only selected expense happens to be in a different currency (JPY) from the live payment currency (USD).
        render(<SearchSelectionFooter searchResults={buildSearchResults(undefined)} />);
        await waitForBatchedUpdates();

        // The footer's Reset/default currency follows the live USD payment currency, not the selected expense's own
        // (stale) currency.
        expect(mockCapturedFooterProps.current?.defaultCurrency).toBe(CONST.CURRENCY.USD);
    });

    it('prefers the search snapshot currency when one is already available', async () => {
        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.EUR)} />);
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current?.defaultCurrency).toBe(CONST.CURRENCY.EUR);
    });
});
