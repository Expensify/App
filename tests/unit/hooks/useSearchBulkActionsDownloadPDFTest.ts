import {act, renderHook, waitFor} from '@testing-library/react-native';

import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';

import useSearchBulkActions from '@hooks/useSearchBulkActions';
import type {SearchHeaderOptionValue} from '@hooks/useSearchBulkActions';

import {exportReportsToPDF} from '@libs/actions/Export';
import {exportReportToPDF} from '@libs/actions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import type * as MockUsePaymentContextUtil from '../../utils/mockUsePaymentContext';

jest.mock('@libs/actions/Export', () => ({
    exportReportsToPDF: jest.fn(() => 'mock-export-id'),
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

const mockClearSelectedTransactions = jest.fn();
let mockSelectedTransactions: SelectedTransactions = {};
let mockSelectedReports: SelectedReports[] = [];

jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionContext: () => ({
        selectedTransactions: mockSelectedTransactions,
        selectedReports: mockSelectedReports,
        areAllMatchingItemsSelected: false,
    }),
    useSearchResultsContext: () => ({
        currentSearchResults: undefined,
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

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@example.com'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {
            reportID: '1',
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            reportName: 'Report 1',
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
});
