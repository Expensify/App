import {act, renderHook, waitFor} from '@testing-library/react-native';

import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';

import useSearchBulkActions from '@hooks/useSearchBulkActions';
import type {SearchHeaderOptionValue} from '@hooks/useSearchBulkActions';

import {exportReceiptsToZip} from '@libs/actions/Export';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, SearchResults, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import type * as MockUsePaymentContextUtil from '../../utils/mockUsePaymentContext';

jest.mock('@libs/actions/Export', () => ({
    exportReportsToPDF: jest.fn(() => 'mock-pdf-export-id'),
    exportReceiptsToZip: jest.fn(() => 'mock-receipts-export-id'),
}));
jest.mock('@libs/actions/Report', () => ({
    exportReportToPDF: jest.fn(),
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

jest.mock('@libs/actions/Search', () => ({
    getExportTemplates: jest.fn(() => ({customTemplates: [], defaultTemplates: []})),
    exportSearchItemsToCSV: jest.fn(),
    queueExportSearchItemsToCSV: jest.fn(),
    queueExportSearchWithTemplate: jest.fn(),
    approveMoneyRequestOnSearch: jest.fn(),
    getLastPolicyBankAccountID: jest.fn(),
    getLastPolicyPaymentMethod: jest.fn(),
    getPayMoneyOnSearchInvoiceParams: jest.fn(),
    getPayOption: jest.fn(() => ({shouldEnableBulkPayOption: false, isFirstTimePayment: false})),
    getReportFromSearchSnapshot: jest.fn(
        (reportID: string, searchData: Record<string, unknown> | undefined, allReports: Record<string, unknown> | undefined) =>
            searchData?.[`report_${reportID}`] ?? allReports?.[`report_${reportID}`],
    ),
    getPolicyFromSearchSnapshot: jest.fn(
        (policyID: string, searchData: Record<string, unknown> | undefined, policies: Record<string, unknown> | undefined) =>
            searchData?.[`policy_${policyID}`] ?? policies?.[`policy_${policyID}`],
    ),
    getReportType: jest.fn(),
    getTotalFormattedAmount: jest.fn(() => ''),
    isCurrencySupportWalletBulkPay: jest.fn(() => false),
    payMoneyRequestOnSearch: jest.fn(),
    submitMoneyRequestOnSearch: jest.fn(),
    unholdMoneyRequestOnSearch: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string) => key,
        localeCompare: (first: string, second: string) => first.localeCompare(second),
        formatPhoneNumber: (phone: string) => phone,
    }),
}));

