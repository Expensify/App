import {act, renderHook, waitFor} from '@testing-library/react-native';

import {ModalActions} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';

import useSearchBulkActions from '@hooks/useSearchBulkActions';

import {approveMoneyRequest} from '@libs/actions/IOU/ReportWorkflow';
import {
    getExportTemplates,
    queueBulkApproveReports,
    queueBulkDeleteExpenses,
    queueBulkDeleteReports,
    queueBulkSubmitReports,
    queueBulkUnholdExpenses,
    queueExportSearchItemsToCSV,
    queueExportSearchWithTemplate,
    submitMoneyRequestOnSearch,
} from '@libs/actions/Search';
import type * as SearchUIUtils from '@libs/SearchUIUtils';

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
    queueBulkApproveReports: jest.fn(),
    queueBulkDeleteExpenses: jest.fn(),
    queueBulkDeleteReports: jest.fn(),
    queueBulkSubmitReports: jest.fn(),
    queueBulkUnholdExpenses: jest.fn(),
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

jest.mock('@libs/actions/IOU/ReportWorkflow', () => ({
    approveMoneyRequest: jest.fn(),
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

jest.mock('@libs/SearchUIUtils', () => ({
    ...jest.requireActual<typeof SearchUIUtils>('@libs/SearchUIUtils'),
    shouldShowDeleteOption: jest.fn(() => true),
}));

const mockShowConfirmModal = jest.fn();
jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));
jest.mock('@libs/showConfirmModalAfterMoreMenuDismiss', () => ({
    __esModule: true,
    default: (showConfirmModal: (options: unknown) => Promise<unknown>, options: unknown) => showConfirmModal(options),
}));

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: () => false, isBetaEnabledOrUnknown: () => false}),
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
});

describe('useSearchBulkActions - Approve under Select all', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsOffline = false;
        mockAreAllMatchingItemsSelected = true;
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

    it('queues a server-side bulk approval instead of approving per report', async () => {
        // Given "Select all" is checked with an approvable expense loaded, so the selection can span more reports than are on the page
        mockSelectedTransactions = {tx1: makeSelectedTransaction({action: CONST.SEARCH.ACTION_TYPES.APPROVE})};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE)).toBe(true);
        });

        // When the user selects Approve
        const approveOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE);
        await act(async () => {
            await approveOption?.onSelected?.();
        });

        // Then the approval is handed to the backend via the search query, not looped per loaded report
        expect(queueBulkApproveReports).toHaveBeenCalledTimes(1);
        expect(queueBulkApproveReports).toHaveBeenCalledWith(expect.any(String));
        expect(approveMoneyRequest).not.toHaveBeenCalled();
        expect(mockClearSelectedTransactions).toHaveBeenCalled();
    });

    it('leaves out reports the user deselected from the bulk approval', async () => {
        // Given "Select all" on a reports search, with one report deselected afterwards
        mockSelectedTransactions = {tx1: makeSelectedTransaction({action: CONST.SEARCH.ACTION_TYPES.APPROVE, reportID: 'report1'})};
        mockExcludedTransactions = {tx2: makeSelectedTransaction({reportID: 'report2'})};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE)).toBe(true);
        });

        // When the user selects Approve
        const approveOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE);
        await act(async () => {
            await approveOption?.onSelected?.();
        });

        // Then the query sent to the backend excludes the deselected report, so it isn't approved
        expect(queueBulkApproveReports).toHaveBeenCalledWith(expect.stringContaining('report2'));
    });

    it('keeps the Approve option when a loaded expense is held', async () => {
        // Given a held expense on the loaded page, which hides Approve for a normal selection
        mockSelectedTransactions = {tx1: makeSelectedTransaction({action: CONST.SEARCH.ACTION_TYPES.APPROVE, isHeld: true})};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        // Then Approve is still offered, because the backend skips reports it cannot approve
        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE)).toBe(true);
        });
    });

    it('hides the Approve option when no loaded expense can be approved', async () => {
        // Given nothing on the loaded page is awaiting the user's approval
        mockSelectedTransactions = {tx1: makeSelectedTransaction({action: CONST.SEARCH.ACTION_TYPES.VIEW})};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        // Then Approve is not offered
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE)).toBe(false);
    });
});

