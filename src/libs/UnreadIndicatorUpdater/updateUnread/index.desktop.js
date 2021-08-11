import ELECTRON_EVENTS from '../../../../desktop/ELECTRON_EVENTS';

const ipcRenderer = window.require('electron').ipcRenderer;

/**
 * Set the badge on desktop
 *
 * @param {Number} totalCount
 */
function updateUnread(totalCount) {
    console.debug('message count');
    // Ask the main Electron process to update our
    // badge count in the Mac OS dock icon
    ipcRenderer.send(ELECTRON_EVENTS.REQUEST_UPDATE_BADGE_COUNT, totalCount);
}

export default updateUnread;
