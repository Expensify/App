const {APP_PACKAGE} = require('../config');
const execAsync = require('./execAsync');

const APP_PATH_FROM_ROOT = 'android/app/build/outputs/apk/e2eRelease/app-e2eRelease.apk';

/**
 * Installs the app on the currently connected device for the given platform.
 * It removes the app first if it already exists, so it's a clean installation.
 * @param {string} platform
 * @returns {Promise<void>}
 */
module.exports = function (platform = 'android') {
    if (platform !== 'android') {
        throw new Error(`installApp() missing implementation for platform: ${platform}`);
    }

    // Uninstall first, then install
    return execAsync(`adb uninstall ${APP_PACKAGE}`).finally(() => execAsync(`adb install ${APP_PATH_FROM_ROOT}`));
};
