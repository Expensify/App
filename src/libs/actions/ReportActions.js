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

export {
    clearReportActionErrors,
    deleteOptimisticReportAction,
};
