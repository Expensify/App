import _ from 'underscore';
import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';

/**
 * Web browsers have a tab title and favicon which can be updated to show there are unread comments
 */
import CONFIG from '../../CONFIG';

// We conditionally import the ipcRenderer here so that we can
// communicate with the main Electron process in main.js
const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;

const reportMap = {};

/**
 * Updates the title and favicon of the current browser tab
 * and Mac OS dock icon with an unread indicator.
 *
 * @param {boolean} hasUnread
 */

function updatePageTitleAndUnreadCount() {
    const totalCount = _.reduce(reportMap, (total, report) => total + ((report && report.unreadActionCount) || 0), 0);
    const hasUnread = totalCount > 0;
    document.title = hasUnread ? `(NEW!) ${CONFIG.SITE_TITLE}` : CONFIG.SITE_TITLE;
    document.getElementById('favicon').href = hasUnread ? CONFIG.FAVICON.UNREAD : CONFIG.FAVICON.DEFAULT;

    if (ipcRenderer) {
        // Ask the main Electron process to update our
        // badge count in the Mac OS dock icon
        ipcRenderer.send('request-update-badge-count', totalCount);
    }
}

Ion.connect({
    key: IONKEYS.COLLECTION.REPORT,
    callback: (report) => {
        if (!report || !report.reportID) {
            return;
        }

        reportMap[report.reportID] = report;
        updatePageTitleAndUnreadCount();
    }
});

export default {
    init: () => {},
};
