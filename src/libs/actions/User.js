/* eslint-disable import/no-cycle */
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
import * as Pusher from '../Pusher/pusher';
import Log from '../Log';
import NetworkConnection from '../NetworkConnection';
import NameValuePair from './NameValuePair';
import getSkinToneEmojiFromIndex from '../../pages/home/report/EmojiPickerMenu/getSkinToneEmojiFromIndex';

let sessionAuthToken = '';
let sessionEmail = '';
let currentUserAccountID = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        sessionAuthToken = lodashGet(val, 'authToken', '');
        sessionEmail = lodashGet(val, 'email', '');
        currentUserAccountID = lodashGet(val, 'accountID', '');
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
function changePasswordAndNavigate(oldPassword, password) {
    Onyx.merge(ONYXKEYS.ACCOUNT, {...CONST.DEFAULT_ACCOUNT_DATA, loading: true});

    return API.ChangePassword({oldPassword, password})
        .then((response) => {
            if (response.jsonCode !== 200) {
                const error = lodashGet(response, 'message', 'Unable to change password. Please try again.');
                Onyx.merge(ONYXKEYS.ACCOUNT, {error});
                return;
            }

            Navigation.navigate(ROUTES.SETTINGS);
        })
        .finally(() => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {loading: false});
        });
}

function getBetas() {
    API.User_GetBetas().then((response) => {
        if (response.jsonCode !== 200) {
            return;
        }

        Onyx.set(ONYXKEYS.BETAS, response.betas);
    });
}

/**
 * Fetches the data needed for user settings
 */
function getUserDetails() {
    API.Get({
        returnValueList: 'account, loginList, nameValuePairs',
        nvpNames: [
            CONST.NVP.PAYPAL_ME_ADDRESS,
            CONST.NVP.PREFERRED_EMOJI_SKIN_TONE,
        ].join(','),
    })
        .then((response) => {
            // Update the User onyx key
            const loginList = _.where(response.loginList, {partnerName: 'expensify.com'});
            const expensifyNewsStatus = lodashGet(response, 'account.subscribed', true);
            const validatedStatus = lodashGet(response, 'account.validated', false);
            Onyx.merge(ONYXKEYS.USER, {loginList, expensifyNewsStatus: !!expensifyNewsStatus, validated: !!validatedStatus});

            // Update the nvp_payPalMeAddress NVP
            const payPalMeAddress = lodashGet(response, `nameValuePairs.${CONST.NVP.PAYPAL_ME_ADDRESS}`, '');
            Onyx.merge(ONYXKEYS.NVP_PAYPAL_ME_ADDRESS, payPalMeAddress);

            // Update the blockedFromConcierge NVP
            const blockedFromConcierge = lodashGet(response, `nameValuePairs.${CONST.NVP.BLOCKED_FROM_CONCIERGE}`, {});
            Onyx.merge(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE, blockedFromConcierge);

            const preferredSkinTone = lodashGet(response, `nameValuePairs.${CONST.NVP.PREFERRED_EMOJI_SKIN_TONE}`, {});
            Onyx.merge(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
                getSkinToneEmojiFromIndex(preferredSkinTone).skinTone);
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
            if (response.jsonCode === 200) {
                return;
            }

            Onyx.merge(ONYXKEYS.USER, {expensifyNewsStatus: !subscribed});
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
function setSecondaryLoginAndNavigate(login, password) {
    Onyx.merge(ONYXKEYS.ACCOUNT, {...CONST.DEFAULT_ACCOUNT_DATA, loading: true});

    return API.User_SecondaryLogin_Send({
        email: login,
        password,
    }).then((response) => {
        if (response.jsonCode === 200) {
            const loginList = _.where(response.loginList, {partnerName: 'expensify.com'});
            Onyx.merge(ONYXKEYS.USER, {loginList});
            Navigation.navigate(ROUTES.SETTINGS_PROFILE);
            return;
        }

        let error = lodashGet(response, 'message', 'Unable to add secondary login. Please try again.');

        // Replace error with a friendlier message
        if (error.includes('already belongs to an existing Expensify account.')) {
            error = 'This login already belongs to an existing Expensify account.';
        }

        Onyx.merge(ONYXKEYS.USER, {error});
    }).finally(() => {
        Onyx.merge(ONYXKEYS.ACCOUNT, {loading: false});
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
                Log.info(`Command User_IsFromPublicDomain returned error code: ${response.jsonCode}. Most likely, this means that the domain ${Str.extractEmail(sessionEmail)} is not in the bedrock cache. Retrying in ${RETRY_TIMEOUT / 1000 / 60} minutes`);
                setTimeout(getDomainInfo, RETRY_TIMEOUT);
            }
        });
}

/**
 * Initialize our pusher subscription to listen for user changes
 */
function subscribeToUserEvents() {
    // If we don't have the user's accountID yet we can't subscribe so return early
    if (!currentUserAccountID) {
        return;
    }

    const pusherChannelName = `private-user-accountID-${currentUserAccountID}`;

    // Live-update an user's preferred locale
    Pusher.subscribe(pusherChannelName, Pusher.TYPE.PREFERRED_LOCALE, (pushJSON) => {
        Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, pushJSON.preferredLocale);
    }, false,
    () => {
        NetworkConnection.triggerReconnectionCallbacks('pusher re-subscribed to private user channel');
    })
        .catch((error) => {
            Log.info(
                '[User] Failed to subscribe to Pusher channel',
                false,
                {error, pusherChannelName, eventName: Pusher.TYPE.PREFERRED_LOCALE},
            );
        });
}

/**
 * Sync preferredSkinTone with Onyx and Server
 * @param {String} skinTone
 */

function setPreferredSkinTone(skinTone) {
    return NameValuePair.set(CONST.NVP.PREFERRED_EMOJI_SKIN_TONE, skinTone, ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE);
}

/**
 * @param {Boolean} shouldUseSecureStaging
 */
function setShouldUseSecureStaging(shouldUseSecureStaging) {
    Onyx.merge(ONYXKEYS.USER, {shouldUseSecureStaging});
}

function clearUserErrorMessage() {
    Onyx.merge(ONYXKEYS.USER, {error: ''});
}

export {
    changePasswordAndNavigate,
    getBetas,
    getUserDetails,
    resendValidateCode,
    setExpensifyNewsStatus,
    setSecondaryLoginAndNavigate,
    validateLogin,
    isBlockedFromConcierge,
    getDomainInfo,
    subscribeToUserEvents,
    setPreferredSkinTone,
    setShouldUseSecureStaging,
    clearUserErrorMessage,
};
