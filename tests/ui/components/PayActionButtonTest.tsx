import {act, render} from '@testing-library/react-native';

import PayActionButton from '@components/ReportActionItem/MoneyRequestReportPreview/PayActionButton';
import type {PaymentActionParams} from '@components/SettlementButton/types';

import useOnyx from '@hooks/useOnyx';

import {hasHeldExpensesFromTransactions, hasViolations} from '@libs/ReportUtils';

import {payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, UseOnyxResult} from 'react-native-onyx';

import React from 'react';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const TEST_IOU_REPORT_ID = '1001';
const TEST_CHAT_REPORT_ID = '2002';
const SELECTED_BANK_ACCOUNT_ID = 9999;

// Mutable so each test can back the mocked useReportPreviewTransactionViolations slice with a specific value.
let mockTransactionViolations: OnyxCollection<TransactionViolations> = {};

const iouReport = {
    reportID: TEST_IOU_REPORT_ID,
    chatReportID: TEST_CHAT_REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    currency: CONST.CURRENCY.USD,
    policyID: 'policy1',
    ownerAccountID: 2,
} as Report;

const chatReport = {
    reportID: TEST_CHAT_REPORT_ID,
    type: CONST.REPORT.TYPE.CHAT,
} as Report;

// PayActionButton reads from context instead of props; these mock-prefixed objects back the mocked context slice hooks.
const mockReportPreviewData = {iouReportID: TEST_IOU_REPORT_ID, chatReportID: TEST_CHAT_REPORT_ID, chatReport, transactions: []};
const mockReportPreviewAnimationState = {isPaidAnimationRunning: false, isApprovedAnimationRunning: false, isSubmittingAnimationRunning: false};
const mockReportPreviewActions = {
    stopAnimation: jest.fn(),
    startAnimation: jest.fn(),
    startApprovedAnimation: jest.fn(),
    onPaymentOptionsShow: jest.fn(),
    onPaymentOptionsHide: jest.fn(),
};
const mockReportPreviewUIState = {buttonMaxWidth: {}};
const mockReportPreviewActionState = {
    reportPreviewAction: CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY,
    canIOUBePaid: true,
    onlyShowPayElsewhere: false,
    shouldShowPayButton: true,
    connectedIntegration: undefined,
};

function createOnyxResult<T>(value: NonNullable<T> | undefined): UseOnyxResult<T> {
    return [value, {status: 'loaded'}];
}

// Capture the onPress (confirmPayment) handler PayActionButton passes to the settlement button so the payment can be
// confirmed with a specific selected bank account, mirroring a user picking an account in the dropdown.
const mockOnPressHolder: {current?: (params: PaymentActionParams) => void} = {current: undefined};
// Also capture confirmApproval so the approval path (the only consumer of hasViolations here) can be triggered.
const mockConfirmApprovalHolder: {current?: () => void} = {current: undefined};
jest.mock('@components/SettlementButton/AnimatedSettlementButton', () => ({
    __esModule: true,
    default: (props: {onPress?: (params: PaymentActionParams) => void; confirmApproval?: () => void}) => {
        mockOnPressHolder.current = props.onPress;
        mockConfirmApprovalHolder.current = props.confirmApproval;
        return null;
    },
}));

jest.mock('@userActions/IOU/PayMoneyRequest', () => ({
    __esModule: true,
    payMoneyRequest: jest.fn(),
    payInvoice: jest.fn(),
}));

jest.mock('@userActions/IOU/ReportWorkflow', () => ({
    __esModule: true,
    approveMoneyRequest: jest.fn(),
}));

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        __esModule: true,
        canIOUBePaid: jest.fn(() => true),
        hasHeldExpensesFromTransactions: jest.fn(() => false),
        hasUpdatedTotal: jest.fn(() => true),
        hasViolations: jest.fn(() => false),
        isInvoiceReport: jest.fn(() => false),
    };
});

jest.mock('@libs/MoneyRequestReportUtils', () => ({
    __esModule: true,
    getTotalAmountForIOUReportPreviewButton: jest.fn(() => '$100.00'),
}));

jest.mock('@libs/actions/Policy/Policy', () => ({
    __esModule: true,
    generateDefaultWorkspaceName: jest.fn(() => 'Workspace'),
}));

jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: jest.fn(() => ({isOffline: false}))}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: jest.fn(() => ({translate: (key: string) => key, localeCompare: (a: string, b: string) => a.localeCompare(b)}))}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({accountID: 1, email: 'payer@test.com', login: 'payer@test.com', localCurrencyCode: 'USD'})),
}));
jest.mock('@hooks/usePermissions', () => ({__esModule: true, default: jest.fn(() => ({isBetaEnabled: () => false, isBetaEnabledOrUnknown: () => false}))}));
jest.mock('@hooks/useLastWorkspaceNumber', () => ({__esModule: true, default: jest.fn(() => 0)}));
jest.mock('@hooks/useCurrencyList', () => ({__esModule: true, useCurrencyListActions: jest.fn(() => ({convertToDisplayString: () => '$100.00'}))}));
jest.mock('@hooks/useParticipantsInvoiceReport', () => ({__esModule: true, default: jest.fn(() => undefined)}));
jest.mock('@hooks/usePolicy', () => ({__esModule: true, default: jest.fn(() => undefined)}));
jest.mock('@hooks/useReportTransactionsCollection', () => ({__esModule: true, default: jest.fn(() => ({}))}));
jest.mock('@hooks/useOnyx', () => jest.fn());

