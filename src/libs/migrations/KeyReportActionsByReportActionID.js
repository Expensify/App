import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Log from '../Log';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * This migration updates reportActions data to be keyed by reportActionID rather than by sequenceNumber.
 *
 * @returns {Promise}
 */
export default function () {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            waitForCollectionCallback: true,
            callback: (allReportActions) => {
                Onyx.disconnect(connectionID);
                const newReportActions = {};

                for (let i = 0; i < Object.entries(allReportActions).length; i++) {
                    const [onyxKey, reportActionsForReport] = Object.entries(allReportActions)[i];
                    const newReportActionsForReport = {};
                    for (let j = 0; j < Object.entries(reportActionsForReport).length; j++) {
                        const [reportActionKey, reportAction] = Object.entries(reportActionsForReport)[j];

                        // If we find a reportAction that's already keyed by reportActionID instead of sequenceNumber,
                        // then we assume the migration already happened and return early.
                        if (reportActionKey === reportAction.reportActionID && reportActionKey !== reportAction.sequenceNumber) {
                            Log.info('[Migrate Onyx] Skipped migration KeyReportActionsByReportActionID');
                            return resolve();
                        }

                        // Move it to be keyed by reportActionID instead
                        newReportActionsForReport[reportAction.reportActionID] = reportAction;
                    }
                    newReportActions[onyxKey] = newReportActionsForReport;
                }

                Log.info(`[Migrate Onyx] Re-keying reportActions by reportActionID for ${_.keys(newReportActions).length} reports`);
                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.multiSet(newReportActions)
                    .then(resolve);
            },
        });
    });
}
