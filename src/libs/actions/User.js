import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import {PUBLIC_DOMAINS as COMMON_PUBLIC_DOMAINS} from 'expensify-common/lib/CONST';
import moment from 'moment';
import ONYXKEYS from '../../ONYXKEYS';
import * as DeprecatedAPI from '../deprecatedAPI';
import * as API from '../API';
import CONFIG from '../../CONFIG';
import CONST from '../../CONST';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as Pusher from '../Pusher/pusher';
import Log from '../Log';
import NetworkConnection from '../NetworkConnection';
import redirectToSignIn from './SignInRedirect';
import NameValuePair from './NameValuePair';
import Growl from '../Growl';
import * as Localize from '../Localize';
import * as CloseAccountActions from './CloseAccount';
import * as Link from './Link';
import getSkinToneEmojiFromIndex from '../../components/EmojiPicker/getSkinToneEmojiFromIndex';
import * as SequentialQueue from '../Network/SequentialQueue';
import PusherUtils from '../PusherUtils';

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
 */
function changePassword(oldPassword, password) {
    API.write('ChangePassword', {
        oldPassword,
        password,
    }, {
        optimisticData: [
            {
                onyxMethod: 'merge',
                key: ONYXKEYS.ACCOUNT,
                value: {...CONST.DEFAULT_ACCOUNT_DATA, loading: true},
            },
        ],
        successData: [
            {
                onyxMethod: 'merge',
                key: ONYXKEYS.ACCOUNT,
                value: {loading: false},
            },
        ],
        failureData: [
            {
                onyxMethod: 'merge',
                key: ONYXKEYS.ACCOUNT,
                value: {loading: false},
            },
        ],
    });
}

/**
 * Attempt to close the user's account
 *
 * @param {String} message optional reason for closing account
 */
function closeAccount(message) {
    DeprecatedAPI.User_Delete({message}).then((response) => {
        console.debug('User_Delete: ', JSON.stringify(response));

        if (response.jsonCode === 200) {
            Growl.show(Localize.translateLocal('closeAccountPage.closeAccountSuccess'), CONST.GROWL.SUCCESS);
            redirectToSignIn();
            return;
        }

        // Inform user that they are currently unable to close their account
        CloseAccountActions.showCloseAccountModal();
    });
}

