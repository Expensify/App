import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import * as API from '@libs/API';

/**
 * Marks all reports as read.
 */
function markAllAsRead() {
    // Ensure we are only acting on valid reports that have unread status
    const reports = Onyx.get(ONYXKEYS.COLLECTION.REPORT) || {};
    const unreadReports = Object.values(reports).filter((report) => report?.unreadActionCount > 0);

    if (unreadReports.length === 0) {
        return;
    }

    // Optimistically update the UI to clear unread markers
    const optimisticData = unreadReports.map((report) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
        value: {unreadActionCount: 0, lastReadTime: new Date().toISOString()},
    }));

    API.write('MarkAllAsRead', {reports: unreadReports.map((r) => r.reportID)}, {optimisticData});
}

export {
    markAllAsRead,
};