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
                    Log.info('[Migrate Onyx] Skipped migration KeyReportActionsByReportActionID because there were no reportActions');
                    return resolve();
                }

                const newReportActions = {};
                const allReportActionsEntires = Object.entries(allReportActions);
                for (let i = 0; i < allReportActionsEntires.length; i++) {
                    const [onyxKey, reportActionsForReport] = allReportActionsEntires[i];
                    if (reportActionsForReport) {
                        const newReportActionsForReport = {};
                        const reportActionsForReportEntries = Object.entries(reportActionsForReport);
                        for (let j = 0; j < reportActionsForReportEntries.length; j++) {
                            const [reportActionKey, reportAction] = reportActionsForReportEntries[j];
                            if (!_.isNaN(Number(reportActionKey))
                                && Number(reportActionKey) === Number(reportAction.reportActionID)
                                && Number(reportActionKey) !== Number(reportAction.sequenceNumber)) {
                                Log.info('[Migrate Onyx] Skipped migration KeyReportActionsByReportActionID');
                                return resolve();
                            }

                            // Move it to be keyed by reportActionID instead
                            newReportActionsForReport[reportAction.reportActionID] = reportAction;
                        }
                        newReportActions[onyxKey] = newReportActionsForReport;
                    }
                }

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
