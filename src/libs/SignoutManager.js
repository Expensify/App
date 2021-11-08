import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
// eslint-disable-next-line import/no-cycle
import * as Session from './actions/Session';

let signoutCallback = () => {};
let errorMessage = '';
let shouldSignOut = false;
Onyx.connect({
    key: ONYXKEYS.SHOULD_SIGN_OUT,
    callback: (val) => {
        if (!shouldSignOut && val) {
            signoutCallback(errorMessage);
            errorMessage = '';
            Session.setShouldSignOut(false);
        }

        shouldSignOut = val;
    },
});

/**
 * @param {Function} callback
 */
function registerSignoutCallback(callback) {
    signoutCallback = callback;
}

/**
 * @param {String} message
 */
function signOut(message) {
    errorMessage = message;
    Session.setShouldSignOut(true);
}

export default {
    signOut,
    registerSignoutCallback,
};
