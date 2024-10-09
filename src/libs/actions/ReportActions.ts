import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import * as ReportConnection from '@libs/ReportConnection';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import * as Report from './Report';

type IgnoreDirection = 'parent' | 'child';

let allReportActions: OnyxCollection<ReportActions>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (value) => (allReportActions = value),
});

function clearReportActionErrors(reportID: string, reportAction: ReportAction, keys?: string[]) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);

    if (!reportAction?.reportActionID) {
        return;
    }

    if (reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || reportAction.isOptimisticAction) {
        // Delete the optimistic action
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
            [reportAction.reportActionID]: null,
        });

        // If there's a linked transaction, delete that too
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const linkedTransactionID = ReportActionUtils.getLinkedTransactionID(reportAction.reportActionID, originalReportID || '-1');
        if (linkedTransactionID) {
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${linkedTransactionID}`, null);
        }

        // Delete the failed task report too
        const taskReportID = ReportActionUtils.getReportActionMessage(reportAction)?.taskReportID;
        if (taskReportID && ReportActionUtils.isCreatedTaskReportAction(reportAction)) {
            Report.deleteReport(taskReportID);
        }
        return;
    }

    if (keys) {
        const errors: Record<string, null> = {};

        keys.forEach((key) => {
            errors[key] = null;
        });

        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
            [reportAction.reportActionID]: {
                errors,
            },
        });
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
        [reportAction.reportActionID]: {
            errors: null,
        },
    });
}

/**
 *
ignore: `undefined` means we want to check both parent and children report actions
ignore: `parent` or `child` means we want to ignore checking parent or child report actions because they've been previously checked
 */
function clearAllRelatedReportActionErrors(reportID: string, reportAction: ReportAction | null | undefined, ignore?: IgnoreDirection, keys?: string[]) {
    const errorKeys = keys ?? Object.keys(reportAction?.errors ?? {});
    if (!reportAction || errorKeys.length === 0) {
        return;
    }

    clearReportActionErrors(reportID, reportAction, keys);

    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (report?.parentReportID && report?.parentReportActionID && ignore !== 'parent') {
        const parentReportAction = ReportActionUtils.getReportAction(report.parentReportID, report.parentReportActionID);
        const parentErrorKeys = Object.keys(parentReportAction?.errors ?? {}).filter((err) => errorKeys.includes(err));

        clearAllRelatedReportActionErrors(report.parentReportID, parentReportAction, 'child', parentErrorKeys);
    }

    if (reportAction.childReportID && ignore !== 'child') {
        const childActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAction.childReportID}`] ?? {};
        Object.values(childActions).forEach((action) => {
            const childErrorKeys = Object.keys(action.errors ?? {}).filter((err) => errorKeys.includes(err));
            clearAllRelatedReportActionErrors(reportAction.childReportID, action, 'parent', childErrorKeys);
        });
    }
}

export {
    // eslint-disable-next-line import/prefer-default-export
    clearAllRelatedReportActionErrors,
};
