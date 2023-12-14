import {format as timezoneFormat, utcToZonedTime} from 'date-fns-tz';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Str from 'expensify-common/lib/str';
import lodashDebounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import {DeviceEventEmitter, InteractionManager} from 'react-native';
import Onyx, {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import {NullishDeep} from 'react-native-onyx/lib/types';
import {PartialDeep, ValueOf} from 'type-fest';
import {Emoji} from '@assets/emojis/types';
import * as ActiveClientManager from '@libs/ActiveClientManager';
import * as API from '@libs/API';
import * as CollectionUtils from '@libs/CollectionUtils';
import DateUtils from '@libs/DateUtils';
import * as EmojiUtils from '@libs/EmojiUtils';
import * as Environment from '@libs/Environment/Environment';
import * as ErrorUtils from '@libs/ErrorUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import LocalNotification from '@libs/Notification/LocalNotification';
import {ReportCommentParams} from '@libs/Notification/LocalNotification/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as Pusher from '@libs/Pusher/pusher';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import Visibility from '@libs/Visibility';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {Route} from '@src/ROUTES';
import {PersonalDetails, PersonalDetailsList, ReportActionReactions, ReportUserIsTyping} from '@src/types/onyx';
import {Decision, OriginalMessageIOU} from '@src/types/onyx/OriginalMessage';
import Report, {NotificationPreference, WriteCapability} from '@src/types/onyx/Report';
import ReportAction, {Message, ReportActionBase, ReportActions} from '@src/types/onyx/ReportAction';
import {EmptyObject, isEmptyObject, isNotEmptyObject} from '@src/types/utils/EmptyObject';
import * as Session from './Session';
import * as Welcome from './Welcome';

type SubscriberCallback = (isFromCurrentUser: boolean, reportActionID: string | undefined) => void;

type ActionSubscriber = {
    reportID: string;
    callback: SubscriberCallback;
};

let currentUserAccountID = -1;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        // When signed out, val is undefined
        if (!value?.accountID) {
            return;
        }

        currentUserAccountID = value.accountID;
    },
});

let preferredSkinTone: number = CONST.EMOJI_DEFAULT_SKIN_TONE;
Onyx.connect({
    key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
    callback: (value) => {
        preferredSkinTone = EmojiUtils.getPreferredSkinToneIndex(value);
    },
});

const allReportActions: OnyxCollection<ReportActions> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (action, key) => {
        if (!key || !action) {
            return;
        }
        const reportID = CollectionUtils.extractCollectionItemID(key);
        allReportActions[reportID] = action;
    },
});

const currentReportData: OnyxCollection<Report> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (report, key) => {
        if (!key || !report) {
            return;
        }
        const reportID = CollectionUtils.extractCollectionItemID(key);
        currentReportData[reportID] = report;
    },
});

let isNetworkOffline = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (value) => {
        isNetworkOffline = value?.isOffline ?? false;
    },
});

let allPersonalDetails: OnyxEntry<PersonalDetailsList> = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        allPersonalDetails = value ?? {};
    },
});

const draftNoteMap: OnyxCollection<string> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.PRIVATE_NOTES_DRAFT,
    callback: (value, key) => {
        if (!key) {
            return;
        }

        const reportID = key.replace(ONYXKEYS.COLLECTION.PRIVATE_NOTES_DRAFT, '');
        draftNoteMap[reportID] = value;
    },
});

const allReports: OnyxCollection<Report> = {};
let conciergeChatReportID: string | undefined;
const typingWatchTimers: Record<string, NodeJS.Timeout> = {};

/** Get the private pusher channel name for a Report. */
function getReportChannelName(reportID: string): string {
    return `${CONST.PUSHER.PRIVATE_REPORT_CHANNEL_PREFIX}${reportID}${CONFIG.PUSHER.SUFFIX}`;
}

/**
 * There are 2 possibilities that we can receive via pusher for a user's typing/leaving status:
 * 1. The "new" way from New Expensify is passed as {[login]: Boolean} (e.g. {yuwen@expensify.com: true}), where the value
 * is whether the user with that login is typing/leaving on the report or not.
 * 2. The "old" way from e.com which is passed as {userLogin: login} (e.g. {userLogin: bstites@expensify.com})
 *
 * This method makes sure that no matter which we get, we return the "new" format
 */
function getNormalizedStatus(typingStatus: Pusher.UserIsTypingEvent | Pusher.UserIsLeavingRoomEvent): ReportUserIsTyping {
    let normalizedStatus: ReportUserIsTyping;

    if (typingStatus.userLogin) {
        normalizedStatus = {[typingStatus.userLogin]: true};
    } else {
        normalizedStatus = typingStatus;
    }

    return normalizedStatus;
}

/** Initialize our pusher subscriptions to listen for someone typing in a report. */
function subscribeToReportTypingEvents(reportID: string) {
    if (!reportID) {
        return;
    }

    // Make sure we have a clean Typing indicator before subscribing to typing events
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, {});

    const pusherChannelName = getReportChannelName(reportID);
    Pusher.subscribe(pusherChannelName, Pusher.TYPE.USER_IS_TYPING, (typingStatus) => {
        // If the pusher message comes from OldDot, we expect the typing status to be keyed by user
        // login OR by 'Concierge'. If the pusher message comes from NewDot, it is keyed by accountID
        // since personal details are keyed by accountID.
        const normalizedTypingStatus = getNormalizedStatus(typingStatus);
        const accountIDOrLogin = Object.keys(normalizedTypingStatus)[0];

        if (!accountIDOrLogin) {
            return;
        }

        // Don't show the typing indicator if the user is typing on another platform
        if (Number(accountIDOrLogin) === currentUserAccountID) {
            return;
        }

        // Use a combo of the reportID and the accountID or login as a key for holding our timers.
        const reportUserIdentifier = `${reportID}-${accountIDOrLogin}`;
        clearTimeout(typingWatchTimers[reportUserIdentifier]);
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, normalizedTypingStatus);

        // Wait for 1.5s of no additional typing events before setting the status back to false.
        typingWatchTimers[reportUserIdentifier] = setTimeout(() => {
            const typingStoppedStatus: ReportUserIsTyping = {};
            typingStoppedStatus[accountIDOrLogin] = false;
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, typingStoppedStatus);
            delete typingWatchTimers[reportUserIdentifier];
        }, 1500);
    }).catch((error) => {
        Log.hmmm('[Report] Failed to initially subscribe to Pusher channel', {errorType: error.type, pusherChannelName});
    });
}

/** Initialize our pusher subscriptions to listen for someone leaving a room. */
function subscribeToReportLeavingEvents(reportID: string) {
    if (!reportID) {
        return;
    }

    // Make sure we have a clean Leaving indicator before subscribing to leaving events
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportID}`, false);

    const pusherChannelName = getReportChannelName(reportID);
    Pusher.subscribe(pusherChannelName, Pusher.TYPE.USER_IS_LEAVING_ROOM, (leavingStatus: Pusher.UserIsLeavingRoomEvent) => {
        // If the pusher message comes from OldDot, we expect the leaving status to be keyed by user
        // login OR by 'Concierge'. If the pusher message comes from NewDot, it is keyed by accountID
        // since personal details are keyed by accountID.
        const normalizedLeavingStatus = getNormalizedStatus(leavingStatus);
        const accountIDOrLogin = Object.keys(normalizedLeavingStatus)[0];

        if (!accountIDOrLogin) {
            return;
        }

        if (Number(accountIDOrLogin) !== currentUserAccountID) {
            return;
        }

        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportID}`, true);
    }).catch((error) => {
        Log.hmmm('[Report] Failed to initially subscribe to Pusher channel', {errorType: error.type, pusherChannelName});
    });
}

/**
 * Remove our pusher subscriptions to listen for someone typing in a report.
 */
function unsubscribeFromReportChannel(reportID: string) {
    if (!reportID) {
        return;
    }

    const pusherChannelName = getReportChannelName(reportID);
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, {});
    Pusher.unsubscribe(pusherChannelName, Pusher.TYPE.USER_IS_TYPING);
}

/**
 * Remove our pusher subscriptions to listen for someone leaving a report.
 */
