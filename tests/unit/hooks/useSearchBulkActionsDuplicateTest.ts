/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {SearchQueryJSON, SelectedTransactions} from '@components/Search/types';
import useSearchBulkActions from '@hooks/useSearchBulkActions';
import {bulkDuplicateExpenses} from '@libs/actions/IOU/Duplicate';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomTransaction from '../../utils/collections/transaction';

jest.mock('@libs/actions/IOU/Duplicate', () => ({
    bulkDuplicateExpenses: jest.fn(),
}));

jest.mock('@libs/actions/Search', () => ({
    getExportTemplates: jest.fn(() => []),
    exportSearchItemsToCSV: jest.fn(),
    queueExportSearchItemsToCSV: jest.fn(),
    queueExportSearchWithTemplate: jest.fn(),
    approveMoneyRequestOnSearch: jest.fn(),
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

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
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

const mockClearSelectedTransactions = jest.fn();
const mockSelectAllMatchingItems = jest.fn();
let mockSelectedTransactions: SelectedTransactions = {};
let mockSelectedReports: never[] = [];
let mockAreAllMatchingItemsSelected = false;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchStateContext: () => ({
        selectedTransactions: mockSelectedTransactions,
        selectedReports: mockSelectedReports,
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected,
        currentSearchResults: undefined,
    }),
    useSearchActionsContext: () => ({
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

describe('useSearchBulkActions - duplicate option', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockSelectedTransactions = {};
        mockSelectedReports = [];
        mockAreAllMatchingItemsSelected = false;
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('should show duplicate option for a cash expense', async () => {
        const transactionID = '100';
        const transaction = {
            ...createRandomTransaction(1),
            transactionID,
            managedCard: false,
        };

        mockSelectedTransactions = {
            [transactionID]: {
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

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            const duplicateOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE);
            expect(duplicateOption).toBeDefined();
        });

        const duplicateOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE);
        expect(duplicateOption?.text).toBe('search.bulkActions.duplicate');
    });

    it('should not show duplicate option when a card expense is selected', async () => {
        const transactionID = '200';
        const transaction = {
            ...createRandomTransaction(1),
            transactionID,
            managedCard: true,
        };

        mockSelectedTransactions = {
            [transactionID]: {
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

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        const duplicateOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE);
        expect(duplicateOption).toBeUndefined();
    });

    it('should not show duplicate option when selection includes a mix of cash and card expenses', async () => {
        const cashTransactionID = '300';
        const cardTransactionID = '301';

        const cashTransaction = {
            ...createRandomTransaction(1),
            transactionID: cashTransactionID,
            managedCard: false,
        };
        const cardTransaction = {
            ...createRandomTransaction(2),
            transactionID: cardTransactionID,
            managedCard: true,
        };

        const sharedFields = {
            isSelected: true as const,
            canReject: false,
            canHold: false,
            canSplit: false,
            hasBeenSplit: false,
            canChangeReport: false,
            isHeld: false,
            canUnhold: false,
            action: CONST.SEARCH.ACTION_TYPES.VIEW,
            policyID: 'policy1',
            amount: 100,
            currency: 'USD',
            isFromOneTransactionReport: false,
        };

        mockSelectedTransactions = {
            [cashTransactionID]: {...sharedFields, reportID: 'report1'},
            [cardTransactionID]: {...sharedFields, reportID: 'report2'},
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${cashTransactionID}`, cashTransaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${cardTransactionID}`, cardTransaction);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        const duplicateOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE);
        expect(duplicateOption).toBeUndefined();
    });

    it('should show duplicate option for multiple cash expenses', async () => {
        const transactionID1 = '400';
        const transactionID2 = '401';

        const transaction1 = {
            ...createRandomTransaction(1),
            transactionID: transactionID1,
            managedCard: false,
        };
        const transaction2 = {
            ...createRandomTransaction(2),
            transactionID: transactionID2,
            managedCard: false,
        };

        const sharedFields = {
            isSelected: true,
            canReject: false,
            canHold: false,
            canSplit: false,
            hasBeenSplit: false,
            canChangeReport: false,
            isHeld: false,
            canUnhold: false,
            action: CONST.SEARCH.ACTION_TYPES.VIEW,
            policyID: 'policy1',
            amount: 100,
            currency: 'USD',
            isFromOneTransactionReport: false,
        };

        mockSelectedTransactions = {
            [transactionID1]: {...sharedFields, reportID: 'report1'},
            [transactionID2]: {...sharedFields, reportID: 'report2'},
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID1}`, transaction1);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID2}`, transaction2);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            const duplicateOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE);
            expect(duplicateOption).toBeDefined();
        });
    });

    it('should not show duplicate option for expense report type', async () => {
        const transactionID = '500';
        const transaction = {
            ...createRandomTransaction(1),
            transactionID,
            managedCard: false,
        };

        mockSelectedTransactions = {
            [transactionID]: {
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

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        const expenseReportQueryJSON: SearchQueryJSON = {
            ...baseQueryJSON,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        };

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });

        const duplicateOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE);
        expect(duplicateOption).toBeUndefined();
    });

    it('should call bulkDuplicateExpenses when duplicate is triggered', async () => {
        const transactionID1 = '600';
        const transactionID2 = '601';

        const transaction1 = {
            ...createRandomTransaction(1),
            transactionID: transactionID1,
            managedCard: false,
        };
        const transaction2 = {
            ...createRandomTransaction(2),
            transactionID: transactionID2,
            managedCard: false,
        };

        const sharedFields = {
            isSelected: true as const,
            canReject: false,
            canHold: false,
            canSplit: false,
            hasBeenSplit: false,
            canChangeReport: false,
            isHeld: false,
            canUnhold: false,
            action: CONST.SEARCH.ACTION_TYPES.VIEW,
            policyID: 'policy1',
            amount: 100,
            currency: 'USD',
            isFromOneTransactionReport: false,
        };

        mockSelectedTransactions = {
            [transactionID1]: {...sharedFields, reportID: 'report1'},
            [transactionID2]: {...sharedFields, reportID: 'report2'},
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID1}`, transaction1);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID2}`, transaction2);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            const duplicateOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE);
            expect(duplicateOption).toBeDefined();
        });

        const duplicateOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE);
        duplicateOption?.onSelected?.();

        expect(bulkDuplicateExpenses).toHaveBeenCalledTimes(1);
        expect(bulkDuplicateExpenses).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionIDs: expect.arrayContaining([transactionID1, transactionID2]),
            }),
        );
        expect(mockClearSelectedTransactions).toHaveBeenCalledWith(undefined, true);
    });

    it('should not show duplicate option when no transactions are selected', () => {
        mockSelectedTransactions = {};

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        const duplicateOption = result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE);
        expect(duplicateOption).toBeUndefined();
    });
});
