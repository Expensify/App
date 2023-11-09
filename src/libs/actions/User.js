import {isBefore} from 'date-fns';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import * as API from '@libs/API';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import * as Pusher from '@libs/Pusher/pusher';
import PusherUtils from '@libs/PusherUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import * as Link from './Link';
import * as OnyxUpdates from './OnyxUpdates';
import * as PersonalDetails from './PersonalDetails';
import * as Report from './Report';
import * as Session from './Session';
import redirectToSignIn from './SignInRedirect';

let currentUserAccountID = '';
let currentEmail = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserAccountID = lodashGet(val, 'accountID', -1);
        currentEmail = lodashGet(val, 'email', '');
    },
});

let myPersonalDetails = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => {
        if (!val || !currentUserAccountID) {
            return;
        }

        myPersonalDetails = val[currentUserAccountID];
    },
});

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
    // Run cleanup actions to prevent reconnection callbacks from blocking logging in again
    redirectToSignIn();
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
                        validateLogin: null,
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
                        validateCodeSent: ErrorUtils.getMicroSecondOnyxError('contacts.genericFailureMessages.requestContactMethodValidateCode'),
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
                        deletedLogin: ErrorUtils.getMicroSecondOnyxError('contacts.genericFailureMessages.deleteContactMethod'),
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
    Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.route);
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
 * Resets the state indicating whether a validation code has been sent to a specific contact method.
 *
 * @param {String} contactMethod - The identifier of the contact method to reset.
 */
function resetContactMethodValidateCodeSentState(contactMethod) {
    Onyx.merge(ONYXKEYS.LOGIN_LIST, {
        [contactMethod]: {
            validateCodeSent: false,
        },
    });
}

/**
 * Adds a secondary login to a user's account
 *
 * @param {String} contactMethod
 */
function addNewContactMethodAndNavigate(contactMethod) {
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
                        addedLogin: ErrorUtils.getMicroSecondOnyxError('contacts.genericFailureMessages.addContactMethod'),
                    },
                    pendingFields: {
                        addedLogin: null,
                    },
                },
            },
        },
    ];

    API.write('AddNewContactMethod', {partnerUserID: contactMethod}, {optimisticData, successData, failureData});
    Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.route);
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                ...CONST.DEFAULT_ACCOUNT_DATA,
                isLoading: true,
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
                    errorFields: {
                        validateCodeSent: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {isLoading: false},
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    errorFields: {
                        validateLogin: ErrorUtils.getMicroSecondOnyxError('contacts.genericFailureMessages.validateSecondaryLogin'),
                    },
                    pendingFields: {
                        validateLogin: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {isLoading: false},
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

    return isBefore(new Date(), new Date(blockedFromConciergeNVP.expiresAt));
}

function triggerNotifications(onyxUpdates) {
    _.each(onyxUpdates, (update) => {
        if (!update.shouldNotify) {
            return;
        }

        const reportID = update.key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
        const reportActions = _.values(update.value);

        // eslint-disable-next-line rulesdir/no-negated-variables
        const notifiableActions = _.filter(reportActions, (action) => ReportActionsUtils.isNotifiableReportAction(action));
        _.each(notifiableActions, (action) => Report.showReportActionNotification(reportID, action));
    });
}

/**
 * Handles the newest events from Pusher where a single mega multipleEvents contains
 * an array of singular events all in one event
 */
function subscribeToUserEvents() {
    // If we don't have the user's accountID yet (because the app isn't fully setup yet) we can't subscribe so return early
    if (!currentUserAccountID) {
        return;
    }

    // Handles the mega multipleEvents from Pusher which contains an array of single events.
    // Each single event is passed to PusherUtils in order to trigger the callbacks for that event
    PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.MULTIPLE_EVENTS, currentUserAccountID, (pushJSON) => {
        // The data for this push event comes in two different formats:
        // 1. Original format - this is what was sent before the RELIABLE_UPDATES project and will go away once RELIABLE_UPDATES is fully complete
        //     - The data is an array of objects, where each object is an onyx update
        //       Example: [{onyxMethod: 'whatever', key: 'foo', value: 'bar'}]
        // 1. Reliable updates format - this is what was sent with the RELIABLE_UPDATES project and will be the format from now on
        //     - The data is an object, containing updateIDs from the server and an array of onyx updates (this array is the same format as the original format above)
        //       Example: {lastUpdateID: 1, previousUpdateID: 0, updates: [{onyxMethod: 'whatever', key: 'foo', value: 'bar'}]}
        if (_.isArray(pushJSON)) {
            _.each(pushJSON, (multipleEvent) => {
                PusherUtils.triggerMultiEventHandler(multipleEvent.eventType, multipleEvent.data);
            });
            return;
        }

        const updates = {
            type: CONST.ONYX_UPDATE_TYPES.PUSHER,
            lastUpdateID: Number(pushJSON.lastUpdateID || 0),
            updates: pushJSON.updates,
            previousUpdateID: Number(pushJSON.previousUpdateID || 0),
        };
        if (!OnyxUpdates.doesClientNeedToBeUpdated(Number(pushJSON.previousUpdateID || 0))) {
            OnyxUpdates.apply(updates);
            return;
        }

        // If we reached this point, we need to pause the queue while we prepare to fetch older OnyxUpdates.
        SequentialQueue.pause();
        OnyxUpdates.saveUpdateInformation(updates);
    });

    // Handles Onyx updates coming from Pusher through the mega multipleEvents.
    PusherUtils.subscribeToMultiEvent(Pusher.TYPE.MULTIPLE_EVENT_TYPE.ONYX_API_UPDATE, (pushJSON) =>
        SequentialQueue.getCurrentRequest().then(() => {
            // If we don't have the currentUserAccountID (user is logged out) we don't want to update Onyx with data from Pusher
            if (!currentUserAccountID) {
                return;
            }

            const onyxUpdatePromise = Onyx.update(pushJSON);
            triggerNotifications(pushJSON);

            // Return a promise when Onyx is done updating so that the OnyxUpdatesManager can properly apply all
            // the onyx updates in order
            return onyxUpdatePromise;
        }),
    );
}