function unsubscribeFromLeavingRoomReportChannel(reportID: string) {
    if (!reportID) {
        return;
    }

    const pusherChannelName = getReportChannelName(reportID);
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportID}`, false);
    Pusher.unsubscribe(pusherChannelName, Pusher.TYPE.USER_IS_LEAVING_ROOM);
}

// New action subscriber array for report pages
let newActionSubscribers: ActionSubscriber[] = [];

/**
 * Enables the Report actions file to let the ReportActionsView know that a new comment has arrived in realtime for the current report
 * Add subscriber for report id
 * @returns Remove subscriber for report id
 */
function subscribeToNewActionEvent(reportID: string, callback: SubscriberCallback): () => void {
    newActionSubscribers.push({callback, reportID});
    return () => {
        newActionSubscribers = newActionSubscribers.filter((subscriber) => subscriber.reportID !== reportID);
    };
}

/** Notify the ReportActionsView that a new comment has arrived */
function notifyNewAction(reportID: string, accountID?: number, reportActionID?: string) {
    const actionSubscriber = newActionSubscribers.find((subscriber) => subscriber.reportID === reportID);
    if (!actionSubscriber) {
        return;
    }
    const isFromCurrentUser = accountID === currentUserAccountID;
    actionSubscriber.callback(isFromCurrentUser, reportActionID);
}

/**
 * Add up to two report actions to a report. This method can be called for the following situations:
 *
 * - Adding one comment
 * - Adding one attachment
 * - Add both a comment and attachment simultaneously
 */
function addActions(reportID: string, text = '', file?: File) {
    let reportCommentText = '';
    let reportCommentAction: Partial<ReportAction> | undefined;
    let attachmentAction: Partial<ReportAction> | undefined;
    let commandName = 'AddComment';

    if (text) {
        const reportComment = ReportUtils.buildOptimisticAddCommentReportAction(text);
        reportCommentAction = reportComment.reportAction;
        reportCommentText = reportComment.commentText;
    }

    if (file) {
        // When we are adding an attachment we will call AddAttachment.
        // It supports sending an attachment with an optional comment and AddComment supports adding a single text comment only.
        commandName = 'AddAttachment';
        const attachment = ReportUtils.buildOptimisticAddCommentReportAction('', file);
        attachmentAction = attachment.reportAction;
    }

    // Always prefer the file as the last action over text
    const lastAction = attachmentAction ?? reportCommentAction;
    const currentTime = DateUtils.getDBTime();
    const lastComment = lastAction?.message?.[0];
    const lastCommentText = ReportUtils.formatReportLastMessageText(lastComment?.text ?? '');

    const optimisticReport: Partial<Report> = {
        lastVisibleActionCreated: currentTime,
        lastMessageTranslationKey: lastComment?.translationKey ?? '',
        lastMessageText: lastCommentText,
        lastMessageHtml: lastCommentText,
        lastActorAccountID: currentUserAccountID,
        lastReadTime: currentTime,
    };

    const report = ReportUtils.getReport(reportID);

    if (isNotEmptyObject(report) && ReportUtils.getReportNotificationPreference(report) === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN) {
        optimisticReport.notificationPreference = CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS;
    }

    // Optimistically add the new actions to the store before waiting to save them to the server
    const optimisticReportActions: OnyxCollection<NullishDeep<ReportAction>> = {};
    if (text && reportCommentAction?.reportActionID) {
        optimisticReportActions[reportCommentAction.reportActionID] = reportCommentAction;
    }
    if (file && attachmentAction?.reportActionID) {
        optimisticReportActions[attachmentAction.reportActionID] = attachmentAction;
    }

    type AddCommentOrAttachementParameters = {
        reportID: string;
        reportActionID?: string;
        commentReportActionID?: string | null;
        reportComment?: string;
        file?: File;
        timezone?: string;
    };

    const parameters: AddCommentOrAttachementParameters = {
        reportID,
        reportActionID: file ? attachmentAction?.reportActionID : reportCommentAction?.reportActionID,
        commentReportActionID: file && reportCommentAction ? reportCommentAction.reportActionID : null,
        reportComment: reportCommentText,
        file,
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: optimisticReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: optimisticReportActions,
        },
    ];

    const successReportActions: OnyxCollection<NullishDeep<ReportAction>> = {};

    Object.entries(optimisticReportActions).forEach(([actionKey]) => {
        successReportActions[actionKey] = {pendingAction: null};
    });

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: successReportActions,
        },
    ];

    let failureReport: Partial<Report> = {
        lastMessageTranslationKey: '',
        lastMessageText: '',
        lastVisibleActionCreated: '',
    };
    const {lastMessageText = '', lastMessageTranslationKey = ''} = ReportActionsUtils.getLastVisibleMessage(reportID);
    if (lastMessageText || lastMessageTranslationKey) {
        const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(reportID);
        const lastVisibleActionCreated = lastVisibleAction?.created;
        const lastActorAccountID = lastVisibleAction?.actorAccountID;
        failureReport = {
            lastMessageTranslationKey,
            lastMessageText,
            lastVisibleActionCreated,
            lastActorAccountID,
        };
    }

    const failureReportActions: OnyxCollection<NullishDeep<ReportAction>> = {};

    Object.entries(optimisticReportActions).forEach(([actionKey, action]) => {
        failureReportActions[actionKey] = {
            ...action,
            errors: ErrorUtils.getMicroSecondOnyxError('report.genericAddCommentFailureMessage'),
        };
    });

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: failureReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: failureReportActions,
        },
    ];

    // Update optimistic data for parent report action if the report is a child report
    const optimisticParentReportData = ReportUtils.getOptimisticDataForParentReportAction(reportID, currentTime, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    if (isNotEmptyObject(optimisticParentReportData)) {
        optimisticData.push(optimisticParentReportData);
    }

    // Update the timezone if it's been 5 minutes from the last time the user added a comment
    if (DateUtils.canUpdateTimezone() && currentUserAccountID) {
        const timezone = DateUtils.getCurrentTimezone();
        parameters.timezone = JSON.stringify(timezone);
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {[currentUserAccountID]: {timezone}},
        });
        DateUtils.setTimezoneUpdated();
    }

    API.write(commandName, parameters, {
        optimisticData,
        successData,
        failureData,
    });
    notifyNewAction(reportID, lastAction?.actorAccountID, lastAction?.reportActionID);
}

/** Add an attachment and optional comment. */
function addAttachment(reportID: string, file: File, text = '') {
    addActions(reportID, text, file);
}

/** Add a single comment to a report */
function addComment(reportID: string, text: string) {
    addActions(reportID, text);
}

function reportActionsExist(reportID: string): boolean {
    return allReportActions?.[reportID] !== undefined;
}

/**
 * Gets the latest page of report actions and updates the last read message
 * If a chat with the passed reportID is not found, we will create a chat based on the passed participantList
 *
 * @param participantLoginList The list of users that are included in a new chat, not including the user creating it
 * @param newReportObject The optimistic report object created when making a new chat, saved as optimistic data
 * @param parentReportActionID The parent report action that a thread was created from (only passed for new threads)
 * @param isFromDeepLink Whether or not this report is being opened from a deep link
 * @param participantAccountIDList The list of accountIDs that are included in a new chat, not including the user creating it
 */
function openReport(
    reportID: string,
    participantLoginList: string[] = [],
    newReportObject: Partial<Report> = {},
    parentReportActionID = '0',
    isFromDeepLink = false,
    participantAccountIDList: number[] = [],
) {
    if (!reportID) {
        return;
    }

    const optimisticReport = reportActionsExist(reportID)
        ? {}
        : {
              reportName: allReports?.[reportID]?.reportName ?? CONST.REPORT.DEFAULT_REPORT_NAME,
          };

    const commandName = 'OpenReport';

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: optimisticReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingInitialReportActions: true,
                isLoadingOlderReportActions: false,
                isLoadingNewerReportActions: false,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingFields: {
                    createChat: null,
                },
                errorFields: {
                    createChat: null,
                },
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingInitialReportActions: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingInitialReportActions: false,
            },
        },
    ];

    type OpenReportParameters = {
        reportID: string;
        emailList?: string;
        accountIDList?: string;
        parentReportActionID?: string;
        shouldRetry?: boolean;
        createdReportActionID?: string;
        clientLastReadTime?: string;
        idempotencyKey?: string;
    };

    const parameters: OpenReportParameters = {
        reportID,
        emailList: participantLoginList ? participantLoginList.join(',') : '',
        accountIDList: participantAccountIDList ? participantAccountIDList.join(',') : '',
        parentReportActionID,
        idempotencyKey: `${commandName}_${reportID}`,
    };

    if (isFromDeepLink) {
        parameters.shouldRetry = false;
    }

    const report = ReportUtils.getReport(reportID);
    // If we open an exist report, but it is not present in Onyx yet, we should change the method to set for this report
    // and we need data to be available when we navigate to the chat page
    if (isEmptyObject(report)) {
        optimisticData[0].onyxMethod = Onyx.METHOD.SET;
    }

    // If we are creating a new report, we need to add the optimistic report data and a report action
    if (isNotEmptyObject(newReportObject)) {
        // Change the method to set for new reports because it doesn't exist yet, is faster,
        // and we need the data to be available when we navigate to the chat page
        optimisticData[0].onyxMethod = Onyx.METHOD.SET;
        optimisticData[0].value = {
            ...optimisticReport,
            reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
            ...newReportObject,
            pendingFields: {
                createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            isOptimisticReport: true,
        };

        let emailCreatingAction: string = CONST.REPORT.OWNER_EMAIL_FAKE;
        if (newReportObject.ownerAccountID && newReportObject.ownerAccountID !== CONST.REPORT.OWNER_ACCOUNT_ID_FAKE) {
            emailCreatingAction = allPersonalDetails?.[newReportObject.ownerAccountID]?.login ?? '';
        }
        const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(emailCreatingAction);
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {[optimisticCreatedAction.reportActionID]: optimisticCreatedAction},
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {[optimisticCreatedAction.reportActionID]: {pendingAction: null}},
        });

        // Add optimistic personal details for new participants
        const optimisticPersonalDetails: OnyxCollection<PersonalDetails> = {};
        const settledPersonalDetails: OnyxCollection<PersonalDetails> = {};
        participantLoginList.forEach((login, index) => {
            const accountID = newReportObject?.participantAccountIDs?.[index];

            if (!accountID) {
                return;
            }

            optimisticPersonalDetails[accountID] = allPersonalDetails?.[accountID] ?? {
                login,
                accountID,
                avatar: UserUtils.getDefaultAvatarURL(accountID),
                displayName: login,
                isOptimisticPersonalDetail: true,
            };

            settledPersonalDetails[accountID] = allPersonalDetails?.[accountID] ?? null;
        });

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: optimisticPersonalDetails,
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: settledPersonalDetails,
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: settledPersonalDetails,
        });

        // Add the createdReportActionID parameter to the API call
        parameters.createdReportActionID = optimisticCreatedAction.reportActionID;
        parameters.idempotencyKey = `${parameters.idempotencyKey}_NewReport_${optimisticCreatedAction.reportActionID}`;

        // If we are creating a thread, ensure the report action has childReportID property added
        if (newReportObject.parentReportID && parentReportActionID) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${newReportObject.parentReportID}`,
                value: {[parentReportActionID]: {childReportID: reportID, childType: CONST.REPORT.TYPE.CHAT}},
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${newReportObject.parentReportID}`,
                value: {[parentReportActionID]: {childReportID: '0', childType: ''}},
            });
        }
    }

    parameters.clientLastReadTime = currentReportData?.[reportID]?.lastReadTime ?? '';

    if (isFromDeepLink) {
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        API.makeRequestWithSideEffects(commandName, parameters, {optimisticData, successData, failureData}).finally(() => {
            Onyx.set(ONYXKEYS.IS_CHECKING_PUBLIC_ROOM, false);
        });
    } else {
        // eslint-disable-next-line rulesdir/no-multiple-api-calls
        API.write(commandName, parameters, {optimisticData, successData, failureData});
    }
}

/**
 * This will find an existing chat, or create a new one if none exists, for the given user or set of users. It will then navigate to this chat.
 *
 * @param userLogins list of user logins to start a chat report with.
 * @param shouldDismissModal a flag to determine if we should dismiss modal before navigate to report or navigate to report directly.
 */
function navigateToAndOpenReport(userLogins: string[], shouldDismissModal = true) {
    let newChat: ReportUtils.OptimisticChatReport | EmptyObject = {};

    const participantAccountIDs = PersonalDetailsUtils.getAccountIDsByLogins(userLogins);
    const chat = ReportUtils.getChatByParticipants(participantAccountIDs);

    if (!chat) {
        newChat = ReportUtils.buildOptimisticChatReport(participantAccountIDs);
    }
    const reportID = chat ? chat.reportID : newChat.reportID;

    // We want to pass newChat here because if anything is passed in that param (even an existing chat), we will try to create a chat on the server
    openReport(reportID, userLogins, newChat);
    if (shouldDismissModal) {
        Navigation.dismissModal(reportID);
    } else {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
    }
}

/**
 * This will find an existing chat, or create a new one if none exists, for the given accountID or set of accountIDs. It will then navigate to this chat.
 *
 * @param participantAccountIDs of user logins to start a chat report with.
 */
function navigateToAndOpenReportWithAccountIDs(participantAccountIDs: number[]) {
    let newChat: ReportUtils.OptimisticChatReport | EmptyObject = {};
    const chat = ReportUtils.getChatByParticipants(participantAccountIDs);
    if (!chat) {
        newChat = ReportUtils.buildOptimisticChatReport(participantAccountIDs);
    }
    const reportID = chat ? chat.reportID : newChat.reportID;

    // We want to pass newChat here because if anything is passed in that param (even an existing chat), we will try to create a chat on the server
    openReport(reportID, [], newChat, '0', false, participantAccountIDs);
    Navigation.dismissModal(reportID);
}

/**
 * This will navigate to an existing thread, or create a new one if necessary
 *
 * @param childReportID The reportID we are trying to open
 * @param parentReportAction the parent comment of a thread
 * @param parentReportID The reportID of the parent
 */
function navigateToAndOpenChildReport(childReportID = '0', parentReportAction: Partial<ReportAction> = {}, parentReportID = '0') {
    if (childReportID !== '0') {
        openReport(childReportID);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID));
    } else {
        const participantAccountIDs = [...new Set([currentUserAccountID, Number(parentReportAction.actorAccountID)])];
        const parentReport = allReports?.[parentReportID];
        const newChat = ReportUtils.buildOptimisticChatReport(
            participantAccountIDs,
            parentReportAction?.message?.[0]?.text,
            parentReport?.chatType,
            parentReport?.policyID ?? CONST.POLICY.OWNER_EMAIL_FAKE,
            CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
            false,
            '',
            undefined,
            undefined,
            CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
            parentReportAction.reportActionID,
            parentReportID,
        );

        const participantLogins = PersonalDetailsUtils.getLoginsByAccountIDs(newChat?.participantAccountIDs ?? []);
        openReport(newChat.reportID, participantLogins, newChat, parentReportAction.reportActionID);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(newChat.reportID));
    }
}

/** Get the latest report history without marking the report as read. */
function reconnect(reportID: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                reportName: allReports?.[reportID]?.reportName ?? CONST.REPORT.DEFAULT_REPORT_NAME,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingInitialReportActions: true,
                isLoadingNewerReportActions: false,
                isLoadingOlderReportActions: false,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingInitialReportActions: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingInitialReportActions: false,
            },
        },
    ];

    type ReconnectToReportParameters = {
        reportID: string;
    };

    const parameters: ReconnectToReportParameters = {
        reportID,
    };

    API.write('ReconnectToReport', parameters, {optimisticData, successData, failureData});
}

/**
 * Gets the older actions that have not been read yet.
 * Normally happens when you scroll up on a chat, and the actions have not been read yet.
 */
function getOlderActions(reportID: string, reportActionID: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingOlderReportActions: true,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingOlderReportActions: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingOlderReportActions: false,
            },
        },
    ];

    type GetOlderActionsParameters = {
        reportID: string;
        reportActionID: string;
    };

    const parameters: GetOlderActionsParameters = {
        reportID,
        reportActionID,
    };

    API.read('GetOlderActions', parameters, {optimisticData, successData, failureData});
}

/**
 * Gets the newer actions that have not been read yet.
 * Normally happens when you are not located at the bottom of the list and scroll down on a chat.
 */
function getNewerActions(reportID: string, reportActionID: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingNewerReportActions: true,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingNewerReportActions: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingNewerReportActions: false,
            },
        },
    ];

    type GetNewerActionsParameters = {
        reportID: string;
        reportActionID: string;
    };

    const parameters: GetNewerActionsParameters = {
        reportID,
        reportActionID,
    };

    API.read('GetNewerActions', parameters, {optimisticData, successData, failureData});
}

/**
 * Gets metadata info about links in the provided report action
 */
function expandURLPreview(reportID: string, reportActionID: string) {
    type ExpandURLPreviewParameters = {
        reportID: string;
        reportActionID: string;
    };

    const parameters: ExpandURLPreviewParameters = {
        reportID,
        reportActionID,
    };

    API.read('ExpandURLPreview', parameters);
}

/** Marks the new report actions as read */
function readNewestAction(reportID: string) {
    const lastReadTime = DateUtils.getDBTime();

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                lastReadTime,
            },
        },
    ];

    type ReadNewestActionParameters = {
        reportID: string;
        lastReadTime: string;
    };

    const parameters: ReadNewestActionParameters = {
        reportID,
        lastReadTime,
    };

    API.write('ReadNewestAction', parameters, {optimisticData});
}

/**
 * Sets the last read time on a report
 */
function markCommentAsUnread(reportID: string, reportActionCreated: string) {
    // If no action created date is provided, use the last action's
    const actionCreationTime = reportActionCreated || (allReports?.[reportID]?.lastVisibleActionCreated ?? DateUtils.getDBTime(0));

    // We subtract 1 millisecond so that the lastReadTime is updated to just before a given reportAction's created date
    // For example, if we want to mark a report action with ID 100 and created date '2014-04-01 16:07:02.999' unread, we set the lastReadTime to '2014-04-01 16:07:02.998'
    // Since the report action with ID 100 will be the first with a timestamp above '2014-04-01 16:07:02.998', it's the first one that will be shown as unread
    const lastReadTime = DateUtils.subtractMillisecondsFromDateTime(actionCreationTime, 1);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                lastReadTime,
            },
        },
    ];

    type MarkAsUnreadParameters = {
        reportID: string;
        lastReadTime: string;
    };

    const parameters: MarkAsUnreadParameters = {
        reportID,
        lastReadTime,
    };

    API.write('MarkAsUnread', parameters, {optimisticData});
    DeviceEventEmitter.emit(`unreadAction_${reportID}`, lastReadTime);
}

/** Toggles the pinned state of the report. */
function togglePinnedState(reportID: string, isPinnedChat: boolean) {
    const pinnedValue = !isPinnedChat;

    // Optimistically pin/unpin the report before we send out the command
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {isPinned: pinnedValue},
        },
    ];

    type TogglePinnedChatParameters = {
        reportID: string;
        pinnedValue: boolean;
    };

    const parameters: TogglePinnedChatParameters = {
        reportID,
        pinnedValue,
    };

    API.write('TogglePinnedChat', parameters, {optimisticData});
}

/**
 * Saves the comment left by the user as they are typing. By saving this data the user can switch between chats, close
 * tab, refresh etc without worrying about loosing what they typed out.
 */
function saveReportComment(reportID: string, comment: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, comment);
}

/** Saves the number of lines for the comment */
function saveReportCommentNumberOfLines(reportID: string, numberOfLines: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT_NUMBER_OF_LINES}${reportID}`, numberOfLines);
}

