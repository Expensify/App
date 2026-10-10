import {act, renderHook, waitFor} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';

import useSearchBulkActions from '@hooks/useSearchBulkActions';

import {unholdRequest} from '@libs/actions/IOU/Hold';
import {getExportTemplates, queueExportSearchItemsToCSV, queueExportSearchWithTemplate} from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';
import createMock from '../../utils/createMock';

const mockQueueExportSearchItemsToCSV = jest.mocked(queueExportSearchItemsToCSV);
const mockQueueExportSearchWithTemplate = jest.mocked(queueExportSearchWithTemplate);
const mockGetExportTemplates = jest.mocked(getExportTemplates);
const mockUnholdRequest = jest.mocked(unholdRequest);

jest.mock('@libs/actions/Export', () => ({
    clearExportDownload: jest.fn(),
}));

jest.mock('@libs/actions/Search', () => ({
    getExportTemplates: jest.fn(() => ({customTemplates: [], defaultTemplates: []})),
    exportSearchItemsToCSV: jest.fn(),
    queueExportSearchItemsToCSV: jest.fn(() => 'mock-export-id'),
    queueExportSearchWithTemplate: jest.fn(() => 'mock-template-export-id'),
    getSearchApproveOnyxData: jest.fn(() => ({})),
    getSearchPayOnyxData: jest.fn(() => ({})),
    bulkDeleteReports: jest.fn(),
    getLastPolicyBankAccountID: jest.fn(),
    getLastPolicyPaymentMethod: jest.fn(),
    getPayMoneyOnSearchInvoiceParams: jest.fn(),
    getPayOption: jest.fn(() => ({shouldEnableBulkPayOption: false, isFirstTimePayment: false})),
    getReportType: jest.fn(),
    getTotalFormattedAmount: jest.fn(() => ''),
    isCurrencySupportWalletBulkPay: jest.fn(() => false),
    openSearchCardFiltersPage: jest.fn(),
    payMoneyRequestOnSearch: jest.fn(),
    submitMoneyRequestOnSearch: jest.fn(),
    unholdMoneyRequestOnSearch: jest.fn(),
}));

jest.mock('@libs/actions/IOU/Hold', () => ({
    unholdRequest: jest.fn(),
}));

jest.mock('@libs/actions/MergeTransaction', () => ({
    setupMergeTransactionDataAndNavigate: jest.fn(),
}));

jest.mock('@libs/actions/SplitExpenses.ts', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/actions/Report', () => ({
    deleteAppReport: jest.fn(),
    exportReportToPDF: jest.fn(),
    markAsManuallyExported: jest.fn(),
    moveIOUReportToPolicy: jest.fn(),
    moveIOUReportToPolicyAndInviteSubmitter: jest.fn(),
}));

jest.mock('@libs/actions/User', () => ({
    setNameValuePair: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => '/test'),
}));

const mockTranslate = jest.fn((key: string) => key);
const mockLocaleCompare = jest.fn((a: string, b: string) => a && b);
const mockFormatPhoneNumber = jest.fn((phone: string) => phone);

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: mockTranslate,
        localeCompare: mockLocaleCompare,
        formatPhoneNumber: mockFormatPhoneNumber,
    }),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({colorMuted: {}, fontWeightNormal: {}, textWrap: {}}),
}));

jest.mock('@hooks/useTheme', () => ({
    __esModule: true,
    default: () => ({icon: ''}),
}));

let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
}));

jest.mock('@hooks/useEnvironment', () => ({
    __esModule: true,
    default: () => ({isProduction: false, isDevelopment: true, environment: 'development'}),
}));

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessState: () => ({isDelegateAccessRestricted: false}),
    useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: jest.fn()}),
}));

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: jest.fn()}),
}));

let mockEnabledBetas: string[] = [];
jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: (beta: string) => mockEnabledBetas.includes(beta), isBetaEnabledOrUnknown: (beta: string) => mockEnabledBetas.includes(beta)}),
}));

