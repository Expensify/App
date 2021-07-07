import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import updateUnread from './updateUnread';

// Stash the unread action counts for each report
const unreadActionCounts = {};

/**
 * Updates the title and favicon of the current browser tab
 * and Mac OS or iOS dock icon with an unread indicator.
 */
const throttledUpdatePageTitleAndUnreadCount = _.throttle(() => {
    // If all of our nonzero unread action counts show -1, update the unread count to be -1 as well so we don't show a
    // number in the indicator badge.
    if (_.every(unreadActionCounts, count => count < 1) && _.some(unreadActionCounts, count => count === -1)) {
        updateUnread(-1);
        return;
    }

    const totalCount = _.reduce(unreadActionCounts, (total, reportCount) => total + Math.max(reportCount, 0), 0);
    updateUnread(totalCount);
}, 1000, {leading: false});

let connectionID;

/**
 * Bind to the report collection key and update
 * the title and unread count indicators
 */
function listenForReportChanges() {
    connectionID = Onyx.connect({
        key: ONYXKEYS.COLLECTION.REPORT,
        callback: (report) => {
            if (!report || !report.reportID) {
                return;
            }

            if (report.notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE) {
                return;
            }

            // An unreadActionCount of -1 signifies that we should show a badge icon with no number
            if (report.notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY
                && report.unreadActionCount > 0) {
                unreadActionCounts[report.reportID] = -1;
            } else {
                unreadActionCounts[report.reportID] = report.unreadActionCount || 0;
            }
            throttledUpdatePageTitleAndUnreadCount();
        },
    });
}

/**
 * Remove the subscription callback when we no longer need it.
 */
function stopListeningForReportChanges() {
    if (!connectionID) {
        return;
    }

    Onyx.disconnect(connectionID);
}

export default {
    listenForReportChanges,
    stopListeningForReportChanges,
};