/** Immediate indication whether the report has a draft comment. */
function setReportWithDraft(reportID: string, hasDraft: boolean): Promise<void> {
    return Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {hasDraft});
}

/** Broadcasts whether or not a user is typing on a report over the report's private pusher channel. */
function broadcastUserIsTyping(reportID: string) {
    const privateReportChannelName = getReportChannelName(reportID);
    const typingStatus: Pusher.UserIsTypingEvent = {
        [currentUserAccountID]: true,
    };
    Pusher.sendEvent(privateReportChannelName, Pusher.TYPE.USER_IS_TYPING, typingStatus);
}

/** Broadcasts to the report's private pusher channel whether a user is leaving a report */
function broadcastUserIsLeavingRoom(reportID: string) {
    const privateReportChannelName = getReportChannelName(reportID);
    const leavingStatus: Pusher.UserIsLeavingRoomEvent = {
        [currentUserAccountID]: true,
    };
    Pusher.sendEvent(privateReportChannelName, Pusher.TYPE.USER_IS_LEAVING_ROOM, leavingStatus);
}

/** When a report changes in Onyx, this fetches the report from the API if the report doesn't have a name */
function handleReportChanged(report: OnyxEntry<Report>) {
    if (!report) {
        return;
    }

    // It is possible that we optimistically created a DM/group-DM for a set of users for which a report already exists.
    // In this case, the API will let us know by returning a preexistingReportID.
    // We should clear out the optimistically created report and re-route the user to the preexisting report.
    if (report?.reportID && report.preexistingReportID) {
        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, null);

        // Only re-route them if they are still looking at the optimistically created report
        if (Navigation.getActiveRoute().includes(`/r/${report.reportID}`)) {
            // Pass 'FORCED_UP' type to replace new report on second login with proper one in the Navigation
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.preexistingReportID), CONST.NAVIGATION.TYPE.FORCED_UP);
        }
        return;
    }

    if (allReports && report?.reportID) {
        allReports[report.reportID] = report;

        if (ReportUtils.isConciergeChatReport(report)) {
            conciergeChatReportID = report.reportID;
        }
    }

    // A report can be missing a name if a comment is received via pusher event and the report does not yet exist in Onyx (eg. a new DM created with the logged in person)
    // In this case, we call reconnect so that we can fetch the report data without marking it as read
    if (report.reportID && report.reportName === undefined) {
        reconnect(report.reportID);
    }
}

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: handleReportChanged,
});