const mockShowHoldMenu = jest.fn();
jest.mock('@hooks/useHoldMenuModal', () => ({__esModule: true, default: jest.fn(() => ({showHoldMenu: mockShowHoldMenu}))}));
// The hold menu waits one animation frame before opening; run the frame right away so it opens synchronously.
jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(0);
    return 0;
});

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    __esModule: true,
    useDelegateNoAccessState: jest.fn(() => ({isDelegateAccessRestricted: false})),
    useDelegateNoAccessActions: jest.fn(() => ({showDelegateNoAccessModal: jest.fn()})),
}));

jest.mock('@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContext', () => ({
    __esModule: true,
    useReportPreviewData: () => mockReportPreviewData,
    useReportPreviewTransactionViolations: () => ({transactionViolations: mockTransactionViolations}),
    useReportPreviewAnimationState: () => mockReportPreviewAnimationState,
    useReportPreviewActions: () => mockReportPreviewActions,
    useReportPreviewUIState: () => mockReportPreviewUIState,
    useReportPreviewActionState: () => mockReportPreviewActionState,
}));

const mockedUseOnyx = jest.mocked(useOnyx);
const mockedPayMoneyRequest = jest.mocked(payMoneyRequest);
const mockedHasHeldExpenses = jest.mocked(hasHeldExpensesFromTransactions);
const mockedHasViolations = jest.mocked(hasViolations);

function renderPayActionButton() {
    return render(<PayActionButton />);
}

describe('PayActionButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockOnPressHolder.current = undefined;
        mockConfirmApprovalHolder.current = undefined;
        mockTransactionViolations = {};
        mockedHasHeldExpenses.mockReturnValue(false);
        mockedHasViolations.mockReturnValue(false);
        mockedUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${TEST_IOU_REPORT_ID}`) {
                return createOnyxResult<Report>(iouReport);
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${TEST_CHAT_REPORT_ID}`) {
                return createOnyxResult<Report>(chatReport);
            }
            return createOnyxResult(undefined);
        });
    });

    it('forwards the selected bank account to payMoneyRequest when paying with a business bank account', async () => {
        renderPayActionButton();

        act(() => {
            mockOnPressHolder.current?.({
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                payAsBusiness: true,
                methodID: SELECTED_BANK_ACCOUNT_ID,
                paymentMethod: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            });
        });

        await waitForBatchedUpdates();

        expect(mockedPayMoneyRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                methodID: SELECTED_BANK_ACCOUNT_ID,
            }),
        );
    });

    it('does not send a bank account for non-VBBA payment types', async () => {
        renderPayActionButton();

        act(() => {
            mockOnPressHolder.current?.({
                paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                methodID: SELECTED_BANK_ACCOUNT_ID,
            });
        });

        await waitForBatchedUpdates();

        expect(mockedPayMoneyRequest).toHaveBeenCalledWith(expect.objectContaining({methodID: undefined}));
    });

    it('opens the global hold menu with the selected bank account when the report has held expenses', () => {
        // Given a report preview whose report has held expenses
        mockedHasHeldExpenses.mockReturnValue(true);
        renderPayActionButton();

        // When the user pays with a business bank account
        act(() => {
            mockOnPressHolder.current?.({
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                payAsBusiness: true,
                methodID: SELECTED_BANK_ACCOUNT_ID,
                paymentMethod: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            });
        });

        // Then the global hold menu opens for this report with the chosen account, and the payment waits for the user's choice
        expect(mockShowHoldMenu).toHaveBeenCalledWith(
            expect.objectContaining({
                reportID: TEST_IOU_REPORT_ID,
                chatReportID: TEST_CHAT_REPORT_ID,
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                methodID: SELECTED_BANK_ACCOUNT_ID,
                transactionCount: 0,
                onConfirm: mockReportPreviewActions.startAnimation,
            }),
        );
        expect(mockedPayMoneyRequest).not.toHaveBeenCalled();
    });

    it('does not open the hold menu when the report has no held expenses', () => {
        // Given a report preview without held expenses
        renderPayActionButton();

        // When the user pays
        act(() => {
            mockOnPressHolder.current?.({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
        });

        // Then the payment goes straight through without asking about held expenses
        expect(mockShowHoldMenu).not.toHaveBeenCalled();
        expect(mockedPayMoneyRequest).toHaveBeenCalled();
    });
});
