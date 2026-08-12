import {renderHook, waitFor} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';

import useSearchBulkActions from '@hooks/useSearchBulkActions';

import {getExportTemplates, exportSearchItemsToCSV} from '@libs/actions/Search';
import type * as ReportSecondaryActionUtilsModule from '@libs/ReportSecondaryActionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, SearchResults} from '@src/types/onyx';

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
    return report ? [CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION, CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED] : [];
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
    getValidGroupBy: jest.fn((groupBy?: string) => groupBy),
    // Column labels are asserted as keys rather than translations, so the label lookup is the identity.
    getSearchColumnTranslationKey: jest.fn((column: string) => column),
    // A grouped export resolves its columns without this, so a call from a grouped case is itself a failure.
    getColumnsToShow: jest.fn(() => []),
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
        /**
         * A grouped basic export produces a fixed set of columns, which is fewer than Current view gives most
         * configured views. Offering both would leave the user choosing between two similarly named exports
         * where the more official-sounding one carries less of their data.
         */
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: groupedExpenseQueryJSON}), {wrapper: OnyxListItemProvider});

        await waitFor(() => {
            expect(getExportOptionByText(result.current.headerButtonsOptions, 'export.currentView')).toBeDefined();
        });

        expect(getExportOptionTexts(result.current.headerButtonsOptions)).not.toContain('export.basicExport');
    });

    it('exports the current view of a grouped search with the default expense columns', async () => {
        /**
         * Given: a grouped search the user has not customised any columns on.
         *
         * When: Current view is selected.
         *
         * Then: the request is a current-view export (not a basic one) carrying the view's default expense
         *       columns - including From, whose absence is the reported bug, and Type, which the table always
         *       shows first. The columns cannot come from the data-presence pass in getColumnsToShow, because a
         *       grouped snapshot has no transactions to see.
         */
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
        /**
         * Given: a grouped search whose visible columns mix expense columns with a group-level one.
         *
         * When: Current view is selected.
         *
         * Then: only the expense columns are requested, in the order the user arranged them and led by Type,
         *       since the group summary block keeps its own fixed columns.
         */
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
