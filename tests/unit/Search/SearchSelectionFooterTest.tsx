import {act, render} from '@testing-library/react-native';

import SearchSelectionFooter, {resetAnsweredFooterTotalsForTesting} from '@components/Search/SearchSelectionFooter';
import type {SearchFooterCount, SearchFooterTotal, SearchQueryJSON, SelectedReports, SelectedTransactionInfo, SelectedTransactions} from '@components/Search/types';

import {getFooterConvertedAmounts} from '@libs/actions/Search';
import {buildSearchQueryJSON, isSearchQuerySavable} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';
import createMock from '../../utils/createMock';
import {makeSettlementGroup} from '../../utils/ExpensifyCardStatementTestUtils';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const mockIsOffline = {current: false};
jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline.current}));

jest.mock('@hooks/useSearchShouldCalculateTotals', () => jest.fn(() => true));

const mockIsFooterSelectorsBetaEnabled = {current: true};
jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({
        isBetaEnabled: (beta: string) => (beta === 'spendFooterSelectors' ? mockIsFooterSelectorsBetaEnabled.current : false),
        isBetaEnabledOrUnknown: () => false,
    }),
}));

const mockSearch = jest.fn<Promise<void> | undefined, unknown[]>();
jest.mock('@libs/actions/Search', () => ({
    openSearchCardFiltersPage: jest.fn(),
    getFooterConvertedAmounts: jest.fn(),
    search: (...args: unknown[]) => mockSearch(...args),
}));

const mockSetParams = jest.fn<void, [{q?: string; rawQuery?: string}]>();
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    // Called through a wrapper: the factory runs before the mock above is initialized.
    default: {setParams: (params: {q?: string; rawQuery?: string}) => mockSetParams(params)},
}));

// The real one waits for the popover to close first. The callback is all these tests care about.
jest.mock('@libs/actions/Modal', () => ({
    close: (onModalClose: () => void) => onModalClose(),
}));

type MockSearchQueryContext = {
    currentSearchHash: number;
    currentSearchKey: undefined;
    currentSearchQueryJSON: Readonly<SearchQueryJSON> | undefined;
};

const mockSearchQueryContext: {current: MockSearchQueryContext} = {
    current: {currentSearchHash: 1, currentSearchKey: undefined, currentSearchQueryJSON: buildSearchQueryJSON('type:expense')},
};

// The footer reads its selections out of the query's filters, so tests drive it with real parsed queries. The hash is
// kept separate from the query's own: the snapshot the footer displays is stamped with hash 1 throughout, and a
// mismatch between the two is what tells the footer a re-run is in flight.
function setSearchQuery(query: string, currentSearchHash = 1) {
    mockSearchQueryContext.current = {currentSearchHash, currentSearchKey: undefined, currentSearchQueryJSON: buildSearchQueryJSON(query)};
}
const mockSelectedTransactions: {current: SelectedTransactions} = {current: {}};
const mockExcludedTransactions: {current: SelectedTransactions} = {current: {}};
const mockSelectedReports: {current: SelectedReports[]} = {current: []};
const mockAreAllMatchingItemsSelected = {current: false};
// The loaded rows of each report, which is what tells a report excluded down to its last row from a part-excluded one.
const mockTransactionsByReportID: {current: Map<string, Array<{transactionID: string}>>} = {current: new Map()};
const mockShouldUseLiveData = {current: false};
const mockCurrentSearchResults: {current: SearchResults | undefined} = {current: undefined};
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => mockSearchQueryContext.current,
    useSearchResultsContext: () => ({
        currentSearchResults: mockCurrentSearchResults.current,
        currentSearchTransactionsByReportID: mockTransactionsByReportID.current,
        shouldUseLiveData: mockShouldUseLiveData.current,
    }),
    useSearchSelectionContext: () => ({
        selectedTransactions: mockSelectedTransactions.current,
        excludedTransactions: mockExcludedTransactions.current,
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected.current,
        selectedReports: mockSelectedReports.current,
    }),
}));

