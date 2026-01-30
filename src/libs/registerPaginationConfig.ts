import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportNameValuePairs} from '@src/types/onyx';
import {READ_COMMANDS, WRITE_COMMANDS} from './API/types';
import {registerPaginationConfig} from './Middleware/Pagination';
import {getSortedReportActionsForDisplay} from './ReportActionsUtils';
import {canUserPerformWriteAction as canUserPerformWriteActionReportUtils} from './ReportUtils';

/**
 * This connection is exclusively used within the `registerPaginationConfig` function.
 * Using connectWithoutView() is appropriate here since these values are not directly
 * bound to any UI components.
 */
let allReports: OnyxCollection<Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

let allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
/**
 * This connection is exclusively used within the `registerPaginationConfig` function.
 * Using connectWithoutView() is appropriate here since these values are not directly
 * bound to any UI components.
 */
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReportNameValuePairs = value;
    },
});

registerPaginationConfig({
    initialCommand: WRITE_COMMANDS.OPEN_REPORT,
    previousCommand: READ_COMMANDS.GET_OLDER_ACTIONS,
    nextCommand: READ_COMMANDS.GET_NEWER_ACTIONS,
    resourceCollectionKey: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    pageCollectionKey: ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES,
    sortItems: (reportActions, reportID) => {
        const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
        const reportNameValuePairs = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`];
        const isReportArchived = !!reportNameValuePairs?.private_isArchived;
        const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report, isReportArchived);
        return getSortedReportActionsForDisplay(reportActions, canUserPerformWriteAction, true, undefined, reportID);
    },
    getItemID: (reportAction) => reportAction.reportActionID,
});