/** Deletes a comment from the report, basically sets it as empty string */
function deleteReportComment(reportID: string, reportAction: ReportAction) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
    const reportActionID = reportAction.reportActionID;

    if (!reportActionID || !originalReportID) {
        return;
    }

    const deletedMessage: Message[] = [
        {
            translationKey: '',
            type: 'COMMENT',
            html: '',
            text: '',
            isEdited: true,
            isDeletedParentAction: ReportActionsUtils.isThreadParentMessage(reportAction, reportID),
        },
    ];
    const optimisticReportActions: NullishDeep<ReportActions> = {
        [reportActionID]: {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            previousMessage: reportAction.message,
            message: deletedMessage,
            errors: null,
            linkMetadata: [],
        },
    };

    // If we are deleting the last visible message, let's find the previous visible one (or set an empty one if there are none) and update the lastMessageText in the LHN.
    // Similarly, if we are deleting the last read comment we will want to update the lastVisibleActionCreated to use the previous visible message.
    let optimisticReport: Partial<Report> = {
        lastMessageTranslationKey: '',
        lastMessageText: '',
        lastVisibleActionCreated: '',
    };
    const {lastMessageText = '', lastMessageTranslationKey = ''} = ReportUtils.getLastVisibleMessage(originalReportID, optimisticReportActions as ReportActions);
    if (lastMessageText || lastMessageTranslationKey) {
        const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(originalReportID, optimisticReportActions as ReportActions);
        const lastVisibleActionCreated = lastVisibleAction?.created;
        const lastActorAccountID = lastVisibleAction?.actorAccountID;
        optimisticReport = {
            lastMessageTranslationKey,
            lastMessageText,
            lastVisibleActionCreated,
            lastActorAccountID,
        };
    }

    // If the API call fails we must show the original message again, so we revert the message content back to how it was
    // and and remove the pendingAction so the strike-through clears
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            value: {
                [reportActionID]: {
                    message: reportAction.message,
                    pendingAction: null,
                    previousMessage: null,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: null,
                    previousMessage: null,
                },
            },
        },
    ];

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            value: optimisticReportActions,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`,
            value: optimisticReport,
        },
    ];

    // Update optimistic data for parent report action if the report is a child report and the reportAction has no visible child
    const childVisibleActionCount = reportAction.childVisibleActionCount ?? 0;
    if (childVisibleActionCount === 0) {
        const optimisticParentReportData = ReportUtils.getOptimisticDataForParentReportAction(
            originalReportID,
            optimisticReport?.lastVisibleActionCreated ?? '',
            CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        );
        if (isNotEmptyObject(optimisticParentReportData)) {
            optimisticData.push(optimisticParentReportData);
        }
    }

    type DeleteCommentParameters = {
        reportID: string;
        reportActionID: string;
    };

    const parameters: DeleteCommentParameters = {
        reportID: originalReportID,
        reportActionID,
    };

    API.write('DeleteComment', parameters, {optimisticData, successData, failureData});
}

/**
 * Removes the links in html of a comment.
 * example:
 *      html="test <a href="https://www.google.com" target="_blank" rel="noreferrer noopener">https://www.google.com</a> test"
 *      links=["https://www.google.com"]
 * returns: "test https://www.google.com test"
 */
function removeLinksFromHtml(html: string, links: string[]): string {
    let htmlCopy = html.slice();
    links.forEach((link) => {
        // We want to match the anchor tag of the link and replace the whole anchor tag with the text of the anchor tag
        const regex = new RegExp(`<(a)[^><]*href\\s*=\\s*(['"])(${Str.escapeForRegExp(link)})\\2(?:".*?"|'.*?'|[^'"><])*>([\\s\\S]*?)<\\/\\1>(?![^<]*(<\\/pre>|<\\/code>))`, 'g');
        htmlCopy = htmlCopy.replace(regex, '$4');
    });
    return htmlCopy;
}

/**
 * This function will handle removing only links that were purposely removed by the user while editing.
 *
 * @param newCommentText text of the comment after editing.
 * @param originalCommentMarkdown original markdown of the comment before editing.
 */
