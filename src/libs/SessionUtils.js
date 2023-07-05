import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../ONYXKEYS';

/**
 * Determine if the transitioning user is logging in as a new user.
 *
 * @param {String} transitionURL
 * @param {String} sessionEmail
 * @returns {Boolean}
 */
function isLoggingInAsNewUser(transitionURL, sessionEmail) {
    // The OldDot mobile app does not URL encode the parameters, but OldDot web
    // does. We don't want to deploy OldDot mobile again, so as a work around we
    // compare the session email to both the decoded and raw email from the transition link.
    const params = new URLSearchParams(transitionURL);
    const paramsEmail = params.get('email');

    // If the email param matches what is stored in the session then we are
    // definitely not logging in as a new user
    if (paramsEmail === sessionEmail) {
        return false;
    }

    // If they do not match it might be due to encoding, so check the raw value
    // Capture the un-encoded text in the email param
    const emailParamRegex = /[?&]email=([^&]*)/g;
    const matches = emailParamRegex.exec(transitionURL);
    const linkedEmail = lodashGet(matches, 1, null);
    return linkedEmail !== sessionEmail;
}

let loggedInDuringSession;

// To tell if the user logged in during this session we will check the value of session.authToken once when the app's JS inits. When the user logs out
// we can reset this flag so that it can be updated again.
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        if (!_.isUndefined(loggedInDuringSession)) {
            return;
        }

        if (session && session.authToken) {
            loggedInDuringSession = false;
        } else {
            loggedInDuringSession = true;
        }
    },
});

function resetDidUserLogInDuringSession() {
    loggedInDuringSession = undefined;
}

/**
 * @returns {boolean}
 */
function didUserLogInDuringSession() {
    return Boolean(loggedInDuringSession);
}

export {isLoggingInAsNewUser, didUserLogInDuringSession, resetDidUserLogInDuringSession};
