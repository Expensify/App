import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
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
import Growl from '../Growl';
import * as Localize from '../Localize/Localize';
import * as Link from './Link';
import getSkinToneEmojiFromIndex from '../../components/EmojiPicker/getSkinToneEmojiFromIndex';
import * as SequentialQueue from '../Network/SequentialQueue';
import PusherUtils from '../PusherUtils';
import * as LoginUtils from '../LoginUtils';

let currentUserAccountID = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserAccountID = lodashGet(val, 'accountID', '');
    },
});

/**
 * Changes a password for a given account
 *
 * @param {String} oldPassword
 * @param {String} password
 */
function updatePassword(oldPassword, password) {
    API.write('UpdatePassword', {
        oldPassword,
        password,
    }, {
        optimisticData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.ACCOUNT,
                value: {...CONST.DEFAULT_ACCOUNT_DATA, isLoading: true},
            },
        ],
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.ACCOUNT,
                value: {isLoading: false},
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.ACCOUNT,
                value: {isLoading: false},
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
    // Note: successData does not need to set isLoading to false because if the CloseAccount
    // command succeeds, a Pusher response will clear all Onyx data.
    API.write('CloseAccount', {message}, {
        optimisticData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM,
                value: {isLoading: true},
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM,
                value: {isLoading: false},
            },
        ],
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
            const isSubscribedToNewsletter = lodashGet(response, 'account.subscribed', true);
            const validatedStatus = lodashGet(response, 'account.validated', false);
            Onyx.merge(ONYXKEYS.USER, {isSubscribedToNewsletter: !!isSubscribedToNewsletter, validated: !!validatedStatus});

            // Update login list
            const loginList = LoginUtils.cleanLoginListServerResponse(response.loginList);
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
 * @param {Boolean} isSubscribed
 */
function updateNewsletterSubscription(isSubscribed) {
    API.write('UpdateNewsletterSubscription', {
        isSubscribed,
    }, {
        optimisticData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.USER,
                value: {isSubscribedToNewsletter: isSubscribed},
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.USER,
                value: {isSubscribedToNewsletter: !isSubscribed},
            },
        ],
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
    Onyx.merge(ONYXKEYS.ACCOUNT, {...CONST.DEFAULT_ACCOUNT_DATA, isLoading: true});

    return DeprecatedAPI.User_SecondaryLogin_Send({
        email: login,
        password,
    }).then((response) => {
        if (response.jsonCode === 200) {
            const loginList = LoginUtils.cleanLoginListServerResponse(response.loginList);
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
        Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false});
    });
}

/**
 * Validates a login given an accountID and validation code
 *
 * @param {Number} accountID
 * @param {String} validateCode
 */
function validateLogin(accountID, validateCode) {
    Onyx.merge(ONYXKEYS.ACCOUNT, {...CONST.DEFAULT_ACCOUNT_DATA, isLoading: true});

    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];
    API.write('ValidateLogin', {
        accountID,
        validateCode,
    }, {optimisticData});
    Navigation.navigate(ROUTES.HOME);
}

/**
 * Checks the blockedFromConcierge object to see if it has an expiresAt key,
 * and if so whether the expiresAt date of a user's ban is before right now
 *
 * @param {Object} blockedFromConciergeNVP
 * @returns {Boolean}
 */
function isBlockedFromConcierge(blockedFromConciergeNVP) {
    if (_.isEmpty(blockedFromConciergeNVP)) {
        return false;
    }

    if (!blockedFromConciergeNVP.expiresAt) {
        return false;
    }

    return moment().isBefore(moment(blockedFromConciergeNVP.expiresAt), 'day');
}

/**
 * Adds a paypal.me address for the user
 *
 * @param {String} address
 */
function addPaypalMeAddress(address) {
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.NVP_PAYPAL_ME_ADDRESS,
            value: address,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PAYPAL,
            value: {
                title: 'PayPal.me',
                description: address,
                methodID: CONST.PAYMENT_METHODS.PAYPAL,
                key: 'payPalMePaymentMethod',
                accountType: CONST.PAYMENT_METHODS.PAYPAL,
                accountData: {
                    username: address,
                },
                isDefault: false,
            },
        },
    ];
    API.write('AddPaypalMeAddress', {
        value: address,
    }, {optimisticData});
}

/**
 * Deletes a paypal.me address for the user
 *
 */
function deletePaypalMeAddress() {
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: ONYXKEYS.NVP_PAYPAL_ME_ADDRESS,
            value: '',
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: ONYXKEYS.PAYPAL,
            value: {},
        },
    ];
    API.write('DeletePaypalMeAddress', {}, {optimisticData});
    Growl.show(Localize.translateLocal('paymentsPage.deletePayPalSuccess'), CONST.GROWL.SUCCESS, 3000);
}

/**
 * Initialize our pusher subscription to listen for user changes
 */
function subscribeToUserEvents() {
    // If we don't have the user's accountID yet we can't subscribe so return early
    if (!currentUserAccountID) {
        return;
    }

    const pusherChannelName = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${currentUserAccountID}${CONFIG.PUSHER.SUFFIX}`;

    // Receive any relevant Onyx updates from the server
    PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.ONYX_API_UPDATE, currentUserAccountID, (pushJSON) => {
        SequentialQueue.getCurrentRequest().then(() => {
            Onyx.update(pushJSON);
        });
    });

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

    const pusherChannelName = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${currentUserAccountID}${CONFIG.PUSHER.SUFFIX}`;

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
function updatePreferredSkinTone(skinTone) {
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
            value: skinTone,
        },
    ];
    API.write('UpdatePreferredEmojiSkinTone', {
        value: skinTone,
    }, {optimisticData});
}

/**
 * Sync frequentlyUsedEmojis with Onyx and Server
 * @param {Object[]} frequentlyUsedEmojis
 */
function updateFrequentlyUsedEmojis(frequentlyUsedEmojis) {
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: ONYXKEYS.FREQUENTLY_USED_EMOJIS,
            value: frequentlyUsedEmojis,
        },
    ];
    API.write('UpdateFrequentlyUsedEmojis', {
        value: JSON.stringify(frequentlyUsedEmojis),
    }, {optimisticData});
}

/**
 * Sync user chat priority mode with Onyx and Server
 * @param {String} mode
 */
function updateChatPriorityMode(mode) {
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIORITY_MODE,
            value: mode,
        },
    ];
    API.write('UpdateChatPriorityMode', {
        value: mode,
    }, {optimisticData});
}

/**
 * @param {Boolean} shouldUseStagingServer
 */
function setShouldUseStagingServer(shouldUseStagingServer) {
    Onyx.merge(ONYXKEYS.USER, {shouldUseStagingServer});
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
    updatePassword,
    closeAccount,
    getUserDetails,
    resendValidateCode,
    updateNewsletterSubscription,
    setSecondaryLoginAndNavigate,
    validateLogin,
    isBlockedFromConcierge,
    subscribeToUserEvents,
    updatePreferredSkinTone,
    setShouldUseStagingServer,
    clearUserErrorMessage,
    subscribeToExpensifyCardUpdates,
    updateFrequentlyUsedEmojis,
    joinScreenShare,
    clearScreenShareRequest,
    generateStatementPDF,
    deletePaypalMeAddress,
    addPaypalMeAddress,
    updateChatPriorityMode,
};
