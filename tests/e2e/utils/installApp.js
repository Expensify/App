import execAsync from './execAsync';
import * as Logger from './logger';

/**
 * Installs the app on the currently connected device for the given platform.
 * It removes the app first if it already exists, so it's a clean installation.
 *
 * @param {String} platform
 * @param {String} packageName
 * @param {String} path
 * @returns {Promise<void>}
 */
// eslint-disable-next-line default-param-last
export default function (platform = 'android', packageName, path) {
    if (platform !== 'android') {
        throw new Error(`installApp() missing implementation for platform: ${platform}`);
    }

    // Uninstall first, then install
    return execAsync(`adb uninstall ${packageName}`)
        .catch((e) => {
            // Ignore errors
            Logger.warn('Failed to uninstall app:', e);
        })
        .finally(() => execAsync(`adb install ${path}`));
}
