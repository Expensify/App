import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';
import {request} from '../Network';

const EVENT_VISIBILITY_CHANGE = 'visibilitychange';

// See if we should refresh the page every 30 minutes
const REFRESH_TIMEOUT = 1800000;

// TODO: create API command to fetch version.json (created during any webpack process, i.e. npm run build, npm run web
const COMMAND_GET_VERSION = '';

/**
 * Get stored git hash, or if there is none then fetch the remote git hash and save it in Ion
 */
const getStoredVersionAsync = async () => {
    const storedVersion = await Ion.get(IONKEYS.APP_VERSION_HASH);
    if (!storedVersion) {
        // only get the remote version if there is no version locally stored
        const remoteVersion = await request(COMMAND_GET_VERSION);
        Ion.set(IONKEYS.APP_VERSION_HASH, remoteVersion);
    }
};

/**
 * Fetch the remote git hash, and compare it to the one stored in Ion.
 *
 * If they are the same, save the updated version in Ion.
 * Else, set app_shouldRefresh = true in Ion
 */
const appShouldRefreshAsync = async () => {
    const storedVersion = await Ion.get(IONKEYS.APP_VERSION_HASH);

    // If the app is offline, this request will hang indefinitely.
    // But that's okay, because it couldn't possibly refresh anyways.
    const remoteVersion = await request(COMMAND_GET_VERSION);

    if (storedVersion === remoteVersion) {
        if (!storedVersion) {
            await Ion.set(IONKEYS.APP_VERSION_HASH, remoteVersion);
        }
    } else {
        await Ion.set(IONKEYS.APP_SHOULD_REFRESH, true);
    }
};

/**
 * Resets the timer to periodically check if the app should refresh,
 * and checks the remote hash for changes.
 */
const checkShouldUpdateAndResetTimer = async () => {
    // Reset timeout
    const timer = Ion.get(IONKEYS.REFRESHER_TIMER);
    clearInterval(timer);
    setInterval(appShouldRefreshAsync, REFRESH_TIMEOUT);

    // Compare hashes and update Ion app_shouldRefresh
    appShouldRefreshAsync();
};

/**
 * 1) Initialize shouldRefresh to false
 * 2) Get the stored version hash, or if there is none saved, fetch remote hash and save it.
 * 3) If the app's visibility changes or 30 minutes passes without it changing,  check if the app should refresh.
 */
const init = async () => {
    Ion.set(IONKEYS.APP_SHOULD_REFRESH, false);

    // When the page first loads, get the current version hash
    getStoredVersionAsync();

    // Check periodically if we should refresh the app
    Ion.set(IONKEYS.REFRESHER_TIMER, setInterval(appShouldRefreshAsync, REFRESH_TIMEOUT));

    window.addEventListener(EVENT_VISIBILITY_CHANGE, checkShouldUpdateAndResetTimer);
};

export default init;
