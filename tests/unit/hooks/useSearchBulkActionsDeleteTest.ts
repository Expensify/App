import {act, renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';
import useSearchBulkActions from '@hooks/useSearchBulkActions';
import {deleteMoneyRequest} from '@libs/actions/IOU/DeleteMoneyRequest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, SearchResults} from '@src/types/onyx';
import type * as MockUsePaymentContextUtil from '../../utils/mockUsePaymentContext';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock('@libs/actions/IOU/DeleteMoneyRequest', () => ({
    deleteMoneyRequest: jest.fn(),
}));

jest.mock('@libs/actions/IOU/SplitTransactionUpdate', () => ({
    updateSplitTransactions: jest.fn(),
}));

jest.mock('@libs/actions/SplitExpenses.ts', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/actions/Report', () => ({
    deleteAppReport: jest.fn(),
    moveIOUReportToPolicy: jest.fn(),
    moveIOUReportToPolicyAndInviteSubmitter: jest.fn(),
    exportReportToPDF: jest.fn(),
    markAsManuallyExported: jest.fn(),
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

jest.mock('@hooks/usePolicyForMovingExpenses', () => ({
    __esModule: true,
    default: () => ({policyForMovingExpensesID: 'policy1'}),
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

jest.mock('@hooks/useAllPolicyExpenseChatReportActions', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@hooks/useUndeleteTransactions', () => ({
    __esModule: true,
    default: () => jest.fn(),
}));

// Mock shouldShowDeleteOption so we can control when the delete button is visible
// without depending on the full ownership/permission check chain in canDeleteMoneyRequestReport.
// The ownership check is separately covered by ReportUtilsTest; here we focus on whether
// the bulk-delete path can find the IOU action from the search snapshot.
let mockShouldShowDeleteOption = false;
jest.mock('@libs/SearchUIUtils', () => ({
    shouldShowDeleteOption: () => mockShouldShowDeleteOption,
    getSelectedGroupFilterEntry: jest.fn(),
    navigateToSearchRHP: jest.fn(),
    getValidGroupBy: jest.fn(),
    getColumnsToShow: jest.fn(() => []),
    getSearchColumnTranslationKey: jest.fn(),
}));

jest.mock('@hooks/useDuplicateTransactionsAndViolations', () => ({
    __esModule: true,
    default: () => ({duplicateTransactions: {}, duplicateTransactionViolations: {}}),
}));

// Make InteractionManager execute callbacks immediately so we don't need fake timers
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

const TRANSACTION_ID = 'unreported-tx-1';
const SELF_DM_REPORT_ID = 'self-dm-report-1';
const IOU_ACTION_ID = 'iou-action-1';

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

/** Minimal IOU report action that references our test transaction */
function makeIOUAction(overrides: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID: IOU_ACTION_ID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: CURRENT_USER_ACCOUNT_ID,
        created: '2026-01-01 10:00:00',
        originalMessage: {
            IOUTransactionID: TRANSACTION_ID,
            IOUReportID: SELF_DM_REPORT_ID,
            type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
            amount: 100,
            currency: 'USD',
        },
        person: [],
        shouldShow: true,
        ...overrides,
    } as unknown as ReportAction;
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
        reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        policyID: undefined,
        amount: 100,
        currency: 'USD',
        isFromOneTransactionReport: false,
        ...overrides,
    };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useSearchBulkActions - delete unreported expenses', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockSelectedTransactions = {};
        mockSelectedReports = [];
        mockCurrentSearchResults = undefined;
        mockShouldShowDeleteOption = false;

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@example.com'});
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('calls deleteMoneyRequest for an unreported expense when the IOU action is only in the search snapshot', async () => {
        /**
         * Given: an unreported expense whose IOU action lives in the search snapshot
         *        but is NOT in the real Onyx REPORT_ACTIONS collection.
         *
         * This is the root cause of the bug: SearchBulkActionsButton renders outside
         * SearchScopeProvider, so useOnyx(REPORT_ACTIONS) reads the real Onyx collection
         * instead of the snapshot. Without the fix, flattenedReportActions is missing the
         * action → deleteTransactions silently skips → no API call.
         *
         * When: the user selects the unreported expense and confirms bulk delete.
         *
         * Then: deleteMoneyRequest is called with the correct transactionID and reportAction.
         */
        const iouAction = makeIOUAction();

        // Snapshot contains the IOU action (simulates what the search API returns).
        mockCurrentSearchResults = {
            search: {
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                offset: 0,
                hasMoreResults: false,
                hasResults: true,
                isLoading: false,
                count: 1,
                total: 100,
                currency: 'USD',
            },
            data: {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${SELF_DM_REPORT_ID}`]: {
                    [IOU_ACTION_ID]: iouAction,
                },
            },
        } as unknown as SearchResults;

        // The transaction itself is available in Onyx (used by useAllTransactions).
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            amount: -100,
            currency: 'USD',
            merchant: 'Test Merchant',
            created: '2026-01-01',
            comment: {},
        });

        // NOTE: We deliberately do NOT write Onyx REPORT_ACTIONS for SELF_DM_REPORT_ID.
        // That is the bug condition: the action exists only in the snapshot.

        mockSelectedTransactions = {
            [TRANSACTION_ID]: makeSelectedTransaction(),
        };

        // shouldShowDeleteOption is mocked to true so the button appears.
        mockShouldShowDeleteOption = true;

        // Confirm the delete modal.
        mockShowConfirmModal.mockResolvedValue({action: 'CONFIRM'});

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        // Wait for the DELETE option to appear.
        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DELETE)).toBeDefined();
        });

        // Trigger the delete action.
        await act(async () => {
            result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DELETE)?.onSelected?.();
            // Flush pending microtasks so the async confirm-modal await resolves.
            await Promise.resolve();
            await Promise.resolve();
        });

        // deleteMoneyRequest must have been called — the fix makes the snapshot action available.
        await waitFor(() => {
            expect(deleteMoneyRequest).toHaveBeenCalledTimes(1);
            expect(deleteMoneyRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionID: TRANSACTION_ID,
                    reportAction: expect.objectContaining({
                        reportActionID: IOU_ACTION_ID,
                    }),
                }),
            );
        });
    });

    it('does NOT call deleteMoneyRequest when the IOU action is absent from both snapshot and Onyx REPORT_ACTIONS', async () => {
        /**
         * Given: an unreported expense with no IOU action anywhere (neither in the
         *        search snapshot nor in the real Onyx REPORT_ACTIONS collection).
         *
         * When: the user confirms bulk delete.
         *
         * Then: deleteMoneyRequest is NOT called — the transaction is silently skipped.
         *
         * This is a known graceful no-op: without the action there is no IOUReportID
         * and nothing to delete server-side.
         */

        // No snapshot data at all.
        mockCurrentSearchResults = undefined;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            amount: -100,
            currency: 'USD',
            merchant: 'Test Merchant',
            created: '2026-01-01',
            comment: {},
        });

        mockSelectedTransactions = {
            [TRANSACTION_ID]: makeSelectedTransaction(),
        };

        mockShouldShowDeleteOption = true;
        mockShowConfirmModal.mockResolvedValue({action: 'CONFIRM'});

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DELETE)).toBeDefined();
        });

        await act(async () => {
            result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DELETE)?.onSelected?.();
            await Promise.resolve();
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(mockShowConfirmModal).toHaveBeenCalled();
        });

        // No deleteMoneyRequest call — no action was found.
        expect(deleteMoneyRequest).not.toHaveBeenCalled();
    });
});
