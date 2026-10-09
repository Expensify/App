import {act, render} from '@testing-library/react-native';

import SearchSelectionFooter from '@components/Search/SearchSelectionFooter';
import type {SelectedReports, SelectedTransactionInfo, SelectedTransactions} from '@components/Search/types';

import {getFooterConvertedAmounts} from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

jest.mock('@hooks/useSearchShouldCalculateTotals', () => jest.fn(() => true));

jest.mock('@libs/actions/Search', () => ({
    openSearchCardFiltersPage: jest.fn(),
    getFooterConvertedAmounts: jest.fn(),
}));

type MockSearchQueryContext = {
    currentSearchHash: number;
    currentSearchKey: undefined;
    currentSearchQueryJSON: {hash: number; type: SearchResults['search']['type']} | undefined;
};

const mockSearchQueryContext: {current: MockSearchQueryContext} = {
    current: {currentSearchHash: 1, currentSearchKey: undefined, currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE}},
};
const mockSelectedTransactions: {current: SelectedTransactions} = {current: {}};
const mockExcludedTransactions: {current: SelectedTransactions} = {current: {}};
const mockSelectedReports: {current: SelectedReports[]} = {current: []};
const mockAreAllMatchingItemsSelected = {current: false};
const mockCurrentSearchResults: {current: {data: Record<string, unknown>} | undefined} = {current: undefined};
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => mockSearchQueryContext.current,
    useSearchResultsContext: () => ({currentSearchResults: mockCurrentSearchResults.current}),
    useSearchSelectionContext: () => ({
        selectedTransactions: mockSelectedTransactions.current,
        excludedTransactions: mockExcludedTransactions.current,
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected.current,
        selectedReports: mockSelectedReports.current,
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

function buildSearchResults(
    currency: string | undefined,
    count = 1,
    total = -100,
    type: SearchResults['search']['type'] = CONST.SEARCH.DATA_TYPES.EXPENSE,
    hasMoreResults = false,
): SearchResults {
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
            hasMoreResults,
            hasResults: true,
        },
        data: {},
    };
}

function buildSelectedTransaction(currency: string, groupCurrency?: string, groupAmount?: number, reportID?: string): SelectedTransactionInfo {
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
        reportID,
        amount: 100,
        displayAmount: 100,
        currency,
        groupCurrency,
        groupAmount,
        isFromOneTransactionReport: false,
    };
}