function handleUserDeletedLinksInHtml(newCommentText: string, originalCommentMarkdown: string): string {
    const parser = new ExpensiMark();
    if (newCommentText.length > CONST.MAX_MARKUP_LENGTH) {
        return newCommentText;
    }
    const htmlForNewComment = parser.replace(newCommentText);
    const removedLinks = parser.getRemovedMarkdownLinks(originalCommentMarkdown, newCommentText);
    return removeLinksFromHtml(htmlForNewComment, removedLinks);
}

/** Saves a new message for a comment. Marks the comment as edited, which will be reflected in the UI. */
function editReportComment(reportID: string, originalReportAction: OnyxEntry<ReportAction>, textForNewComment: string) {
    const parser = new ExpensiMark();
    const originalReportID = ReportUtils.getOriginalReportID(reportID, originalReportAction);

    if (!originalReportID || !originalReportAction) {
        return;
    }

    // Do not autolink if someone explicitly tries to remove a link from message.
    // https://github.com/Expensify/App/issues/9090
    // https://github.com/Expensify/App/issues/13221
    const originalCommentHTML = originalReportAction.message?.[0]?.html;
    const originalCommentMarkdown = parser.htmlToMarkdown(originalCommentHTML ?? '').trim();

    // Skip the Edit if draft is not changed
    if (originalCommentMarkdown === textForNewComment) {
        return;
    }

    const htmlForNewComment = handleUserDeletedLinksInHtml(textForNewComment, originalCommentMarkdown);
    const reportComment = parser.htmlToText(htmlForNewComment);

    // For comments shorter than or equal to 10k chars, convert the comment from MD into HTML because that's how it is stored in the database
    // For longer comments, skip parsing and display plaintext for performance reasons. It takes over 40s to parse a 100k long string!!
    let parsedOriginalCommentHTML = originalCommentHTML;
    if (textForNewComment.length <= CONST.MAX_MARKUP_LENGTH) {
        const autolinkFilter = {filterRules: parser.rules.map((rule) => rule.name).filter((name) => name !== 'autolink')};
        parsedOriginalCommentHTML = parser.replace(originalCommentMarkdown, autolinkFilter);
    }

    //  Delete the comment if it's empty
    if (!htmlForNewComment) {
        deleteReportComment(originalReportID, originalReportAction);
        return;
    }

    // Skip the Edit if message is not changed
    if (parsedOriginalCommentHTML === htmlForNewComment.trim() || originalCommentHTML === htmlForNewComment.trim()) {
        return;
    }

    // Optimistically update the reportAction with the new message
    const reportActionID = originalReportAction.reportActionID;
    const originalMessage = originalReportAction?.message?.[0];
    const optimisticReportActions: PartialDeep<ReportActions> = {
        [reportActionID]: {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            message: [
                {
                    ...originalMessage,
                    type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                    isEdited: true,
                    html: htmlForNewComment,
                    text: reportComment,
                },
            ],
        },
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            value: optimisticReportActions,
        },
    ];

    const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(originalReportID, optimisticReportActions as ReportActions);
    if (reportActionID === lastVisibleAction?.reportActionID) {
        const lastMessageText = ReportUtils.formatReportLastMessageText(reportComment);
        const optimisticReport = {
            lastMessageTranslationKey: '',
            lastMessageText,
        };
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`,
            value: optimisticReport,
        });
    }

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            value: {
                [reportActionID]: {
                    ...originalReportAction,
                    pendingAction: null,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    type UpdateCommentParameters = {
        reportID: string;
        reportComment: string;
        reportActionID: string;
    };

    const parameters: UpdateCommentParameters = {
        reportID: originalReportID,
        reportComment: htmlForNewComment,
        reportActionID,
    };

    API.write('UpdateComment', parameters, {optimisticData, successData, failureData});
}

/** Saves the draft for a comment report action. This will put the comment into "edit mode" */
function saveReportActionDraft(reportID: string, reportAction: ReportAction, draftMessage: string) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`, {[reportAction.reportActionID]: draftMessage});
}

/** Saves the number of lines for the report action draft */
function saveReportActionDraftNumberOfLines(reportID: string, reportActionID: string, numberOfLines: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT_NUMBER_OF_LINES}${reportID}_${reportActionID}`, numberOfLines);
}

function updateNotificationPreference(
    reportID: string,
    previousValue: NotificationPreference | undefined,
    newValue: NotificationPreference,
    navigate: boolean,
    parentReportID?: string,
    parentReportActionID?: string,
    report: OnyxEntry<Report> | EmptyObject = {},
) {
    if (previousValue === newValue) {
        if (navigate && isNotEmptyObject(report) && report.reportID) {
            ReportUtils.goBackToDetailsPage(report);
        }
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {notificationPreference: newValue},
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {notificationPreference: previousValue},
        },
    ];

    if (parentReportID && parentReportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[parentReportActionID]: {childReportNotificationPreference: newValue}},
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[parentReportActionID]: {childReportNotificationPreference: previousValue}},
        });
    }

    type UpdateReportNotificationPreferenceParameters = {
        reportID: string;
        notificationPreference: NotificationPreference;
    };

    const parameters: UpdateReportNotificationPreferenceParameters = {reportID, notificationPreference: newValue};

    API.write('UpdateReportNotificationPreference', parameters, {optimisticData, failureData});
    if (navigate && isNotEmptyObject(report)) {
        ReportUtils.goBackToDetailsPage(report);
    }
}

/**
 * This will subscribe to an existing thread, or create a new one and then subsribe to it if necessary
 *
 * @param childReportID The reportID we are trying to open
 * @param parentReportAction the parent comment of a thread
 * @param parentReportID The reportID of the parent
 * @param prevNotificationPreference The previous notification preference for the child report
 */
function toggleSubscribeToChildReport(childReportID = '0', parentReportAction: Partial<ReportAction> = {}, parentReportID = '0', prevNotificationPreference?: NotificationPreference) {
    if (childReportID !== '0') {
        openReport(childReportID);
        const parentReportActionID = parentReportAction?.reportActionID ?? '0';
        if (!prevNotificationPreference || prevNotificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN) {
            updateNotificationPreference(childReportID, prevNotificationPreference, CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, false, parentReportID, parentReportActionID);
        } else {
            updateNotificationPreference(childReportID, prevNotificationPreference, CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, false, parentReportID, parentReportActionID);
        }
    } else {
        const participantAccountIDs = [...new Set([currentUserAccountID, Number(parentReportAction?.actorAccountID)])];
        const parentReport = allReports?.[parentReportID];
        const newChat = ReportUtils.buildOptimisticChatReport(
            participantAccountIDs,
            parentReportAction?.message?.[0]?.text,
            parentReport?.chatType,
            parentReport?.policyID ?? CONST.POLICY.OWNER_EMAIL_FAKE,
            CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
            false,
            '',
            undefined,
            undefined,
            CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            parentReportAction.reportActionID,
            parentReportID,
        );

        const participantLogins = PersonalDetailsUtils.getLoginsByAccountIDs(participantAccountIDs);
        openReport(newChat.reportID, participantLogins, newChat, parentReportAction.reportActionID);
        const notificationPreference =
            prevNotificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN ? CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS : CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
        updateNotificationPreference(newChat.reportID, prevNotificationPreference, notificationPreference, false, parentReportID, parentReportAction?.reportActionID);
    }
}

function updateWelcomeMessage(reportID: string, previousValue: string, newValue: string) {
    // No change needed, navigate back
    if (previousValue === newValue) {
        Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(reportID));
        return;
    }

    const parsedWelcomeMessage = ReportUtils.getParsedComment(newValue);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {welcomeMessage: parsedWelcomeMessage},
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {welcomeMessage: previousValue},
        },
    ];

    type UpdateWelcomeMessageParameters = {
        reportID: string;
        welcomeMessage: string;
    };

    const parameters: UpdateWelcomeMessageParameters = {reportID, welcomeMessage: parsedWelcomeMessage};

    API.write('UpdateWelcomeMessage', parameters, {optimisticData, failureData});
    Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(reportID));
}

function updateWriteCapabilityAndNavigate(report: Report, newValue: WriteCapability) {
    if (report.writeCapability === newValue) {
        Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(report.reportID));
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {writeCapability: newValue},
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {writeCapability: report.writeCapability},
        },
    ];

    type UpdateReportWriteCapabilityParameters = {
        reportID: string;
        writeCapability: WriteCapability;
    };

    const parameters: UpdateReportWriteCapabilityParameters = {reportID: report.reportID, writeCapability: newValue};

    API.write('UpdateReportWriteCapability', parameters, {optimisticData, failureData});
    // Return to the report settings page since this field utilizes push-to-page
    Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(report.reportID));
}

/**
 * Navigates to the 1:1 report with Concierge
 *
 * @param ignoreConciergeReportID - Flag to ignore conciergeChatReportID during navigation. The default behavior is to not ignore.
 */
function navigateToConciergeChat(ignoreConciergeReportID = false) {
    // If conciergeChatReportID contains a concierge report ID, we navigate to the concierge chat using the stored report ID.
    // Otherwise, we would find the concierge chat and navigate to it.
    // Now, when user performs sign-out and a sign-in again, conciergeChatReportID may contain a stale value.
    // In order to prevent navigation to a stale value, we use ignoreConciergeReportID to forcefully find and navigate to concierge chat.
    if (!conciergeChatReportID || ignoreConciergeReportID) {
        // In order to avoid creating concierge repeatedly,
        // we need to ensure that the server data has been successfully pulled
        Welcome.serverDataIsReadyPromise().then(() => {
            // If we don't have a chat with Concierge then create it
            navigateToAndOpenReport([CONST.EMAIL.CONCIERGE], false);
        });
    } else {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(conciergeChatReportID));
    }
}

/** Add a policy report (workspace room) optimistically and navigate to it. */
function addPolicyReport(policyReport: ReportUtils.OptimisticChatReport) {
    const createdReportAction = ReportUtils.buildOptimisticCreatedReportAction(CONST.POLICY.OWNER_EMAIL_FAKE);

    // Onyx.set is used on the optimistic data so that it is present before navigating to the workspace room. With Onyx.merge the workspace room reportID is not present when
    // fetchReportIfNeeded is called on the ReportScreen, so openReport is called which is unnecessary since the optimistic data will be stored in Onyx.
    // Therefore, Onyx.set is used instead of Onyx.merge.
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${policyReport.reportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...policyReport,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyReport.reportID}`,
            value: {[createdReportAction.reportActionID]: createdReportAction},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.NEW_ROOM_FORM,
            value: {isLoading: true},
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${policyReport.reportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyReport.reportID}`,
            value: {
                [createdReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.NEW_ROOM_FORM,
            value: {isLoading: false},
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${policyReport.reportID}`,
            value: {
                errorFields: {
                    addWorkspaceRoom: ErrorUtils.getMicroSecondOnyxError('report.genericCreateReportFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.NEW_ROOM_FORM,
            value: {isLoading: false},
        },
    ];

    type AddWorkspaceRoomParameters = {
        reportID: string;
        createdReportActionID: string;
        policyID?: string;
        reportName?: string;
        visibility?: ValueOf<typeof CONST.REPORT.VISIBILITY>;
        writeCapability?: WriteCapability;
        welcomeMessage?: string;
    };

    const parameters: AddWorkspaceRoomParameters = {
        policyID: policyReport.policyID,
        reportName: policyReport.reportName,
        visibility: policyReport.visibility,
        reportID: policyReport.reportID,
        createdReportActionID: createdReportAction.reportActionID,
        writeCapability: policyReport.writeCapability,
        welcomeMessage: policyReport.welcomeMessage,
    };

    API.write('AddWorkspaceRoom', parameters, {optimisticData, successData, failureData});
    Navigation.dismissModal(policyReport.reportID);
}

