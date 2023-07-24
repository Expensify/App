import _ from 'underscore';
import moment from 'moment';
import Onyx from 'react-native-onyx';
import {AppState} from 'react-native';
import ONYXKEYS from '../ONYXKEYS';

let currentToken;
let refreshTimeoutID;

const refreshToken = () => {
    // Cancel any previous timeouts so that there is only one request to get a token at a time
    if (refreshTimeoutID) {
        clearTimeout(refreshTimeoutID);
    }
    // @TODO call the API GetMapboxAccessToken()
};

const hasTokenExpired = () => {
    const now = moment();
    const expiration = moment(currentToken.expiration);
    const minutesUntilTokenExpires = now.diff(expiration, 'minutes');
    return minutesUntilTokenExpires < 0;
};

const clearToken = () => {
    // Use Onyx.set() to delete the key from Onyx, which will trigger the flow with an empty token (where a new token is retrieved from the API)
    Onyx.set(ONYXKEYS.MAPBOX_ACCESS_TOKEN, null);
};

const init = () => {
    // When the token changes in Onyx, the expiration needs to be checked so a new token can be retrieved.
    Onyx.connect({
        key: ONYXKEYS.MAPBOX_ACCESS_TOKEN,
        callback: (token) => {
            // token is an object. If it is falsy or an empty object, the token needs to be retrieved from the API.
            // The API sets a token in Onyx with a 30 minute expiration
            if (!token || _.size(token) === 0) {
                // @TODO call the API GetMapboxAccessToken()
                return;
            }

            // Store the token in a place where the AppState callback can also access it
            currentToken = token;

            if (hasTokenExpired()) {
                clearToken();
                return;
            }

            // Refresh the token every 25 minutes
            refreshTimeoutID = setTimeout(refreshToken, 1000 * 60 * 25);
        },
    });

    // WHen the app becomes active (eg. after being in the background), check if the token has expired
    AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === CONST.APP_STATE.ACTIVE) {
            if (hasTokenExpired()) {
                clearToken();
            }
        }
    });
};

export default init;
