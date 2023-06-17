import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import * as Permissions from './actions/Permissions';

let authTokenType = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (session) => (authTokenType = lodashGet(session, 'authTokenType')),
});

const allowedCommandsForAnonymousUsers = ['AuthenticatePusher', 'ExpandURLPreview', 'LogOut', 'OpenApp', 'OpenReport', 'UpdateAutomaticTimezone'];

/**
 * Checks if the account is an anonymous account.
 *
 * @return {boolean}
 */
function isAnonymousUser() {
    return authTokenType === 'anonymousAccount';
}

/**
 * @returns {Boolean}
 */
function checkIfActionIsAllowed() {
    if (isAnonymousUser()) {
        Permissions.setActionAsForbidden();
        return false;
    }
    return true;
}

/**
 * Checks if the account is an anonymous account.
 * @param {String} command
 *
 * @return {Boolean}
 */
function checkIfCommandIsAllowed(command) {
    if (!allowedCommandsForAnonymousUsers.includes(command)) {
        return checkIfActionIsAllowed();
    }
    return true;
}

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

export {
    // eslint-disable-next-line import/prefer-default-export
    checkIfActionIsAllowed,
    checkIfCommandIsAllowed,
    isAnonymousUser,
    isLoggingInAsNewUser,
};
