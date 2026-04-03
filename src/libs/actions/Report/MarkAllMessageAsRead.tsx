import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import {isAnonymousUser} from '@libs/actions/Session';
import * as API from '@libs/API';
import type {MarkAllMessagesAsReadParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import NetworkConnection from '@libs/NetworkConnection';
import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import {isUnread} from '@libs/ReportUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions} from '@src/types/onyx';

// We use connectWithoutView because markAllMessagesAsRead doesn't affect the UI rendering
// and this avoids unnecessary re-rendering in AuthScreen whenever any report or report action is updated
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

function markAllMessagesAsRead(archivedReportsIdSet: ArchivedReportsIDSet) {
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
        const isArchivedReport = archivedReportsIdSet.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`);
        if (!isUnread(report, oneTransactionThreadReport, isArchivedReport)) {
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