jest.mock('@hooks/useSelfDMReport', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@hooks/useBulkPayOptions', () => ({
    __esModule: true,
    default: () => ({bulkPayButtonOptions: [], latestBankItems: []}),
}));

jest.mock('@hooks/useDefaultExpensePolicy', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@hooks/usePolicyForMovingExpenses', () => ({
    __esModule: true,
    default: () => ({policyForMovingExpensesID: undefined}),
}));

jest.mock('@hooks/usePaymentContext', () => ({
    __esModule: true,
    default: () => ({
        introSelected: undefined,
        isSelfTourViewed: false,
        activePolicyID: undefined,
        activePolicy: undefined,
        defaultWorkspaceName: undefined,
        userBillingGracePeriodEnds: undefined,
        amountOwed: undefined,
        ownerBillingGracePeriodEnd: undefined,
    }),
    PaymentContextProvider: ({children}: {children: unknown}) => children,
    useReportPaymentContext: () => ({}),
}));

const mockClearSelectedTransactions = jest.fn();
const mockSelectAllMatchingItems = jest.fn();
let mockSelectedTransactions: SelectedTransactions = {};
let mockExcludedTransactions: SelectedTransactions = {};
let mockSelectedReports: SelectedReports[] = [];
let mockAreAllMatchingItemsSelected = false;
let mockCurrentSearchResults: {search: {type: string}; data: Record<string, unknown>} | undefined;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionContext: () => ({
        selectedTransactions: mockSelectedTransactions,
        excludedTransactions: mockExcludedTransactions,
        selectedReports: mockSelectedReports,
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected,
    }),
    useSearchResultsContext: () => ({
        currentSearchResults: mockCurrentSearchResults,
    }),
    useSearchQueryContext: () => ({
        currentSearchKey: undefined,
    }),
    useSearchSelectionActions: () => ({
        clearSelectedTransactions: mockClearSelectedTransactions,
        selectAllMatchingItems: mockSelectAllMatchingItems,
    }),
}));

const CURRENT_USER_ACCOUNT_ID = 1;

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        login: 'test@example.com',
        accountID: CURRENT_USER_ACCOUNT_ID,
        email: 'test@example.com',
    })),
}));

const baseQueryJSON: SearchQueryJSON = {
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

const expenseReportQueryJSON: SearchQueryJSON = {
    ...baseQueryJSON,
    inputQuery: 'type:expense-report status:all',
    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: 'type', right: 'expense-report'},
};

const invoiceQueryJSON: SearchQueryJSON = {
    ...baseQueryJSON,
    inputQuery: 'type:invoice status:all',
    type: CONST.SEARCH.DATA_TYPES.INVOICE,
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: 'type', right: 'invoice'},
};

const groupedExpenseQueryJSON: SearchQueryJSON = {
    ...baseQueryJSON,
    inputQuery: 'type:expense sortBy:groupMerchant sortOrder:asc groupBy:merchant',
    groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT,
    sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
};

function makeSelectedTransaction(overrides: Partial<SelectedTransactions[string]> = {}): SelectedTransactions[string] {
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
        reportID: 'report1',
        policyID: 'policy1',
        amount: 100,
        displayAmount: 100,
        currency: 'USD',
        isFromOneTransactionReport: false,
        ...overrides,
    };
}

function hasSearchFlatFilters(value: unknown): value is {flatFilters: SearchQueryJSON['flatFilters']} {
    return typeof value === 'object' && value !== null && 'flatFilters' in value && Array.isArray(value.flatFilters);
}

/**
 * The export options take one of two shapes: normally they sit inside the Export entry's `subMenuItems`, but when
 * Export is the only bulk action available the dropdown opens straight onto them, so they sit at the top level of
 * `headerButtonsOptions` with the EXPORT value on each one.
 */
