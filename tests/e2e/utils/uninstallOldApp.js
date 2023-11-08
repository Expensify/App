const execAsync = require('./execAsync');
const Logger = require('./logger');

/**
 * Uninstalls the old app version with a different identifier so new versions can be installed
 *
 * @param {String} platform
 * @returns {Promise<void>}
 */
module.exports = function (platform = 'android') {
    if (platform !== 'android') {
        throw new Error(`installApp() missing implementation for platform: ${platform}`);
    }

    return execAsync(`adb uninstall com.expensify.chat.adhoc`).catch((e) => {
        // Ignore errors
        Logger.warn('Failed to uninstall app:', e);
    });
};
