const UPDATE_INTERVAL = 1000 * 60 * 60 * 8;

type PlatformSpecificUpdater = {
    update: () => void;
    init?: () => void;
};

function checkForUpdates(platformSpecificUpdater: PlatformSpecificUpdater) {
    if (typeof platformSpecificUpdater.init === 'function') {
        platformSpecificUpdater.init();
    }

    // Check for updates every hour
    setInterval(() => {
        platformSpecificUpdater.update();
    }, UPDATE_INTERVAL);
}

module.exports = checkForUpdates;
