import {act, render} from '@testing-library/react-native';

import SearchSelectionFooter from '@components/Search/SearchSelectionFooter';
import type {SearchFooterCount, SearchFooterTotal, SelectedTransactionInfo, SelectedTransactions} from '@components/Search/types';

import {getFooterConvertedAmounts} from '@libs/actions/Search';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

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

const mockSetParams = jest.fn<void, [{q?: string; rawQuery?: string}]>();
const mockOnDisplayChange = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    // Called through a wrapper: the factory runs before the mock above is initialized.
    default: {setParams: (params: {q?: string; rawQuery?: string}) => mockSetParams(params)},
}));

// The real one waits for the popover to close first; the callback is all these tests care about.
jest.mock('@libs/actions/Modal', () => ({
    close: (onModalClose: () => void) => onModalClose(),
}));

type MockSearchQueryContext = {
    currentSearchHash: number;
    currentSearchKey: undefined;
    currentSearchQueryJSON: {hash: number; type: SearchResults['search']['type']; footerCount?: SearchFooterCount; footerTotal?: SearchFooterTotal} | undefined;
};

const mockSearchQueryContext: {current: MockSearchQueryContext} = {
    current: {currentSearchHash: 1, currentSearchKey: undefined, currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE}},
};
const mockSelectedTransactions: {current: SelectedTransactions} = {current: {}};
const mockExcludedTransactions: {current: SelectedTransactions} = {current: {}};
const mockAreAllMatchingItemsSelected = {current: false};
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => mockSearchQueryContext.current,
    useSearchResultsContext: () => ({currentSearchResults: undefined}),
    useSearchSelectionContext: () => ({
        selectedTransactions: mockSelectedTransactions.current,
        excludedTransactions: mockExcludedTransactions.current,
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected.current,
        selectedReports: [],
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
        displayAmount: 100,
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

        render(
            <SearchSelectionFooter
                searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT)}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current).toEqual(expect.objectContaining({count: 10, total: 36000, currency: CONST.CURRENCY.USD}));
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

        mockSearchQueryContext.current = {
            currentSearchHash: 1,
            currentSearchKey: undefined,
            currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE, footerTotal: CONST.SEARCH.FOOTER_TOTAL.REIMBURSABLE},
        };
        const searchResults = buildSearchResults(CONST.CURRENCY.USD, 10, 36000);
        searchResults.search.reimbursableTotal = 12000;

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
        mockSearchQueryContext.current = {
            currentSearchHash: 1,
            currentSearchKey: undefined,
            currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE, footerTotal: CONST.SEARCH.FOOTER_TOTAL.BILLABLE},
        };
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

    it('re-runs the search when a total is applied, holding the current results on screen', async () => {
        mockSearchQueryContext.current = {currentSearchHash: 1, currentSearchKey: undefined, currentSearchQueryJSON: buildSearchQueryJSON('type:expense')};
        mockSelectedTransactions.current = {};

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

        expect(mockOnDisplayChange).toHaveBeenCalledTimes(1);
        expect(mockSetParams.mock.calls.at(0)?.at(0)?.q).toContain('footerTotal:reimbursable');
    });

    it('skeletons the total while the re-run search is in flight, leaving the count alone', async () => {
        // The page still shows the previous hash's results while the new snapshot loads.
        mockSearchQueryContext.current = {currentSearchHash: 2, currentSearchKey: undefined, currentSearchQueryJSON: {hash: 2, type: CONST.SEARCH.DATA_TYPES.EXPENSE}};
        mockSelectedTransactions.current = {};

        render(
            <SearchSelectionFooter
                searchResults={buildSearchResults(CONST.CURRENCY.USD, 10, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE, 4)}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
        await waitForBatchedUpdates();

        expect(mockCapturedFooterProps.current?.isTotalLoading).toBe(true);
        expect(mockCapturedFooterProps.current?.count).toBe(10);
    });
});

describe('currency selector', () => {
    it('re-runs the search rather than converting on the client while the footer describes the whole search', async () => {
        mockSearchQueryContext.current = {currentSearchHash: 1, currentSearchKey: undefined, currentSearchQueryJSON: buildSearchQueryJSON('type:expense')};
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

        expect(mockSetParams.mock.calls.at(0)?.at(0)?.q).toContain('footerCurrency:EUR');
        expect(mockOnDisplayChange).toHaveBeenCalledTimes(1);
        // The backend returns the figures already converted, so no client-side conversion is requested.
        expect(getFooterConvertedAmounts).not.toHaveBeenCalled();
    });
});

describe('count selector', () => {
    it('defaults an expense-report search to the report count', async () => {
        mockSearchQueryContext.current = {
            currentSearchHash: 1,
            currentSearchKey: undefined,
            currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT},
        };
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
        mockSearchQueryContext.current = {
            currentSearchHash: 1,
            currentSearchKey: undefined,
            currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, footerCount: CONST.SEARCH.FOOTER_COUNT.EXPENSES},
        };
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
        mockSearchQueryContext.current = {
            currentSearchHash: 1,
            currentSearchKey: undefined,
            currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT},
        };
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

    it('offers no count selector while the footer describes a partial selection', async () => {
        mockSearchQueryContext.current = {
            currentSearchHash: 1,
            currentSearchKey: undefined,
            currentSearchQueryJSON: {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, footerCount: CONST.SEARCH.FOOTER_COUNT.REPORTS},
        };
        mockSelectedTransactions.current = {transaction1: buildSelectedTransaction(CONST.CURRENCY.USD)};

        render(
            <SearchSelectionFooter
                searchResults={buildSearchResults(CONST.CURRENCY.USD, 1204, 36000, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, 87)}
                onDisplayChange={mockOnDisplayChange}
            />,
        );
        await waitForBatchedUpdates();

        // The selection is counted in expenses, so the report count must not be displayed against it.
        expect(mockCapturedFooterProps.current?.countType).toBeUndefined();
        expect(mockCapturedFooterProps.current?.count).toBe(1);
    });

    it('offers no count selector while a select-all has exclusions, since the report count cannot account for them', async () => {
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

        expect(mockCapturedFooterProps.current?.countType).toBeUndefined();
        expect(mockCapturedFooterProps.current?.count).toBe(171);
    });

    it('applies a count change by writing it into the query, which leaves the search hash alone', async () => {
        // A real parsed query, since applying the change rebuilds the query string from it.
        mockSearchQueryContext.current = {currentSearchHash: 1, currentSearchKey: undefined, currentSearchQueryJSON: buildSearchQueryJSON('type:expense')};
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
