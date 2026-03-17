/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {SelectedReports, SelectedTransactionInfo, SelectedTransactions} from '@components/Search/types';
import useSearchBulkActions from '@hooks/useSearchBulkActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

// --- Mutable mock state ---
let mockIsOffline = false;
let mockSelectedTransactions: SelectedTransactions = {};
let mockSelectedReports: SelectedReports[] = [];
let mockAreAllMatchingItemsSelected = false;
let mockCurrentSearchResults: {data?: Record<string, unknown>; search?: Record<string, unknown>} | undefined;
let mockCurrentSearchKey: string | undefined;
const mockClearSelectedTransactions = jest.fn();
const mockSelectAllMatchingItems = jest.fn();

let mockIsDelegateAccessRestricted = false;
const mockShowDelegateNoAccessModal = jest.fn();

let mockCanIOUBePaidResult = false;
let mockCanIOUBePaidElsewhereResult = false;

let mockShouldShowDeleteOption = false;

let mockGetPayOptionResult = {shouldEnableBulkPayOption: false, isFirstTimePayment: false};

let mockBulkPayButtonOptions: Array<{text: string}> | undefined;
let mockBusinessBankAccountOptions: Array<{text: string}> | undefined;
let mockShouldShowBusinessBankAccountOptions = false;

let mockIsLoadingBankAccountListValue = false;

// --- Module mocks ---
jest.mock('@rnmapbox/maps', () => ({
    __esModule: true,
    default: {},
    MarkerView: {},
    setAccessToken: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn(() => true),
    createNavigationContainerRef: () => ({}),
}));

const MockIcon = 'MockIcon';
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        Export: MockIcon,
        Table: MockIcon,
        DocumentMerge: MockIcon,
        Send: MockIcon,
        Trashcan: MockIcon,
        ThumbsUp: MockIcon,
        ThumbsDown: MockIcon,
        ArrowRight: MockIcon,
        ArrowCollapse: MockIcon,
        Stopwatch: MockIcon,
        Exclamation: MockIcon,
        MoneyBag: MockIcon,
        ArrowSplit: MockIcon,
        QBOSquare: MockIcon,
        XeroSquare: MockIcon,
        NetSuiteSquare: MockIcon,
        IntacctSquare: MockIcon,
        QBDSquare: MockIcon,
        CertiniaSquare: MockIcon,
        Pencil: MockIcon,
    }),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: jest.fn((key: string) => key),
        localeCompare: jest.fn((a: string, b: string) => a.localeCompare(b)),
        formatPhoneNumber: jest.fn((phone: string) => phone),
        toLocaleDigit: jest.fn((digit: string) => digit),
    }),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({
        integrationIcon: {},
        colorMuted: {},
        fontWeightNormal: {},
        textWrap: {},
    }),
}));

jest.mock('@hooks/useTheme', () => ({
    __esModule: true,
    default: () => ({
        icon: '#000',
    }),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({
        get isOffline() {
            return mockIsOffline;
        },
    }),
}));

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessState: () => ({
        get isDelegateAccessRestricted() {
            return mockIsDelegateAccessRestricted;
        },
    }),
    useDelegateNoAccessActions: () => ({
        showDelegateNoAccessModal: mockShowDelegateNoAccessModal,
    }),
}));

jest.mock('@components/Search/SearchContext', () => ({
    useSearchStateContext: () => ({
        get selectedTransactions() {
            return mockSelectedTransactions;
        },
        get selectedReports() {
            return mockSelectedReports;
        },
        get areAllMatchingItemsSelected() {
            return mockAreAllMatchingItemsSelected;
        },
        get currentSearchResults() {
            return mockCurrentSearchResults;
        },
        get currentSearchKey() {
            return mockCurrentSearchKey;
        },
    }),
    useSearchActionsContext: () => ({
        clearSelectedTransactions: mockClearSelectedTransactions,
        selectAllMatchingItems: mockSelectAllMatchingItems,
    }),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        accountID: 1,
        login: 'test@example.com',
        email: 'test@example.com',
    })),
}));

jest.mock('@hooks/useAllTransactions', () => ({
    __esModule: true,
    default: () => ({}),
}));

