/* eslint-disable @typescript-eslint/naming-convention */
import {act, renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useSelectionModeReportActions from '@hooks/useSelectionModeReportActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import createRandomPolicy from '../../utils/collections/policies';
import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const TEST_ACCOUNT_ID = 12345;
const TEST_EMAIL = 'test@expensify.com';
const TEST_REPORT_ID = '1';
const TEST_CHAT_REPORT_ID = '2';
const TEST_POLICY_ID = '3';

const mockClearSelectedTransactions = jest.fn();

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        translate: jest.fn((key: string, ...args: string[]) => {
            if (key === 'common.submit') {
                return 'Submit';
            }
            if (key === 'iou.approve') {
                return 'Approve';
            }
            if (key === 'iou.settlePayment') {
                return `Pay ${args.at(0) ?? ''}`.trim();
            }
            return key;
        }),
        localeCompare: jest.fn((a: string, b: string) => a.localeCompare(b)),
    })),
}));

jest.mock('@components/Search/SearchScopeProvider', () => ({
    __esModule: true,
    useIsOnSearch: jest.fn(() => false),
    SearchScopeProvider: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({accountID: TEST_ACCOUNT_ID, login: TEST_EMAIL, email: TEST_EMAIL})),
}));

jest.mock('@hooks/useEnvironment', () => ({
    __esModule: true,
    default: jest.fn(() => ({environment: 'dev'})),
}));

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        isBetaEnabled: (beta: string) => beta === 'bulkSubmitApprovePay',
    })),
}));

jest.mock('@hooks/useStrictPolicyRules', () => ({
    __esModule: true,
    default: jest.fn(() => ({areStrictPolicyRulesEnabled: false})),
}));

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: jest.fn(() => ({showConfirmModal: jest.fn()})),
}));

jest.mock('@hooks/useConfirmPendingRTERAndProceed', () => ({
    __esModule: true,
    default: jest.fn(() => (onProceed: () => void) => onProceed()),
}));

jest.mock('@hooks/useReportIsArchived', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

jest.mock('@hooks/useSearchShouldCalculateTotals', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

jest.mock('@hooks/useActiveAdminPolicies', () => ({
    __esModule: true,
    default: jest.fn(() => []),
}));

jest.mock('@hooks/useParticipantsInvoiceReport', () => ({
    __esModule: true,
    default: jest.fn(() => undefined),
}));

jest.mock('@hooks/usePolicy', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}));

jest.mock('@hooks/usePaymentOptions', () => ({
    __esModule: true,
    default: jest.fn(() => []),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    __esModule: true,
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        Send: 'Send',
        ThumbsUp: 'ThumbsUp',
        Cash: 'Cash',
        ArrowRight: 'ArrowRight',
        Building: 'Building',
    })),
}));

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    __esModule: true,
    useDelegateNoAccessState: jest.fn(() => ({isDelegateAccessRestricted: false})),
    useDelegateNoAccessActions: jest.fn(() => ({showDelegateNoAccessModal: jest.fn()})),
}));

jest.mock('@components/LockedAccountModalProvider', () => ({
    __esModule: true,
    useLockedAccountState: jest.fn(() => ({isAccountLocked: false})),
    useLockedAccountActions: jest.fn(() => ({showLockedAccountModal: jest.fn()})),
}));

jest.mock('@components/KYCWall/KYCWallContext', () => ({
    __esModule: true,
    KYCWallContext: {
        _currentValue: {current: null},
        Provider: ({children}: {children: React.ReactNode}) => children,
        Consumer: ({children}: {children: (value: unknown) => React.ReactNode}) => children({current: null}),
    },
}));

jest.mock('@components/Search/SearchContext', () => ({
    __esModule: true,
    useSearchStateContext: jest.fn(() => ({
        currentSearchQueryJSON: null,
        currentSearchKey: '',
        currentSearchResults: null,
        selectedTransactionIDs: [],
    })),
    useSearchActionsContext: jest.fn(() => ({
        clearSelectedTransactions: mockClearSelectedTransactions,
        setSelectedTransactions: jest.fn(),
    })),
}));