type CapturedFooterProps = {
    count?: number;
    countType?: SearchFooterCount;
    defaultCountType?: SearchFooterCount;
    total?: number;
    totalType?: SearchFooterTotal;
    isTotalLoading?: boolean;
    shouldShowTotalSelector?: boolean;
    defaultCurrency?: string;
    currency?: string;
    onCurrencyChange?: (currency: string) => void;
    onCountChange?: (countType: SearchFooterCount) => void;
    onTotalChange?: (totalType: SearchFooterTotal) => void;
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
    reportCount: number | undefined = undefined,
    hasMoreResults = false,
): SearchResults {
    return {
        search: {
            count,
            reportCount,
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

// An expense of `amount`, carrying the flags the total aggregates classify on. Expenses display as a negative amount,
// and the footer totals the displayed amounts, so a selection of expenses sums to a negative figure.
function buildFlaggedTransaction(amount: number, flags: {reimbursable?: boolean; billable?: boolean}): SelectedTransactionInfo {
    return {
        ...buildSelectedTransaction(CONST.CURRENCY.USD),
        amount,
        displayAmount: -amount,
        // The aggregates classify on the row's own transaction, which is what the search list attaches to a selection.
        transaction: {...createRandomTransaction(amount), reimbursable: flags.reimbursable, billable: flags.billable},
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
        mockIsFooterSelectorsBetaEnabled.current = true;
        mockShouldUseLiveData.current = false;
        mockIsOffline.current = false;
        resetAnsweredFooterTotalsForTesting();
        setSearchQuery('type:expense');
        mockSelectedTransactions.current = {transaction1: buildSelectedTransaction(SELECTED_EXPENSE_CURRENCY)};
        mockExcludedTransactions.current = {};
        mockSelectedReports.current = [];
        mockAreAllMatchingItemsSelected.current = false;
        mockTransactionsByReportID.current = new Map();
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
        setSearchQuery('type:expense-report footerCount:expenses');
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

    it('takes a report the user unchecked off the report count of a select-all', async () => {
        // Given a select-all over more reports than are loaded, which is the only way the footer is on the server's count
        setSearchQuery('type:expense-report footerCount:reports');
        mockSelectedTransactions.current = {};
        mockTransactionsByReportID.current = new Map([
            ['report1', [{transactionID: 'transaction1'}, {transactionID: 'transaction2'}]],
            ['report2', [{transactionID: 'transaction3'}]],
        ]);
        mockAreAllMatchingItemsSelected.current = true;

        // When one report is unchecked, which excludes every expense it holds
        mockExcludedTransactions.current = {
            transaction1: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1'),
            transaction2: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1'),
        };

        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, 87)} />);
        await waitForBatchedUpdates();

        // Then it comes off the server's whole-search report count
        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, count: 86}));
    });

    it('takes an empty report the user unchecked off the report count of a select-all', async () => {
        // Given a select-all over more reports than are loaded, with an empty draft report among them
        setSearchQuery('type:expense-report footerCount:reports');
        mockSelectedTransactions.current = {};
        mockTransactionsByReportID.current = new Map([['report1', [{transactionID: 'transaction1'}]]]);
        mockAreAllMatchingItemsSelected.current = true;

        // When the empty report is unchecked, which excludes it under its own report key since it holds no expense
        mockExcludedTransactions.current = {report2: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, 0, 'report2')};

        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, 87)} />);
        await waitForBatchedUpdates();

        // Then it comes off the server's whole-search report count like any other report
        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, count: 86}));
    });

    it('keeps a part-unchecked report in the report count, since the selection still covers it', async () => {
        // Given the same select-all, with only one of a report's two expenses unchecked
        setSearchQuery('type:expense-report footerCount:reports');
        mockSelectedTransactions.current = {};
        mockTransactionsByReportID.current = new Map([['report1', [{transactionID: 'transaction1'}, {transactionID: 'transaction2'}]]]);
        mockAreAllMatchingItemsSelected.current = true;
        mockExcludedTransactions.current = {transaction1: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1')};

        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, 87)} />);
        await waitForBatchedUpdates();

        // Then the report still counts, because the selection still holds its other expense
        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, count: 87}));
    });

    it('shows the authoritative expense count and total before every report page is loaded', async () => {
        setSearchQuery('type:expense-report');
        mockSelectedTransactions.current = {transaction1: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1')};
        mockSelectedReports.current = [buildSelectedReport('report1', -100)];
        mockAreAllMatchingItemsSelected.current = true;

        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, undefined, true)} />);
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 10, total: 36000, currency: CONST.CURRENCY.USD}));
    });

    it('counts manually selected reports, and their expenses once the count selector says so', async () => {
        // Two expenses of one report: one report, two expenses. A Reports search counts reports unless told otherwise.
        setSearchQuery('type:expense-report');
        mockSelectedTransactions.current = {
            transaction1: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1'),
            transaction2: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1'),
        };
        mockSelectedReports.current = [buildSelectedReport('report1', -200)];

        const {rerender} = render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT)} />);
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, count: 1, total: 200, currency: CONST.CURRENCY.USD}));

        setSearchQuery('type:expense-report footerCount:expenses');
        rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT)} />);
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.EXPENSES, count: 2, total: 200, currency: CONST.CURRENCY.USD}));
    });

    it('does not request the same report conversion twice before the optimistic source stamp is observed', async () => {
        setSearchQuery('type:expense-report');
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

    it('subtracts only the matching part of a report excluded under a breakdown in another currency', async () => {
        // Given a select-all on the Reports search, on the reimbursable breakdown in EUR, with its converted total fresh
        setSearchQuery(`type:expense-report footerTotal:${CONST.SEARCH.FOOTER_TOTAL.REIMBURSABLE} footerCurrency:${CONST.CURRENCY.EUR}`);
        mockSelectedTransactions.current = {};
        mockAreAllMatchingItemsSelected.current = true;

        // When a report holding $60 reimbursable and $40 non-reimbursable is unchecked, with its whole EUR total cached
        mockExcludedTransactions.current = {
            transaction1: {...buildFlaggedTransaction(-6000, {reimbursable: true}), reportID: 'report1'},
            transaction2: {...buildFlaggedTransaction(-4000, {reimbursable: false}), reportID: 'report1'},
        };
        const searchHash = mockSearchQueryContext.current.currentSearchHash;
        await Onyx.merge(ONYXKEYS.SEARCH_FOOTER_CONVERSION, {
            searchTotals: {[searchHash]: {[CONST.CURRENCY.EUR]: {count: 10, total: 30000}}},
            reports: {report1: {[CONST.CURRENCY.EUR]: -9000}},
            sources: {searchTotals: {[searchHash]: {[CONST.CURRENCY.EUR]: 36000}}, reports: {report1: {[CONST.CURRENCY.EUR]: -10000}}},
        });

        render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, 87)} />);
        await waitForBatchedUpdates();

        // Then only its reimbursable $60 comes off, in the default currency, since the report's EUR total has no breakdown
        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({total: 30000, currency: CONST.CURRENCY.USD, isTotalLoading: false}));
    });

    describe('a collapsed group unchecked under a select-all', () => {
        const GROUP_KEY = `${CONST.SEARCH.GROUP_PREFIX}travel` as const;

        const renderWithExcludedGroup = async (query: string) => {
            // Given a select-all on a grouped search, with a collapsed group of three expenses unchecked as one entry
            setSearchQuery(query);
            mockSelectedTransactions.current = {};
            mockAreAllMatchingItemsSelected.current = true;
            mockExcludedTransactions.current = {[GROUP_KEY]: buildSelectedTransaction(CONST.CURRENCY.USD, CONST.CURRENCY.USD, -50000)};
            const searchResults = buildSearchResults(CONST.CURRENCY.USD, 172, 80000, CONST.SEARCH.DATA_TYPES.EXPENSE, undefined, true);
            mockCurrentSearchResults.current = {...searchResults, data: {[GROUP_KEY]: makeSettlementGroup({count: 3, total: 50000})}};

            render(<SearchSelectionFooter searchResults={searchResults} />);
            await waitForBatchedUpdates();
        };

        it('shows no total under a breakdown, since none of the group can be told apart by it', async () => {
            // When the footer describes the reimbursable breakdown
            await renderWithExcludedGroup(`type:expense group-by:category footerTotal:${CONST.SEARCH.FOOTER_TOTAL.REIMBURSABLE}`);

            // Then the group still comes off the count, but no figure is shown that would still include it
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 169, total: undefined}));
        });

        it('keeps the total selector under a breakdown, so the plain total can still be picked', async () => {
            // When the footer describes the reimbursable breakdown, which leaves it no figure to show
            await renderWithExcludedGroup(`type:expense group-by:category footerTotal:${CONST.SEARCH.FOOTER_TOTAL.REIMBURSABLE}`);

            // Then the selector stays, instead of leaving the footer on a breakdown it cannot switch away from
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.REIMBURSABLE, shouldShowTotalSelector: true}));
        });

        it('hides the total selector for the excluded group on the plain total, as for any group selection', async () => {
            // When the footer describes the plain total
            await renderWithExcludedGroup('type:expense group-by:category');

            // Then the group selection keeps the selector out, as before
            expect(mockCapturedFooterProps.current?.shouldShowTotalSelector).toBe(false);
        });

        it('still takes the group off the plain total', async () => {
            // When the footer describes the plain total
            await renderWithExcludedGroup('type:expense group-by:category');

            // Then the group's whole amount comes off, as before
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 169, total: 30000}));
        });
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

    describe('total selector', () => {
        it('defaults to the plain total spend and reads the aggregate the query selects', async () => {
            mockSelectedTransactions.current = {};

            const {rerender} = render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.TOTAL, total: 36000}));

            setSearchQuery('type:expense footerTotal:reimbursable');
            // The backend swaps the aggregate into `total` itself, so the footer just displays the total it was sent.
            const searchResults = buildSearchResults(CONST.CURRENCY.USD, 10, 12000);

            rerender(<SearchSelectionFooter searchResults={searchResults} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.REIMBURSABLE, total: 12000}));
        });

        it('falls back to the plain total when the backend answers with the aggregate in `total` instead of its own field', async () => {
            setSearchQuery('type:expense footerTotal:billable');
            mockSelectedTransactions.current = {};

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 4200)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current?.total).toBe(4200);
        });

        it('hides a total offline once the breakdown has moved on from the one it was answered for', async () => {
            // Given a billable total answered online
            setSearchQuery('type:expense footerTotal:billable');
            mockSelectedTransactions.current = {};
            const {rerender} = render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 229)} />);
            await waitForBatchedUpdates();
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.BILLABLE, total: 229}));

            // When offline, the query moves to the plain total
            mockIsOffline.current = true;
            setSearchQuery('type:expense');
            rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 229)} />);
            await waitForBatchedUpdates();

            // Then the billable figure is not shown as "Total spend"
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.TOTAL, total: undefined}));
        });

        it('shows the plain total offline from when it was last answered, instead of hiding it', async () => {
            // Given the plain total answered online, then the billable one, on the same search
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {};
            const {rerender} = render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 342)} />);
            await waitForBatchedUpdates();
            setSearchQuery('type:expense footerTotal:billable');
            rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 229)} />);
            await waitForBatchedUpdates();

            // When offline, back to the plain total, on a snapshot still holding 229
            mockIsOffline.current = true;
            setSearchQuery('type:expense');
            rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 229)} />);
            await waitForBatchedUpdates();

            // Then the earlier plain total is shown
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.TOTAL, total: 342}));
        });

        it('never shows another account its recorded totals', async () => {
            // Given the plain total and then the billable one answered online for this account
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {};
            const first = render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 342)} />);
            await waitForBatchedUpdates();
            setSearchQuery('type:expense footerTotal:billable');
            first.rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 229)} />);
            await waitForBatchedUpdates();
            first.unmount();

            // When another account signs in and, offline, opens the plain total on the same query, whose snapshot is
            // stamped for billable
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID + 1});
            mockIsOffline.current = true;
            setSearchQuery('type:expense');
            const billableSnapshot = buildSearchResults(CONST.CURRENCY.USD, 10, 229);
            billableSnapshot.search.footerTotal = CONST.SEARCH.FOOTER_TOTAL.BILLABLE;
            render(<SearchSelectionFooter searchResults={billableSnapshot} />);
            await waitForBatchedUpdates();

            // Then the first account's plain total is not shown to it
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.TOTAL, total: undefined}));
        });

        it('keeps showing it after another tab remounts the footer', async () => {
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {};
            const first = render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 342)} />);
            await waitForBatchedUpdates();
            setSearchQuery('type:expense footerTotal:billable');
            first.rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 229)} />);
            await waitForBatchedUpdates();

            // When remounted offline on the plain query
            first.unmount();
            mockIsOffline.current = true;
            setSearchQuery('type:expense');
            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 229)} />);
            await waitForBatchedUpdates();

            // Then both answers survived the remount
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.TOTAL, total: 342}));
        });

        it('keeps both answers when a search response sets the snapshot between them', async () => {
            // Given the plain total, then a Billable response that replaces the snapshot
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {};
            const {rerender} = render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 342)} />);
            await waitForBatchedUpdates();
            setSearchQuery('type:expense footerTotal:billable');
            rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 229)} />);
            await waitForBatchedUpdates();

            // When offline, back to the plain total
            mockIsOffline.current = true;
            setSearchQuery('type:expense');
            rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 229)} />);
            await waitForBatchedUpdates();

            // Then the plain answer survived, since it is not stored on the snapshot
            expect(mockCapturedFooterProps.current?.total).toBe(342);
        });

        it('shows the total again once back online, where the query change refreshes it', async () => {
            // Given the stale state above
            setSearchQuery('type:expense footerTotal:billable');
            mockSelectedTransactions.current = {};
            const {rerender} = render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 229)} />);
            await waitForBatchedUpdates();
            mockIsOffline.current = true;
            setSearchQuery('type:expense');
            rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 229)} />);
            await waitForBatchedUpdates();

            // When the network returns and the refreshed plain total lands
            mockIsOffline.current = false;
            rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 342)} />);
            await waitForBatchedUpdates();

            // Then it is shown again
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.TOTAL, total: 342}));
        });

        it('asks nothing of the backend for a breakdown switched to offline, leaving the recorded figure in place', async () => {
            // Given the plain total answered online
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {};
            const {rerender} = render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 342)} />);
            await waitForBatchedUpdates();

            // When billable is picked offline
            mockIsOffline.current = true;
            rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 342)} />);
            await waitForBatchedUpdates();
            await act(async () => {
                mockCapturedFooterProps.current?.onTotalChange?.(CONST.SEARCH.FOOTER_TOTAL.BILLABLE);
                await waitForBatchedUpdates();
            });

            // Then no request is sent, since none could be answered, so the footer is not left waiting on one
            expect(mockSearch).not.toHaveBeenCalled();
            expect(mockCapturedFooterProps.current?.isTotalLoading).toBe(false);
        });

        it('hides a total offline after a reload when the snapshot is stamped for another breakdown', async () => {
            // Given a reload offline, which empties the recorded answers, over a snapshot whose total answers billable
            mockIsOffline.current = true;
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {};
            const billableResults = buildSearchResults(CONST.CURRENCY.USD, 10, 229);
            billableResults.search.footerTotal = CONST.SEARCH.FOOTER_TOTAL.BILLABLE;

            render(<SearchSelectionFooter searchResults={billableResults} />);
            await waitForBatchedUpdates();

            // Then the billable figure is not shown as "Total spend"
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.TOTAL, total: undefined}));
        });

        it('shows a total offline after a reload when the snapshot is stamped for the breakdown on display', async () => {
            // Given a reload offline over a snapshot whose total answers the plain total
            mockIsOffline.current = true;
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {};
            const plainResults = buildSearchResults(CONST.CURRENCY.USD, 10, 342);
            plainResults.search.footerTotal = CONST.SEARCH.FOOTER_TOTAL.TOTAL;

            render(<SearchSelectionFooter searchResults={plainResults} />);
            await waitForBatchedUpdates();

            // Then its figure is shown
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.TOTAL, total: 342}));
        });

        it('keeps a total offline when the breakdown is the one it was answered for', async () => {
            setSearchQuery('type:expense footerTotal:billable');
            mockSelectedTransactions.current = {};
            const {rerender} = render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 229)} />);
            await waitForBatchedUpdates();

            mockIsOffline.current = true;
            rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 229)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.BILLABLE, total: 229}));
        });

        it('offers no total selector on a search type that keeps no footer selection', async () => {
            // Given an invoice search with totals, where footer selections are not kept
            setSearchQuery('type:invoice');
            mockSelectedTransactions.current = {};

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.INVOICE)} />);
            await waitForBatchedUpdates();

            // Then the footer keeps the plain total with no selector, as on main
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({shouldShowTotalSelector: false, totalType: undefined}));
        });

        it('offers no total selector on an empty result set', async () => {
            mockSelectedTransactions.current = {};

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 0, 0)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current?.totalType).toBeUndefined();
        });

        it('asks the backend for the new aggregate itself, against the search the list is already reading', async () => {
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {};
            const beforeHash = mockSearchQueryContext.current.currentSearchQueryJSON?.hash;

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000)} />);
            await waitForBatchedUpdates();

            await act(async () => {
                mockCapturedFooterProps.current?.onTotalChange?.(CONST.SEARCH.FOOTER_TOTAL.REIMBURSABLE);
                await waitForBatchedUpdates();
            });

            // The choice goes into the query, which saves it for the next visit...
            const nextQuery = mockSetParams.mock.calls.at(0)?.at(0)?.q ?? '';
            expect(nextQuery).toContain('footerTotal:reimbursable');
            // ...and the hash holds, so the list keeps its rows, its pages and its selection.
            expect(buildSearchQueryJSON(nextQuery)?.hash).toBe(beforeHash);

            // Nothing re-runs the search on a hash that did not move, so the footer asks for the aggregate itself.
            expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({shouldCalculateTotals: true, queryJSON: expect.objectContaining({hash: beforeHash})}));
        });

        it('skeletons the total while the aggregate it asked for is on its way, leaving the count alone', async () => {
            // Given the footer describing the whole search
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {};
            let resolveSearch: () => void = () => {};
            mockSearch.mockImplementation(
                () =>
                    new Promise<void>((resolve) => {
                        resolveSearch = resolve;
                    }),
            );

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 4)} />);
            await waitForBatchedUpdates();

            // Then nothing is waited on until the footer asks for something
            expect(mockCapturedFooterProps.current?.isTotalLoading).toBe(false);

            // When a different total is applied, which the footer asks the backend for
            await act(async () => {
                mockCapturedFooterProps.current?.onTotalChange?.(CONST.SEARCH.FOOTER_TOTAL.BILLABLE);
                await waitForBatchedUpdates();
            });

            // Then the skeleton stands in for the figure it cannot describe yet, and the count holds its value
            expect(mockCapturedFooterProps.current?.isTotalLoading).toBe(true);
            expect(mockCapturedFooterProps.current?.count).toBe(10);

            // When the request answers
            await act(async () => {
                resolveSearch();
                await waitForBatchedUpdates();
            });

            // Then the skeleton gives way to the figure
            expect(mockCapturedFooterProps.current?.isTotalLoading).toBe(false);
        });

        it('asks again for a breakdown the snapshot total does not answer, holding the skeleton until it does', async () => {
            // Given the footer on non-billable, over a snapshot whose total last answered billable, as when the
            // non-billable request was dropped or overtaken by the billable one
            const nonBillableQuery = `type:expense footerTotal:${CONST.SEARCH.FOOTER_TOTAL.NON_BILLABLE}`;
            setSearchQuery(nonBillableQuery);
            mockSelectedTransactions.current = {};
            const billableResults = buildSearchResults(CONST.CURRENCY.USD, 10, 36000);
            billableResults.search.footerTotal = CONST.SEARCH.FOOTER_TOTAL.BILLABLE;

            const {rerender} = render(<SearchSelectionFooter searchResults={billableResults} />);
            await waitForBatchedUpdates();

            // Then the billable figure is never shown under the non-billable label, and the footer asks for non-billable
            expect(mockCapturedFooterProps.current?.isTotalLoading).toBe(true);
            expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({shouldCalculateTotals: true, queryJSON: expect.objectContaining({inputQuery: nonBillableQuery})}));

            // When the non-billable answer lands
            const nonBillableResults = buildSearchResults(CONST.CURRENCY.USD, 10, 12000);
            nonBillableResults.search.footerTotal = CONST.SEARCH.FOOTER_TOTAL.NON_BILLABLE;
            rerender(<SearchSelectionFooter searchResults={nonBillableResults} />);
            await waitForBatchedUpdates();

            // Then its figure is shown
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({isTotalLoading: false, total: 12000}));
        });

        it('shows a snapshot total that answers the breakdown on display without asking again', async () => {
            // Given the footer on billable, over a snapshot whose total answers billable
            setSearchQuery(`type:expense footerTotal:${CONST.SEARCH.FOOTER_TOTAL.BILLABLE}`);
            mockSelectedTransactions.current = {};
            const billableResults = buildSearchResults(CONST.CURRENCY.USD, 10, 36000);
            billableResults.search.footerTotal = CONST.SEARCH.FOOTER_TOTAL.BILLABLE;

            render(<SearchSelectionFooter searchResults={billableResults} />);
            await waitForBatchedUpdates();

            // Then the figure is shown and nothing is asked for
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({isTotalLoading: false, total: 36000}));
            expect(mockSearch).not.toHaveBeenCalled();
        });

        it('never waits on a search for a to-do search, whose totals are summed from live data', async () => {
            // Given a to-do search (e.g. Drafts), whose results are built from live Onyx data and carry no snapshot
            // hash a wait could ever end on
            mockShouldUseLiveData.current = true;
            setSearchQuery('type:expense', 2);
            mockSelectedTransactions.current = {};

            const {rerender} = render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 4)} />);
            await waitForBatchedUpdates();

            // When a different total is applied and the query moves onto its own hash
            await act(async () => {
                mockCapturedFooterProps.current?.onTotalChange?.(CONST.SEARCH.FOOTER_TOTAL.BILLABLE);
                await waitForBatchedUpdates();
            });
            const nextQuery = mockSetParams.mock.calls.at(0)?.at(0)?.q ?? '';
            const nextHash = buildSearchQueryJSON(nextQuery)?.hash ?? 0;
            setSearchQuery(nextQuery, nextHash);
            // Live results keep the hash they were stamped with, so it never catches up to the query's
            rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 4)} />);
            await waitForBatchedUpdates();

            // Then the figure is shown straight away instead of a skeleton that could never resolve
            expect(mockCapturedFooterProps.current?.isTotalLoading).toBe(false);
            expect(nextQuery).toContain('footerTotal:billable');
        });

        it('leaves the total alone while a search the footer did not ask for runs, so it does not flicker', async () => {
            // A select-all re-requests the same totals it is already displaying, and a sort keeps the previous figures.
            setSearchQuery('type:expense', 2);
            mockSelectedTransactions.current = {};

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 4)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current?.isTotalLoading).toBe(false);
        });
    });

    describe('total selector over a selection', () => {
        beforeEach(() => {
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {
                reimbursable1: buildFlaggedTransaction(100, {reimbursable: true, billable: true}),
                reimbursable2: buildFlaggedTransaction(200, {reimbursable: true, billable: false}),
                nonReimbursable1: buildFlaggedTransaction(300, {reimbursable: false, billable: false}),
            };
        });

        async function renderWithTotal(totalType: SearchFooterTotal) {
            setSearchQuery(`type:expense footerTotal:${totalType}`);
            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000)} />);
            await waitForBatchedUpdates();
            return mockCapturedFooterProps.current;
        }

        it('sums every selected expense for the plain total', async () => {
            expect(await renderWithTotal(CONST.SEARCH.FOOTER_TOTAL.TOTAL)).toEqual(expect.objectContaining({total: -600}));
        });

        it('sums only the reimbursable selected expenses', async () => {
            expect(await renderWithTotal(CONST.SEARCH.FOOTER_TOTAL.REIMBURSABLE)).toEqual(expect.objectContaining({total: -300}));
        });

        it('sums only the non-reimbursable selected expenses', async () => {
            expect(await renderWithTotal(CONST.SEARCH.FOOTER_TOTAL.NON_REIMBURSABLE)).toEqual(expect.objectContaining({total: -300}));
        });

        it('sums only the billable selected expenses', async () => {
            expect(await renderWithTotal(CONST.SEARCH.FOOTER_TOTAL.BILLABLE)).toEqual(expect.objectContaining({total: -100}));
        });

        it('sums only the non-billable selected expenses', async () => {
            expect(await renderWithTotal(CONST.SEARCH.FOOTER_TOTAL.NON_BILLABLE)).toEqual(expect.objectContaining({total: -500}));
        });

        it('labels a breakdown of selected reports in the default currency, since a Reports search converts by report', async () => {
            setSearchQuery(`type:expense-report footerTotal:${CONST.SEARCH.FOOTER_TOTAL.REIMBURSABLE}`);
            mockSelectedTransactions.current = {reimbursable1: buildFlaggedTransaction(100, {reimbursable: true})};

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT)} />);
            await waitForBatchedUpdates();

            await act(async () => {
                mockCapturedFooterProps.current?.onCurrencyChange?.(CONST.CURRENCY.EUR);
                await waitForBatchedUpdates();
            });

            // A per-report converted total has no breakdown inside it, and the reports' expenses are not converted
            // individually, so the figure stays in the currency it is actually denominated in.
            expect(mockCapturedFooterProps.current?.currency).not.toBe(CONST.CURRENCY.EUR);
        });

        it('stores a total applied over a selection in the query, which is what the sum then follows', async () => {
            // Given a hand-picked selection of three expenses, one of them billable
            setSearchQuery('type:expense');
            const {rerender} = render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000)} />);
            await waitForBatchedUpdates();

            // When Billable is applied
            await act(async () => {
                mockCapturedFooterProps.current?.onTotalChange?.(CONST.SEARCH.FOOTER_TOTAL.BILLABLE);
                await waitForBatchedUpdates();
            });

            // Then the choice goes into the query like any other, so it survives a reload and a saved search, without
            // asking the backend for anything: the sum is the client's own
            const nextQuery = mockSetParams.mock.calls.at(0)?.at(0)?.q ?? '';
            expect(nextQuery).toContain('footerTotal:billable');
            expect(mockSearch).not.toHaveBeenCalled();

            // And once the app is on that query, the selection is summed by it: one of the three is billable
            setSearchQuery(nextQuery);
            rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000)} />);
            await waitForBatchedUpdates();
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.BILLABLE, total: -100}));
        });

        it('counts a row with no reimbursable flag as reimbursable, the same as its own column renders it', async () => {
            mockSelectedTransactions.current = {
                flagless: buildFlaggedTransaction(100, {}),
                nonReimbursable: buildFlaggedTransaction(200, {reimbursable: false}),
            };

            expect(await renderWithTotal(CONST.SEARCH.FOOTER_TOTAL.REIMBURSABLE)).toEqual(expect.objectContaining({total: -100}));
            expect(await renderWithTotal(CONST.SEARCH.FOOTER_TOTAL.NON_REIMBURSABLE)).toEqual(expect.objectContaining({total: -200}));
        });

        it('shows zero when no selected expense matches the total, rather than hiding the option', async () => {
            mockSelectedTransactions.current = {
                nonBillable1: buildFlaggedTransaction(100, {reimbursable: true, billable: false}),
                nonBillable2: buildFlaggedTransaction(200, {reimbursable: true, billable: false}),
            };

            expect(await renderWithTotal(CONST.SEARCH.FOOTER_TOTAL.BILLABLE)).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.BILLABLE, total: 0}));
        });
    });

    describe('currency selector', () => {
        it('converts through GetTransactionsConvertedAmount and carries the choice in the query, without re-running the search', async () => {
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {};

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000)} />);
            await waitForBatchedUpdates();

            await act(async () => {
                mockCapturedFooterProps.current?.onCurrencyChange?.(CONST.CURRENCY.EUR);
                await waitForBatchedUpdates();
            });

            // Search ignores footerCurrency, so the conversion is requested separately...
            expect(getFooterConvertedAmounts).toHaveBeenCalledWith(expect.objectContaining({targetCurrency: CONST.CURRENCY.EUR}));
            // ...while the query carries the choice so it survives a reload, with no results reload of its own.
            expect(mockSetParams.mock.calls.at(0)?.at(0)?.q).toContain('footerCurrency:EUR');
        });

        it('leaves the default currency out of the query, so a Reset no longer offers to save the search', async () => {
            // Given a search whose footer was switched to EUR
            setSearchQuery(`type:expense footerCurrency:${CONST.CURRENCY.EUR}`);
            mockSelectedTransactions.current = {};
            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000)} />);
            await waitForBatchedUpdates();
            const defaultCurrency = mockCapturedFooterProps.current?.defaultCurrency ?? '';

            // When the currency is reset, which picks the default currency explicitly
            await act(async () => {
                mockCapturedFooterProps.current?.onCurrencyChange?.(defaultCurrency);
                await waitForBatchedUpdates();
            });

            // Then the query carries no currency, so it matches the default search and the Save button goes away
            const nextQuery = mockSetParams.mock.calls.at(-1)?.at(0)?.q ?? '';
            expect(nextQuery).not.toContain('footerCurrency');
            expect(isSearchQuerySavable(buildSearchQueryJSON(nextQuery), buildSearchQueryJSON('type:expense'))).toBe(false);
        });

        it('keeps converting to the reset currency once the query lands without one', async () => {
            // Given a search on EUR whose snapshot is still in another currency than the default it resets to
            setSearchQuery(`type:expense footerCurrency:${CONST.CURRENCY.EUR}`);
            mockSelectedTransactions.current = {};
            const {rerender} = render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000)} />);
            await waitForBatchedUpdates();
            const defaultCurrency = mockCapturedFooterProps.current?.defaultCurrency ?? '';
            expect(defaultCurrency).not.toBe(CONST.CURRENCY.USD);

            // When the currency is reset and the query, now carrying no currency, lands
            await act(async () => {
                mockCapturedFooterProps.current?.onCurrencyChange?.(defaultCurrency);
                await waitForBatchedUpdates();
            });
            jest.mocked(getFooterConvertedAmounts).mockClear();
            setSearchQuery(mockSetParams.mock.calls.at(-1)?.at(0)?.q ?? '');
            rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000)} />);
            await waitForBatchedUpdates();

            // Then the footer still converts to the reset currency instead of falling back to the snapshot's
            expect(getFooterConvertedAmounts).toHaveBeenCalledWith(expect.objectContaining({targetCurrency: defaultCurrency}));
        });

        it('still writes a currency other than the default into the query', async () => {
            // Given a search with no footer currency
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {};
            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000)} />);
            await waitForBatchedUpdates();

            // When a currency other than the default is picked
            const otherCurrency = mockCapturedFooterProps.current?.defaultCurrency === CONST.CURRENCY.EUR ? CONST.CURRENCY.GBP : CONST.CURRENCY.EUR;
            await act(async () => {
                mockCapturedFooterProps.current?.onCurrencyChange?.(otherCurrency);
                await waitForBatchedUpdates();
            });

            // Then it is kept in the query, so it survives a reload and a saved search
            expect(mockSetParams.mock.calls.at(-1)?.at(0)?.q).toContain(`footerCurrency:${otherCurrency}`);
        });

        it('lets the query currency take over once it moves off the one the pick was made on', async () => {
            // Given EUR picked on a query that carried no currency
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {};
            const {rerender} = render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000)} />);
            await waitForBatchedUpdates();
            await act(async () => {
                mockCapturedFooterProps.current?.onCurrencyChange?.(CONST.CURRENCY.EUR);
                await waitForBatchedUpdates();
            });

            // When a saved search on the same hash opens with GBP, which no footer change made
            jest.mocked(getFooterConvertedAmounts).mockClear();
            setSearchQuery(`type:expense footerCurrency:${CONST.CURRENCY.GBP}`);
            rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000)} />);
            await waitForBatchedUpdates();

            // Then the footer converts to the query's GBP rather than holding on to the earlier pick
            expect(getFooterConvertedAmounts).toHaveBeenCalledWith(expect.objectContaining({targetCurrency: CONST.CURRENCY.GBP}));
            expect(getFooterConvertedAmounts).not.toHaveBeenCalledWith(expect.objectContaining({targetCurrency: CONST.CURRENCY.EUR}));
        });

        it('starts from the currency the query carries, so a saved search reopens on it', async () => {
            setSearchQuery('type:expense footerCurrency:EUR');
            mockSelectedTransactions.current = {};

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000)} />);
            await waitForBatchedUpdates();

            expect(getFooterConvertedAmounts).toHaveBeenCalledWith(expect.objectContaining({targetCurrency: CONST.CURRENCY.EUR}));
        });
    });

    describe('count selector', () => {
        it('defaults an expense-report search to the report count', async () => {
            setSearchQuery('type:expense-report');
            mockSelectedTransactions.current = {};

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, 87)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(
                expect.objectContaining({count: 87, countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, defaultCountType: CONST.SEARCH.FOOTER_COUNT.REPORTS}),
            );
        });

        it('defaults an expense search to the expense count', async () => {
            mockSelectedTransactions.current = {};

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(
                expect.objectContaining({count: 1204, countType: CONST.SEARCH.FOOTER_COUNT.EXPENSES, defaultCountType: CONST.SEARCH.FOOTER_COUNT.EXPENSES}),
            );
        });

        it('shows the expense count on an expense-report search once the query selects it, without a new search', async () => {
            setSearchQuery('type:expense-report footerCount:expenses');
            mockSelectedTransactions.current = {};

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, 87)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 1204, countType: CONST.SEARCH.FOOTER_COUNT.EXPENSES}));
        });

        it('offers the count selector once every matching item is selected, since the footer is back on the whole search', async () => {
            setSearchQuery('type:expense-report');
            // Select-all keeps the loaded rows selected while the footer shows the server's whole-search figures.
            mockSelectedTransactions.current = {transaction1: buildSelectedTransaction(CONST.CURRENCY.USD)};
            mockAreAllMatchingItemsSelected.current = true;

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, 87)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 87, countType: CONST.SEARCH.FOOTER_COUNT.REPORTS}));
        });

        it('keeps the count selector on a hand-picked selection, counting the reports those rows sit on', async () => {
            setSearchQuery('type:expense footerCount:reports');
            // Two expenses from one report, one from another: three expenses, two reports.
            mockSelectedTransactions.current = {
                transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'report1'},
                transaction2: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'report1'},
                transaction3: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'report2'},
            };

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)} />);
            await waitForBatchedUpdates();

            // The server's 87 describes the whole search, so the selection reports its own two.
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, count: 2}));
        });

        it('counts no report for a selected expense on an IOU report, which the server count leaves out too', async () => {
            // Given one expense on an expense report and one on an IOU report, both in the loaded data
            setSearchQuery('type:expense footerCount:reports');
            mockSelectedTransactions.current = {
                transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'expenseReport'},
                transaction2: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'iouReport'},
            };
            const searchResults = buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87);
            mockCurrentSearchResults.current = createMock<SearchResults>({
                ...searchResults,
                data: {
                    [`${ONYXKEYS.COLLECTION.REPORT}expenseReport` as const]: {reportID: 'expenseReport', type: CONST.REPORT.TYPE.EXPENSE},
                    [`${ONYXKEYS.COLLECTION.REPORT}iouReport` as const]: {reportID: 'iouReport', type: CONST.REPORT.TYPE.IOU},
                },
            });

            // When the footer counts the reports the selection covers
            render(<SearchSelectionFooter searchResults={searchResults} />);
            await waitForBatchedUpdates();

            // Then only the expense report counts, so the figure holds once the server's count takes over
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, count: 1}));
        });

        it('counts no selected IOU report on a Reports search either', async () => {
            // Given a selected expense report and a selected IOU report on a Reports search
            setSearchQuery('type:expense-report footerCount:reports');
            mockSelectedTransactions.current = {
                transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'expenseReport'},
                transaction2: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'iouReport'},
            };
            mockSelectedReports.current = [
                {...buildSelectedReport('expenseReport', -100), type: CONST.REPORT.TYPE.EXPENSE},
                {...buildSelectedReport('iouReport', -100), type: CONST.REPORT.TYPE.IOU},
            ];

            // When the footer counts the selected reports
            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, 87)} />);
            await waitForBatchedUpdates();

            // Then the IOU report is left out
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, count: 1}));
        });

        it('counts no report for a selected unreported expense, which sits on none', async () => {
            setSearchQuery('type:expense footerCount:reports');
            // Two expenses from one report, one unreported: three expenses, one report.
            mockSelectedTransactions.current = {
                transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'report1'},
                transaction2: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'report1'},
                transaction3: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: CONST.REPORT.UNREPORTED_REPORT_ID},
            };

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, count: 1}));
        });

        it('counts the selected expenses when the count selector is on expenses', async () => {
            setSearchQuery('type:expense footerCount:expenses');
            mockSelectedTransactions.current = {
                transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'report1'},
                transaction2: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'report1'},
            };

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.EXPENSES, count: 2}));
        });

        it('offers the total selector but not the count on a grouped search with nothing selected', async () => {
            setSearchQuery('type:expense groupBy:category');
            mockSelectedTransactions.current = {};

            // A grouped search counts expenses only, so the server sends no report count to switch to.
            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current?.countType).toBeUndefined();
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.TOTAL, count: 1204, total: 36000}));
        });

        it('offers both selectors on a grouped search once individual expenses are selected', async () => {
            setSearchQuery('type:expense groupBy:category footerTotal:reimbursable');
            // Expanded rows are stored as transactions, not as the group, so their own flags are available.
            mockSelectedTransactions.current = {
                reimbursable1: buildFlaggedTransaction(100, {reimbursable: true}),
                nonReimbursable1: buildFlaggedTransaction(300, {reimbursable: false}),
            };

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(
                expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.EXPENSES, totalType: CONST.SEARCH.FOOTER_TOTAL.REIMBURSABLE, count: 2, total: -100}),
            );
        });

        it('keeps both selectors on the Reports tab, where a selected report row is the search unit', async () => {
            setSearchQuery('type:expense-report');
            // Selecting a report stores its expenses, flagged as selected via the row, which is the same flag a grouped
            // search uses for a group. On a Reports search those expenses are exactly what the footer should describe.
            mockSelectedTransactions.current = {
                transaction1: {...buildFlaggedTransaction(100, {reimbursable: true}), groupKey: 'report1', isSelectedViaGroup: true},
                transaction2: {...buildFlaggedTransaction(300, {reimbursable: false}), groupKey: 'report1', isSelectedViaGroup: true},
            };

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, 87)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, totalType: CONST.SEARCH.FOOTER_TOTAL.TOTAL, total: -400}));
        });

        it('offers neither selector while a group with no loaded expenses is selected', async () => {
            setSearchQuery('type:expense groupBy:category');
            mockSelectedTransactions.current = {[`${CONST.SEARCH.GROUP_PREFIX}category1`]: buildSelectedTransaction(CONST.CURRENCY.USD, CONST.CURRENCY.USD, -100)};

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current?.countType).toBeUndefined();
            expect(mockCapturedFooterProps.current?.totalType).toBeUndefined();
        });

        it('names the breakdown the figure is, keeping the selector so an excluded group can lead back to the plain total', async () => {
            // Given a select-all on a billable total, with one group taken off it
            setSearchQuery('type:expense groupBy:category footerTotal:billable');
            mockSelectedTransactions.current = {};
            mockExcludedTransactions.current = {[`${CONST.SEARCH.GROUP_PREFIX}category1`]: buildSelectedTransaction(CONST.CURRENCY.USD, CONST.CURRENCY.USD, -100)};
            mockAreAllMatchingItemsSelected.current = true;

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)} />);
            await waitForBatchedUpdates();

            // Then the label names the billable breakdown, and the selector stays: a whole group has no breakdown of its own
            // yet, so the figure is hidden and the plain total is the way back to one.
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.BILLABLE, shouldShowTotalSelector: true, countType: undefined}));
        });

        it('keeps the plain total over a group selection the client sums itself, which has no breakdown to apply', async () => {
            setSearchQuery('type:expense groupBy:category footerTotal:billable');
            mockSelectedTransactions.current = {[`${CONST.SEARCH.GROUP_PREFIX}category1`]: buildSelectedTransaction(CONST.CURRENCY.USD, CONST.CURRENCY.USD, -100)};

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: undefined, shouldShowTotalSelector: false}));
        });

        it('offers neither selector while a group row is selected through its header, which stores its expenses', async () => {
            setSearchQuery('type:expense groupBy:category');
            // Ticking a group whose expenses are loaded stores them individually, each flagged as selected via the group.
            mockSelectedTransactions.current = {
                transaction1: {...buildFlaggedTransaction(100, {reimbursable: true}), groupKey: `${CONST.SEARCH.GROUP_PREFIX}category1`, isSelectedViaGroup: true},
                transaction2: {...buildFlaggedTransaction(300, {reimbursable: false}), groupKey: `${CONST.SEARCH.GROUP_PREFIX}category1`, isSelectedViaGroup: true},
            };

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current?.countType).toBeUndefined();
            expect(mockCapturedFooterProps.current?.totalType).toBeUndefined();
        });

        it('brings both selectors back once a group is part-deselected, which clears the group flag', async () => {
            setSearchQuery('type:expense groupBy:category');
            mockSelectedTransactions.current = {
                transaction1: {...buildFlaggedTransaction(100, {reimbursable: true}), groupKey: `${CONST.SEARCH.GROUP_PREFIX}category1`, isSelectedViaGroup: false},
            };

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.EXPENSES, totalType: CONST.SEARCH.FOOTER_TOTAL.TOTAL}));
        });

        it('keeps the server report count on a select-all with exclusions, which the selection cannot recount', async () => {
            setSearchQuery('type:expense footerCount:reports');
            mockSelectedTransactions.current = {};
            mockExcludedTransactions.current = {transaction1: buildSelectedTransaction(CONST.CURRENCY.USD)};
            mockAreAllMatchingItemsSelected.current = true;

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 172, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)} />);
            await waitForBatchedUpdates();

            // A select-all covers rows that were never loaded, so only the server can say how many reports they span.
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, count: 87}));
        });

        it('writes a count change into the query even over a selection, since it changes no hash and has to stick', async () => {
            setSearchQuery('type:expense');
            // Three expenses across two reports, so the two counts can't be confused for each other.
            mockSelectedTransactions.current = {
                transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'report1'},
                transaction2: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'report1'},
                transaction3: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'report2'},
            };

            const {rerender} = render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.EXPENSES, count: 3}));

            await act(async () => {
                mockCapturedFooterProps.current?.onCountChange?.(CONST.SEARCH.FOOTER_COUNT.REPORTS);
                await waitForBatchedUpdates();
            });

            // The query carries the choice, which is what makes it survive leaving and returning to the tab...
            const nextQuery = mockSetParams.mock.calls.at(0)?.at(0)?.q;
            expect(nextQuery).toContain('footerCount:reports');

            // Replaying the query the app would now be on: the footer counts the two reports those expenses sit on.
            setSearchQuery(nextQuery ?? '');
            rerender(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, count: 2}));
        });

        it('applies a count change by writing it into the query, which leaves the search hash alone', async () => {
            // A real parsed query, since applying the change rebuilds the query string from it.
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {};

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)} />);
            await waitForBatchedUpdates();

            await act(async () => {
                mockCapturedFooterProps.current?.onCountChange?.(CONST.SEARCH.FOOTER_COUNT.REPORTS);
                await waitForBatchedUpdates();
            });

            expect(mockSetParams).toHaveBeenCalledTimes(1);
            expect(mockSetParams.mock.calls.at(0)?.at(0)?.q).toContain('footerCount:reports');
        });

        it('offers no count selector when the search returned no report count', async () => {
            mockSelectedTransactions.current = {};

            render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE)} />);
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current?.countType).toBeUndefined();
            expect(mockCapturedFooterProps.current?.count).toBe(1204);
        });

        describe('beta disabled', () => {
            beforeEach(() => {
                mockIsFooterSelectorsBetaEnabled.current = false;
            });

            it('offers neither selector and leaves the query alone', async () => {
                mockSelectedTransactions.current = {};
                setSearchQuery('type:expense footerCount:reports footerTotal:reimbursable footerCurrency:eur');

                render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 42)} />);
                await waitForBatchedUpdates();

                expect(mockCapturedFooterProps.current?.countType).toBeUndefined();
                expect(mockCapturedFooterProps.current?.totalType).toBeUndefined();
                // The query's selections are ignored, so the footer shows the whole-search expense count and total.
                expect(mockCapturedFooterProps.current?.count).toBe(1204);
                expect(mockCapturedFooterProps.current?.currency).toBe(CONST.CURRENCY.USD);
            });

            it('keeps a currency change in local state instead of writing it into the query', async () => {
                mockSelectedTransactions.current = {};

                render(<SearchSelectionFooter searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE)} />);
                await waitForBatchedUpdates();

                await act(async () => {
                    mockCapturedFooterProps.current?.onCurrencyChange?.(CONST.CURRENCY.EUR);
                    await waitForBatchedUpdates();
                });

                expect(mockSetParams).not.toHaveBeenCalled();
            });
        });
    });

    describe('totals of a grouped search with a cash back row', () => {
        const SETTLEMENT_A_KEY = `${CONST.SEARCH.GROUP_PREFIX}settlementA` as const;
        const SETTLEMENT_B_KEY = `${CONST.SEARCH.GROUP_PREFIX}settlementB` as const;
        const CASH_BACK_KEY = `${CONST.SEARCH.GROUP_PREFIX}cashBack` as const;

        const renderWithSelection = async (selectedTransactions: SelectedTransactions, {serverTotal = 47500, hasMoreResults = false} = {}) => {
            setSearchQuery(`type:expense group-by:${CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID}`);
            // The server count only sums expenses (5) while its total nets the credit: 300 + 200 - 25.
            const searchResults = buildSearchResults(CONST.CURRENCY.USD, 5, serverTotal, CONST.SEARCH.DATA_TYPES.EXPENSE, undefined, hasMoreResults);
            mockCurrentSearchResults.current = {
                ...searchResults,
                data: {
                    [SETTLEMENT_A_KEY]: makeSettlementGroup({entryID: 1, count: 3, total: 30000}),
                    [SETTLEMENT_B_KEY]: makeSettlementGroup({entryID: 2, count: 2, total: 20000}),
                    [CASH_BACK_KEY]: makeSettlementGroup({entryID: 3, count: 0, total: -2500, isCashBack: true}),
                },
            };
            mockSelectedTransactions.current = selectedTransactions;

            render(<SearchSelectionFooter searchResults={searchResults} />);
            await waitForBatchedUpdates();
        };

        it('shows the selected settlements total instead of the grand total when the cash back row is left out', async () => {
            // Given every settlement is selected but the cash back row is not
            // When the footer renders
            await renderWithSelection({
                [SETTLEMENT_A_KEY]: buildSelectedTransaction(CONST.CURRENCY.USD, CONST.CURRENCY.USD, -30000),
                [SETTLEMENT_B_KEY]: buildSelectedTransaction(CONST.CURRENCY.USD, CONST.CURRENCY.USD, -20000),
            });

            // Then the selection matches the server's expense count, but the server total also nets the unselected
            // credit, so the footer must sum the selection rather than fall back to the grand total
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 5, total: 50000}));
        });

        it('shows the selected settlements total while another page could still hold a cash back row', async () => {
            // Given every loaded row is selected and more pages remain to be loaded
            // When the footer renders
            await renderWithSelection(
                {
                    [SETTLEMENT_A_KEY]: buildSelectedTransaction(CONST.CURRENCY.USD, CONST.CURRENCY.USD, -30000),
                    [SETTLEMENT_B_KEY]: buildSelectedTransaction(CONST.CURRENCY.USD, CONST.CURRENCY.USD, -20000),
                    [CASH_BACK_KEY]: buildSelectedTransaction(CONST.CURRENCY.USD, CONST.CURRENCY.USD, 2500),
                },
                // The server total also nets a $10 credit on a page that has not loaded yet
                {serverTotal: 46500, hasMoreResults: true},
            );

            // Then the expense counts match, but the footer sums the loaded selection rather than the server total,
            // which includes the unloaded credit
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 5, total: 47500}));
        });

        it('still shows the grand total when the cash back row is selected along with every settlement', async () => {
            // Given every row on the page is selected, including the cash back row
            // When the footer renders
            await renderWithSelection({
                [SETTLEMENT_A_KEY]: buildSelectedTransaction(CONST.CURRENCY.USD, CONST.CURRENCY.USD, -30000),
                [SETTLEMENT_B_KEY]: buildSelectedTransaction(CONST.CURRENCY.USD, CONST.CURRENCY.USD, -20000),
                [CASH_BACK_KEY]: buildSelectedTransaction(CONST.CURRENCY.USD, CONST.CURRENCY.USD, 2500),
            });

            // Then the selection is the whole search, so the server's netted total is the right one to show
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 5, total: 47500}));
        });
    });

    describe('stamping the loaded groups of a grouped search', () => {
        const CASH_BACK_KEY = `${CONST.SEARCH.GROUP_PREFIX}cashBack` as const;
        const SETTLEMENT_KEY = `${CONST.SEARCH.GROUP_PREFIX}settlement` as const;

        const renderGroupedSearch = async () => {
            setSearchQuery(`type:expense group-by:${CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID}`);
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
            // Given a grouped search where only the settlement is selected and the cash back group is not
            // When the footer requests converted amounts for every loaded group
            const groups = await renderGroupedSearch();

            // Then the credit's negative total is negated into a positive stamp, matching what its own entry would produce
            expect(groups?.[CASH_BACK_KEY]).toEqual({[PAYMENT_CURRENCY]: 2500});
        });

        it('keeps stamping an unselected settlement group expense-negative', async () => {
            // Given the same grouped search
            // When the footer requests converted amounts for every loaded group
            const groups = await renderGroupedSearch();

            // Then the settlement keeps its usual expense-negative stamp
            expect(groups?.[SETTLEMENT_KEY]).toEqual({[PAYMENT_CURRENCY]: -40000});
        });
    });
});