jest.mock('@hooks/useSelfDMReport', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@hooks/useBulkPayOptions', () => ({
    __esModule: true,
    default: () => ({
        get bulkPayButtonOptions() {
            return mockBulkPayButtonOptions;
        },
        get businessBankAccountOptions() {
            return mockBusinessBankAccountOptions;
        },
        get shouldShowBusinessBankAccountOptions() {
            return mockShouldShowBusinessBankAccountOptions;
        },
    }),
}));

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({
        showConfirmModal: jest.fn(() => Promise.resolve({action: 'CONFIRM'})),
    }),
}));

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({
        isBetaEnabled: jest.fn(() => false),
    }),
}));

jest.mock('@hooks/usePersonalPolicy', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => '/test'),
}));

jest.mock('@libs/actions/Search', () => ({
    approveMoneyRequestOnSearch: jest.fn(),
    bulkDeleteReports: jest.fn(),
    exportSearchItemsToCSV: jest.fn(),
    exportToIntegrationOnSearch: jest.fn(),
    getExportTemplates: jest.fn(() => []),
    getLastPolicyBankAccountID: jest.fn(),
    getLastPolicyPaymentMethod: jest.fn(),
    getPayMoneyOnSearchInvoiceParams: jest.fn(() => ({})),
    getPayOption: jest.fn(() => mockGetPayOptionResult),
    getReportType: jest.fn(),
    getTotalFormattedAmount: jest.fn(() => '$0.00'),
    isCurrencySupportWalletBulkPay: jest.fn(() => false),
    payMoneyRequestOnSearch: jest.fn(),
    queueExportSearchItemsToCSV: jest.fn(),
    queueExportSearchWithTemplate: jest.fn(),
    submitMoneyRequestOnSearch: jest.fn(),
    unholdMoneyRequestOnSearch: jest.fn(),
}));

jest.mock('@libs/actions/Report', () => ({
    deleteAppReport: jest.fn(),
    markAsManuallyExported: jest.fn(),
    moveIOUReportToPolicy: jest.fn(),
    moveIOUReportToPolicyAndInviteSubmitter: jest.fn(),
}));

jest.mock('@libs/actions/MergeTransaction', () => ({
    setupMergeTransactionDataAndNavigate: jest.fn(),
}));

jest.mock('@libs/actions/SplitExpenses', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/actions/User', () => ({
    setNameValuePair: jest.fn(),
}));

jest.mock('@libs/MergeTransactionUtils', () => ({
    getTransactionsAndReportsFromSearch: jest.fn(() => ({transactions: [], reports: [], policies: []})),
}));

jest.mock('@libs/PolicyUtils', () => ({
    getConnectedIntegration: jest.fn(() => undefined),
    hasDynamicExternalWorkflow: jest.fn(() => false),
}));

jest.mock('@libs/ReportSecondaryActionUtils', () => ({
    getSecondaryExportReportActions: jest.fn(() => []),
    isMergeActionForSelectedTransactions: jest.fn(() => false),
}));

jest.mock('@libs/ReportUtils', () => ({
    getIntegrationIcon: jest.fn(),
    getReportOrDraftReport: jest.fn(),
    isBusinessInvoiceRoom: jest.fn(() => false),
    isCurrentUserSubmitter: jest.fn(() => false),
    isExpenseReport: jest.fn(() => false),
    isInvoiceReport: jest.fn(() => false),
    isIOUReport: jest.fn(() => false),
}));

jest.mock('@libs/SearchUIUtils', () => ({
    navigateToSearchRHP: jest.fn(),
    shouldShowDeleteOption: jest.fn(() => mockShouldShowDeleteOption),
}));

jest.mock('@libs/SubscriptionUtils', () => ({
    shouldRestrictUserBillableActions: jest.fn(() => false),
}));

jest.mock('@libs/TransactionUtils', () => ({
    hasTransactionBeenRejected: jest.fn(() => false),
}));

jest.mock('@userActions/IOU', () => ({
    canIOUBePaid: jest.fn((_report: unknown, _chatReport: unknown, _policy: unknown, _bankAccountList: unknown, _undefined1: unknown, payElsewhere: boolean) => {
        if (payElsewhere) {
            return mockCanIOUBePaidElsewhereResult;
        }
        return mockCanIOUBePaidResult;
    }),
    dismissRejectUseExplanation: jest.fn(),
}));