const mockClearSelectedTransactions = jest.fn();
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
    }),
    useSearchSelectionActions: () => ({
        clearSelectedTransactions: mockClearSelectedTransactions,
        selectAllMatchingItems: jest.fn(),
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

jest.mock('@hooks/usePolicyForMovingExpenses', () => ({
    __esModule: true,
    default: () => ({policyForMovingExpensesID: 'policy1'}),
}));

// ---- helpers ----

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

const expenseQueryJSON: SearchQueryJSON = {
    inputQuery: 'type:expense status:all',
    hash: 54321,
    recentSearchHash: 54321,
    similarSearchHash: 54321,
    flatFilters: [],
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    view: CONST.SEARCH.VIEW.TABLE,
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: 'type', right: 'expense'},
};

function makeSelectedReport(overrides: Partial<SelectedReports> = {}): SelectedReports {
    return {
        reportID: '1',
        policyID: 'policy1',
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

// Builds a Transaction, optionally carrying a receipt. hasReceipt() treats a truthy receipt.state as a downloadable receipt.
function makeTransaction(transactionID: string, reportID: string, withReceipt = true): Transaction {
    return {
        transactionID,
        reportID,
        amount: 100,
        currency: 'USD',
        created: '2024-01-01',
        merchant: '',
        ...(withReceipt ? {receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE}} : {}),
    } as Transaction;
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
        reportID: '1',
        policyID: 'policy1',
        amount: 100,
        currency: 'USD',
        isFromOneTransactionReport: false,
        transaction: makeTransaction('tx', '1'),
        ...overrides,
    };
}

// Builds a search snapshot whose report entries each get one transaction. The Reports-page action decides whether to
// show "Download receipts" by looking for a selected report whose transaction actually has a receipt (withReceipt).
function makeReportSearchResults(reports: Array<{reportID: string; withReceipt: boolean}>): SearchResults {
    const data: SearchResults['data'] = {};
    for (const report of reports) {
        const reportEntry: Report = {
            reportID: report.reportID,
            type: CONST.REPORT.TYPE.EXPENSE,
            reportName: `Report ${report.reportID}`,
        };
        data[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = reportEntry;
        const transactionID = `searchTransaction_${report.reportID}`;
        data[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = makeTransaction(transactionID, report.reportID, report.withReceipt);
    }
    return {
        data,
        search: {
            offset: 0,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            hash: 12345,
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
        },
    };
}

function getDownloadReceiptsOption(options: Array<DropdownOption<SearchHeaderOptionValue>>): DropdownOption<SearchHeaderOptionValue> | undefined {
    return options.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DOWNLOAD_RECEIPTS);
}

// ---- tests ----

const renderHookWithProvider: typeof renderHook = (callback, options) => renderHook(callback, {...options, wrapper: OnyxListItemProvider});

describe('useSearchBulkActions - Download receipts', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsOffline = false;
        await Onyx.clear();
        mockSelectedTransactions = {};
        mockSelectedReports = [];
        mockCurrentSearchResults = undefined;
        mockAreAllMatchingItemsSelected = false;

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@example.com'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {
            reportID: '1',
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            reportName: 'Report 1',
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, {
            id: 'policy1',
            role: CONST.POLICY.ROLE.ADMIN,
        });
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('Reports page (expense-report search)', () => {
        it('shows the option when a selected report has a receipt', async () => {
            mockSelectedReports = [makeSelectedReport()];
            mockSelectedTransactions = {tx1: makeSelectedTransaction()};
            mockCurrentSearchResults = makeReportSearchResults([{reportID: '1', withReceipt: true}]);

            const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

            await waitFor(() => {
                expect(getDownloadReceiptsOption(result.current.headerButtonsOptions)).toBeDefined();
            });
        });

        it('hides the option when no selected report has a receipt', async () => {
            mockSelectedReports = [makeSelectedReport()];
            mockSelectedTransactions = {tx1: makeSelectedTransaction()};
            mockCurrentSearchResults = makeReportSearchResults([{reportID: '1', withReceipt: false}]);

            const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

            await waitFor(() => {
                expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
            });
            expect(getDownloadReceiptsOption(result.current.headerButtonsOptions)).toBeUndefined();
        });

        it('sends the selected report IDs to exportReceiptsToZip', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}2`, {
                reportID: '2',
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Report 2',
            });
            mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: '2'})];
            mockSelectedTransactions = {tx1: makeSelectedTransaction(), tx2: makeSelectedTransaction({reportID: '2'})};
            mockCurrentSearchResults = makeReportSearchResults([
                {reportID: '1', withReceipt: true},
                {reportID: '2', withReceipt: false},
            ]);

            const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

            await waitFor(() => {
                expect(getDownloadReceiptsOption(result.current.headerButtonsOptions)).toBeDefined();
            });

            await act(async () => {
                await getDownloadReceiptsOption(result.current.headerButtonsOptions)?.onSelected?.();
            });

            expect(exportReceiptsToZip).toHaveBeenCalledTimes(1);
            expect(exportReceiptsToZip).toHaveBeenCalledWith({reportIDs: expect.arrayContaining(['1', '2'])});
        });

        it('shows the offline modal and does not export when offline', async () => {
            mockIsOffline = true;
            mockSelectedReports = [makeSelectedReport()];
            mockSelectedTransactions = {tx1: makeSelectedTransaction()};
            mockCurrentSearchResults = makeReportSearchResults([{reportID: '1', withReceipt: true}]);

            const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

            await waitFor(() => {
                expect(getDownloadReceiptsOption(result.current.headerButtonsOptions)).toBeDefined();
            });

            await act(async () => {
                await getDownloadReceiptsOption(result.current.headerButtonsOptions)?.onSelected?.();
            });

            expect(exportReceiptsToZip).not.toHaveBeenCalled();
            expect(result.current.isOfflineModalVisible).toBe(true);
        });
    });

    describe('Expenses page (expense search)', () => {
        it('sends the selected transaction IDs to exportReceiptsToZip', async () => {
            mockSelectedTransactions = {tx1: makeSelectedTransaction(), tx2: makeSelectedTransaction({reportID: '1'})};

            const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: expenseQueryJSON}));

            await waitFor(() => {
                expect(getDownloadReceiptsOption(result.current.headerButtonsOptions)).toBeDefined();
            });

            await act(async () => {
                await getDownloadReceiptsOption(result.current.headerButtonsOptions)?.onSelected?.();
            });

            expect(exportReceiptsToZip).toHaveBeenCalledTimes(1);
            expect(exportReceiptsToZip).toHaveBeenCalledWith({transactionIDs: expect.arrayContaining(['tx1', 'tx2'])});
        });

        it('drops group_ selection keys and only sends real transaction IDs', async () => {
            const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
            mockSelectedTransactions = {
                [groupKey]: makeSelectedTransaction({reportID: undefined}),
                tx1: makeSelectedTransaction(),
            };

            const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: expenseQueryJSON}));

            await waitFor(() => {
                expect(getDownloadReceiptsOption(result.current.headerButtonsOptions)).toBeDefined();
            });

            await act(async () => {
                await getDownloadReceiptsOption(result.current.headerButtonsOptions)?.onSelected?.();
            });

            expect(exportReceiptsToZip).toHaveBeenCalledTimes(1);
            expect(exportReceiptsToZip).toHaveBeenCalledWith({transactionIDs: ['tx1']});
        });

        it('hides the option when no selected transaction has a receipt', async () => {
            mockSelectedTransactions = {
                tx1: makeSelectedTransaction({transaction: makeTransaction('tx1', '1', false)}),
                tx2: makeSelectedTransaction({reportID: '1', transaction: makeTransaction('tx2', '1', false)}),
            };

            const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: expenseQueryJSON}));

            await waitFor(() => {
                expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
            });
            expect(getDownloadReceiptsOption(result.current.headerButtonsOptions)).toBeUndefined();
        });

        it('drops deleted transactions and only sends the live ones', async () => {
            mockSelectedTransactions = {
                tx1: makeSelectedTransaction(),
                tx2: makeSelectedTransaction({reportID: CONST.REPORT.TRASH_REPORT_ID, transaction: makeTransaction('tx2', CONST.REPORT.TRASH_REPORT_ID)}),
            };

            const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: expenseQueryJSON}));

            await waitFor(() => {
                expect(getDownloadReceiptsOption(result.current.headerButtonsOptions)).toBeDefined();
            });

            await act(async () => {
                await getDownloadReceiptsOption(result.current.headerButtonsOptions)?.onSelected?.();
            });

            expect(exportReceiptsToZip).toHaveBeenCalledTimes(1);
            expect(exportReceiptsToZip).toHaveBeenCalledWith({transactionIDs: ['tx1']});
        });

        it('hides the option when only group_ keys are selected', async () => {
            const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
            mockSelectedTransactions = {[groupKey]: makeSelectedTransaction({reportID: undefined})};

            const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: expenseQueryJSON}));

            await waitFor(() => {
                expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
            });
            expect(getDownloadReceiptsOption(result.current.headerButtonsOptions)).toBeUndefined();
        });

        it('shows the offline modal and does not export when offline', async () => {
            mockIsOffline = true;
            mockSelectedTransactions = {tx1: makeSelectedTransaction()};

            const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: expenseQueryJSON}));

            await waitFor(() => {
                expect(getDownloadReceiptsOption(result.current.headerButtonsOptions)).toBeDefined();
            });

            await act(async () => {
                await getDownloadReceiptsOption(result.current.headerButtonsOptions)?.onSelected?.();
            });

            expect(exportReceiptsToZip).not.toHaveBeenCalled();
            expect(result.current.isOfflineModalVisible).toBe(true);
        });
    });
});
