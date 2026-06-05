import {act, renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';
import useSearchBulkActions from '@hooks/useSearchBulkActions';
import type {SearchHeaderOptionValue} from '@hooks/useSearchBulkActions';
import {getExpensifyCardStatementPDF} from '@libs/actions/CompanyCards';
import {exportReportToPDF} from '@libs/actions/Report';
import {getExpensifyCardStatementSelection} from '@libs/ExpensifyCardStatementUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';

jest.mock('@libs/actions/Report', () => ({
    exportReportToPDF: jest.fn(),
}));

jest.mock('@libs/actions/CompanyCards', () => ({
    getExpensifyCardStatementPDF: jest.fn(() => Promise.resolve({})),
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
        reportID: 'report1',
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
    flatFilters: [
        {
            key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE,
            filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD}],
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

function makeCurrentSearchResults(data: SearchResultDataType): SearchResults {
    return {
        data,
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

function getExportAsPDFOption(options: Array<DropdownOption<SearchHeaderOptionValue>>) {
    const exportOption = options.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.EXPORT);
    if (!exportOption) {
        return undefined;
    }

    if (exportOption.text === 'export.exportAsPDF') {
        return exportOption;
    }

    return exportOption.subMenuItems?.find((subMenuItem) => subMenuItem.text === 'export.exportAsPDF');
}

// ---- tests ----

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

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@example.com'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}report1`, {
            reportID: 'report1',
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            reportName: 'Report report1',
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
                reportID: 'report1',
                policyID: 'policy1',
                amount: 100,
                currency: 'USD',
                isFromOneTransactionReport: false,
            },
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

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
                reportID: 'report1',
                policyID: 'policy1',
                amount: 100,
                currency: 'USD',
                isFromOneTransactionReport: false,
            },
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

        await waitFor(() => {
            expect(getDownloadPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        const pdfOption = getDownloadPDFOption(result.current.headerButtonsOptions);
        await act(async () => {
            await pdfOption?.onSelected?.();
        });

        expect(exportReportToPDF).toHaveBeenCalledTimes(1);
        expect(exportReportToPDF).toHaveBeenCalledWith({reportID: 'report1'});
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
                reportID: 'report1',
                policyID: 'policy1',
                amount: 100,
                currency: 'USD',
                isFromOneTransactionReport: false,
            },
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

        await waitFor(() => {
            expect(getDownloadPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        const pdfOption = getDownloadPDFOption(result.current.headerButtonsOptions);
        await act(async () => {
            await pdfOption?.onSelected?.();
        });

        expect(exportReportToPDF).not.toHaveBeenCalled();
    });

    it('should not show Download as PDF when multiple reports are selected', async () => {
        mockSelectedReports = [makeSelectedReport(), makeSelectedReport({reportID: 'report2'})];
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
                reportID: 'report1',
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
                reportID: 'report2',
                policyID: 'policy1',
                amount: 200,
                currency: 'USD',
                isFromOneTransactionReport: false,
            },
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        expect(getDownloadPDFOption(result.current.headerButtonsOptions)).toBeUndefined();
    });

    it('should show Export as PDF for selected Expensify Card settlement groups', async () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        mockSelectedTransactions = {
            txn0: makeSelectedTransaction({groupKey, reportID: undefined}),
            txn1: makeSelectedTransaction({groupKey, reportID: undefined}),
        };
        mockCurrentSearchResults = makeCurrentSearchResults({
            [groupKey]: {
                entryID: 123,
                count: 2,
                total: 1000,
                currency: 'USD',
                accountNumber: '1234',
                bankName: 'American Express',
                debitPosted: '2026-05-31',
                state: 8,
                policyID: 'policy1',
                feedCountry: 'US',
            },
        } as unknown as SearchResultDataType);

        expect(getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, mockSelectedTransactions, mockCurrentSearchResults?.data)).toBeDefined();

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expensifyCardStatementQueryJSON}));

        await waitFor(() => {
            expect(getExportAsPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });
    });

    it('should request an Expensify Card statement PDF when Export as PDF is triggered', async () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        mockSelectedTransactions = {
            txn0: makeSelectedTransaction({groupKey, reportID: undefined}),
            txn1: makeSelectedTransaction({groupKey, reportID: undefined}),
        };
        mockCurrentSearchResults = makeCurrentSearchResults({
            [groupKey]: {
                entryID: 123,
                count: 2,
                total: 1000,
                currency: 'USD',
                accountNumber: '1234',
                bankName: 'American Express',
                debitPosted: '2026-05-31',
                state: 8,
                policyID: 'policy1',
                feedCountry: 'US',
            },
        } as unknown as SearchResultDataType);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expensifyCardStatementQueryJSON}));

        await waitFor(() => {
            expect(getExportAsPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        const exportAsPDFOption = getExportAsPDFOption(result.current.headerButtonsOptions);
        await act(async () => {
            await exportAsPDFOption?.onSelected?.();
        });

        expect(getExpensifyCardStatementPDF).toHaveBeenCalledTimes(1);
        expect(getExpensifyCardStatementPDF).toHaveBeenCalledWith('policy1', 'US', [123]);
        expect(result.current.isExpensifyCardStatementPDFModalVisible).toBe(true);
    });

    it('should open the multi-feed alert instead of requesting a statement PDF', async () => {
        const firstGroupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const secondGroupKey = `${CONST.SEARCH.GROUP_PREFIX}456`;
        mockSelectedTransactions = {
            firstTxn: makeSelectedTransaction({groupKey: firstGroupKey, reportID: undefined}),
            secondTxn: makeSelectedTransaction({groupKey: secondGroupKey, reportID: undefined}),
        };
        mockCurrentSearchResults = makeCurrentSearchResults({
            [firstGroupKey]: {
                entryID: 123,
                count: 1,
                total: 100,
                currency: 'USD',
                accountNumber: '1234',
                bankName: 'American Express',
                debitPosted: '2026-05-31',
                state: 8,
                policyID: 'policy1',
                feedCountry: 'US',
            },
            [secondGroupKey]: {
                entryID: 456,
                count: 1,
                total: 200,
                currency: 'USD',
                accountNumber: '5678',
                bankName: 'American Express',
                debitPosted: '2026-05-30',
                state: 8,
                policyID: 'policy2',
                feedCountry: 'US',
            },
        } as unknown as SearchResultDataType);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expensifyCardStatementQueryJSON}));

        await waitFor(() => {
            expect(getExportAsPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        const exportAsPDFOption = getExportAsPDFOption(result.current.headerButtonsOptions);
        await act(async () => {
            await exportAsPDFOption?.onSelected?.();
        });

        expect(getExpensifyCardStatementPDF).not.toHaveBeenCalled();
        expect(result.current.isExpensifyCardStatementMultiFeedAlertVisible).toBe(true);
    });

    it('should open the multi-feed alert for a mixed-workspace settlement', async () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        mockSelectedTransactions = {
            firstTxn: makeSelectedTransaction({groupKey, reportID: undefined}),
        };
        mockCurrentSearchResults = makeCurrentSearchResults({
            [groupKey]: {
                entryID: 123,
                count: 1,
                total: 100,
                currency: 'USD',
                accountNumber: '1234',
                bankName: 'American Express',
                debitPosted: '2026-05-31',
                state: 8,
            },
        } as unknown as SearchResultDataType);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expensifyCardStatementQueryJSON}));

        await waitFor(() => {
            expect(getExportAsPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        const exportAsPDFOption = getExportAsPDFOption(result.current.headerButtonsOptions);
        await act(async () => {
            await exportAsPDFOption?.onSelected?.();
        });

        expect(getExpensifyCardStatementPDF).not.toHaveBeenCalled();
        expect(result.current.isExpensifyCardStatementMultiFeedAlertVisible).toBe(true);
    });

    it('should use the latest settlement selection when Export as PDF is triggered again', async () => {
        const firstGroupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const secondGroupKey = `${CONST.SEARCH.GROUP_PREFIX}456`;
        mockSelectedTransactions = {
            firstTxn0: makeSelectedTransaction({groupKey: firstGroupKey, reportID: undefined}),
            firstTxn1: makeSelectedTransaction({groupKey: firstGroupKey, reportID: undefined}),
        };
        mockCurrentSearchResults = makeCurrentSearchResults({
            [firstGroupKey]: {
                entryID: 123,
                count: 2,
                total: 1000,
                currency: 'USD',
                accountNumber: '1234',
                bankName: 'American Express',
                debitPosted: '2026-05-31',
                state: 8,
                policyID: 'policy1',
                feedCountry: 'US',
            },
            [secondGroupKey]: {
                entryID: 456,
                count: 2,
                total: 2000,
                currency: 'USD',
                accountNumber: '5678',
                bankName: 'American Express',
                debitPosted: '2026-05-30',
                state: 8,
                policyID: 'policy1',
                feedCountry: 'US',
            },
        } as unknown as SearchResultDataType);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expensifyCardStatementQueryJSON}));

        await waitFor(() => {
            expect(getExportAsPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        // Capture the handler now and reuse it after the selection changes. PopoverMenu snapshots the
        // submenu item and fires it detached from the current render, so a stale handler must still
        // request the latest selection.
        const snapshottedOnSelected = getExportAsPDFOption(result.current.headerButtonsOptions)?.onSelected;
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
            [groupKey]: {
                entryID: 123,
                count: 2,
                total: 1000,
                currency: 'USD',
                accountNumber: '1234',
                bankName: 'American Express',
                debitPosted: '2026-05-31',
                state: 8,
                policyID: 'policy1',
                feedCountry: 'US',
            },
        } as unknown as SearchResultDataType);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expensifyCardStatementQueryJSON}));

        await waitFor(() => {
            expect(getExportAsPDFOption(result.current.headerButtonsOptions)).toBeDefined();
        });

        const exportAsPDFOption = getExportAsPDFOption(result.current.headerButtonsOptions);
        await act(async () => {
            await exportAsPDFOption?.onSelected?.();
        });

        expect(getExpensifyCardStatementPDF).not.toHaveBeenCalled();
    });
});
