import {act, renderHook, waitFor} from '@testing-library/react-native';

import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';

import useSearchBulkActions from '@hooks/useSearchBulkActions';

import {queueExportSearchItemsToCSV, queueExportSearchWithTemplate} from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

const mockQueueExportSearchItemsToCSV = jest.mocked(queueExportSearchItemsToCSV);
const mockQueueExportSearchWithTemplate = jest.mocked(queueExportSearchWithTemplate);

jest.mock('@libs/actions/Export', () => ({
    clearExportDownload: jest.fn(),
}));

jest.mock('@libs/actions/Search', () => ({
    getExportTemplates: jest.fn(() => []),
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

jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionContext: () => ({
        selectedTransactions: mockSelectedTransactions,
        excludedTransactions: mockExcludedTransactions,
        selectedReports: mockSelectedReports,
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected,
    }),
    useSearchResultsContext: () => ({
        currentSearchResults: undefined,
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
    status: CONST.SEARCH.STATUS.EXPENSE.ALL,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    view: CONST.SEARCH.VIEW.TABLE,
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: 'type', right: 'expense'},
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

        const exportOption = result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.EXPORT);
        expect(exportOption).toBeDefined();

        const onSelected = exportOption?.subMenuItems?.find((item) => item.text === 'export.basicExport')?.onSelected ?? exportOption?.onSelected;

        await act(async () => {
            onSelected?.();
        });

        expect(mockQueueExportSearchItemsToCSV).toHaveBeenCalled();
        expect(mockQueueExportSearchItemsToCSV).toHaveBeenCalledWith(expect.objectContaining({excludedTransactionIDList: ['tx2']}));
        expect(result.current.exportDownloadStatusModal).not.toBeNull();
    });

    it('handleBasicExport with manual selection does not track any export', async () => {
        mockAreAllMatchingItemsSelected = false;
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        expect(mockQueueExportSearchItemsToCSV).not.toHaveBeenCalled();
        expect(result.current.exportDownloadStatusModal).toBeNull();
    });

    it('beginExportWithTemplate tracks the export', async () => {
        mockAreAllMatchingItemsSelected = true;
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        const exportOption = result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.EXPORT);
        const templateSubItem = exportOption?.subMenuItems?.find((item) => item.text !== 'export.basicExport' && item.text !== 'export.currentView');

        if (templateSubItem?.onSelected) {
            act(() => {
                templateSubItem.onSelected?.();
            });

            expect(mockQueueExportSearchWithTemplate).toHaveBeenCalled();
            expect(result.current.exportDownloadStatusModal).not.toBeNull();
        }
    });
});
