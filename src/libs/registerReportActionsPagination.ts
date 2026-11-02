import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportNameValuePairs} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {READ_COMMANDS, WRITE_COMMANDS} from './API/types';
import {registerPaginationConfig} from './Middleware/Pagination';
import {getSortedReportActionsForDisplay} from './ReportActionsUtils';
import {isActionOfType} from './ReportActionTypeGuards';
import {canUserPerformWriteAction as canUserPerformWriteActionReportUtils} from './ReportUtils';

let paginationConfigReady: Promise<void> | undefined;

function registerReportActionsPagination(): Promise<void> {
    if (paginationConfigReady) {
        return paginationConfigReady;
    }

    let allReports: OnyxCollection<Report>;
    let allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
    const reportsSnapshot = Promise.withResolvers<void>();
    const reportNameValuePairsSnapshot = Promise.withResolvers<void>();

    // These snapshots are consumed by the pagination sort callback, which runs outside React.
    // connectWithoutView() is appropriate because the values are not bound to UI components.
    Onyx.connectWithoutView({
        key: ONYXKEYS.COLLECTION.REPORT,
        callback: (value) => {
            allReports = value;
            reportsSnapshot.resolve();
        },
    });
    Onyx.connectWithoutView({
        key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
        callback: (value) => {
            allReportNameValuePairs = value;
            reportNameValuePairsSnapshot.resolve();
        },
    });

    paginationConfigReady = registerPaginationConfig({
        initialCommand: WRITE_COMMANDS.OPEN_REPORT,
        previousCommand: READ_COMMANDS.GET_OLDER_ACTIONS,
        nextCommand: READ_COMMANDS.GET_NEWER_ACTIONS,
        resourceCollectionKey: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        pageCollectionKey: ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES,
        additionalReadyPromise: Promise.all([reportsSnapshot.promise, reportNameValuePairsSnapshot.promise]).then(() => undefined),
        sortItems: (reportActions, reportID) => {
            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            const reportNameValuePairs = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`];
            const isReportArchived = !!reportNameValuePairs?.private_isArchived;
            const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report, isReportArchived);
            // DEW routed actions only exist in the app, so the API can't use their IDs as pagination cursors.
            return getSortedReportActionsForDisplay(reportActions, canUserPerformWriteAction, true, undefined, reportID).filter(
                (reportAction) => !isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED),
            );
        },
        getItemID: (reportAction) => reportAction.reportActionID,
    });

    return paginationConfigReady;
}

export default registerReportActionsPagination;