let mockPrimaryAction = '';
jest.mock('@libs/ReportPrimaryActionUtils', () => ({
    __esModule: true,
    getReportPrimaryAction: jest.fn(() => mockPrimaryAction),
}));

let mockSecondaryActions: string[] = [];
jest.mock('@libs/ReportSecondaryActionUtils', () => ({
    __esModule: true,
    getSecondaryReportActions: jest.fn(() => mockSecondaryActions),
}));

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        hasHeldExpenses: jest.fn(() => false),
        hasOnlyHeldExpenses: jest.fn(() => false),
        hasUpdatedTotal: jest.fn(() => true),
        hasViolations: jest.fn(() => false),
        getNextApproverAccountID: jest.fn(() => 0),
        isReportOwner: jest.fn(() => false),
        isAllowedToApproveExpenseReport: jest.fn(() => true),
        shouldBlockSubmitDueToStrictPolicyRules: jest.fn(() => false),
        getNonHeldAndFullAmount: jest.fn(() => ({nonHeldAmount: '$100.00', fullAmount: '$100.00', hasValidNonHeldAmount: true})),
        isInvoiceReport: jest.fn(() => false),
    };
});

jest.mock('@libs/actions/IOU/ReportWorkflow', () => ({
    __esModule: true,
    submitReport: jest.fn(),
    approveMoneyRequest: jest.fn(),
    canApproveIOU: jest.fn(() => false),
    canIOUBePaid: jest.fn(() => false),
}));

jest.mock('@libs/actions/IOU/PayMoneyRequest', () => ({
    __esModule: true,
    payMoneyRequest: jest.fn(),
    payInvoice: jest.fn(),
    completePaymentOnboarding: jest.fn(),
    savePreferredPaymentMethod: jest.fn(),
}));

jest.mock('@libs/actions/Link', () => ({
    __esModule: true,
    openOldDotLink: jest.fn(),
}));

jest.mock('@libs/actions/Search', () => ({
    __esModule: true,
    search: jest.fn(),
}));

jest.mock('@libs/PolicyUtils', () => ({
    __esModule: true,
    hasDynamicExternalWorkflow: jest.fn(() => false),
    sortPoliciesByName: jest.fn(() => []),
}));

jest.mock('@libs/ReportActionsUtils', () => ({
    __esModule: true,
    hasRequestFromCurrentAccount: jest.fn(() => false),
}));

jest.mock('@libs/MoneyRequestReportUtils', () => ({
    __esModule: true,
    getTotalAmountForIOUReportPreviewButton: jest.fn(() => '$100.00'),
}));

jest.mock('@libs/PaymentUtils', () => ({
    __esModule: true,
    handleUnvalidatedAccount: jest.fn(),
    selectPaymentType: jest.fn(),
}));

jest.mock('@libs/TransactionUtils', () => ({
    __esModule: true,
    hasAnyPendingRTERViolation: jest.fn(() => false),
    isExpensifyCardTransaction: jest.fn(() => false),
    isPending: jest.fn(() => false),
    getReimbursable: jest.fn(() => true),
}));

