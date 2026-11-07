import {act, renderHook, waitFor} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';

import useSearchBulkActions from '@hooks/useSearchBulkActions';

import {unholdRequest} from '@libs/actions/IOU/Hold';
import {approveMoneyRequest} from '@libs/actions/IOU/ReportWorkflow';
import {
    exportSearchItemsToCSV,
    getExportTemplates,
    queueBulkApproveReports,
    queueBulkSubmitReports,
    queueExportSearchItemsToCSV,
    queueExportSearchWithTemplate,
    submitMoneyRequestOnSearch,
} from '@libs/actions/Search';
import type * as SearchActions from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, ReportAction, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';
import createMock from '../../utils/createMock';

const mockQueueExportSearchItemsToCSV = jest.mocked(queueExportSearchItemsToCSV);
const mockQueueExportSearchWithTemplate = jest.mocked(queueExportSearchWithTemplate);
const mockExportSearchItemsToCSV = jest.mocked(exportSearchItemsToCSV);
const mockGetExportTemplates = jest.mocked(getExportTemplates);
const mockUnholdRequest = jest.mocked(unholdRequest);

jest.mock('@libs/actions/Export', () => ({
    clearExportDownload: jest.fn(),
}));

jest.mock('@libs/actions/Search', () => ({
    // The hook and shouldShowDeleteOption resolve report actions through this helper, so the real implementation has to stay available
    getReportActionsFromSearchSnapshot: jest.requireActual<typeof SearchActions>('@libs/actions/Search').getReportActionsFromSearchSnapshot,
    getExportTemplates: jest.fn(() => ({customTemplates: [], defaultTemplates: []})),
    exportSearchItemsToCSV: jest.fn(),
    queueExportSearchItemsToCSV: jest.fn(() => 'mock-export-id'),
    queueExportSearchWithTemplate: jest.fn(() => 'mock-template-export-id'),
    queueBulkApproveReports: jest.fn(),
    queueBulkSubmitReports: jest.fn(),
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

const mockShowDecisionModal = jest.fn();
jest.mock('@hooks/useDecisionModal', () => ({
    __esModule: true,
    default: () => ({showDecisionModal: mockShowDecisionModal}),
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
        activePolicyID: undefined,
        activePolicy: undefined,
        defaultWorkspaceName: undefined,
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
let mockCurrentSearchResults: {search?: {type: string}; data?: Record<string, unknown>} | undefined;

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

function makeSelectedReport(overrides: Partial<SelectedReports> = {}): SelectedReports {
    return {
        reportID: 'report1',
        policyID: 'policy1',
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        canPay: false,
        canApprove: false,
        canSubmit: false,
        canChangeApprover: false,
        total: 100,
        chatReportID: undefined,
        ...overrides,
    };
}

function hasSearchFlatFilters(value: unknown): value is {flatFilters: SearchQueryJSON['flatFilters']} {
    return typeof value === 'object' && value !== null && 'flatFilters' in value && Array.isArray(value.flatFilters);
}

function expectQueryToExcludeReport(jsonQuery: string | undefined, reportID: string) {
    const queryJSON: unknown = JSON.parse(jsonQuery ?? '{}');
    if (!hasSearchFlatFilters(queryJSON)) {
        throw new Error('Expected the queued query to contain flat filters');
    }
    expect(queryJSON.flatFilters).toContainEqual({
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID,
        filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO, value: reportID}],
    });
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

    it('exports excluded unloaded groups in a groups-only export as query filters', async () => {
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

        // When the same exclusions are exported as summaries only.
        await act(async () => {
            getExportMenuItems(result.current.headerButtonsOptions)
                .find((item) => item.text === 'export.currentViewGroupsOnly')
                ?.onSelected?.();
        });

        // Then both the summary-only flag and exclusions reach the queued export.
        expect(mockQueueExportSearchItemsToCSV).toHaveBeenLastCalledWith(
            expect.objectContaining({isGroupsOnly: true, excludedTransactionIDList: ['tx2'], jsonQuery: exportPayload?.jsonQuery}),
        );
    });

    it('exports a selected merchant group with an exact merchant match', async () => {
        // Given a merchant-grouped search where the user ticked the "Amazon" group, so its loaded child is stamped with the group key
        const merchantGroupKey = `${CONST.SEARCH.GROUP_PREFIX}123` as const;
        mockSelectedTransactions = {tx1: makeSelectedTransaction({groupKey: merchantGroupKey, isSelectedViaGroup: true})};
        mockCurrentSearchResults = {
            search: {type: CONST.SEARCH.DATA_TYPES.EXPENSE},
            data: {
                [merchantGroupKey]: {merchant: 'Amazon', count: 3, total: 300, currency: 'USD'},
            },
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: groupedExpenseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        // When the user exports the current view of that group selection
        const onSelected = getExportMenuItems(result.current.headerButtonsOptions).find((item) => item.text === 'export.currentView')?.onSelected;

        await act(async () => {
            onSelected?.();
        });

        // Then the backend receives the merchant filter as `eq`, because a `contains` match on "Amazon" would also
        // export "Amazon Marketplace" expenses that are not in the selected group
        const [exportPayload] = mockExportSearchItemsToCSV.mock.calls.at(-1) ?? [];
        expect(exportPayload?.isGroupExport).toBe(true);
        expect(exportPayload?.jsonQuery).toContain(`"operator":"${CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO}","left":"${CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}","right":"Amazon"`);
        expect(exportPayload?.jsonQuery).not.toContain(`"operator":"${CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS}"`);
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

    it('does not crash when selected reports remain while the snapshot has no data', async () => {
        // Given a report is still selected while a new search's snapshot only has `search` (its optimistic loading state),
        // because the selection is cleared from an effect that runs after this render
        mockSelectedTransactions = {tx1: makeSelectedTransaction({reportID: 'report1'})};
        mockSelectedReports = [
            {
                reportID: 'report1',
                policyID: 'policy1',
                action: CONST.SEARCH.ACTION_TYPES.VIEW,
                canPay: false,
                canApprove: false,
                canSubmit: false,
                canChangeApprover: false,
                total: 100,
                chatReportID: undefined,
            },
        ];
        mockCurrentSearchResults = {search: {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}};

        // When the bulk actions are created for an expense-report search
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        // Then the hook renders its options instead of throwing, and Merge stays hidden until the results load
        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.MERGE_REPORTS)).toBe(false);
    });

    it.each([
        {queryJSON: baseQueryJSON, selectionCount: 1},
        {queryJSON: baseQueryJSON, selectionCount: 2},
        {queryJSON: expenseReportQueryJSON, selectionCount: 1},
        {queryJSON: expenseReportQueryJSON, selectionCount: 2},
    ])('renders $queryJSON.type bulk actions for $selectionCount selections without search metadata', async ({queryJSON, selectionCount}) => {
        // Given expense edits can create snapshot data before search metadata exists
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        if (selectionCount === 2) {
            mockSelectedTransactions.tx2 = makeSelectedTransaction();
        }
        if (queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
            mockSelectedReports = [makeSelectedReport()];
        }
        mockCurrentSearchResults = {data: {}};

        // When selection renders bulk actions before a complete snapshot has loaded
        const {result, rerender} = renderHook(() => useSearchBulkActions({queryJSON}), {wrapper: OnyxListItemProvider});

        // Then query-based actions remain available instead of crashing on missing metadata
        await waitFor(() => {
            expect(getExportMenuItems(result.current.headerButtonsOptions).some((option) => option.text === 'export.currentView')).toBe(true);
        });
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DOWNLOAD_PDF)).toBe(
            queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        );

        // When current results disappear, the hook can reuse the previously cached partial snapshot
        mockCurrentSearchResults = undefined;
        rerender({});

        // Then the cached snapshot is also safe to use while results are unavailable
        expect(getExportMenuItems(result.current.headerButtonsOptions).some((option) => option.text === 'export.currentView')).toBe(true);

        // When complete metadata arrives, normal action rendering resumes
        mockCurrentSearchResults = {search: {type: queryJSON.type}, data: {}};
        rerender({});

        // Then complete snapshots retain the same query-based actions
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DOWNLOAD_PDF)).toBe(
            queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        );
    });

    it.each([
        {description: 'falls back to the query when metadata is missing', search: undefined, queryJSON: expenseReportQueryJSON},
        {description: 'prefers snapshot metadata over the query', search: {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}, queryJSON: baseQueryJSON},
    ])('current-view export $description', async ({search, queryJSON}) => {
        // Given export needs the report column definitions from either the snapshot or its query fallback
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockCurrentSearchResults = {search, data: {}};
        const {result} = renderHook(() => useSearchBulkActions({queryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportMenuItems(result.current.headerButtonsOptions).some((option) => option.text === 'export.currentView')).toBe(true);
        });

        // When the current-view export builds its column labels
        await act(async () => {
            getExportMenuItems(result.current.headerButtonsOptions)
                .find((option) => option.text === 'export.currentView')
                ?.onSelected?.();
        });

        // Then report columns prove the resolved search type was used, not the default expense type
        expect(mockExportSearchItemsToCSV.mock.calls.at(-1)?.[0]?.exportColumnLabels).toContain(`"${CONST.SEARCH.TABLE_COLUMNS.TITLE}":`);
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

        it('shows the unhold option offline and removes the hold from every selected expense optimistically', async () => {
            // Given the user is offline with two held expenses selected that they can unhold
            mockIsOffline = true;
            mockSelectedTransactions = {
                tx1: makeSelectedTransaction({
                    canUnhold: true,
                    isHeld: true,
                    policyID: undefined,
                    reportAction: createMock<ReportAction>({childReportID: 'childReport1'}),
                }),
                tx2: makeSelectedTransaction({
                    canUnhold: true,
                    isHeld: true,
                    policyID: undefined,
                    reportAction: createMock<ReportAction>({childReportID: 'childReport2'}),
                }),
            };

            const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

            // Then the unhold option is offered, because unholdRequest works offline with optimistic data
            await waitFor(() => {
                expect(result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD)).toBeDefined();
            });

            // When the user selects it
            act(() => {
                result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD)?.onSelected?.();
            });

            // Then each expense is unheld with the offline flag, and the offline modal is not shown
            expect(mockUnholdRequest).toHaveBeenCalledTimes(2);
            expect(mockUnholdRequest).toHaveBeenCalledWith(expect.objectContaining({transactionID: 'tx1', reportID: 'childReport1', isOffline: true}));
            expect(mockUnholdRequest).toHaveBeenCalledWith(expect.objectContaining({transactionID: 'tx2', reportID: 'childReport2', isOffline: true}));
            expect(mockShowDecisionModal).not.toHaveBeenCalled();
        });
    });

    describe('bulk move', () => {
        function makeUnreportedCardExpense(transactionID: string, cardID: number) {
            const transaction = createRandomTransaction(Number(transactionID.replace('tx', '')));
            transaction.transactionID = transactionID;
            transaction.reportID = CONST.REPORT.UNREPORTED_REPORT_ID;
            transaction.cardID = cardID;
            return makeSelectedTransaction({canChangeReport: true, reportID: CONST.REPORT.UNREPORTED_REPORT_ID, policyID: undefined, transaction});
        }

        it('offers Move expenses for several unreported card expenses that belong to the same cardholder', async () => {
            // Given the user's own card, and two unreported expenses on it that have no money request action in the snapshot
            const cardID = 101;
            await Onyx.merge(ONYXKEYS.CARD_LIST, {[cardID]: createMock<Card>({cardID, accountID: CURRENT_USER_ACCOUNT_ID})});
            mockSelectedTransactions = {
                tx1: makeUnreportedCardExpense('tx1', cardID),
                tx2: makeUnreportedCardExpense('tx2', cardID),
            };

            // When the bulk actions are created for the Expenses search
            const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

            // Then the owner resolves through the card and Move expenses is offered
            await waitFor(() => {
                expect(result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_REPORT)).toBeDefined();
            });
        });

        it('hides Move expenses for several unreported expenses whose owner cannot be resolved', async () => {
            // Given two unreported expenses on a card the user cannot see, with no money request action in the snapshot
            mockSelectedTransactions = {
                tx1: makeUnreportedCardExpense('tx1', 202),
                tx2: makeUnreportedCardExpense('tx2', 202),
            };

            // When the bulk actions are created for the Expenses search
            const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

            // Then Move expenses stays hidden, because the expenses could belong to different submitters
            await waitFor(() => {
                expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
            });
            expect(result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_REPORT)).toBeUndefined();
        });
    });
});

