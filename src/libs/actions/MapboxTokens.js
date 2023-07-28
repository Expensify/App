import _ from 'underscore';
import moment from 'moment';
import Onyx from 'react-native-onyx';
import {AppState} from 'react-native';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';

let connectionID;
let currentToken;
let refreshTimeoutID;
const refreshInterval = 1000 * 60 * 25;

const refreshToken = () => {
    console.debug('[MapboxTokens] refreshing token every 25 minutes', refreshInterval);

    // Cancel any previous timeouts so that there is only one request to get a token at a time.
    clearTimeout(refreshTimeoutID);

    // Refresh the token every 25 minutes
    refreshTimeoutID = setTimeout(() => {
        console.debug('[MapboxTokens] Fetching a new token after waiting 25 minutes');
        API.read('GetMapboxAccessToken');
    }, refreshInterval);
};

const hasTokenExpired = () => {
    const now = moment();
    const expiration = moment(currentToken.expiration);
    const minutesUntilTokenExpires = expiration.diff(now, 'minutes');
    return minutesUntilTokenExpires < 0;
};

const clearToken = () => {
    console.debug('[MapboxTokens] Deleting the token stored in Onyx');

    // Use Onyx.set() to delete the key from Onyx, which will trigger a new token to be retrieved from the API.
    Onyx.set(ONYXKEYS.MAPBOX_ACCESS_TOKEN, null);
};

const init = () => {
    if (connectionID) {
        console.debug(`[MapboxTokens] init() is already listening to Onyx so returning early`);
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
            // token is an object with. If it is falsy or an empty object, the token needs to be retrieved from the API.
            // The API sets a token in Onyx with a 30 minute expiration.
            if (!token || _.size(token) === 0) {
                console.debug('[MapboxTokens] Token does not exist so fetching one');
                API.read('GetMapboxAccessToken');
                return;
            }

            // Store the token in a place where the AppState callback can also access it.
            currentToken = token;

            if (hasTokenExpired()) {
                console.debug('[MapboxTokens] Token has expired after reading from Onyx');
                clearToken();
                return;
            }

            console.debug('[MapboxTokens] Token is valid, setting up refresh');
            refreshToken();
        },
    });

    // When the app becomes active (eg. after being in the background), check if the token has expired.
    AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState !== CONST.APP_STATE.ACTIVE || !currentToken || !hasTokenExpired()) {
            return;
        }
        console.debug('[MapboxTokens] Token is expired after app became active');
        clearToken();
    });
};

export default init;
