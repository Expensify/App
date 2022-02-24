const _ = require('underscore');

const UPDATE_INTERVAL = 1000 * 60 * 60 * 8;

/**
 * Check for updates every 8 hours and perform and platform-specific update
 *
 * @param {Object} platformSpecificUpdater
 * @param {Function} platformSpecificUpdater.update
 * @param {Function} [platformSpecificUpdater.init]
 */
function checkForUpdates(platformSpecificUpdater) {
    if (_.isFunction(platformSpecificUpdater.init)) {
        platformSpecificUpdater.init();
    }

    // Check for updates every hour
    setInterval(() => {
        platformSpecificUpdater.update();
    }, UPDATE_INTERVAL);
}

module.exports = checkForUpdates;
