import type PlatformSpecificUpdater from '@src/setup/platformSetup/types';

const UPDATE_INTERVAL = 1000 * 60 * 60 * 8;

function checkForUpdates(platformSpecificUpdater: PlatformSpecificUpdater) {
    if (typeof platformSpecificUpdater.init === 'function') {
        platformSpecificUpdater.init();
    }

    // Check for updates every hour
    setInterval(() => {
        platformSpecificUpdater.update();
    }, UPDATE_INTERVAL);
}

export default checkForUpdates;
