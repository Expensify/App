import {getAppUpdateURL} from '@libs/AppUpdateURL';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import pkg from '../../../../package.json';

// Many requests can get a 426 at once, and the Log command itself can get one. Only the first 426 should reload or alert.
let hasHandledUpdateRequired = false;

/**
 * Returns true only if a reload attempt for this bundle version was recorded. The stored version matching the running one means
 * the last reload didn't get a new bundle. A later deploy changes the version, so it gets its own reload.
 */
function markReloadAttempted(): boolean {
    try {
        if (sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.UPDATE_REQUIRED_RELOADED_VERSION) === pkg.version) {
            return false;
        }
        sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.UPDATE_REQUIRED_RELOADED_VERSION, pkg.version);
        return true;
    } catch {
        return false;
    }
}

/**
 * Web should always serve the latest version, so a 426 usually means the browser loaded an old bundle from its cache.
 * The app version is baked into the bundle, so the request can only be retried with a new bundle: reload from the network,
 * and show the Update Required screen if the same bundle version still gets a 426 afterwards.
 */
function alertUser() {
    if (hasHandledUpdateRequired) {
        return;
    }

    hasHandledUpdateRequired = true;

    if (markReloadAttempted()) {
        window.location.replace(getAppUpdateURL(window.location.href));
        return;
    }

    Log.alert('[UpdateRequired] Got a 426 on web after reloading', {appVersion: pkg.version});
    Onyx.set(ONYXKEYS.RAM_ONLY_UPDATE_REQUIRED, true);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    alertUser,
};
