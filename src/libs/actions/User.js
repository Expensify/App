import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import moment from 'moment';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONFIG from '../../CONFIG';
import CONST from '../../CONST';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as Pusher from '../Pusher/pusher';
import Log from '../Log';
import NetworkConnection from '../NetworkConnection';
import Growl from '../Growl';
import * as Localize from '../Localize';
import * as Link from './Link';
import * as SequentialQueue from '../Network/SequentialQueue';
import PusherUtils from '../PusherUtils';
import * as Report from './Report';
import * as ReportActionsUtils from '../ReportActionsUtils';
import DateUtils from '../DateUtils';
import * as Session from './Session';

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
    API.write(
        'UpdatePassword',
        {
            oldPassword,
            password,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.ACCOUNT,
                    value: {...CONST.DEFAULT_ACCOUNT_DATA, isLoading: true},
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.ACCOUNT,
                    value: {isLoading: false},
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.ACCOUNT,
                    value: {isLoading: false},
                },
            ],
        },
    );
}

/**
 * Attempt to close the user's account
 *
 * @param {String} message optional reason for closing account
 */
function closeAccount(message) {
    // Note: successData does not need to set isLoading to false because if the CloseAccount
    // command succeeds, a Pusher response will clear all Onyx data.
    API.write(
        'CloseAccount',
        {message},
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM,
                    value: {isLoading: true},
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM,
                    value: {isLoading: false},
                },
            ],
        },
    );
}

/**
 * Resends a validation link to a given login
 *
 * @param {String} login
 * @param {Boolean} isPasswordless - temporary param to trigger passwordless flow in backend
 */
function resendValidateCode(login) {
    Session.resendValidateCode(login);
}

/**
 * Requests a new validate code be sent for the passed contact method
 *
 * @param {String} contactMethod - the new contact method that the user is trying to verify
 */
function requestContactMethodValidateCode(contactMethod) {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    validateCodeSent: false,
                    errorFields: {
                        validateCodeSent: null,
                    },
                    pendingFields: {
                        validateCodeSent: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        },
    ];
    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    validateCodeSent: true,
                    pendingFields: {
                        validateCodeSent: null,
                    },
                },
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    validateCodeSent: false,
                    errorFields: {
                        validateCodeSent: {
                            [DateUtils.getMicroseconds()]: Localize.translateLocal('contacts.genericFailureMessages.requestContactMethodValidateCode'),
                        },
                    },
                    pendingFields: {
                        validateCodeSent: null,
                    },
                },
            },
        },
    ];

    API.write(
        'RequestContactMethodValidateCode',
        {
            email: contactMethod,
        },
        {optimisticData, successData, failureData},
    );
}

/**
 * Sets whether or not the user is subscribed to Expensify news
 *
 * @param {Boolean} isSubscribed
 */
function updateNewsletterSubscription(isSubscribed) {
    API.write(
        'UpdateNewsletterSubscription',
        {
            isSubscribed,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.USER,
                    value: {isSubscribedToNewsletter: isSubscribed},
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.USER,
                    value: {isSubscribedToNewsletter: !isSubscribed},
                },
            ],
        },
    );
}

/**
 * Delete a specific contact method
 *
 * @param {String} contactMethod - the contact method being deleted
 * @param {Array} loginList
 */
function deleteContactMethod(contactMethod, loginList) {
    const oldLoginData = loginList[contactMethod];

    // If the contact method failed to be added to the account, then it should only be deleted locally.
    if (lodashGet(oldLoginData, 'errorFields.addedLogin', null)) {
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {[contactMethod]: null});
        Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS);
        return;
    }

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    partnerUserID: '',
                    errorFields: {
                        deletedLogin: null,
                    },
                    pendingFields: {
                        deletedLogin: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                },
            },
        },
    ];
    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: null,
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    ...oldLoginData,
                    errorFields: {
                        deletedLogin: {
                            [DateUtils.getMicroseconds()]: Localize.translateLocal('contacts.genericFailureMessages.deleteContactMethod'),
                        },
                    },
                    pendingFields: {
                        deletedLogin: null,
                    },
                },
            },
        },
    ];

    API.write(
        'DeleteContactMethod',
        {
            partnerUserID: contactMethod,
        },
        {optimisticData, successData, failureData},
    );
    Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS);
}

