import {act, renderHook, waitFor} from '@testing-library/react-native';

import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';

import useSearchBulkActions from '@hooks/useSearchBulkActions';
import type {SearchHeaderOptionValue} from '@hooks/useSearchBulkActions';

import {getExpensifyCardStatementPDF} from '@libs/actions/CompanyCards';
import {exportReportsToPDF} from '@libs/actions/Export';
import {exportReportToPDF} from '@libs/actions/Report';
import {getExpensifyCardStatementSelection} from '@libs/ExpensifyCardStatementUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import type {SearchWithdrawalIDGroup} from '@src/types/onyx/SearchResults';

import Onyx from 'react-native-onyx';

import type * as MockUsePaymentContextUtil from '../../utils/mockUsePaymentContext';

import {makeSearchData, makeSelectedTransaction, makeSettlementGroup} from '../../utils/ExpensifyCardStatementTestUtils';

jest.mock('@libs/actions/Export', () => ({
    exportReportsToPDF: jest.fn(() => 'mock-export-id'),
}));
jest.mock('@libs/actions/Report', () => ({
    exportReportToPDF: jest.fn(),
}));

jest.mock('@libs/actions/CompanyCards', () => ({
    getExpensifyCardStatementPDF: jest.fn(() => Promise.resolve({statementKey: 'statement-key'})),
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
    getExportTemplates: jest.fn(() => []),
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
    status: CONST.SEARCH.STATUS.EXPENSE_REPORT.ALL,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    view: CONST.SEARCH.VIEW.TABLE,
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: 'type', right: 'expense-report'},
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

function getDownloadPDFOption(options: Array<DropdownOption<SearchHeaderOptionValue>>): DropdownOption<SearchHeaderOptionValue> | undefined {
    return options.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DOWNLOAD_PDF);
}

const expensifyCardStatementQueryJSON: SearchQueryJSON = {
    inputQuery: 'type:expense policyID:policy1 withdrawal-type:expensify-card withdrawn>=2026-05-01 withdrawn<=2026-05-31 groupBy:withdrawal-id',
    hash: 67890,
    recentSearchHash: 67890,
    similarSearchHash: 67890,
    // A single policyID: filter scopes the statement to that workspace, so the action receives policyID 'policy1'.
    flatFilters: [
        {
            key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE,
            filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD}],
        },
        {
            key: CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
            filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'policy1'}],
        },
    ],
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    status: CONST.SEARCH.STATUS.EXPENSE.ALL,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    groupBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
    view: CONST.SEARCH.VIEW.TABLE,
    policyID: ['policy1'],
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: 'type', right: 'expense'},
};

// Default statement view with no workspace filter, so the statement is the whole (unscoped) settlement.
const unscopedExpensifyCardStatementQueryJSON: SearchQueryJSON = {
    ...expensifyCardStatementQueryJSON,
    inputQuery: 'type:expense withdrawal-type:expensify-card withdrawn>=2026-05-01 withdrawn<=2026-05-31 groupBy:withdrawal-id',
    flatFilters: [
        {
            key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE,
            filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD}],
        },
    ],
    policyID: undefined,
};

function makeCurrentSearchResults(groups: Record<string, SearchWithdrawalIDGroup>, extraData: Record<string, unknown> = {}): SearchResults {
    return {
        data: {...makeSearchData(groups), ...extraData} as SearchResults['data'],
        search: {
            offset: 0,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
        },
    };
}

function getDownloadStatementPDFOption(options: Array<DropdownOption<SearchHeaderOptionValue>>) {
    return options.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DOWNLOAD_STATEMENT_PDF);
}

// ---- tests ----

const renderHookWithProvider: typeof renderHook = (callback, options) => renderHook(callback, {...options, wrapper: OnyxListItemProvider});

