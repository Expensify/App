/** Pays bills with PayMoneyRequest. A bill has no parent chat, so it can't use payMoneyRequest. */
import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import {write} from '@libs/API';
import type {PayMoneyRequestParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import isBillReport from '@libs/isBillReport';
import Log from '@libs/Log';
import {buildOptimisticNextStep} from '@libs/NextStepUtils';
import {getReportActionHtml, getReportActionText} from '@libs/ReportActionsUtils';
import {buildOptimisticIOUReportAction, getReimbursableTotal} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Rule} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

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

    /** Whether the payer chose tracking expenses during onboarding, which changes the next step */
    isTrackIntentUser: boolean | undefined;

    /** The approval workflow rules, which the optimistic next step reads */
    rules: OnyxCollection<Rule>;
};

function payBill({report, paymentMethodType, bankAccountID, accountNumber, getCurrencyDecimals, delegateAccountID, isTrackIntentUser, rules}: PayBillParams) {
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

    const optimisticNextStep = buildOptimisticNextStep({report, predictedNextStatus: CONST.REPORT.STATUS_NUM.REIMBURSED, isTrackIntentUser, rules});

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
                    lastMessageText: getReportActionText(payAction),
                    lastMessageHtml: getReportActionHtml(payAction),
                    lastVisibleActionCreated: payAction.created,
                    nextStep: optimisticNextStep,
                    pendingFields: {
                        reimbursed: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                value: {pendingFields: {reimbursed: null, nextStep: null}},
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
                    lastMessageText: report.lastMessageText ?? null,
                    lastMessageHtml: report.lastMessageHtml ?? null,
                    lastVisibleActionCreated: report.lastVisibleActionCreated ?? null,
                    nextStep: report.nextStep ?? null,
                    pendingFields: {reimbursed: null, nextStep: null},
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

/** Dismisses the error that a failed payment left on the bill's Pay button. */
function clearBillPaymentError(reportID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {errorFields: {reimbursed: null}});
}

export {payBill, clearBillPaymentError};
export type {PayBillParams};
