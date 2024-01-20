import type {ComputedKey} from 'react-native-onyx';
import {getMostRecentIOURequestActionID, getSortedReportActionsForDisplay, getSortedReportActionsV2} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';

function getSortedReportActionsKey(reportID: string): ComputedKey<{reportActions: ReportActions}, ReportAction[]> {
    return {
        cacheKey: `${ONYXKEYS.COMPUTED.SORTED_REPORT_ACTIONS}${reportID}`,
        dependencies: {reportActions: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`},
        compute: ({reportActions}) => getSortedReportActionsV2(reportActions),
    };
}

function getSortedReportActionsForDisplayKey(reportID: string): ComputedKey<{sortedReportActions: ReportAction[]}, ReportAction[]> {
    return {
        cacheKey: `${ONYXKEYS.COMPUTED.SORTED_REPORT_ACTIONS_FOR_DISPLAY}${reportID}`,
        dependencies: {sortedReportActions: getSortedReportActionsKey(reportID)},
        compute: ({sortedReportActions}) => getSortedReportActionsForDisplay(sortedReportActions),
    };
}

function getMostRecentIOURequestActionIDKey(reportID: string): ComputedKey<{sortedReportActions: ReportAction[]}, string | null> {
    return {
        cacheKey: `${ONYXKEYS.COMPUTED.MOST_RECENT_IOU_REQUEST_ACTION_ID}${reportID}`,
        dependencies: {sortedReportActions: getSortedReportActionsKey(reportID)},
        compute: ({sortedReportActions}: {sortedReportActions: ReportAction[]}) => getMostRecentIOURequestActionID(sortedReportActions),
    };
}

export {getMostRecentIOURequestActionIDKey, getSortedReportActionsForDisplayKey, getSortedReportActionsKey};
