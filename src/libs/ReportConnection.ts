import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import * as PriorityModeActions from './actions/PriorityMode';
import * as ReportHelperActions from './actions/Report';

// Dynamic Import to avoid circular dependency
const UnreadIndicatorUpdaterHelper = () => import('./UnreadIndicatorUpdater');

const reportIDToNameMap: Record<string, string> = {};
let allReports: OnyxCollection<Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
        UnreadIndicatorUpdaterHelper().then((module) => {
            module.triggerUnreadUpdate();
        });
        // Each time a new report is added we will check to see if the user should be switched
        PriorityModeActions.autoSwitchToFocusMode();

        if (!value) {
            return;
        }
        Object.values(value).forEach((report) => {
            if (!report) {
                return;
            }
            reportIDToNameMap[report.reportID] = report.reportName ?? report.displayName ?? report.reportID;
            ReportHelperActions.handleReportChanged(report);
        });
    },
});

function getAllReports() {
    return allReports;
}

function getAllReportsNameMap() {
    return reportIDToNameMap;
}

export {getAllReports, getAllReportsNameMap};
