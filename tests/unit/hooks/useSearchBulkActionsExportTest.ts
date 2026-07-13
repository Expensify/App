import {renderHook, waitFor} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';

import useSearchBulkActions from '@hooks/useSearchBulkActions';

import type * as ReportSecondaryActionUtilsModule from '@libs/ReportSecondaryActionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, SearchResults} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import type * as MockUsePaymentContextUtil from '../../utils/mockUsePaymentContext';

import createRandomPolicy from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock('@libs/actions/Report', () => ({
    deleteAppReport: jest.fn(),
    moveIOUReportToPolicy: jest.fn(),
    moveIOUReportToPolicyAndInviteSubmitter: jest.fn(),
    exportReportToPDF: jest.fn(),
    markAsManuallyExported: jest.fn(),
}));

jest.mock('@libs/actions/IOU/Hold', () => ({
    unholdRequest: jest.fn(),
}));

jest.mock('@libs/actions/IOU/PayMoneyRequest', () => ({
    payInvoice: jest.fn(),
    payMoneyRequest: jest.fn(),
}));

jest.mock('@libs/actions/SplitExpenses.ts', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/actions/Search', () => ({
    getExportTemplates: jest.fn(() => []),
    exportSearchItemsToCSV: jest.fn(),
    exportToIntegrationOnSearch: jest.fn(),
    queueExportSearchItemsToCSV: jest.fn(),
    queueExportSearchWithTemplate: jest.fn(),
    getSearchApproveOnyxData: jest.fn(() => ({})),
    getLastPolicyBankAccountID: jest.fn(),
    getLastPolicyPaymentMethod: jest.fn(),
    getPayMoneyOnSearchInvoiceParams: jest.fn(),
    getPayOption: jest.fn(() => ({shouldEnableBulkPayOption: false, isFirstTimePayment: false})),
    // Faithful mock of the real helper: prefer live Onyx, fall back to the search snapshot.
    // The fix routes the policy reads through this helper so the integration gate works on a fresh
    // load when the policy is only present in the search snapshot.
    getPolicyFromSearchSnapshot: jest.fn((policyID?: string, searchData?: Record<string, unknown>, policies?: Record<string, unknown>) =>
        policyID ? (policies?.[`policy_${policyID}`] ?? searchData?.[`policy_${policyID}`]) : undefined,
    ),
    // Faithful mock of the real helper: prefer the search snapshot, fall back to live Onyx.
    // This is exactly the resolution the fix relies on so the export gate works on a fresh load.
    getReportFromSearchSnapshot: jest.fn((reportID?: string, searchData?: Record<string, unknown>, allReports?: Record<string, unknown>) =>
        reportID ? (searchData?.[`report_${reportID}`] ?? allReports?.[`report_${reportID}`]) : undefined,
    ),
    getReportType: jest.fn(),
    getSearchPayOnyxData: jest.fn(() => ({})),
    getTotalFormattedAmount: jest.fn(() => ''),
    isCurrencySupportWalletBulkPay: jest.fn(() => false),
    resolveSearchPayPaymentMethod: jest.fn(),
    submitMoneyRequestOnSearch: jest.fn(),
}));

// Control which export actions a report supports without depending on the full
// integration/permission chain in getSecondaryExportReportActions. The key behavior under
// test is that the snapshot-resolved report (truthy) reaches this function; without the fix
// the report is undefined and canReportBeExported bails before ever calling it.
const mockGetSecondaryExportReportActions = jest.fn((...args: Parameters<typeof ReportSecondaryActionUtilsModule.getSecondaryExportReportActions>) => {
    const report = args[2];
    return report ? [CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION, CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED] : [];
});
jest.mock('@libs/ReportSecondaryActionUtils', () => ({
    ...jest.requireActual<typeof ReportSecondaryActionUtilsModule>('@libs/ReportSecondaryActionUtils'),
    getSecondaryExportReportActions: (...args: Parameters<typeof ReportSecondaryActionUtilsModule.getSecondaryExportReportActions>) => mockGetSecondaryExportReportActions(...args),
}));

jest.mock('@libs/actions/MergeTransaction', () => ({
    setupMergeTransactionDataAndNavigate: jest.fn(),
}));

jest.mock('@libs/actions/User', () => ({
    setNameValuePair: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => '/test'),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a && b,
        formatPhoneNumber: (phone: string) => phone,
    }),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({colorMuted: {}, fontWeightNormal: {}, textWrap: {}, integrationIcon: {}}),
}));

jest.mock('@hooks/useTheme', () => ({
    __esModule: true,
    default: () => ({icon: ''}),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));

jest.mock('@hooks/useEnvironment', () => ({
    __esModule: true,
    default: () => ({isProduction: true, isDevelopment: false, environment: 'production'}),
}));

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessState: () => ({isDelegateAccessRestricted: false}),
    useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: jest.fn()}),
}));

