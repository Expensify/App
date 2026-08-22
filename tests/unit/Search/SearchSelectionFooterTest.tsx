import {act, render} from '@testing-library/react-native';

import SearchSelectionFooter from '@components/Search/SearchSelectionFooter';
import type {SearchGroupBy, SelectedTransactionInfo, SelectedTransactions} from '@components/Search/types';

import {getFooterConvertedAmounts} from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import {makeSettlementGroup} from '../../utils/ExpensifyCardStatementTestUtils';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

jest.mock('@hooks/useSearchShouldCalculateTotals', () => jest.fn(() => true));

jest.mock('@libs/actions/Search', () => ({
    getFooterConvertedAmounts: jest.fn(),
}));

type MockSearchQueryContext = {
    currentSearchHash: number;
    currentSearchKey: undefined;
    currentSearchQueryJSON: {hash: number; type: SearchResults['search']['type']; groupBy?: SearchGroupBy} | undefined;
};

const mockSearchQueryContext: {current: MockSearchQueryContext} = {
    current: {currentSearchHash: 1, currentSearchKey: undefined, currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE}},
};
const mockSelectedTransactions: {current: SelectedTransactions} = {current: {}};
const mockExcludedTransactions: {current: SelectedTransactions} = {current: {}};
const mockAreAllMatchingItemsSelected = {current: false};
const mockCurrentSearchResults: {current: SearchResults | undefined} = {current: undefined};
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => mockSearchQueryContext.current,
    useSearchResultsContext: () => ({currentSearchResults: mockCurrentSearchResults.current}),
    useSearchSelectionContext: () => ({
        selectedTransactions: mockSelectedTransactions.current,
        excludedTransactions: mockExcludedTransactions.current,
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected.current,
        selectedReports: [],
    }),
}));

