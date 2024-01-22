import {isBefore} from 'date-fns';
import type {OnyxCollection, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
import type {ValueOf} from 'type-fest';
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
import type {FrequentlyUsedEmoji} from '@src/types/onyx';
import type Login from '@src/types/onyx/Login';
import type {OnyxServerUpdate} from '@src/types/onyx/OnyxUpdatesFromServer';
import type OnyxPersonalDetails from '@src/types/onyx/PersonalDetails';
import type {Status} from '@src/types/onyx/PersonalDetails';
import type ReportAction from '@src/types/onyx/ReportAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import * as Link from './Link';
import * as OnyxUpdates from './OnyxUpdates';
import * as PersonalDetails from './PersonalDetails';
import * as Report from './Report';
import * as Session from './Session';

type BlockedFromConciergeNVP = {expiresAt: number};

let currentUserAccountID = -1;
let currentEmail = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserAccountID = value?.accountID ?? -1;
        currentEmail = value?.email ?? '';
    },
});

let myPersonalDetails: OnyxEntry<OnyxPersonalDetails> | EmptyObject = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        if (!value || currentUserAccountID === -1) {
            return;
        }

        myPersonalDetails = value[currentUserAccountID];
    },
});

/**
 * Attempt to close the user's accountt
 */
function closeAccount(reason: string) {
    // Note: successData does not need to set isLoading to false because if the CloseAccount
    // command succeeds, a Pusher response will clear all Onyx data.

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM,
            value: {isLoading: true},
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM,
            value: {isLoading: false},
        },
    ];

    type CloseAccountParams = {message: string};

    const parameters: CloseAccountParams = {message: reason};

    API.write('CloseAccount', parameters, {
        optimisticData,
        failureData,
    });
}

/**
 * Resends a validation link to a given login
 */
function resendValidateCode(login: string) {
    Session.resendValidateCode(login);
}

/**
 * Requests a new validate code be sent for the passed contact method
 *
 * @param contactMethod - the new contact method that the user is trying to verify
 */
function requestContactMethodValidateCode(contactMethod: string) {
    const optimisticData: OnyxUpdate[] = [
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
    const successData: OnyxUpdate[] = [
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

    const failureData: OnyxUpdate[] = [
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

    type RequestContactMethodValidateCodeParams = {email: string};

    const parameters: RequestContactMethodValidateCodeParams = {email: contactMethod};

    API.write('RequestContactMethodValidateCode', parameters, {optimisticData, successData, failureData});
}

/**
 * Sets whether the user is subscribed to Expensify news
 */
function updateNewsletterSubscription(isSubscribed: boolean) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.USER,
            value: {isSubscribedToNewsletter: isSubscribed},
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.USER,
            value: {isSubscribedToNewsletter: !isSubscribed},
        },
    ];

    type UpdateNewsletterSubscriptionParams = {isSubscribed: boolean};

    const parameters: UpdateNewsletterSubscriptionParams = {isSubscribed};

    API.write('UpdateNewsletterSubscription', parameters, {
        optimisticData,
        failureData,
    });
}

/**
 * Delete a specific contact method
 * @param contactMethod - the contact method being deleted
 * @param loginList
 */
function deleteContactMethod(contactMethod: string, loginList: Record<string, Login>) {
    const oldLoginData = loginList[contactMethod];

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    partnerUserID: '',
                    errorFields: null,
                    pendingFields: {
                        deletedLogin: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                },
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: null,
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    ...oldLoginData,
                    errorFields: {
                        ...oldLoginData?.errorFields,
                        deletedLogin: ErrorUtils.getMicroSecondOnyxError('contacts.genericFailureMessages.deleteContactMethod'),
                    },
                    pendingFields: {
                        deletedLogin: null,
                    },
                },
            },
        },
    ];

    type DeleteContactMethodParams = {partnerUserID: string};

    const parameters: DeleteContactMethodParams = {partnerUserID: contactMethod};

    API.write('DeleteContactMethod', parameters, {optimisticData, successData, failureData});
    Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.route);
}

/**
 * Clears any possible stored errors for a specific field on a contact method
 */
