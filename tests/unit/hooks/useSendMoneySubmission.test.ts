import {act, renderHook} from '@testing-library/react-native';

import dismissModalAndOpenReportInInboxTab from '@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab';

import type {SendMoneyOptions} from '@pages/iou/request/step/confirmation/submission/types';
import useSendMoneySubmission from '@pages/iou/request/step/confirmation/submission/useSendMoneySubmission';

import {sendMoneyElsewhere, sendMoneyWithWallet} from '@userActions/IOU/SendMoney';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {Receipt} from '@src/types/onyx/Transaction';

import Onyx from 'react-native-onyx';

import {buildChatReport, buildTransaction, CURRENT_USER_PERSONAL_DETAILS, OTHER_USER_PARTICIPANT, REPORT_ID, TRANSACTION_ID} from '../../utils/expenseSubmissionTestUtils';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/IOU/SendMoney', () => ({sendMoneyElsewhere: jest.fn(), sendMoneyWithWallet: jest.fn()}));
jest.mock('@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab', () => ({__esModule: true, default: jest.fn()}));

const mockSendMoneyElsewhere = jest.mocked(sendMoneyElsewhere);
const mockSendMoneyWithWallet = jest.mocked(sendMoneyWithWallet);
const mockDismissModalAndOpenReportInInboxTab = jest.mocked(dismissModalAndOpenReportInInboxTab);
const mockSetIsConfirmed = jest.fn();
const mockOnExpenseWriteWillStart = jest.fn();

type UseSendMoneySubmissionParams = Parameters<typeof useSendMoneySubmission>[0];

const NEW_CHAT_REPORT_IDS = {optimisticChatReportID: 'optimistic-p2p-chat', chatReportID: 'optimistic-p2p-chat'};

function buildParams(overrides: Partial<UseSendMoneySubmissionParams> = {}): UseSendMoneySubmissionParams {
    return {
        transaction: buildTransaction(),
        receiptFiles: {},
        report: buildChatReport(),
        participants: [OTHER_USER_PARTICIPANT],
        currentUserPersonalDetails: CURRENT_USER_PERSONAL_DETAILS,
        setIsConfirmed: mockSetIsConfirmed,
        onExpenseWriteWillStart: mockOnExpenseWriteWillStart,
        ...overrides,
    };
}

/** Renders the hook and sends money once, the way the pay button does. */
async function sendMoney(params: UseSendMoneySubmissionParams, paymentMethod: PaymentMethodType | undefined, options: Partial<SendMoneyOptions> = {}) {
    const {result} = renderHook(() => useSendMoneySubmission(params));
    await waitForBatchedUpdatesWithAct();

    await act(async () => {
        result.current.sendMoney(paymentMethod, {shouldHandleNavigation: true, shouldStartTracking: true, ...options});
    });
    await waitForBatchedUpdatesWithAct();
}

