import payBill from '@libs/actions/BillPay';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

jest.mock('@libs/API');

const getCurrencyDecimals = () => 2;

describe('Bill Pay actions', () => {
    beforeAll(async () => {
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

        // When the payer pays the bill from that bank account
        payBill({
            report: bill,
            paymentMethodType: CONST.IOU.PAYMENT_TYPE.VBBA,
            bankAccountID: 789,
            getCurrencyDecimals,
            delegateAccountID: undefined,
        });

        // Then PayMoneyRequest debits that account by ACH for the amount shown on the bill
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

    it('keeps marking an invoice as paid with MarkReimbursed', () => {
        // Given an invoice the payer marked as paid outside Expensify. PayMoneyRequest doesn't pay invoices.
        const invoice: Report = {
            reportID: '321',
            type: CONST.REPORT.TYPE.INVOICE,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        };

        // When the payer marks the invoice as paid
        payBill({
            report: invoice,
            paymentMethodType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            getCurrencyDecimals,
            delegateAccountID: undefined,
        });

        // Then the invoice still uses MarkReimbursed
        expect(write).toHaveBeenCalledWith(WRITE_COMMANDS.MARK_REIMBURSED, {reportID: '321', comment: ''}, expect.anything());
    });
});