function clearContactMethodErrors(contactMethod: string, fieldName: string) {
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
 * @param contactMethod - The identifier of the contact method to reset.
 */
function resetContactMethodValidateCodeSentState(contactMethod: string) {
    Onyx.merge(ONYXKEYS.LOGIN_LIST, {
        [contactMethod]: {
            validateCodeSent: false,
        },
    });
}

/**
 * Adds a secondary login to a user's account
 */
function addNewContactMethodAndNavigate(contactMethod: string) {
    const optimisticData: OnyxUpdate[] = [
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
    const successData: OnyxUpdate[] = [
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
    const failureData: OnyxUpdate[] = [
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

    type AddNewContactMethodParams = {partnerUserID: string};

    const parameters: AddNewContactMethodParams = {partnerUserID: contactMethod};

    API.write('AddNewContactMethod', parameters, {optimisticData, successData, failureData});
    Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.route);
}

/**
 * Validates a login given an accountID and validation code
 */
function validateLogin(accountID: number, validateCode: string) {
    Onyx.merge(ONYXKEYS.ACCOUNT, {...CONST.DEFAULT_ACCOUNT_DATA, isLoading: true});

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];

    type ValidateLoginParams = {
        accountID: number;
        validateCode: string;
    };

    const parameters: ValidateLoginParams = {accountID, validateCode};

    API.write('ValidateLogin', parameters, {optimisticData});
    Navigation.navigate(ROUTES.HOME);
}

/**
 * Validates a secondary login / contact method
 */
function validateSecondaryLogin(contactMethod: string, validateCode: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    errorFields: {
                        validateLogin: null,
                        validateCodeSent: null,
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
    const successData: OnyxUpdate[] = [
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

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    errorFields: {
                        validateLogin: ErrorUtils.getMicroSecondOnyxError('contacts.genericFailureMessages.validateSecondaryLogin'),
                        validateCodeSent: null,
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

    type ValidateSecondaryLoginParams = {partnerUserID: string; validateCode: string};

    const parameters: ValidateSecondaryLoginParams = {partnerUserID: contactMethod, validateCode};

    API.write('ValidateSecondaryLogin', parameters, {optimisticData, successData, failureData});
}

/**
 * Checks the blockedFromConcierge object to see if it has an expiresAt key,
 * and if so whether the expiresAt date of a user's ban is before right now
 *
 */
function isBlockedFromConcierge(blockedFromConciergeNVP: OnyxEntry<BlockedFromConciergeNVP>): boolean {
    if (isEmptyObject(blockedFromConciergeNVP)) {
        return false;
    }

    if (!blockedFromConciergeNVP?.expiresAt) {
        return false;
    }

    return isBefore(new Date(), new Date(blockedFromConciergeNVP.expiresAt));
}

function triggerNotifications(onyxUpdates: OnyxServerUpdate[]) {
    onyxUpdates.forEach((update) => {
        if (!update.shouldNotify) {
            return;
        }

        const reportID = update.key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
        const reportActions = Object.values((update.value as OnyxCollection<ReportAction>) ?? {});

        reportActions.forEach((action) => action && ReportActionsUtils.isNotifiableReportAction(action) && Report.showReportActionNotification(reportID, action));
    });
}

/**
 * Handles the newest events from Pusher where a single mega multipleEvents contains
 * an array of singular events all in one event
 */
function subscribeToUserEvents() {
    // If we don't have the user's accountID yet (because the app isn't fully setup yet) we can't subscribe so return early
    if (currentUserAccountID === -1) {
        return;
    }

    // Handles the mega multipleEvents from Pusher which contains an array of single events.
    // Each single event is passed to PusherUtils in order to trigger the callbacks for that event
    PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.MULTIPLE_EVENTS, currentUserAccountID.toString(), (pushJSON) => {
        // The data for this push event comes in two different formats:
        // 1. Original format - this is what was sent before the RELIABLE_UPDATES project and will go away once RELIABLE_UPDATES is fully complete
        //     - The data is an array of objects, where each object is an onyx update
        //       Example: [{onyxMethod: 'whatever', key: 'foo', value: 'bar'}]
        // 1. Reliable updates format - this is what was sent with the RELIABLE_UPDATES project and will be the format from now on
        //     - The data is an object, containing updateIDs from the server and an array of onyx updates (this array is the same format as the original format above)
        //       Example: {lastUpdateID: 1, previousUpdateID: 0, updates: [{onyxMethod: 'whatever', key: 'foo', value: 'bar'}]}
        if (Array.isArray(pushJSON)) {
            pushJSON.forEach((multipleEvent) => {
                PusherUtils.triggerMultiEventHandler(multipleEvent.eventType, multipleEvent.data);
            });
            return;
        }

        const updates = {
            type: CONST.ONYX_UPDATE_TYPES.PUSHER,
            lastUpdateID: Number(pushJSON.lastUpdateID || 0),
            updates: pushJSON.updates ?? [],
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
    PusherUtils.subscribeToMultiEvent(Pusher.TYPE.MULTIPLE_EVENT_TYPE.ONYX_API_UPDATE, (pushJSON: OnyxServerUpdate[]) =>
        SequentialQueue.getCurrentRequest().then(() => {
            // If we don't have the currentUserAccountID (user is logged out) we don't want to update Onyx with data from Pusher
            if (currentUserAccountID === -1) {
                return;
            }

            const onyxUpdatePromise = Onyx.update(pushJSON).then(() => {
                triggerNotifications(pushJSON);
            });

            // Return a promise when Onyx is done updating so that the OnyxUpdatesManager can properly apply all
            // the onyx updates in order
            return onyxUpdatePromise;
        }),
    );
}

/**
 * Sync preferredSkinTone with Onyx and Server
 */
function updatePreferredSkinTone(skinTone: number) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
            value: skinTone,
        },
    ];

    type UpdatePreferredEmojiSkinToneParams = {
        value: number;
    };

    const parameters: UpdatePreferredEmojiSkinToneParams = {value: skinTone};

    API.write('UpdatePreferredEmojiSkinTone', parameters, {optimisticData});
}

/**
 * Sync frequentlyUsedEmojis with Onyx and Server
 */
function updateFrequentlyUsedEmojis(frequentlyUsedEmojis: FrequentlyUsedEmoji[]) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.FREQUENTLY_USED_EMOJIS,
            value: frequentlyUsedEmojis,
        },
    ];
    type UpdateFrequentlyUsedEmojisParams = {value: string};

    const parameters: UpdateFrequentlyUsedEmojisParams = {value: JSON.stringify(frequentlyUsedEmojis)};

    API.write('UpdateFrequentlyUsedEmojis', parameters, {optimisticData});
}

/**
 * Sync user chat priority mode with Onyx and Server
 * @param mode
 * @param [automatic] if we changed the mode automatically
 */
function updateChatPriorityMode(mode: ValueOf<typeof CONST.PRIORITY_MODE>, automatic = false) {
    const autoSwitchedToFocusMode = mode === CONST.PRIORITY_MODE.GSD && automatic;
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIORITY_MODE,
            value: mode,
        },
    ];

    if (autoSwitchedToFocusMode) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_TRY_FOCUS_MODE,
            value: true,
        });
    }

    type UpdateChatPriorityModeParams = {
        value: ValueOf<typeof CONST.PRIORITY_MODE>;
        automatic: boolean;
    };

    const parameters: UpdateChatPriorityModeParams = {
        value: mode,
        automatic,
    };

    API.write('UpdateChatPriorityMode', parameters, {optimisticData});

    if (!autoSwitchedToFocusMode) {
        Navigation.goBack(ROUTES.SETTINGS_PREFERENCES);
    }
}