describe('useSendMoneySubmission', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('pays elsewhere through sendMoneyElsewhere and opens the chat the money was sent in', async () => {
        // Given a payment to a person the user already has a chat with

        // When the user pays elsewhere
        await sendMoney(buildParams(), CONST.IOU.PAYMENT_TYPE.ELSEWHERE);

        // Then the submit is locked, the elsewhere command runs in the existing chat, and that chat is opened
        expect(mockOnExpenseWriteWillStart).toHaveBeenCalledTimes(1);
        expect(mockSetIsConfirmed).toHaveBeenCalledWith(true);
        expect(mockSendMoneyElsewhere).toHaveBeenCalledTimes(1);
        expect(mockSendMoneyElsewhere).toHaveBeenCalledWith(expect.objectContaining({report: expect.objectContaining({reportID: REPORT_ID}), optimisticChatReportID: undefined}));
        expect(mockSendMoneyWithWallet).not.toHaveBeenCalled();
        expect(mockDismissModalAndOpenReportInInboxTab).toHaveBeenCalledWith(REPORT_ID, undefined, false);
    });

    it('pays with Expensify through sendMoneyWithWallet', async () => {
        // Given a payment to a person the user already has a chat with

        // When the user pays with Expensify
        await sendMoney(buildParams(), CONST.IOU.PAYMENT_TYPE.EXPENSIFY);

        // Then the wallet command runs instead of the elsewhere one
        expect(mockSetIsConfirmed).toHaveBeenCalledWith(true);
        expect(mockSendMoneyWithWallet).toHaveBeenCalledTimes(1);
        expect(mockSendMoneyElsewhere).not.toHaveBeenCalled();
        expect(mockDismissModalAndOpenReportInInboxTab).toHaveBeenCalledWith(REPORT_ID, undefined, false);
    });

    it('sends the payment details from the transaction and the receipt attached to it', async () => {
        // Given a payment with a comment that has surrounding whitespace and an attached receipt
        const transaction = buildTransaction({comment: {comment: '  Lunch  '}});
        const receipt: Receipt = {source: 'file://receipt.jpg'};

        // When the user pays elsewhere
        await sendMoney(buildParams({transaction, receiptFiles: {[TRANSACTION_ID]: receipt}}), CONST.IOU.PAYMENT_TYPE.ELSEWHERE, {shouldStartTracking: false});

        // Then the action gets the trimmed comment, the receipt, and the tracking choice the caller made
        expect(mockSendMoneyElsewhere).toHaveBeenCalledWith(
            expect.objectContaining({
                amount: transaction.amount,
                currency: transaction.currency,
                comment: 'Lunch',
                receipt,
                recipient: OTHER_USER_PARTICIPANT,
                currentUserAccountID: CURRENT_USER_PERSONAL_DETAILS.accountID,
                shouldStartTracking: false,
            }),
        );
    });

    it('drops the page-level report when the caller resolved a new chat for the recipient', async () => {
        // Given a recipient changed without remounting the screen, so the page-level report still belongs to the previous recipient

        // When the user pays with IDs resolved for a recipient who has no chat yet
        await sendMoney(buildParams(), CONST.IOU.PAYMENT_TYPE.ELSEWHERE, {resolvedReportIDs: NEW_CHAT_REPORT_IDS});

        // Then the stale report is not passed, so it can't override the new chat ID, and the new chat is opened
        expect(mockSendMoneyElsewhere).toHaveBeenCalledWith(expect.objectContaining({report: undefined, optimisticChatReportID: NEW_CHAT_REPORT_IDS.optimisticChatReportID}));
        expect(mockDismissModalAndOpenReportInInboxTab).toHaveBeenCalledWith(NEW_CHAT_REPORT_IDS.chatReportID, undefined, false);
    });

    it('writes without navigating when shouldHandleNavigation=false, because the caller already dismissed first', async () => {
        // Given a payment whose destination was already revealed before the write

        // When the user pays
        await sendMoney(buildParams(), CONST.IOU.PAYMENT_TYPE.ELSEWHERE, {shouldHandleNavigation: false, resolvedReportIDs: NEW_CHAT_REPORT_IDS});

        // Then the payment is sent without navigating a second time
        expect(mockSendMoneyElsewhere).toHaveBeenCalledTimes(1);
        expect(mockDismissModalAndOpenReportInInboxTab).not.toHaveBeenCalled();
    });

    it('does nothing for a payment method it does not handle', async () => {
        // Given a payment with no supported payment method picked

        // When the user confirms
        await sendMoney(buildParams(), undefined);

        // Then nothing is written and the submit stays unlocked, so the user can pick a method and try again
        expect(mockSendMoneyElsewhere).not.toHaveBeenCalled();
        expect(mockSendMoneyWithWallet).not.toHaveBeenCalled();
        expect(mockSetIsConfirmed).not.toHaveBeenCalled();
        expect(mockOnExpenseWriteWillStart).not.toHaveBeenCalled();
        expect(mockDismissModalAndOpenReportInInboxTab).not.toHaveBeenCalled();
    });

    it.each([
        ['there is no recipient', buildParams({participants: []})],
        ['the amount is zero', buildParams({transaction: buildTransaction({amount: 0})})],
        ['there is no currency', buildParams({transaction: buildTransaction({currency: undefined})})],
    ])('does nothing when %s', async (_description, params) => {
        // Given a payment the send money commands can't build

        // When the user pays
        await sendMoney(params, CONST.IOU.PAYMENT_TYPE.ELSEWHERE);

        // Then nothing is written and the submit stays unlocked
        expect(mockSendMoneyElsewhere).not.toHaveBeenCalled();
        expect(mockSetIsConfirmed).not.toHaveBeenCalled();
        expect(mockDismissModalAndOpenReportInInboxTab).not.toHaveBeenCalled();
    });
});
