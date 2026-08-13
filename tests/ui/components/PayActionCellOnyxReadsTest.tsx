import {act, render} from '@testing-library/react-native';

import PayActionCell from '@components/Search/SearchList/ListItem/ActionCell/PayActionCell';
import type {PaymentActionParams} from '@components/SettlementButton/types';

import {getParticipantsInvoiceReport} from '@hooks/useParticipantsInvoiceReport';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';

import {isIndividualInvoiceRoom, isInvoiceReport} from '@libs/ReportUtils';

import {payInvoice, payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions, ReportNameValuePairs} from '@src/types/onyx';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../../utils/collections/reportActions';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

/**
 * Characterization test for pilot conversion C3: PayActionCell reads the REPORT, REPORT_ACTIONS and
 * REPORT_NAME_VALUE_PAIRS collections plus NVP_INTRO_SELECTED only inside its press handler, so those four
 * subscriptions become synchronous reads.
 *
 * The point of this suite is that it never mocks Onyx. It seeds the real store and asserts what reaches
 * payInvoice and payMoneyRequest, so the same assertions describe the subscription version and the converted
 * one. A mocked useOnyx would have made the two versions untestable by the same file.
 */

const TEST_INVOICE_REPORT_ID = '1001';
const TEST_CHAT_REPORT_ID = '2002';
const TEST_B2B_CHAT_REPORT_ID = '3003';
const TEST_HASH = 12345;
const TEST_ACTIVE_POLICY_ID = 'activePolicy1';

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
    policyID: 'policy1',
} as Report;

const b2bInvoiceRoom = {
    reportID: TEST_B2B_CHAT_REPORT_ID,
    type: CONST.REPORT.TYPE.CHAT,
    chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
} as Report;

const chatReportActions: ReportActions = {chatAction1: {...createRandomReportAction(1), reportActionID: 'chatAction1'}};
const b2bReportActions: ReportActions = {b2bAction1: {...createRandomReportAction(2), reportActionID: 'b2bAction1'}};
const lateReportAction: ReportAction = {...createRandomReportAction(3), reportActionID: 'lateAction'};
const snapshotReportAction: ReportAction = {...createRandomReportAction(4), reportActionID: 'snapshotAction'};
const chatReportNameValuePairs: ReportNameValuePairs = {private_isArchived: ''};

// Capture the onPress (confirmPayment) handler PayActionCell hands to the settlement button, so the payment can be
// confirmed directly, mirroring a user picking a payment method from the menu.
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

jest.mock('@libs/actions/Search', () => ({
    __esModule: true,
    getSearchPayOnyxData: jest.fn(() => ({optimisticData: [], successData: [], failureData: []})),
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
jest.mock('@hooks/useCurrencyList', () => ({
    __esModule: true,
    useCurrencyListActions: jest.fn(() => ({convertToDisplayString: () => '$50.00', getCurrencyDecimals: () => 2})),
}));
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
        activePolicyID: 'activePolicy1',
        activePolicy: undefined,
        conciergeChat: undefined,
        defaultWorkspaceName: '',
        chatReportPolicy: undefined,
        delegateAccountID: undefined,
    })),
}));

const mockShowDelegateNoAccessModal = jest.fn();
let mockIsDelegateAccessRestricted = false;
jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    __esModule: true,
    useDelegateNoAccessState: jest.fn(() => ({isDelegateAccessRestricted: mockIsDelegateAccessRestricted})),
    useDelegateNoAccessActions: jest.fn(() => ({showDelegateNoAccessModal: mockShowDelegateNoAccessModal})),
}));

const mockedUseReportWithTransactionsAndViolations = jest.mocked(useReportWithTransactionsAndViolations);
const mockedGetParticipantsInvoiceReport = jest.mocked(getParticipantsInvoiceReport);
const mockedIsInvoiceReport = jest.mocked(isInvoiceReport);
const mockedIsIndividualInvoiceRoom = jest.mocked(isIndividualInvoiceRoom);
const mockedPayInvoice = jest.mocked(payInvoice);
const mockedPayMoneyRequest = jest.mocked(payMoneyRequest);

function renderPayActionCell() {
    return render(
        <PayActionCell
            isLoading={false}
            policyID="policy1"
            reportID={TEST_INVOICE_REPORT_ID}
            hash={TEST_HASH}
            amount={5000}
            chatReport={chatReport}
        />,
    );
}

async function pressPay(params: Partial<PaymentActionParams> = {}) {
    await act(async () => {
        mockOnPressHolder.current?.({
            paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            payAsBusiness: false,
            ...params,
        } as PaymentActionParams);
    });
}

