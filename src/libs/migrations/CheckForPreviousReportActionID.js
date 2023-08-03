import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Log from '../Log';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @returns {Promise<Object>}
 */
function getReportActionsFromOnyx() {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            waitForCollectionCallback: true,
            callback: (allReportActions) => {
                Onyx.disconnect(connectionID);
                return resolve(allReportActions);
            },
        });
    });
}

/**
 * Checks if the input object is not null, empty or undefined.
 *
 * @param {Object} data
 * @returns {Boolean}
 */
function isValid(data) {
    return data !== null && !_.isEmpty(data) && !_.isUndefined(data);
}

/**
 * Migrate Onyx data for reportActions. If the first reportAction of a reportActionsForReport
 * does not contain a 'previousReportActionID', all reportActions for all reports are removed from Onyx.
 *
 * @returns {Promise<void>}
 */
export default function () {
    return getReportActionsFromOnyx().then((allReportActions) => {
        if (!isValid(allReportActions)) {
            Log.info(`[Migrate Onyx] Skipped migration CheckForPreviousReportActionID because there were no reportActions`);
            return;
        }

        const firstValidReportAction = _.find(_.values(allReportActions), (reportAction) => isValid(reportAction));
        const firstValidValue = _.find(_.values(firstValidReportAction), (reportActionData) => isValid(reportActionData));

        if (_.isUndefined(firstValidValue)) {
            Log.info(`[Migrate Onyx] Skipped migration CheckForPreviousReportActionID because there were no valid reportActions`);
            return;
        }

        if (_.has(firstValidValue, 'previousReportActionID')) {
            Log.info(`[Migrate Onyx] CheckForPreviousReportActionID Migration: previousReportActionID found. Migration complete`);
            return;
        }

        // If previousReportActionID not found:
        Log.info(`[Migrate Onyx] CheckForPreviousReportActionID Migration: removing all reportActions because previousReportActionID not found in the first valid reportAction`);

        const onyxData = {};
        _.each(allReportActions, (reportAction, onyxKey) => {
            if (!isValid(reportAction)) {
                return;
            }
            onyxData[onyxKey] = {};
        });

        return Onyx.multiSet(onyxData);
    });
}
