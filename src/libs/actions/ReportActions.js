import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {String} reportID
 * @param {String} sequenceNumber
 */
function deleteOptimisticReportAction(reportID, sequenceNumber) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        [sequenceNumber]: null,
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
