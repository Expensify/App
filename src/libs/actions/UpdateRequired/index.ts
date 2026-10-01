import clearWorkboxRecoveryCaches from '@libs/clearWorkboxRecoveryCaches';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

// Several requests can get a 426 at once, only the first one should trigger the reload.
let isReloading = false;

/**
 * Returns true only if this is the first reload attempt in the tab and it was recorded. When sessionStorage is unusable
 * the attempt can't be counted, so reloading could loop forever and the caller must show the Update Required screen instead.
 */
function markReloadAttempted(): boolean {
    try {
        if (sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.UPDATE_REQUIRED_RELOADED)) {
            return false;
        }
        sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.UPDATE_REQUIRED_RELOADED, 'true');
        return true;
    } catch {
        return false;
    }
}

/**
 * Web should always serve the latest version, so a 426 usually means the browser loaded an old bundle from its cache.
 * The app version is baked into the bundle, so the request can only be retried with a new bundle: clear the caches and reload once per tab,
 * and show the Update Required screen if the app still gets a 426 afterwards.
 */
function alertUser() {
    if (isReloading) {
        return;
    }

    if (markReloadAttempted()) {
        isReloading = true;
        clearWorkboxRecoveryCaches().then(() => window.location.reload());
        return;
    }

    Log.alert('[UpdateRequired] Got a 426 on web after clearing the cache and reloading');
    Onyx.set(ONYXKEYS.RAM_ONLY_UPDATE_REQUIRED, true);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    alertUser,
};
