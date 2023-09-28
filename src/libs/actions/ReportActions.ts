import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import * as ReportActionUtils from '../ReportActionsUtils';
import * as IOU from './IOU';
import * as ReportUtils from '../ReportUtils';
import ReportAction from '../../types/onyx/ReportAction';

function clearReportActionErrors(reportID: string, reportAction: ReportAction) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);

    if (!reportAction.reportActionID) {
        return;
    }

    if (reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        // Delete the optimistic action
        // The following doesn't delete the iouAction because Onyx currently doesn't delete keys when they are set to null
        // Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
        //     [reportAction.reportActionID]: null,
        // });
        // So we have to do this ugly work around for now
        // It's also very important to spread the report actions, which creates a copy so that Onyx.set will detect a change and actually make an update
        const allIOUActions = {...ReportActionUtils.getAllReportActions(originalReportID)};
        delete allIOUActions[reportAction.reportActionID];
        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, allIOUActions);

        // If there's a linked transaction, delete that too
        const linkedTransactionID = ReportActionUtils.getLinkedTransactionID(originalReportID, reportAction.reportActionID);
        if (linkedTransactionID) {
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${linkedTransactionID}`, null);
        }
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
        [reportAction.reportActionID]: {
            errors: null,
        },
    });
}

export {
    // eslint-disable-next-line import/prefer-default-export
    clearReportActionErrors,
};
