import {act, render} from '@testing-library/react-native';

import PayActionCell from '@components/Search/SearchList/ListItem/ActionCell/PayActionCell';
import type {PaymentActionParams} from '@components/SettlementButton/types';

import useOnyx from '@hooks/useOnyx';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';

import type * as SearchActions from '@libs/actions/Search';
import {isInvoiceReport} from '@libs/ReportUtils';

import {payInvoice, payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

import type {UseOnyxResult} from 'react-native-onyx';

import React from 'react';

const TEST_INVOICE_REPORT_ID = '1001';
const TEST_CHAT_REPORT_ID = '2002';
const TEST_HASH = 12345;

const invoiceReport = {
    reportID: TEST_INVOICE_REPORT_ID,
    chatReportID: TEST_CHAT_REPORT_ID,
    type: CONST.REPORT.TYPE.INVOICE,
    currency: CONST.CURRENCY.USD,
    policyID: 'policy1',
    total: -5000,
} as Report;

const chatReport = {
    reportID: TEST_CHAT_REPORT_ID,
    type: CONST.REPORT.TYPE.CHAT,
} as Report;

function createOnyxResult<T>(value: NonNullable<T> | undefined): UseOnyxResult<T> {
    return [value, {status: 'loaded'}];
}

// Capture the onPress (confirmPayment) handler PayActionCell passes to the settlement button so the payment can be
// confirmed directly, mirroring a user picking "Pay as an individual > Mark as paid".
const mockOnPressHolder: {current?: (params: PaymentActionParams) => void} = {current: undefined};
jest.mock('@components/SettlementButton', () => ({
    __esModule: true,
    default: (props: {onPress?: (params: PaymentActionParams) => void}) => {
        mockOnPressHolder.current = props.onPress;
        return null;
    },
}));

jest.mock('@userActions/IOU/PayMoneyRequest', () => ({
    __esModule: true,
    payInvoice: jest.fn(),
    payMoneyRequest: jest.fn(),
}));

jest.mock('@userActions/IOU/ReportWorkflow', () => ({
    __esModule: true,
    canIOUBePaid: jest.fn(() => true),
}));

const mockLogInfo = jest.fn();
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        info: (...args: unknown[]) => {
            mockLogInfo(...args);
        },
        warn: jest.fn(),
    },
}));

jest.mock('@libs/actions/Search', () => ({
    __esModule: true,
    getSearchPayOnyxData: jest.fn(() => ({optimisticData: [], successData: [], failureData: []})),
    getChatReportWithFallback: jest.requireActual<typeof SearchActions>('@libs/actions/Search').getChatReportWithFallback,
}));

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        __esModule: true,
        isInvoiceReport: jest.fn(() => true),
        isIndividualInvoiceRoom: jest.fn(() => false),
        getReimbursableTotal: jest.fn(() => 5000),
    };
});

jest.mock('@hooks/useReportWithTransactionsAndViolations', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: jest.fn(() => ({isOffline: false}))}));
jest.mock('@hooks/usePolicy', () => ({__esModule: true, default: jest.fn(() => undefined)}));
jest.mock('@hooks/useCurrencyList', () => ({__esModule: true, useCurrencyListActions: jest.fn(() => ({convertToDisplayString: () => '$50.00'}))}));
jest.mock('@hooks/useParticipantsInvoiceReport', () => ({__esModule: true, getParticipantsInvoiceReport: jest.fn(() => undefined)}));
jest.mock('@hooks/usePaymentContext', () => ({
    __esModule: true,
    useReportPaymentContext: jest.fn(() => ({
        currentUserLogin: 'payer@test.com',
        currentUserAccountID: 1,
        email: 'payer@test.com',
        localCurrencyCode: 'USD',
        introSelected: undefined,
        betas: [],
        isSelfTourViewed: false,
        userBillingGracePeriodEnds: undefined,
        amountOwed: undefined,
        ownerBillingGracePeriodEnd: undefined,
        activePolicyID: undefined,
        activePolicy: undefined,
        defaultWorkspaceName: '',
        nextStep: undefined,
        chatReportPolicy: undefined,
    })),
}));
jest.mock('@hooks/useOnyx', () => jest.fn());

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    __esModule: true,
    useDelegateNoAccessState: jest.fn(() => ({isDelegateAccessRestricted: false})),
    useDelegateNoAccessActions: jest.fn(() => ({showDelegateNoAccessModal: jest.fn()})),
}));

const mockedUseOnyx = jest.mocked(useOnyx);
const mockedUseReportWithTransactionsAndViolations = jest.mocked(useReportWithTransactionsAndViolations);
const mockedPayInvoice = jest.mocked(payInvoice);
const mockedPayMoneyRequest = jest.mocked(payMoneyRequest);
const mockedIsInvoiceReport = jest.mocked(isInvoiceReport);

