import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {getLinkedTransactionID, getReportAction, getReportActionMessage, isCreatedTaskReportAction} from '@libs/ReportActionsUtils';
import {getOriginalReportID} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import {deleteReport} from './Report';

type IgnoreDirection = 'parent' | 'child';

let allReportActions: OnyxCollection<OnyxTypes.ReportActions>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (value) => (allReportActions = value),
});

let allReports: OnyxCollection<OnyxTypes.Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

function clearReportActionErrors(reportID: string, reportAction: ReportAction, keys?: string[]) {
    const originalReportID = getOriginalReportID(reportID, reportAction);

    if (!reportAction?.reportActionID) {
        return;
    }

    if (reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || reportAction.isOptimisticAction) {
        // If there's a linked transaction, delete that too
        const linkedTransactionID = getLinkedTransactionID(reportAction);
        if (linkedTransactionID) {
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${linkedTransactionID}`, null);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportAction.childReportID}`, null);
        }

        // Delete the optimistic action
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
            [reportAction.reportActionID]: null,
        });

        // Delete the failed task report too
        const taskReportID = getReportActionMessage(reportAction)?.taskReportID;
        if (taskReportID && isCreatedTaskReportAction(reportAction)) {
            deleteReport(taskReportID);
        }
        return;
    }

    if (keys) {
        const errors: Record<string, null> = {};

        for (const key of keys) {
            errors[key] = null;
        }

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
function clearAllRelatedReportActionErrors(reportID: string | undefined, reportAction: ReportAction | null | undefined, ignore?: IgnoreDirection, keys?: string[]) {
    const errorKeys = keys ?? Object.keys(reportAction?.errors ?? {});
    if (!reportAction || errorKeys.length === 0 || !reportID) {
        return;
    }

    clearReportActionErrors(reportID, reportAction, keys);

    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (report?.parentReportID && report?.parentReportActionID && ignore !== 'parent') {
        const parentReportAction = getReportAction(report.parentReportID, report.parentReportActionID);
        const parentErrorKeys = Object.keys(parentReportAction?.errors ?? {}).filter((err) => errorKeys.includes(err));

        clearAllRelatedReportActionErrors(report.parentReportID, parentReportAction, 'child', parentErrorKeys);
    }

    if (reportAction.childReportID && ignore !== 'child') {
        const childActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAction.childReportID}`] ?? {};
        for (const action of Object.values(childActions)) {
            const childErrorKeys = Object.keys(action.errors ?? {}).filter((err) => errorKeys.includes(err));
            clearAllRelatedReportActionErrors(reportAction.childReportID, action, 'parent', childErrorKeys);
        }
    }
}

export type {IgnoreDirection};
export {
    // eslint-disable-next-line import/prefer-default-export
    clearAllRelatedReportActionErrors,
};
