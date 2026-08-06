import {render} from '@testing-library/react-native';

import SearchSelectionFooter from '@components/Search/SearchSelectionFooter';
import type {SelectedTransactionInfo, SelectedTransactions} from '@components/Search/types';

import {getFooterConvertedAmounts} from '@libs/actions/Search';

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

// The Preferences > Payment currency setting, stored as the personal policy's output currency. Deliberately not USD
// so the test can tell the real fallback apart from the USD last resort.
const PAYMENT_CURRENCY = CONST.CURRENCY.GBP;

const ACCOUNT_ID = 1;
const PERSONAL_POLICY_ID = 'personalPolicy1';

function buildSearchResults(currency: string | undefined, count = 1): SearchResults {
    return {
        search: {
            count,
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

function buildSelectedTransaction(currency: string, groupCurrency?: string, groupAmount?: number): SelectedTransactionInfo {
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
        groupCurrency,
        groupAmount,
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
        // Clear here rather than in afterEach: Onyx.clear() there re-renders the previous test's still-mounted
        // component (testing-library only unmounts it afterwards), and those renders can record mock calls.
        jest.clearAllMocks();
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_POLICY_ID, PERSONAL_POLICY_ID);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${PERSONAL_POLICY_ID}`, {id: PERSONAL_POLICY_ID, outputCurrency: PAYMENT_CURRENCY});
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it("falls back to the user's live payment currency when the search snapshot has no currency yet", async () => {
        // A fresh no-workspace account: the Expenses search snapshot has not populated search.currency yet, and the
        // only selected expense happens to be in a different currency (JPY) from the live payment currency (GBP).
        render(<SearchSelectionFooter searchResults={buildSearchResults(undefined)} />);
        await waitForBatchedUpdates();

        // The footer's Reset/default currency follows the live payment currency (the personal policy's output
        // currency), not the selected expense's own (stale) currency.
        expect(mockCapturedFooterProps.current?.defaultCurrency).toBe(PAYMENT_CURRENCY);
    });

    it('prefers the search snapshot currency when one is already available', async () => {
        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.EUR)} />);
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current?.defaultCurrency).toBe(CONST.CURRENCY.EUR);
    });

    it('requests conversion to the payment currency when the loaded figures are denominated in another currency', async () => {
        // The payment currency changed after the snapshot loaded: the selected group's server-converted figure is
        // still denominated in the old payment currency (INR), while the live default is now GBP.
        mockSelectedTransactions.current = {[`${CONST.SEARCH.GROUP_PREFIX}category1`]: buildSelectedTransaction(SELECTED_EXPENSE_CURRENCY, 'INR', -100)};

        // A partial selection (1 of 2), so the footer uses the client-side selected total.
        render(<SearchSelectionFooter searchResults={buildSearchResults(undefined, 2)} />);
        await waitForBatchedUpdates();

        expect(getFooterConvertedAmounts).toHaveBeenCalledWith(expect.objectContaining({targetCurrency: PAYMENT_CURRENCY}));
    });

    it('labels an unconvertible total with the currency its figures are denominated in, not the default', async () => {
        // Same stale-denomination scenario, but the selected row carries no transaction ID or group key, so no
        // conversion request can be made for it.
        mockSelectedTransactions.current = {transaction1: buildSelectedTransaction(SELECTED_EXPENSE_CURRENCY, 'INR', -100)};

        render(<SearchSelectionFooter searchResults={buildSearchResults(undefined, 2)} />);
        await waitForBatchedUpdates();

        // The displayed total keeps its own denomination (INR) instead of borrowing the new default's symbol, while
        // the Reset/default currency still follows the live payment currency.
        expect(getFooterConvertedAmounts).not.toHaveBeenCalled();
        expect(mockCapturedFooterProps.current?.currency).toBe('INR');
        expect(mockCapturedFooterProps.current?.defaultCurrency).toBe(PAYMENT_CURRENCY);
    });
});