const TEST_EXPENSE_REPORT_ID = '3003';

const expenseReport = {
    reportID: TEST_EXPENSE_REPORT_ID,
    chatReportID: TEST_CHAT_REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    currency: CONST.CURRENCY.USD,
    policyID: 'policy1',
    total: -5000,
} as Report;

describe('PayActionCell', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockOnPressHolder.current = undefined;
        mockedUseReportWithTransactionsAndViolations.mockReturnValue([invoiceReport, [], undefined]);
        mockedUseOnyx.mockImplementation(() => createOnyxResult(undefined));
    });

    it('calls payInvoice with the chatReport supplied as a prop (the flat `type:invoice columns:...` transaction row now resolves and passes it)', () => {
        render(
            <PayActionCell
                isLoading={false}
                policyID="policy1"
                reportID={TEST_INVOICE_REPORT_ID}
                hash={TEST_HASH}
                amount={5000}
                chatReport={chatReport}
            />,
        );

        act(() => {
            mockOnPressHolder.current?.({
                paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                payAsBusiness: false,
            });
        });

        expect(mockedPayInvoice).toHaveBeenCalledWith(
            expect.objectContaining({
                paymentMethodType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                chatReport,
                invoiceReport,
            }),
        );
    });

    it('does not call payInvoice when no chatReport prop is supplied', () => {
        render(
            <PayActionCell
                isLoading={false}
                policyID="policy1"
                reportID={TEST_INVOICE_REPORT_ID}
                hash={TEST_HASH}
                amount={5000}
                chatReport={undefined}
            />,
        );

        act(() => {
            mockOnPressHolder.current?.({
                paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                payAsBusiness: false,
            });
        });

        expect(mockedPayInvoice).not.toHaveBeenCalled();
        expect(mockLogInfo).toHaveBeenCalledWith('[SearchPay] Dropping invoice row pay: chat report is not loaded', false, {reportID: TEST_INVOICE_REPORT_ID});
    });

    it('pays a money request with a fallback chat report when no chatReport prop is supplied', () => {
        mockedIsInvoiceReport.mockReturnValue(false);
        mockedUseReportWithTransactionsAndViolations.mockReturnValue([expenseReport, [], undefined]);

        render(
            <PayActionCell
                isLoading={false}
                policyID="policy1"
                reportID={TEST_EXPENSE_REPORT_ID}
                hash={TEST_HASH}
                amount={5000}
                chatReport={undefined}
            />,
        );

        act(() => {
            mockOnPressHolder.current?.({
                paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                payAsBusiness: false,
            });
        });

        expect(mockedPayMoneyRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                chatReport: {reportID: TEST_CHAT_REPORT_ID, policyID: 'policy1'},
                isFallbackChatReport: true,
            }),
        );
    });

    it('pays a money request with the loaded chat report when it is supplied', () => {
        mockedIsInvoiceReport.mockReturnValue(false);
        mockedUseReportWithTransactionsAndViolations.mockReturnValue([expenseReport, [], undefined]);

        render(
            <PayActionCell
                isLoading={false}
                policyID="policy1"
                reportID={TEST_EXPENSE_REPORT_ID}
                hash={TEST_HASH}
                amount={5000}
                chatReport={chatReport}
            />,
        );

        act(() => {
            mockOnPressHolder.current?.({
                paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                payAsBusiness: false,
            });
        });

        expect(mockedPayMoneyRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                chatReport,
                isFallbackChatReport: false,
            }),
        );
    });

    it('does not pay a money request and logs the reason when the chat is not loaded and no chatReportID is available', () => {
        mockedIsInvoiceReport.mockReturnValue(false);
        mockedUseReportWithTransactionsAndViolations.mockReturnValue([{...expenseReport, chatReportID: undefined, parentReportID: undefined}, [], undefined]);

        render(
            <PayActionCell
                isLoading={false}
                policyID="policy1"
                reportID={TEST_EXPENSE_REPORT_ID}
                hash={TEST_HASH}
                amount={5000}
                chatReport={undefined}
            />,
        );

        act(() => {
            mockOnPressHolder.current?.({
                paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                payAsBusiness: false,
            });
        });

        expect(mockedPayMoneyRequest).not.toHaveBeenCalled();
        expect(mockLogInfo).toHaveBeenCalledWith('[SearchPay] Dropping row pay: chat report is not loaded and no chatReportID is available', false, {reportID: TEST_EXPENSE_REPORT_ID});
    });
});
