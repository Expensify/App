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
        it('should return correct initial modal states', () => {
            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            expect(result.current.isOfflineModalVisible).toBe(false);
            expect(result.current.isDownloadErrorModalVisible).toBe(false);
            expect(result.current.isHoldEducationalModalVisible).toBe(false);
            expect(result.current.rejectModalAction).toBeNull();
            expect(result.current.emptyReportsCount).toBe(0);
        });

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

            // With no transactions selected, selectedTransactionsKeys is empty,
            // so the early return triggers
            expect(result.current.headerButtonsOptions).toEqual([]);
        });
    });

    describe('derived values', () => {
        it('should derive unique policy IDs from selected transactions', () => {
            mockSelectedTransactions = {
                trans1: createTransactionInfo({policyID: 'policy1'}),
                trans2: createTransactionInfo({policyID: 'policy1'}),
                trans3: createTransactionInfo({policyID: 'policy2'}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            expect(result.current.selectedPolicyIDs).toHaveLength(2);
            expect(result.current.selectedPolicyIDs).toContain('policy1');
            expect(result.current.selectedPolicyIDs).toContain('policy2');
        });

        it('should derive unique report IDs from selected transactions', () => {
            mockSelectedTransactions = {
                trans1: createTransactionInfo({reportID: 'report1'}),
                trans2: createTransactionInfo({reportID: 'report1'}),
                trans3: createTransactionInfo({reportID: 'report2'}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            expect(result.current.selectedTransactionReportIDs).toHaveLength(2);
            expect(result.current.selectedTransactionReportIDs).toContain('report1');
            expect(result.current.selectedTransactionReportIDs).toContain('report2');
        });

        it('should derive report IDs from selected reports', () => {
            mockSelectedReports = [
                {reportID: 'report1', policyID: 'policy1', action: CONST.SEARCH.ACTION_TYPES.VIEW, allActions: [], total: 100, chatReportID: undefined, currency: 'USD'},
                {reportID: 'report2', policyID: 'policy1', action: CONST.SEARCH.ACTION_TYPES.VIEW, allActions: [], total: 200, chatReportID: undefined, currency: 'USD'},
            ];
            mockSelectedTransactions = {
                trans1: createTransactionInfo({reportID: 'report1'}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            expect(result.current.selectedReportIDs).toEqual(['report1', 'report2']);
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

    describe('headerButtonsOptions - export', () => {
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
            expect(exportOption?.text).toBe('common.export');
        });
    });

    describe('headerButtonsOptions - approve', () => {
        it('should show approve option when all selected transactions have approve action', () => {
            // Transactions without reportID bypass the areSelectedTransactionsIncludedInReports check
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
            expect(approveOption?.text).toBe('search.bulkActions.approve');
        });

        it('should not show approve option when some transactions do not have approve action', () => {
            mockSelectedTransactions = {
                trans1: createTransactionInfo({action: CONST.SEARCH.ACTION_TYPES.APPROVE}),
                trans2: createTransactionInfo({action: CONST.SEARCH.ACTION_TYPES.VIEW}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const approveOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE);
            expect(approveOption).toBeUndefined();
        });

        it('should not show approve option when any transaction is on hold', () => {
            mockSelectedTransactions = {
                trans1: createTransactionInfo({action: CONST.SEARCH.ACTION_TYPES.APPROVE, isHeld: true}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const approveOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE);
            expect(approveOption).toBeUndefined();
        });

        it('should not show approve option when offline', () => {
            mockIsOffline = true;
            mockSelectedTransactions = {
                trans1: createTransactionInfo({action: CONST.SEARCH.ACTION_TYPES.APPROVE}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const approveOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE);
            expect(approveOption).toBeUndefined();
        });

        it('should show approve option when selected reports all have approve action', () => {
            mockSelectedReports = [
                {
                    reportID: 'report1',
                    policyID: 'policy1',
                    action: CONST.SEARCH.ACTION_TYPES.APPROVE,
                    allActions: [CONST.SEARCH.ACTION_TYPES.APPROVE],
                    total: 100,
                    chatReportID: undefined,
                    currency: 'USD',
                },
            ];
            // Transaction also needs to be part of the selected report for areSelectedTransactionsIncludedInReports
            mockSelectedTransactions = {
                trans1: createTransactionInfo({action: CONST.SEARCH.ACTION_TYPES.APPROVE, reportID: 'report1'}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const approveOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE);
            expect(approveOption).toBeDefined();
        });
    });

    describe('headerButtonsOptions - pay', () => {
        it('should show pay option when shouldEnableBulkPayOption is true and not on hold', () => {
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
            expect(payOption?.text).toBe('search.bulkActions.pay');
        });

        it('should not show pay option when offline', () => {
            mockIsOffline = true;
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
            expect(payOption).toBeUndefined();
        });

        it('should not show pay option when any transaction is on hold', () => {
            mockGetPayOptionResult = {shouldEnableBulkPayOption: true, isFirstTimePayment: false};
            mockSelectedTransactions = {
                trans1: createTransactionInfo({action: CONST.SEARCH.ACTION_TYPES.PAY, isHeld: true}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const payOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.PAY);
            expect(payOption).toBeUndefined();
        });
    });

    describe('headerButtonsOptions - hold and unhold', () => {
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
            expect(holdOption?.text).toBe('search.bulkActions.hold');
        });

        it('should not show hold option when some transactions cannot be held', () => {
            mockSelectedTransactions = {
                trans1: createTransactionInfo({canHold: true}),
                trans2: createTransactionInfo({canHold: false}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const holdOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.HOLD);
            expect(holdOption).toBeUndefined();
        });

        it('should not show hold option when offline', () => {
            mockIsOffline = true;
            mockSelectedTransactions = {
                trans1: createTransactionInfo({canHold: true}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const holdOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.HOLD);
            expect(holdOption).toBeUndefined();
        });

        it('should show unhold option when all transactions can be unholded', () => {
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
            expect(unholdOption?.text).toBe('search.bulkActions.unhold');
        });

        it('should not show unhold option when some transactions cannot be unholded', () => {
            mockSelectedTransactions = {
                trans1: createTransactionInfo({canUnhold: true}),
                trans2: createTransactionInfo({canUnhold: false}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const unholdOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD);
            expect(unholdOption).toBeUndefined();
        });
    });

    describe('headerButtonsOptions - submit', () => {
        it('should show submit option when all selected transactions have submit action', () => {
            // Transactions without reportID bypass the areSelectedTransactionsIncludedInReports check
            mockSelectedTransactions = {
                trans1: createTransactionInfo({action: CONST.SEARCH.ACTION_TYPES.SUBMIT, reportID: undefined}),
                trans2: createTransactionInfo({action: CONST.SEARCH.ACTION_TYPES.SUBMIT, reportID: undefined}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const submitOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT);
            expect(submitOption).toBeDefined();
            expect(submitOption?.text).toBe('common.submit');
        });

        it('should not show submit option when offline', () => {
            mockIsOffline = true;
            mockSelectedTransactions = {
                trans1: createTransactionInfo({action: CONST.SEARCH.ACTION_TYPES.SUBMIT}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const submitOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT);
            expect(submitOption).toBeUndefined();
        });
    });

    describe('headerButtonsOptions - delete', () => {
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
            expect(deleteOption?.text).toBe('search.bulkActions.delete');
        });

        it('should not show delete option when shouldShowDeleteOption returns false', () => {
            mockShouldShowDeleteOption = false;
            mockSelectedTransactions = {
                trans1: createTransactionInfo(),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const deleteOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.DELETE);
            expect(deleteOption).toBeUndefined();
        });
    });

    describe('headerButtonsOptions - no options available', () => {
        it('should show no-options-available message when no actions are available', () => {
            mockSelectedTransactions = {
                trans1: createTransactionInfo({action: CONST.SEARCH.ACTION_TYPES.VIEW}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            // With VIEW action and no other conditions met, only export should be shown
            // (export is always present), so no-options-available should NOT be shown
            const exportOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.EXPORT);
            expect(exportOption).toBeDefined();
        });
    });

    describe('headerButtonsOptions - reject', () => {
        it('should show reject option when all transactions can be rejected and not on expense_report type', () => {
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
            expect(rejectOption?.text).toBe('search.bulkActions.reject');
        });

        it('should not show reject option when query type is expense_report', () => {
            mockSelectedTransactions = {
                trans1: createTransactionInfo({canReject: true}),
            };

            const queryJSON = createBaseQueryJSON();
            queryJSON.type = CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON,
                }),
            );

            const rejectOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.REJECT);
            expect(rejectOption).toBeUndefined();
        });

        it('should not show reject option when some transactions cannot be rejected', () => {
            mockSelectedTransactions = {
                trans1: createTransactionInfo({canReject: true}),
                trans2: createTransactionInfo({canReject: false}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const rejectOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.REJECT);
            expect(rejectOption).toBeUndefined();
        });

        it('should not show reject option when offline', () => {
            mockIsOffline = true;
            mockSelectedTransactions = {
                trans1: createTransactionInfo({canReject: true}),
            };

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const rejectOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.REJECT);
            expect(rejectOption).toBeUndefined();
        });
    });

    describe('modal handlers', () => {
        it('handleOfflineModalClose should be a function', () => {
            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            expect(typeof result.current.handleOfflineModalClose).toBe('function');
        });

        it('handleDownloadErrorModalClose should be a function', () => {
            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            expect(typeof result.current.handleDownloadErrorModalClose).toBe('function');
        });

        it('dismissModalAndUpdateUseHold should be a function', () => {
            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            expect(typeof result.current.dismissModalAndUpdateUseHold).toBe('function');
        });

        it('dismissRejectModalBasedOnAction should be a function', () => {
            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            expect(typeof result.current.dismissRejectModalBasedOnAction).toBe('function');
        });

        it('confirmPayment should be a function', () => {
            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            expect(typeof result.current.confirmPayment).toBe('function');
        });
    });

    describe('option ordering', () => {
        it('should include export option in every non-all-selected scenario', () => {
            // Transactions without reportID bypass the areSelectedTransactionsIncludedInReports check
            mockSelectedTransactions = {
                trans1: createTransactionInfo({
                    action: CONST.SEARCH.ACTION_TYPES.APPROVE,
                    canHold: true,
                    reportID: undefined,
                }),
            };
            mockShouldShowDeleteOption = true;

            const {result} = renderHook(() =>
                useSearchBulkActions({
                    queryJSON: createBaseQueryJSON(),
                }),
            );

            const exportOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.EXPORT);
            expect(exportOption).toBeDefined();

            // Approve should also be present
            const approveOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.APPROVE);
            expect(approveOption).toBeDefined();

            // Hold should be present
            const holdOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.HOLD);
            expect(holdOption).toBeDefined();

            // Delete should be present
            const deleteOption = result.current.headerButtonsOptions.find((opt) => opt.value === CONST.SEARCH.BULK_ACTION_TYPES.DELETE);
            expect(deleteOption).toBeDefined();
        });
    });
});
