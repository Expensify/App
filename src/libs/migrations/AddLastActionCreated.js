import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Log from '../Log';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * This migration adds lastActionCreated to all reports in Onyx, using the value of lastMessageTimestamp
 *
 * @returns {Promise}
 */
export default function() {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT,
            waitForCollectionCallbacks: true,
            callback: (allReports) => {
                Onyx.disconnect(connectionID);
                Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, _.map(allReports, (report) => {
                    if (_.has(report, 'lastActionCreated')) {
                        return report;
                    }

                    if (!_.has(report, 'lastMessageTimestamp')) {
                        return report;
                    }

                    report.lastActionCreated = new Date(report.lastMessageTimestamp)
                        .toISOString()
                        .replace('T', ' ')
                        .replace('Z', '');
                    return report;
                }));
            },
        });
        return resolve();
    })
}