function getBetas() {
    DeprecatedAPI.User_GetBetas().then((response) => {
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
    DeprecatedAPI.Get({
        returnValueList: 'account, loginList, nameValuePairs',
        nvpNames: [
            CONST.NVP.PAYPAL_ME_ADDRESS,
            CONST.NVP.PREFERRED_EMOJI_SKIN_TONE,
            CONST.NVP.FREQUENTLY_USED_EMOJIS,
            CONST.NVP.BLOCKED_FROM_CONCIERGE,
        ].join(','),
    })
        .then((response) => {
            // Update the User onyx key
            const loginList = _.where(response.loginList, {partnerName: 'expensify.com'});
            const expensifyNewsStatus = lodashGet(response, 'account.subscribed', true);
            const validatedStatus = lodashGet(response, 'account.validated', false);
            Onyx.merge(ONYXKEYS.USER, {expensifyNewsStatus: !!expensifyNewsStatus, validated: !!validatedStatus});
            Onyx.set(ONYXKEYS.LOGIN_LIST, loginList);

            // Update the nvp_payPalMeAddress NVP
            const payPalMeAddress = lodashGet(response, `nameValuePairs.${CONST.NVP.PAYPAL_ME_ADDRESS}`, '');
            Onyx.merge(ONYXKEYS.NVP_PAYPAL_ME_ADDRESS, payPalMeAddress);

            // Update the blockedFromConcierge NVP
            const blockedFromConcierge = lodashGet(response, `nameValuePairs.${CONST.NVP.BLOCKED_FROM_CONCIERGE}`, {});
            Onyx.merge(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE, blockedFromConcierge);

            const preferredSkinTone = lodashGet(response, `nameValuePairs.${CONST.NVP.PREFERRED_EMOJI_SKIN_TONE}`, {});
            Onyx.merge(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
                getSkinToneEmojiFromIndex(preferredSkinTone).skinTone);

            const frequentlyUsedEmojis = lodashGet(response, `nameValuePairs.${CONST.NVP.FREQUENTLY_USED_EMOJIS}`, []);
            Onyx.set(ONYXKEYS.FREQUENTLY_USED_EMOJIS, frequentlyUsedEmojis);
        });
}

/**
 * Resends a validation link to a given login
 *
 * @param {String} login
 */
function resendValidateCode(login) {
    DeprecatedAPI.ResendValidateCode({email: login});
}

/**
 * Sets whether or not the user is subscribed to Expensify news
 *
 * @param {Boolean} subscribed
 */
function setExpensifyNewsStatus(subscribed) {
    Onyx.merge(ONYXKEYS.USER, {expensifyNewsStatus: subscribed});

    DeprecatedAPI.UpdateAccount({subscribed})
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

    return DeprecatedAPI.User_SecondaryLogin_Send({
        email: login,
        password,
    }).then((response) => {
        if (response.jsonCode === 200) {
            const loginList = _.where(response.loginList, {partnerName: 'expensify.com'});
            Onyx.set(ONYXKEYS.LOGIN_LIST, loginList);
            Navigation.navigate(ROUTES.SETTINGS_PROFILE);
            return;
        }

        let error = lodashGet(response, 'message', 'Unable to add secondary login. Please try again.');

        // Replace error with a friendlier message
        if (error.includes('already belongs to an existing Expensify account.')) {
            error = 'This login already belongs to an existing Expensify account.';
        }
        if (error.includes('I couldn\'t validate the phone number')) {
            error = Localize.translateLocal('common.error.phoneNumber');
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

    DeprecatedAPI.ValidateEmail({
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
 * Checks the blockedFromConcierge object to see if it has an expiresAt key,
 * and if so whether the expiresAt date of a user's ban is before right now
 *
 * @param {Object} blockedFromConcierge
 * @returns {Boolean}
 */
function isBlockedFromConcierge(blockedFromConcierge) {
    if (_.isEmpty(blockedFromConcierge)) {
        return false;
    }

    if (!blockedFromConcierge.expiresAt) {
        return false;
    }

    return moment().isBefore(moment(blockedFromConcierge.expiresAt), 'day');
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
    DeprecatedAPI.User_IsFromPublicDomain({email: sessionEmail})
        .then((response) => {
            if (response.jsonCode === 200) {
                const {isFromPublicDomain} = response;
                Onyx.merge(ONYXKEYS.USER, {isFromPublicDomain});

                DeprecatedAPI.User_IsUsingExpensifyCard()
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

    const pusherChannelName = `private-encrypted-user-accountID-${currentUserAccountID}${CONFIG.PUSHER.SUFFIX}`;

    // Receive any relevant Onyx updates from the server
    PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.ONYX_API_UPDATE, currentUserAccountID, (pushJSON) => {
        SequentialQueue.getCurrentRequest().then(() => {
            Onyx.update(pushJSON);
        });
    });
    PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.ONYX_API_UPDATE_CHUNK, currentUserAccountID, (pushJSON) => {
        SequentialQueue.getCurrentRequest().then(() => {
            Onyx.update(pushJSON.onyxData);
        });
    }, true);

    // Live-update an user's preferred locale
    Pusher.subscribe(pusherChannelName, Pusher.TYPE.PREFERRED_LOCALE, (pushJSON) => {
        Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, pushJSON.preferredLocale);
    },
    () => {
        NetworkConnection.triggerReconnectionCallbacks('pusher re-subscribed to private user channel');
    })
        .catch((error) => {
            Log.hmmm(
                '[User] Failed to subscribe to Pusher channel',
                false,
                {error, pusherChannelName, eventName: Pusher.TYPE.PREFERRED_LOCALE},
            );
        });

    // Subscribe to screen share requests sent by GuidesPlus agents
    Pusher.subscribe(pusherChannelName, Pusher.TYPE.SCREEN_SHARE_REQUEST, (pushJSON) => {
        Onyx.merge(ONYXKEYS.SCREEN_SHARE_REQUEST, pushJSON);
    },
    () => {
        NetworkConnection.triggerReconnectionCallbacks('pusher re-subscribed to private user channel');
    })
        .catch((error) => {
            Log.hmmm(
                '[User] Failed to subscribe to Pusher channel',
                false,
                {error, pusherChannelName, eventName: Pusher.TYPE.SCREEN_SHARE_REQUEST},
            );
        });
}

/**
 * Subscribes to Expensify Card updates when checking loginList for private domains
 */
function subscribeToExpensifyCardUpdates() {
    if (!currentUserAccountID) {
        return;
    }

    const pusherChannelName = `private-encrypted-user-accountID-${currentUserAccountID}${CONFIG.PUSHER.SUFFIX}`;

    // Handle Expensify Card approval flow updates
    Pusher.subscribe(pusherChannelName, Pusher.TYPE.EXPENSIFY_CARD_UPDATE, (pushJSON) => {
        if (pushJSON.isUsingExpensifyCard) {
            Onyx.merge(ONYXKEYS.USER, {isUsingExpensifyCard: pushJSON.isUsingExpensifyCard, isCheckingDomain: null});
            Pusher.unsubscribe(pusherChannelName, Pusher.TYPE.EXPENSIFY_CARD_UPDATE);
        } else {
            Onyx.merge(ONYXKEYS.USER, {isCheckingDomain: pushJSON.isCheckingDomain});
        }
    },
    () => {
        NetworkConnection.triggerReconnectionCallbacks('pusher re-subscribed to private user channel');
    })
        .catch((error) => {
            Log.info(
                '[User] Failed to subscribe to Pusher channel',
                false,
                {error, pusherChannelName, eventName: Pusher.TYPE.EXPENSIFY_CARD_UPDATE},
            );
        });
}

/**
 * Sync preferredSkinTone with Onyx and Server
 * @param {String} skinTone
 */
function setPreferredSkinTone(skinTone) {
    NameValuePair.set(CONST.NVP.PREFERRED_EMOJI_SKIN_TONE, skinTone, ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE);
}

/**
 * Sync frequentlyUsedEmojis with Onyx and Server
 * @param {Object[]} frequentlyUsedEmojis
 */
function setFrequentlyUsedEmojis(frequentlyUsedEmojis) {
    NameValuePair.set(CONST.NVP.FREQUENTLY_USED_EMOJIS, frequentlyUsedEmojis, ONYXKEYS.FREQUENTLY_USED_EMOJIS);
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

/**
 * Clear the data about a screen share request from Onyx.
 */
function clearScreenShareRequest() {
    Onyx.set(ONYXKEYS.SCREEN_SHARE_REQUEST, null);
}

/**
 * Open an OldDot tab linking to a screen share request.
 * @param {String} accessToken Access token required to join a screen share room, generated by the backend
 * @param {String} roomName Name of the screen share room to join
 */
function joinScreenShare(accessToken, roomName) {
    Link.openOldDotLink(`inbox?action=screenShare&accessToken=${accessToken}&name=${roomName}`);
    clearScreenShareRequest();
}

/**
 * Downloads the statement PDF for the provided period
 * @param {String} period YYYYMM format
 * @returns {Promise<Void>}
 */
function generateStatementPDF(period) {
    Onyx.merge(ONYXKEYS.WALLET_STATEMENT, {isGenerating: true});
    return DeprecatedAPI.GetStatementPDF({period})
        .then((response) => {
            if (response.jsonCode !== 200 || !response.filename) {
                Log.info('[User] Failed to generate statement PDF', false, {response});
                return;
            }

            Onyx.merge(ONYXKEYS.WALLET_STATEMENT, {[period]: response.filename});
        }).finally(() => {
            Onyx.merge(ONYXKEYS.WALLET_STATEMENT, {isGenerating: false});
        });
}

export {
    changePassword,
    closeAccount,
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
    subscribeToExpensifyCardUpdates,
    setFrequentlyUsedEmojis,
    joinScreenShare,
    clearScreenShareRequest,
    generateStatementPDF,
};