/**
 * Clears any possible stored errors for a specific field on a contact method
 *
 * @param {String} contactMethod
 * @param {String} fieldName
 */
function clearContactMethodErrors(contactMethod, fieldName) {
    Onyx.merge(ONYXKEYS.LOGIN_LIST, {
        [contactMethod]: {
            errorFields: {
                [fieldName]: null,
            },
            pendingFields: {
                [fieldName]: null,
            },
        },
    });
}

/**
 * Adds a secondary login to a user's account
 *
 * @param {String} contactMethod
 * @param {String} password
 */
function addNewContactMethodAndNavigate(contactMethod, password) {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    partnerUserID: contactMethod,
                    validatedDate: '',
                    errorFields: {
                        addedLogin: null,
                    },
                    pendingFields: {
                        addedLogin: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                },
            },
        },
    ];
    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    pendingFields: {
                        addedLogin: null,
                    },
                },
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    errorFields: {
                        addedLogin: {
                            [DateUtils.getMicroseconds()]: Localize.translateLocal('contacts.genericFailureMessages.addContactMethod'),
                        },
                    },
                    pendingFields: {
                        addedLogin: null,
                    },
                },
            },
        },
    ];

    API.write('AddNewContactMethod', {partnerUserID: contactMethod, password}, {optimisticData, successData, failureData});
    Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS);
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
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];
    API.write(
        'ValidateLogin',
        {
            accountID,
            validateCode,
        },
        {optimisticData},
    );
    Navigation.navigate(ROUTES.HOME);
}

/**
 * Validates a secondary login / contact method
 *
 * @param {String} contactMethod - The contact method the user is trying to verify
 * @param {String} validateCode
 */
function validateSecondaryLogin(contactMethod, validateCode) {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    errorFields: {
                        validateLogin: null,
                    },
                    pendingFields: {
                        validateLogin: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        },
    ];
    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    pendingFields: {
                        validateLogin: null,
                    },
                },
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    errorFields: {
                        validateLogin: {
                            [DateUtils.getMicroseconds()]: Localize.translateLocal('contacts.genericFailureMessages.validateSecondaryLogin'),
                        },
                    },
                    pendingFields: {
                        validateLogin: null,
                    },
                },
            },
        },
    ];

    API.write(
        'ValidateSecondaryLogin',
        {
            partnerUserID: contactMethod,
            validateCode,
        },
        {optimisticData, successData, failureData},
    );
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
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PAYPAL_ME_ADDRESS,
            value: address,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
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
    API.write(
        'AddPaypalMeAddress',
        {
            value: address,
        },
        {optimisticData},
    );
}

/**
 * Deletes a paypal.me address for the user
 *
 */
function deletePaypalMeAddress() {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PAYPAL,
            value: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
        },
    ];

    // Success data required for Android, more info here https://github.com/Expensify/App/pull/17903#discussion_r1175763081
    const successData = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_PAYPAL_ME_ADDRESS,
            value: '',
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.PAYPAL,
            value: {},
        },
    ];

    API.write('DeletePaypalMeAddress', {}, {optimisticData, successData});
    Growl.show(Localize.translateLocal('paymentsPage.deletePayPalSuccess'), CONST.GROWL.SUCCESS, 3000);
}

