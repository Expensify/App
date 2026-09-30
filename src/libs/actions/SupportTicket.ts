import * as API from '@libs/API';
import type {CreateSupportTicketParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import getReportRouteForCurrentContext from '@libs/Navigation/helpers/getReportRouteForCurrentContext';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type OpenSupportTicketParams = {
    assigneeAccountID: number;
};

function openSupportTicket({assigneeAccountID}: OpenSupportTicketParams) {
    const reportID = ReportUtils.generateReportID();

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {reportID, type: CONST.REPORT.TYPE.SUPPORT_TICKET},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {isOptimisticReport: true},
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {isOptimisticReport: false},
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: null,
        },
    ];

    const parameters: CreateSupportTicketParams = {
        reportID,
        assigneeAccountID,
    };
    API.write(WRITE_COMMANDS.CREATE_SUPPORT_TICKET, parameters, {optimisticData, successData, failureData});
    Navigation.navigate(getReportRouteForCurrentContext({reportID}));
}

function dismissFailedSupportTicket(supportTicketReportID: string, parentReportID: string, parentReportActionID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${supportTicketReportID}`, null);
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${supportTicketReportID}`, null);
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${supportTicketReportID}`, null);
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {[parentReportActionID]: null});
}

export {dismissFailedSupportTicket, openSupportTicket};
