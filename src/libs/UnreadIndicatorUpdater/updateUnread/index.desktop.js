import ELECTRON_EVENTS from '../../../../desktop/ELECTRON_EVENTS';

/**
 * Set the badge on desktop
 *
 * @param {Number} totalCount
 */
function updateUnread(totalCount) {
    // Ask the main Electron process to update our
    // badge count in the Mac OS dock icon
    window.electronContextBridge.send(ELECTRON_EVENTS.REQUEST_UPDATE_BADGE_COUNT, totalCount);
}

export default updateUnread;
