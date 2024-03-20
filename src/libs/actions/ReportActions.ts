import Onyx from 'react-native-onyx';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ReportAction from '@src/types/onyx/ReportAction';
import * as Report from './Report';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

function clearReportActionErrors(reportID: string, reportAction: ReportAction) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);

    if (!reportAction.reportActionID) {
        return;
    }

    if (reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || reportAction.isOptimisticAction) {
        // Delete the optimistic action
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
            [reportAction.reportActionID]: null,
        });

        // If there's a linked transaction, delete that too
        const linkedTransactionID = ReportActionUtils.getLinkedTransactionID(originalReportID ?? '', reportAction.reportActionID);
        if (linkedTransactionID) {
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${linkedTransactionID}`, null);
        }

        // Delete the failed task report too
        const taskReportID = reportAction.message?.[0]?.taskReportID;
        if (taskReportID && ReportActionUtils.isCreatedTaskReportAction(reportAction)) {
            Report.deleteReport(taskReportID);
        }
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
        [reportAction.reportActionID]: {
            errors: null,
        },
    });
}

function dismissActionableWhisper(reportID: string, reportActionID: string) {
    const params = {
        reportActionID,
    };

    API.write(WRITE_COMMANDS.DISMISS_ACTIONABLE_WHISPER, params);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    clearReportActionErrors,
    dismissActionableWhisper,
};
