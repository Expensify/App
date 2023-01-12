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

                if (!allReportActions) {
                    Log.info('[Migrate Onyx] Skipped migration KeyReportActionsByReportActionID');
                    return resolve();
                }

                const newReportActions = {};
                _.each(allReportActions, (reportActionsForReport, onyxKey) => {
                    if (!reportActionsForReport) {
                        return;
                    }

                    const newReportActionsForReport = {};
                    _.each(reportActionsForReport, (reportAction, reportActionKey) => {
                        // If we find a reportAction that's already keyed by reportActionID instead of sequenceNumber,
                        // then we assume the migration already happened and return early.
                        if (!_.isNaN(Number(reportActionKey))
                            && Number(reportActionKey) === Number(reportAction.reportActionID)
                            && Number(reportActionKey) !== Number(reportAction.sequenceNumber)) {
                            Log.info('[Migrate Onyx] Skipped migration KeyReportActionsByReportActionID');
                            return resolve();
                        }

                        // Move it to be keyed by reportActionID instead
                        newReportActionsForReport[reportAction.reportActionID] = reportAction;
                    });

                    newReportActions[onyxKey] = newReportActionsForReport;
                });

                if (_.isEmpty(newReportActions)) {
                    Log.info('[Migrate Onyx] Skipped migration KeyReportActionsByReportActionID');
                    return resolve();
                }

                Log.info(`[Migrate Onyx] Re-keying reportActions by reportActionID for ${_.keys(newReportActions).length} reports`);
                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                return Onyx.multiSet(newReportActions)
                    .then(resolve);
            },
        });
    });
}
