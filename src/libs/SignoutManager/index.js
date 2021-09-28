import {BroadcastChannel} from 'broadcast-channel';

let signoutCallback = () => {};
const SIGNOUT_EVENT = 'signout';

/**
 * @param {Function} callback
 */
function onSignout(callback) {
    signoutCallback = callback;
}

// Setup channel to listen across tabs
const signoutChannel = new BroadcastChannel('signout');
signoutChannel.addEventListener('message', (message) => {
    if (message !== SIGNOUT_EVENT) {
        return;
    }

    signoutCallback();
});

function notifyTabsOfSignout() {
    signoutChannel.postMessage(SIGNOUT_EVENT);
}

export default {
    notifyTabsOfSignout,
    onSignout,
};