type CapturedFooterProps = {
    count?: number;
    total?: number;
    defaultCurrency?: string;
    currency?: string;
    onCurrencyChange?: (currency: string) => void;
};
const mockCapturedFooterProps: {current: CapturedFooterProps | undefined} = {current: undefined};
jest.mock('@components/Search/SearchPageFooter', () => ({
    __esModule: true,
    default: (props: CapturedFooterProps) => {
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
const WORKSPACE_POLICY_ID = 'workspacePolicy1';

function buildSearchResults(currency: string | undefined, count = 1, total = -100, type: SearchResults['search']['type'] = CONST.SEARCH.DATA_TYPES.EXPENSE): SearchResults {
    return {
        search: {
            count,
            currency,
            total,
            offset: 0,
            isLoading: false,
            hash: 1,
            type,
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
        mockExcludedTransactions.current = {};
        mockAreAllMatchingItemsSelected.current = false;
        mockCurrentSearchResults.current = undefined;
        mockCapturedFooterProps.current = undefined;
        // Clear here rather than in afterEach: Onyx.clear() there re-renders the previous test's still-mounted
        // component (testing-library only unmounts it afterwards), and those renders can record mock calls.
        jest.clearAllMocks();
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});
        // Accounts without a workspace have their personal policy as the active policy.
        await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, PERSONAL_POLICY_ID);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${PERSONAL_POLICY_ID}`, {id: PERSONAL_POLICY_ID, outputCurrency: PAYMENT_CURRENCY});
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('subtracts excluded expenses from the server count and total', async () => {
        mockSelectedTransactions.current = {};
        mockExcludedTransactions.current = {transaction1: buildSelectedTransaction(CONST.CURRENCY.USD)};
        mockAreAllMatchingItemsSelected.current = true;

        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 172, 36000)} />);
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 171, total: 35900, currency: CONST.CURRENCY.USD}));
    });

    it('keeps the expense-report server count and total unchanged', async () => {
        mockSearchQueryContext.current = {
            currentSearchHash: 1,
            currentSearchKey: undefined,
            currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT},
        };
        mockSelectedTransactions.current = {};
        mockExcludedTransactions.current = {
            transaction1: buildSelectedTransaction(CONST.CURRENCY.USD),
            transaction2: buildSelectedTransaction(CONST.CURRENCY.USD),
        };
        mockAreAllMatchingItemsSelected.current = true;

        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT)} />);
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 10, total: 36000, currency: CONST.CURRENCY.USD}));
    });

    it("offers the user's live payment currency as the Reset target when there is no active workspace", async () => {
        // A fresh no-workspace account: the active policy is the personal policy, and the only selected expense
        // happens to be in a different currency (JPY) from the live payment currency (GBP).
        render(<SearchSelectionFooter searchResults={buildSearchResults(undefined)} />);
        await waitForBatchedUpdates();

        // The footer's Reset/default currency follows the live payment currency (the personal policy's output
        // currency), not the selected expense's own (stale) currency.
        expect(mockCapturedFooterProps.current?.defaultCurrency).toBe(PAYMENT_CURRENCY);
    });

    it("offers the active workspace's currency as the Reset target when one is set", async () => {
        // The server converts search figures to the active policy's currency, so with an active workspace the Reset
        // target is the workspace currency, not the personal payment currency.
        await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, WORKSPACE_POLICY_ID);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE_POLICY_ID}`, {id: WORKSPACE_POLICY_ID, outputCurrency: CONST.CURRENCY.EUR});
        await waitForBatchedUpdates();

        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.EUR)} />);
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current?.defaultCurrency).toBe(CONST.CURRENCY.EUR);
    });

    it('converts the figures when Reset selects a default the figures are not denominated in', async () => {
        // The payment currency changed after the snapshot loaded: the selected group's server-converted figure is
        // still denominated in the old payment currency (INR), while the live default is now GBP.
        mockSelectedTransactions.current = {[`${CONST.SEARCH.GROUP_PREFIX}category1`]: buildSelectedTransaction(SELECTED_EXPENSE_CURRENCY, 'INR', -100)};

        // A partial selection (1 of 2), so the footer uses the client-side selected total.
        render(<SearchSelectionFooter searchResults={buildSearchResults(undefined, 2)} />);
        await waitForBatchedUpdates();

        // No picker choice yet, so nothing converts.
        expect(getFooterConvertedAmounts).not.toHaveBeenCalled();

        // Reset passes the default through onCurrencyChange as an explicit selection.
        await act(async () => {
            mockCapturedFooterProps.current?.onCurrencyChange?.(PAYMENT_CURRENCY);
            await waitForBatchedUpdates();
        });

        // The chosen default differs from the figures' denomination, so a conversion to it is requested.
        expect(getFooterConvertedAmounts).toHaveBeenCalledWith(expect.objectContaining({targetCurrency: PAYMENT_CURRENCY}));
    });

    it('does not convert when Reset selects the currency the figures are already denominated in', async () => {
        mockSelectedTransactions.current = {[`${CONST.SEARCH.GROUP_PREFIX}category1`]: buildSelectedTransaction(SELECTED_EXPENSE_CURRENCY, PAYMENT_CURRENCY, -100)};

        render(<SearchSelectionFooter searchResults={buildSearchResults(undefined, 2)} />);
        await waitForBatchedUpdates();

        await act(async () => {
            mockCapturedFooterProps.current?.onCurrencyChange?.(PAYMENT_CURRENCY);
            await waitForBatchedUpdates();
        });

        // The figures are already in the chosen currency, so no request is made and the snapshot data is used as-is.
        expect(getFooterConvertedAmounts).not.toHaveBeenCalled();
        expect(mockCapturedFooterProps.current?.currency).toBe(PAYMENT_CURRENCY);
    });

    describe('stamping the loaded groups of a grouped search', () => {
        const CASH_BACK_KEY = `${CONST.SEARCH.GROUP_PREFIX}cashBack` as const;
        const SETTLEMENT_KEY = `${CONST.SEARCH.GROUP_PREFIX}settlement` as const;

        const renderGroupedSearch = async () => {
            mockSearchQueryContext.current = {
                currentSearchHash: 1,
                currentSearchKey: undefined,
                currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE, groupBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID},
            };
            const searchResults = buildSearchResults(undefined, 2);
            mockCurrentSearchResults.current = {
                ...searchResults,
                data: {
                    [CASH_BACK_KEY]: makeSettlementGroup({total: -2500, isCashBack: true}),
                    [SETTLEMENT_KEY]: makeSettlementGroup({total: 40000}),
                },
            };
            // Only the settlement is selected, so the cash back row is stamped by the bulk path rather than from its entry.
            mockSelectedTransactions.current = {[SETTLEMENT_KEY]: buildSelectedTransaction(SELECTED_EXPENSE_CURRENCY, 'INR', -40000)};

            render(<SearchSelectionFooter searchResults={searchResults} />);
            await waitForBatchedUpdates();

            await act(async () => {
                mockCapturedFooterProps.current?.onCurrencyChange?.(PAYMENT_CURRENCY);
                await waitForBatchedUpdates();
            });

            return jest
                .mocked(getFooterConvertedAmounts)
                .mock.calls.map(([args]) => args)
                .find((args) => !!args.sources?.groups)?.sources?.groups;
        };

        it('stamps an unselected cash back group with the positive figure its own entry would produce', async () => {
            const groups = await renderGroupedSearch();

            // selectionBuilders gives a selected cash back row groupAmount: +Math.abs(total), so a negative stamp here
            // would never match the freshness check and the cached conversion could never be reused.
            expect(groups?.[CASH_BACK_KEY]).toEqual({[PAYMENT_CURRENCY]: 2500});
        });

        it('keeps stamping an unselected settlement group expense-negative', async () => {
            const groups = await renderGroupedSearch();

            expect(groups?.[SETTLEMENT_KEY]).toEqual({[PAYMENT_CURRENCY]: -40000});
        });
    });
});
