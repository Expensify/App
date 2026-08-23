import {renderHook, waitFor} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';

import useSearchBulkActions from '@hooks/useSearchBulkActions';

import {markAsManuallyExported} from '@libs/actions/Report';
import {exportSearchItemsToCSV, exportToIntegrationOnSearch, getExportTemplates} from '@libs/actions/Search';
import type * as ReportSecondaryActionUtilsModule from '@libs/ReportSecondaryActionUtils';

import CONST from '@src/CONST';
import type CONSTType from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions, SearchResults} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import type * as MockUsePaymentContextUtil from '../../utils/mockUsePaymentContext';

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
    getExportTemplates: jest.fn(() => ({
        customTemplates: [{name: 'Custom template', templateName: 'customTemplate', type: 'in-app', policyID: undefined, description: ''}],
        defaultTemplates: [
            {name: 'export.expenseLevelExport', templateName: 'detailed_export', type: 'integrations', policyID: undefined, description: ''},
            {name: 'export.reportLevelExport', templateName: 'report_level_export', type: 'integrations', policyID: undefined, description: ''},
        ],
    })),
    exportSearchItemsToCSV: jest.fn(),
    exportToIntegrationOnSearch: jest.fn(),
    queueExportSearchItemsToCSV: jest.fn(),
    queueExportSearchWithTemplate: jest.fn(),
    getSearchApproveOnyxData: jest.fn(() => ({})),
    getLastPolicyBankAccountID: jest.fn(),
    getLastPolicyPaymentMethod: jest.fn(),
    getPayMoneyOnSearchInvoiceParams: jest.fn(),
    getPayOption: jest.fn(() => ({shouldEnableBulkPayOption: false, isFirstTimePayment: false})),
    getPolicyFromSearchSnapshot: jest.fn(),
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
// integration/permission chain in getReportAccountingExportActions. The key behavior under
// test is that the snapshot-resolved report (truthy) reaches this function; without the fix
// the report is undefined and canReportBeExported bails before ever calling it.
const mockGetSecondaryExportReportActions = jest.fn((...args: Parameters<typeof ReportSecondaryActionUtilsModule.getReportAccountingExportActions>) => {
    const report = args[2];
    if (!report) {
        return [];
    }
    // A submitted (not yet approved) report is not eligible to export, so it drops out of the eligible subset.
    if (report.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED) {
        return [];
    }
    return [CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION, CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED];
});
jest.mock('@libs/ReportSecondaryActionUtils', () => ({
    ...jest.requireActual<typeof ReportSecondaryActionUtilsModule>('@libs/ReportSecondaryActionUtils'),
    getReportAccountingExportActions: (...args: Parameters<typeof ReportSecondaryActionUtilsModule.getReportAccountingExportActions>) => mockGetSecondaryExportReportActions(...args),
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

jest.mock('@hooks/useLocalize', () => {
    const actualCONST = jest.requireActual<{default: typeof CONSTType}>('@src/CONST').default;
    return {
        __esModule: true,
        default: () => ({
            translate: (key: string) => {
                if (key === 'workspace.accounting.qbo') {
                    return actualCONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.quickbooksOnline;
                }
                if (key === 'workspace.accounting.intuitEnterpriseSuite') {
                    return actualCONST.EXPORT_LABELS.INTUIT_ENTERPRISE_SUITE;
                }
                return key;
            },
            localeCompare: (a: string, b: string) => a && b,
            formatPhoneNumber: (phone: string) => phone,
        }),
    };
});

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
    useMemoizedLazyExpensifyIcons: (icons: string[]) => Object.fromEntries(icons.map((icon) => [icon, icon])),
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
    getValidGroupBy: jest.fn((groupBy?: string) => groupBy),
    getSearchColumnTranslationKey: jest.fn((column: string) => column),
    getColumnsToShow: jest.fn(() => []),
}));

jest.mock('@hooks/useDuplicateTransactionsAndViolations', () => ({
    __esModule: true,
    default: () => ({duplicateTransactions: {}, duplicateTransactionViolations: {}}),
}));

// ---------------------------------------------------------------------------
// Mutable context state
// ---------------------------------------------------------------------------

