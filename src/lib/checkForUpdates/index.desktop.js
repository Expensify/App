/**
 * This file is necessary because checkForUpdates needs to be imported by desktop/index.js
 * Since desktop/index.js is run by Electron directly (not bundled by Webpack),
 * and Electron doesn't yet support ES6 modules, we have to write this shim in CommonJS,
 * so that it can be `require`d by desktop.index.js.
 *
 * The good news is that this is temporary: Node 14 offers support for ES6 modules in CommonJS code,
 * so once Node 14 becomes LTS and is adopted by Electron, (likely in mid 2021),
 * we can remove this file and use its ES6 counterpart.
 *
 * We can track Electron's adoption of Node 14/ESM support in this GH issue:
 * https://github.com/electron/electron/issues/21457
 */

const _ = require('underscore');

const UPDATE_INTERVAL = 1000 * 60 * 60;

/**
 * Check for updates every hour, and perform and platform-specific update if there is a network connection.
 *
 * @param {Object} platformSpecificUpdater
 * @param {Function} platformSpecificUpdater.update
 * @param {?Function} platformSpecificUpdater.init
 */
function checkForUpdates(platformSpecificUpdater) {
    if (_.isFunction(platformSpecificUpdater.init)) {
        platformSpecificUpdater.init();
    }

    // Check for updates every hour
    setInterval(() => {
        // We only want to attempt updates if we're online
        platformSpecificUpdater.update();
    }, UPDATE_INTERVAL);
}

module.exports = checkForUpdates;
