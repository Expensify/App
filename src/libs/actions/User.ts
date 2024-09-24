import {isBefore} from 'date-fns';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as ActiveClientManager from '@libs/ActiveClientManager';
import * as API from '@libs/API';
import type {
    AddNewContactMethodParams,
    CloseAccountParams,
    DeleteContactMethodParams,
    GetStatementPDFParams,
    RequestContactMethodValidateCodeParams,
    SetContactMethodAsDefaultParams,
    SetNameValuePairParams,
    UpdateChatPriorityModeParams,
    UpdateNewsletterSubscriptionParams,
    UpdatePreferredEmojiSkinToneParams,
    UpdateStatusParams,
    UpdateThemeParams,
    ValidateLoginParams,
    ValidateSecondaryLoginParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
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
import Visibility from '@libs/Visibility';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BlockedFromConcierge, CustomStatusDraft, LoginList, Policy} from '@src/types/onyx';
import type Login from '@src/types/onyx/Login';
import type {OnyxServerUpdate} from '@src/types/onyx/OnyxUpdatesFromServer';
import type OnyxPersonalDetails from '@src/types/onyx/PersonalDetails';
import type {Status} from '@src/types/onyx/PersonalDetails';
import type ReportAction from '@src/types/onyx/ReportAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import * as App from './App';
import applyOnyxUpdatesReliably from './applyOnyxUpdatesReliably';
import * as Link from './Link';
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

let myPersonalDetails: OnyxEntry<OnyxPersonalDetails>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        if (!value || currentUserAccountID === -1) {
            return;
        }

        myPersonalDetails = value[currentUserAccountID] ?? undefined;
    },
});

let allPolicies: OnyxCollection<Policy>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
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
                        validateCodeSent: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('contacts.genericFailureMessages.requestContactMethodValidateCode'),
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
function deleteContactMethod(contactMethod: string, loginList: Record<string, Login>, backTo?: string) {
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
                        deletedLogin: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('contacts.genericFailureMessages.deleteContactMethod'),
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
    Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.getRoute(backTo));
}

/**
 * Clears a contact method optimistically. this is used when the contact method fails to be added to the backend
 */
function clearContactMethod(contactMethod: string) {
    Onyx.merge(ONYXKEYS.LOGIN_LIST, {
        [contactMethod]: null,
    });
}

/**
 * Clears error for a sepcific field on validate action code.
 */