describe('useSearchBulkActions - Submit under Select all', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsOffline = false;
        mockAreAllMatchingItemsSelected = true;
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

    it('queues a server-side bulk submit instead of submitting per report', async () => {
        // Given "Select all" is checked with a submittable expense loaded, so the selection can span more reports than are on the page
        mockSelectedTransactions = {tx1: makeSelectedTransaction({action: CONST.SEARCH.ACTION_TYPES.SUBMIT})};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT)).toBe(true);
        });

        // When the user selects Submit
        const submitOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT);
        await act(async () => {
            await submitOption?.onSelected?.();
        });

        // Then the submit is handed to the backend via the search query, not looped per loaded report
        expect(queueBulkSubmitReports).toHaveBeenCalledTimes(1);
        expect(queueBulkSubmitReports).toHaveBeenCalledWith(expect.any(String));
        expect(submitMoneyRequestOnSearch).not.toHaveBeenCalled();
        expect(mockClearSelectedTransactions).toHaveBeenCalled();
    });

    it('leaves out reports the user deselected from the bulk submit', async () => {
        // Given "Select all" on a reports search, with one report deselected afterwards
        mockSelectedTransactions = {tx1: makeSelectedTransaction({action: CONST.SEARCH.ACTION_TYPES.SUBMIT, reportID: 'report1'})};
        mockExcludedTransactions = {tx2: makeSelectedTransaction({reportID: 'report2'})};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT)).toBe(true);
        });

        // When the user selects Submit
        const submitOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT);
        await act(async () => {
            await submitOption?.onSelected?.();
        });

        // Then the query sent to the backend excludes the deselected report, so it isn't submitted
        expect(queueBulkSubmitReports).toHaveBeenCalledWith(expect.stringContaining('report2'));
    });

    it('hides the Submit option when no loaded expense can be submitted', async () => {
        // Given nothing on the loaded page is waiting to be submitted
        mockSelectedTransactions = {tx1: makeSelectedTransaction({action: CONST.SEARCH.ACTION_TYPES.VIEW})};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        // Then Submit is not offered
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT)).toBe(false);
    });

    it('hides the Submit option when offline', async () => {
        // Given a submittable expense is loaded but the user is offline
        mockIsOffline = true;
        mockSelectedTransactions = {tx1: makeSelectedTransaction({action: CONST.SEARCH.ACTION_TYPES.SUBMIT})};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        // Then Submit is not offered
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT)).toBe(false);
    });

    it('hides the Submit option for a Submit plan workspace, where the approver is picked per report', async () => {
        // Given the loaded submittable expense belongs to a Submit plan workspace
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, {id: 'policy1', type: CONST.POLICY.TYPE.SUBMIT});
        mockSelectedTransactions = {tx1: makeSelectedTransaction({action: CONST.SEARCH.ACTION_TYPES.SUBMIT, policyID: 'policy1'})};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        // Then Submit is not offered, because the backend cannot ask which approver to send each report to
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT)).toBe(false);
    });
});