jest.mock('@userActions/Link', () => ({
    openOldDotLink: jest.fn(),
}));

jest.mock('@components/Modal/Global/ModalContext', () => ({
    ModalActions: {CONFIRM: 'CONFIRM', CANCEL: 'CANCEL'},
}));

jest.mock('@src/types/utils/isLoadingOnyxValue', () => ({
    __esModule: true,
    default: jest.fn(() => mockIsLoadingBankAccountListValue),
}));

jest.mock('@styles/variables', () => ({
    iconSizeLarge: 20,
}));

// --- Helpers ---
function createTransactionInfo(overrides: Partial<SelectedTransactionInfo> = {}): SelectedTransactionInfo {
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
        isFromOneTransactionReport: true,
        ...overrides,
    };
}

function createBaseQueryJSON() {
    return {
        type: CONST.SEARCH.DATA_TYPES.EXPENSE as string,
        status: CONST.SEARCH.STATUS.EXPENSE.ALL as string,
        hash: 12345,
        inputQuery: 'type:expense status:all',
        recentSearchHash: 12345,
        similarSearchHash: 12345,
        flatFilters: [],
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE as string,
        sortOrder: CONST.SEARCH.SORT_ORDER.DESC as string,
        view: CONST.SEARCH.VIEW.LIST as string,
        filters: {} as never,
    };
}

