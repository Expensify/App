import * as API from '@libs/API';
import type {CreateSupportTicketParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as ReportUtils from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type OpenSupportTicketParams = {
    parentReport: OnyxEntry<Report>;
    currentUserAccountID: number;
    currentUserEmail: string;
    currentUserDisplayName?: string;
};

function openSupportTicket({parentReport, currentUserAccountID, currentUserEmail, currentUserDisplayName}: OpenSupportTicketParams) {
    const parentReportID = parentReport?.reportID;
    if (!parentReportID) {
        return;
    }

    const supportTicketReport = ReportUtils.buildOptimisticSupportTicketReport(currentUserAccountID, parentReportID);
    const createdAction = ReportUtils.buildOptimisticCreatedReportAction({
        emailCreatingAction: currentUserEmail,
        currentUserAccountID,
        currentUserDisplayName,
        currentUserEmail,
    });
    const parentAction = ReportUtils.buildOptimisticSupportTicketCommentReportAction(supportTicketReport.reportID, parentReportID, currentUserEmail, currentUserAccountID);
    supportTicketReport.parentReportActionID = parentAction.reportAction.reportActionID;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${supportTicketReport.reportID}`,
            value: {...supportTicketReport, pendingFields: {createReport: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${supportTicketReport.reportID}`,
            value: {isOptimisticReport: true},
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${supportTicketReport.reportID}`,
            value: {[createdAction.reportActionID]: createdAction},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[parentAction.reportAction.reportActionID]: parentAction.reportAction},
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${supportTicketReport.reportID}`,
            value: {pendingFields: {createReport: null}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${supportTicketReport.reportID}`,
            value: {isOptimisticReport: false},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${supportTicketReport.reportID}`,
            value: {[createdAction.reportActionID]: {pendingAction: null}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[parentAction.reportAction.reportActionID]: {pendingAction: null, isOptimisticAction: null}},
        },
    ];
    const error = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('supportTicket.genericCreateSupportTicketFailureMessage');
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${supportTicketReport.reportID}`,
            value: {errorFields: {createReport: error}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[parentAction.reportAction.reportActionID]: {errors: {createReport: error}}},
        },
    ];

    const parameters: CreateSupportTicketParams = {
        reportID: supportTicketReport.reportID,
        parentReportActionID: parentAction.reportAction.reportActionID,
        createdReportActionID: createdAction.reportActionID,
    };
    API.write(WRITE_COMMANDS.CREATE_SUPPORT_TICKET, parameters, {optimisticData, successData, failureData});
}

function dismissFailedSupportTicket(supportTicketReportID: string, parentReportID: string, parentReportActionID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${supportTicketReportID}`, null);
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${supportTicketReportID}`, null);
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${supportTicketReportID}`, null);
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {[parentReportActionID]: null});
}

export {dismissFailedSupportTicket, openSupportTicket};