function buildSelectedReport(reportID: string, total: number): SelectedReports {
    return {
        reportID,
        policyID: undefined,
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        canPay: false,
        canApprove: false,
        canSubmit: false,
        canChangeApprover: false,
        total,
        chatReportID: undefined,
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
        mockSelectedReports.current = [];
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

    it("subtracts an excluded report's expenses and total from the all-matching footer", async () => {
        mockSearchQueryContext.current = {
            currentSearchHash: 1,
            currentSearchKey: undefined,
            currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT},
        };
        mockSelectedTransactions.current = {transaction3: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report2')};
        mockExcludedTransactions.current = {
            transaction1: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1'),
            transaction2: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1'),
        };
        mockSelectedReports.current = [buildSelectedReport('report2', -100)];
        mockAreAllMatchingItemsSelected.current = true;

        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT)} />);
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 8, total: 35800, currency: CONST.CURRENCY.USD}));
    });

    it('shows the authoritative expense count and total before every report page is loaded', async () => {
        mockSearchQueryContext.current = {
            currentSearchHash: 1,
            currentSearchKey: undefined,
            currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT},
        };
        mockSelectedTransactions.current = {transaction1: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1')};
        mockSelectedReports.current = [buildSelectedReport('report1', -100)];
        mockAreAllMatchingItemsSelected.current = true;

        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, true)} />);
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 10, total: 36000, currency: CONST.CURRENCY.USD}));
    });

    it('counts the expenses inside manually selected reports', async () => {
        mockSearchQueryContext.current = {
            currentSearchHash: 1,
            currentSearchKey: undefined,
            currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT},
        };
        mockSelectedTransactions.current = {
            transaction1: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1'),
            transaction2: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1'),
        };
        mockSelectedReports.current = [buildSelectedReport('report1', -200)];

        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT)} />);
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 2, total: 200, currency: CONST.CURRENCY.USD}));
    });

    it('counts and totals the rows of a group checked through its header as the whole group, including the rows not loaded', async () => {
        // Given a group of 692 expenses checked through its header with only two of its rows loaded, next to an expense of another group checked on its own
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}2026_10_07`;
        mockCurrentSearchResults.current = {data: {[groupKey]: {count: 692, total: 12990, currency: CONST.CURRENCY.USD}}};
        mockSelectedTransactions.current = {
            transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), groupKey, isSelectedViaGroup: true},
            transaction2: {...buildSelectedTransaction(CONST.CURRENCY.USD), groupKey, isSelectedViaGroup: true},
            transaction3: {...buildSelectedTransaction(CONST.CURRENCY.USD), groupKey: `${CONST.SEARCH.GROUP_PREFIX}2026_10_03`},
        };

        // When the footer shows that selection, which is short of the 694 matching expenses
        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 694, 13020)} />);
        await waitForBatchedUpdates();

        // Then it counts and totals what an export of the selection covers, which is the whole group plus the other expense
        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 693, total: 13090, currency: CONST.CURRENCY.USD}));
    });

    it('subtracts one expense for a row excluded from Select all after its group was checked through the header', async () => {
        // Given Select all with one row unchecked, where the row still carries the claim of the group header that checked it
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}2026_10_07`;
        mockCurrentSearchResults.current = {data: {[groupKey]: {count: 692, total: 12990, currency: CONST.CURRENCY.USD}}};
        mockSelectedTransactions.current = {};
        mockExcludedTransactions.current = {transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), groupKey, isSelectedViaGroup: true}};
        mockAreAllMatchingItemsSelected.current = true;

        // When the footer shows the selection
        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 694, 13020)} />);
        await waitForBatchedUpdates();

        // Then only that row leaves the count and the total, since the rest of its group stays selected
        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 693, total: 12920, currency: CONST.CURRENCY.USD}));
    });

    describe('a row checked again inside a group excluded whole from Select all', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}2026_10_07`;
        const searchHash = mockSearchQueryContext.current.currentSearchHash;

        beforeEach(() => {
            // Select all over ten expenses, a five-expense group excluded whole, and one of its rows checked again on its own
            mockCurrentSearchResults.current = {data: {[groupKey]: {count: 5, total: 500, currency: CONST.CURRENCY.USD}}};
            mockExcludedTransactions.current = {[groupKey]: {...buildSelectedTransaction(CONST.CURRENCY.USD), displayAmount: 500}};
            mockSelectedTransactions.current = {
                transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), groupKey, transaction: {...createRandomTransaction(1), transactionID: 'transaction1'}},
            };
            mockAreAllMatchingItemsSelected.current = true;
        });

        async function chooseFooterCurrency(currency: string) {
            await act(async () => {
                mockCapturedFooterProps.current?.onCurrencyChange?.(currency);
                await waitForBatchedUpdates();
            });
        }

        it('counts and totals the row alongside the expenses still selected', async () => {
            // Given the selection above

            // When the footer shows it
            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 1000)} />);
            await waitForBatchedUpdates();

            // Then the row is back in the count and the total, as its checkbox shows, rather than going with its group's exclusion
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 6, total: 600, currency: CONST.CURRENCY.USD}));
        });

        it('adds the row back to a total converted to another currency', async () => {
            // Given converted figures for the whole search, the excluded group and the row, each still matching the figures it was converted from
            await Onyx.merge(ONYXKEYS.SEARCH_FOOTER_CONVERSION, {
                searchTotals: {[searchHash]: {[CONST.CURRENCY.EUR]: {count: 10, total: 2000}}},
                groups: {[groupKey]: {[CONST.CURRENCY.EUR]: -1000}},
                transactions: {transaction1: {[CONST.CURRENCY.EUR]: -200}},
                sources: {
                    searchTotals: {[searchHash]: {[CONST.CURRENCY.EUR]: 1000}},
                    groups: {[groupKey]: {[CONST.CURRENCY.EUR]: -500}},
                    transactions: {transaction1: {[CONST.CURRENCY.EUR]: -100}},
                },
            });
            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 1000)} />);
            await waitForBatchedUpdates();

            // When the footer is switched to that currency
            await chooseFooterCurrency(CONST.CURRENCY.EUR);

            // Then the row's converted amount comes back into the converted total
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 6, total: 1200, currency: CONST.CURRENCY.EUR}));
        });

        it('converts the row as well before showing a converted total', async () => {
            // Given converted figures for the whole search and the excluded group, but none yet for the row
            await Onyx.merge(ONYXKEYS.SEARCH_FOOTER_CONVERSION, {
                searchTotals: {[searchHash]: {[CONST.CURRENCY.EUR]: {count: 10, total: 2000}}},
                groups: {[groupKey]: {[CONST.CURRENCY.EUR]: -1000}},
                sources: {searchTotals: {[searchHash]: {[CONST.CURRENCY.EUR]: 1000}}, groups: {[groupKey]: {[CONST.CURRENCY.EUR]: -500}}},
            });
            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 1000)} />);
            await waitForBatchedUpdates();

            // When the footer is switched to that currency
            await chooseFooterCurrency(CONST.CURRENCY.EUR);

            // Then the row's conversion is requested, and the footer stays on the default currency until it arrives rather than mixing the two
            expect(getFooterConvertedAmounts).toHaveBeenCalledWith(expect.objectContaining({targetCurrency: CONST.CURRENCY.EUR, transactionIDList: 'transaction1'}));
            expect(mockCapturedFooterProps.current?.currency).toBe(CONST.CURRENCY.USD);
        });
    });

    it('does not request the same report conversion twice before the optimistic source stamp is observed', async () => {
        mockSearchQueryContext.current = {
            currentSearchHash: 1,
            currentSearchKey: undefined,
            currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT},
        };
        mockSelectedTransactions.current = {transaction2: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report2')};
        mockExcludedTransactions.current = {
            transaction1: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1'),
        };
        mockSelectedReports.current = [buildSelectedReport('report2', -100)];
        mockAreAllMatchingItemsSelected.current = true;
        const searchResults = buildSearchResults(CONST.CURRENCY.USD, 2, 200, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);
        const {rerender} = render(<SearchSelectionFooter searchResults={searchResults} />);
        await waitForBatchedUpdates();

        await act(async () => {
            mockCapturedFooterProps.current?.onCurrencyChange?.(CONST.CURRENCY.EUR);
            await waitForBatchedUpdates();
        });

        // Reconciliation can provide an equivalent selectedReports array before Onyx publishes the optimistic source
        // stamp. That render must not issue the same report conversion again.
        mockSelectedReports.current = [...mockSelectedReports.current];
        rerender(<SearchSelectionFooter searchResults={searchResults} />);
        await waitForBatchedUpdates();

        const reportConversionCalls = jest.mocked(getFooterConvertedAmounts).mock.calls.filter(([params]) => params.reportIDList === 'report1');
        expect(reportConversionCalls).toHaveLength(1);
        expect(reportConversionCalls.at(0)?.at(0)).toEqual(
            expect.objectContaining({
                targetCurrency: CONST.CURRENCY.EUR,
                sources: {reports: {report1: {[CONST.CURRENCY.EUR]: -100}}},
            }),
        );
    });

    it('nets a selected credit against a selected expense instead of summing their magnitudes', async () => {
        mockSelectedTransactions.current = {
            transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), displayAmount: 10000},
            transaction2: {...buildSelectedTransaction(CONST.CURRENCY.USD), displayAmount: -10000},
        };

        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 5)} />);
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 2, total: 0}));
    });

    it('nets a selected credit against a selected expense when the amounts differ', async () => {
        mockSelectedTransactions.current = {
            transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), displayAmount: 10000},
            transaction2: {...buildSelectedTransaction(CONST.CURRENCY.USD), displayAmount: -4000},
        };

        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 5)} />);
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 2, total: 6000}));
    });

    it('adds back an excluded credit rather than subtracting it from the server total', async () => {
        // The server total already counts the credit as -$100, so dropping it from the selection raises the total.
        mockSelectedTransactions.current = {};
        mockExcludedTransactions.current = {transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), displayAmount: -10000}};
        mockAreAllMatchingItemsSelected.current = true;

        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 172, 36000)} />);
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 171, total: 46000, currency: CONST.CURRENCY.USD}));
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
});
