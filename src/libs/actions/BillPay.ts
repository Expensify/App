/** Pays bills with PayMoneyRequest. A bill has no parent chat, so it can't use payMoneyRequest. */
import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import {write} from '@libs/API';
import type {PayMoneyRequestParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import isBillReport from '@libs/isBillReport';
import Log from '@libs/Log';
import {buildOptimisticIOUReportAction, getReimbursableTotal} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type PayBillParams = {
    /** The bill to pay */
    report: OnyxEntry<Report>;

    /** How the payer pays: by bank account (ACH) or outside Expensify */
    paymentMethodType: PaymentMethodType;

    /** The payer's bank account for an ACH payment */
    bankAccountID?: number;

    /** Masked number of that bank account, saved on the pay action so every viewer sees the same account */
    accountNumber?: string;

    /** Gets the decimals of a currency, to format the amount on the pay action */
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'];

    /** The copilot paying on behalf of the account, if any */
    delegateAccountID: number | undefined;
};

function payBill({report, paymentMethodType, bankAccountID, accountNumber, getCurrencyDecimals, delegateAccountID}: PayBillParams) {
    const isMarkedAsPaid = paymentMethodType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE;
    if (!report || !isBillReport(report) || (!isMarkedAsPaid && !bankAccountID)) {
        Log.warn('[BillPay] Not paying the bill, because the bill or the bank account for an ACH payment is missing', {reportID: report?.reportID, paymentMethodType});
        return;
    }

    // A bill stores its total as a negative amount, like an expense report.
    const total = getReimbursableTotal(report);

    // PayMoneyRequest pays a bill only by ACH or outside Expensify, so any bank payment is sent as ACH.
    const billPaymentType = isMarkedAsPaid ? CONST.IOU.PAYMENT_TYPE.ELSEWHERE : CONST.IOU.PAYMENT_TYPE.VBBA;

    // PayMoneyRequest adds a pay action to the bill, like it does on expense reports, so show it right away.
    const payAction = buildOptimisticIOUReportAction({
        type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
        amount: -total,
        currency: report.currency ?? '',
        comment: '',
        participants: [],
        transactionID: '',
        paymentType: billPaymentType,
        iouReportID: report.reportID,
        isSettlingUp: true,
        bankAccountID,
        accountNumber,
        delegateAccountIDParam: delegateAccountID,
        getCurrencyDecimals,
    });

    const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}` as const;
    const actionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}` as const;
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: reportKey,
                value: {
                    stateNum: isMarkedAsPaid ? CONST.REPORT.STATE_NUM.APPROVED : CONST.REPORT.STATE_NUM.BILLING,
                    statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                    pendingFields: {
                        reimbursed: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                    errorFields: {reimbursed: null},
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: actionsKey,
                value: {[payAction.reportActionID]: payAction},
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: reportKey,
                value: {pendingFields: {reimbursed: null}},
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: actionsKey,
                value: {[payAction.reportActionID]: {pendingAction: null}},
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: reportKey,
                value: {
                    stateNum: report.stateNum,
                    statusNum: report.statusNum,
                    pendingFields: {reimbursed: null},
                    errorFields: {
                        reimbursed: getMicroSecondOnyxErrorWithTranslationKey('billPay.paymentFailed'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: actionsKey,
                value: {
                    [payAction.reportActionID]: {
                        errors: getMicroSecondOnyxErrorWithTranslationKey('billPay.paymentFailed'),
                    },
                },
            },
        ],
    };

    const params: PayMoneyRequestParams = {
        iouReportID: report.reportID,
        chatReportID: report.chatReportID,
        reportActionID: payAction.reportActionID,
        paymentMethodType: billPaymentType,
        full: true,
        amount: Math.abs(total),
        ...(isMarkedAsPaid ? {} : {bankAccountID}),
    };
    write(WRITE_COMMANDS.PAY_MONEY_REQUEST, params, onyxData);
}

export default payBill;
export type {PayBillParams};