function clearValidateCodeActionError(fieldName: string) {
    Onyx.merge(ONYXKEYS.VALIDATE_ACTION_CODE, {
        errorFields: {
            [fieldName]: null,
        },
    });
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
 * Clears unvalidated new contact method action
 */
function clearUnvalidatedNewContactMethodAction() {
    Onyx.merge(ONYXKEYS.PENDING_CONTACT_ACTION, {
        validateCodeSent: null,
        pendingFields: null,
        errorFields: null,
    });
}

/**
 * When user adds a new contact method, they need to verify the magic code first
 * So we add the temporary contact method to Onyx to use it later, after user verified magic code.
 */
function addPendingContactMethod(contactMethod: string) {
    Onyx.merge(ONYXKEYS.PENDING_CONTACT_ACTION, {
        contactMethod,
    });
}

/**
 * Validates the action to add secondary contact method
 */
function saveNewContactMethodAndRequestValidationCode(contactMethod: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PENDING_CONTACT_ACTION,
            value: {
                contactMethod,
                errorFields: {
                    actionVerified: null,
                },
                pendingFields: {
                    actionVerified: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM,
            value: {isLoading: true},
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PENDING_CONTACT_ACTION,
            value: {
                validateCodeSent: true,
                errorFields: {
                    actionVerified: null,
                },
                pendingFields: {
                    actionVerified: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM,
            value: {isLoading: false},
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PENDING_CONTACT_ACTION,
            value: {
                validateCodeSent: null,
                errorFields: {
                    actionVerified: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('contacts.genericFailureMessages.requestContactMethodValidateCode'),
                },
                pendingFields: {
                    actionVerified: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM,
            value: {isLoading: false},
        },
    ];

    API.write(WRITE_COMMANDS.RESEND_VALIDATE_CODE, null, {optimisticData, successData, failureData});
}

/**
 * Adds a secondary login to a user's account
 */
function addNewContactMethod(contactMethod: string, validateCode = '') {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    partnerUserID: contactMethod,
                    validatedDate: '',
                    validateCodeSent: true,
                    errorFields: {
                        addedLogin: null,
                    },
                    pendingFields: {
                        addedLogin: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {isLoading: true},
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
                    validatedDate: DateUtils.getDBTime(),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PENDING_CONTACT_ACTION,
            value: {
                validateCodeSent: null,
                errorFields: {
                    actionVerified: null,
                },
                pendingFields: {
                    actionVerified: null,
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
                        addedLogin: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('contacts.genericFailureMessages.addContactMethod'),
                    },
                    pendingFields: {
                        addedLogin: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {isLoading: false},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PENDING_CONTACT_ACTION,
            value: {validateCodeSent: null},
        },
    ];

    const parameters: AddNewContactMethodParams = {partnerUserID: contactMethod, validateCode};

    API.write(WRITE_COMMANDS.ADD_NEW_CONTACT_METHOD, parameters, {optimisticData, successData, failureData});
}

/**
 * Requests a magic code to verify current user
 */
function requestValidateCodeAction() {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.VALIDATE_ACTION_CODE,
            value: {
                isLoading: true,
                pendingFields: {
                    actionVerified: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                errorFields: {
                    actionVerified: null,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.VALIDATE_ACTION_CODE,
            value: {
                validateCodeSent: true,
                isLoading: false,
                errorFields: {
                    actionVerified: null,
                },
                pendingFields: {
                    actionVerified: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.VALIDATE_ACTION_CODE,
            value: {
                validateCodeSent: null,
                isLoading: false,
                errorFields: {
                    actionVerified: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('contacts.genericFailureMessages.requestContactMethodValidateCode'),
                },
                pendingFields: {
                    actionVerified: null,
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.RESEND_VALIDATE_CODE, null, {optimisticData, successData, failureData});
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
function validateSecondaryLogin(loginList: OnyxEntry<LoginList>, contactMethod: string, validateCode: string) {
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
                    validatedDate: DateUtils.getDBTime(),
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
            value: {
                isLoading: false,
                validated: true,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.USER,
            value: {
                validated: true,
            },
        },
    ];
    // If the primary login isn't validated yet, set the secondary login as the primary login
    if (!loginList?.[currentEmail].validatedDate) {
        successData.push(
            ...[
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.ACCOUNT,
                    value: {
                        primaryLogin: contactMethod,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.SESSION,
                    value: {
                        email: contactMethod,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    value: {
                        [currentUserAccountID]: {
                            login: contactMethod,
                            displayName: PersonalDetailsUtils.createDisplayName(contactMethod, myPersonalDetails),
                        },
                    },
                },
            ],
        );

        Object.values(allPolicies ?? {}).forEach((policy) => {
            if (!policy) {
                return;
            }

            let optimisticPolicyDataValue;

            if (policy.employeeList) {
                const currentEmployee = policy.employeeList[currentEmail];
                optimisticPolicyDataValue = {
                    employeeList: {
                        [currentEmail]: null,
                        [contactMethod]: currentEmployee,
                    },
                };
            }

            if (policy.ownerAccountID === currentUserAccountID) {
                optimisticPolicyDataValue = {
                    ...optimisticPolicyDataValue,
                    owner: contactMethod,
                };
            }

            if (optimisticPolicyDataValue) {
                successData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                    value: optimisticPolicyDataValue,
                });
            }
        });
    }

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LOGIN_LIST,
            value: {
                [contactMethod]: {
                    errorFields: {
                        validateLogin: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('contacts.genericFailureMessages.validateSecondaryLogin'),
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
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportId}`,
            callback: (report) => {
                Onyx.disconnect(connection);
                const notificationPreference = report?.participants?.[currentUserAccountID]?.notificationPreference;

                resolve(
                    !notificationPreference || notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE || notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                );
            },
        });
    });

function playSoundForMessageType(pushJSON: OnyxServerUpdate[]) {
    const reportActionsOnly = pushJSON.filter((update) => update.key?.includes('reportActions_'));
    // "reportActions_5134363522480668" -> "5134363522480668"
    const reportID = reportActionsOnly
        .map((value) => value.key.split('_')[1])
        .find((reportKey) => reportKey === Navigation.getTopmostReportId() && Visibility.isVisible() && Visibility.hasFocus());

    if (!reportID) {
        return;
    }

    isChannelMuted(reportID).then((isSoundMuted) => {
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

            const types = flatten.map((data) => ReportActionsUtils.getOriginalMessage(data)).filter(Boolean);

            for (const message of types) {
                if (!message) {
                    return;
                }

                // Pay someone flow
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

                // Submit expense flow
                if ('IOUTransactionID' in message) {
                    return playSound(SOUNDS.ATTENTION);
                }

                // Someone reimburses an expense
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
        // If this is not the main client, we shouldn't process any data received from pusher.
        if (!ActiveClientManager.isClientTheLeader()) {
            Log.info('[Pusher] Received updates, but ignoring it since this is not the active client');
            return;
        }
        // The data for the update is an object, containing updateIDs from the server and an array of onyx updates (this array is the same format as the original format above)
        // Example: {lastUpdateID: 1, previousUpdateID: 0, updates: [{onyxMethod: 'whatever', key: 'foo', value: 'bar'}]}
        const updates = {
            type: CONST.ONYX_UPDATE_TYPES.PUSHER,
            lastUpdateID: Number(pushJSON.lastUpdateID || 0),
            updates: pushJSON.updates ?? [],
            previousUpdateID: Number(pushJSON.previousUpdateID || 0),
        };
        applyOnyxUpdatesReliably(updates);
    });

    // Handles Onyx updates coming from Pusher through the mega multipleEvents.
    PusherUtils.subscribeToMultiEvent(Pusher.TYPE.MULTIPLE_EVENT_TYPE.ONYX_API_UPDATE, (pushJSON: OnyxServerUpdate[]) => {
        playSoundForMessageType(pushJSON);

        return SequentialQueue.getCurrentRequest().then(() => {
            // If we don't have the currentUserAccountID (user is logged out) or this is not the
            // main client we don't want to update Onyx with data from Pusher
            if (currentUserAccountID === -1) {
                return;
            }
            if (!ActiveClientManager.isClientTheLeader()) {
                Log.info('[Pusher] Received updates, but ignoring it since this is not the active client');
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

    // We have an event to reconnect the App. It is triggered when we detect that the user passed updateID
    // is not in the DB
    PusherUtils.subscribeToMultiEvent(Pusher.TYPE.MULTIPLE_EVENT_TYPE.RECONNECT_APP, () => {
        App.reconnectApp();
        return Promise.resolve();
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
function setContactMethodAsDefault(newDefaultContactMethod: string, backTo?: string) {
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
                        defaultLogin: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('contacts.genericFailureMessages.setDefaultContactMethod'),
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

    Object.values(allPolicies ?? {}).forEach((policy) => {
        if (!policy) {
            return;
        }

        let optimisticPolicyDataValue;
        let failurePolicyDataValue;

        if (policy.employeeList) {
            const currentEmployee = policy.employeeList[oldDefaultContactMethod];
            optimisticPolicyDataValue = {
                employeeList: {
                    [oldDefaultContactMethod]: null,
                    [newDefaultContactMethod]: currentEmployee,
                },
            };
            failurePolicyDataValue = {
                employeeList: {
                    [oldDefaultContactMethod]: currentEmployee,
                    [newDefaultContactMethod]: null,
                },
            };
        }

        if (policy.ownerAccountID === currentUserAccountID) {
            optimisticPolicyDataValue = {
                ...optimisticPolicyDataValue,
                owner: newDefaultContactMethod,
            };
            failurePolicyDataValue = {
                ...failurePolicyDataValue,
                owner: policy.owner,
            };
        }

        if (optimisticPolicyDataValue && failurePolicyDataValue) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                value: optimisticPolicyDataValue,
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                value: failurePolicyDataValue,
            });
        }
    });
    const parameters: SetContactMethodAsDefaultParams = {
        partnerUserID: newDefaultContactMethod,
    };

    API.write(WRITE_COMMANDS.SET_CONTACT_METHOD_AS_DEFAULT, parameters, {
        optimisticData,
        successData,
        failureData,
    });
    Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.getRoute(backTo));
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
    API.write(WRITE_COMMANDS.CLEAR_STATUS, null, {optimisticData});
}

/**
 * Sets a custom status
 *
 * @param status.text
 * @param status.emojiCode
 * @param status.clearAfter - ISO 8601 format string, which represents the time when the status should be cleared
 */
function updateDraftCustomStatus(status: CustomStatusDraft) {
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
            key: ONYXKEYS.NVP_DISMISSED_REFERRAL_BANNERS,
            value: {
                [type]: true,
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

function dismissTrackTrainingModal() {
    const parameters: SetNameValuePairParams = {
        name: ONYXKEYS.NVP_HAS_SEEN_TRACK_TRAINING,
        value: true,
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_HAS_SEEN_TRACK_TRAINING,
            value: true,
        },
    ];

    API.write(WRITE_COMMANDS.SET_NAME_VALUE_PAIR, parameters, {
        optimisticData,
    });
}

function dismissWorkspaceTooltip() {
    Onyx.merge(ONYXKEYS.NVP_WORKSPACE_TOOLTIP, {shouldShow: false});
}

function dismissGBRTooltip() {
    Onyx.merge(ONYXKEYS.NVP_SHOULD_HIDE_GBR_TOOLTIP, true);
}

function requestRefund() {
    API.write(WRITE_COMMANDS.REQUEST_REFUND, null);
}

function subscribeToActiveGuides() {
    const pusherChannelName = `${CONST.PUSHER.PRESENCE_ACTIVE_GUIDES}${CONFIG.PUSHER.SUFFIX}`;
    Pusher.subscribe(pusherChannelName).catch(() => {
        Log.hmmm('[User] Failed to initially subscribe to Pusher channel', {pusherChannelName});
    });
}

function setIsDebugModeEnabled(isDebugModeEnabled: boolean) {
    Onyx.merge(ONYXKEYS.USER, {isDebugModeEnabled});
}

export {
    clearFocusModeNotification,
    closeAccount,
    dismissReferralBanner,
    dismissTrackTrainingModal,
    dismissWorkspaceTooltip,
    resendValidateCode,
    requestContactMethodValidateCode,
    updateNewsletterSubscription,
    deleteContactMethod,
    clearContactMethodErrors,
    clearContactMethod,
    addNewContactMethod,
    validateLogin,
    validateSecondaryLogin,
    isBlockedFromConcierge,
    subscribeToUserEvents,
    updatePreferredSkinTone,
    setShouldUseStagingServer,
    setMuteAllSounds,
    clearUserErrorMessage,
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
    requestRefund,
    saveNewContactMethodAndRequestValidationCode,
    clearUnvalidatedNewContactMethodAction,
    requestValidateCodeAction,
    addPendingContactMethod,
    clearValidateCodeActionError,
    subscribeToActiveGuides,
    dismissGBRTooltip,
    setIsDebugModeEnabled,
};