/**
 * Sync preferredSkinTone with Onyx and Server
 * @param {Number} skinTone
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
    Navigation.goBack(ROUTES.SETTINGS_PREFERENCES);
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

/**
 * Sets a contact method / secondary login as the user's "Default" contact method.
 *
 * @param {String} newDefaultContactMethod
 */
function setContactMethodAsDefault(newDefaultContactMethod) {
    const oldDefaultContactMethod = currentEmail;
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.SESSION,
            value: {
                email: newDefaultContactMethod,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [newDefaultContactMethod]: {
                    pendingFields: {
                        defaultLogin: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                    errorFields: {
                        defaultLogin: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    login: newDefaultContactMethod,
                    displayName: PersonalDetails.getDisplayName(newDefaultContactMethod, myPersonalDetails),
                },
            },
        },
    ];
    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [newDefaultContactMethod]: {
                    pendingFields: {
                        defaultLogin: null,
                    },
                },
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.SESSION,
            value: {
                email: oldDefaultContactMethod,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [newDefaultContactMethod]: {
                    pendingFields: {
                        defaultLogin: null,
                    },
                    errorFields: {
                        defaultLogin: ErrorUtils.getMicroSecondOnyxError('contacts.genericFailureMessages.setDefaultContactMethod'),
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {...myPersonalDetails},
            },
        },
    ];
    API.write('SetContactMethodAsDefault', {partnerUserID: newDefaultContactMethod}, {optimisticData, successData, failureData});
    Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.route);
}

/**
 * @param {String} theme
 */
function updateTheme(theme) {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.PREFERRED_THEME,
            value: theme,
        },
    ];

    API.write(
        'UpdateTheme',
        {
            value: theme,
        },
        {optimisticData},
    );

    Navigation.navigate(ROUTES.SETTINGS_PREFERENCES);
}

/**
 * Sets a custom status
 *
 * @param {Object} status
 * @param {String} status.text
 * @param {String} status.emojiCode
 */
function updateCustomStatus(status) {
    API.write('UpdateStatus', status, {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                value: {
                    [currentUserAccountID]: {
                        status,
                    },
                },
            },
        ],
    });
}

/**
 * Clears the custom status
 */
function clearCustomStatus() {
    API.write('ClearStatus', undefined, {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                value: {
                    [currentUserAccountID]: {
                        status: null, // Clearing the field
                    },
                },
            },
        ],
    });
}

/**
 * Sets a custom status
 *
 * @param {Object} status
 * @param {String} status.text
 * @param {String} status.emojiCode
 * @param {String} status.clearAfter - ISO 8601 format string, which represents the time when the status should be cleared
 */
function updateDraftCustomStatus(status) {
    Onyx.merge(ONYXKEYS.CUSTOM_STATUS_DRAFT, status);
}

/**
 * Clear the custom draft status
 *
 */
function clearDraftCustomStatus() {
    Onyx.merge(ONYXKEYS.CUSTOM_STATUS_DRAFT, {text: '', emojiCode: '', clearAfter: ''});
}

export {
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
    updateFrequentlyUsedEmojis,
    joinScreenShare,
    clearScreenShareRequest,
    generateStatementPDF,
    updateChatPriorityMode,
    setContactMethodAsDefault,
    updateTheme,
    resetContactMethodValidateCodeSentState,
    updateCustomStatus,
    clearCustomStatus,
    updateDraftCustomStatus,
    clearDraftCustomStatus,
};
