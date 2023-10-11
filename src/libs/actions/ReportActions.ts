import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import * as ReportActionUtils from '../ReportActionsUtils';
import * as ReportUtils from '../ReportUtils';
import ReportAction from '../../types/onyx/ReportAction';

function clearReportActionErrors(reportID: string, reportAction: ReportAction) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);

    if (!reportAction.reportActionID) {
        return;
    }

    if (reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
            [reportAction.reportActionID]: null,
        });

        // If the reportAction is linked to a different report, delete it from that report too
        if (reportAction?.reportID !== originalReportID) {
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAction.reportID}`, {
                [reportAction.reportActionID]: null,
            });
        }

        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`, {
            errorFields: null,
        });

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