// --- Tests ---
describe('useSearchBulkActions', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockIsOffline = false;
        mockSelectedTransactions = {};
        mockSelectedReports = [];
        mockAreAllMatchingItemsSelected = false;
        mockCurrentSearchResults = undefined;
        mockCurrentSearchKey = undefined;
        mockIsDelegateAccessRestricted = false;
        mockCanIOUBePaidResult = false;
        mockCanIOUBePaidElsewhereResult = false;
        mockShouldShowDeleteOption = false;
        mockGetPayOptionResult = {shouldEnableBulkPayOption: false, isFirstTimePayment: false};
        mockBulkPayButtonOptions = undefined;
        mockBusinessBankAccountOptions = undefined;
        mockShouldShowBusinessBankAccountOptions = false;
        mockIsLoadingBankAccountListValue = false;
    });

    describe('initial state', () => {
        it('should return empty header options when queryJSON is undefined', () => {
            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: undefined,
                }),
            );

            expect(result.current.headerButtonsOptions).toEqual([]);
        });

        it('should return empty header options when no transactions are selected', () => {
            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            expect(result.current.headerButtonsOptions).toEqual([]);
        });
    });

    describe('onlyShowPayElsewhere loading guard', () => {
        it('should not show only-pay-elsewhere when bank account list is loading', () => {
            mockIsLoadingBankAccountListValue = true;

            // Set up a scenario where onlyShowPayElsewhere WOULD be true if not loading:
            // canIOUBePaid(normal) = false, canIOUBePaid(elsewhere) = true
            mockCanIOUBePaidResult = false;
            mockCanIOUBePaidElsewhereResult = true;

            mockSelectedTransactions = {
                trans1: createTransactionInfo({
                    action: CONST.SEARCH.ACTION_TYPES.PAY,
                    reportID: 'report1',
                    policyID: 'policy1',
                }),
            };

            mockCurrentSearchResults = {
                data: {
                    [`${ONYXKEYS.COLLECTION.REPORT}report1`]: {reportID: 'report1', chatReportID: 'chat1'},
                    [`${ONYXKEYS.COLLECTION.REPORT}chat1`]: {reportID: 'chat1'},
                    [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: {id: 'policy1'},
                },
                search: {type: CONST.SEARCH.DATA_TYPES.EXPENSE, status: CONST.SEARCH.STATUS.EXPENSE.ALL},
            };

            // Enable pay option to verify the behavior
            mockGetPayOptionResult = {shouldEnableBulkPayOption: true, isFirstTimePayment: true};
            mockBulkPayButtonOptions = [{text: 'Pay elsewhere'}];

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            // The pay option should still appear (onlyShowPayElsewhere should be false
            // because bank account list is loading, which prevents the fallback-only behavior)
            const payOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.PAY);
            expect(payOption).toBeDefined();
        });

        it('should evaluate onlyShowPayElsewhere normally when bank account list is loaded', () => {
            mockIsLoadingBankAccountListValue = false;

            mockCanIOUBePaidResult = false;
            mockCanIOUBePaidElsewhereResult = true;

            mockSelectedTransactions = {
                trans1: createTransactionInfo({
                    action: CONST.SEARCH.ACTION_TYPES.PAY,
                    reportID: 'report1',
                    policyID: 'policy1',
                }),
            };

            mockCurrentSearchResults = {
                data: {
                    [`${ONYXKEYS.COLLECTION.REPORT}report1`]: {reportID: 'report1', chatReportID: 'chat1'},
                    [`${ONYXKEYS.COLLECTION.REPORT}chat1`]: {reportID: 'chat1'},
                    [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: {id: 'policy1'},
                },
                search: {type: CONST.SEARCH.DATA_TYPES.EXPENSE, status: CONST.SEARCH.STATUS.EXPENSE.ALL},
            };

            mockGetPayOptionResult = {shouldEnableBulkPayOption: true, isFirstTimePayment: true};
            mockBulkPayButtonOptions = [{text: 'Pay elsewhere'}];

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            // onlyShowPayElsewhere should be true when loaded, because canIOUBePaid(normal)=false
            // and canIOUBePaid(elsewhere)=true. The pay option should still appear.
            const payOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.PAY);
            expect(payOption).toBeDefined();
        });
    });

    describe('headerButtonsOptions', () => {
        it('should show only export option when all matching items are selected', () => {
            mockAreAllMatchingItemsSelected = true;
            mockSelectedTransactions = {
                trans1: createTransactionInfo(),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            expect(result.current.headerButtonsOptions).toHaveLength(1);
            expect(result.current.headerButtonsOptions.at(0)?.value).toBe(CONST.SEARCH.BULK_ACTION_TYPES.EXPORT);
        });

        it('should always include export option when transactions are selected', () => {
            mockSelectedTransactions = {
                trans1: createTransactionInfo({action: CONST.SEARCH.ACTION_TYPES.VIEW}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const exportOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.EXPORT);
            expect(exportOption).toBeDefined();
        });

        it('should show approve option when all selected transactions have approve action', () => {
            mockSelectedTransactions = {
                trans1: createTransactionInfo({action: CONST.SEARCH.ACTION_TYPES.APPROVE, reportID: undefined}),
                trans2: createTransactionInfo({action: CONST.SEARCH.ACTION_TYPES.APPROVE, reportID: undefined}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const approveOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE);
            expect(approveOption).toBeDefined();
        });

        it('should show pay option when shouldEnableBulkPayOption is true', () => {
            mockGetPayOptionResult = {shouldEnableBulkPayOption: true, isFirstTimePayment: false};
            mockSelectedTransactions = {
                trans1: createTransactionInfo({action: CONST.SEARCH.ACTION_TYPES.PAY}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const payOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.PAY);
            expect(payOption).toBeDefined();
        });

        it('should show hold option when all transactions can be held', () => {
            mockSelectedTransactions = {
                trans1: createTransactionInfo({canHold: true}),
                trans2: createTransactionInfo({canHold: true}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const holdOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.HOLD);
            expect(holdOption).toBeDefined();
        });

        it('should show unhold option when all transactions can be unheld', () => {
            mockSelectedTransactions = {
                trans1: createTransactionInfo({canUnhold: true}),
                trans2: createTransactionInfo({canUnhold: true}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const unholdOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD);
            expect(unholdOption).toBeDefined();
        });

        it('should show submit option when all selected transactions have submit action', () => {
            mockSelectedTransactions = {
                trans1: createTransactionInfo({action: CONST.SEARCH.ACTION_TYPES.SUBMIT, reportID: undefined}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const submitOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT);
            expect(submitOption).toBeDefined();
        });

        it('should show reject option when all transactions can be rejected', () => {
            mockSelectedTransactions = {
                trans1: createTransactionInfo({canReject: true}),
                trans2: createTransactionInfo({canReject: true}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const rejectOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.REJECT);
            expect(rejectOption).toBeDefined();
        });

        it('should show delete option when shouldShowDeleteOption returns true', () => {
            mockShouldShowDeleteOption = true;
            mockSelectedTransactions = {
                trans1: createTransactionInfo(),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const deleteOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.DELETE);
            expect(deleteOption).toBeDefined();
        });
    });
});
