/** Creates and pays bills through Classic's intake and reimbursement flows. */
import {write} from '@libs/API';
import type {CreateBillParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';
import type {SearchKey} from '@libs/SearchKeyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import mergeAdditionalPayOnyxData from './IOU/mergeAdditionalPayOnyxData';
import {getSearchPayOnyxData} from './Search';

function payBill(report: OnyxEntry<Report>, paymentMethodType: PaymentMethodType, bankAccountID?: number, searchHash?: number, searchKey?: SearchKey) {
    if (!report) {
        return;
    }
    const key = `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}` as const;
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.SNAPSHOT | typeof ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key,
                value: {
                    stateNum: paymentMethodType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE ? CONST.REPORT.STATE_NUM.APPROVED : CONST.REPORT.STATE_NUM.BILLING,
                    statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                    pendingFields: {reimbursed: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    errorFields: {reimbursed: null},
                },
            },
        ],
        successData: [{onyxMethod: Onyx.METHOD.MERGE, key, value: {pendingFields: {reimbursed: null}}}],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key,
                value: {
                    stateNum: report.stateNum,
                    statusNum: report.statusNum,
                    pendingFields: {reimbursed: null},
                    errorFields: {reimbursed: getMicroSecondOnyxErrorWithTranslationKey('billPay.paymentFailed')},
                },
            },
        ],
    };
    const searchData = searchHash === undefined ? undefined : getSearchPayOnyxData(searchHash, report.reportID, searchKey);
    write(WRITE_COMMANDS.PAY_BILL, {reportID: report.reportID, paymentMethodType, bankAccountID}, mergeAdditionalPayOnyxData(onyxData, searchData));
}

function createBill(params: Omit<CreateBillParams, 'reportID' | 'invoiceReportID'>, accountID: number) {
    const reportID = generateReportID();
    const invoiceReportID = generateReportID();
    const key = `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const;
    write(
        WRITE_COMMANDS.CREATE_BILL,
        {...params, reportID, invoiceReportID},
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key,
                    value: {
                        reportID,
                        invoiceID: invoiceReportID,
                        type: CONST.REPORT.TYPE.BILL,
                        reportName: params.merchant,
                        ownerAccountID: accountID,
                        total: -params.amount,
                        currency: params.currency,
                        created: params.date,
                        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                        pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                    },
                },
            ],
            successData: [{onyxMethod: Onyx.METHOD.MERGE, key, value: {pendingFields: {createChat: null}}}],
            failureData: [{onyxMethod: Onyx.METHOD.MERGE, key, value: {pendingFields: {createChat: null}, errors: getMicroSecondOnyxErrorWithTranslationKey('billPay.createFailed')}}],
        },
    );
    Navigation.dismissModal();
    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
}

export {createBill, payBill};
