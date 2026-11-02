/** Pays bills with PayMoneyRequest, and invoices through Classic's reimbursement flows. */
import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import {write} from '@libs/API';
import type {PayMoneyRequestParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {isBillReport} from '@libs/BillPayUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Log from '@libs/Log';
import {buildOptimisticIOUReportAction, getReimbursableTotal} from '@libs/ReportUtils';
import type {SearchKey} from '@libs/SearchKeyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import mergeAdditionalPayOnyxData from './IOU/mergeAdditionalPayOnyxData';
import {getSearchPayOnyxData} from './Search';

type PayBillParams = {
    /** The bill or received invoice to pay */
    report: OnyxEntry<Report>;

    /** How the payer pays: by bank account (ACH) or outside Expensify */
    paymentMethodType: PaymentMethodType;

    /** The payer's bank account for an ACH payment */
    bankAccountID?: number;

    /** Masked number of that bank account, saved on the pay action so every viewer sees the same account */
    accountNumber?: string;

    /** Hash of the Search snapshot to update when the user pays from Search */
    searchHash?: number;

    /** Key of the Search the user pays from */
    searchKey?: SearchKey;

    /** Gets the decimals of a currency, to format the amount on the pay action */
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'];

    /** The copilot paying on behalf of the account, if any */
    delegateAccountID: number | undefined;
};

function payBill({report, paymentMethodType, bankAccountID, accountNumber, searchHash, searchKey, getCurrencyDecimals, delegateAccountID}: PayBillParams) {
    const isMarkedAsPaid = paymentMethodType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE;
    if (!report || (!isMarkedAsPaid && !bankAccountID)) {
        Log.warn('[BillPay] Not paying the bill, because the bill or the bank account for an ACH payment is missing', {reportID: report?.reportID, paymentMethodType});
        return;
    }
    const key = `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}` as const;
    const onyxData: OnyxData<
        typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.SNAPSHOT | typeof ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE
    > = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key,
                value: {
                    stateNum: isMarkedAsPaid ? CONST.REPORT.STATE_NUM.APPROVED : CONST.REPORT.STATE_NUM.BILLING,
                    statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                    pendingFields: {
                        reimbursed: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                    errorFields: {reimbursed: null},
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key,
                value: {pendingFields: {reimbursed: null}},
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key,
                value: {
                    stateNum: report.stateNum,
                    statusNum: report.statusNum,
                    pendingFields: {reimbursed: null},
                    errorFields: {
                        reimbursed: getMicroSecondOnyxErrorWithTranslationKey('billPay.paymentFailed'),
                    },
                },
            },
        ],
    };
    const searchData = searchHash === undefined ? undefined : getSearchPayOnyxData(searchHash, report.reportID, searchKey);

    if (!isBillReport(report)) {
        if (isMarkedAsPaid) {
            write(WRITE_COMMANDS.MARK_REIMBURSED, {reportID: report.reportID, comment: ''}, mergeAdditionalPayOnyxData(onyxData, searchData));
        } else {
            write(
                WRITE_COMMANDS.REIMBURSE_REPORT,
                {
                    reportID: report.reportID,
                    bankAccountID: bankAccountID ?? CONST.DEFAULT_NUMBER_ID,
                },
                mergeAdditionalPayOnyxData(onyxData, searchData),
            );
        }
        return;
    }

    // PayMoneyRequest adds a pay action to the bill, like it does on expense reports, so show it right away.
    // A bill stores its total as a negative amount, like an expense report.
    const total = getReimbursableTotal(report);
    const payAction = buildOptimisticIOUReportAction({
        type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
        amount: -total,
        currency: report.currency ?? '',
        comment: '',
        participants: [],
        transactionID: '',
        paymentType: paymentMethodType,
        iouReportID: report.reportID,
        isSettlingUp: true,
        bankAccountID,
        accountNumber,
        delegateAccountIDParam: delegateAccountID,
        getCurrencyDecimals,
    });
    const actionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}` as const;
    onyxData.optimisticData?.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: actionsKey,
        value: {[payAction.reportActionID]: payAction},
    });
    onyxData.successData?.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: actionsKey,
        value: {[payAction.reportActionID]: {pendingAction: null}},
    });
    onyxData.failureData?.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: actionsKey,
        value: {
            [payAction.reportActionID]: {
                errors: getMicroSecondOnyxErrorWithTranslationKey('billPay.paymentFailed'),
            },
        },
    });

    const params: PayMoneyRequestParams = {
        iouReportID: report.reportID,
        chatReportID: report.chatReportID,
        reportActionID: payAction.reportActionID,
        paymentMethodType,
        full: true,
        amount: Math.abs(total),
        ...(isMarkedAsPaid ? {} : {bankAccountID}),
    };
    write(WRITE_COMMANDS.PAY_MONEY_REQUEST, params, mergeAdditionalPayOnyxData(onyxData, searchData));
}

export default payBill;
export type {PayBillParams};
