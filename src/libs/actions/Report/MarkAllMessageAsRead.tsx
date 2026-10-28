import {isAnonymousUser} from '@libs/actions/Session';
import * as API from '@libs/API';
import type {MarkAllMessagesAsReadParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getDBTimeWithSkew, getIsOffline} from '@libs/NetworkState';
import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import {isArchivedReport, isUnread} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions, ReportAttributesDerivedValue} from '@src/types/onyx';

import type {ReportNameValuePairsArchivedState} from '@selectors/ReportNameValuePairs';
import type {OnyxCollection, OnyxUpdate} from 'react-native-onyx';

import {DeviceEventEmitter} from 'react-native';
import Onyx from 'react-native-onyx';

// We use connectWithoutView because markAllMessagesAsRead doesn't affect the UI rendering
// and this avoids unnecessary re-rendering in AuthScreen whenever any report or report action is updated
let allReportActions: OnyxCollection<ReportActions>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (value) => (allReportActions = value),
});

let allReports: OnyxCollection<Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (value) => (allReports = value),
});

// The archived state is passed in by the caller (read via useOnyx with reportNameValuePairsArchivedSelector) rather
// than subscribed to here, so this action stays a plain function and callers only re-render when the archived flags
// actually change.
/**
 * Marks every unread report as read. Pass `reportIDs` to limit it to a subset, e.g. only the reports listed under one
 * Inbox tab; when omitted, every unread report is marked read.
 */
function markAllMessagesAsRead(
    reportNameValuePairs: OnyxCollection<ReportNameValuePairsArchivedState>,
    reportIDs: string[] | undefined,
    reportAttributesDerived: ReportAttributesDerivedValue['reports'] | undefined,
) {
    if (isAnonymousUser()) {
        return;
    }

    const newLastReadTime = getDBTimeWithSkew();
    // Read the in-memory offline state directly since this is an imperative one-shot action (reactivity is not needed here).
    const isOffline = getIsOffline();

    type PartialReport = {
        lastReadTime: Report['lastReadTime'] | null;
    };
    const optimisticReports: Record<string, PartialReport> = {};
    const failureReports: Record<string, PartialReport> = {};
    const reportIDList: string[] = [];
    // Chats the user marked unread, whose manual "New" line anchor this mark-all clears.
    const reportKeysWithManualUnreadAnchor: Array<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`> = [];
    // Tells open chats how far they are read now, so their "New" line goes away (see useUnreadMarker).
    const readUpToTimes: Record<string, string> = {};
    const reportsToMark = reportIDs ? reportIDs.map((reportID) => allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]) : Object.values(allReports ?? {});
    for (const report of reportsToMark) {
        if (!report) {
            continue;
        }

        const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`];
        const oneTransactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`], isOffline);
        const oneTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`];
        const isReportArchived = isArchivedReport(reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]);
        if (!isUnread(report, oneTransactionThreadReport, isReportArchived, reportAttributesDerived?.[report.reportID]?.isEmpty)) {
            // Already read, e.g. the chat that is open right now. Nothing to write, but its "New" line can still be
            // showing, so pass the time it's read up to without adding a new client time.
            const readUpToTime = [report.lastReadTime ?? '', report.lastVisibleActionCreated ?? ''].reduce((latest, time) => (time > latest ? time : latest));
            if (readUpToTime) {
                readUpToTimes[report.reportID] = readUpToTime;
            }
            continue;
        }

        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}` as const;
        optimisticReports[reportKey] = {lastReadTime: newLastReadTime};
        failureReports[reportKey] = {lastReadTime: report.lastReadTime ?? null};
        if (report.manuallyMarkedUnreadReportActionID) {
            reportKeysWithManualUnreadAnchor.push(reportKey);
        }
        reportIDList.push(report.reportID);
        readUpToTimes[report.reportID] = newLastReadTime;
    }

    DeviceEventEmitter.emit(CONST.EVENTS.MARK_ALL_AS_READ, readUpToTimes);

    if (reportIDList.length === 0) {
        return;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT,
            value: optimisticReports,
        },
        // A chat the user marked unread keeps its "New" line on that action until the anchor is cleared, and mark all
        // reads it. Like openReport, the anchor is not restored on failure, which would resurrect a marker the user
        // moved past.
        ...reportKeysWithManualUnreadAnchor.map((key) => ({
            onyxMethod: Onyx.METHOD.MERGE,
            key,
            value: {manuallyMarkedUnreadReportActionID: null},
        })),
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
        lastReadTime: newLastReadTime,
    };

    API.write(WRITE_COMMANDS.MARK_ALL_MESSAGES_AS_READ, parameters, {optimisticData, failureData});
}

export default markAllMessagesAsRead;
