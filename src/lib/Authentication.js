import _ from 'underscore';
import Network, {CONNECTED} from './Network';
import Activity, {APP_BECAME_ACTIVE} from './Activity';
import {fetch as fetchPersonalDetails} from './actions/PersonalDetails';
import {fetchAll as fetchAllReports} from './actions/Report';
import Ion from './Ion';
import IONKEYS from '../IONKEYS';

// List of actions to fire on reconnect
const reconnnectActions = [
    () => fetchPersonalDetails(),
    () => fetchAllReports(false, true),
];

/**
 * Fetch any actions we need to be updated on.
 */
function triggerReconnectActions() {
    _.each(reconnnectActions, callback => callback());
}

let unsubscribeAppBecameActiveEvent;
let unsubscribeConnectedEvent;

/**
 * Bind events on sign in
 */
function onSignIn() {
    // When the app is in the background Pusher can still receive realtime updates
    // for a few minutes, but eventually disconnects causing a delay when the app
    // returns from the background. So, if we are returning from the background
    // and we are online we should trigger our reconnection callbacks.
    unsubscribeAppBecameActiveEvent = Activity.subscribe(APP_BECAME_ACTIVE, () => {
        // Fire reconnect callbacks
        triggerReconnectActions();
    });

    // Subscribe to the state change event via NetInfo so we can update
    // whether a user has internet connectivity or not. This is more reliable
    // than the Pusher `disconnected` event which takes about 10-15 seconds to emit
    unsubscribeConnectedEvent = Network.subscribe(CONNECTED, () => {
        triggerReconnectActions();
    });
}

/**
 * Clean up events on sign out
 */
function onSignOut() {
    if (unsubscribeAppBecameActiveEvent) {
        unsubscribeAppBecameActiveEvent();
    }

    if (unsubscribeConnectedEvent) {
        unsubscribeConnectedEvent();
    }
}

function init() {
    let authToken = null;
    Ion.connect({
        key: IONKEYS.SESSION,
        callback: (val) => {
            const nextAuthToken = val ? val.authToken : null;

            if (!authToken && nextAuthToken) {
                onSignIn();
            }

            if (authToken && !nextAuthToken) {
                onSignOut();
            }

            authToken = nextAuthToken;
        }
    });
}


export default {
    init,
};