describe('useSearchBulkActions - Download as PDF', () => {
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
        // The statement export is admin-only, so the current user must be an admin of the settlement's workspace for
        // the action to appear.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, {
            id: 'policy1',
            role: CONST.POLICY.ROLE.ADMIN,
        });
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('should show Download as PDF option when a single expense report is selected', async () => {
        mockSelectedReports = [makeSelectedReport()];
        mockSelectedTransactions = {
            tx1: {
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
            },
        };

        const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

        await waitFor(() => {
            const pdfOption = getDownloadPDFOption(result.current.headerButtonsOptions);
            expect(pdfOption).toBeDefined();
        });
    });

    it('should call exportReportToPDF exactly once when triggered', async () => {
        mockSelectedReports = [makeSelectedReport()];
        mockSelectedTransactions = {
            tx1: {
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
            },
        };

        const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

        await waitFor(() => {
            expect(getDownloadPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        const pdfOption = getDownloadPDFOption(result.current.headerButtonsOptions);
        await act(async () => {
            await pdfOption?.onSelected?.();
        });

        expect(exportReportToPDF).toHaveBeenCalledTimes(1);
        expect(exportReportToPDF).toHaveBeenCalledWith({reportID: '1'});
    });

    it('should not call exportReportToPDF when offline', async () => {
        mockIsOffline = true;
        mockSelectedReports = [makeSelectedReport()];
        mockSelectedTransactions = {
            tx1: {
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
            },
        };

        const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

        await waitFor(() => {
            expect(getDownloadPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        const pdfOption = getDownloadPDFOption(result.current.headerButtonsOptions);
        await act(async () => {
            await pdfOption?.onSelected?.();
        });

        expect(exportReportToPDF).not.toHaveBeenCalled();
    });

    it('should show Download as PDF when multiple reports are selected', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}2`, {
            reportID: '2',
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            reportName: 'Report 2',
        });

        mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: '2'})];
        mockSelectedTransactions = {
            tx1: {
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
            },
            tx2: {
                isSelected: true,
                canReject: false,
                canHold: false,
                canSplit: false,
                hasBeenSplit: false,
                canChangeReport: false,
                isHeld: false,
                canUnhold: false,
                action: CONST.SEARCH.ACTION_TYPES.VIEW,
                reportID: '2',
                policyID: 'policy1',
                amount: 200,
                currency: 'USD',
                isFromOneTransactionReport: false,
            },
        };

        const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

        await waitFor(() => {
            expect(getDownloadPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });
    });

    it('should call exportReportsToPDF for multi-select and set activeExportID', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}2`, {
            reportID: '2',
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            reportName: 'Report 2',
        });

        mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: '2'})];
        mockSelectedTransactions = {
            tx1: {
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
            },
            tx2: {
                isSelected: true,
                canReject: false,
                canHold: false,
                canSplit: false,
                hasBeenSplit: false,
                canChangeReport: false,
                isHeld: false,
                canUnhold: false,
                action: CONST.SEARCH.ACTION_TYPES.VIEW,
                reportID: '2',
                policyID: 'policy1',
                amount: 200,
                currency: 'USD',
                isFromOneTransactionReport: false,
            },
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

        await waitFor(() => {
            expect(getDownloadPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        const pdfOption = getDownloadPDFOption(result.current.headerButtonsOptions);
        act(() => {
            pdfOption?.onSelected?.();
        });

        expect(exportReportsToPDF).toHaveBeenCalledTimes(1);
        expect(exportReportsToPDF).toHaveBeenCalledWith(expect.arrayContaining(['1', '2']));
        expect(exportReportToPDF).not.toHaveBeenCalled();
        expect(result.current.exportDownloadStatusModal).not.toBeNull();
    });

    it('should show Export as PDF for selected Expensify Card settlement groups', async () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        mockSelectedTransactions = {
            txn0: makeSelectedTransaction({groupKey, reportID: undefined}),
            txn1: makeSelectedTransaction({groupKey, reportID: undefined}),
        };
        mockCurrentSearchResults = makeCurrentSearchResults({
            [groupKey]: makeSettlementGroup({count: 2}),
        });

        // The settlement is on policy1; the user must be an admin of it for the export to be offered.
        expect(
            getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, mockSelectedTransactions, mockCurrentSearchResults?.data, (policyID) => policyID === 'policy1', false),
        ).toBeDefined();

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expensifyCardStatementQueryJSON}));

        await waitFor(() => {
            expect(getDownloadStatementPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });
    });

    it('should request an Expensify Card statement PDF when Export as PDF is triggered', async () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        mockSelectedTransactions = {
            txn0: makeSelectedTransaction({groupKey, reportID: undefined}),
            txn1: makeSelectedTransaction({groupKey, reportID: undefined}),
        };
        mockCurrentSearchResults = makeCurrentSearchResults({
            [groupKey]: makeSettlementGroup({count: 2}),
        });

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expensifyCardStatementQueryJSON}));

        await waitFor(() => {
            expect(getDownloadStatementPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        const exportAsPDFOption = getDownloadStatementPDFOption(result.current.headerButtonsOptions);
        await act(async () => {
            await exportAsPDFOption?.onSelected?.();
        });

        expect(getExpensifyCardStatementPDF).toHaveBeenCalledTimes(1);
        expect(getExpensifyCardStatementPDF).toHaveBeenCalledWith('policy1', 'US', [123]);
        expect(result.current.isExpensifyCardStatementPDFModalVisible).toBe(true);
    });

    it('should surface the error modal when the statement PDF request fails', async () => {
        jest.mocked(getExpensifyCardStatementPDF).mockRejectedValueOnce(new Error('request failed'));
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        mockSelectedTransactions = {
            txn0: makeSelectedTransaction({groupKey, reportID: undefined}),
        };
        mockCurrentSearchResults = makeCurrentSearchResults({
            [groupKey]: makeSettlementGroup(),
        });

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expensifyCardStatementQueryJSON}));

        await waitFor(() => {
            expect(getDownloadStatementPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        const exportAsPDFOption = getDownloadStatementPDFOption(result.current.headerButtonsOptions);
        await act(async () => {
            await exportAsPDFOption?.onSelected?.();
        });

        // The loading modal is dismissed and the download-error modal is shown instead of hanging on "waiting".
        await waitFor(() => {
            expect(result.current.isDownloadErrorModalVisible).toBe(true);
        });
        expect(result.current.isExpensifyCardStatementPDFModalVisible).toBe(false);
        expect(result.current.expensifyCardStatementPDFParams).toBeUndefined();
    });

    it('should not let a stale failed request close the modal for a newer export', async () => {
        const firstGroupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const secondGroupKey = `${CONST.SEARCH.GROUP_PREFIX}456`;
        mockCurrentSearchResults = makeCurrentSearchResults({
            [firstGroupKey]: makeSettlementGroup({entryID: 123}),
            [secondGroupKey]: makeSettlementGroup({entryID: 456, accountNumber: '5678', debitPosted: '2026-05-30'}),
        });

        // The first export rejects only after we have started a second export for a different settlement.
        let rejectFirstRequest: (error: Error) => void = () => {};
        jest.mocked(getExpensifyCardStatementPDF)
            .mockReturnValueOnce(
                new Promise((_resolve, reject) => {
                    rejectFirstRequest = reject;
                }),
            )
            .mockReturnValueOnce(Promise.resolve({statementKey: 'statement-key-456'}));

        mockSelectedTransactions = {firstTxn: makeSelectedTransaction({groupKey: firstGroupKey, reportID: undefined})};
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expensifyCardStatementQueryJSON}));
        await waitFor(() => {
            expect(getDownloadStatementPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        // Start the first export, then switch the selection and start the second.
        await act(async () => {
            await getDownloadStatementPDFOption(result.current.headerButtonsOptions)?.onSelected?.();
        });
        mockSelectedTransactions = {secondTxn: makeSelectedTransaction({groupKey: secondGroupKey, reportID: undefined})};
        // Re-render so the hook picks up the new selection, then start the second export.
        act(() => {
            result.current.handleExpensifyCardStatementPDFModalHide();
        });
        await waitFor(() => {
            expect(getDownloadStatementPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });
        await act(async () => {
            await getDownloadStatementPDFOption(result.current.headerButtonsOptions)?.onSelected?.();
        });

        // The now-stale first request fails. It must not close the second export's modal or show an error.
        await act(async () => {
            rejectFirstRequest(new Error('request failed'));
            await Promise.resolve();
        });

        expect(result.current.isDownloadErrorModalVisible).toBe(false);
        expect(result.current.isExpensifyCardStatementPDFModalVisible).toBe(true);
        expect(result.current.expensifyCardStatementPDFParams?.entryIDs).toEqual([456]);
    });

    it('should open the multi-feed alert instead of requesting a statement PDF', async () => {
        const firstGroupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const secondGroupKey = `${CONST.SEARCH.GROUP_PREFIX}456`;
        mockSelectedTransactions = {
            firstTxn: makeSelectedTransaction({groupKey: firstGroupKey, reportID: undefined}),
            secondTxn: makeSelectedTransaction({groupKey: secondGroupKey, reportID: undefined}),
        };
        mockCurrentSearchResults = makeCurrentSearchResults({
            // Two different feeds (different fundID) can't share one statement, even under the same program.
            [firstGroupKey]: makeSettlementGroup({entryID: 123, total: 100, feedCountry: 'US', fundID: 1}),
            [secondGroupKey]: makeSettlementGroup({entryID: 456, total: 200, accountNumber: '5678', debitPosted: '2026-05-30', feedCountry: 'US', fundID: 2}),
        });

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expensifyCardStatementQueryJSON}));

        await waitFor(() => {
            expect(getDownloadStatementPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        const exportAsPDFOption = getDownloadStatementPDFOption(result.current.headerButtonsOptions);
        await act(async () => {
            await exportAsPDFOption?.onSelected?.();
        });

        expect(getExpensifyCardStatementPDF).not.toHaveBeenCalled();
        expect(result.current.isExpensifyCardStatementMultiFeedAlertVisible).toBe(true);
    });

    it('should export a cross-workspace settlement as the whole settlement (no policyID)', async () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        mockSelectedTransactions = {
            firstTxn: makeSelectedTransaction({groupKey, reportID: undefined}),
        };
        mockCurrentSearchResults = makeCurrentSearchResults(
            {
                // A cross-workspace settlement has no single policyID; it is still exportable as the whole settlement.
                [groupKey]: makeSettlementGroup({total: 100, policyID: undefined}),
            },
            // The export is admin-only, so a cross-workspace settlement is offered only when the user is an admin of
            // every workspace in the snapshot.
            {[`${ONYXKEYS.COLLECTION.POLICY}policy1`]: {id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}},
        );

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: unscopedExpensifyCardStatementQueryJSON}));

        await waitFor(() => {
            expect(getDownloadStatementPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        const exportAsPDFOption = getDownloadStatementPDFOption(result.current.headerButtonsOptions);
        await act(async () => {
            await exportAsPDFOption?.onSelected?.();
        });

        // No policyID is sent, so the backend returns the whole settlement.
        expect(getExpensifyCardStatementPDF).toHaveBeenCalledWith(undefined, 'US', [123]);
    });

    it('should not offer Export as PDF when all matching items are selected', async () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        mockSelectedTransactions = {
            firstTxn: makeSelectedTransaction({groupKey, reportID: undefined}),
        };
        mockCurrentSearchResults = makeCurrentSearchResults({
            [groupKey]: makeSettlementGroup(),
        });
        // Select-all-matching only loads the visible rows, so the statement would be incomplete.
        mockAreAllMatchingItemsSelected = true;

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expensifyCardStatementQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions).toBeDefined();
        });
        expect(getDownloadStatementPDFOption(result.current.headerButtonsOptions)).toBeUndefined();
        expect(getExpensifyCardStatementPDF).not.toHaveBeenCalled();
    });

    it('should use the latest settlement selection when Export as PDF is triggered again', async () => {
        const firstGroupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const secondGroupKey = `${CONST.SEARCH.GROUP_PREFIX}456`;
        mockSelectedTransactions = {
            firstTxn0: makeSelectedTransaction({groupKey: firstGroupKey, reportID: undefined}),
            firstTxn1: makeSelectedTransaction({groupKey: firstGroupKey, reportID: undefined}),
        };
        mockCurrentSearchResults = makeCurrentSearchResults({
            [firstGroupKey]: makeSettlementGroup({entryID: 123, count: 2}),
            [secondGroupKey]: makeSettlementGroup({entryID: 456, count: 2, total: 2000, accountNumber: '5678', debitPosted: '2026-05-30'}),
        });

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expensifyCardStatementQueryJSON}));

        await waitFor(() => {
            expect(getDownloadStatementPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        // Capture the handler now and reuse it after the selection changes. PopoverMenu snapshots the
        // submenu item and fires it detached from the current render, so a stale handler must still
        // request the latest selection.
        const snapshottedOnSelected = getDownloadStatementPDFOption(result.current.headerButtonsOptions)?.onSelected;
        await act(async () => {
            await snapshottedOnSelected?.();
        });

        expect(getExpensifyCardStatementPDF).toHaveBeenCalledWith('policy1', 'US', [123]);
        jest.mocked(getExpensifyCardStatementPDF).mockClear();

        mockSelectedTransactions = {
            firstTxn0: makeSelectedTransaction({groupKey: firstGroupKey, reportID: undefined}),
            firstTxn1: makeSelectedTransaction({groupKey: firstGroupKey, reportID: undefined}),
            secondTxn0: makeSelectedTransaction({groupKey: secondGroupKey, reportID: undefined}),
            secondTxn1: makeSelectedTransaction({groupKey: secondGroupKey, reportID: undefined}),
        };

        act(() => {
            result.current.handleExpensifyCardStatementPDFModalHide();
        });

        await act(async () => {
            await snapshottedOnSelected?.();
        });

        expect(getExpensifyCardStatementPDF).toHaveBeenCalledWith('policy1', 'US', [123, 456]);
    });

    it('should not request an Expensify Card statement PDF when offline', async () => {
        mockIsOffline = true;
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        mockSelectedTransactions = {
            txn0: makeSelectedTransaction({groupKey, reportID: undefined}),
            txn1: makeSelectedTransaction({groupKey, reportID: undefined}),
        };
        mockCurrentSearchResults = makeCurrentSearchResults({
            [groupKey]: makeSettlementGroup({count: 2}),
        });

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expensifyCardStatementQueryJSON}));

        await waitFor(() => {
            expect(getDownloadStatementPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        const exportAsPDFOption = getDownloadStatementPDFOption(result.current.headerButtonsOptions);
        await act(async () => {
            await exportAsPDFOption?.onSelected?.();
        });

        expect(getExpensifyCardStatementPDF).not.toHaveBeenCalled();
    });
});
