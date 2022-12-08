const {APP_PACKAGE} = require('../config');
const execAsync = require('./execAsync');
const Logger = require('./logger');

const BASELINE_APP_PATH_FROM_ROOT = './app-e2eRelease-baseline.apk';
const COMPARE_APP_PATH_FROM_ROOT = './app-e2eRelease-compare.apk';

/**
 * Installs the app on the currently connected device for the given platform.
 * It removes the app first if it already exists, so it's a clean installation.
 *
 * @param {String} platform
 * @param {String} baselineOrCompare
 * @returns {Promise<void>}
 */
module.exports = function (platform = 'android', baselineOrCompare = 'baseline') {
    if (platform !== 'android') {
        throw new Error(`installApp() missing implementation for platform: ${platform}`);
    }

    const apk = baselineOrCompare === 'baseline' ? BASELINE_APP_PATH_FROM_ROOT : COMPARE_APP_PATH_FROM_ROOT;

    // Uninstall first, then install
    return execAsync(`adb uninstall ${APP_PACKAGE}`).catch((e) => {
        // Ignore errors
        Logger.warn('Failed to uninstall app:', e);
    }).finally(() => execAsync(`adb install ${apk}`));
};