/** Deletes a report, along with its reportActions, any linked reports, and any linked IOU report. */
function deleteReport(reportID: string) {
    const report = allReports?.[reportID];
    const onyxData: Record<string, null> = {
        [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: null,
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]: null,
    };

    // Delete linked transactions
    const reportActionsForReport = allReportActions?.[reportID];

    const transactionIDs = Object.values(reportActionsForReport ?? {})
        .filter((reportAction): reportAction is ReportActionBase & OriginalMessageIOU => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU)
        .map((reportAction) => reportAction.originalMessage.IOUTransactionID);

    [...new Set(transactionIDs)].forEach((transactionID) => {
        onyxData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = null;
    });

    Onyx.multiSet(onyxData);

    // Delete linked IOU report
    if (report?.iouReportID) {
        deleteReport(report.iouReportID);
    }
}

/**
 * @param reportID The reportID of the policy report (workspace room)
 */
function navigateToConciergeChatAndDeleteReport(reportID: string) {
    // Dismiss the current report screen and replace it with Concierge Chat
    Navigation.goBack(ROUTES.HOME);
    navigateToConciergeChat();
    deleteReport(reportID);
}

/**
 * @param policyRoomName The updated name for the policy room
 */
function updatePolicyRoomNameAndNavigate(policyRoomReport: Report, policyRoomName: string) {
    const reportID = policyRoomReport.reportID;
    const previousName = policyRoomReport.reportName;

    // No change needed, navigate back
    if (previousName === policyRoomName) {
        Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(reportID));
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                reportName: policyRoomName,
                pendingFields: {
                    reportName: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    reportName: null,
                },
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingFields: {
                    reportName: null,
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                reportName: previousName,
            },
        },
    ];

    type UpdatePolicyRoomNameParameters = {
        reportID: string;
        policyRoomName: string;
    };

    const parameters: UpdatePolicyRoomNameParameters = {reportID, policyRoomName};

    API.write('UpdatePolicyRoomName', parameters, {optimisticData, successData, failureData});
    Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(reportID));
}

/**
 * @param reportID The reportID of the policy room.
 */
function clearPolicyRoomNameErrors(reportID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        errorFields: {
            reportName: null,
        },
        pendingFields: {
            reportName: null,
        },
    });
}

