import {act, render} from '@testing-library/react-native';

import SearchSelectionFooter from '@components/Search/SearchSelectionFooter';
import type {SearchFooterCount, SearchFooterTotal, SearchQueryJSON, SelectedReports, SelectedTransactionInfo, SelectedTransactions} from '@components/Search/types';

import {getFooterConvertedAmounts, search} from '@libs/actions/Search';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

jest.mock('@hooks/useSearchShouldCalculateTotals', () => jest.fn(() => true));

jest.mock('@libs/actions/Search', () => ({
    getFooterConvertedAmounts: jest.fn(),
    search: jest.fn(),
}));

const mockSetParams = jest.fn<void, [{q?: string; rawQuery?: string}]>();
const mockOnDisplayChange = jest.fn();
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
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => mockSearchQueryContext.current,
    useSearchResultsContext: () => ({currentSearchResults: undefined}),
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
        setSearchQuery('type:expense');
        mockSelectedTransactions.current = {transaction1: buildSelectedTransaction(SELECTED_EXPENSE_CURRENCY)};
        mockExcludedTransactions.current = {};
        mockSelectedReports.current = [];
        mockAreAllMatchingItemsSelected.current = false;
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

        render(
            <SearchSelectionFooter
                searchResults={buildSearchResults(CONST.CURRENCY.USD, 172, 36000)}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 171, total: 35900, currency: CONST.CURRENCY.USD}));
    });

    it("subtracts an excluded report's expenses and total from the all-matching footer", async () => {
        setSearchQuery('type:expense-report');
        mockSelectedTransactions.current = {transaction3: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report2')};
        mockExcludedTransactions.current = {
            transaction1: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1'),
            transaction2: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1'),
        };
        mockSelectedReports.current = [buildSelectedReport('report2', -100)];
        mockAreAllMatchingItemsSelected.current = true;

        render(
            <SearchSelectionFooter
                searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT)}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 8, total: 35800, currency: CONST.CURRENCY.USD}));
    });

    it('shows the authoritative expense count and total before every report page is loaded', async () => {
        setSearchQuery('type:expense-report');
        mockSelectedTransactions.current = {transaction1: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1')};
        mockSelectedReports.current = [buildSelectedReport('report1', -100)];
        mockAreAllMatchingItemsSelected.current = true;

        render(
            <SearchSelectionFooter
                searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, undefined, true)}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 10, total: 36000, currency: CONST.CURRENCY.USD}));
    });

    it('counts the expenses inside manually selected reports', async () => {
        setSearchQuery('type:expense-report');
        mockSelectedTransactions.current = {
            transaction1: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1'),
            transaction2: buildSelectedTransaction(CONST.CURRENCY.USD, undefined, -100, 'report1'),
        };
        mockSelectedReports.current = [buildSelectedReport('report1', -200)];

        render(
            <SearchSelectionFooter
                searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT)}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 2, total: 200, currency: CONST.CURRENCY.USD}));
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
        const {rerender} = render(
            <SearchSelectionFooter
                searchResults={searchResults}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
        await waitForBatchedUpdates();

        await act(async () => {
            mockCapturedFooterProps.current?.onCurrencyChange?.(CONST.CURRENCY.EUR);
            await waitForBatchedUpdates();
        });

        // Reconciliation can provide an equivalent selectedReports array before Onyx publishes the optimistic source
        // stamp. That render must not issue the same report conversion again.
        mockSelectedReports.current = [...mockSelectedReports.current];
        rerender(
            <SearchSelectionFooter
                searchResults={searchResults}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
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

        render(
            <SearchSelectionFooter
                searchResults={buildSearchResults(CONST.CURRENCY.USD, 5)}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 2, total: 0}));
    });

    it('nets a selected credit against a selected expense when the amounts differ', async () => {
        mockSelectedTransactions.current = {
            transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), displayAmount: 10000},
            transaction2: {...buildSelectedTransaction(CONST.CURRENCY.USD), displayAmount: -4000},
        };

        render(
            <SearchSelectionFooter
                searchResults={buildSearchResults(CONST.CURRENCY.USD, 5)}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 2, total: 6000}));
    });

    it('adds back an excluded credit rather than subtracting it from the server total', async () => {
        // The server total already counts the credit as -$100, so dropping it from the selection raises the total.
        mockSelectedTransactions.current = {};
        mockExcludedTransactions.current = {transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), displayAmount: -10000}};
        mockAreAllMatchingItemsSelected.current = true;

        render(
            <SearchSelectionFooter
                searchResults={buildSearchResults(CONST.CURRENCY.USD, 172, 36000)}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 171, total: 46000, currency: CONST.CURRENCY.USD}));
    });

    it("offers the user's live payment currency as the Reset target when there is no active workspace", async () => {
        // A fresh no-workspace account: the active policy is the personal policy, and the only selected expense
        // happens to be in a different currency (JPY) from the live payment currency (GBP).
        render(
            <SearchSelectionFooter
                searchResults={buildSearchResults(undefined)}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
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

        render(
            <SearchSelectionFooter
                searchResults={buildSearchResults(CONST.CURRENCY.EUR)}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current?.defaultCurrency).toBe(CONST.CURRENCY.EUR);
    });

    it('converts the figures when Reset selects a default the figures are not denominated in', async () => {
        // The payment currency changed after the snapshot loaded: the selected group's server-converted figure is
        // still denominated in the old payment currency (INR), while the live default is now GBP.
        mockSelectedTransactions.current = {[`${CONST.SEARCH.GROUP_PREFIX}category1`]: buildSelectedTransaction(SELECTED_EXPENSE_CURRENCY, 'INR', -100)};

        // A partial selection (1 of 2), so the footer uses the client-side selected total.
        render(
            <SearchSelectionFooter
                searchResults={buildSearchResults(undefined, 2)}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
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

        render(
            <SearchSelectionFooter
                searchResults={buildSearchResults(undefined, 2)}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
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

            const {rerender} = render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.TOTAL, total: 36000}));

            setSearchQuery('type:expense footerTotal:reimbursable');
            // The backend swaps the aggregate into `total` itself, so the footer just displays the total it was sent.
            const searchResults = buildSearchResults(CONST.CURRENCY.USD, 10, 12000);

            rerender(
                <SearchSelectionFooter
                    searchResults={searchResults}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({totalType: CONST.SEARCH.FOOTER_TOTAL.REIMBURSABLE, total: 12000}));
        });

        it('falls back to the plain total when the backend answers with the aggregate in `total` instead of its own field', async () => {
            setSearchQuery('type:expense footerTotal:billable');
            mockSelectedTransactions.current = {};

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 4200)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current?.total).toBe(4200);
        });

        it('offers no total selector on an empty result set', async () => {
            mockSelectedTransactions.current = {};

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 0, 0)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current?.totalType).toBeUndefined();
        });

        it('moves the search hash when a total is applied, keeping the rows on screen while the new one loads', async () => {
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {};
            const beforeHash = mockSearchQueryContext.current.currentSearchQueryJSON?.hash;

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            await act(async () => {
                mockCapturedFooterProps.current?.onTotalChange?.(CONST.SEARCH.FOOTER_TOTAL.REIMBURSABLE);
                await waitForBatchedUpdates();
            });

            // The query change is what re-runs the search, so the footer asks for nothing itself.
            expect(search).not.toHaveBeenCalled();

            // The choice goes into the query, which is what saves it for the next visit...
            const nextQuery = mockSetParams.mock.calls.at(0)?.at(0)?.q ?? '';
            expect(nextQuery).toContain('footerTotal:reimbursable');
            // ...and the hash moves with it, since the backend answers a different aggregate for each breakdown.
            expect(buildSearchQueryJSON(nextQuery)?.hash).not.toBe(beforeHash);
            // The page is told first, so the current rows stay on screen while the new snapshot loads.
            expect(mockOnDisplayChange).toHaveBeenCalled();
        });

        it("skeletons the total after applying one while another search's results are still on screen, leaving the count alone", async () => {
            // Given the footer describing the whole search, with the results of another search still displayed
            setSearchQuery('type:expense', 2);
            mockSelectedTransactions.current = {};

            const {rerender} = render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 4)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            // Then nothing is waited on until the footer asks for something
            expect(mockCapturedFooterProps.current?.isTotalLoading).toBe(false);

            // When a different total is applied, which moves the query onto its own hash
            await act(async () => {
                mockCapturedFooterProps.current?.onTotalChange?.(CONST.SEARCH.FOOTER_TOTAL.BILLABLE);
                await waitForBatchedUpdates();
            });
            const nextQuery = mockSetParams.mock.calls.at(0)?.at(0)?.q ?? '';
            const nextHash = buildSearchQueryJSON(nextQuery)?.hash ?? 0;
            setSearchQuery(nextQuery, nextHash);
            rerender(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 4)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            // Then the skeleton stands in for the figure it cannot describe yet, and the count holds its value
            expect(mockCapturedFooterProps.current?.isTotalLoading).toBe(true);
            expect(mockCapturedFooterProps.current?.count).toBe(10);

            // When this search's own results arrive
            const nextResults = buildSearchResults(CONST.CURRENCY.USD, 10, 12000, CONST.SEARCH.DATA_TYPES.EXPENSE, 4);
            nextResults.search.hash = nextHash;
            rerender(
                <SearchSelectionFooter
                    searchResults={nextResults}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            // Then the skeleton gives way to the figure
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({isTotalLoading: false, total: 12000}));

            // And the wait is over for good: a later visit to that same search, with its snapshot not yet on screen,
            // shows the figures it has rather than skeletoning on a request that was already answered.
            rerender(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 4)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current?.isTotalLoading).toBe(false);
        });

        it('leaves the total alone while a search the footer did not ask for runs, so it does not flicker', async () => {
            // A select-all re-requests the same totals it is already displaying, and a sort keeps the previous figures.
            setSearchQuery('type:expense', 2);
            mockSelectedTransactions.current = {};

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 4)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
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
            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
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

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            await act(async () => {
                mockCapturedFooterProps.current?.onCurrencyChange?.(CONST.CURRENCY.EUR);
                await waitForBatchedUpdates();
            });

            // A per-report converted total has no breakdown inside it, and the reports' expenses are not converted
            // individually, so the figure stays in the currency it is actually denominated in.
            expect(mockCapturedFooterProps.current?.currency).not.toBe(CONST.CURRENCY.EUR);
        });

        it('stores a total applied over a selection in the query too, so it is restored on the next visit', async () => {
            setSearchQuery('type:expense');
            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            await act(async () => {
                mockCapturedFooterProps.current?.onTotalChange?.(CONST.SEARCH.FOOTER_TOTAL.BILLABLE);
                await waitForBatchedUpdates();
            });

            // The choice goes into the query like any other, so it survives a reload and a saved search. The hash it
            // moves is a footer-only change, which `useSearchPageSetup` keeps the selection across.
            const nextQuery = mockSetParams.mock.calls.at(0)?.at(0)?.q ?? '';
            expect(nextQuery).toContain('footerTotal:billable');
            expect(mockOnDisplayChange).toHaveBeenCalled();

            // The breakdown applies right away all the same, summed from the selected rows: one of the three is billable.
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

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            await act(async () => {
                mockCapturedFooterProps.current?.onCurrencyChange?.(CONST.CURRENCY.EUR);
                await waitForBatchedUpdates();
            });

            // Search ignores footerCurrency, so the conversion is requested separately...
            expect(getFooterConvertedAmounts).toHaveBeenCalledWith(expect.objectContaining({targetCurrency: CONST.CURRENCY.EUR}));
            // ...while the query carries the choice so it survives a reload, with no results reload of its own.
            expect(mockSetParams.mock.calls.at(0)?.at(0)?.q).toContain('footerCurrency:EUR');
            expect(mockOnDisplayChange).not.toHaveBeenCalled();
        });

        it('starts from the currency the query carries, so a saved search reopens on it', async () => {
            setSearchQuery('type:expense footerCurrency:EUR');
            mockSelectedTransactions.current = {};

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(getFooterConvertedAmounts).toHaveBeenCalledWith(expect.objectContaining({targetCurrency: CONST.CURRENCY.EUR}));
        });
    });

    describe('count selector', () => {
        it('defaults an expense-report search to the report count', async () => {
            setSearchQuery('type:expense-report');
            mockSelectedTransactions.current = {};

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, 87)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(
                expect.objectContaining({count: 87, countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, defaultCountType: CONST.SEARCH.FOOTER_COUNT.REPORTS}),
            );
        });

        it('defaults an expense search to the expense count', async () => {
            mockSelectedTransactions.current = {};

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(
                expect.objectContaining({count: 1204, countType: CONST.SEARCH.FOOTER_COUNT.EXPENSES, defaultCountType: CONST.SEARCH.FOOTER_COUNT.EXPENSES}),
            );
        });

        it('shows the expense count on an expense-report search once the query selects it, without a new search', async () => {
            setSearchQuery('type:expense-report footerCount:expenses');
            mockSelectedTransactions.current = {};

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, 87)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 1204, countType: CONST.SEARCH.FOOTER_COUNT.EXPENSES}));
        });

        it('offers the count selector once every matching item is selected, since the footer is back on the whole search', async () => {
            setSearchQuery('type:expense-report');
            // Select-all keeps the loaded rows selected while the footer shows the server's whole-search figures.
            mockSelectedTransactions.current = {transaction1: buildSelectedTransaction(CONST.CURRENCY.USD)};
            mockAreAllMatchingItemsSelected.current = true;

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, 87)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
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

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            // The server's 87 describes the whole search, so the selection reports its own two.
            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, count: 2}));
        });

        it('counts no report for a selected unreported expense, which sits on none', async () => {
            setSearchQuery('type:expense footerCount:reports');
            // Two expenses from one report, one unreported: three expenses, one report.
            mockSelectedTransactions.current = {
                transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'report1'},
                transaction2: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'report1'},
                transaction3: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: CONST.REPORT.UNREPORTED_REPORT_ID},
            };

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, count: 1}));
        });

        it('counts the selected expenses when the count selector is on expenses', async () => {
            setSearchQuery('type:expense footerCount:expenses');
            mockSelectedTransactions.current = {
                transaction1: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'report1'},
                transaction2: {...buildSelectedTransaction(CONST.CURRENCY.USD), reportID: 'report1'},
            };

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.EXPENSES, count: 2}));
        });

        it('offers the total selector but not the count on a grouped search with nothing selected', async () => {
            setSearchQuery('type:expense groupBy:category');
            mockSelectedTransactions.current = {};

            // A grouped search counts expenses only, so the server sends no report count to switch to.
            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
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

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
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

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, 87)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, totalType: CONST.SEARCH.FOOTER_TOTAL.TOTAL, total: -400}));
        });

        it('offers neither selector while a group with no loaded expenses is selected', async () => {
            setSearchQuery('type:expense groupBy:category');
            mockSelectedTransactions.current = {[`${CONST.SEARCH.GROUP_PREFIX}category1`]: buildSelectedTransaction(CONST.CURRENCY.USD, CONST.CURRENCY.USD, -100)};

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current?.countType).toBeUndefined();
            expect(mockCapturedFooterProps.current?.totalType).toBeUndefined();
        });

        it('offers neither selector while a group row is selected through its header, which stores its expenses', async () => {
            setSearchQuery('type:expense groupBy:category');
            // Ticking a group whose expenses are loaded stores them individually, each flagged as selected via the group.
            mockSelectedTransactions.current = {
                transaction1: {...buildFlaggedTransaction(100, {reimbursable: true}), groupKey: `${CONST.SEARCH.GROUP_PREFIX}category1`, isSelectedViaGroup: true},
                transaction2: {...buildFlaggedTransaction(300, {reimbursable: false}), groupKey: `${CONST.SEARCH.GROUP_PREFIX}category1`, isSelectedViaGroup: true},
            };

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current?.countType).toBeUndefined();
            expect(mockCapturedFooterProps.current?.totalType).toBeUndefined();
        });

        it('brings both selectors back once a group is part-deselected, which clears the group flag', async () => {
            setSearchQuery('type:expense groupBy:category');
            mockSelectedTransactions.current = {
                transaction1: {...buildFlaggedTransaction(100, {reimbursable: true}), groupKey: `${CONST.SEARCH.GROUP_PREFIX}category1`, isSelectedViaGroup: false},
            };

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.EXPENSES, totalType: CONST.SEARCH.FOOTER_TOTAL.TOTAL}));
        });

        it('keeps the server report count on a select-all with exclusions, which the selection cannot recount', async () => {
            setSearchQuery('type:expense footerCount:reports');
            mockSelectedTransactions.current = {};
            mockExcludedTransactions.current = {transaction1: buildSelectedTransaction(CONST.CURRENCY.USD)};
            mockAreAllMatchingItemsSelected.current = true;

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 172, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
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

            const {rerender} = render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.EXPENSES, count: 3}));

            await act(async () => {
                mockCapturedFooterProps.current?.onCountChange?.(CONST.SEARCH.FOOTER_COUNT.REPORTS);
                await waitForBatchedUpdates();
            });

            // The query carries the choice, which is what makes it survive leaving and returning to the tab...
            const nextQuery = mockSetParams.mock.calls.at(0)?.at(0)?.q;
            expect(nextQuery).toContain('footerCount:reports');
            // ...and the hash is unchanged, so the selected rows are not cleared.
            expect(mockOnDisplayChange).not.toHaveBeenCalled();

            // Replaying the query the app would now be on: the footer counts the two reports those expenses sit on.
            setSearchQuery(nextQuery ?? '');
            rerender(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({countType: CONST.SEARCH.FOOTER_COUNT.REPORTS, count: 2}));
        });

        it('applies a count change by writing it into the query, which leaves the search hash alone', async () => {
            // A real parsed query, since applying the change rebuilds the query string from it.
            setSearchQuery('type:expense');
            mockSelectedTransactions.current = {};

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 87)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
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

            render(
                <SearchSelectionFooter
                    searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE)}
                    onDisplayChange={mockOnDisplayChange}
                />,
            );
            await waitForBatchedUpdates();

            expect(mockCapturedFooterProps.current?.countType).toBeUndefined();
            expect(mockCapturedFooterProps.current?.count).toBe(1204);
        });
    });
});
