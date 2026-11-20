import UnreadIndicatorUtils from '@libs/UnreadIndicatorUpdater';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions, ReportAttributesDerivedValue} from '@src/types/onyx';

/* eslint-disable @typescript-eslint/naming-convention -- account and report IDs are numeric keys */
import type {OnyxCollection} from 'react-native-onyx';

import {measureFunction} from 'reassure';

const CURRENT_USER_ACCOUNT_ID = 1;
const REPORT_COUNTS = [1000, 5000, 10000];

function getReport(index: number, lastVisibleActionCreated: string): Report {
    return {
        reportID: `${index}`,
        reportName: 'Chat',
        type: CONST.REPORT.TYPE.CHAT,
        participants: {
            [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
        },
        lastReadTime: '2024-01-02 00:00:00.000',
        lastVisibleActionCreated,
        lastActorAccountID: 2,
        lastMessageText: 'hi',
    };
}

function getActions(lastVisibleActionCreated: string): ReportActions {
    return {1: {reportActionID: '1', actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: lastVisibleActionCreated}};
}

/** Two snapshots that differ the way sending a message changes them: one report, its actions and a new attributes object */
function getSendSnapshots(reportCount: number) {
    const reports: NonNullable<OnyxCollection<Report>> = {};
    const reportActions: NonNullable<OnyxCollection<ReportActions>> = {};
    const reportAttributes: ReportAttributesDerivedValue['reports'] = {};
    for (let index = 1; index <= reportCount; index++) {
        // Every 50th report has a message newer than its last read time
        const lastVisibleActionCreated = index % 50 === 0 ? '2024-01-03 00:00:00.000' : '2024-01-01 00:00:00.000';
        reports[`${ONYXKEYS.COLLECTION.REPORT}${index}`] = getReport(index, lastVisibleActionCreated);
        reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${index}`] = getActions(lastVisibleActionCreated);
        reportAttributes[`${index}`] = {reportName: 'Chat', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}};
    }
    const sentReportID = '1';
    const sentAt = '2024-01-04 00:00:00.000';
    return [
        {reports, reportActions, reportAttributes},
        {
            reports: {...reports, [`${ONYXKEYS.COLLECTION.REPORT}${sentReportID}`]: getReport(1, sentAt)},
            reportActions: {...reportActions, [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${sentReportID}`]: getActions(sentAt)},
            reportAttributes: Object.fromEntries(Object.entries(reportAttributes).map(([reportID, attributes]) => [reportID, {...attributes}])),
        },
    ];
}

describe('UnreadIndicatorUpdater', () => {
    for (const reportCount of REPORT_COUNTS) {
        const snapshots = getSendSnapshots(reportCount);
        let snapshotIndex = 0;
        const getNextSnapshot = () => {
            snapshotIndex = (snapshotIndex + 1) % snapshots.length;
            return snapshots.at(snapshotIndex) ?? snapshots[0];
        };

        test(`[UnreadIndicatorUpdater] full check after a send with ${reportCount} reports`, async () => {
            await measureFunction(() => {
                const {reports, reportActions, reportAttributes} = getNextSnapshot();
                UnreadIndicatorUtils.getUnreadReportsForUnreadIndicator(reports, '1', undefined, {reportActions, reportAttributes, currentUserAccountID: CURRENT_USER_ACCOUNT_ID});
            });
        });

        test(`[UnreadIndicatorUpdater] changed reports check after a send with ${reportCount} reports`, async () => {
            const getUnreadReportIDs = UnreadIndicatorUtils.createUnreadReportsTracker();
            const {reports, reportActions, reportAttributes} = getNextSnapshot();
            getUnreadReportIDs(reports, '1', undefined, {reportActions, reportAttributes, currentUserAccountID: CURRENT_USER_ACCOUNT_ID});
            await measureFunction(() => {
                const next = getNextSnapshot();
                getUnreadReportIDs(next.reports, '1', undefined, {reportActions: next.reportActions, reportAttributes: next.reportAttributes, currentUserAccountID: CURRENT_USER_ACCOUNT_ID});
            });
        });
    }
});