function setIsComposerFullSize(reportID: string, isComposerFullSize: boolean) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`, isComposerFullSize);
}

/**
 * @param action the associated report action (optional)
 * @param isRemote whether or not this notification is a remote push notification
 */
function shouldShowReportActionNotification(reportID: string, action: ReportAction | null = null, isRemote = false): boolean {
    const tag = isRemote ? '[PushNotification]' : '[LocalNotification]';

    // Due to payload size constraints, some push notifications may have their report action stripped
    // so we must double check that we were provided an action before using it in these checks.
    if (action && ReportActionsUtils.isDeletedAction(action)) {
        Log.info(`${tag} Skipping notification because the action was deleted`, false, {reportID, action});
        return false;
    }

    if (!ActiveClientManager.isClientTheLeader()) {
        Log.info(`${tag} Skipping notification because this client is not the leader`);
        return false;
    }

    // We don't want to send a local notification if the user preference is daily, mute or hidden.
    const notificationPreference = allReports?.[reportID]?.notificationPreference ?? CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS;
    if (notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS) {
        Log.info(`${tag} No notification because user preference is to be notified: ${notificationPreference}`);
        return false;
    }

    // If this comment is from the current user we don't want to parrot whatever they wrote back to them.
    if (action && action.actorAccountID === currentUserAccountID) {
        Log.info(`${tag} No notification because comment is from the currently logged in user`);
        return false;
    }

    // If we are currently viewing this report do not show a notification.
    if (reportID === Navigation.getTopmostReportId() && Visibility.isVisible() && Visibility.hasFocus()) {
        Log.info(`${tag} No notification because it was a comment for the current report`);
        return false;
    }

    const report = allReports?.[reportID];
    if (!report || (report && report.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)) {
        Log.info(`${tag} No notification because the report does not exist or is pending deleted`, false);
        return false;
    }

    // If this notification was delayed and the user saw the message already, don't show it
    if (action && report?.lastReadTime && report.lastReadTime >= action.created) {
        Log.info(`${tag} No notification because the comment was already read`, false, {created: action.created, lastReadTime: report.lastReadTime});
        return false;
    }

    // Only show notifications for supported types of report actions
    if (!ReportActionsUtils.isNotifiableReportAction(action)) {
        Log.info(`${tag} No notification because this action type is not supported`, false, {actionName: action?.actionName});
        return false;
    }

    return true;
}

function showReportActionNotification(reportID: string, reportAction: ReportAction) {
    if (!shouldShowReportActionNotification(reportID, reportAction)) {
        return;
    }

    Log.info('[LocalNotification] Creating notification');
    const report = allReports?.[reportID] ?? null;

    const notificationParams: ReportCommentParams = {
        report,
        reportAction,
        onClick: () => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID)),
    };
    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE) {
        LocalNotification.showModifiedExpenseNotification(notificationParams);
    } else {
        LocalNotification.showCommentNotification(notificationParams);
    }

    notifyNewAction(reportID, reportAction.actorAccountID, reportAction.reportActionID);
}

/** Clear the errors associated with the IOUs of a given report. */
function clearIOUError(reportID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {errorFields: {iou: null}});
}

/**
 * Adds a reaction to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 */
function addEmojiReaction(reportID: string, reportActionID: string, emoji: Emoji, skinTone: string | number = preferredSkinTone) {
    const createdAt = timezoneFormat(utcToZonedTime(new Date(), 'UTC'), CONST.DATE.FNS_DB_FORMAT_STRING);
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            value: {
                [emoji.name]: {
                    createdAt,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    users: {
                        [currentUserAccountID]: {
                            skinTones: {
                                [skinTone ?? CONST.EMOJI_DEFAULT_SKIN_TONE]: createdAt,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            value: {
                [emoji.name]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            value: {
                [emoji.name]: {
                    pendingAction: null,
                },
            },
        },
    ];

    type AddEmojiReactionParameters = {
        reportID: string;
        skinTone: string | number;
        emojiCode: string;
        reportActionID: string;
        createdAt: string;
        useEmojiReactions: boolean;
    };

    const parameters: AddEmojiReactionParameters = {
        reportID,
        skinTone,
        emojiCode: emoji.name,
        reportActionID,
        createdAt,
        // This will be removed as part of https://github.com/Expensify/App/issues/19535
        useEmojiReactions: true,
    };

    API.write('AddEmojiReaction', parameters, {optimisticData, successData, failureData});
}

/**
 * Removes a reaction to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 */
function removeEmojiReaction(reportID: string, reportActionID: string, emoji: Emoji) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            value: {
                [emoji.name]: {
                    users: {
                        [currentUserAccountID]: null,
                    },
                },
            },
        },
    ];

    type RemoveEmojiReactionParameters = {
        reportID: string;
        reportActionID: string;
        emojiCode: string;
        useEmojiReactions: boolean;
    };

    const parameters: RemoveEmojiReactionParameters = {
        reportID,
        reportActionID,
        emojiCode: emoji.name,
        // This will be removed as part of https://github.com/Expensify/App/issues/19535
        useEmojiReactions: true,
    };

    API.write('RemoveEmojiReaction', parameters, {optimisticData});
}

/**
 * Calls either addEmojiReaction or removeEmojiReaction depending on if the current user has reacted to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 */
function toggleEmojiReaction(
    reportID: string,
    reportAction: ReportAction,
    reactionObject: Emoji,
    existingReactions: ReportActionReactions | undefined,
    paramSkinTone: number = preferredSkinTone,
) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);

    if (!originalReportID) {
        return;
    }

    const originalReportAction = ReportActionsUtils.getReportAction(originalReportID, reportAction.reportActionID);

    if (isEmptyObject(originalReportAction)) {
        return;
    }

    // This will get cleaned up as part of https://github.com/Expensify/App/issues/16506 once the old emoji
    // format is no longer being used
    const emoji = EmojiUtils.findEmojiByCode(reactionObject.code);
    const existingReactionObject = existingReactions?.[emoji.name];

    // Only use skin tone if emoji supports it
    const skinTone = emoji.types === undefined ? -1 : paramSkinTone;

    if (existingReactionObject && EmojiUtils.hasAccountIDEmojiReacted(currentUserAccountID, existingReactionObject.users, skinTone)) {
        removeEmojiReaction(originalReportID, reportAction.reportActionID, emoji);
        return;
    }

    addEmojiReaction(originalReportID, reportAction.reportActionID, emoji, skinTone);
}

function openReportFromDeepLink(url: string, isAuthenticated: boolean) {
    const reportID = ReportUtils.getReportIDFromLink(url);

    if (reportID && !isAuthenticated) {
        // Call the OpenReport command to check in the server if it's a public room. If so, we'll open it as an anonymous user
        openReport(reportID, [], {}, '0', true);

        // Show the sign-in page if the app is offline
        if (isNetworkOffline) {
            Onyx.set(ONYXKEYS.IS_CHECKING_PUBLIC_ROOM, false);
        }
    } else {
        // If we're not opening a public room (no reportID) or the user is authenticated, we unblock the UI (hide splash screen)
        Onyx.set(ONYXKEYS.IS_CHECKING_PUBLIC_ROOM, false);
    }

    // Navigate to the report after sign-in/sign-up.
    InteractionManager.runAfterInteractions(() => {
        Session.waitForUserSignIn().then(() => {
            Navigation.waitForProtectedRoutes().then(() => {
                const route = ReportUtils.getRouteFromLink(url);
                if (route === ROUTES.CONCIERGE) {
                    navigateToConciergeChat(true);
                    return;
                }
                if (Session.isAnonymousUser() && !Session.canAccessRouteByAnonymousUser(route)) {
                    Session.signOutAndRedirectToSignIn();
                    return;
                }

                // We don't want to navigate to the exitTo route when creating a new workspace from a deep link,
                // because we already handle creating the optimistic policy and navigating to it in App.setUpPoliciesAndNavigate,
                // which is already called when AuthScreens mounts.
                if (new URL(url).searchParams.get('exitTo') === ROUTES.WORKSPACE_NEW) {
                    return;
                }

                Navigation.navigate(route as Route, CONST.NAVIGATION.ACTION_TYPE.PUSH);
            });
        });
    });
}

function getCurrentUserAccountID(): number {
    return currentUserAccountID;
}

/** Leave a report by setting the state to submitted and closed */
function leaveRoom(reportID: string, isWorkspaceMemberLeavingWorkspaceRoom = false) {
    const report = allReports?.[reportID];

    if (!report) {
        return;
    }

    // Pusher's leavingStatus should be sent earlier.
    // Place the broadcast before calling the LeaveRoom API to prevent a race condition
    // between Onyx report being null and Pusher's leavingStatus becoming true.
    broadcastUserIsLeavingRoom(reportID);

    // If a workspace member is leaving a workspace room, they don't actually lose the room from Onyx.
    // Instead, their notification preference just gets set to "hidden".
    const optimisticData: OnyxUpdate[] = [
        isWorkspaceMemberLeavingWorkspaceRoom
            ? {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                  value: {
                      notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                  value: {
                      reportID,
                      stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                      statusNum: CONST.REPORT.STATUS.CLOSED,
                      chatType: report.chatType,
                      parentReportID: report.parentReportID,
                      parentReportActionID: report.parentReportActionID,
                      policyID: report.policyID,
                      type: report.type,
                  },
              },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: isWorkspaceMemberLeavingWorkspaceRoom
                ? {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN}
                : Object.keys(report).reduce<Record<string, null>>((acc, key) => {
                      acc[key] = null;
                      return acc;
                  }, {}),
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: report,
        },
    ];

    type LeaveRoomParameters = {
        reportID: string;
    };

    const parameters: LeaveRoomParameters = {
        reportID,
    };

    API.write('LeaveRoom', parameters, {optimisticData, successData, failureData});

    if (isWorkspaceMemberLeavingWorkspaceRoom) {
        const participantAccountIDs = PersonalDetailsUtils.getAccountIDsByLogins([CONST.EMAIL.CONCIERGE]);
        const chat = ReportUtils.getChatByParticipants(participantAccountIDs);
        if (chat?.reportID) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(chat.reportID));
        }
    }
}

/** Invites people to a room */
function inviteToRoom(reportID: string, inviteeEmailsToAccountIDs: Record<string, number>) {
    const report = allReports?.[reportID];

    if (!report) {
        return;
    }

    const inviteeEmails = Object.keys(inviteeEmailsToAccountIDs);
    const inviteeAccountIDs = Object.values(inviteeEmailsToAccountIDs);
    const participantAccountIDsAfterInvitation = [...new Set([...(report?.participantAccountIDs ?? []), ...inviteeAccountIDs])].filter(
        (accountID): accountID is number => typeof accountID === 'number',
    );

    type PersonalDetailsOnyxData = {
        optimisticData: OnyxUpdate[];
        successData: OnyxUpdate[];
        failureData: OnyxUpdate[];
    };

    const logins = inviteeEmails.map((memberLogin) => OptionsListUtils.addSMSDomainIfPhoneNumber(memberLogin));
    const newPersonalDetailsOnyxData = PersonalDetailsUtils.getNewPersonalDetailsOnyxData(logins, inviteeAccountIDs) as PersonalDetailsOnyxData;

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                participantAccountIDs: participantAccountIDsAfterInvitation,
            },
        },
        ...newPersonalDetailsOnyxData.optimisticData,
    ];

    const successData: OnyxUpdate[] = newPersonalDetailsOnyxData.successData;

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                participantAccountIDs: report.participantAccountIDs,
            },
        },
        ...newPersonalDetailsOnyxData.failureData,
    ];

    type InviteToRoomParameters = {
        reportID: string;
        inviteeEmails: string[];
    };

    const parameters: InviteToRoomParameters = {
        reportID,
        inviteeEmails,
    };

    API.write('InviteToRoom', parameters, {optimisticData, successData, failureData});
}

/** Removes people from a room */
function removeFromRoom(reportID: string, targetAccountIDs: number[]) {
    const report = allReports?.[reportID];

    const participantAccountIDsAfterRemoval = report?.participantAccountIDs?.filter((id: number) => !targetAccountIDs.includes(id));

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                participantAccountIDs: participantAccountIDsAfterRemoval,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                participantAccountIDs: report?.participantAccountIDs,
            },
        },
    ];

    // We need to add success data here since in high latency situations,
    // the OpenRoomMembersPage call has the chance of overwriting the optimistic data we set above.
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                participantAccountIDs: participantAccountIDsAfterRemoval,
            },
        },
    ];

    type RemoveFromRoomParameters = {
        reportID: string;
        targetAccountIDs: number[];
    };

    const parameters: RemoveFromRoomParameters = {
        reportID,
        targetAccountIDs,
    };

    API.write('RemoveFromRoom', parameters, {optimisticData, failureData, successData});
}

function setLastOpenedPublicRoom(reportID: string) {
    Onyx.set(ONYXKEYS.LAST_OPENED_PUBLIC_ROOM_ID, reportID);
}

/** Navigates to the last opened public room */
function openLastOpenedPublicRoom(lastOpenedPublicRoomID: string) {
    Navigation.isNavigationReady().then(() => {
        setLastOpenedPublicRoom('');
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(lastOpenedPublicRoomID));
    });
}

/** Flag a comment as offensive */
function flagComment(reportID: string, reportAction: OnyxEntry<ReportAction>, severity: string) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
    const message = reportAction?.message?.[0];

    if (!message) {
        return;
    }

    let updatedDecision: Decision;
    if (severity === CONST.MODERATION.FLAG_SEVERITY_SPAM || severity === CONST.MODERATION.FLAG_SEVERITY_INCONSIDERATE) {
        if (!message?.moderationDecision) {
            updatedDecision = {
                decision: CONST.MODERATION.MODERATOR_DECISION_PENDING,
            };
        } else {
            updatedDecision = message.moderationDecision;
        }
    } else if (severity === CONST.MODERATION.FLAG_SEVERITY_ASSAULT || severity === CONST.MODERATION.FLAG_SEVERITY_HARASSMENT) {
        updatedDecision = {
            decision: CONST.MODERATION.MODERATOR_DECISION_PENDING_REMOVE,
        };
    } else {
        updatedDecision = {
            decision: CONST.MODERATION.MODERATOR_DECISION_PENDING_HIDE,
        };
    }

    const reportActionID = reportAction.reportActionID;

    const updatedMessage: Message = {
        ...message,
        moderationDecision: updatedDecision,
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    message: [updatedMessage],
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            value: {
                [reportActionID]: {
                    ...reportAction,
                    pendingAction: null,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    type FlagCommentParameters = {
        severity: string;
        reportActionID: string;
        isDevRequest: boolean;
    };

    const parameters: FlagCommentParameters = {
        severity,
        reportActionID,
        // This check is to prevent flooding Concierge with test flags
        // If you need to test moderation responses from Concierge on dev, set this to false!
        isDevRequest: Environment.isDevelopment(),
    };

    API.write('FlagComment', parameters, {optimisticData, successData, failureData});
}

/** Updates a given user's private notes on a report */
const updatePrivateNotes = (reportID: string, accountID: number, note: string) => {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                privateNotes: {
                    [accountID]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        errors: null,
                        note,
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                privateNotes: {
                    [accountID]: {
                        pendingAction: null,
                        errors: null,
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                privateNotes: {
                    [accountID]: {
                        errors: ErrorUtils.getMicroSecondOnyxError("Private notes couldn't be saved"),
                    },
                },
            },
        },
    ];

    type UpdateReportPrivateNoteParameters = {
        reportID: string;
        privateNotes: string;
    };

    const parameters: UpdateReportPrivateNoteParameters = {reportID, privateNotes: note};

    API.write('UpdateReportPrivateNote', parameters, {optimisticData, successData, failureData});
};

/** Fetches all the private notes for a given report */
function getReportPrivateNote(reportID: string) {
    if (!reportID) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                isLoadingPrivateNotes: true,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                isLoadingPrivateNotes: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                isLoadingPrivateNotes: false,
            },
        },
    ];

    type GetReportPrivateNoteParameters = {
        reportID: string;
    };

    const parameters: GetReportPrivateNoteParameters = {reportID};

    API.read('GetReportPrivateNote', parameters, {optimisticData, successData, failureData});
}

/** Loads necessary data for rendering the RoomMembersPage */
function openRoomMembersPage(reportID: string) {
    type OpenRoomMembersPageParameters = {
        reportID: string;
    };

    const parameters: OpenRoomMembersPageParameters = {reportID};

    API.read('OpenRoomMembersPage', parameters);
}

/**
 * Checks if there are any errors in the private notes for a given report
 *
 * @returns Returns true if there are errors in any of the private notes on the report
 */
function hasErrorInPrivateNotes(report: OnyxEntry<Report>): boolean {
    const privateNotes = report?.privateNotes ?? {};
    return Object.values(privateNotes).some((privateNote) => !isEmpty(privateNote.errors));
}

/** Clears all errors associated with a given private note */
function clearPrivateNotesError(reportID: string, accountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {privateNotes: {[accountID]: {errors: null}}});
}

function getDraftPrivateNote(reportID: string): string {
    return draftNoteMap?.[reportID] ?? '';
}

/**
 * Saves the private notes left by the user as they are typing. By saving this data the user can switch between chats, close
 * tab, refresh etc without worrying about loosing what they typed out.
 */
function savePrivateNotesDraft(reportID: string, note: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_NOTES_DRAFT}${reportID}`, note);
}