jest.mock('@userActions/Transaction', () => ({
    __esModule: true,
    markPendingRTERTransactionsAsCash: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ReportUtils = require('@libs/ReportUtils') as Record<string, jest.Mock>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const DelegateProvider = require('@components/DelegateNoAccessModalProvider') as Record<string, jest.Mock>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const LockedProvider = require('@components/LockedAccountModalProvider') as Record<string, jest.Mock>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const IOUActions = require('@libs/actions/IOU/ReportWorkflow') as Record<string, jest.Mock>;
const PayMoneyRequestActions = require('@libs/actions/IOU/PayMoneyRequest') as Record<string, jest.Mock>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const usePaymentOptionsMock = require('@hooks/usePaymentOptions') as {default: jest.Mock};

function resetMocksToDefaults() {
    ReportUtils.hasHeldExpenses.mockReturnValue(false);
    ReportUtils.hasOnlyHeldExpenses.mockReturnValue(false);
    ReportUtils.isReportOwner.mockReturnValue(false);
    ReportUtils.getNextApproverAccountID.mockReturnValue(0);
    ReportUtils.isInvoiceReport.mockReturnValue(false);
    ReportUtils.hasUpdatedTotal.mockReturnValue(true);
    ReportUtils.isAllowedToApproveExpenseReport.mockReturnValue(true);

    DelegateProvider.useDelegateNoAccessState.mockReturnValue({isDelegateAccessRestricted: false});
    DelegateProvider.useDelegateNoAccessActions.mockReturnValue({showDelegateNoAccessModal: jest.fn()});

    LockedProvider.useLockedAccountState.mockReturnValue({isAccountLocked: false});
    LockedProvider.useLockedAccountActions.mockReturnValue({showLockedAccountModal: jest.fn()});
}

function buildReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: TEST_REPORT_ID,
        chatReportID: TEST_CHAT_REPORT_ID,
        policyID: TEST_POLICY_ID,
        ownerAccountID: TEST_ACCOUNT_ID,
        currency: 'USD',
        type: CONST.REPORT.TYPE.EXPENSE,
        ...overrides,
    } as Report;
}

function buildChatReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: TEST_CHAT_REPORT_ID,
        type: CONST.REPORT.TYPE.CHAT,
        ...overrides,
    } as Report;
}

function buildPolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        ...createRandomPolicy(Number(TEST_POLICY_ID)),
        id: TEST_POLICY_ID,
        preventSelfApproval: false,
        pendingAction: undefined,
        ...overrides,
    };
}

function buildTransaction(id: number, overrides: Partial<Transaction> = {}): Transaction {
    return {
        ...createRandomTransaction(id),
        transactionID: id.toString(),
        reportID: TEST_REPORT_ID,
        ...overrides,
    };
}

function renderSelectionModeHook(overrides: Partial<Parameters<typeof useSelectionModeReportActions>[0]> = {}) {
    const defaultParams = {
        report: buildReport(),
        chatReport: buildChatReport(),
        policy: buildPolicy(),
        reportActions: [],
        reportNameValuePairs: undefined,
        reportMetadata: undefined,
        transactions: [buildTransaction(1), buildTransaction(2)],
        selectedTransactionIDs: ['1', '2'],
    };
    return renderHook(() => useSelectionModeReportActions({...defaultParams, ...overrides}));
}

