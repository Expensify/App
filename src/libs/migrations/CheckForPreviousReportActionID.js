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
 * This migration checks for the 'previousReportActionID' key in the first valid reportAction of a report in Onyx.
 * If the key is not found then all reportActions for all reports are removed from Onyx.
 *
 * @returns {Promise<void>}
 */
export default function () {
    return getReportActionsFromOnyx().then((allReportActions) => {
        if (_.isEmpty(allReportActions)) {
            Log.info(`[Migrate Onyx] Skipped migration CheckForPreviousReportActionID because there were no reportActions`);
            return;
        }

        let firstValidValue;
        _.some(_.values(allReportActions), (reportActions) =>
            _.some(_.values(reportActions), (reportActionData) => {
                if (_.has(reportActionData, 'reportActionID')) {
                    firstValidValue = reportActionData;
                    return true;
                }

                return false;
            }),
        );

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
            onyxData[onyxKey] = {};
        });

        return Onyx.multiSet(onyxData);
    });
}
