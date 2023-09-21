import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import * as ReportActionUtils from '../ReportActionsUtils';
import * as IOU from './IOU';
import * as ReportUtils from '../ReportUtils';

/**
 * @param {String} reportID
 * @param {Object} reportAction
 */
function clearReportActionErrors(reportID, reportAction) {
    if (ReportActionUtils.isMoneyRequestAction(reportAction)) {
        IOU.cleanUpFailedMoneyRequest(reportAction);
    }
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
    console.log('originalReportID', originalReportID);

    if (reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        // Delete the optimistic action
        // The following doesn't delete the iouAction because Onyx currently doesn't delete nested keys when they are set to null
        // Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
        //     [reportAction.reportActionID]: null,
        // });
        // So we have to do this ugly work around for now
        const allIOUActions = ReportActionUtils.getAllReportActions(originalReportID);
        delete allIOUActions[reportAction.reportActionID];
        console.log('allIOUActions', allIOUActions);
        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, allIOUActions);

        // If there's a linked transaction, delete that too
        const linkedTransactionID = ReportActionUtils.getLinkedTransactionID(originalReportID, reportAction.reportActionID);
        if (linkedTransactionID) {
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${linkedTransactionID}`, null);
        }

        return;
    }

    console.log('merge from clearReportActionErrors');
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