const mockClearSelectedTransactions = jest.fn();
const mockSelectAllMatchingItems = jest.fn();
let mockSelectedTransactions: SelectedTransactions = {};
let mockSelectedReports: SelectedReports[] = [];
let mockCurrentSearchResults: SearchResults | undefined;
let mockAreAllMatchingItemsSelected = false;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionContext: () => ({
        selectedTransactions: mockSelectedTransactions,
        selectedReports: mockSelectedReports,
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected,
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

const mockGetExportTemplates = jest.mocked(getExportTemplates);

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
const REPORT_ID_2 = 'report2';
const POLICY_ID_2 = 'policy2';
const NETSUITE_FRIENDLY_NAME = CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[CONST.POLICY.CONNECTIONS.NAME.NETSUITE];
const QBO_FRIENDLY_NAME = CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[CONST.POLICY.CONNECTIONS.NAME.QBO];
const IES_FRIENDLY_NAME = CONST.EXPORT_LABELS.INTUIT_ENTERPRISE_SUITE;

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

const groupedExpenseQueryJSON: SearchQueryJSON = {
    ...expenseReportQueryJSON,
    inputQuery: 'type:expense groupBy:category',
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
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
function makeSnapshotReport(reportID: string = REPORT_ID, policyID: string = POLICY_ID): Report {
    return {
        ...createRandomReport(CURRENT_USER_ACCOUNT_ID, undefined),
        reportID,
        policyID,
        reportName: 'Approved report',
        type: CONST.REPORT.TYPE.EXPENSE,
        stateNum: CONST.REPORT.STATE_NUM.APPROVED,
        statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
    };
}

/** A complete snapshot report that has already been exported (backend sets `isExportedToIntegration`). */
function makeExportedSnapshotReport(reportID: string = REPORT_ID, policyID: string = POLICY_ID): Report {
    return {
        ...makeSnapshotReport(reportID, policyID),
        isExportedToIntegration: true,
    };
}

/** A submitted (not yet approved) report — ineligible to export, so it is filtered out of the eligible subset. */
function makeSubmittedReport(reportID: string = REPORT_ID, policyID: string = POLICY_ID): Report {
    return {
        ...makeSnapshotReport(reportID, policyID),
        reportName: 'Submitted report',
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    };
}

/** Build a minimal expense-report search snapshot containing the given reports (and optional report actions) keyed by their collection key. */
function makeSearchResults(reports: Report[], reportActionsByReportID: Record<string, ReportActions> = {}): SearchResults {
    const data: SearchResults['data'] = {};
    for (const report of reports) {
        data[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = report;
    }
    for (const [reportID, reportActions] of Object.entries(reportActionsByReportID)) {
        data[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = reportActions;
    }
    return {
        search: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            hash: 0,
            offset: 0,
            sortBy: 'date',
            sortOrder: 'desc',
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

function getExportOptionTexts(headerButtonsOptions: ReturnType<typeof useSearchBulkActions>['headerButtonsOptions']) {
    const exportOption = headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.EXPORT);
    return exportOption?.subMenuItems?.map((item) => item.text) ?? (exportOption ? [exportOption.text] : []);
}

/** The export menu collapses into a single top-level option when it holds only one item, so look in both shapes. */
function getExportOptionByText(headerButtonsOptions: ReturnType<typeof useSearchBulkActions>['headerButtonsOptions'], text: string) {
    const exportOption = headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.EXPORT);
    if (!exportOption) {
        return undefined;
    }
    return exportOption.subMenuItems?.find((item) => item.text === text) ?? (exportOption.text === text ? exportOption : undefined);
}

/** The parameters the last plain-CSV export sent to the backend, with the serialized query parsed back. */
function getLastCSVExportParameters() {
    const [parameters] = jest.mocked(exportSearchItemsToCSV).mock.calls.at(-1) ?? [];
    if (!parameters) {
        throw new Error('exportSearchItemsToCSV was not called');
    }
    const query: unknown = JSON.parse(parameters.jsonQuery);
    const columnLabels: unknown = JSON.parse(parameters.exportColumnLabels);
    return {...parameters, query, columnLabels};
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useSearchBulkActions - export options', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockSelectedTransactions = {};
        mockSelectedReports = [];
        mockCurrentSearchResults = undefined;
        // Both confirmation modals (partial-export and export-again) resolve to CONFIRM by default; individual
        // tests override with mockResolvedValueOnce to exercise the cancel path.
        mockShowConfirmModal.mockResolvedValue({action: 'CONFIRM'});
        mockAreAllMatchingItemsSelected = false;

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

    it('offers per-integration export options when reports span workspaces connected to different integrations', async () => {
        /**
         * Given: two selected reports on two workspaces connected to different integrations
         *        (report1 → NetSuite, report2 → QuickBooks Online).
         *
         * When: the export bulk-action menu is built.
         *
         * Then: instead of hiding all integration options (the previous behavior, which only showed
         *       them when every selected report shared a single workspace), the menu surfaces one
         *       "Export to <integration>" option and one "Mark as exported" option per integration,
         *       and each action is scoped to the reports for that integration.
         */
        // A second workspace connected to QBO.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID_2}`, {
            id: POLICY_ID_2,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBO]: {}},
        });

        mockCurrentSearchResults = makeSearchResults([makeSnapshotReport(), makeSnapshotReport(REPORT_ID_2, POLICY_ID_2)]);

        mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: REPORT_ID_2, policyID: POLICY_ID_2})];
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction(),
            tx2: makeSelectedTransaction({reportID: REPORT_ID_2, policyID: POLICY_ID_2}),
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            const subMenuItems = getExportSubMenuItems(result.current.headerButtonsOptions);
            expect(subMenuItems?.some((item) => item.text === QBO_FRIENDLY_NAME)).toBe(true);
        });

        const subMenuItems = getExportSubMenuItems(result.current.headerButtonsOptions) ?? [];

        // Both integrations' export options are present...
        expect(subMenuItems.some((item) => item.text === NETSUITE_FRIENDLY_NAME)).toBe(true);
        expect(subMenuItems.some((item) => item.text === QBO_FRIENDLY_NAME)).toBe(true);
        // ...along with one "Mark as exported" option per integration.
        expect(subMenuItems.filter((item) => item.text === 'workspace.common.markAsExported')).toHaveLength(2);

        // Each integration's actions are grouped together: its "Export to <integration>" option is
        // immediately followed by its own "Mark as exported" option, before the next integration.
        const integrationOptionTexts = subMenuItems
            .map((item) => item.text)
            .filter((text) => text === NETSUITE_FRIENDLY_NAME || text === QBO_FRIENDLY_NAME || text === 'workspace.common.markAsExported');
        expect(integrationOptionTexts).toEqual([NETSUITE_FRIENDLY_NAME, 'workspace.common.markAsExported', QBO_FRIENDLY_NAME, 'workspace.common.markAsExported']);

        expect(markAsManuallyExported).not.toHaveBeenCalled();
    });

    it('offers distinct QBO and IES export options and marks reports with their respective workspace product when both are selected', async () => {
        /**
         * Given: two selected reports across two workspaces:
         *        - Workspace 1 connected to QuickBooks Online (QBO)
         *        - Workspace 2 connected to Intuit Enterprise Suite (IES)
         *
         * When: the export bulk-action menu is built.
         *
         * Then: both "QuickBooks Online" and "Intuit Enterprise Suite" export options are present,
         *       each followed by its own "Mark as exported" option scoped to that workspace.
         */
        const policy1 = {
            id: POLICY_ID,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBO]: {}},
        };
        const policy2 = {
            id: POLICY_ID_2,
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                    config: {credentials: {scope: 'app-foundations.custom-dimensions.read'}},
                },
            },
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy1);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID_2}`, policy2);

        mockCurrentSearchResults = makeSearchResults([makeSnapshotReport(), makeSnapshotReport(REPORT_ID_2, POLICY_ID_2)]);
        mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: REPORT_ID_2, policyID: POLICY_ID_2})];
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction(),
            tx2: makeSelectedTransaction({reportID: REPORT_ID_2, policyID: POLICY_ID_2}),
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            const subMenuItems = getExportSubMenuItems(result.current.headerButtonsOptions);
            expect(subMenuItems?.some((item) => item.text === IES_FRIENDLY_NAME)).toBe(true);
        });

        const subMenuItems = getExportSubMenuItems(result.current.headerButtonsOptions) ?? [];

        // Both QBO and IES export options are present with their respective icons
        const exportQBOOption = subMenuItems.find((item) => item.text === QBO_FRIENDLY_NAME);
        const exportIESOption = subMenuItems.find((item) => item.text === IES_FRIENDLY_NAME);
        expect(exportQBOOption).toBeDefined();
        expect(exportIESOption).toBeDefined();
        expect(exportQBOOption?.icon).toBe('QBOSquare');
        expect(exportIESOption?.icon).toBe('IntuitSquare');
        expect(subMenuItems.filter((item) => item.text === 'workspace.common.markAsExported')).toHaveLength(2);

        const integrationOptionTexts = subMenuItems
            .map((item) => item.text)
            .filter((text) => text === QBO_FRIENDLY_NAME || text === IES_FRIENDLY_NAME || text === 'workspace.common.markAsExported');
        expect(integrationOptionTexts).toEqual([QBO_FRIENDLY_NAME, 'workspace.common.markAsExported', IES_FRIENDLY_NAME, 'workspace.common.markAsExported']);

        // Selecting "Mark as exported" for IES calls markAsManuallyExported with the IES policy
        const markAsExportedIESOption = subMenuItems.find(
            (item) => item.text === 'workspace.common.markAsExported' && item.accessibilityLabel === `workspace.common.markAsExported, ${IES_FRIENDLY_NAME}`,
        );
        expect(markAsExportedIESOption).toBeDefined();

        markAsExportedIESOption?.onSelected?.();

        await waitFor(() => {
            expect(markAsManuallyExported).toHaveBeenCalledWith([REPORT_ID_2], CONST.POLICY.CONNECTIONS.NAME.QBO, expect.objectContaining({id: POLICY_ID_2}));
        });
    });

    it('blocks the export and shows the different-companies modal when the selection spans one integration on different companyIDs', async () => {
        /**
         * Given: two approved reports on two workspaces both connected to NetSuite, but to DIFFERENT
         *        external companies (distinct accountIDs). A single export lands in one accounting
         *        company, so reports from different companies can't be exported together.
         *
         * When: the user clicks "Export to NetSuite".
         *
         * Then: the different-companies modal is shown and nothing is exported (the flow exits before
         *       the partial-export / export-again modals).
         */
        // Give each NetSuite workspace a distinct external companyID (accountID).
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {accountID: 'company-A'}},
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID_2}`, {
            id: POLICY_ID_2,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {accountID: 'company-B'}},
        });

        mockCurrentSearchResults = makeSearchResults([makeSnapshotReport(), makeSnapshotReport(REPORT_ID_2, POLICY_ID_2)]);
        mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: REPORT_ID_2, policyID: POLICY_ID_2})];
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction(),
            tx2: makeSelectedTransaction({reportID: REPORT_ID_2, policyID: POLICY_ID_2}),
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportSubMenuItems(result.current.headerButtonsOptions)?.some((item) => item.text === NETSUITE_FRIENDLY_NAME)).toBe(true);
        });

        getExportSubMenuItems(result.current.headerButtonsOptions)
            ?.find((item) => item.text === NETSUITE_FRIENDLY_NAME)
            ?.onSelected?.();

        await waitFor(() => {
            expect(mockShowConfirmModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'workspace.exportDifferentCompaniesModal.title',
                    prompt: 'workspace.exportDifferentCompaniesModal.description',
                    confirmText: 'workspace.exportDifferentCompaniesModal.confirmText',
                }),
            );
        });

        // The mismatch blocks the flow: nothing is exported and only the one blocking modal is shown.
        expect(exportToIntegrationOnSearch).not.toHaveBeenCalled();
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
    });

    it('does NOT show the different-companies modal and exports together when the workspaces share the same companyID', async () => {
        /**
         * Given: two approved reports on two DIFFERENT workspaces, both connected to NetSuite and to the
         *        SAME external company (identical accountID). A single export lands in one accounting
         *        company, and here every report already resolves to that one company.
         *
         * When: the user clicks "Export to NetSuite".
         *
         * Then: the different-companies block is NOT triggered — no modal is shown (the export is neither
         *       partial nor a re-export), and both reports are exported together in a single call.
         */
        // Both NetSuite workspaces point at the same external companyID (accountID).
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {accountID: 'company-A'}},
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID_2}`, {
            id: POLICY_ID_2,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {accountID: 'company-A'}},
        });

        mockCurrentSearchResults = makeSearchResults([makeSnapshotReport(), makeSnapshotReport(REPORT_ID_2, POLICY_ID_2)]);
        mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: REPORT_ID_2, policyID: POLICY_ID_2})];
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction(),
            tx2: makeSelectedTransaction({reportID: REPORT_ID_2, policyID: POLICY_ID_2}),
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportSubMenuItems(result.current.headerButtonsOptions)?.some((item) => item.text === NETSUITE_FRIENDLY_NAME)).toBe(true);
        });

        getExportSubMenuItems(result.current.headerButtonsOptions)
            ?.find((item) => item.text === NETSUITE_FRIENDLY_NAME)
            ?.onSelected?.();

        // The shared companyID clears the different-companies block: no modal, both reports exported together.
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(exportToIntegrationOnSearch).toHaveBeenCalledWith(expect.anything(), [REPORT_ID, REPORT_ID_2], CONST.POLICY.CONNECTIONS.NAME.NETSUITE, expect.anything(), undefined);
    });

    it('does NOT show the different-companies modal for "Mark as exported" and marks reports across different companies together', async () => {
        /**
         * Given: two approved reports on two workspaces both connected to NetSuite, but to DIFFERENT
         *        external companies (distinct accountIDs) — the same selection that blocks a real export.
         *
         * When: the user clicks NetSuite's "Mark as exported".
         *
         * Then: the different-companies guard does NOT apply to manual marking (MarkAsExported logs a
         *       per-report exported action independently and never pushes into an external company), so
         *       no blocking modal is shown and both reports are marked together in a single call.
         */
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {accountID: 'company-A'}},
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID_2}`, {
            id: POLICY_ID_2,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {accountID: 'company-B'}},
        });

        mockCurrentSearchResults = makeSearchResults([makeSnapshotReport(), makeSnapshotReport(REPORT_ID_2, POLICY_ID_2)]);
        mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: REPORT_ID_2, policyID: POLICY_ID_2})];
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction(),
            tx2: makeSelectedTransaction({reportID: REPORT_ID_2, policyID: POLICY_ID_2}),
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportSubMenuItems(result.current.headerButtonsOptions)?.some((item) => item.text === 'workspace.common.markAsExported')).toBe(true);
        });

        getExportSubMenuItems(result.current.headerButtonsOptions)
            ?.find((item) => item.text === 'workspace.common.markAsExported')
            ?.onSelected?.();

        // No blocking modal, and both reports (from different companies) are marked together in one call.
        await waitFor(() => {
            expect(markAsManuallyExported).toHaveBeenCalledWith([REPORT_ID, REPORT_ID_2], CONST.POLICY.CONNECTIONS.NAME.NETSUITE, expect.anything());
        });
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(exportToIntegrationOnSearch).not.toHaveBeenCalled();
    });

    it('shows the partial-export modal for a multi-integration selection, then exports only the chosen integration subset', async () => {
        /**
         * Given: two reports on workspaces connected to different integrations (report1 → NetSuite,
         *        report2 → QBO), so exporting to one integration only covers a subset of the selection.
         *
         * When: the user clicks "Export to NetSuite" and confirms.
         *
         * Then: the partial-export confirmation modal is shown first (never the export-again modal, since
         *       nothing was exported yet), and after confirming, only report1 is exported to NetSuite.
         */
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID_2}`, {
            id: POLICY_ID_2,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBO]: {}},
        });

        mockCurrentSearchResults = makeSearchResults([makeSnapshotReport(), makeSnapshotReport(REPORT_ID_2, POLICY_ID_2)]);
        mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: REPORT_ID_2, policyID: POLICY_ID_2})];
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction(),
            tx2: makeSelectedTransaction({reportID: REPORT_ID_2, policyID: POLICY_ID_2}),
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportSubMenuItems(result.current.headerButtonsOptions)?.some((item) => item.text === NETSUITE_FRIENDLY_NAME)).toBe(true);
        });

        getExportSubMenuItems(result.current.headerButtonsOptions)
            ?.find((item) => item.text === NETSUITE_FRIENDLY_NAME)
            ?.onSelected?.();

        await waitFor(() => {
            expect(exportToIntegrationOnSearch).toHaveBeenCalledWith(expect.anything(), [REPORT_ID], CONST.POLICY.CONNECTIONS.NAME.NETSUITE, expect.anything(), undefined);
        });

        // Only the partial-export modal is shown (there is nothing already-exported to warn about). Its
        // descriptive text lives in the fixed subtitle, and the scrollable prompt lists the report names.
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'workspace.exportPartialModal.title',
                subtitle: 'workspace.exportPartialModal.description',
                prompt: 'Approved report',
                shouldEnablePromptScroll: true,
            }),
        );
    });

    it('shows the export option for a mixed eligible/ineligible selection on one workspace and exports only the eligible report', async () => {
        /**
         * Given: two reports on the SAME NetSuite workspace — one approved (eligible to export) and one
         *        submitted (not yet eligible).
         *
         * When: the export bulk-action menu is built and the user clicks "Export to NetSuite" and confirms.
         *
         * Then: the option still appears (at least one report is eligible), the partial-export modal is shown
         *       for the eligible subset, and only the approved report is exported.
         */
        mockCurrentSearchResults = makeSearchResults([makeSnapshotReport(), makeSubmittedReport(REPORT_ID_2, POLICY_ID)]);
        mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: REPORT_ID_2})];
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction(),
            tx2: makeSelectedTransaction({reportID: REPORT_ID_2}),
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        // The option shows even though only one of the two selected reports is eligible.
        await waitFor(() => {
            expect(getExportSubMenuItems(result.current.headerButtonsOptions)?.some((item) => item.text === NETSUITE_FRIENDLY_NAME)).toBe(true);
        });

        getExportSubMenuItems(result.current.headerButtonsOptions)
            ?.find((item) => item.text === NETSUITE_FRIENDLY_NAME)
            ?.onSelected?.();

        // Only the approved report (report1) is exported; the submitted report is skipped.
        await waitFor(() => {
            expect(exportToIntegrationOnSearch).toHaveBeenCalledWith(expect.anything(), [REPORT_ID], CONST.POLICY.CONNECTIONS.NAME.NETSUITE, expect.anything(), undefined);
        });

        // The partial-export modal is shown for the eligible subset (1 of 2 selected reports).
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'workspace.exportPartialModal.title',
                subtitle: 'workspace.exportPartialModal.description',
                prompt: 'Approved report',
                shouldEnablePromptScroll: true,
            }),
        );
    });

    it('aborts the export when the partial-export modal is cancelled', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID_2}`, {
            id: POLICY_ID_2,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBO]: {}},
        });

        mockCurrentSearchResults = makeSearchResults([makeSnapshotReport(), makeSnapshotReport(REPORT_ID_2, POLICY_ID_2)]);
        mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: REPORT_ID_2, policyID: POLICY_ID_2})];
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction(),
            tx2: makeSelectedTransaction({reportID: REPORT_ID_2, policyID: POLICY_ID_2}),
        };
        // Cancel the partial-export modal.
        mockShowConfirmModal.mockResolvedValueOnce({action: 'CLOSE'});

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportSubMenuItems(result.current.headerButtonsOptions)?.some((item) => item.text === NETSUITE_FRIENDLY_NAME)).toBe(true);
        });

        getExportSubMenuItems(result.current.headerButtonsOptions)
            ?.find((item) => item.text === NETSUITE_FRIENDLY_NAME)
            ?.onSelected?.();

        // Flush the (cancelled) modal promise chain, then confirm nothing was exported.
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
        expect(exportToIntegrationOnSearch).not.toHaveBeenCalled();
    });

    it('shows the partial-export modal first and then the export-again modal when the chosen subset was already exported', async () => {
        /**
         * Given: a multi-integration selection (report1 → NetSuite, report2 → QBO) where the NetSuite
         *        report has already been exported (detected from its report actions).
         *
         * When: the user clicks "Export to NetSuite".
         *
         * Then: the two confirmations are presented in sequence — the partial-export modal first, then the
         *       existing export-again modal — and only after confirming both is report1 exported.
         */
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID_2}`, {
            id: POLICY_ID_2,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBO]: {}},
        });

        // report1 is already exported (backend set `isExportedToIntegration`), report2 is not.
        mockCurrentSearchResults = makeSearchResults([makeExportedSnapshotReport(), makeSnapshotReport(REPORT_ID_2, POLICY_ID_2)]);
        mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: REPORT_ID_2, policyID: POLICY_ID_2})];
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction(),
            tx2: makeSelectedTransaction({reportID: REPORT_ID_2, policyID: POLICY_ID_2}),
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportSubMenuItems(result.current.headerButtonsOptions)?.some((item) => item.text === NETSUITE_FRIENDLY_NAME)).toBe(true);
        });

        getExportSubMenuItems(result.current.headerButtonsOptions)
            ?.find((item) => item.text === NETSUITE_FRIENDLY_NAME)
            ?.onSelected?.();

        await waitFor(() => {
            expect(exportToIntegrationOnSearch).toHaveBeenCalledWith(expect.anything(), [REPORT_ID], CONST.POLICY.CONNECTIONS.NAME.NETSUITE, expect.anything(), undefined);
        });

        // Both modals were shown, in order: partial-export first, export-again second. Each splits its
        // descriptive text into the fixed subtitle and its report list into the scrollable prompt.
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(2);
        expect(mockShowConfirmModal).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({title: 'workspace.exportPartialModal.title', subtitle: 'workspace.exportPartialModal.description', shouldEnablePromptScroll: true}),
        );
        expect(mockShowConfirmModal).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                title: 'workspace.exportAgainModal.title',
                subtitle: 'workspace.exportAgainModal.description',
                prompt: 'Approved report',
                shouldEnablePromptScroll: true,
            }),
        );
    });

    it('shows only the export-again modal (no partial modal) for a single-integration already-exported selection', async () => {
        /**
         * Given: a single-workspace selection where every selected report belongs to NetSuite and has
         *        already been exported.
         *
         * When: the user clicks "Export to NetSuite".
         *
         * Then: only the export-again modal is shown (the export is not partial), and after confirming the
         *       report is exported.
         */
        mockCurrentSearchResults = makeSearchResults([makeExportedSnapshotReport()]);
        mockSelectedReports = [makeSelectedReport()];
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportSubMenuItems(result.current.headerButtonsOptions)?.some((item) => item.text === NETSUITE_FRIENDLY_NAME)).toBe(true);
        });

        getExportSubMenuItems(result.current.headerButtonsOptions)
            ?.find((item) => item.text === NETSUITE_FRIENDLY_NAME)
            ?.onSelected?.();

        await waitFor(() => {
            expect(exportToIntegrationOnSearch).toHaveBeenCalledWith(expect.anything(), [REPORT_ID], CONST.POLICY.CONNECTIONS.NAME.NETSUITE, expect.anything(), undefined);
        });

        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'workspace.exportAgainModal.title',
                subtitle: 'workspace.exportAgainModal.description',
                prompt: 'Approved report',
                shouldEnablePromptScroll: true,
            }),
        );
    });

    it('detects an already-exported report from a pending export field on the report', async () => {
        /**
         * Given: a report the backend reports as mid-export via `pendingFields.export` (rather than
         *        `isExportedToIntegration`). Detection is aligned with the backend response, which sets these
         *        fields on the report itself.
         *
         * When: the user clicks "Export to NetSuite".
         *
         * Then: the export-again modal is shown, proving detection reads the report's export fields.
         */
        mockCurrentSearchResults = makeSearchResults([{...makeSnapshotReport(), isExportedToIntegration: false, pendingFields: {export: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}}]);
        mockSelectedReports = [makeSelectedReport()];
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportSubMenuItems(result.current.headerButtonsOptions)?.some((item) => item.text === NETSUITE_FRIENDLY_NAME)).toBe(true);
        });

        getExportSubMenuItems(result.current.headerButtonsOptions)
            ?.find((item) => item.text === NETSUITE_FRIENDLY_NAME)
            ?.onSelected?.();

        await waitFor(() => {
            expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({title: 'workspace.exportAgainModal.title'}));
        });
    });

    it('shows no confirmation modal when every selected report belongs to the chosen integration and none were exported', async () => {
        /**
         * Given: two reports that both belong to NetSuite and were never exported.
         *
         * When: the user clicks "Export to NetSuite".
         *
         * Then: no modal is shown (the export is neither partial nor a re-export) and both reports are
         *       exported straight away.
         */
        mockCurrentSearchResults = makeSearchResults([makeSnapshotReport(), makeSnapshotReport(REPORT_ID_2, POLICY_ID)]);
        mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: REPORT_ID_2})];
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction(),
            tx2: makeSelectedTransaction({reportID: REPORT_ID_2}),
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportSubMenuItems(result.current.headerButtonsOptions)?.some((item) => item.text === NETSUITE_FRIENDLY_NAME)).toBe(true);
        });

        getExportSubMenuItems(result.current.headerButtonsOptions)
            ?.find((item) => item.text === NETSUITE_FRIENDLY_NAME)
            ?.onSelected?.();

        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(exportToIntegrationOnSearch).toHaveBeenCalledWith(expect.anything(), [REPORT_ID, REPORT_ID_2], CONST.POLICY.CONNECTIONS.NAME.NETSUITE, expect.anything(), undefined);
    });

    it('routes "Mark as exported" through the same flow: partial modal first, then export-again, then marks the subset', async () => {
        /**
         * Given: a multi-integration selection (report1 → NetSuite already exported, report2 → QBO).
         *
         * When: the user clicks NetSuite's "Mark as exported".
         *
         * Then: it goes through the identical shared flow as export — partial-export modal first, then the
         *       export-again modal — and only report1 is marked as exported to NetSuite.
         */
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID_2}`, {
            id: POLICY_ID_2,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBO]: {}},
        });

        mockCurrentSearchResults = makeSearchResults([makeExportedSnapshotReport(), makeSnapshotReport(REPORT_ID_2, POLICY_ID_2)]);
        mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: REPORT_ID_2, policyID: POLICY_ID_2})];
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction(),
            tx2: makeSelectedTransaction({reportID: REPORT_ID_2, policyID: POLICY_ID_2}),
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportSubMenuItems(result.current.headerButtonsOptions)?.some((item) => item.text === 'workspace.common.markAsExported')).toBe(true);
        });

        // The first "Mark as exported" option belongs to NetSuite (its group is listed first).
        getExportSubMenuItems(result.current.headerButtonsOptions)
            ?.find((item) => item.text === 'workspace.common.markAsExported')
            ?.onSelected?.();

        await waitFor(() => {
            expect(markAsManuallyExported).toHaveBeenCalledWith([REPORT_ID], CONST.POLICY.CONNECTIONS.NAME.NETSUITE, expect.anything());
        });

        expect(mockShowConfirmModal).toHaveBeenCalledTimes(2);
        expect(mockShowConfirmModal).toHaveBeenNthCalledWith(1, expect.objectContaining({title: 'workspace.exportPartialModal.title'}));
        expect(mockShowConfirmModal).toHaveBeenNthCalledWith(2, expect.objectContaining({title: 'workspace.exportAgainModal.title'}));
        expect(exportToIntegrationOnSearch).not.toHaveBeenCalled();
    });

    it('shows templates when reports are selected through their report groups', async () => {
        mockCurrentSearchResults = makeSearchResults([makeSnapshotReport()]);
        mockSelectedReports = [makeSelectedReport()];
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction({
                groupKey: `${CONST.SEARCH.GROUP_PREFIX}${REPORT_ID}`,
                isSelectedViaGroup: true,
            }),
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportOptionTexts(result.current.headerButtonsOptions)).toEqual(expect.arrayContaining(['Custom template', 'export.expenseLevelExport', 'export.reportLevelExport']));
        });
    });

    it('hides templates when a full group is selected in an explicitly grouped search', async () => {
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction({
                groupKey: `${CONST.SEARCH.GROUP_PREFIX}category`,
                isSelectedViaGroup: true,
            }),
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: groupedExpenseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportOptionTexts(result.current.headerButtonsOptions)).toEqual(['export.currentView']);
        });
    });

    it('offers Current view as the only plain-CSV export on a grouped search', async () => {
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: groupedExpenseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportOptionByText(result.current.headerButtonsOptions, 'export.currentView')).toBeDefined();
        });

        expect(getExportOptionTexts(result.current.headerButtonsOptions)).not.toContain('export.basicExport');
    });

    it('exports the current view of a grouped search with the default expense columns', async () => {
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: groupedExpenseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportOptionByText(result.current.headerButtonsOptions, 'export.currentView')).toBeDefined();
        });

        getExportOptionByText(result.current.headerButtonsOptions, 'export.currentView')?.onSelected?.();

        await waitFor(() => {
            expect(exportSearchItemsToCSV).toHaveBeenCalled();
        });

        const expectedColumns: string[] = [CONST.SEARCH.TABLE_COLUMNS.TYPE, ...Object.values(CONST.SEARCH.TYPE_DEFAULT_COLUMNS.EXPENSE)];
        const {isBasicExport, query, columnLabels} = getLastCSVExportParameters();
        expect(isBasicExport).toBe(false);
        expect(expectedColumns).toContain(CONST.SEARCH.TABLE_COLUMNS.FROM);
        expect(query).toEqual(expect.objectContaining({columns: expectedColumns}));

        // translate and the column translation key are both mocked as the identity here, so every column
        // carries a label of its own name - what matters is that a label is sent for each one.
        expect(columnLabels).toEqual(Object.fromEntries(expectedColumns.map((column) => [column, column])));
    });

    it('exports the current view of a grouped search with the configured expense columns in order', async () => {
        await Onyx.merge(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {
            columns: [CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL, CONST.SEARCH.TABLE_COLUMNS.TAG, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.FROM],
        });
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: groupedExpenseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportOptionByText(result.current.headerButtonsOptions, 'export.currentView')).toBeDefined();
        });

        getExportOptionByText(result.current.headerButtonsOptions, 'export.currentView')?.onSelected?.();

        await waitFor(() => {
            expect(exportSearchItemsToCSV).toHaveBeenCalled();
        });

        const {isBasicExport, query} = getLastCSVExportParameters();
        expect(isBasicExport).toBe(false);
        expect(query).toEqual(
            expect.objectContaining({
                columns: [CONST.SEARCH.TABLE_COLUMNS.TYPE, CONST.SEARCH.TABLE_COLUMNS.TAG, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.FROM],
            }),
        );
    });
    describe('Canadian Multiple Tax Export eligibility', () => {
        const SECOND_POLICY_ID = 'policy2';
        const SECOND_REPORT_ID = 'report2';

        /** The includeMultipleTaxExport argument getExportTemplates was last called with */
        function getIncludeMultipleTaxExportArgument() {
            return mockGetExportTemplates.mock.calls.at(-1)?.at(7);
        }

        beforeEach(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {outputCurrency: CONST.CURRENCY.CAD});
        });

        it('offers the template when every selected workspace outputs in CAD, even across several workspaces', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${SECOND_POLICY_ID}`, {id: SECOND_POLICY_ID, outputCurrency: CONST.CURRENCY.CAD});

            mockCurrentSearchResults = makeSearchResults([makeSnapshotReport()]);
            mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: SECOND_REPORT_ID, policyID: SECOND_POLICY_ID})];
            mockSelectedTransactions = {
                tx1: makeSelectedTransaction(),
                tx2: makeSelectedTransaction({reportID: SECOND_REPORT_ID, policyID: SECOND_POLICY_ID}),
            };

            renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

            await waitFor(() => {
                expect(getIncludeMultipleTaxExportArgument()).toBe(true);
            });
        });

        it('hides the template when a transaction from a non-CAD workspace is selected alongside a CAD report', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${SECOND_POLICY_ID}`, {id: SECOND_POLICY_ID, outputCurrency: CONST.CURRENCY.USD});

            mockCurrentSearchResults = makeSearchResults([makeSnapshotReport()]);
            // Only the CAD report is fully selected, but an extra transaction from a USD workspace is part of the same export request
            mockSelectedReports = [makeSelectedReport()];
            mockSelectedTransactions = {
                tx1: makeSelectedTransaction(),
                tx2: makeSelectedTransaction({reportID: SECOND_REPORT_ID, policyID: SECOND_POLICY_ID}),
            };

            renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

            await waitFor(() => {
                expect(mockGetExportTemplates).toHaveBeenCalled();
            });
            expect(getIncludeMultipleTaxExportArgument()).toBe(false);
        });

        it('hides the template when a self DM expense is selected alongside a CAD workspace expense', async () => {
            const expenseQueryJSON: SearchQueryJSON = {
                ...expenseReportQueryJSON,
                inputQuery: 'type:expense status:all',
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            };

            mockCurrentSearchResults = makeSearchResults([makeSnapshotReport()]);
            mockSelectedReports = [];
            mockSelectedTransactions = {
                // A self DM expense sits outside any workspace, so its selection entry carries no policyID
                selfDMTx: makeSelectedTransaction({reportID: SECOND_REPORT_ID, policyID: undefined, currency: 'USD'}),
                workspaceTx: makeSelectedTransaction(),
            };

            renderHook(() => useSearchBulkActions({queryJSON: expenseQueryJSON}), {wrapper: OnyxListItemProvider});

            await waitFor(() => {
                expect(mockGetExportTemplates).toHaveBeenCalled();
            });
            expect(getIncludeMultipleTaxExportArgument()).toBe(false);
        });

        /** A query scoped to the given workspaces, as "Select all matching" would export it. */
        function policyScopedQueryJSON(policyIDs: string[]): SearchQueryJSON {
            return {
                ...expenseReportQueryJSON,
                flatFilters: [
                    {
                        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
                        filters: policyIDs.map((policyID) => ({operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: policyID})),
                    },
                ],
            } as SearchQueryJSON;
        }

        it('offers the template under select all when the query is scoped to CAD workspaces only', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${SECOND_POLICY_ID}`, {id: SECOND_POLICY_ID, outputCurrency: CONST.CURRENCY.CAD});
            mockAreAllMatchingItemsSelected = true;

            mockCurrentSearchResults = makeSearchResults([makeSnapshotReport()]);
            mockSelectedReports = [makeSelectedReport()];
            mockSelectedTransactions = {tx1: makeSelectedTransaction()};

            renderHook(() => useSearchBulkActions({queryJSON: policyScopedQueryJSON([POLICY_ID, SECOND_POLICY_ID])}), {wrapper: OnyxListItemProvider});

            await waitFor(() => {
                expect(getIncludeMultipleTaxExportArgument()).toBe(true);
            });
        });

        it('hides the template under select all when a workspace in the query scope is not CAD', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${SECOND_POLICY_ID}`, {id: SECOND_POLICY_ID, outputCurrency: CONST.CURRENCY.USD});
            mockAreAllMatchingItemsSelected = true;

            mockCurrentSearchResults = makeSearchResults([makeSnapshotReport()]);
            // The loaded rows are all CAD, but the query also matches a USD workspace that hasn't been loaded yet
            mockSelectedReports = [makeSelectedReport()];
            mockSelectedTransactions = {tx1: makeSelectedTransaction()};

            renderHook(() => useSearchBulkActions({queryJSON: policyScopedQueryJSON([POLICY_ID, SECOND_POLICY_ID])}), {wrapper: OnyxListItemProvider});

            await waitFor(() => {
                expect(mockGetExportTemplates).toHaveBeenCalled();
            });
            expect(getIncludeMultipleTaxExportArgument()).toBe(false);
        });

        it('hides the template under select all when the query is not scoped to any workspace', async () => {
            mockAreAllMatchingItemsSelected = true;

            mockCurrentSearchResults = makeSearchResults([makeSnapshotReport()]);
            // Every loaded row is CAD, but an unscoped query can still match a non-CAD workspace further down the results
            mockSelectedReports = [makeSelectedReport()];
            mockSelectedTransactions = {tx1: makeSelectedTransaction()};

            renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}), {wrapper: OnyxListItemProvider});

            await waitFor(() => {
                expect(mockGetExportTemplates).toHaveBeenCalled();
            });
            expect(getIncludeMultipleTaxExportArgument()).toBe(false);
        });
    });
});
