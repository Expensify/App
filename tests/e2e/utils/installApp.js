const {APP_PACKAGE} = require('../config');
const execAsync = require('./execAsync');
const Logger = require('./logger');

/**
 * Installs the app on the currently connected device for the given platform.
 * It removes the app first if it already exists, so it's a clean installation.
 *
 * @param {String} platform
 * @param {String} path
 * @returns {Promise<void>}
 */
module.exports = function (platform = 'android', path) {
    if (platform !== 'android') {
        throw new Error(`installApp() missing implementation for platform: ${platform}`);
    }

    // Uninstall first, then install
    return execAsync(`adb uninstall ${APP_PACKAGE}`).catch((e) => {
        // Ignore errors
        Logger.warn('Failed to uninstall app:', e);
    }).finally(() => execAsync(`adb install ${path}`));
};
