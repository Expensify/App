import {act, renderHook, waitFor} from '@testing-library/react-native';

import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';

import useSearchBulkActions from '@hooks/useSearchBulkActions';

import {getExportTemplates, queueExportSearchItemsToCSV, queueExportSearchWithTemplate} from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

const mockQueueExportSearchItemsToCSV = jest.mocked(queueExportSearchItemsToCSV);
const mockQueueExportSearchWithTemplate = jest.mocked(queueExportSearchWithTemplate);
const mockGetExportTemplates = jest.mocked(getExportTemplates);

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
    payMoneyRequestOnSearch: jest.fn(),
    submitMoneyRequestOnSearch: jest.fn(),
    unholdMoneyRequestOnSearch: jest.fn(),
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

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: () => false}),
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
        betas: undefined,
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

    it('handleBasicExport with select-all tracks the export', async () => {
        mockAreAllMatchingItemsSelected = true;
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockExcludedTransactions = {tx2: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

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

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: groupedExpenseQueryJSON}));

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

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: filteredGroupedExpenseQueryJSON}));

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

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: groupedExpenseQueryJSON}));

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

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.EXPORT)).toBe(true);
        });
    });

    it('keeps the original expense-report export guard when no loaded transaction is selected', async () => {
        mockAreAllMatchingItemsSelected = true;
        mockSelectedTransactions = {};
        mockExcludedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

        expect(result.current.headerButtonsOptions).toEqual([]);
    });

    it('does not send exclusions for an expense-report export', async () => {
        mockAreAllMatchingItemsSelected = true;
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockExcludedTransactions = {tx2: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

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
    });

    it('handleBasicExport with manual selection does not track any export', async () => {
        mockAreAllMatchingItemsSelected = false;
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

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

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

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

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        const exportItems = getExportMenuItems(result.current.headerButtonsOptions);

        expect(exportItems.some((item) => item.text === 'Custom template')).toBe(false);
        expect(exportItems.some((item) => item.text === 'Default template')).toBe(false);
        expect(exportItems.some((item) => item.text === 'export.currentView')).toBe(true);
        expect(exportItems.some((item) => item.text === 'export.basicExport')).toBe(true);
    });
});
