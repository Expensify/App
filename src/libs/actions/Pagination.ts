import fastMerge from 'expensify-common/lib/fastMerge';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as ReportActionsUtils from '@src/libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions, ReportActionsPages} from '@src/types/onyx';

let reportActionsPages: OnyxCollection<ReportActionsPages> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES,
    waitForCollectionCallback: true,
    callback: (pages) => (reportActionsPages = pages),
});

let allReportActions: OnyxCollection<ReportActions> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (value) => (allReportActions = value),
});

let allSortedReportActions: Map<string, ReportAction[]>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (reportActions) => {
        if (!reportActions) {
            return;
        }
        Object.entries(reportActions).forEach(([reportID, reportActionsForReport]) => {
            const sortedActions = ReportActionsUtils.getSortedReportActionsForDisplay(reportActionsForReport);
            allSortedReportActions.set(reportID, sortedActions);
        });
    },
});

function trackReportActions(reportID: string, reportActions: OnyxCollection<ReportAction>, pageStart: string, pageEnd: string) {
    const currentReportActionsForReport = allReportActions?.[reportID] ?? {};
    const mergedReportActions = fastMerge<Record<string, ReportAction | null>>(currentReportActionsForReport, reportActions ?? {}, true) as ReportActions;
    const sortedReportActions = ReportActionsUtils.getSortedReportActionsForDisplay(mergedReportActions);
    const reportActionIDToIndex = new Map<string, number>();
    for (let i = 0; i < sortedReportActions.length; i++) {
        const reportAction = sortedReportActions[i];
        reportActionIDToIndex.set(reportAction.reportActionID, i);
    }

    const allIntervals = reportActionsPages?.[reportID] ?? [];
    allIntervals.push([pageStart, pageEnd]);

    const currentStart = null;
    const currentEnd = null;
    for (let i = 0; i < sortedReportActions.length; i++) {
        const reportAction = sortedReportActions[i];
        for (const [start, end] of allIntervals) {
            if (reportAction.reportActionID === start) {
            } else {
            }
        }
    }

    // const currentPagesForReportWithoutGaps = currentPagesForReport.filter((page): page is [string, string] => Array.isArray(page));
    // // TODO: handle missing ID on page start or end edge case
    // const intervals = currentPagesForReportWithoutGaps.map(([startID, endID]) => [reportActionIDToIndex.get(startID)!, reportActionIDToIndex.get(endID)!]);
    // intervals.push([reportActionIDToIndex.get(pageStart)!, reportActionIDToIndex.get(pageEnd)!]);
    //
    // // Sort intervals based on start index
    // intervals.sort((a, b) => a[0] - b[0]);
    //
    // const mergedIntervals = [];
    // let currentInterval = intervals[0];
    //
    // for (let i = 1; i < intervals.length; i++) {
    //     if (currentInterval[1] >= intervals[i][0] - 1) {
    //         // There is an overlap or they are contiguous
    //         currentInterval[1] = Math.max(currentInterval[1], intervals[i][1]);
    //     } else {
    //         // No overlap, push the current interval and move to the next
    //         mergedIntervals.push(currentInterval);
    //         currentInterval = intervals[i];
    //     }
    // }
    // // Push the last interval
    // mergedIntervals.push(currentInterval);
    //
    // // Convert the indexes back to IDs
    // const mergedIntervalsAsIDs = mergedIntervals.map(([startIndex, endIndex]) => [sortedReportActions[startIndex].reportActionID, sortedReportActions[endIndex].reportActionID]);
    // Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${reportID}`, mergedIntervalsAsIDs as ReportActionsPages);
}

function mergePagesWithGapDetection(
    sortedReportActions: ReportAction[],
    currentPages: ReportActionsPages,
    pageStart: string,
    pageEnd: string,
    isStartingInMiddle = false,
): ReportActionsPages {}

export default {trackReportActions, mergePagesWithGapDetection};
