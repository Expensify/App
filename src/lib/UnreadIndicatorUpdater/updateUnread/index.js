import ELECTRON_EVENTS from '../../../../desktop/ELECTRON_EVENTS';

// We conditionally import the ipcRenderer here so that we can
// communicate with the main Electron process in main.js
const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;

/**
 * Web browsers have a tab title and favicon which can be updated to show there are unread comments
 */
import CONFIG from '../../../CONFIG';

function updateUnread() {
    const hasUnread = totalCount > 0;
    document.title = hasUnread ? `(NEW!) ${CONFIG.SITE_TITLE}` : CONFIG.SITE_TITLE;
    document.getElementById('favicon').href = hasUnread ? CONFIG.FAVICON.UNREAD : CONFIG.FAVICON.DEFAULT;

    if (ipcRenderer) {
        // Ask the main Electron process to update our
        // badge count in the Mac OS dock icon
        ipcRenderer.send(ELECTRON_EVENTS.REQUEST_UPDATE_BADGE_COUNT, totalCount);
    }
}

export default updateUnread;