function clearFocusModeNotification() {
    Onyx.set(ONYXKEYS.FOCUS_MODE_NOTIFICATION, false);
}

function setShouldUseStagingServer(shouldUseStagingServer: boolean) {
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
 * @param accessToken Access token required to join a screen share room, generated by the backend
 * @param roomName Name of the screen share room to join
 */
function joinScreenShare(accessToken: string, roomName: string) {
    Link.openOldDotLink(`inbox?action=screenShare&accessToken=${accessToken}&name=${roomName}`);
    clearScreenShareRequest();
}

/**
 * Downloads the statement PDF for the provided period
 * @param period YYYYMM format
 */
function generateStatementPDF(period: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_STATEMENT,
            value: {
                isGenerating: true,
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_STATEMENT,
            value: {
                isGenerating: false,
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_STATEMENT,
            value: {
                isGenerating: false,
            },
        },
    ];

    type GetStatementPDFParams = {period: string};

    const parameters: GetStatementPDFParams = {period};

    API.read('GetStatementPDF', parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Sets a contact method / secondary login as the user's "Default" contact method.
 */
function setContactMethodAsDefault(newDefaultContactMethod: string) {
    const oldDefaultContactMethod = currentEmail;
    const optimisticData: OnyxUpdate[] = [
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
                    displayName: PersonalDetails.createDisplayName(newDefaultContactMethod, myPersonalDetails),
                },
            },
        },
    ];
    const successData: OnyxUpdate[] = [
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
    const failureData: OnyxUpdate[] = [
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

    type SetContactMethodAsDefaultParams = {
        partnerUserID: string;
    };

    const parameters: SetContactMethodAsDefaultParams = {
        partnerUserID: newDefaultContactMethod,
    };

    API.write('SetContactMethodAsDefault', parameters, {
        optimisticData,
        successData,
        failureData,
    });
    Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.route);
}

function updateTheme(theme: ValueOf<typeof CONST.THEME>) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.PREFERRED_THEME,
            value: theme,
        },
    ];

    type UpdateThemeParams = {
        value: string;
    };

    const parameters: UpdateThemeParams = {
        value: theme,
    };

    API.write('UpdateTheme', parameters, {optimisticData});

    Navigation.navigate(ROUTES.SETTINGS_PREFERENCES);
}

/**
 * Sets a custom status
 */
function updateCustomStatus(status: Status) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    status,
                },
            },
        },
    ];

    type UpdateStatusParams = {
        text?: string;
        emojiCode: string;
        clearAfter?: string;
    };

    const parameters: UpdateStatusParams = {text: status.text, emojiCode: status.emojiCode, clearAfter: status.clearAfter};

    API.write('UpdateStatus', parameters, {
        optimisticData,
    });
}

/**
 * Clears the custom status
 */
function clearCustomStatus() {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    status: null, // Clearing the field
                },
            },
        },
    ];
    API.write('ClearStatus', undefined, {
        optimisticData,
    });
}

/**
 * Sets a custom status
 *
 * @param status.text
 * @param status.emojiCode
 * @param status.clearAfter - ISO 8601 format string, which represents the time when the status should be cleared
 */
function updateDraftCustomStatus(status: Status) {
    Onyx.merge(ONYXKEYS.CUSTOM_STATUS_DRAFT, status);
}

/**
 * Clear the custom draft status
 */
function clearDraftCustomStatus() {
    Onyx.merge(ONYXKEYS.CUSTOM_STATUS_DRAFT, {text: '', emojiCode: '', clearAfter: ''});
}

export {
    clearFocusModeNotification,
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
