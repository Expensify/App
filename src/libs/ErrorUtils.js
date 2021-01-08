/**
 * Returns a user friendly error message for the respective error code from the API
 *
 * e.g.
 *
 * getErrorMessageFromErrorCode(401)  =>  Incorrect login or password. Please try again.
 *
 * @param {Number} errorCode
 *
 * @returns {String}
 */
function getErrorMessageFromErrorCode(errorCode) {
    switch (errorCode) {
        case 401:
            return 'Incorrect login or password. Please try again.';
        case 402:
            return 'You have 2FA enabled on this account. Please sign in using your email or phone number.';
        case 403:
            return 'Invalid login or password. Please try again or reset your password.';
        case 404:
            // eslint-disable-next-line max-len
            return 'We were unable to change your password. This is likely due to an expired password reset link in an old password reset email. We have emailed you a new link so you can try again. Check your Inbox and your Spam folder; it should arrive in just a few minutes.';
        case 405:
            return 'You do not have access to this application. Please add your GitHub username for access.';
        case 413:
            return 'Your account has been locked after so many unsuccessfull attempts. Please try again after 1 hour.';
        default:
            return 'Something went wrong. Please try again later.';
    }
}

export default getErrorMessageFromErrorCode;
