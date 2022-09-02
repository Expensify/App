import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import updateUnread from './updateUnread';
import * as ReportUtils from '../ReportUtils';

// Stash the reports
const reports = {};

/**
 * Updates the title and favicon of the current browser tab
 * and Mac OS or iOS dock icon with an unread indicator.
 */
const throttledUpdatePageTitleAndUnreadCount = _.throttle(() => {
    const totalCount = _.filter(reports, ReportUtils.isUnread).length;
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

            reports[report.reportID] = report;
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
    throttledUpdatePageTitleAndUnreadCount,
};
