import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import {PUBLIC_DOMAINS as COMMON_PUBLIC_DOMAINS} from 'expensify-common/lib/CONST';
import moment from 'moment';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';

let sessionAuthToken = '';
let sessionEmail = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        sessionAuthToken = lodashGet(val, 'authToken', '');
        sessionEmail = lodashGet(val, 'email', '');
    },
});

let currentlyViewedReportID = '';
Onyx.connect({
    key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    callback: val => currentlyViewedReportID = val || '',
});

/**
 * Changes a password for a given account
 *
 * @param {String} oldPassword
 * @param {String} password
 * @returns {Promise}
 */
function changePassword(oldPassword, password) {
    Onyx.merge(ONYXKEYS.ACCOUNT, {...CONST.DEFAULT_ACCOUNT_DATA, loading: true});

    return API.ChangePassword({oldPassword, password})
        .then((response) => {
            if (response.jsonCode !== 200) {
                const error = lodashGet(response, 'message', 'Unable to change password. Please try again.');
                Onyx.merge(ONYXKEYS.ACCOUNT, {error});
            }
            return response;
        })
        .finally((response) => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {loading: false});
            return response;
        });
}

function getBetas() {
    API.User_GetBetas().then((response) => {
        if (response.jsonCode === 200) {
            Onyx.set(ONYXKEYS.BETAS, response.betas);
        }
    });
}

/**
 * Fetches the data needed for user settings
 */
function getUserDetails() {
    API.Get({
        returnValueList: 'account, loginList, nameValuePairs',
        nvpNames: [CONST.NVP.BLOCKED_FROM_CONCIERGE, CONST.NVP.PAYPAL_ME_ADDRESS].join(','),
    })
        .then((response) => {
            // Update the User onyx key
            const loginList = _.where(response.loginList, {partnerName: 'expensify.com'});
            const expensifyNewsStatus = lodashGet(response, 'account.subscribed', true);
            Onyx.merge(ONYXKEYS.USER, {loginList, expensifyNewsStatus: !!expensifyNewsStatus});

            // Update the nvp_payPalMeAddress NVP
            const payPalMeAddress = lodashGet(response, `nameValuePairs.${CONST.NVP.PAYPAL_ME_ADDRESS}`, '');
            Onyx.merge(ONYXKEYS.NVP_PAYPAL_ME_ADDRESS, payPalMeAddress);

            // Update the blockedFromConcierge NVP
            const blockedFromConcierge = lodashGet(response, `nameValuePairs.${CONST.NVP.BLOCKED_FROM_CONCIERGE}`, {});
            Onyx.merge(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE, blockedFromConcierge);
        });
}

/**
 * Resends a validation link to a given login
 *
 * @param {String} login
 */
function resendValidateCode(login) {
    API.ResendValidateCode({email: login});
}

/**
 * Sets whether or not the user is subscribed to Expensify news
 *
 * @param {Boolean} subscribed
 */
function setExpensifyNewsStatus(subscribed) {
    Onyx.merge(ONYXKEYS.USER, {expensifyNewsStatus: subscribed});

    API.UpdateAccount({subscribed})
        .then((response) => {
            if (response.jsonCode !== 200) {
                Onyx.merge(ONYXKEYS.USER, {expensifyNewsStatus: !subscribed});
            }
        })
        .catch(() => {
            Onyx.merge(ONYXKEYS.USER, {expensifyNewsStatus: !subscribed});
        });
}

/**
 * Adds a secondary login to a user's account
 *
 * @param {String} login
 * @param {String} password
 * @returns {Promise}
 */
function setSecondaryLogin(login, password) {
    Onyx.merge(ONYXKEYS.ACCOUNT, {...CONST.DEFAULT_ACCOUNT_DATA, loading: true});

    return API.User_SecondaryLogin_Send({
        email: login,
        password,
    }).then((response) => {
        if (response.jsonCode === 200) {
            const loginList = _.where(response.loginList, {partnerName: 'expensify.com'});
            Onyx.merge(ONYXKEYS.USER, {loginList});
        } else {
            let error = lodashGet(response, 'message', 'Unable to add secondary login. Please try again.');

            // Replace error with a friendlier message
            if (error.includes('already belongs to an existing Expensify account.')) {
                error = 'This login already belongs to an existing Expensify account.';
            }

            Onyx.merge(ONYXKEYS.USER, {error});
        }
        return response;
    }).finally((response) => {
        Onyx.merge(ONYXKEYS.ACCOUNT, {loading: false});
        return response;
    });
}