function triggerNotifications(onyxUpdates) {
    _.each(onyxUpdates, (update) => {
        if (!update.shouldNotify) {
            return;
        }

        const reportID = update.key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
        const reportActions = _.values(update.value);
        const sortedReportActions = ReportActionsUtils.getSortedReportActions(reportActions);
        Report.showReportActionNotification(reportID, _.last(sortedReportActions));
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

    const pusherChannelName = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${currentUserAccountID}${CONFIG.PUSHER.SUFFIX}`;

    // Receive any relevant Onyx updates from the server
    PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.ONYX_API_UPDATE, currentUserAccountID, (pushJSON) => {
        SequentialQueue.getCurrentRequest().then(() => {
            Onyx.update(pushJSON);
            triggerNotifications(pushJSON);
        });
    });

    // Live-update an user's preferred locale
    Pusher.subscribe(
        pusherChannelName,
        Pusher.TYPE.PREFERRED_LOCALE,
        (pushJSON) => {
            Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, pushJSON.preferredLocale);
        },
        () => {
            NetworkConnection.triggerReconnectionCallbacks('pusher re-subscribed to private user channel');
        },
    ).catch((error) => {
        Log.hmmm('[User] Failed to subscribe to Pusher channel', false, {error, pusherChannelName, eventName: Pusher.TYPE.PREFERRED_LOCALE});
    });

    // Subscribe to screen share requests sent by GuidesPlus agents
    Pusher.subscribe(
        pusherChannelName,
        Pusher.TYPE.SCREEN_SHARE_REQUEST,
        (pushJSON) => {
            Onyx.merge(ONYXKEYS.SCREEN_SHARE_REQUEST, pushJSON);
        },
        () => {
            NetworkConnection.triggerReconnectionCallbacks('pusher re-subscribed to private user channel');
        },
    ).catch((error) => {
        Log.hmmm('[User] Failed to subscribe to Pusher channel', false, {error, pusherChannelName, eventName: Pusher.TYPE.SCREEN_SHARE_REQUEST});
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
    Pusher.subscribe(
        pusherChannelName,
        Pusher.TYPE.EXPENSIFY_CARD_UPDATE,
        (pushJSON) => {
            if (pushJSON.isUsingExpensifyCard) {
                Onyx.merge(ONYXKEYS.USER, {isUsingExpensifyCard: pushJSON.isUsingExpensifyCard, isCheckingDomain: null});
                Pusher.unsubscribe(pusherChannelName, Pusher.TYPE.EXPENSIFY_CARD_UPDATE);
            } else {
                Onyx.merge(ONYXKEYS.USER, {isCheckingDomain: pushJSON.isCheckingDomain});
            }
        },
        () => {
            NetworkConnection.triggerReconnectionCallbacks('pusher re-subscribed to private user channel');
        },
    ).catch((error) => {
        Log.info('[User] Failed to subscribe to Pusher channel', false, {error, pusherChannelName, eventName: Pusher.TYPE.EXPENSIFY_CARD_UPDATE});
    });
}

/**
 * Sync preferredSkinTone with Onyx and Server
 * @param {String} skinTone
 */
function updatePreferredSkinTone(skinTone) {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
            value: skinTone,
        },
    ];
    API.write(
        'UpdatePreferredEmojiSkinTone',
        {
            value: skinTone,
        },
        {optimisticData},
    );
}

/**
 * Sync frequentlyUsedEmojis with Onyx and Server
 * @param {Object[]} frequentlyUsedEmojis
 */
function updateFrequentlyUsedEmojis(frequentlyUsedEmojis) {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.FREQUENTLY_USED_EMOJIS,
            value: frequentlyUsedEmojis,
        },
    ];
    API.write(
        'UpdateFrequentlyUsedEmojis',
        {
            value: JSON.stringify(frequentlyUsedEmojis),
        },
        {optimisticData},
    );
}

/**
 * Sync user chat priority mode with Onyx and Server
 * @param {String} mode
 */
function updateChatPriorityMode(mode) {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIORITY_MODE,
            value: mode,
        },
    ];
    API.write(
        'UpdateChatPriorityMode',
        {
            value: mode,
        },
        {optimisticData},
    );
    Navigation.navigate(ROUTES.SETTINGS_PREFERENCES);
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
 */
function generateStatementPDF(period) {
    API.read(
        'GetStatementPDF',
        {period},
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.WALLET_STATEMENT,
                    value: {
                        isGenerating: true,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.WALLET_STATEMENT,
                    value: {
                        isGenerating: false,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.WALLET_STATEMENT,
                    value: {
                        isGenerating: false,
                    },
                },
            ],
        },
    );
}

export {
    updatePassword,
    closeAccount,
    resendValidateCode,
    requestContactMethodValidateCode,
    updateNewsletterSubscription,
    deleteContactMethod,
    clearContactMethodErrors,
    addNewContactMethodAndNavigate,
    validateLogin,
    validateSecondaryLogin,
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
