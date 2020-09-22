import _ from 'underscore';
import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';
import ELECTRON_EVENTS from '../../../desktop/ELECTRON_EVENTS';

/**
 * Web browsers have a tab title and favicon which can be updated to show there are unread comments
 */
import CONFIG from '../../CONFIG';

// We conditionally import the ipcRenderer here so that we can
// communicate with the main Electron process in main.js
const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;

// Stash the unread action counts for each report
const unreadActionCounts = {};

/**
 * Updates the title and favicon of the current browser tab
 * and Mac OS dock icon with an unread indicator.
 */
const throttledUpdatePageTitleAndUnreadCount = _.throttle(() => {
    const totalCount = _.reduce(unreadActionCounts, (total, reportCount) => total + reportCount, 0);
    const hasUnread = totalCount > 0;
    document.title = hasUnread ? `(NEW!) ${CONFIG.SITE_TITLE}` : CONFIG.SITE_TITLE;
    document.getElementById('favicon').href = hasUnread ? CONFIG.FAVICON.UNREAD : CONFIG.FAVICON.DEFAULT;

    if (ipcRenderer) {
        // Ask the main Electron process to update our
        // badge count in the Mac OS dock icon
        ipcRenderer.send(ELECTRON_EVENTS.REQUEST_UPDATE_BADGE_COUNT, totalCount);
    }
}, 1000, {leading: false});

let connectionID;

/**
 * Bind to the report collection key and update
 * the title and unread count indicators
 */
function init() {
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
function destroy() {
    Ion.disconnect(connectionID);
}

export default {
    init,
    destroy,
};
