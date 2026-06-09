import {act, render} from '@testing-library/react-native';
import React from 'react';
import type {UseOnyxResult} from 'react-native-onyx';
import PayActionButton from '@components/ReportActionItem/MoneyRequestReportPreview/PayActionButton';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import useOnyx from '@hooks/useOnyx';
import {hasHeldExpensesFromTransactions} from '@libs/ReportUtils';
import {payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

const TEST_IOU_REPORT_ID = '1001';
const TEST_CHAT_REPORT_ID = '2002';
const SELECTED_BANK_ACCOUNT_ID = 9999;

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

function createOnyxResult<T>(value: NonNullable<T> | undefined): UseOnyxResult<T> {
    return [value, {status: 'loaded'}];
}

// Capture the onPress (confirmPayment) handler PayActionButton passes to the settlement button so the payment can be
// confirmed with a specific selected bank account, mirroring a user picking an account in the dropdown.
const mockOnPressHolder: {current?: (params: PaymentActionParams) => void} = {current: undefined};
jest.mock('@components/SettlementButton/AnimatedSettlementButton', () => ({
    __esModule: true,
    default: (props: {onPress?: (params: PaymentActionParams) => void}) => {
        mockOnPressHolder.current = props.onPress;
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
    canIOUBePaid: jest.fn(() => true),
    approveMoneyRequest: jest.fn(),
}));

jest.mock('@libs/ReportUtils', () => ({
    __esModule: true,
    hasHeldExpensesFromTransactions: jest.fn(() => false),
    hasUpdatedTotal: jest.fn(() => true),
    hasViolations: jest.fn(() => false),
    isInvoiceReport: jest.fn(() => false),
}));

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
jest.mock('@hooks/usePermissions', () => ({__esModule: true, default: jest.fn(() => ({isBetaEnabled: () => false}))}));
jest.mock('@hooks/useLastWorkspaceNumber', () => ({__esModule: true, default: jest.fn(() => 0)}));
jest.mock('@hooks/useCurrencyList', () => ({__esModule: true, useCurrencyListActions: jest.fn(() => ({convertToDisplayString: () => '$100.00'}))}));
jest.mock('@hooks/useParticipantsInvoiceReport', () => ({__esModule: true, default: jest.fn(() => undefined)}));
jest.mock('@hooks/usePolicy', () => ({__esModule: true, default: jest.fn(() => undefined)}));
jest.mock('@hooks/useReportTransactionsCollection', () => ({__esModule: true, default: jest.fn(() => ({}))}));
jest.mock('@hooks/useOnyx', () => jest.fn());

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    __esModule: true,
    useDelegateNoAccessState: jest.fn(() => ({isDelegateAccessRestricted: false})),
    useDelegateNoAccessActions: jest.fn(() => ({showDelegateNoAccessModal: jest.fn()})),
}));

const mockedUseOnyx = jest.mocked(useOnyx);
const mockedPayMoneyRequest = jest.mocked(payMoneyRequest);
const mockedHasHeldExpenses = jest.mocked(hasHeldExpensesFromTransactions);

function renderPayActionButton(onHoldMenuOpen: jest.Mock) {
    return render(
        <PayActionButton
            iouReportID={TEST_IOU_REPORT_ID}
            chatReportID={TEST_CHAT_REPORT_ID}
            isPaidAnimationRunning={false}
            isApprovedAnimationRunning={false}
            stopAnimation={jest.fn()}
            startAnimation={jest.fn()}
            startApprovedAnimation={jest.fn()}
            onHoldMenuOpen={onHoldMenuOpen}
            buttonMaxWidth={{}}
            reportPreviewAction={CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY}
        />,
    );
}

describe('PayActionButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockOnPressHolder.current = undefined;
        mockedHasHeldExpenses.mockReturnValue(false);
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

    it('forwards the selected bank account to payMoneyRequest when paying with a business bank account', () => {
        renderPayActionButton(jest.fn());

        act(() => {
            mockOnPressHolder.current?.({
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                payAsBusiness: true,
                methodID: SELECTED_BANK_ACCOUNT_ID,
                paymentMethod: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            });
        });

        expect(mockedPayMoneyRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                methodID: SELECTED_BANK_ACCOUNT_ID,
            }),
        );
    });

    it('does not send a bank account for non-VBBA payment types', () => {
        renderPayActionButton(jest.fn());

        act(() => {
            mockOnPressHolder.current?.({
                paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                methodID: SELECTED_BANK_ACCOUNT_ID,
            });
        });

        expect(mockedPayMoneyRequest).toHaveBeenCalledWith(expect.objectContaining({methodID: undefined}));
    });

    it('forwards the selected bank account to the hold menu when the report has held expenses', () => {
        mockedHasHeldExpenses.mockReturnValue(true);
        const onHoldMenuOpen = jest.fn();
        renderPayActionButton(onHoldMenuOpen);

        act(() => {
            mockOnPressHolder.current?.({
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                payAsBusiness: true,
                methodID: SELECTED_BANK_ACCOUNT_ID,
                paymentMethod: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            });
        });

        expect(onHoldMenuOpen).toHaveBeenCalledWith(CONST.IOU.REPORT_ACTION_TYPE.PAY, CONST.IOU.PAYMENT_TYPE.VBBA, expect.anything(), SELECTED_BANK_ACCOUNT_ID);
        expect(mockedPayMoneyRequest).not.toHaveBeenCalled();
    });
});
