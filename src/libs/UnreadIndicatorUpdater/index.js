import _ from 'underscore';
import Ion from 'react-ion';
import IONKEYS from '../../IONKEYS';
import updateUnread from './updateUnread';

// Stash the unread action counts for each report
const unreadActionCounts = {};

/**
 * Updates the title and favicon of the current browser tab
 * and Mac OS or iOS dock icon with an unread indicator.
 */
const throttledUpdatePageTitleAndUnreadCount = _.throttle(() => {
    const totalCount = _.reduce(unreadActionCounts, (total, reportCount) => total + reportCount, 0);
    updateUnread(totalCount);
}, 1000, {leading: false});

let connectionID;

/**
 * Bind to the report collection key and update
 * the title and unread count indicators
 */
function listenForReportChanges() {
    connectionID = Ion.connect({
        key: IONKEYS.COLLECTION.REPORT,
        callback: (report) => {
            if (!report || !report.reportID) {
                return;
            }

            unreadActionCounts[report.reportID] = report.unreadActionCount || 0;
            throttledUpdatePageTitleAndUnreadCount();
        }
    });
}

/**
 * Remove the subscription callback when we no longer need it.
 */
function stopListeningForReportChanges() {
    if (!connectionID) {
        return;
    }

    Ion.disconnect(connectionID);
}

export default {
    listenForReportChanges,
    stopListeningForReportChanges,
};