function searchForReports(searchInput: string) {
    // We do not try to make this request while offline because it sets a loading indicator optimistically
    if (isNetworkOffline) {
        Onyx.set(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, false);
        return;
    }

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_SEARCHING_FOR_REPORTS,
            value: false,
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_SEARCHING_FOR_REPORTS,
            value: false,
        },
    ];

    type SearchForReportsParameters = {
        searchInput: string;
    };

    const parameters: SearchForReportsParameters = {searchInput};

    API.read('SearchForReports', parameters, {successData, failureData});
}

const debouncedSearchInServer = lodashDebounce(searchForReports, CONST.TIMING.SEARCH_FOR_REPORTS_DEBOUNCE_TIME, {leading: false});

function searchInServer(searchInput: string) {
    if (isNetworkOffline || !searchInput.trim().length) {
        Onyx.set(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, false);
        return;
    }

    // Why not set this in optimistic data? It won't run until the API request happens and while the API request is debounced
    // we want to show the loading state right away. Otherwise, we will see a flashing UI where the client options are sorted and
    // tell the user there are no options, then we start searching, and tell them there are no options again.
    Onyx.set(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, true);
    debouncedSearchInServer(searchInput);
}

function clearNewRoomFormError() {
    Onyx.set(ONYXKEYS.FORMS.NEW_ROOM_FORM, {
        isLoading: false,
        errorFields: {},
    });
}

export {
    searchInServer,
    addComment,
    addAttachment,
    reconnect,
    updateWelcomeMessage,
    updateWriteCapabilityAndNavigate,
    updateNotificationPreference,
    subscribeToReportTypingEvents,
    subscribeToReportLeavingEvents,
    unsubscribeFromReportChannel,
    unsubscribeFromLeavingRoomReportChannel,
    saveReportComment,
    saveReportCommentNumberOfLines,
    broadcastUserIsTyping,
    broadcastUserIsLeavingRoom,
    togglePinnedState,
    editReportComment,
    handleUserDeletedLinksInHtml,
    saveReportActionDraft,
    saveReportActionDraftNumberOfLines,
    deleteReportComment,
    navigateToConciergeChat,
    setReportWithDraft,
    addPolicyReport,
    deleteReport,
    navigateToConciergeChatAndDeleteReport,
    setIsComposerFullSize,
    expandURLPreview,
    markCommentAsUnread,
    readNewestAction,
    openReport,
    openReportFromDeepLink,
    navigateToAndOpenReport,
    navigateToAndOpenReportWithAccountIDs,
    navigateToAndOpenChildReport,
    toggleSubscribeToChildReport,
    updatePolicyRoomNameAndNavigate,
    clearPolicyRoomNameErrors,
    clearIOUError,
    subscribeToNewActionEvent,
    notifyNewAction,
    showReportActionNotification,
    toggleEmojiReaction,
    shouldShowReportActionNotification,
    leaveRoom,
    inviteToRoom,
    removeFromRoom,
    getCurrentUserAccountID,
    setLastOpenedPublicRoom,
    flagComment,
    openLastOpenedPublicRoom,
    updatePrivateNotes,
    getReportPrivateNote,
    clearPrivateNotesError,
    hasErrorInPrivateNotes,
    getOlderActions,
    getNewerActions,
    openRoomMembersPage,
    savePrivateNotesDraft,
    getDraftPrivateNote,
    clearNewRoomFormError,
};
