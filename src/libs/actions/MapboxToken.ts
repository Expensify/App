import {isAfter} from 'date-fns';
import type {NativeEventSubscription} from 'react-native';
import {AppState} from 'react-native';
import Onyx from 'react-native-onyx';
import * as ActiveClientManager from '@libs/ActiveClientManager';
import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MapboxAccessToken, Network} from '@src/types/onyx';

let authToken: string | undefined;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        authToken = value?.authToken;
    },
});

let connectionIDForToken: number | null;
let connectionIDForNetwork: number | null;
let appStateSubscription: NativeEventSubscription | null;
let currentToken: MapboxAccessToken | undefined;
let refreshTimeoutID: NodeJS.Timeout | undefined;
let isCurrentlyFetchingToken = false;
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
        API.read(READ_COMMANDS.GET_MAPBOX_ACCESS_TOKEN, null, {});
    }, REFRESH_INTERVAL);
};

const hasTokenExpired = () => isAfter(new Date(), new Date(currentToken?.expiration ?? ''));

const clearToken = () => {
    console.debug('[MapboxToken] Deleting the token stored in Onyx');
    // Use Onyx.set() to delete the key from Onyx, which will trigger a new token to be retrieved from the API.
    Onyx.set(ONYXKEYS.MAPBOX_ACCESS_TOKEN, null);
};

const fetchToken = () => {
    API.read(READ_COMMANDS.GET_MAPBOX_ACCESS_TOKEN, null, {});
    isCurrentlyFetchingToken = true;
};

const init = () => {
    if (connectionIDForToken) {
        console.debug('[MapboxToken] init() is already listening to Onyx so returning early');
        return;
    }

    // When the token changes in Onyx, the expiration needs to be checked so a new token can be retrieved.
    connectionIDForToken = Onyx.connect({
        key: ONYXKEYS.MAPBOX_ACCESS_TOKEN,
        callback: (token) => {
            // Only the leader should be in charge of the mapbox token, or else when you have multiple tabs open, the Onyx connection fires multiple times
            // and it sets up duplicate refresh timers. This would be a big waste of tokens.
            if (!ActiveClientManager.isClientTheLeader()) {
                console.debug('[MapboxToken] This client is not the leader so ignoring onyx callback');
                return;
            }

            // If the user has logged out, don't do anything and ignore changes to the access token
            if (!authToken) {
                console.debug('[MapboxToken] Ignoring changes to token because user signed out');
                return;
            }

            // If the token is falsy or an empty object, the token needs to be retrieved from the API.
            // The API sets a token in Onyx with a 30 minute expiration.
            if (Object.keys(token ?? {}).length === 0) {
                fetchToken();
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
            isCurrentlyFetchingToken = false;
        },
    });

    if (!appStateSubscription) {
        appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
            // Skip getting a new token if:
            // - The app state is not changing to active
            // - There is no current token (which means it's not been fetch yet for the first time)
            // - The token hasn't expired yet (this would just be a waste of an API call)
            // - There is no authToken (which means the user has logged out)
            if (nextAppState !== CONST.APP_STATE.ACTIVE || !currentToken || !hasTokenExpired() || !authToken || isCurrentlyFetchingToken) {
                return;
            }
            console.debug('[MapboxToken] Token is expired after app became active');
            clearToken();
        });
    }

    if (!connectionIDForNetwork) {
        let network: Network | undefined;
        connectionIDForNetwork = Onyx.connect({
            key: ONYXKEYS.NETWORK,
            callback: (value) => {
                // When the network reconnects, check if the token has expired. If it has, then clearing the token will
                // trigger the fetch of a new one
                if (network && network.isOffline && value && !value.isOffline) {
                    if (Object.keys(currentToken ?? {}).length === 0) {
                        fetchToken();
                    } else if (!isCurrentlyFetchingToken && hasTokenExpired()) {
                        console.debug('[MapboxToken] Token is expired after network came online');
                        clearToken();
                    }
                }
                network = value;
            },
        });
    }
};

const stop = () => {
    console.debug('[MapboxToken] Stopping all listeners and timers');
    if (connectionIDForToken) {
        Onyx.disconnect(connectionIDForToken);
        connectionIDForToken = null;
    }
    if (connectionIDForNetwork) {
        Onyx.disconnect(connectionIDForNetwork);
        connectionIDForNetwork = null;
    }
    if (appStateSubscription) {
        appStateSubscription.remove();
        appStateSubscription = null;
    }
    clearTimeout(refreshTimeoutID);
};

export {init, stop};
