import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {String} reportID
 * @param {String} reportActionID
 */
function deleteOptimisticReportAction(reportID, reportActionID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        [reportActionID]: null,
    });
}

/**
 * @param {String} reportID
 * @param {String} sequenceNumber
 */
function clearReportActionErrors(reportID, sequenceNumber) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        [sequenceNumber]: {
            errors: null,
        },
    });
}

export {
    clearReportActionErrors,
    deleteOptimisticReportAction,
};
