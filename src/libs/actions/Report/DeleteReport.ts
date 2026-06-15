import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import Log from '@libs/Log';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

// We use connectWithoutView because deleteReport doesn't affect the UI rendering
// and this avoids unnecessary re-rendering because we recursively delete the report and its children
// which requires us to subscribe to the whole report and report actions collection.
let allReports: OnyxCollection<Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

let allReportActions: OnyxCollection<ReportActions>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (value) => (allReportActions = value),
});

/** Deletes a report, along with its reportActions, any linked reports, and any linked IOU report. */
function deleteReport(reportID: string | undefined, shouldDeleteChildReports = false) {
    if (!reportID) {
        Log.warn('[Report] deleteReport called with no reportID');
        return;
    }
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const onyxData: Record<string, null> = {
        [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: null,
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]: null,
    };

    // Delete linked transactions
    const reportActionsForReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];

    const transactionIDs = Object.values(reportActionsForReport ?? {})
        .filter((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => isMoneyRequestAction(reportAction))
        .map((reportAction) => getOriginalMessage(reportAction)?.IOUTransactionID);

    for (const transactionID of [...new Set(transactionIDs)]) {
        onyxData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = null;
    }

    Onyx.multiSet(onyxData);

    if (shouldDeleteChildReports) {
        for (const reportAction of Object.values(reportActionsForReport ?? {})) {
            if (!reportAction.childReportID) {
                continue;
            }
            deleteReport(reportAction.childReportID, shouldDeleteChildReports);
        }
    }

    // Delete linked IOU report
    if (report?.iouReportID) {
        deleteReport(report.iouReportID, shouldDeleteChildReports);
    }
}

export default deleteReport;
