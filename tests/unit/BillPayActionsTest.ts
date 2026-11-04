import {clearBillPaymentError, payBill} from '@libs/actions/BillPay';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {getOnyxData, getRequiredOnyxUpdate, getRequiredWriteCall} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');

const getCurrencyDecimals = () => 2;

describe('Bill Pay actions', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('marks a bill as paid with PayMoneyRequest and shows the pay action right away', () => {
        // Given a bill the payer marked as paid outside Expensify
        const bill: Report = {
            reportID: '123',
            type: CONST.REPORT.TYPE.BILL,
            currency: CONST.CURRENCY.USD,
            total: -175,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        };

        // When the payer marks the bill as paid
        payBill({
            report: bill,
            paymentMethodType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            getCurrencyDecimals,
            delegateAccountID: undefined,
            isTrackIntentUser: false,
            rules: undefined,
        });

        // Then the bill uses PayMoneyRequest, which records the payment on the bill and its invoice
        expect(write).toHaveBeenCalledWith(
            WRITE_COMMANDS.PAY_MONEY_REQUEST,
            expect.objectContaining({
                iouReportID: '123',
                paymentMethodType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                full: true,
                amount: 175,
            }),
            expect.anything(),
        );
        const [, params, onyxData] = jest.mocked(write).mock.calls.at(0) ?? [];
        expect(params).not.toHaveProperty('bankAccountID');

        // And the request's pay action is added to the bill, so the payer sees the payment while offline
        const reportActionID = params && 'reportActionID' in params ? String(params.reportActionID) : '';
        expect(reportActionID).not.toBe('');
        expect(onyxData?.optimisticData).toContainEqual(
            expect.objectContaining({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}123`,
                value: {
                    [reportActionID]: expect.objectContaining({
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    }),
                },
            }),
        );
    });

    it('pays a bill by ACH with PayMoneyRequest from the chosen bank account', () => {
        // Given an approved bill and the payer's business bank account
        const bill: Report = {
            reportID: '456',
            type: CONST.REPORT.TYPE.BILL,
            currency: CONST.CURRENCY.USD,
            total: -175,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        };

        // When the payer pays the bill from that bank account, with a saved payment method that isn't ACH, as bulk pay can
        payBill({
            report: bill,
            paymentMethodType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
            bankAccountID: 789,
            getCurrencyDecimals,
            delegateAccountID: undefined,
            isTrackIntentUser: false,
            rules: undefined,
        });

        // Then PayMoneyRequest debits that account by ACH for the amount shown on the bill, since it pays bills only by ACH or outside Expensify
        expect(write).toHaveBeenCalledWith(
            WRITE_COMMANDS.PAY_MONEY_REQUEST,
            expect.objectContaining({
                iouReportID: '456',
                paymentMethodType: CONST.IOU.PAYMENT_TYPE.VBBA,
                bankAccountID: 789,
                full: true,
                amount: 175,
            }),
            expect.anything(),
        );
    });

    it('restores the bill and shows an error when the payment fails', () => {
        // Given an approved bill
        const bill: Report = {
            reportID: '789',
            type: CONST.REPORT.TYPE.BILL,
            currency: CONST.CURRENCY.USD,
            total: -175,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        };

        // When the payer marks the bill as paid
        payBill({
            report: bill,
            paymentMethodType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            getCurrencyDecimals,
            delegateAccountID: undefined,
            isTrackIntentUser: false,
            rules: undefined,
        });

        // Then a failed request puts the bill back in its approved state and tells the payer the payment failed
        const reportRollback = getRequiredOnyxUpdate(
            getRequiredWriteCall(jest.mocked(write).mock.calls, 0)[2],
            'failureData',
            `${ONYXKEYS.COLLECTION.REPORT}789`,
            Onyx.METHOD.MERGE,
            true,
        ).value;
        expect(reportRollback).toMatchObject({stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED});
        expect(reportRollback).toHaveProperty('errorFields.reimbursed');
    });

    it('does not pay an invoice', () => {
        // Given an invoice. payBill pays only bills, and invoices keep their own payment flow.
        const invoice: Report = {
            reportID: '321',
            type: CONST.REPORT.TYPE.INVOICE,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        };

        // When payBill gets the invoice
        payBill({
            report: invoice,
            paymentMethodType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            getCurrencyDecimals,
            delegateAccountID: undefined,
            isTrackIntentUser: false,
            rules: undefined,
        });

        // Then it sends no request
        expect(write).not.toHaveBeenCalled();
    });

    it('shows the paid next step and the pay message on the bill right away, and restores them if the payment fails', () => {
        // Given an approved bill that waits for its payer, with an earlier last message
        const waitingNextStep = {messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY, icon: CONST.NEXT_STEP.ICONS.HOURGLASS};
        const bill: Report = {
            reportID: '654',
            type: CONST.REPORT.TYPE.BILL,
            currency: CONST.CURRENCY.USD,
            total: -175,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            nextStep: waitingNextStep,
            lastMessageText: 'approved',
            lastMessageHtml: 'approved',
            lastVisibleActionCreated: '2026-11-01 00:00:00.000',
        };

        // When the payer marks the bill as paid
        payBill({
            report: bill,
            paymentMethodType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            getCurrencyDecimals,
            delegateAccountID: undefined,
            isTrackIntentUser: false,
            rules: undefined,
        });

        // Then the bill shows that no further action is needed and the pay action as its last message, like a paid expense report
        const onyxData = getRequiredWriteCall(jest.mocked(write).mock.calls, 0)[2];
        const optimisticBill = getRequiredOnyxUpdate(onyxData, 'optimisticData', `${ONYXKEYS.COLLECTION.REPORT}654`, Onyx.METHOD.MERGE, true).value;
        expect(optimisticBill).toMatchObject({
            nextStep: {messageKey: CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION},
            pendingFields: {nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
        });
        expect(optimisticBill).not.toMatchObject({lastMessageText: bill.lastMessageText});
        expect(optimisticBill).not.toMatchObject({lastVisibleActionCreated: bill.lastVisibleActionCreated});

        // And a failed payment puts back the next step and the last message the bill had before
        const billRollback = getRequiredOnyxUpdate(onyxData, 'failureData', `${ONYXKEYS.COLLECTION.REPORT}654`, Onyx.METHOD.MERGE, true).value;
        expect(billRollback).toMatchObject({
            nextStep: waitingNextStep,
            lastMessageText: bill.lastMessageText,
            lastMessageHtml: bill.lastMessageHtml,
            lastVisibleActionCreated: bill.lastVisibleActionCreated,
            pendingFields: {nextStep: null},
        });
    });

    it('pays the reimbursable total of the bill', () => {
        // Given a bill whose reimbursable total differs from its total, because part of it isn't reimbursable
        const bill: Report = {
            reportID: '987',
            type: CONST.REPORT.TYPE.BILL,
            currency: CONST.CURRENCY.USD,
            total: -175,
            reimbursableTotal: -150,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        };

        // When the payer marks the bill as paid
        payBill({
            report: bill,
            paymentMethodType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            getCurrencyDecimals,
            delegateAccountID: undefined,
            isTrackIntentUser: false,
            rules: undefined,
        });

        // Then the request pays the reimbursable total, the same amount the Pay button shows
        expect(write).toHaveBeenCalledWith(WRITE_COMMANDS.PAY_MONEY_REQUEST, expect.objectContaining({amount: 150}), expect.anything());
    });

    it('dismisses the payment error on the bill', async () => {
        // Given a bill that a failed payment left with an error
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}111`, {
            reportID: '111',
            type: CONST.REPORT.TYPE.BILL,
            errorFields: {reimbursed: getMicroSecondOnyxErrorWithTranslationKey('billPay.paymentFailed')},
        });
        await waitForBatchedUpdates();

        // When the payer dismisses the error
        clearBillPaymentError('111');
        await waitForBatchedUpdates();

        // Then the bill no longer shows it
        let bill: OnyxEntry<Report>;
        await getOnyxData({
            key: `${ONYXKEYS.COLLECTION.REPORT}111`,
            callback: (value) => {
                bill = value;
            },
        });
        expect(bill?.errorFields?.reimbursed).toBeUndefined();
    });
});
