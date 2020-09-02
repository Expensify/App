import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';
import {request} from '../Network';

// See if we should refresh the page every 30 minutes
const REFRESH_TIMEOUT = 1800000;

// TODO: create API command to fetch version.json (created during any webpack process, i.e. npm run build, npm run web
const COMMAND_GET_VERSION = '';

/**
 * Fetch the remote git hash, and compare it to the one stored in Ion.
 *
 * If they are the same, save the updated version in Ion.
 * Else, set app_shouldRefresh = true in Ion
 *
 * @param {String} localVersion
 */
const appShouldRefresh = (localVersion) => {
    request(COMMAND_GET_VERSION)
        .then((remoteVersion) => {
            if (localVersion !== remoteVersion) {
                Ion.set(IONKEYS.APP.SHOULD_REFRESH, true);
            }
        });
};

/**
 * 1) Initialize shouldRefresh to false
 * 2) Get the current version hash and save it.
 * 3) If the app's visibility changes or 30 minutes passes without it changing,  check if the app should refresh.
 */
const init = () => {
    Ion.set(IONKEYS.APP.SHOULD_REFRESH, false)
        .then(() => request(COMMAND_GET_VERSION)) // When the page first loads, get the current version hash
        .then((currentVersion) => {
            // Check periodically if we should refresh the app
            let timer = setInterval(() => appShouldRefresh(currentVersion), REFRESH_TIMEOUT);

            // Also check if the app's visibility changes
            window.addEventListener('visibilitychange', () => {
                // Reset timeout
                clearInterval(timer);
                timer = setInterval(() => appShouldRefresh(currentVersion), REFRESH_TIMEOUT);

                // Compare hashes and update Ion app_shouldRefresh
                appShouldRefresh(currentVersion);
            });
        });
};

export default init;
