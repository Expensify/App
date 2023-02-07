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
 * @param {String} reportActionID
 */
function clearReportActionErrors(reportID, reportActionID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        [reportActionID]: {
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