describe('useSelectionModeReportActions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
        resetMocksToDefaults();
        mockPrimaryAction = '';
        mockSecondaryActions = [];
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true});
        await Onyx.merge(ONYXKEYS.SESSION, {email: TEST_EMAIL, accountID: TEST_ACCOUNT_ID});
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('allExpensesSelected', () => {
        it('returns true when all transactions are selected', () => {
            const transactions = [buildTransaction(1), buildTransaction(2)];
            const {result} = renderSelectionModeHook({
                transactions,
                selectedTransactionIDs: ['1', '2'],
            });

            expect(result.current.allExpensesSelected).toBe(true);
        });

        it('returns false when only some transactions are selected', () => {
            const transactions = [buildTransaction(1), buildTransaction(2), buildTransaction(3)];
            const {result} = renderSelectionModeHook({
                transactions,
                selectedTransactionIDs: ['1', '2'],
            });

            expect(result.current.allExpensesSelected).toBe(false);
        });

        it('returns false when no transactions are selected', () => {
            const {result} = renderSelectionModeHook({
                selectedTransactionIDs: [],
            });

            expect(result.current.allExpensesSelected).toBe(false);
        });
    });

    describe('selectionModeReportLevelActions', () => {
        it('includes Submit when primaryAction is SUBMIT', () => {
            mockPrimaryAction = CONST.REPORT.PRIMARY_ACTIONS.SUBMIT;

            const {result} = renderSelectionModeHook();

            const submitAction = result.current.selectionModeReportLevelActions.find((a) => a.value === CONST.REPORT.PRIMARY_ACTIONS.SUBMIT);
            expect(submitAction).toBeDefined();
            expect(submitAction?.text).toBe('Submit');
        });

        it('includes Submit when secondaryActions includes SUBMIT', () => {
            mockSecondaryActions = [CONST.REPORT.SECONDARY_ACTIONS.SUBMIT];

            const {result} = renderSelectionModeHook();

            const submitAction = result.current.selectionModeReportLevelActions.find((a) => a.value === CONST.REPORT.PRIMARY_ACTIONS.SUBMIT);
            expect(submitAction).toBeDefined();
        });

        it('includes Approve when primaryAction is APPROVE', () => {
            mockPrimaryAction = CONST.REPORT.PRIMARY_ACTIONS.APPROVE;

            const {result} = renderSelectionModeHook();

            const approveAction = result.current.selectionModeReportLevelActions.find((a) => a.value === CONST.REPORT.PRIMARY_ACTIONS.APPROVE);
            expect(approveAction).toBeDefined();
            expect(approveAction?.text).toBe('Approve');
        });

        it('includes Pay when primaryAction is PAY', () => {
            mockPrimaryAction = CONST.REPORT.PRIMARY_ACTIONS.PAY;

            const {result} = renderSelectionModeHook();

            const payAction = result.current.selectionModeReportLevelActions.find((a) => a.value === CONST.REPORT.PRIMARY_ACTIONS.PAY);
            expect(payAction).toBeDefined();
        });

        it('returns empty array when no Submit/Approve/Pay actions exist', () => {
            mockPrimaryAction = CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH;

            const {result} = renderSelectionModeHook();

            expect(result.current.selectionModeReportLevelActions).toHaveLength(0);
        });

        it('can include multiple actions simultaneously', () => {
            mockPrimaryAction = CONST.REPORT.PRIMARY_ACTIONS.SUBMIT;
            mockSecondaryActions = [CONST.REPORT.SECONDARY_ACTIONS.APPROVE, CONST.REPORT.SECONDARY_ACTIONS.PAY];

            const {result} = renderSelectionModeHook();

            expect(result.current.selectionModeReportLevelActions.length).toBeGreaterThanOrEqual(2);
            expect(result.current.selectionModeReportLevelActions.find((a) => a.value === CONST.REPORT.PRIMARY_ACTIONS.SUBMIT)).toBeDefined();
            expect(result.current.selectionModeReportLevelActions.find((a) => a.value === CONST.REPORT.PRIMARY_ACTIONS.APPROVE)).toBeDefined();
        });
    });

    describe('hasPayInSelectionMode', () => {
        it('returns true when all expenses selected and pay action exists', () => {
            mockPrimaryAction = CONST.REPORT.PRIMARY_ACTIONS.PAY;
            usePaymentOptionsMock.default.mockReturnValue([{value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, text: 'Pay elsewhere'}]);
            const transactions = [buildTransaction(1), buildTransaction(2)];

            const {result} = renderSelectionModeHook({
                transactions,
                selectedTransactionIDs: ['1', '2'],
            });

            expect(result.current.hasPayInSelectionMode).toBe(true);
            usePaymentOptionsMock.default.mockReturnValue([]);
        });

        it('returns false when not all expenses are selected', () => {
            mockPrimaryAction = CONST.REPORT.PRIMARY_ACTIONS.PAY;
            const transactions = [buildTransaction(1), buildTransaction(2), buildTransaction(3)];

            const {result} = renderSelectionModeHook({
                transactions,
                selectedTransactionIDs: ['1', '2'],
            });

            expect(result.current.hasPayInSelectionMode).toBe(false);
        });

        it('returns false when no pay action exists', () => {
            mockPrimaryAction = CONST.REPORT.PRIMARY_ACTIONS.SUBMIT;
            const transactions = [buildTransaction(1)];

            const {result} = renderSelectionModeHook({
                transactions,
                selectedTransactionIDs: ['1'],
            });

            expect(result.current.hasPayInSelectionMode).toBe(false);
        });
    });

    describe('hold menu state', () => {
        it('initializes hold menu as not visible', () => {
            const {result} = renderSelectionModeHook();

            expect(result.current.isHoldMenuVisible).toBe(false);
        });

        it('returns hold menu amounts from getNonHeldAndFullAmount', () => {
            const {result} = renderSelectionModeHook();

            expect(result.current.nonHeldAmount).toBe('$100.00');
            expect(result.current.fullAmount).toBe('$100.00');
            expect(result.current.hasValidNonHeldAmount).toBe(true);
        });
    });

    describe('action flags', () => {
        it('correctly identifies hasSubmitAction from primaryAction', () => {
            mockPrimaryAction = CONST.REPORT.PRIMARY_ACTIONS.SUBMIT;

            const {result} = renderSelectionModeHook();

            expect(result.current.hasSubmitAction).toBe(true);
            expect(result.current.hasApproveAction).toBe(false);
            expect(result.current.hasPayAction).toBe(false);
        });

        it('correctly identifies hasApproveAction from secondaryActions', () => {
            mockSecondaryActions = [CONST.REPORT.SECONDARY_ACTIONS.APPROVE];

            const {result} = renderSelectionModeHook();

            expect(result.current.hasSubmitAction).toBe(false);
            expect(result.current.hasApproveAction).toBe(true);
            expect(result.current.hasPayAction).toBe(false);
        });

        it('correctly identifies hasPayAction from primaryAction', () => {
            mockPrimaryAction = CONST.REPORT.PRIMARY_ACTIONS.PAY;

            const {result} = renderSelectionModeHook();

            expect(result.current.hasPayAction).toBe(true);
        });
    });

    describe('Submit action callback', () => {
        it('calls submitReport and clears selections when submitted', async () => {
            mockPrimaryAction = CONST.REPORT.PRIMARY_ACTIONS.SUBMIT;

            const {result} = renderSelectionModeHook();

            const submitAction = result.current.selectionModeReportLevelActions.find((a) => a.value === CONST.REPORT.PRIMARY_ACTIONS.SUBMIT);
            submitAction?.onSelected?.();

            await waitFor(() => {
                expect(IOUActions.submitReport).toHaveBeenCalled();
                expect(mockClearSelectedTransactions).toHaveBeenCalledWith(true);
            });
        });
    });

    describe('Approve action callback', () => {
        it('calls approveMoneyRequest and clears selections when approved', async () => {
            mockPrimaryAction = CONST.REPORT.PRIMARY_ACTIONS.APPROVE;

            const {result} = renderSelectionModeHook();

            const approveAction = result.current.selectionModeReportLevelActions.find((a) => a.value === CONST.REPORT.PRIMARY_ACTIONS.APPROVE);
            approveAction?.onSelected?.();

            await waitFor(() => {
                expect(IOUActions.approveMoneyRequest).toHaveBeenCalled();
                expect(mockClearSelectedTransactions).toHaveBeenCalledWith(true);
            });
        });
    });

    describe('primaryAction output', () => {
        it('returns the computed primaryAction', () => {
            mockPrimaryAction = CONST.REPORT.PRIMARY_ACTIONS.APPROVE;

            const {result} = renderSelectionModeHook();

            expect(result.current.primaryAction).toBe(CONST.REPORT.PRIMARY_ACTIONS.APPROVE);
        });
    });

    describe('shouldBlockAction guards', () => {
        it('returns true and shows delegate modal when delegate access is restricted', () => {
            const mockShowDelegateModal = jest.fn();
            DelegateProvider.useDelegateNoAccessState.mockReturnValue({isDelegateAccessRestricted: true});
            DelegateProvider.useDelegateNoAccessActions.mockReturnValue({showDelegateNoAccessModal: mockShowDelegateModal});

            const {result} = renderSelectionModeHook();
            const blocked = result.current.shouldBlockAction();

            expect(blocked).toBe(true);
            expect(mockShowDelegateModal).toHaveBeenCalled();
        });

        it('returns true and shows locked modal when account is locked', () => {
            const mockShowLockedModal = jest.fn();
            LockedProvider.useLockedAccountState.mockReturnValue({isAccountLocked: true});
            LockedProvider.useLockedAccountActions.mockReturnValue({showLockedAccountModal: mockShowLockedModal});

            const {result} = renderSelectionModeHook();
            const blocked = result.current.shouldBlockAction();

            expect(blocked).toBe(true);
            expect(mockShowLockedModal).toHaveBeenCalled();
        });

        it('returns false when no restrictions apply', () => {
            const {result} = renderSelectionModeHook();
            const blocked = result.current.shouldBlockAction();

            expect(blocked).toBe(false);
        });

        it('returns true for unvalidated user when payment type is not Elsewhere', async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false});
            await waitForBatchedUpdates();

            const {result} = renderSelectionModeHook();
            const blocked = result.current.shouldBlockAction(CONST.IOU.PAYMENT_TYPE.EXPENSIFY);

            expect(blocked).toBe(true);
        });

        it('returns false for unvalidated user when payment type is Elsewhere', async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false});
            await waitForBatchedUpdates();

            const {result} = renderSelectionModeHook();
            const blocked = result.current.shouldBlockAction(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);

            expect(blocked).toBe(false);
        });
    });

    describe('handleSubmitReport guards', () => {
        it('does not submit when shouldBlockSubmit is true (preventSelfApproval)', () => {
            mockPrimaryAction = CONST.REPORT.PRIMARY_ACTIONS.SUBMIT;
            ReportUtils.isReportOwner.mockReturnValue(true);
            ReportUtils.getNextApproverAccountID.mockReturnValue(TEST_ACCOUNT_ID);

            const {result} = renderSelectionModeHook({
                report: buildReport({ownerAccountID: TEST_ACCOUNT_ID, managerID: TEST_ACCOUNT_ID}),
                policy: buildPolicy({preventSelfApproval: true}),
            });

            expect(result.current.shouldBlockSubmit).toBe(true);
            const submitAction = result.current.selectionModeReportLevelActions.find((a) => a.value === CONST.REPORT.PRIMARY_ACTIONS.SUBMIT);
            expect(submitAction).toBeUndefined();
            expect(IOUActions.submitReport).not.toHaveBeenCalled();
        });
    });

    describe('confirmPayment branches', () => {
        it('does not proceed when chatReport is undefined', () => {
            const {result} = renderSelectionModeHook({chatReport: undefined});

            act(() => {
                result.current.confirmPayment({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
            });

            expect(PayMoneyRequestActions.payMoneyRequest).not.toHaveBeenCalled();
        });

        it('shows delegate modal when delegate restricted during payment', () => {
            const mockShowDelegateModal = jest.fn();
            DelegateProvider.useDelegateNoAccessState.mockReturnValue({isDelegateAccessRestricted: true});
            DelegateProvider.useDelegateNoAccessActions.mockReturnValue({showDelegateNoAccessModal: mockShowDelegateModal});

            const {result} = renderSelectionModeHook();
            act(() => {
                result.current.confirmPayment({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
            });

            expect(mockShowDelegateModal).toHaveBeenCalled();
        });

        it('opens hold menu when there are held expenses during payment', () => {
            ReportUtils.hasHeldExpenses.mockReturnValue(true);

            const {result} = renderSelectionModeHook();
            act(() => {
                result.current.confirmPayment({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
            });

            expect(result.current.isHoldMenuVisible).toBe(true);
            expect(result.current.requestType).toBe(CONST.IOU.REPORT_ACTION_TYPE.PAY);
            expect(result.current.paymentType).toBe(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
        });

        it('calls payMoneyRequest for normal (non-invoice, non-hold) payment', () => {
            const {result} = renderSelectionModeHook();
            act(() => {
                result.current.confirmPayment({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
            });

            expect(PayMoneyRequestActions.payMoneyRequest).toHaveBeenCalled();
            expect(mockClearSelectedTransactions).toHaveBeenCalledWith(true);
        });

        it('calls payInvoice for invoice reports', () => {
            ReportUtils.isInvoiceReport.mockReturnValue(true);

            const {result} = renderSelectionModeHook({
                report: buildReport({type: CONST.REPORT.TYPE.INVOICE}),
            });
            act(() => {
                result.current.confirmPayment({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
            });

            expect(PayMoneyRequestActions.payInvoice).toHaveBeenCalled();
            expect(mockClearSelectedTransactions).toHaveBeenCalledWith(true);
        });
    });

    describe('confirmApproval branches', () => {
        it('opens hold menu when there are held expenses during approval', () => {
            ReportUtils.hasHeldExpenses.mockReturnValue(true);

            const {result} = renderSelectionModeHook();
            act(() => {
                result.current.confirmApproval();
            });

            expect(result.current.isHoldMenuVisible).toBe(true);
            expect(result.current.requestType).toBe(CONST.IOU.REPORT_ACTION_TYPE.APPROVE);
        });

        it('calls approveMoneyRequest directly when no held expenses', () => {
            const {result} = renderSelectionModeHook();
            act(() => {
                result.current.confirmApproval();
            });

            expect(IOUActions.approveMoneyRequest).toHaveBeenCalled();
            expect(mockClearSelectedTransactions).toHaveBeenCalledWith(true);
        });
    });

    describe('handleHoldMenuClose', () => {
        it('resets hold menu state', () => {
            ReportUtils.hasHeldExpenses.mockReturnValue(true);

            const {result} = renderSelectionModeHook();

            act(() => {
                result.current.confirmPayment({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
            });
            expect(result.current.isHoldMenuVisible).toBe(true);

            act(() => {
                result.current.handleHoldMenuClose();
            });
            expect(result.current.isHoldMenuVisible).toBe(false);
        });
    });

    describe('handleHoldMenuConfirm', () => {
        it('clears selected transactions', () => {
            const {result} = renderSelectionModeHook();

            result.current.handleHoldMenuConfirm();

            expect(mockClearSelectedTransactions).toHaveBeenCalledWith(true);
        });
    });

    describe('selectionModeKYCSuccess', () => {
        it('calls confirmPayment with the given payment type', () => {
            const {result} = renderSelectionModeHook();
            act(() => {
                result.current.selectionModeKYCSuccess(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
            });

            expect(PayMoneyRequestActions.payMoneyRequest).toHaveBeenCalled();
        });
    });

    describe('shouldBlockSubmit', () => {
        it('returns false by default', () => {
            const {result} = renderSelectionModeHook();
            expect(result.current.shouldBlockSubmit).toBe(false);
        });
    });

    describe('isInvoiceReport', () => {
        it('returns false for expense reports', () => {
            const {result} = renderSelectionModeHook();
            expect(result.current.isInvoiceReport).toBe(false);
        });

        it('returns true for invoice reports', () => {
            ReportUtils.isInvoiceReport.mockReturnValue(true);

            const {result} = renderSelectionModeHook({
                report: buildReport({type: CONST.REPORT.TYPE.INVOICE}),
            });
            expect(result.current.isInvoiceReport).toBe(true);
        });
    });
});
