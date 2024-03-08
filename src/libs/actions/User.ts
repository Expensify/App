import {isBefore} from 'date-fns';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import type {
    AddNewContactMethodParams,
    CloseAccountParams,
    DeleteContactMethodParams,
    GetStatementPDFParams,
    RequestContactMethodValidateCodeParams,
    SetContactMethodAsDefaultParams,
    UpdateChatPriorityModeParams,
    UpdateFrequentlyUsedEmojisParams,
    UpdateNewsletterSubscriptionParams,
    UpdatePreferredEmojiSkinToneParams,
    UpdateStatusParams,
    UpdateThemeParams,
    ValidateLoginParams,
    ValidateSecondaryLoginParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as Pusher from '@libs/Pusher/pusher';
import PusherUtils from '@libs/PusherUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import playSoundExcludingMobile from '@libs/Sound/playSoundExcludingMobile';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BlockedFromConcierge, FrequentlyUsedEmoji, Policy} from '@src/types/onyx';
import type Login from '@src/types/onyx/Login';
import type {OnyxServerUpdate} from '@src/types/onyx/OnyxUpdatesFromServer';
import type OnyxPersonalDetails from '@src/types/onyx/PersonalDetails';
import type {Status} from '@src/types/onyx/PersonalDetails';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {OriginalMessage} from '@src/types/onyx/ReportAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import * as Link from './Link';
import * as OnyxUpdates from './OnyxUpdates';
import * as Report from './Report';
import * as Session from './Session';

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

    const parameters: CloseAccountParams = {message: reason};

    API.write(WRITE_COMMANDS.CLOSE_ACCOUNT, parameters, {
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

    const parameters: RequestContactMethodValidateCodeParams = {email: contactMethod};

    API.write(WRITE_COMMANDS.REQUEST_CONTACT_METHOD_VALIDATE_CODE, parameters, {optimisticData, successData, failureData});
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

    const parameters: UpdateNewsletterSubscriptionParams = {isSubscribed};

    API.write(WRITE_COMMANDS.UPDATE_NEWSLETTER_SUBSCRIPTION, parameters, {
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

    const parameters: DeleteContactMethodParams = {partnerUserID: contactMethod};

    API.write(WRITE_COMMANDS.DELETE_CONTACT_METHOD, parameters, {optimisticData, successData, failureData});
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

    const parameters: AddNewContactMethodParams = {partnerUserID: contactMethod};

    API.write(WRITE_COMMANDS.ADD_NEW_CONTACT_METHOD, parameters, {optimisticData, successData, failureData});
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

    const parameters: ValidateLoginParams = {accountID, validateCode};

    API.write(WRITE_COMMANDS.VALIDATE_LOGIN, parameters, {optimisticData});
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

    const parameters: ValidateSecondaryLoginParams = {partnerUserID: contactMethod, validateCode};

    API.write(WRITE_COMMANDS.VALIDATE_SECONDARY_LOGIN, parameters, {optimisticData, successData, failureData});
}

/**
 * Checks the blockedFromConcierge object to see if it has an expiresAt key,
 * and if so whether the expiresAt date of a user's ban is before right now
 *
 */
function isBlockedFromConcierge(blockedFromConciergeNVP: OnyxEntry<BlockedFromConcierge>): boolean {
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
        if (!update.shouldNotify && !update.shouldShowPushNotification) {
            return;
        }

        const reportID = update.key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
        const reportActions = Object.values((update.value as OnyxCollection<ReportAction>) ?? {});

        reportActions.forEach((action) => action && ReportActionsUtils.isNotifiableReportAction(action) && Report.showReportActionNotification(reportID, action));
    });
}

const isChannelMuted = (reportId: string) =>
    new Promise((resolve) => {
        const connectionId = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportId}`,
            callback: (report) => {
                Onyx.disconnect(connectionId);

                resolve(
                    !report?.notificationPreference ||
                        report?.notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE ||
                        report?.notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                );
            },
        });
    });

function playSoundForMessageType(pushJSON: OnyxServerUpdate[]) {
    const reportActionsOnly = pushJSON.filter((update) => update.key?.includes('reportActions_'));
    // "reportActions_5134363522480668" -> "5134363522480668"
    const reportIDs = reportActionsOnly.map((value) => value.key.split('_')[1]);

    Promise.all(reportIDs.map((reportID) => isChannelMuted(reportID)))
        .then((muted) => muted.every((isMuted) => isMuted))
        .then((isSoundMuted) => {
            if (isSoundMuted) {
                return;
            }

            try {
                const flatten = reportActionsOnly.flatMap((update) => {
                    const value = update.value as OnyxCollection<ReportAction>;

                    if (!value) {
                        return [];
                    }

                    return Object.values(value);
                }) as ReportAction[];

                for (const data of flatten) {
                    // Someone completes a task
                    if (data.actionName === 'TASKCOMPLETED') {
                        return playSound(SOUNDS.SUCCESS);
                    }
                }

                const types = flatten.map((data) => data?.originalMessage).filter(Boolean) as OriginalMessage[];

                for (const message of types) {
                    // someone sent money
                    if ('IOUDetails' in message) {
                        return playSound(SOUNDS.SUCCESS);
                    }

                    // mention user
                    if ('html' in message && typeof message.html === 'string' && message.html.includes(`<mention-user>@${currentEmail}</mention-user>`)) {
                        return playSoundExcludingMobile(SOUNDS.ATTENTION);
                    }

                    // mention @here
                    if ('html' in message && typeof message.html === 'string' && message.html.includes('<mention-here>')) {
                        return playSoundExcludingMobile(SOUNDS.ATTENTION);
                    }

                    // assign a task
                    if ('taskReportID' in message) {
                        return playSound(SOUNDS.ATTENTION);
                    }

                    // request money
                    if ('IOUTransactionID' in message) {
                        return playSound(SOUNDS.ATTENTION);
                    }

                    // Someone completes a money request
                    if ('IOUReportID' in message) {
                        return playSound(SOUNDS.SUCCESS);
                    }

                    // plain message
                    if ('html' in message) {
                        return playSoundExcludingMobile(SOUNDS.RECEIVE);
                    }
                }
            } catch (e) {
                let errorMessage = String(e);
                if (e instanceof Error) {
                    errorMessage = e.message;
                }

                Log.client(`Unexpected error occurred while parsing the data to play a sound: ${errorMessage}`);
            }
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
        // The data for the update is an object, containing updateIDs from the server and an array of onyx updates (this array is the same format as the original format above)
        // Example: {lastUpdateID: 1, previousUpdateID: 0, updates: [{onyxMethod: 'whatever', key: 'foo', value: 'bar'}]}
        const updates = {
            type: CONST.ONYX_UPDATE_TYPES.PUSHER,
            lastUpdateID: Number(pushJSON.lastUpdateID || 0),
            updates: pushJSON.updates ?? [],
            previousUpdateID: Number(pushJSON.previousUpdateID || 0),
        };
        OnyxUpdates.applyOnyxUpdatesReliably(updates);
    });

    // Handles Onyx updates coming from Pusher through the mega multipleEvents.
    PusherUtils.subscribeToMultiEvent(Pusher.TYPE.MULTIPLE_EVENT_TYPE.ONYX_API_UPDATE, (pushJSON: OnyxServerUpdate[]) => {
        playSoundForMessageType(pushJSON);

        return SequentialQueue.getCurrentRequest().then(() => {
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
        });
    });
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

    const parameters: UpdatePreferredEmojiSkinToneParams = {value: skinTone};

    API.write(WRITE_COMMANDS.UPDATE_PREFERRED_EMOJI_SKIN_TONE, parameters, {optimisticData});
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

    const parameters: UpdateFrequentlyUsedEmojisParams = {value: JSON.stringify(frequentlyUsedEmojis)};

    API.write(WRITE_COMMANDS.UPDATE_FREQUENTLY_USED_EMOJIS, parameters, {optimisticData});
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

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.NVP_TRY_FOCUS_MODE,
        value: true,
    });

    const parameters: UpdateChatPriorityModeParams = {
        value: mode,
        automatic,
    };

    API.write(WRITE_COMMANDS.UPDATE_CHAT_PRIORITY_MODE, parameters, {optimisticData});

    if (!autoSwitchedToFocusMode) {
        Navigation.goBack();
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

function setMuteAllSounds(isMutedAllSounds: boolean) {
    Onyx.merge(ONYXKEYS.USER, {isMutedAllSounds});
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

    const parameters: GetStatementPDFParams = {period};

    API.read(READ_COMMANDS.GET_STATEMENT_PDF, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Sets a contact method / secondary login as the user's "Default" contact method.
 */
function setContactMethodAsDefault(newDefaultContactMethod: string, policies: OnyxCollection<Pick<Policy, 'id' | 'ownerAccountID' | 'owner'>>) {
    const oldDefaultContactMethod = currentEmail;
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                primaryLogin: newDefaultContactMethod,
            },
        },
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
                    displayName: PersonalDetailsUtils.createDisplayName(newDefaultContactMethod, myPersonalDetails),
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
            key: ONYXKEYS.ACCOUNT,
            value: {
                primaryLogin: oldDefaultContactMethod,
            },
        },
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

    Object.values(policies ?? {}).forEach((policy) => {
        if (policy?.ownerAccountID !== currentUserAccountID) {
            return;
        }
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                owner: newDefaultContactMethod,
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                owner: policy.owner,
            },
        });
    });
    const parameters: SetContactMethodAsDefaultParams = {
        partnerUserID: newDefaultContactMethod,
    };

    API.write(WRITE_COMMANDS.SET_CONTACT_METHOD_AS_DEFAULT, parameters, {
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

    const parameters: UpdateThemeParams = {
        value: theme,
    };

    API.write(WRITE_COMMANDS.UPDATE_THEME, parameters, {optimisticData});

    Navigation.goBack();
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

    const parameters: UpdateStatusParams = {text: status.text, emojiCode: status.emojiCode, clearAfter: status.clearAfter};

    API.write(WRITE_COMMANDS.UPDATE_STATUS, parameters, {
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
    API.write(WRITE_COMMANDS.CLEAR_STATUS, {}, {optimisticData});
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

function dismissReferralBanner(type: ValueOf<typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES>) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                dismissedReferralBanners: {
                    [type]: true,
                },
            },
        },
    ];
    API.write(
        WRITE_COMMANDS.DISMISS_REFERRAL_BANNER,
        {type},
        {
            optimisticData,
        },
    );
}

export {
    clearFocusModeNotification,
    closeAccount,
    dismissReferralBanner,
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
    setMuteAllSounds,
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
