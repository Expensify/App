const {execSync} = require('node:child_process');
const {APP_PACKAGE} = require('../../config');

const APP_PATH_FROM_ROOT = 'android/app/build/outputs/apk/e2eRelease/app-e2eRelease.apk';

/**
 * Installs the app on the currently connected device for the given platform.
 * It removes the app first if it already exists, so it's a clean installation.
 * @param {string} platform
 */
module.exports = function (platform = 'android') {
    if (platform !== 'android') {
        throw new Error(`installApp() missing implementation for platform: ${platform}`);
    }

    // uninstall first, then install
    try {
        execSync(`adb uninstall ${APP_PACKAGE}`);
    } catch (e) {
        // ignored, the app might not be installed, which causes issues on some devices
    }
    execSync(`adb install ${APP_PATH_FROM_ROOT}`);
};