describe('useSearchBulkActions - Hold, Unhold and Reject under Select all', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsOffline = false;
        mockAreAllMatchingItemsSelected = true;
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

    it('offers Hold when one loaded expense can be held, even if another cannot', async () => {
        // Given "Select all" with one holdable expense and one that is already held, which hides Hold for a normal selection
        mockSelectedTransactions = {tx1: makeSelectedTransaction({canHold: true}), tx2: makeSelectedTransaction({canHold: false, canUnhold: true})};

        // When the bulk actions are built
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        // Then both Hold and Unhold are offered, because the backend only acts on the expenses the user can act on
        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.HOLD)).toBe(true);
        });
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD)).toBe(true);
    });

    it('queues a server-side bulk unhold without the expenses the user deselected', async () => {
        // Given "Select all" on an expenses search with a held expense loaded, and one expense deselected afterwards
        mockSelectedTransactions = {tx1: makeSelectedTransaction({canUnhold: true})};
        mockExcludedTransactions = {tx2: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD)).toBe(true);
        });

        // When the user selects Unhold
        const unholdOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD);
        await act(async () => {
            await unholdOption?.onSelected?.();
        });

        // Then the search is handed to the backend with the deselected expense listed, so it stays held
        expect(queueBulkUnholdExpenses).toHaveBeenCalledTimes(1);
        expect(queueBulkUnholdExpenses).toHaveBeenCalledWith(expect.any(String), ['tx2']);
        expect(mockClearSelectedTransactions).toHaveBeenCalled();
    });

    it('offers Reject on an expenses search when one loaded expense can be rejected', async () => {
        // Given "Select all" on an expenses search with one rejectable expense and one that is not, which hides Reject for a normal selection
        mockSelectedTransactions = {tx1: makeSelectedTransaction({canReject: true}), tx2: makeSelectedTransaction({canReject: false})};

        // When the bulk actions are built
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        // Then Reject is offered, because the backend only rejects expenses on reports the user can reject
        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.REJECT)).toBe(true);
        });
    });

    it('does not offer Reject on a reports search', async () => {
        // Given "Select all" on a reports search with a rejectable expense loaded
        mockSelectedTransactions = {tx1: makeSelectedTransaction({canReject: true})};

        // When the bulk actions are built
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        // Then Reject is not offered, the same as for a normal selection of reports
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.REJECT)).toBe(false);
    });

    it('hides Hold and Unhold when no loaded expense can be held or unheld', async () => {
        // Given nothing on the loaded page can be held or unheld
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};

        // When the bulk actions are built
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        // Then neither is offered
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.HOLD)).toBe(false);
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD)).toBe(false);
    });
});

describe('useSearchBulkActions - Delete under Select all', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsOffline = false;
        mockAreAllMatchingItemsSelected = true;
        await Onyx.clear();
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockExcludedTransactions = {};
        mockSelectedReports = [];
        mockCurrentSearchResults = undefined;
        mockGetExportTemplates.mockReturnValue({customTemplates: [], defaultTemplates: []});

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@example.com'});
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('queues a server-side delete of every matching report once the user confirms', async () => {
        // Given "Select all" on a reports search and a user who confirms the delete
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        // When the user deletes the selection
        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DELETE)).toBe(true);
        });
        const deleteOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DELETE);
        await act(async () => {
            await deleteOption?.onSelected?.();
        });

        // Then the search is handed to the backend to delete the reports, not looped per loaded report
        expect(queueBulkDeleteReports).toHaveBeenCalledWith(expect.any(String));
        expect(queueBulkDeleteExpenses).not.toHaveBeenCalled();
        expect(mockClearSelectedTransactions).toHaveBeenCalled();
    });

    it('queues a server-side delete of every matching expense without the ones the user deselected', async () => {
        // Given "Select all" on an expenses search with one expense deselected, and a user who confirms the delete
        mockExcludedTransactions = {tx2: makeSelectedTransaction()};
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        // When the user deletes the selection
        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DELETE)).toBe(true);
        });
        const deleteOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DELETE);
        await act(async () => {
            await deleteOption?.onSelected?.();
        });

        // Then the search is handed to the backend with the deselected expense listed, so it is kept
        expect(queueBulkDeleteExpenses).toHaveBeenCalledWith(expect.any(String), ['tx2']);
        expect(queueBulkDeleteReports).not.toHaveBeenCalled();
    });

    it('deletes nothing when the user cancels the confirmation', async () => {
        // Given "Select all" and a user who cancels the delete confirmation
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CLOSE});
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        // When the user backs out
        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DELETE)).toBe(true);
        });
        const deleteOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DELETE);
        await act(async () => {
            await deleteOption?.onSelected?.();
        });

        // Then nothing is queued
        expect(queueBulkDeleteExpenses).not.toHaveBeenCalled();
        expect(queueBulkDeleteReports).not.toHaveBeenCalled();
    });
});