const mockShowConfirmModal = jest.fn();
jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
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

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({
        getCurrencyDecimals: jest.fn(() => 2),
        convertToDisplayString: jest.fn((amount: number) => `$${amount}`),
    }),
}));

jest.mock('@hooks/useUndeleteTransactions', () => ({
    __esModule: true,
    default: () => jest.fn(),
}));

jest.mock('@libs/SearchUIUtils', () => ({
    shouldShowDeleteOption: () => false,
    getSelectedGroupFilterEntry: jest.fn(),
    navigateToSearchRHP: jest.fn(),
    // The export queries under test are not grouped, so this resolves to undefined.
    getValidGroupBy: jest.fn((groupBy?: string) => groupBy),
}));

jest.mock('@hooks/useDuplicateTransactionsAndViolations', () => ({
    __esModule: true,
    default: () => ({duplicateTransactions: {}, duplicateTransactionViolations: {}}),
}));

jest.mock('react-native', () => ({
    InteractionManager: {
        runAfterInteractions: (callback: () => void | Promise<void>) => {
            callback();
            return {cancel: jest.fn()};
        },
    },
}));

// ---------------------------------------------------------------------------
// Mutable context state
// ---------------------------------------------------------------------------

const mockClearSelectedTransactions = jest.fn();
const mockSelectAllMatchingItems = jest.fn();
let mockSelectedTransactions: SelectedTransactions = {};
let mockSelectedReports: SelectedReports[] = [];
let mockCurrentSearchResults: SearchResults | undefined;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionContext: () => ({
        selectedTransactions: mockSelectedTransactions,
        selectedReports: mockSelectedReports,
        areAllMatchingItemsSelected: false,
    }),
    useSearchResultsContext: () => ({
        currentSearchResults: mockCurrentSearchResults,
    }),
    useSearchQueryContext: () => ({
        currentSearchKey: undefined,
        currentSearchHash: 12345,
        currentSearchQueryJSON: undefined,
        suggestedSearches: undefined,
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

jest.mock('@hooks/usePaymentContext', () => {
    const {default: mockUsePaymentContext} = jest.requireActual<typeof MockUsePaymentContextUtil>('../../utils/mockUsePaymentContext');
    return mockUsePaymentContext;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const REPORT_ID = 'report1';
const POLICY_ID = 'policy1';
const NETSUITE_FRIENDLY_NAME = CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[CONST.POLICY.CONNECTIONS.NAME.NETSUITE];

const expenseReportQueryJSON: SearchQueryJSON = {
    inputQuery: 'type:expense-report status:all',
    hash: 12345,
    recentSearchHash: 12345,
    similarSearchHash: 12345,
    flatFilters: [],
    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    view: CONST.SEARCH.VIEW.TABLE,
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: 'type', right: 'expense-report'},
};

function makeSelectedReport(overrides: Partial<SelectedReports> = {}): SelectedReports {
    return {
        reportID: REPORT_ID,
        policyID: POLICY_ID,
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        canPay: false,
        canApprove: false,
        canSubmit: false,
        canChangeApprover: false,
        total: 100,
        currency: 'USD',
        chatReportID: undefined,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        ...overrides,
    };
}

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
        reportID: REPORT_ID,
        policyID: POLICY_ID,
        amount: 100,
        currency: 'USD',
        isFromOneTransactionReport: false,
        ...overrides,
    };
}

/** A complete report as it arrives from the search API (lives in the snapshot, not live Onyx on a fresh load). */
function makeSnapshotReport(): Report {
    return {
        ...createRandomReport(CURRENT_USER_ACCOUNT_ID, undefined),
        reportID: REPORT_ID,
        policyID: POLICY_ID,
        reportName: 'Approved report',
        type: CONST.REPORT.TYPE.EXPENSE,
        stateNum: CONST.REPORT.STATE_NUM.APPROVED,
        statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
    };
}

/** Build a minimal expense-report search snapshot containing the given reports keyed by their collection key. */
function makeSearchResults(reports: Report[]): SearchResults {
    const data: SearchResults['data'] = {};
    for (const report of reports) {
        data[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = report;
    }
    return {
        search: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            hash: 0,
            offset: 0,
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
            count: 1,
            total: 100,
            currency: 'USD',
        },
        data,
    };
}

function getExportSubMenuItems(headerButtonsOptions: ReturnType<typeof useSearchBulkActions>['headerButtonsOptions']) {
    return headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.EXPORT)?.subMenuItems;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useSearchBulkActions - report export options resolve from the search snapshot', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockSelectedTransactions = {};
        mockSelectedReports = [];
        mockCurrentSearchResults = undefined;

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@example.com'});
        // A policy connected to NetSuite so the integration export branch is reachable.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {}},
        });
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('offers the integration export options when the report is only in the search snapshot (fresh load)', async () => {
        /**
         * Given: a selected, exportable report that exists ONLY in the search snapshot and is
         *        absent from the live Onyx REPORT collection.
         *
         * This is the fresh-load bug condition: SearchBulkActionsButton renders outside
         * SearchScopeProvider, so the bulk-export gate reading live Onyx finds no report and
         * canReportBeExported bails at `if (!completeReport) return false` — hiding the options
         * until the user opens a report first.
         *
         * When: the export bulk-action menu is built.
         *
         * Then: the snapshot report is resolved via getReportFromSearchSnapshot and the
         *       integration export ("Export to NetSuite") and "Mark as Exported" options appear
         *       without opening any report.
         */
        mockCurrentSearchResults = makeSearchResults([makeSnapshotReport()]);

        // NOTE: deliberately NOT writing the live Onyx report_<id> — that is the bug condition.

        mockSelectedReports = [makeSelectedReport()];
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            const subMenuItems = getExportSubMenuItems(result.current.headerButtonsOptions);
            expect(subMenuItems?.some((item) => item.text === NETSUITE_FRIENDLY_NAME)).toBe(true);
        });

        const subMenuItems = getExportSubMenuItems(result.current.headerButtonsOptions);
        expect(subMenuItems?.some((item) => item.text === 'workspace.common.markAsExported')).toBe(true);

        // The export gate received the snapshot report even though live Onyx had none.
        expect(mockGetSecondaryExportReportActions).toHaveBeenCalledWith(
            CURRENT_USER_ACCOUNT_ID,
            'test@example.com',
            expect.objectContaining({reportID: REPORT_ID}),
            undefined,
            expect.objectContaining({id: 'policy1'}),
        );
    });

    it('offers the integration export options when the policy is only in the search snapshot (fresh load)', async () => {
        /**
         * Given: an exportable report plus its connected policy that both exist ONLY in the search
         *        snapshot and are absent from the live Onyx POLICY collection.
         *
         * This is the policy-side of the same fresh-load bug: SearchBulkActionsButton renders outside
         * SearchScopeProvider, so a policy that has not yet loaded into live Onyx previously made
         * connectedIntegration undefined and dropped the entire integration block, hiding "Export to
         * NetSuite" and "Mark as Exported".
         *
         * When: the export bulk-action menu is built.
         *
         * Then: the snapshot policy is resolved via getPolicyFromSearchSnapshot and both integration
         *       options appear without the policy ever being present in live Onyx.
         */
        // Remove the live Onyx policy written in beforeEach so it lives ONLY in the search snapshot.
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, null);

        const searchResults = makeSearchResults([makeSnapshotReport()]);
        searchResults.data[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`] = {
            ...createRandomPolicy(1),
            id: POLICY_ID,
            // Only the presence of the connection key matters for getConnectedIntegration.
            connections: {[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {}} as Policy['connections'],
        };
        mockCurrentSearchResults = searchResults;

        mockSelectedReports = [makeSelectedReport()];
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            const subMenuItems = getExportSubMenuItems(result.current.headerButtonsOptions);
            expect(subMenuItems?.some((item) => item.text === NETSUITE_FRIENDLY_NAME)).toBe(true);
        });

        const subMenuItems = getExportSubMenuItems(result.current.headerButtonsOptions);
        expect(subMenuItems?.some((item) => item.text === 'workspace.common.markAsExported')).toBe(true);
    });

    it('does NOT offer the integration export options when the report is absent from both snapshot and live Onyx', async () => {
        /**
         * Given: a selected report that exists in neither the search snapshot nor live Onyx.
         *
         * When: the export bulk-action menu is built.
         *
         * Then: getReportFromSearchSnapshot returns undefined, canReportBeExported bails, and the
         *       integration export / "Mark as Exported" options are not offered. This guards against
         *       regressing the gate into showing options for reports we cannot resolve.
         */
        mockCurrentSearchResults = makeSearchResults([]);

        mockSelectedReports = [makeSelectedReport()];
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.EXPORT)).toBeDefined();
        });

        const exportOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.EXPORT);
        const subMenuItems = exportOption?.subMenuItems ?? [];
        expect(subMenuItems.some((item) => item.text === NETSUITE_FRIENDLY_NAME)).toBe(false);
        expect(subMenuItems.some((item) => item.text === 'workspace.common.markAsExported')).toBe(false);
    });
});
