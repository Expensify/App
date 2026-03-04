import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import {isAnonymousUser} from '@libs/actions/Session';
import * as API from '@libs/API';
import type {MarkAllMessagesAsReadParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import NetworkConnection from '@libs/NetworkConnection';
import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import {isArchivedReport, isUnread} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions, ReportNameValuePairs} from '@src/types/onyx';

let allReportActions: OnyxCollection<ReportActions>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (value) => (allReportActions = value),
});

let allReports: OnyxCollection<Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

let allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    waitForCollectionCallback: true,
    callback: (value) => (allReportNameValuePairs = value),
});

function markAllMessagesAsRead() {
    if (isAnonymousUser()) {
        return;
    }

    const newLastReadTime = NetworkConnection.getDBTimeWithSkew();

    type PartialReport = {
        lastReadTime: Report['lastReadTime'] | null;
    };
    const optimisticReports: Record<string, PartialReport> = {};
    const failureReports: Record<string, PartialReport> = {};
    const reportIDList: string[] = [];
    for (const report of Object.values(allReports ?? {})) {
        if (!report) {
            continue;
        }

        const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`];
        const oneTransactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]);
        const oneTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`];
        const reportArchived = isArchivedReport(allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]);
        if (!isUnread(report, oneTransactionThreadReport, reportArchived)) {
            continue;
        }

        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`;
        optimisticReports[reportKey] = {lastReadTime: newLastReadTime};
        failureReports[reportKey] = {lastReadTime: report.lastReadTime ?? null};
        reportIDList.push(report.reportID);
    }

    if (reportIDList.length === 0) {
        return;
    }

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT,
            value: optimisticReports,
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT,
            value: failureReports,
        },
    ];

    const parameters: MarkAllMessagesAsReadParams = {
        reportIDList,
    };

    API.write(WRITE_COMMANDS.MARK_ALL_MESSAGES_AS_READ, parameters, {optimisticData, failureData});
}

export default markAllMessagesAsRead;