function getExportMenuItems(headerButtonsOptions: ReturnType<typeof useSearchBulkActions>['headerButtonsOptions']) {
    const exportOptions = headerButtonsOptions.filter((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.EXPORT);
    return exportOptions.at(0)?.subMenuItems ?? exportOptions;
}

describe('useSearchBulkActions - CSV export flow', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsOffline = false;
        mockAreAllMatchingItemsSelected = false;
        await Onyx.clear();
        mockSelectedTransactions = {};
        mockExcludedTransactions = {};
        mockSelectedReports = [];
        mockCurrentSearchResults = undefined;
        mockGetExportTemplates.mockReturnValue({customTemplates: [], defaultTemplates: []});

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@example.com'});
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('uses the unreported-expenses warning for a single expense report', async () => {
        // Given a single selected expense report
        mockSelectedTransactions = {report1: makeSelectedTransaction()};

        // When the bulk actions are created for an expense-report search
        renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        // Then the report deletion prompt explains that its expenses become unreported
        await waitFor(() => {
            expect(mockTranslate).toHaveBeenCalledWith('iou.deleteExpenseReportConfirmation');
        });
    });

    it('uses the generic report confirmation for a single invoice', async () => {
        // Given a single selected invoice
        mockSelectedTransactions = {report1: makeSelectedTransaction()};

        // When the bulk actions are created for an invoice search
        renderHook(() => useSearchBulkActions({queryJSON: invoiceQueryJSON}), {wrapper: OnyxListItemProvider});

        // Then the report deletion prompt does not claim that expenses become unreported
        await waitFor(() => {
            expect(mockTranslate).toHaveBeenCalledWith('iou.deleteReportConfirmation', {count: 1});
        });
        expect(mockTranslate).not.toHaveBeenCalledWith('iou.deleteExpenseReportConfirmation');
    });

    it('handleBasicExport with select-all tracks the export', async () => {
        mockAreAllMatchingItemsSelected = true;
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockExcludedTransactions = {tx2: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        const onSelected = getExportMenuItems(result.current.headerButtonsOptions).find((item) => item.text === 'export.currentView')?.onSelected;
        expect(onSelected).toBeDefined();

        await act(async () => {
            onSelected?.();
        });

        expect(mockQueueExportSearchItemsToCSV).toHaveBeenCalled();
        expect(mockQueueExportSearchItemsToCSV).toHaveBeenCalledWith(expect.objectContaining({excludedTransactionIDList: ['tx2']}));
    });

    it('exports an excluded unloaded group as a query filter instead of a transaction ID', async () => {
        const excludedGroupKey = `${CONST.SEARCH.GROUP_PREFIX}123` as const;
        mockAreAllMatchingItemsSelected = true;
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockExcludedTransactions = {[excludedGroupKey]: makeSelectedTransaction(), tx2: makeSelectedTransaction()};
        mockCurrentSearchResults = {
            search: {type: CONST.SEARCH.DATA_TYPES.EXPENSE},
            data: {
                [excludedGroupKey]: {merchant: 'Excluded merchant', count: 3, total: 300, currency: 'USD'},
            },
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: groupedExpenseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        const onSelected = getExportMenuItems(result.current.headerButtonsOptions).find((item) => item.text === 'export.currentView')?.onSelected;

        await act(async () => {
            onSelected?.();
        });

        const exportPayload = mockQueueExportSearchItemsToCSV.mock.calls.at(-1)?.at(0);
        expect(exportPayload?.excludedTransactionIDList).toEqual(['tx2']);
        expect(exportPayload?.jsonQuery).toContain('Excluded merchant');
        expect(exportPayload?.jsonQuery).toContain(`"operator":"${CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO}"`);
        expect(exportPayload?.jsonQuery).not.toContain('group_123');
    });

    it('preserves excluded group negations when the query already filters the grouped field', async () => {
        const firstExcludedGroupKey = `${CONST.SEARCH.GROUP_PREFIX}123` as const;
        const secondExcludedGroupKey = `${CONST.SEARCH.GROUP_PREFIX}456` as const;
        const filteredGroupedExpenseQueryJSON: SearchQueryJSON = {
            ...groupedExpenseQueryJSON,
            inputQuery: 'type:expense sortBy:groupCategory sortOrder:asc groupBy:category category:Meals,Travel,Lodging',
            groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY,
            flatFilters: [
                {
                    key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
                    filters: [
                        {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'Meals'},
                        {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'Travel'},
                        {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'Lodging'},
                    ],
                },
            ],
        };
        mockAreAllMatchingItemsSelected = true;
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockExcludedTransactions = {
            [firstExcludedGroupKey]: makeSelectedTransaction(),
            [secondExcludedGroupKey]: makeSelectedTransaction(),
        };
        mockCurrentSearchResults = {
            search: {type: CONST.SEARCH.DATA_TYPES.EXPENSE},
            data: {
                [firstExcludedGroupKey]: {category: 'Meals', count: 3, total: 300, currency: 'USD'},
                [secondExcludedGroupKey]: {category: 'Travel', count: 2, total: 200, currency: 'USD'},
            },
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: filteredGroupedExpenseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        const onSelected = getExportMenuItems(result.current.headerButtonsOptions).find((item) => item.text === 'export.currentView')?.onSelected;

        await act(async () => {
            onSelected?.();
        });

        const exportPayload = mockQueueExportSearchItemsToCSV.mock.calls.at(-1)?.at(0);
        const exportQueryJSON: unknown = JSON.parse(exportPayload?.jsonQuery ?? '{}');
        if (!hasSearchFlatFilters(exportQueryJSON)) {
            throw new Error('Expected the exported query to contain flat filters');
        }
        const categoryFilters = exportQueryJSON.flatFilters.filter((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY).flatMap((filter) => filter.filters);
        const includedCategoryFilters = categoryFilters.filter((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO);
        const excludedCategoryFilters = categoryFilters.filter((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO);
        expect(includedCategoryFilters).toEqual(
            expect.arrayContaining([
                {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'Meals'},
                {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'Travel'},
                {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'Lodging'},
            ]),
        );
        expect(excludedCategoryFilters).toEqual([
            {operator: CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO, value: 'Meals'},
            {operator: CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO, value: 'Travel'},
        ]);
    });

    it('does not export when an excluded group cannot be resolved', async () => {
        const excludedGroupKey = `${CONST.SEARCH.GROUP_PREFIX}123` as const;
        mockAreAllMatchingItemsSelected = true;
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockExcludedTransactions = {[excludedGroupKey]: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: groupedExpenseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        const onSelected = getExportMenuItems(result.current.headerButtonsOptions).find((item) => item.text === 'export.currentView')?.onSelected;

        await act(async () => {
            onSelected?.();
        });

        expect(mockQueueExportSearchItemsToCSV).not.toHaveBeenCalled();
    });

    it('keeps export available when every loaded transaction is excluded from an all-matching selection', async () => {
        mockAreAllMatchingItemsSelected = true;
        mockSelectedTransactions = {};
        mockExcludedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.EXPORT)).toBe(true);
        });
    });

    it('keeps expense-report export available when unloaded matching reports remain selected', async () => {
        mockAreAllMatchingItemsSelected = true;
        mockSelectedTransactions = {};
        mockExcludedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.EXPORT)).toBe(true);
        });
    });

    it('excludes a deselected report from an all-matching expense-report export query', async () => {
        mockAreAllMatchingItemsSelected = true;
        mockSelectedTransactions = {tx1: makeSelectedTransaction({reportID: 'report1'})};
        mockExcludedTransactions = {tx2: makeSelectedTransaction({reportID: 'report2'})};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        const onSelected = getExportMenuItems(result.current.headerButtonsOptions).find((item) => item.text === 'export.currentView')?.onSelected;

        await act(async () => {
            onSelected?.();
        });

        const exportPayload = mockQueueExportSearchItemsToCSV.mock.calls.at(-1)?.at(0);
        expect(exportPayload).toBeDefined();
        expect(exportPayload).not.toHaveProperty('excludedTransactionIDList');
        expect(exportPayload?.jsonQuery).toContain('-reportID:report2');
        const exportQueryJSON: unknown = JSON.parse(exportPayload?.jsonQuery ?? '{}');
        if (!hasSearchFlatFilters(exportQueryJSON)) {
            throw new Error('Expected the exported query to contain flat filters');
        }
        expect(exportQueryJSON.flatFilters).toContainEqual({
            key: CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID,
            filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO, value: 'report2'}],
        });
    });

    it('handleBasicExport with manual selection does not track any export', async () => {
        mockAreAllMatchingItemsSelected = false;
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        expect(mockQueueExportSearchItemsToCSV).not.toHaveBeenCalled();
    });

    it('beginExportWithTemplate tracks the export', async () => {
        mockAreAllMatchingItemsSelected = true;
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockGetExportTemplates.mockReturnValue({
            customTemplates: [{name: 'Custom template', templateName: 'custom-template', type: 'csv', policyID: undefined, description: ''}],
            defaultTemplates: [],
        });

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        const templateSubItem = getExportMenuItems(result.current.headerButtonsOptions).find((item) => item.text !== 'export.basicExport' && item.text !== 'export.currentView');

        expect(templateSubItem).toBeDefined();
        act(() => {
            templateSubItem?.onSelected?.();
        });

        expect(mockQueueExportSearchWithTemplate).toHaveBeenCalled();
    });

    it('hides template exports when an all-matching expense selection has exclusions', async () => {
        mockAreAllMatchingItemsSelected = true;
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockExcludedTransactions = {tx2: makeSelectedTransaction()};
        mockGetExportTemplates.mockReturnValue({
            customTemplates: [{name: 'Custom template', templateName: 'custom-template', type: 'csv', policyID: undefined, description: ''}],
            defaultTemplates: [
                {name: 'Default template', templateName: 'default-template', type: 'csv', policyID: undefined, description: ''},
                {
                    name: 'export.basicExport',
                    templateName: CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV,
                    type: 'csv',
                    policyID: undefined,
                    description: '',
                },
            ],
        });

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        const exportItems = getExportMenuItems(result.current.headerButtonsOptions);

        expect(exportItems.some((item) => item.text === 'Custom template')).toBe(false);
        expect(exportItems.some((item) => item.text === 'Default template')).toBe(false);
        expect(exportItems.some((item) => item.text === 'export.currentView')).toBe(true);
        expect(exportItems.some((item) => item.text === 'export.basicExport')).toBe(true);
    });

    describe('bulk unhold', () => {
        it('calls unholdRequest with the live Onyx transaction instead of the stale selection snapshot', async () => {
            const transactionID = 'tx1';
            const liveTransaction = createRandomTransaction(1);
            const staleSnapshotTransaction = createRandomTransaction(2);
            liveTransaction.transactionID = transactionID;
            liveTransaction.merchant = 'Live Onyx merchant';
            staleSnapshotTransaction.transactionID = transactionID;
            staleSnapshotTransaction.merchant = 'Stale snapshot merchant';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, liveTransaction);

            mockSelectedTransactions = {
                [transactionID]: makeSelectedTransaction({
                    canUnhold: true,
                    policyID: undefined,
                    transaction: staleSnapshotTransaction,
                    reportAction: createMock<ReportAction>({childReportID: 'childReport1'}),
                }),
            };

            const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

            await waitFor(() => {
                expect(result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD)).toBeDefined();
            });

            act(() => {
                result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD)?.onSelected?.();
            });

            expect(mockUnholdRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionID,
                    transaction: expect.objectContaining({transactionID, merchant: 'Live Onyx merchant'}),
                    reportID: 'childReport1',
                }),
            );
        });
    });
});

