
import {BroadcastChannel} from 'broadcast-channel';

const SIGNOUT_EVENT = 'signout';
const SIGNOUT_CHANNEL = 'signout_channel';

const channel = new BroadcastChannel(SIGNOUT_CHANNEL);
let signoutCallback = () => {};

channel.addEventListener('message', ({event, errorMessage}) => {
    if (event !== SIGNOUT_EVENT) {
        return;
    }

    signoutCallback(errorMessage);
});

/**
 * @param {Function} callback
 */
function registerSignoutCallback(callback) {
    signoutCallback = callback;
}

/**
 * @param {String} errorMessage
 */
function notifyTabsOfSignout(errorMessage) {
    channel.postMessage({event: SIGNOUT_EVENT, errorMessage});
}

/**
 * @param {String} errorMessage
 */
function signOut(errorMessage) {
    signoutCallback(errorMessage)
        .then(() => notifyTabsOfSignout(errorMessage));
}

export default {
    signOut,
    registerSignoutCallback,
};