/**
 * Validates a login given an accountID and validation code
 *
 * @param {Number} accountID
 * @param {String} validateCode
 */
function validateLogin(accountID, validateCode) {
    const isLoggedIn = !_.isEmpty(sessionAuthToken);
    const redirectRoute = isLoggedIn ? ROUTES.getReportRoute(currentlyViewedReportID) : ROUTES.HOME;
    Onyx.merge(ONYXKEYS.ACCOUNT, {...CONST.DEFAULT_ACCOUNT_DATA, loading: true});

    API.ValidateEmail({
        accountID,
        validateCode,
    }).then((response) => {
        if (response.jsonCode === 200) {
            const {email} = response;

            if (isLoggedIn) {
                getUserDetails();
            } else {
                // Let the user know we've successfully validated their login
                const success = lodashGet(response, 'message', `Your secondary login ${email} has been validated.`);
                Onyx.merge(ONYXKEYS.ACCOUNT, {success});
            }
        } else {
            const error = lodashGet(response, 'message', 'Unable to validate login.');
            Onyx.merge(ONYXKEYS.ACCOUNT, {error});
        }
    }).finally(() => {
        Onyx.merge(ONYXKEYS.ACCOUNT, {loading: false});
        Navigation.navigate(redirectRoute);
    });
}

/**
 * Checks if the expiresAt date of a user's ban is before right now
 *
 * @param {String} expiresAt
 * @returns {boolean}
 */
function isBlockedFromConcierge(expiresAt) {
    if (!expiresAt) {
        return false;
    }

    return moment().isBefore(moment(expiresAt), 'day');
}

/**
 * Fetch the public domain info for the current user.
 *
 * This API is a bit weird in that it sometimes depends on information being cached in bedrock.
 * If the info for the domain is not in bedrock, then it creates an asynchronous bedrock job to gather domain info.
 * If that happens, this function will automatically retry itself in 10 minutes.
 */
function getDomainInfo() {
    // If this command fails, we'll retry again in 10 minutes,
    // arbitrarily chosen giving Bedrock time to resolve the ClearbitCheckPublicEmail job for this email.
    const RETRY_TIMEOUT = 600000;

    // First check list of common public domains
    if (_.contains(COMMON_PUBLIC_DOMAINS, sessionEmail)) {
        Onyx.merge(ONYXKEYS.USER, {isFromPublicDomain: true});
        return;
    }

    // If it is not a common public domain, check the API
    API.User_IsFromPublicDomain({email: sessionEmail})
        .then((response) => {
            if (response.jsonCode === 200) {
                const {isFromPublicDomain} = response;
                Onyx.merge(ONYXKEYS.USER, {isFromPublicDomain});

                // If the user is not on a public domain we'll want to know whether they are on a domain that has
                // already provisioned the Expensify card
                if (isFromPublicDomain) {
                    return;
                }

                API.User_IsUsingExpensifyCard()
                    .then(({isUsingExpensifyCard}) => {
                        Onyx.merge(ONYXKEYS.USER, {isUsingExpensifyCard});
                    });
            } else {
                // eslint-disable-next-line max-len
                console.debug(`Command User_IsFromPublicDomain returned error code: ${response.jsonCode}. Most likely, this means that the domain ${Str.extractEmail(sessionEmail)} is not in the bedrock cache. Retrying in ${RETRY_TIMEOUT / 1000 / 60} minutes`);
                setTimeout(getDomainInfo, RETRY_TIMEOUT);
            }
        });
}

export {
    changePassword,
    getBetas,
    getUserDetails,
    resendValidateCode,
    setExpensifyNewsStatus,
    setSecondaryLogin,
    validateLogin,
    isBlockedFromConcierge,
    getDomainInfo,
};
