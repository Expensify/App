import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

let authenticating = false;
let credentials;

Onyx.connect({
    key: ONYXKEYS.CREDENTIALS,
    callback: (val) => {
        credentials = val || null;
    },
});

/**
 * @returns {Boolean}
 */
function isAuthenticating() {
    return authenticating;
}

/**
 * @param {Boolean} val
 */
function setIsAuthenticating(val) {
    authenticating = val;
}

/**
 * @returns {Object}
 */
function getCredentials() {
    return credentials;
}

export {
    isAuthenticating,
    setIsAuthenticating,
    getCredentials,
};