describe('useSearchBulkActions - a group checked through its header while its rows load', () => {
    const groupKey = `${CONST.SEARCH.GROUP_PREFIX}acme`;

    function buildUnreportedExpense(transactionID: string): Transaction {
        return {...createRandomTransaction(0), transactionID, reportID: CONST.REPORT.UNREPORTED_REPORT_ID};
    }

    function checkOnItsOwn(transactionID: string) {
        mockSelectedTransactions[transactionID] = makeSelectedTransaction({canHold: true, transaction: buildUnreportedExpense(transactionID), reportID: CONST.REPORT.UNREPORTED_REPORT_ID});
    }

    // Every write of a group's rows stamps them, and here the two rows checked through the header are the whole group.
    function markGroupWhole() {
        mockSelectedTransactions = {
            ...mockSelectedTransactions,
            tx1: {...mockSelectedTransactions.tx1, isEntireGroupSelected: true, coveredGroupCount: 2},
            tx2: {...mockSelectedTransactions.tx2, isEntireGroupSelected: true, coveredGroupCount: 2},
        };
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

    function renderWithGroupCount(count: number) {
        const loadedExpenses = Object.fromEntries(
            Object.values(mockSelectedTransactions).flatMap(({transaction}) => (transaction ? [[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction]] : [])),
        );
        mockCurrentSearchResults = {
            search: {type: CONST.SEARCH.DATA_TYPES.EXPENSE},
            data: {...loadedExpenses, [groupKey]: {count, total: 12990, currency: CONST.CURRENCY.USD, merchant: 'Acme'}},
        };
        return renderHook(() => useSearchBulkActions({queryJSON: groupedExpenseQueryJSON}), {wrapper: OnyxListItemProvider});
    }

    async function getOfferedActions(count: number) {
        const {result} = renderWithGroupCount(count);
        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });
        return result.current.headerButtonsOptions.map((option) => option.value);
    }

    it('offers only the actions that cover the whole group, as for a group checked while collapsed', async () => {
        // Given two loaded rows of a 692-expense group, both holdable, checked through its header

        // When the bulk actions are built
        const values = await getOfferedActions(692);

        // Then Hold is not offered, since it would hold two expenses under a selection that reads 692, while Export still is
        expect(values).not.toContain(CONST.SEARCH.BULK_ACTION_TYPES.HOLD);
        expect(values).toContain(CONST.SEARCH.BULK_ACTION_TYPES.EXPORT);
    });

    it('offers the Export options of the workspace its rows belong to', async () => {
        // Given two loaded rows of a 692-expense group on one workspace, each from a one-expense report, checked through its header
        mockSelectedTransactions = {
            tx1: {...mockSelectedTransactions.tx1, isFromOneTransactionReport: true},
            tx2: {...mockSelectedTransactions.tx2, isFromOneTransactionReport: true},
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, {id: 'policy1', exportLayouts: {}});

        // When the bulk actions are built
        await getOfferedActions(692);

        // Then the templates are read for that workspace with report level export included, as they are for its rows
        const [, , , , policy, includeReportLevelExport] = mockGetExportTemplates.mock.lastCall ?? [];
        expect(policy?.id).toBe('policy1');
        expect(includeReportLevelExport).toBe(true);
    });

    it('offers the row actions for a wholly selected group whose rows a refresh kept off the page', async () => {
        // Given the group's two rows checked through its header and wholly selected, one of them kept off the page
        mockSelectedTransactions = {
            tx1: {...mockSelectedTransactions.tx1, isEntireGroupSelected: true},
            tx2: {...mockSelectedTransactions.tx2, isEntireGroupSelected: true, isKeptOffPage: true},
        };

        // When the bulk actions are built
        const values = await getOfferedActions(2);

        // Then Hold is still offered, since the kept row still names its expense
        expect(values).toContain(CONST.SEARCH.BULK_ACTION_TYPES.HOLD);
    });

    it('does not offer Edit multiple for expenses checked next to a group that is still loading', async () => {
        // Given two expenses checked on their own next to a 692-expense group checked through its header
        checkOnItsOwn('tx3');
        checkOnItsOwn('tx4');

        // When the bulk actions are built
        const values = await getOfferedActions(692);

        // Then Edit multiple is not offered, since it would edit the two expenses and none of the group's
        expect(values).not.toContain(CONST.SEARCH.BULK_ACTION_TYPES.EDIT);
    });

    it('offers the row actions and Edit multiple for the same selection once every row of the group is loaded', async () => {
        // Given the same two expenses next to the group, whose two checked rows are now the whole group
        checkOnItsOwn('tx3');
        checkOnItsOwn('tx4');
        markGroupWhole();

        // When the bulk actions are built
        const values = await getOfferedActions(2);

        // Then Hold and Edit multiple are offered, since both act on every checked expense
        expect(values).toContain(CONST.SEARCH.BULK_ACTION_TYPES.HOLD);
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

    it('offers Move under Select all next to a group that is still loading, since the move is sent as the query', async () => {
        // Given Select all, with two movable rows of one submitter loaded from a 692-expense group
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
        // Given "Select all" on a reports search with a loaded report the user can approve, so the selection can span more reports than are on the page
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockSelectedReports = [makeSelectedReport({canApprove: true})];

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

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
        // Given "Select all" on a reports search, with report2 deselected afterwards
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockSelectedReports = [makeSelectedReport({canApprove: true})];
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

        // Then the query sent to the backend excludes report2, so it isn't approved
        expectQueryToExcludeReport(jest.mocked(queueBulkApproveReports).mock.calls.at(-1)?.at(0), 'report2');
    });

    it('queues the bulk approval when one of the selected reports can be approved', async () => {
        // Given "Select all" on a reports search, where only one loaded report can be approved
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockSelectedReports = [makeSelectedReport({canApprove: true}), makeSelectedReport({reportID: 'report2'})];

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE)).toBe(true);
        });

        // When the user selects Approve
        const approveOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE);
        await act(async () => {
            await approveOption?.onSelected?.();
        });

        // Then the backend gets the search query and skips the report the user can't approve
        expect(queueBulkApproveReports).toHaveBeenCalledTimes(1);
    });

    it('keeps the Approve option when a loaded expense is held', async () => {
        // Given a held expense on the loaded page, which hides Approve for a normal selection
        mockSelectedTransactions = {tx1: makeSelectedTransaction({isHeld: true})};
        mockSelectedReports = [makeSelectedReport({canApprove: true})];

        // When the bulk actions are built for a reports search
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        // Then Approve is still offered, because the backend leaves held expenses out of the approval
        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE)).toBe(true);
        });
    });

    it('hides the Approve option when no loaded report can be approved', async () => {
        // Given nothing on the loaded page can be approved by the user
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockSelectedReports = [makeSelectedReport()];

        // When the bulk actions are built for a reports search
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        // Then Approve is not offered
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE)).toBe(false);
    });

    it('hides the Approve option on an expenses search', async () => {
        // Given "Select all" on an expenses search
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockSelectedReports = [makeSelectedReport({canApprove: true})];

        // When the bulk actions are built for an expenses search
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        // Then Approve is not offered, because approve is a report action and expense rows only offer View
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
        // Given "Select all" on a reports search with a loaded report the user can submit, so the selection can span more reports than are on the page
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockSelectedReports = [makeSelectedReport({canSubmit: true})];

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

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
        // Given "Select all" on a reports search, with report2 deselected afterwards
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockSelectedReports = [makeSelectedReport({canSubmit: true})];
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

        // Then the query sent to the backend excludes report2, so it isn't submitted
        expectQueryToExcludeReport(jest.mocked(queueBulkSubmitReports).mock.calls.at(-1)?.at(0), 'report2');
    });

    it('queues the bulk submit when one of the selected reports can be submitted', async () => {
        // Given "Select all" on a reports search, where only one loaded report can be submitted
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockSelectedReports = [makeSelectedReport({canSubmit: true}), makeSelectedReport({reportID: 'report2'})];

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT)).toBe(true);
        });

        // When the user selects Submit
        const submitOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT);
        await act(async () => {
            await submitOption?.onSelected?.();
        });

        // Then the backend gets the search query and skips the report the user can't submit
        expect(queueBulkSubmitReports).toHaveBeenCalledTimes(1);
    });

    it('hides the Submit option when offline', async () => {
        // Given a submittable report is loaded but the user is offline
        mockIsOffline = true;
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockSelectedReports = [makeSelectedReport({canSubmit: true})];

        // When the bulk actions are built for a reports search
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        // Then Submit is not offered
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT)).toBe(false);
    });

    it('hides the Submit option for a Submit plan workspace, where the approver is picked per report', async () => {
        // Given the loaded submittable report belongs to a Submit plan workspace
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, {id: 'policy1', type: CONST.POLICY.TYPE.SUBMIT});
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockSelectedReports = [makeSelectedReport({canSubmit: true})];

        // When the bulk actions are built for a reports search
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        // Then Submit is not offered, because the backend cannot ask which approver to send each report to
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT)).toBe(false);
    });

    it('hides the Submit option when no loaded report can be submitted', async () => {
        // Given nothing on the loaded page can be submitted by the user
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockSelectedReports = [makeSelectedReport()];

        // When the bulk actions are built for a reports search
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        // Then Submit is not offered
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT)).toBe(false);
    });

    it('hides the Submit option on an expenses search', async () => {
        // Given "Select all" on an expenses search
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockSelectedReports = [makeSelectedReport({canSubmit: true})];

        // When the bulk actions are built for an expenses search
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        // Then Submit is not offered, because submit is a report action and expense rows only offer View
        expect(result.current.headerButtonsOptions.some((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT)).toBe(false);
    });
});
