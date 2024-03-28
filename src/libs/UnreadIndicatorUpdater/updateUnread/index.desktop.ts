import ELECTRON_EVENTS from '@desktop/ELECTRON_EVENTS';
import type UpdateUnread from './types';

/**
 * Set the badge on desktop
 *
 */
const updateUnread: UpdateUnread = (totalCount) => {
    // Ask the main Electron process to update our
    // badge count in the Mac OS dock icon
    window.electron.send(ELECTRON_EVENTS.REQUEST_UPDATE_BADGE_COUNT, totalCount);
};

export default updateUnread;