describe('PayActionCell Onyx reads', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    beforeEach(async () => {
        jest.clearAllMocks();
        mockOnPressHolder.current = undefined;
        mockIsDelegateAccessRestricted = false;
        mockedUseReportWithTransactionsAndViolations.mockReturnValue([invoiceReport, [], undefined]);
        mockedIsInvoiceReport.mockReturnValue(true);
        mockedIsIndividualInvoiceRoom.mockReturnValue(false);
        mockedGetParticipantsInvoiceReport.mockReturnValue(undefined);

        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${TEST_CHAT_REPORT_ID}`, chatReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${TEST_B2B_CHAT_REPORT_ID}`, b2bInvoiceRoom);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${TEST_CHAT_REPORT_ID}`, chatReportActions);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${TEST_B2B_CHAT_REPORT_ID}`, b2bReportActions);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${TEST_CHAT_REPORT_ID}`, chatReportNameValuePairs);
            await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL});
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('passes the chat report actions read from the REPORT_ACTIONS collection to payInvoice', async () => {
        renderPayActionCell();
        await waitForBatchedUpdatesWithAct();

        await pressPay();

        expect(mockedPayInvoice).toHaveBeenCalledWith(
            expect.objectContaining({
                chatReport,
                invoiceReport,
                chatReportActions,
            }),
        );
    });

    it('swaps to the B2B invoice room actions when paying an individual invoice room as a business', async () => {
        mockedIsIndividualInvoiceRoom.mockReturnValue(true);
        mockedGetParticipantsInvoiceReport.mockReturnValue(b2bInvoiceRoom);
        renderPayActionCell();
        await waitForBatchedUpdatesWithAct();

        await pressPay({payAsBusiness: true});

        expect(mockedPayInvoice).toHaveBeenCalledWith(
            expect.objectContaining({
                payAsBusiness: true,
                existingB2BInvoiceReport: b2bInvoiceRoom,
                chatReportActions: b2bReportActions,
            }),
        );
    });

    it('keeps the chat report actions when paying as a business outside an individual invoice room', async () => {
        mockedIsIndividualInvoiceRoom.mockReturnValue(false);
        mockedGetParticipantsInvoiceReport.mockReturnValue(b2bInvoiceRoom);
        renderPayActionCell();
        await waitForBatchedUpdatesWithAct();

        await pressPay({payAsBusiness: true});

        expect(mockedPayInvoice).toHaveBeenCalledWith(expect.objectContaining({chatReportActions}));
    });

    it('resolves the B2B invoice report from the whole REPORT and REPORT_NAME_VALUE_PAIRS collections', async () => {
        renderPayActionCell();
        await waitForBatchedUpdatesWithAct();

        await pressPay();

        expect(mockedGetParticipantsInvoiceReport).toHaveBeenCalledWith(
            expect.objectContaining({
                [`${ONYXKEYS.COLLECTION.REPORT}${TEST_CHAT_REPORT_ID}`]: chatReport,
                [`${ONYXKEYS.COLLECTION.REPORT}${TEST_B2B_CHAT_REPORT_ID}`]: b2bInvoiceRoom,
            }),
            expect.objectContaining({
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${TEST_CHAT_REPORT_ID}`]: chatReportNameValuePairs,
            }),
            TEST_ACTIVE_POLICY_ID,
            CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
            chatReport.policyID,
        );
    });

    it('derives isTrackIntentUser from NVP_INTRO_SELECTED through the selector', async () => {
        renderPayActionCell();
        await waitForBatchedUpdatesWithAct();

        await pressPay();

        expect(mockedPayInvoice).toHaveBeenCalledWith(expect.objectContaining({isTrackIntentUser: true}));
    });

    it('reports isTrackIntentUser false for a non-tracking onboarding choice', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
        });
        renderPayActionCell();
        await waitForBatchedUpdatesWithAct();

        await pressPay();

        expect(mockedPayInvoice).toHaveBeenCalledWith(expect.objectContaining({isTrackIntentUser: false}));
    });

    it('passes the chat report actions to payMoneyRequest on the non-invoice path', async () => {
        mockedIsInvoiceReport.mockReturnValue(false);
        renderPayActionCell();
        await waitForBatchedUpdatesWithAct();

        await pressPay();

        expect(mockedPayInvoice).not.toHaveBeenCalled();
        expect(mockedPayMoneyRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                chatReport,
                iouReport: invoiceReport,
                chatReportActions,
                isTrackIntentUser: true,
            }),
        );
    });

    it('reads the global collection rather than the Search snapshot the row is rendered from', async () => {
        // The row's data comes from `snapshot_${hash}`, so a snapshot holding different report actions for the same
        // report is the trap this asserts against: the payment must use the global collection either way.
        const snapshotData: SearchResultDataType = {};
        snapshotData[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${TEST_CHAT_REPORT_ID}`] = {snapshotAction: snapshotReportAction};
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${TEST_HASH}`, {data: snapshotData});
        });
        renderPayActionCell();
        await waitForBatchedUpdatesWithAct();

        await pressPay();

        expect(mockedPayInvoice).toHaveBeenCalledWith(expect.objectContaining({chatReportActions}));
    });

    it('forwards a report action written after the row rendered', async () => {
        renderPayActionCell();
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${TEST_CHAT_REPORT_ID}`, {lateAction: lateReportAction});
        });

        await pressPay();

        expect(mockedPayInvoice).toHaveBeenCalledWith(
            expect.objectContaining({
                chatReportActions: expect.objectContaining({lateAction: lateReportAction}),
            }),
        );
    });

    it('does not pay at all when delegate access is restricted', async () => {
        mockIsDelegateAccessRestricted = true;
        renderPayActionCell();
        await waitForBatchedUpdatesWithAct();

        await pressPay();

        expect(mockShowDelegateNoAccessModal).toHaveBeenCalled();
        expect(mockedPayInvoice).not.toHaveBeenCalled();
        expect(mockedPayMoneyRequest).not.toHaveBeenCalled();
    });
});
