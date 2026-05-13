import type {NullishDeep, OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {getLinkedTransactionID, getReportAction, getReportActionMessage, isCreatedTaskReportAction, isRejectedAction} from '@libs/ReportActionsUtils';
import {getOriginalReportID} from '@libs/ReportUtils';
import {buildOptimisticSnapshotData} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';
import {deleteReport} from './Report';

type IgnoreDirection = 'parent' | 'child';

let allReportActions: OnyxCollection<OnyxTypes.ReportActions>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (value) => (allReportActions = value),
});

let allReports: OnyxCollection<OnyxTypes.Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

function clearReportActionErrors(reportAction: ReportAction, originalReportID: string | undefined, keys?: string[]) {
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
        const actionsToDelete: Record<string, null> = {[reportAction.reportActionID]: null};

        // Also clean up any orphaned optimistic reject actions (REJECTED/REJECTED_TO_SUBMITTER)
        // from the same report. When a rejection fails, the comment action gets the error but the
        // corresponding reject action remains with pendingAction ADD and no errors.
        const siblingActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`];
        if (siblingActions) {
            for (const [actionID, siblingAction] of Object.entries(siblingActions)) {
                if (
                    actionID !== reportAction.reportActionID &&
                    siblingAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD &&
                    isRejectedAction(siblingAction) &&
                    !siblingAction.errors
                ) {
                    actionsToDelete[actionID] = null;
                }
            }
        }

        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, actionsToDelete);

        // Delete the failed task report too
        const taskReportID = getReportActionMessage(reportAction)?.taskReportID;
        if (taskReportID && isCreatedTaskReportAction(reportAction)) {
            deleteReport(taskReportID);
        }

        // Clear the chat snapshot entries for the failed optimistic action(s) so they disappear from Reports > Chats.
        // Initializing as an empty typed object to allow dynamic key assignment resolves TypeScript type inference issue
        const snapshotDataToClear: NullishDeep<SearchResultDataType> = {};
        snapshotDataToClear[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`] = actionsToDelete;
        if (taskReportID && isCreatedTaskReportAction(reportAction)) {
            // If this is a failed optimistic task-create action, also remove the task report snapshot data so it disappears from Reports > Task when the user dismiss the error.
            snapshotDataToClear[`${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`] = null;
            snapshotDataToClear[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`] = null;
        }

        // Apply the same cleanup to snapshot hashes used by Reports > Chats and Reports > Task.
        for (const type of [CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.DATA_TYPES.TASK]) {
            const snapshotUpdate = buildOptimisticSnapshotData(type, snapshotDataToClear);
            if (!snapshotUpdate) {
                continue;
            }
            Onyx.merge(snapshotUpdate.key, snapshotUpdate.value as OnyxTypes.SearchResults);
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
function clearAllRelatedReportActionErrors(
    reportID: string | undefined,
    reportAction: ReportAction | null | undefined,
    originalReportID: string | undefined,
    ignore?: IgnoreDirection,
    keys?: string[],
) {
    const errorKeys = keys ?? Object.keys(reportAction?.errors ?? {});
    if (!reportAction || errorKeys.length === 0 || !reportID) {
        return;
    }

    clearReportActionErrors(reportAction, originalReportID, keys);

    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (report?.parentReportID && report?.parentReportActionID && ignore !== 'parent') {
        const parentReportAction = getReportAction(report.parentReportID, report.parentReportActionID);
        const parentErrorKeys = Object.keys(parentReportAction?.errors ?? {}).filter((err) => errorKeys.includes(err));
        const parentReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`] ?? {};
        const parentOriginalReportID = getOriginalReportID(report.parentReportID, parentReportAction, parentReportActions);

        clearAllRelatedReportActionErrors(report.parentReportID, parentReportAction, parentOriginalReportID, 'child', parentErrorKeys);
    }

    if (reportAction.childReportID && ignore !== 'child') {
        const childActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAction.childReportID}`] ?? {};
        for (const action of Object.values(childActions)) {
            const childErrorKeys = Object.keys(action.errors ?? {}).filter((err) => errorKeys.includes(err));
            const childOriginalReportID = getOriginalReportID(reportAction.childReportID, action, childActions);
            clearAllRelatedReportActionErrors(reportAction.childReportID, action, childOriginalReportID, 'parent', childErrorKeys);
        }
    }
}

export type {IgnoreDirection};
export {clearAllRelatedReportActionErrors};
