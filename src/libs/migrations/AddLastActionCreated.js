import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Log from '../Log';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * This migration adds lastActionCreated to all reports in Onyx, using the value of lastMessageTimestamp
 *
 * @returns {Promise}
 */
export default function () {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT,
            waitForCollectionCallback: true,
            callback: (allReports) => {
                Onyx.disconnect(connectionID);
                const reportsToUpdate = {};
                _.each(allReports, (report, key) => {
                    if (_.has(report, 'lastActionCreated')) {
                        return;
                    }

                    if (!_.has(report, 'lastMessageTimestamp')) {
                        return;
                    }

                    reportsToUpdate[key] = report;
                    reportsToUpdate[key].lastActionCreated = new Date(report.lastMessageTimestamp)
                        .toISOString()
                        .replace('T', ' ')
                        .replace('Z', '');
                });

                if (_.isEmpty(reportsToUpdate)) {
                    Log.info('[Migrate Onyx] Skipped migration AddLastActionCreated');
                    return resolve();
                } else {
                    Log.info(`[Migrate Onyx] Adding lastActionCreated field to ${_.keys(reportsToUpdate).length} reports`);
                    // eslint-disable-next-line rulesdir/prefer-actions-set-data
                    return Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, reportsToUpdate)
                        .then(resolve);
                }
            },
        });
    });
}
