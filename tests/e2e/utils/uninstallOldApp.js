const execAsync = require('./execAsync');
const Logger = require('./logger');

/**
 * Installs the app on the currently connected device for the given platform.
 * It removes the app first if it already exists, so it's a clean installation.
 *
 * @param {String} platform
 * @param {String} packageName
 * @param {String} path
 * @returns {Promise<void>}
 */
module.exports = function (platform = 'android') {
    if (platform !== 'android') {
        throw new Error(`installApp() missing implementation for platform: ${platform}`);
    }

    // Uninstall first, then install
    return execAsync(`adb uninstall com.expensify.chat.adhoc`).catch((e) => {
        // Ignore errors
        Logger.warn('Failed to uninstall app:', e);
    });
};
