import _ from 'underscore';
import moment from 'moment';
import Onyx from 'react-native-onyx';
import {AppState} from 'react-native';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';

let authToken;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        authToken = lodashGet(val, 'authToken', null);
    },
});

let connectionID;
let currentToken;
let refreshTimeoutID;
const REFRESH_INTERVAL = 1000 * 60 * 25;

const setExpirationTimer = () => {
    console.debug('[MapboxToken] refreshing token on an interval', REFRESH_INTERVAL, 'ms');

    // Cancel any previous timeouts so that there is only one request to get a token at a time.
    clearTimeout(refreshTimeoutID);

    // Refresh the token every 25 minutes
    refreshTimeoutID = setTimeout(() => {
        // If the user has logged out while the timer was running, skip doing anything when this callback runs
        if (!authToken) {
            console.debug('[MapboxToken] Skipping the fetch of a new token because user signed out');
            return;
        }
        console.debug(`[MapboxToken] Fetching a new token after waiting ${REFRESH_INTERVAL / 1000 / 60} minutes`);
        API.read('GetMapboxAccessToken');
    }, REFRESH_INTERVAL);
};

const hasTokenExpired = () => moment().isAfter(currentToken.expiration);

const clearToken = () => {
    console.debug('[MapboxToken] Deleting the token stored in Onyx');

    // Use Onyx.set() to delete the key from Onyx, which will trigger a new token to be retrieved from the API.
    Onyx.set(ONYXKEYS.MAPBOX_ACCESS_TOKEN, null);
};

const init = () => {
    if (connectionID) {
        console.debug('[MapboxToken] init() is already listening to Onyx so returning early');
        return;
    }

    // When the token changes in Onyx, the expiration needs to be checked so a new token can be retrieved.
    connectionID = Onyx.connect({
        key: ONYXKEYS.MAPBOX_ACCESS_TOKEN,
        /**
         * @param {Object} token
         * @param {String} token.token
         * @param {String} token.expiration
         * @param {String[]} [token.errors]
         */
        callback: (token) => {
            // If the user has logged out, don't do anything and ignore changes to the access token
            if (!authToken) {
                console.debug('[MapboxToken] Ignoring changes to token because user signed out');
                return;
            }

            // If the token is falsy or an empty object, the token needs to be retrieved from the API.
            // The API sets a token in Onyx with a 30 minute expiration.
            if (_.isEmpty(token)) {
                console.debug('[MapboxToken] Token does not exist so fetching one');
                API.read('GetMapboxAccessToken');
                return;
            }

            // Store the token in a place where the AppState callback can also access it.
            currentToken = token;

            if (hasTokenExpired()) {
                console.debug('[MapboxToken] Token has expired after reading from Onyx');
                clearToken();
                return;
            }

            console.debug('[MapboxToken] Token is valid, setting up refresh');
            setExpirationTimer();
        },
    });

    AppState.addEventListener('change', (nextAppState) => {
        // Skip getting a new token if:
        // - The app state is not changing to active
        // - There is no current token (which means it's not been fetch yet for the first time)
        // - The token hasn't expired yet (this would just be a waste of an API call)
        // - There is no authToken (which means the user has logged out)
        if (nextAppState !== CONST.APP_STATE.ACTIVE || !currentToken || !hasTokenExpired() || !authToken) {
            return;
        }
        console.debug('[MapboxToken] Token is expired after app became active');
        clearToken();
    });
};

export default init;
