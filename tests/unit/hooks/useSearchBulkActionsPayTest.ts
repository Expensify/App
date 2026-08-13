import {act, renderHook, waitFor} from '@testing-library/react-native';

import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';

import useSearchBulkActions from '@hooks/useSearchBulkActions';
import type {SearchHeaderOptionValue} from '@hooks/useSearchBulkActions';

import {payMoneyRequest} from '@libs/actions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

// The Pay option is shown only when getPayOption enables it and useBulkPayOptions returns at least one payment option.
// Both are driven from these module-level flags so each test can toggle them independently.
let mockShouldEnableBulkPayOption = true;
let mockBulkPayButtonOptions: Array<Record<string, unknown>> = [{text: 'Pay with bank account', key: CONST.IOU.PAYMENT_TYPE.VBBA}];

jest.mock('@libs/actions/IOU/PayMoneyRequest', () => ({
    payMoneyRequest: jest.fn(),
    payInvoice: jest.fn(),
}));

// On iOS the offline modal is deferred until the payment popover finishes dismissing (via TransitionTracker),
// which never fires under Jest. Invoke the callback synchronously so we can assert the modal opens.
jest.mock('@libs/deferModalPresentationAfterPopoverDismiss', () => ({
    __esModule: true,
    default: (presentModal: () => void) => presentModal(),
}));

jest.mock('@libs/actions/Search', () => ({
    getExportTemplates: jest.fn(() => ({customTemplates: [], defaultTemplates: []})),
    exportSearchItemsToCSV: jest.fn(),
    queueExportSearchItemsToCSV: jest.fn(),
    queueExportSearchWithTemplate: jest.fn(),
    getSearchApproveOnyxData: jest.fn(() => ({})),
    getSearchPayOnyxData: jest.fn(() => ({})),
    bulkDeleteReports: jest.fn(),
    getLastPolicyBankAccountID: jest.fn(),
    getLastPolicyPaymentMethod: jest.fn(),
    getPayMoneyOnSearchInvoiceParams: jest.fn(),
    getPayOption: jest.fn(() => ({shouldEnableBulkPayOption: mockShouldEnableBulkPayOption, isFirstTimePayment: false})),
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

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string) => key,
        localeCompare: (first: string, second: string) => first && second,
        formatPhoneNumber: (phone: string) => phone,
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
    default: () => ({bulkPayButtonOptions: mockBulkPayButtonOptions, latestBankItems: []}),
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
let mockSelectedTransactions: SelectedTransactions = {};
let mockSelectedReports: SelectedReports[] = [];
let mockAreAllMatchingItemsSelected = false;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionContext: () => ({
        selectedTransactions: mockSelectedTransactions,
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
        action: CONST.SEARCH.ACTION_TYPES.PAY,
        reportID: '1',
        policyID: 'policy1',
        amount: 100,
        currency: 'USD',
        isFromOneTransactionReport: false,
        ...overrides,
    };
}

function getPayOptionFromResult(options: Array<DropdownOption<SearchHeaderOptionValue>>): DropdownOption<SearchHeaderOptionValue> | undefined {
    return options.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.PAY);
}

describe('useSearchBulkActions - Pay option', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsOffline = false;
        mockShouldEnableBulkPayOption = true;
        mockBulkPayButtonOptions = [{text: 'Pay with bank account', key: CONST.IOU.PAYMENT_TYPE.VBBA}];
        mockAreAllMatchingItemsSelected = false;
        await Onyx.clear();
        mockSelectedTransactions = {tx1: makeSelectedTransaction()};
        mockSelectedReports = [];

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@example.com'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, {
            id: 'policy1',
            role: CONST.POLICY.ROLE.ADMIN,
        });
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('shows the Pay option when online', async () => {
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

        await waitFor(() => {
            expect(getPayOptionFromResult(result.current.headerButtonsOptions)).toBeDefined();
        });
    });

    it('still shows the Pay option when offline', async () => {
        mockIsOffline = true;

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

        await waitFor(() => {
            expect(getPayOptionFromResult(result.current.headerButtonsOptions)).toBeDefined();
        });
    });

    it('opens the offline modal instead of paying when Pay is selected offline', async () => {
        mockIsOffline = true;

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

        await waitFor(() => {
            expect(getPayOptionFromResult(result.current.headerButtonsOptions)).toBeDefined();
        });

        const payOption = getPayOptionFromResult(result.current.headerButtonsOptions);
        await act(async () => {
            await payOption?.onSelected?.();
        });

        expect(result.current.isOfflineModalVisible).toBe(true);
        expect(payMoneyRequest).not.toHaveBeenCalled();
    });

    it('hides the Pay option when bulk pay is not enabled', async () => {
        mockShouldEnableBulkPayOption = false;

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: expenseReportQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions).toBeDefined();
        });
        expect(getPayOptionFromResult(result.current.headerButtonsOptions)).toBeUndefined();
    });
});