describe('useSearchBulkActions - a group checked through its header while its rows load', () => {
    const groupKey = `${CONST.SEARCH.GROUP_PREFIX}acme`;

    function buildUnreportedExpense(transactionID: string): Transaction {
        return {...createRandomTransaction(0), transactionID, reportID: CONST.REPORT.UNREPORTED_REPORT_ID};
    }

    function checkOnItsOwn(transactionID: string) {
        mockSelectedTransactions[transactionID] = makeSelectedTransaction({transaction: buildUnreportedExpense(transactionID), reportID: CONST.REPORT.UNREPORTED_REPORT_ID});
    }

    function checkOnItsOwnWithReceipt(transactionID: string) {
        const transaction = {...buildUnreportedExpense(transactionID), receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE}};
        mockSelectedTransactions[transactionID] = makeSelectedTransaction({transaction, reportID: CONST.REPORT.UNREPORTED_REPORT_ID});
    }

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsOffline = false;
        mockAreAllMatchingItemsSelected = false;
        mockExcludedTransactions = {};
        mockSelectedReports = [];
        mockEnabledBetas = [CONST.BETAS.BULK_EDIT];
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction({canHold: true, groupKey, isSelectedViaGroup: true, transaction: buildUnreportedExpense('tx1'), reportID: CONST.REPORT.UNREPORTED_REPORT_ID}),
            tx2: makeSelectedTransaction({canHold: true, groupKey, isSelectedViaGroup: true, transaction: buildUnreportedExpense('tx2'), reportID: CONST.REPORT.UNREPORTED_REPORT_ID}),
        };
        mockGetExportTemplates.mockReturnValue({customTemplates: [], defaultTemplates: []});
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@example.com'});
    });

    afterEach(async () => {
        mockEnabledBetas = [];
        await Onyx.clear();
    });

    function renderWithGroupCount(count: number, otherGroups: Record<string, unknown> = {}) {
        const loadedExpenses = Object.fromEntries(
            Object.values(mockSelectedTransactions).flatMap(({transaction}) => (transaction ? [[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction]] : [])),
        );
        mockCurrentSearchResults = {
            search: {type: CONST.SEARCH.DATA_TYPES.EXPENSE},
            data: {...loadedExpenses, [groupKey]: {count, total: 12990, currency: CONST.CURRENCY.USD, merchant: 'Acme'}, ...otherGroups},
        };
        return renderHook(() => useSearchBulkActions({queryJSON: groupedExpenseQueryJSON}), {wrapper: OnyxListItemProvider});
    }

    async function getOfferedActions(count: number, otherGroups: Record<string, unknown> = {}) {
        const {result} = renderWithGroupCount(count, otherGroups);
        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });
        return result.current.headerButtonsOptions.map((option) => option.value);
    }

    it('offers only the actions that cover the whole group, as for a group checked while collapsed', async () => {
        // Given two loaded rows of a 692-expense group, both of which could be held, checked through the group's header

        // When the bulk actions are built
        const values = await getOfferedActions(692);

        // Then Hold is not offered, since it would hold two expenses under a selection that reads 692, while Export, which covers the group, still is
        expect(values).not.toContain(CONST.SEARCH.BULK_ACTION_TYPES.HOLD);
        expect(values).toContain(CONST.SEARCH.BULK_ACTION_TYPES.EXPORT);
    });

    it('offers the row actions once every row of the group is loaded', async () => {
        // Given the same two rows checked through the header, which are now the whole group

        // When the bulk actions are built
        const values = await getOfferedActions(2);

        // Then Hold is offered, since holding the loaded rows holds the whole group
        expect(values).toContain(CONST.SEARCH.BULK_ACTION_TYPES.HOLD);
    });

    it('does not offer Edit multiple for expenses checked next to a group that is still loading', async () => {
        // Given two expenses checked on their own, which could be edited together, next to a 692-expense group checked through its header
        checkOnItsOwn('tx3');
        checkOnItsOwn('tx4');

        // When the bulk actions are built
        const values = await getOfferedActions(692);

        // Then Edit multiple is not offered, since it would edit the two expenses and none of the group's
        expect(values).not.toContain(CONST.SEARCH.BULK_ACTION_TYPES.EDIT);
    });

    it('offers Edit multiple for the same selection once every row of the group is loaded', async () => {
        // Given the same two expenses next to the group, whose two checked rows are now the whole group
        checkOnItsOwn('tx3');
        checkOnItsOwn('tx4');

        // When the bulk actions are built
        const values = await getOfferedActions(2);

        // Then Edit multiple is offered, since it edits every checked expense, the group's included
        expect(values).toContain(CONST.SEARCH.BULK_ACTION_TYPES.EDIT);
    });

    it('does not offer Merge for an expense checked next to a group that is still loading', async () => {
        // Given one expense checked on its own next to a 692-expense group checked through its header
        checkOnItsOwn('tx3');

        // When the bulk actions are built
        const values = await getOfferedActions(692);

        // Then Merge is not offered, since it would merge the one expense as if nothing else were checked
        expect(values).not.toContain(CONST.SEARCH.BULK_ACTION_TYPES.MERGE);
    });

    it('does not offer Download receipts for an expense checked next to a group that is still loading', async () => {
        // Given one expense with a receipt checked on its own next to a 692-expense group checked through its header
        checkOnItsOwnWithReceipt('tx3');

        // When the bulk actions are built
        const values = await getOfferedActions(692);

        // Then Download receipts is not offered, since it would download the one receipt and none of the group's
        expect(values).not.toContain(CONST.SEARCH.BULK_ACTION_TYPES.DOWNLOAD_RECEIPTS);
    });

    it('offers Download receipts for the same selection once every row of the group is loaded', async () => {
        // Given the same expense next to the group, whose two checked rows are now the whole group
        checkOnItsOwnWithReceipt('tx3');

        // When the bulk actions are built
        const values = await getOfferedActions(2);

        // Then Download receipts is offered, since it reads every checked expense, the group's included
        expect(values).toContain(CONST.SEARCH.BULK_ACTION_TYPES.DOWNLOAD_RECEIPTS);
    });

    it('offers Download receipts next to a cash back row checked under its own key, since that row holds no expenses', async () => {
        // Given the same expense next to the whole group, and a cash back row checked under its own key, as selecting the page does
        const cashBackKey = `${CONST.SEARCH.GROUP_PREFIX}cashBack`;
        checkOnItsOwnWithReceipt('tx3');
        mockSelectedTransactions[cashBackKey] = makeSelectedTransaction();

        // When the bulk actions are built
        const values = await getOfferedActions(2, {[cashBackKey]: {count: 0, total: -2500, currency: CONST.CURRENCY.USD, isCashBack: true}});

        // Then Download receipts is still offered, since the cash back row leaves out no expense
        expect(values).toContain(CONST.SEARCH.BULK_ACTION_TYPES.DOWNLOAD_RECEIPTS);
    });

    it('offers Move under Select all next to a group that is still loading, since the move is sent as the query', async () => {
        // Given every matching expense selected, with two movable rows of one submitter loaded from a 692-expense group checked through its header
        mockAreAllMatchingItemsSelected = true;
        mockSelectedTransactions = Object.fromEntries(
            Object.entries(mockSelectedTransactions).map(([key, entry]) => [key, {...entry, canChangeReport: true, ownerAccountID: CURRENT_USER_ACCOUNT_ID}]),
        );

        // When the bulk actions are built
        const values = await getOfferedActions(692);

        // Then Move is offered, since the query it sends reaches the rows not loaded
        expect(values).toContain(CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_REPORT);
    });

    it('keeps the selection it acts on the same across renders while a group is still loading, so nothing derived from it is rebuilt', async () => {
        // Given two loaded rows of a 692-expense group checked through its header
        const {result, rerender} = renderWithGroupCount(692);
        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });
        const {selectedTransactionReportIDs} = result.current;

        // When the hook renders again with nothing changed
        rerender({});

        // Then what it derives from the selection is the same, since the group entry is not built again
        expect(result.current.selectedTransactionReportIDs).toBe(selectedTransactionReportIDs);
    });
});
