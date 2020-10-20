const _ = require('underscore');

const UPDATE_INTERVAL = 1000 * 60 * 60;

/**
 * Check for updates every hour, and perform and platform-specific update if there is a network connection.
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
