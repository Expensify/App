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

/**
 * This method clears the errors for a chat where send money action was done
 * @param {String} chatReportID
 * @param {String} reportActionID
 */
function clearSendMoneyErrors(chatReportID, reportActionID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
        [reportActionID]: {
            errors: null,
        },
    });
}

export {
    clearReportActionErrors,
    deleteOptimisticReportAction,
    clearSendMoneyErrors,
};
