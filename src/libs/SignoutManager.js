import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import createCallback from './createCallback';
import setShouldSignOut from './actions/Session/setShouldSignOut';

const [signoutCallback, registerSignoutCallback] = createCallback();

let errorMessage = '';
let shouldSignOut = false;
Onyx.connect({
    key: ONYXKEYS.SHOULD_SIGN_OUT,
    callback: (val) => {
        if (!shouldSignOut && val) {
            signoutCallback(errorMessage);
            errorMessage = '';
            setShouldSignOut(false);
        }

        shouldSignOut = val;
    },
});

/**
 * @param {String} message
 */
function signOut(message) {
    errorMessage = message;
    setShouldSignOut(true);
}

export default {
    signOut,
    registerSignoutCallback,
};
