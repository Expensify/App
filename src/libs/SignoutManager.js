import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

let signoutCallback = () => {};
let errorMessage = '';
let shouldSignOut = false;
Onyx.connect({
    key: ONYXKEYS.SHOULD_SIGN_OUT,
    callback: (val) => {
        if (!shouldSignOut && val) {
            signoutCallback(errorMessage);
            errorMessage = '';
            Onyx.set(ONYXKEYS.SHOULD_SIGN_OUT, false);
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
    Onyx.set(ONYXKEYS.SHOULD_SIGN_OUT, true);
}

export default {
    signOut,
    registerSignoutCallback,
};
