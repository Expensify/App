const {APP_PACKAGE} = require('../config');
const execAsync = require('./execAsync');

const APP_PATH_FROM_ROOT = 'android/app/build/outputs/apk/e2eRelease/app-e2eRelease.apk';

/**
 * Installs the app on the currently connected device for the given platform.
 * It removes the app first if it already exists, so it's a clean installation.
 * @param {string} platform
 */
// eslint-disable-next-line @lwc/lwc/no-async-await
module.exports = async function (platform = 'android') {
    if (platform !== 'android') {
        throw new Error(`installApp() missing implementation for platform: ${platform}`);
    }

    // uninstall first, then install
    try {
        await execAsync(`adb uninstall ${APP_PACKAGE}`);
    } catch (e) {
        // ignored, the app might not be installed, which causes issues on some devices
    }
    return execAsync(`adb install ${APP_PATH_FROM_ROOT}`);
};
