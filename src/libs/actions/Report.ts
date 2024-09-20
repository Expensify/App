import {findFocusedRoute} from '@react-navigation/native';
import {format as timezoneFormat, utcToZonedTime} from 'date-fns-tz';
import {Str} from 'expensify-common';
import isEmpty from 'lodash/isEmpty';
import {DeviceEventEmitter, InteractionManager, Linking} from 'react-native';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {PartialDeep, ValueOf} from 'type-fest';
import type {Emoji} from '@assets/emojis/types';
import type {FileObject} from '@components/AttachmentModal';
import * as ActiveClientManager from '@libs/ActiveClientManager';
import * as API from '@libs/API';
import type {
    AddCommentOrAttachementParams,
    AddEmojiReactionParams,
    AddWorkspaceRoomParams,
    CompleteGuidedSetupParams,
    DeleteCommentParams,
    ExpandURLPreviewParams,
    FlagCommentParams,
    GetNewerActionsParams,
    GetOlderActionsParams,
    GetReportPrivateNoteParams,
    InviteToGroupChatParams,
    InviteToRoomParams,
    LeaveRoomParams,
    MarkAsExportedParams,
    MarkAsUnreadParams,
    OpenReportParams,
    OpenRoomMembersPageParams,
    ReadNewestActionParams,
    RemoveEmojiReactionParams,
    RemoveFromGroupChatParams,
    RemoveFromRoomParams,
    ReportExportParams,
    ResolveActionableMentionWhisperParams,
    ResolveActionableReportMentionWhisperParams,
    SearchForReportsParams,
    SearchForRoomsToMentionParams,
    TogglePinnedChatParams,
    UpdateCommentParams,
    UpdateGroupChatAvatarParams,
    UpdateGroupChatMemberRolesParams,
    UpdateGroupChatNameParams,
    UpdatePolicyRoomNameParams,
    UpdateReportNotificationPreferenceParams,
    UpdateReportPrivateNoteParams,
    UpdateReportWriteCapabilityParams,
    UpdateRoomDescriptionParams,
} from '@libs/API/parameters';
import type UpdateRoomVisibilityParams from '@libs/API/parameters/UpdateRoomVisibilityParams';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as CollectionUtils from '@libs/CollectionUtils';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import DateUtils from '@libs/DateUtils';
import {prepareDraftComment} from '@libs/DraftCommentUtils';
import * as EmojiUtils from '@libs/EmojiUtils';
import * as Environment from '@libs/Environment/Environment';
import * as ErrorUtils from '@libs/ErrorUtils';
import hasCompletedGuidedSetupFlowSelector from '@libs/hasCompletedGuidedSetupFlowSelector';
import HttpUtils from '@libs/HttpUtils';
import isPublicScreenRoute from '@libs/isPublicScreenRoute';
import * as Localize from '@libs/Localize';
import Log from '@libs/Log';
import {registerPaginationConfig} from '@libs/Middleware/Pagination';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {isOnboardingFlowName} from '@libs/NavigationUtils';
import type {NetworkStatus} from '@libs/NetworkConnection';
import LocalNotification from '@libs/Notification/LocalNotification';
import Parser from '@libs/Parser';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PhoneNumber from '@libs/PhoneNumber';
import getPolicyEmployeeAccountIDs from '@libs/PolicyEmployeeListUtils';
import {extractPolicyIDFromPath} from '@libs/PolicyUtils';
import processReportIDDeeplink from '@libs/processReportIDDeeplink';
import * as Pusher from '@libs/Pusher/pusher';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportConnection from '@libs/ReportConnection';
import type {OptimisticAddCommentReportAction} from '@libs/ReportUtils';
import * as ReportUtils from '@libs/ReportUtils';
import {doesReportBelongToWorkspace} from '@libs/ReportUtils';
import shouldSkipDeepLinkNavigation from '@libs/shouldSkipDeepLinkNavigation';
import Visibility from '@libs/Visibility';
import CONFIG from '@src/CONFIG';
import type {OnboardingPurposeType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NewRoomForm';
import type {
    InvitedEmailsToAccountIDs,
    NewGroupChatDraft,
    PersonalDetailsList,
    PolicyReportField,
    QuickAction,
    RecentlyUsedReportFields,
    ReportAction,
    ReportActionReactions,
    ReportUserIsTyping,
} from '@src/types/onyx';
import type {Decision} from '@src/types/onyx/OriginalMessage';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type {NotificationPreference, Participants, Participant as ReportParticipant, RoomVisibility, WriteCapability} from '@src/types/onyx/Report';
import type Report from '@src/types/onyx/Report';
import type {Message, ReportActions} from '@src/types/onyx/ReportAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import * as CachedPDFPaths from './CachedPDFPaths';
import * as Modal from './Modal';
import navigateFromNotification from './navigateFromNotification';
import * as Session from './Session';
import * as Welcome from './Welcome';
import * as OnboardingFlow from './Welcome/OnboardingFlow';

type SubscriberCallback = (isFromCurrentUser: boolean, reportActionID: string | undefined) => void;

type ActionSubscriber = {
    reportID: string;
    callback: SubscriberCallback;
};

type Video = {
    url: string;
    thumbnailUrl: string;
    duration: number;
    width: number;
    height: number;
};

type TaskMessage = Required<Pick<AddCommentOrAttachementParams, 'reportID' | 'reportActionID' | 'reportComment'>>;

type TaskForParameters =
    | {
          type: 'task';
          task: string;
          taskReportID: string;
          parentReportID: string;
          parentReportActionID: string;
          assigneeChatReportID: string;
          createdTaskReportActionID: string;
          completedTaskReportActionID?: string;
          title: string;
          description: string;
      }
    | ({
          type: 'message';
      } & TaskMessage);

type GuidedSetupData = Array<
    | ({type: 'message'} & AddCommentOrAttachementParams)
    | TaskForParameters
    | ({
          type: 'video';
      } & Video &
          AddCommentOrAttachementParams)
>;

type ReportError = {
    type?: string;
};

let conciergeChatReportID: string | undefined;
let currentUserAccountID = -1;
let currentUserEmail: string | undefined;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        // When signed out, val is undefined
        if (!value?.accountID) {
            conciergeChatReportID = undefined;
            return;
        }
        currentUserEmail = value.email;
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

// map of reportID to all reportActions for that report
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

let isNetworkOffline = false;
let networkStatus: NetworkStatus;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (value) => {
        isNetworkOffline = value?.isOffline ?? false;
        networkStatus = value?.networkStatus ?? CONST.NETWORK.NETWORK_STATUS.UNKNOWN;
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

const typingWatchTimers: Record<string, NodeJS.Timeout> = {};

let reportIDDeeplinkedFromOldDot: string | undefined;
Linking.getInitialURL().then((url) => {
    reportIDDeeplinkedFromOldDot = processReportIDDeeplink(url ?? '');
});

let lastVisitedPath: string | undefined;
Onyx.connect({
    key: ONYXKEYS.LAST_VISITED_PATH,
    callback: (value) => {
        if (!value) {
            return;
        }
        lastVisitedPath = value;
    },
});

let allRecentlyUsedReportFields: OnyxEntry<RecentlyUsedReportFields> = {};
Onyx.connect({
    key: ONYXKEYS.RECENTLY_USED_REPORT_FIELDS,
    callback: (val) => (allRecentlyUsedReportFields = val),
});

let quickAction: OnyxEntry<QuickAction> = {};
Onyx.connect({
    key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
    callback: (val) => (quickAction = val),
});

let allReportDraftComments: Record<string, string | undefined> = {};

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
    waitForCollectionCallback: true,
    callback: (value) => (allReportDraftComments = value),
});
let delegateEmail = '';
Onyx.connect({
    key: ONYXKEYS.ACCOUNT,
    callback: (value) => {
        delegateEmail = value?.delegatedAccess?.delegate ?? '';
    },
});

let environmentURL: string;
Environment.getEnvironmentURL().then((url: string) => (environmentURL = url));

registerPaginationConfig({
    initialCommand: WRITE_COMMANDS.OPEN_REPORT,
    previousCommand: READ_COMMANDS.GET_OLDER_ACTIONS,
    nextCommand: READ_COMMANDS.GET_NEWER_ACTIONS,
    resourceCollectionKey: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    pageCollectionKey: ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES,
    sortItems: (reportActions) => ReportActionsUtils.getSortedReportActionsForDisplay(reportActions, true),
    getItemID: (reportAction) => reportAction.reportActionID,
    isLastItem: (reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED,
});

function clearGroupChat() {
    Onyx.set(ONYXKEYS.NEW_GROUP_CHAT_DRAFT, null);
}

function startNewChat() {
    clearGroupChat();
    Navigation.navigate(ROUTES.NEW);
}

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
    }).catch((error: ReportError) => {
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
    }).catch((error: ReportError) => {
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
function addActions(reportID: string, text = '', file?: FileObject) {
    let reportCommentText = '';
    let reportCommentAction: OptimisticAddCommentReportAction | undefined;
    let attachmentAction: OptimisticAddCommentReportAction | undefined;
    let commandName: typeof WRITE_COMMANDS.ADD_COMMENT | typeof WRITE_COMMANDS.ADD_ATTACHMENT | typeof WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT = WRITE_COMMANDS.ADD_COMMENT;

    if (text && !file) {
        const reportComment = ReportUtils.buildOptimisticAddCommentReportAction(delegateEmail, text, undefined, undefined, undefined, undefined, reportID);
        reportCommentAction = reportComment.reportAction;
        reportCommentText = reportComment.commentText;
    }

    if (file) {
        // When we are adding an attachment we will call AddAttachment.
        // It supports sending an attachment with an optional comment and AddComment supports adding a single text comment only.
        commandName = WRITE_COMMANDS.ADD_ATTACHMENT;
        const attachment = ReportUtils.buildOptimisticAddCommentReportAction(delegateEmail, text, file, undefined, undefined, undefined, reportID);
        attachmentAction = attachment.reportAction;
    }

    if (text && file) {
        // When there is both text and a file, the text for the report comment needs to be parsed)
        reportCommentText = ReportUtils.getParsedComment(text ?? '', {reportID});

        // And the API command needs to go to the new API which supports combining both text and attachments in a single report action
        commandName = WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT;
    }

    // Always prefer the file as the last action over text
    const lastAction = attachmentAction ?? reportCommentAction;
    const currentTime = DateUtils.getDBTimeWithSkew();
    const lastComment = ReportActionsUtils.getReportActionMessage(lastAction);
    const lastCommentText = ReportUtils.formatReportLastMessageText(lastComment?.text ?? '');

    const optimisticReport: Partial<Report> = {
        lastVisibleActionCreated: lastAction?.created,
        lastMessageTranslationKey: lastComment?.translationKey ?? '',
        lastMessageText: lastCommentText,
        lastMessageHtml: lastCommentText,
        lastActorAccountID: currentUserAccountID,
        lastReadTime: currentTime,
    };

    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const shouldUpdateNotificationPrefernece = !isEmptyObject(report) && ReportUtils.getReportNotificationPreference(report) === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;

    if (shouldUpdateNotificationPrefernece) {
        optimisticReport.participants = {
            [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
        };
    }

    // Optimistically add the new actions to the store before waiting to save them to the server
    const optimisticReportActions: OnyxCollection<OptimisticAddCommentReportAction> = {};

    // Only add the reportCommentAction when there is no file attachment. If there is both a file attachment and text, that will all be contained in the attachmentAction.
    if (text && reportCommentAction?.reportActionID && !file) {
        optimisticReportActions[reportCommentAction.reportActionID] = reportCommentAction;
    }
    if (file && attachmentAction?.reportActionID) {
        optimisticReportActions[attachmentAction.reportActionID] = attachmentAction;
    }

    const parameters: AddCommentOrAttachementParams = {
        reportID,
        reportActionID: file ? attachmentAction?.reportActionID : reportCommentAction?.reportActionID,
        commentReportActionID: file && reportCommentAction ? reportCommentAction.reportActionID : null,
        reportComment: reportCommentText,
        file,
        clientCreatedTime: file ? attachmentAction?.created : reportCommentAction?.created,
    };

    if (reportIDDeeplinkedFromOldDot === reportID && ReportUtils.isConciergeChatReport(report)) {
        parameters.isOldDotConciergeChat = true;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: optimisticReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: optimisticReportActions as ReportActions,
        },
    ];

    const successReportActions: OnyxCollection<NullishDeep<ReportAction>> = {};

    Object.entries(optimisticReportActions).forEach(([actionKey]) => {
        successReportActions[actionKey] = {pendingAction: null, isOptimisticAction: null};
    });

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: successReportActions,
        },
    ];

    if (shouldUpdateNotificationPrefernece) {
        // optimisticReport.notificationPreference = CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS;
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                participants: {
                    [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            },
        });
    }

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

    const failureReportActions: Record<string, OptimisticAddCommentReportAction> = {};

    Object.entries(optimisticReportActions).forEach(([actionKey, action]) => {
        failureReportActions[actionKey] = {
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            ...(action as OptimisticAddCommentReportAction),
            errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericAddCommentFailureMessage'),
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
            value: failureReportActions as ReportActions,
        },
    ];

    // Update optimistic data for parent report action if the report is a child report
    const optimisticParentReportData = ReportUtils.getOptimisticDataForParentReportAction(reportID, currentTime, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    optimisticParentReportData.forEach((parentReportData) => {
        if (isEmptyObject(parentReportData)) {
            return;
        }
        optimisticData.push(parentReportData);
    });

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
function addAttachment(reportID: string, file: FileObject, text = '') {
    addActions(reportID, text, file);
}

/** Add a single comment to a report */
function addComment(reportID: string, text: string) {
    addActions(reportID, text);
}

function reportActionsExist(reportID: string): boolean {
    return allReportActions?.[reportID] !== undefined;
}

function updateGroupChatName(reportID: string, reportName: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                reportName,
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
                reportName: ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.reportName ?? null,
                pendingFields: {
                    reportName: null,
                },
            },
        },
    ];
    const parameters: UpdateGroupChatNameParams = {reportName, reportID};
    API.write(WRITE_COMMANDS.UPDATE_GROUP_CHAT_NAME, parameters, {optimisticData, successData, failureData});
}

function updateGroupChatAvatar(reportID: string, file?: File | CustomRNImageManipulatorResult) {
    // If we have no file that means we are removing the avatar.
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                avatarUrl: file ? file?.uri ?? '' : null,
                avatarFileName: file ? file?.name ?? '' : null,
                pendingFields: {
                    avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    avatar: null,
                },
            },
        },
    ];

    const fetchedReport = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                avatarUrl: fetchedReport?.avatarUrl ?? null,
                avatarFileName: fetchedReport?.avatarFileName ?? null,
                pendingFields: {
                    avatar: null,
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
                    avatar: null,
                },
            },
        },
    ];
    const parameters: UpdateGroupChatAvatarParams = {file, reportID};
    API.write(WRITE_COMMANDS.UPDATE_GROUP_CHAT_AVATAR, parameters, {optimisticData, failureData, successData});
}

/**
 * Clear error and pending fields for the report avatar
 */
function clearAvatarErrors(reportID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        errorFields: {
            avatar: null,
        },
    });
}

/**
 * Gets the latest page of report actions and updates the last read message
 * If a chat with the passed reportID is not found, we will create a chat based on the passed participantList
 *
 * @param reportID The ID of the report to open
 * @param reportActionID The ID used to fetch a specific range of report actions related to the current reportActionID when opening a chat.
 * @param participantLoginList The list of users that are included in a new chat, not including the user creating it
 * @param newReportObject The optimistic report object created when making a new chat, saved as optimistic data
 * @param parentReportActionID The parent report action that a thread was created from (only passed for new threads)
 * @param isFromDeepLink Whether or not this report is being opened from a deep link
 * @param participantAccountIDList The list of accountIDs that are included in a new chat, not including the user creating it
 */
function openReport(
    reportID: string,
    reportActionID?: string,
    participantLoginList: string[] = [],
    newReportObject?: ReportUtils.OptimisticChatReport,
    parentReportActionID = '-1',
    isFromDeepLink = false,
    participantAccountIDList: number[] = [],
    avatar?: File | CustomRNImageManipulatorResult,
) {
    if (!reportID) {
        return;
    }

    const optimisticReport = reportActionsExist(reportID)
        ? {}
        : {
              reportName: ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.reportName ?? CONST.REPORT.DEFAULT_REPORT_NAME,
          };

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
                hasLoadingOlderReportActionsError: false,
                isLoadingNewerReportActions: false,
                hasLoadingNewerReportActionsError: false,
                lastVisitTime: DateUtils.getDBTime(),
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                errorFields: {
                    notFound: null,
                },
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

    const parameters: OpenReportParams = {
        reportID,
        reportActionID,
        emailList: participantLoginList ? participantLoginList.join(',') : '',
        accountIDList: participantAccountIDList ? participantAccountIDList.join(',') : '',
        parentReportActionID,
    };

    if (ReportUtils.isGroupChat(newReportObject)) {
        parameters.chatType = CONST.REPORT.CHAT_TYPE.GROUP;
        parameters.groupChatAdminLogins = currentUserEmail;
        parameters.optimisticAccountIDList = Object.keys(newReportObject?.participants ?? {}).join(',');
        parameters.reportName = newReportObject?.reportName ?? '';

        // If we have an avatar then include it with the parameters
        if (avatar) {
            parameters.file = avatar;
        }

        clearGroupChat();
    }

    if (isFromDeepLink) {
        parameters.shouldRetry = false;
    }

    // If we are creating a new report, we need to add the optimistic report data and a report action
    const isCreatingNewReport = !isEmptyObject(newReportObject);
    if (isCreatingNewReport) {
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
        const optimisticPersonalDetails: OnyxEntry<PersonalDetailsList> = {};
        const settledPersonalDetails: OnyxEntry<PersonalDetailsList> = {};
        const redundantParticipants: Record<number, null> = {};
        const participantAccountIDs = PersonalDetailsUtils.getAccountIDsByLogins(participantLoginList);
        participantLoginList.forEach((login, index) => {
            const accountID = participantAccountIDs[index];
            const isOptimisticAccount = !allPersonalDetails?.[accountID];

            if (!isOptimisticAccount) {
                return;
            }

            optimisticPersonalDetails[accountID] = {
                login,
                accountID,
                displayName: login,
                isOptimisticPersonalDetail: true,
            };
            settledPersonalDetails[accountID] = null;

            // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
            redundantParticipants[accountID] = null;
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                participants: redundantParticipants,
                pendingFields: {
                    createChat: null,
                },
                errorFields: {
                    createChat: null,
                },
                isOptimisticReport: false,
            },
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
                value: {[parentReportActionID]: {childReportID: '-1', childType: ''}},
            });
        }
    }

    parameters.clientLastReadTime = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.lastReadTime ?? '';

    const paginationConfig = {
        resourceID: reportID,
        cursorID: reportActionID,
    };

    if (isFromDeepLink) {
        API.paginate(
            CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS,
            SIDE_EFFECT_REQUEST_COMMANDS.OPEN_REPORT,
            parameters,
            {optimisticData, successData, failureData},
            paginationConfig,
        ).finally(() => {
            Onyx.set(ONYXKEYS.IS_CHECKING_PUBLIC_ROOM, false);
        });
    } else {
        // eslint-disable-next-line rulesdir/no-multiple-api-calls
        API.paginate(CONST.API_REQUEST_TYPE.WRITE, WRITE_COMMANDS.OPEN_REPORT, parameters, {optimisticData, successData, failureData}, paginationConfig);
    }
}

/**
 * This will find an existing chat, or create a new one if none exists, for the given user or set of users. It will then navigate to this chat.
 *
 * @param userLogins list of user logins to start a chat report with.
 * @param shouldDismissModal a flag to determine if we should dismiss modal before navigate to report or navigate to report directly.
 */
function navigateToAndOpenReport(
    userLogins: string[],
    shouldDismissModal = true,
    actionType?: string,
    reportName?: string,
    avatarUri?: string,
    avatarFile?: File | CustomRNImageManipulatorResult | undefined,
    optimisticReportID?: string,
    isGroupChat = false,
) {
    let newChat: ReportUtils.OptimisticChatReport | undefined;
    let chat: OnyxEntry<Report>;
    const participantAccountIDs = PersonalDetailsUtils.getAccountIDsByLogins(userLogins);

    // If we are not creating a new Group Chat then we are creating a 1:1 DM and will look for an existing chat
    if (!isGroupChat) {
        chat = ReportUtils.getChatByParticipants([...participantAccountIDs, currentUserAccountID]);
    }

    if (isEmptyObject(chat)) {
        if (isGroupChat) {
            // If we are creating a group chat then participantAccountIDs is expected to contain currentUserAccountID
            newChat = ReportUtils.buildOptimisticGroupChatReport(
                participantAccountIDs,
                reportName ?? '',
                avatarUri ?? '',
                avatarFile?.name ?? '',
                optimisticReportID,
                CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            );
        } else {
            newChat = ReportUtils.buildOptimisticChatReport(
                [...participantAccountIDs, currentUserAccountID],
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            );
        }
    }
    const report = isEmptyObject(chat) ? newChat : chat;

    // We want to pass newChat here because if anything is passed in that param (even an existing chat), we will try to create a chat on the server
    openReport(report?.reportID ?? '', '', userLogins, newChat, undefined, undefined, undefined, avatarFile);
    if (shouldDismissModal) {
        Navigation.dismissModalWithReport(report);
    } else {
        Navigation.navigateWithSwitchPolicyID({route: ROUTES.HOME});
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report?.reportID ?? '-1'), actionType);
    }
}

/**
 * This will find an existing chat, or create a new one if none exists, for the given accountID or set of accountIDs. It will then navigate to this chat.
 *
 * @param participantAccountIDs of user logins to start a chat report with.
 */
function navigateToAndOpenReportWithAccountIDs(participantAccountIDs: number[]) {
    let newChat: ReportUtils.OptimisticChatReport | undefined;
    const chat = ReportUtils.getChatByParticipants([...participantAccountIDs, currentUserAccountID]);
    if (!chat) {
        newChat = ReportUtils.buildOptimisticChatReport([...participantAccountIDs, currentUserAccountID]);
    }
    const report = chat ?? newChat;

    // We want to pass newChat here because if anything is passed in that param (even an existing chat), we will try to create a chat on the server
    openReport(report?.reportID ?? '', '', [], newChat, '0', false, participantAccountIDs);
    Navigation.dismissModalWithReport(report);
}

/**
 * This will navigate to an existing thread, or create a new one if necessary
 *
 * @param childReportID The reportID we are trying to open
 * @param parentReportAction the parent comment of a thread
 * @param parentReportID The reportID of the parent
 */
function navigateToAndOpenChildReport(childReportID = '-1', parentReportAction: Partial<ReportAction> = {}, parentReportID = '0') {
    if (childReportID !== '-1' && childReportID !== '0') {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID));
    } else {
        const participantAccountIDs = [...new Set([currentUserAccountID, Number(parentReportAction.actorAccountID)])];
        const parentReport = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`];
        // Threads from DMs and selfDMs don't have a chatType. All other threads inherit the chatType from their parent
        const childReportChatType = parentReport && ReportUtils.isSelfDM(parentReport) ? undefined : parentReport?.chatType;
        const newChat = ReportUtils.buildOptimisticChatReport(
            participantAccountIDs,
            ReportActionsUtils.getReportActionText(parentReportAction),
            childReportChatType,
            parentReport?.policyID ?? CONST.POLICY.OWNER_EMAIL_FAKE,
            CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
            false,
            parentReport?.policyName ?? '',
            undefined,
            undefined,
            ReportUtils.getChildReportNotificationPreference(parentReportAction),
            parentReportAction.reportActionID,
            parentReportID,
        );

        const participantLogins = PersonalDetailsUtils.getLoginsByAccountIDs(Object.keys(newChat.participants ?? {}).map(Number));
        openReport(newChat.reportID, '', participantLogins, newChat, parentReportAction.reportActionID);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(newChat.reportID));
    }
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
                hasLoadingOlderReportActionsError: false,
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
                hasLoadingOlderReportActionsError: true,
            },
        },
    ];

    const parameters: GetOlderActionsParams = {
        reportID,
        reportActionID,
    };

    API.paginate(
        CONST.API_REQUEST_TYPE.READ,
        READ_COMMANDS.GET_OLDER_ACTIONS,
        parameters,
        {optimisticData, successData, failureData},
        {
            resourceID: reportID,
            cursorID: reportActionID,
        },
    );
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
                hasLoadingNewerReportActionsError: false,
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
                hasLoadingNewerReportActionsError: true,
            },
        },
    ];

    const parameters: GetNewerActionsParams = {
        reportID,
        reportActionID,
    };

    API.paginate(
        CONST.API_REQUEST_TYPE.READ,
        READ_COMMANDS.GET_NEWER_ACTIONS,
        parameters,
        {optimisticData, successData, failureData},
        {
            resourceID: reportID,
            cursorID: reportActionID,
        },
    );
}

/**
 * Gets metadata info about links in the provided report action
 */
function expandURLPreview(reportID: string, reportActionID: string) {
    const parameters: ExpandURLPreviewParams = {
        reportID,
        reportActionID,
    };

    API.read(READ_COMMANDS.EXPAND_URL_PREVIEW, parameters);
}

/** Marks the new report actions as read
 * @param shouldResetUnreadMarker Indicates whether the unread indicator should be reset.
 * Currently, the unread indicator needs to be reset only when users mark a report as read.
 */
function readNewestAction(reportID: string, shouldResetUnreadMarker = false) {
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

    const parameters: ReadNewestActionParams = {
        reportID,
        lastReadTime,
    };

    API.write(WRITE_COMMANDS.READ_NEWEST_ACTION, parameters, {optimisticData});
    if (shouldResetUnreadMarker) {
        DeviceEventEmitter.emit(`readNewestAction_${reportID}`, lastReadTime);
    }
}

/**
 * Sets the last read time on a report
 */
function markCommentAsUnread(reportID: string, reportActionCreated: string) {
    if (reportID === '-1') {
        Log.warn('7339cd6c-3263-4f89-98e5-730f0be15784 Invalid report passed to MarkCommentAsUnread. Not calling the API because it wil fail.');
        return;
    }

    const reportActions = allReportActions?.[reportID];

    // Find the latest report actions from other users
    const latestReportActionFromOtherUsers = Object.values(reportActions ?? {}).reduce((latest: ReportAction | null, current: ReportAction) => {
        if (
            current.actorAccountID !== currentUserAccountID &&
            (!latest || current.created > latest.created) &&
            // Whisper action doesn't affect lastVisibleActionCreated, so skip whisper action except actionable mention whisper
            (!ReportActionsUtils.isWhisperAction(current) || current.actionName === CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER)
        ) {
            return current;
        }
        return latest;
    }, null);

    // If no action created date is provided, use the last action's from other user
    const actionCreationTime =
        reportActionCreated ||
        (latestReportActionFromOtherUsers?.created ?? ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.lastVisibleActionCreated ?? DateUtils.getDBTime(0));

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

    const parameters: MarkAsUnreadParams = {
        reportID,
        lastReadTime,
    };

    API.write(WRITE_COMMANDS.MARK_AS_UNREAD, parameters, {optimisticData});
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

    const parameters: TogglePinnedChatParams = {
        reportID,
        pinnedValue,
    };

    API.write(WRITE_COMMANDS.TOGGLE_PINNED_CHAT, parameters, {optimisticData});
}

/**
 * Saves the comment left by the user as they are typing. By saving this data the user can switch between chats, close
 * tab, refresh etc without worrying about loosing what they typed out.
 * When empty string or null is passed, it will delete the draft comment from Onyx store.
 */
function saveReportDraftComment(reportID: string, comment: string | null, callback: () => void = () => {}) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, prepareDraftComment(comment)).then(callback);
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
        let callback = () => {
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, null);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`, null);
        };
        // Only re-route them if they are still looking at the optimistically created report
        if (Navigation.getActiveRoute().includes(`/r/${report.reportID}`)) {
            const currCallback = callback;
            callback = () => {
                currCallback();
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.preexistingReportID ?? '-1'), CONST.NAVIGATION.TYPE.UP);
            };

            // The report screen will listen to this event and transfer the draft comment to the existing report
            // This will allow the newest draft comment to be transferred to the existing report
            DeviceEventEmitter.emit(`switchToPreExistingReport_${report.reportID}`, {
                preexistingReportID: report.preexistingReportID,
                callback,
            });

            return;
        }

        // In case the user is not on the report screen, we will transfer the report draft comment directly to the existing report
        // after that clear the optimistically created report
        const draftReportComment = allReportDraftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`];
        if (!draftReportComment) {
            callback();
            return;
        }

        saveReportDraftComment(report.preexistingReportID ?? '-1', draftReportComment, callback);

        return;
    }

    if (report?.reportID) {
        if (ReportUtils.isConciergeChatReport(report)) {
            conciergeChatReportID = report.reportID;
        }
    }
}

/** Deletes a comment from the report, basically sets it as empty string */
function deleteReportComment(reportID: string, reportAction: ReportAction) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
    const reportActionID = reportAction.reportActionID;

    if (!reportActionID || !originalReportID) {
        return;
    }

    const isDeletedParentAction = ReportActionsUtils.isThreadParentMessage(reportAction, reportID);
    const deletedMessage: Message[] = [
        {
            translationKey: '',
            type: 'COMMENT',
            html: '',
            text: '',
            isEdited: true,
            isDeletedParentAction,
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
    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const didCommentMentionCurrentUser = ReportActionsUtils.didMessageMentionCurrentUser(reportAction);
    if (didCommentMentionCurrentUser && reportAction.created === report?.lastMentionedTime) {
        const reportActionsForReport = allReportActions?.[reportID];
        const latestMentioneReportAction = Object.values(reportActionsForReport ?? {}).find(
            (action) => action.reportActionID !== reportAction.reportActionID && ReportActionsUtils.didMessageMentionCurrentUser(action),
        );
        optimisticReport.lastMentionedTime = latestMentioneReportAction?.created ?? null;
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
        optimisticParentReportData.forEach((parentReportData) => {
            if (isEmptyObject(parentReportData)) {
                return;
            }
            optimisticData.push(parentReportData);
        });
    }

    const parameters: DeleteCommentParams = {
        reportID: originalReportID,
        reportActionID,
    };

    CachedPDFPaths.clearByKey(reportActionID);

    API.write(WRITE_COMMANDS.DELETE_COMMENT, parameters, {optimisticData, successData, failureData});

    // if we are linking to the report action, and we are deleting it, and it's not a deleted parent action,
    // we should navigate to its report in order to not show not found page
    if (Navigation.isActiveRoute(ROUTES.REPORT_WITH_ID.getRoute(reportID, reportActionID)) && !isDeletedParentAction) {
        Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(reportID), true);
    }
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
 * @param videoAttributeCache cache of video attributes ([videoSource]: videoAttributes)
 */
function handleUserDeletedLinksInHtml(newCommentText: string, originalCommentMarkdown: string, videoAttributeCache?: Record<string, string>): string {
    if (newCommentText.length > CONST.MAX_MARKUP_LENGTH) {
        return newCommentText;
    }

    const textWithMention = ReportUtils.completeShortMention(newCommentText);

    const htmlForNewComment = Parser.replace(textWithMention, {
        extras: {videoAttributeCache},
    });
    const removedLinks = Parser.getRemovedMarkdownLinks(originalCommentMarkdown, textWithMention);
    return removeLinksFromHtml(htmlForNewComment, removedLinks);
}

/** Saves a new message for a comment. Marks the comment as edited, which will be reflected in the UI. */
function editReportComment(reportID: string, originalReportAction: OnyxEntry<ReportAction>, textForNewComment: string, videoAttributeCache?: Record<string, string>) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, originalReportAction);

    if (!originalReportID || !originalReportAction) {
        return;
    }

    // Do not autolink if someone explicitly tries to remove a link from message.
    // https://github.com/Expensify/App/issues/9090
    // https://github.com/Expensify/App/issues/13221
    const originalCommentHTML = ReportActionsUtils.getReportActionHtml(originalReportAction);
    const originalCommentMarkdown = Parser.htmlToMarkdown(originalCommentHTML ?? '').trim();

    // Skip the Edit if draft is not changed
    if (originalCommentMarkdown === textForNewComment) {
        return;
    }
    const htmlForNewComment = handleUserDeletedLinksInHtml(textForNewComment, originalCommentMarkdown, videoAttributeCache);

    const reportComment = Parser.htmlToText(htmlForNewComment);

    // For comments shorter than or equal to 10k chars, convert the comment from MD into HTML because that's how it is stored in the database
    // For longer comments, skip parsing and display plaintext for performance reasons. It takes over 40s to parse a 100k long string!!
    let parsedOriginalCommentHTML = originalCommentHTML;
    if (textForNewComment.length <= CONST.MAX_MARKUP_LENGTH) {
        const autolinkFilter = {filterRules: Parser.rules.map((rule) => rule.name).filter((name) => name !== 'autolink')};
        parsedOriginalCommentHTML = Parser.replace(originalCommentMarkdown, autolinkFilter);
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
    const originalMessage = ReportActionsUtils.getReportActionMessage(originalReportAction);
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
            lastModified: DateUtils.getDBTime(),
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

    const parameters: UpdateCommentParams = {
        reportID: originalReportID,
        reportComment: htmlForNewComment,
        reportActionID,
    };

    API.write(WRITE_COMMANDS.UPDATE_COMMENT, parameters, {optimisticData, successData, failureData});
}

/** Deletes the draft for a comment report action. */
function deleteReportActionDraft(reportID: string, reportAction: ReportAction) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`, {[reportAction.reportActionID]: null});
}

/** Saves the draft for a comment report action. This will put the comment into "edit mode" */
function saveReportActionDraft(reportID: string, reportAction: ReportAction, draftMessage: string) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`, {[reportAction.reportActionID]: {message: draftMessage}});
}

function updateNotificationPreference(
    reportID: string,
    previousValue: NotificationPreference | undefined,
    newValue: NotificationPreference,
    navigate: boolean,
    parentReportID?: string,
    parentReportActionID?: string,
    report?: OnyxEntry<Report>,
) {
    if (previousValue === newValue) {
        if (navigate && !isEmptyObject(report) && report.reportID) {
            ReportUtils.goBackToDetailsPage(report);
        }
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                participants: {
                    [currentUserAccountID]: {
                        notificationPreference: newValue,
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
                participants: {
                    [currentUserAccountID]: {
                        notificationPreference: previousValue,
                    },
                },
            },
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

    const parameters: UpdateReportNotificationPreferenceParams = {reportID, notificationPreference: newValue};

    API.write(WRITE_COMMANDS.UPDATE_REPORT_NOTIFICATION_PREFERENCE, parameters, {optimisticData, failureData});
    if (navigate && !isEmptyObject(report)) {
        ReportUtils.goBackToDetailsPage(report);
    }
}

function updateRoomVisibility(reportID: string, previousValue: RoomVisibility | undefined, newValue: RoomVisibility) {
    if (previousValue === newValue) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {visibility: newValue},
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {visibility: previousValue},
        },
    ];

    const parameters: UpdateRoomVisibilityParams = {reportID, visibility: newValue};

    API.write(WRITE_COMMANDS.UPDATE_ROOM_VISIBILITY, parameters, {optimisticData, failureData});
}

/**
 * This will subscribe to an existing thread, or create a new one and then subsribe to it if necessary
 *
 * @param childReportID The reportID we are trying to open
 * @param parentReportAction the parent comment of a thread
 * @param parentReportID The reportID of the parent
 * @param prevNotificationPreference The previous notification preference for the child report
 */
function toggleSubscribeToChildReport(childReportID = '-1', parentReportAction: Partial<ReportAction> = {}, parentReportID = '-1', prevNotificationPreference?: NotificationPreference) {
    if (childReportID !== '-1') {
        openReport(childReportID);
        const parentReportActionID = parentReportAction?.reportActionID ?? '-1';
        if (!prevNotificationPreference || prevNotificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN) {
            updateNotificationPreference(childReportID, prevNotificationPreference, CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, false, parentReportID, parentReportActionID);
        } else {
            updateNotificationPreference(childReportID, prevNotificationPreference, CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, false, parentReportID, parentReportActionID);
        }
    } else {
        const participantAccountIDs = [...new Set([currentUserAccountID, Number(parentReportAction?.actorAccountID)])];
        const parentReport = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`];
        const newChat = ReportUtils.buildOptimisticChatReport(
            participantAccountIDs,
            ReportActionsUtils.getReportActionText(parentReportAction),
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
        openReport(newChat.reportID, '', participantLogins, newChat, parentReportAction.reportActionID);
        const notificationPreference =
            prevNotificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN ? CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS : CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
        updateNotificationPreference(newChat.reportID, prevNotificationPreference, notificationPreference, false, parentReportID, parentReportAction?.reportActionID);
    }
}

function updateReportName(reportID: string, value: string, previousValue: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                reportName: value,
                pendingFields: {
                    reportName: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                reportName: previousValue,
                pendingFields: {
                    reportName: null,
                },
                errorFields: {
                    reportName: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericUpdateReporNameEditFailureMessage'),
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
                errorFields: {
                    reportName: null,
                },
            },
        },
    ];

    const parameters = {
        reportID,
        reportName: value,
    };

    API.write(WRITE_COMMANDS.SET_REPORT_NAME, parameters, {optimisticData, failureData, successData});
}

function clearReportFieldKeyErrors(reportID: string, fieldKey: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        pendingFields: {
            [fieldKey]: null,
        },
        errorFields: {
            [fieldKey]: null,
        },
    });
}

function updateReportField(reportID: string, reportField: PolicyReportField, previousReportField: PolicyReportField) {
    const fieldKey = ReportUtils.getReportFieldKey(reportField.fieldID);
    const reportViolations = ReportUtils.getReportViolations(reportID);
    const fieldViolation = ReportUtils.getFieldViolation(reportViolations, reportField);
    const recentlyUsedValues = allRecentlyUsedReportFields?.[fieldKey] ?? [];

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                fieldList: {
                    [fieldKey]: reportField,
                },
                pendingFields: {
                    [fieldKey]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];

    if (fieldViolation) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_VIOLATIONS}${reportID}`,
            value: {
                [fieldViolation]: {
                    [reportField.fieldID]: null,
                },
            },
        });
    }

    if (reportField.type === 'dropdown' && reportField.value) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.RECENTLY_USED_REPORT_FIELDS,
            value: {
                [fieldKey]: [...new Set([...recentlyUsedValues, reportField.value])],
            },
        });
    }

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                fieldList: {
                    [fieldKey]: previousReportField,
                },
                pendingFields: {
                    [fieldKey]: null,
                },
                errorFields: {
                    [fieldKey]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericUpdateReportFieldFailureMessage'),
                },
            },
        },
    ];

    if (reportField.type === 'dropdown') {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.RECENTLY_USED_REPORT_FIELDS,
            value: {
                [fieldKey]: recentlyUsedValues,
            },
        });
    }

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingFields: {
                    [fieldKey]: null,
                },
                errorFields: {
                    [fieldKey]: null,
                },
            },
        },
    ];

    const parameters = {
        reportID,
        reportFields: JSON.stringify({[fieldKey]: reportField}),
    };

    API.write(WRITE_COMMANDS.SET_REPORT_FIELD, parameters, {optimisticData, failureData, successData});
}

function deleteReportField(reportID: string, reportField: PolicyReportField) {
    const fieldKey = ReportUtils.getReportFieldKey(reportField.fieldID);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                fieldList: {
                    [fieldKey]: null,
                },
                pendingFields: {
                    [fieldKey]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                fieldList: {
                    [fieldKey]: reportField,
                },
                pendingFields: {
                    [fieldKey]: null,
                },
                errorFields: {
                    [fieldKey]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericUpdateReportFieldFailureMessage'),
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
                    [fieldKey]: null,
                },
                errorFields: {
                    [fieldKey]: null,
                },
            },
        },
    ];

    const parameters = {
        reportID,
        fieldID: fieldKey,
    };

    API.write(WRITE_COMMANDS.DELETE_REPORT_FIELD, parameters, {optimisticData, failureData, successData});
}

function updateDescription(reportID: string, previousValue: string, newValue: string) {
    // No change needed, navigate back
    if (previousValue === newValue) {
        Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID));
        return;
    }

    const parsedDescription = ReportUtils.getParsedComment(newValue, {reportID});
    const optimisticDescriptionUpdatedReportAction = ReportUtils.buildOptimisticRoomDescriptionUpdatedReportAction(parsedDescription);
    const report = ReportUtils.getReport(reportID);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                description: parsedDescription,
                pendingFields: {description: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                lastActorAccountID: currentUserAccountID,
                lastVisibleActionCreated: optimisticDescriptionUpdatedReportAction.created,
                lastMessageText: (optimisticDescriptionUpdatedReportAction?.message as Message[])?.[0]?.text,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticDescriptionUpdatedReportAction.reportActionID]: optimisticDescriptionUpdatedReportAction,
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                description: previousValue,
                pendingFields: {description: null},
                lastActorAccountID: report?.lastActorAccountID,
                lastVisibleActionCreated: report?.lastVisibleActionCreated,
                lastMessageText: report?.lastMessageText,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticDescriptionUpdatedReportAction.reportActionID]: null,
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {pendingFields: {description: null}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticDescriptionUpdatedReportAction.reportActionID]: {pendingAction: null},
            },
        },
    ];

    const parameters: UpdateRoomDescriptionParams = {reportID, description: parsedDescription, reportActionID: optimisticDescriptionUpdatedReportAction.reportActionID};

    API.write(WRITE_COMMANDS.UPDATE_ROOM_DESCRIPTION, parameters, {optimisticData, failureData, successData});
    Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID));
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

    const parameters: UpdateReportWriteCapabilityParams = {reportID: report.reportID, writeCapability: newValue};

    API.write(WRITE_COMMANDS.UPDATE_REPORT_WRITE_CAPABILITY, parameters, {optimisticData, failureData});
    // Return to the report settings page since this field utilizes push-to-page
    Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(report.reportID));
}

/**
 * Navigates to the 1:1 report with Concierge
 */
function navigateToConciergeChat(shouldDismissModal = false, checkIfCurrentPageActive = () => true, actionType?: string) {
    // If conciergeChatReportID contains a concierge report ID, we navigate to the concierge chat using the stored report ID.
    // Otherwise, we would find the concierge chat and navigate to it.
    if (!conciergeChatReportID) {
        // In order to avoid creating concierge repeatedly,
        // we need to ensure that the server data has been successfully pulled
        Welcome.onServerDataReady().then(() => {
            // If we don't have a chat with Concierge then create it
            if (!checkIfCurrentPageActive()) {
                return;
            }
            navigateToAndOpenReport([CONST.EMAIL.CONCIERGE], shouldDismissModal, actionType);
        });
    } else if (shouldDismissModal) {
        Navigation.dismissModal(conciergeChatReportID);
    } else {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(conciergeChatReportID), actionType);
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
                    addWorkspaceRoom: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.NEW_ROOM_FORM,
            value: {isLoading: false},
        },
    ];

    const parameters: AddWorkspaceRoomParams = {
        policyID: policyReport.policyID,
        reportName: policyReport.reportName,
        visibility: policyReport.visibility,
        reportID: policyReport.reportID,
        createdReportActionID: createdReportAction.reportActionID,
        writeCapability: policyReport.writeCapability,
        description: policyReport.description,
    };

    API.write(WRITE_COMMANDS.ADD_WORKSPACE_ROOM, parameters, {optimisticData, successData, failureData});
    Navigation.dismissModalWithReport(policyReport);
}

/** Deletes a report, along with its reportActions, any linked reports, and any linked IOU report. */
function deleteReport(reportID: string, shouldDeleteChildReports = false) {
    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const onyxData: Record<string, null> = {
        [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: null,
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]: null,
    };

    // Delete linked transactions
    const reportActionsForReport = allReportActions?.[reportID];

    const transactionIDs = Object.values(reportActionsForReport ?? {})
        .filter((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => ReportActionsUtils.isMoneyRequestAction(reportAction))
        .map((reportAction) => ReportActionsUtils.getOriginalMessage(reportAction)?.IOUTransactionID);

    [...new Set(transactionIDs)].forEach((transactionID) => {
        onyxData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = null;
    });

    Onyx.multiSet(onyxData);

    if (shouldDeleteChildReports) {
        Object.values(reportActionsForReport ?? {}).forEach((reportAction) => {
            if (!reportAction.childReportID) {
                return;
            }
            deleteReport(reportAction.childReportID, shouldDeleteChildReports);
        });
    }

    // Delete linked IOU report
    if (report?.iouReportID) {
        deleteReport(report.iouReportID, shouldDeleteChildReports);
    }
}

/**
 * @param reportID The reportID of the policy report (workspace room)
 */
function navigateToConciergeChatAndDeleteReport(reportID: string, shouldPopToTop = false, shouldDeleteChildReports = false) {
    // Dismiss the current report screen and replace it with Concierge Chat
    if (shouldPopToTop) {
        Navigation.setShouldPopAllStateOnUP(true);
    }
    Navigation.goBack(undefined, undefined, shouldPopToTop);
    navigateToConciergeChat();
    InteractionManager.runAfterInteractions(() => {
        deleteReport(reportID, shouldDeleteChildReports);
    });
}

/**
 * @param policyRoomReport The policy room report
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

    const optimisticRenamedAction = ReportUtils.buildOptimisticRenamedRoomReportAction(policyRoomName, previousName ?? '');

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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticRenamedAction.reportActionID]: optimisticRenamedAction,
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {[optimisticRenamedAction.reportActionID]: {pendingAction: null}},
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {[optimisticRenamedAction.reportActionID]: null},
        },
    ];

    const parameters: UpdatePolicyRoomNameParams = {
        reportID,
        policyRoomName,
        renamedRoomReportActionID: optimisticRenamedAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_ROOM_NAME, parameters, {optimisticData, successData, failureData});
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
    const notificationPreference = ReportUtils.getReportNotificationPreference(ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]);
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

    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (!report || (report && report.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)) {
        Log.info(`${tag} No notification because the report does not exist or is pending deleted`, false);
        return false;
    }

    // If this notification was delayed and the user saw the message already, don't show it
    if (action && report?.lastReadTime && report.lastReadTime >= action.created) {
        Log.info(`${tag} No notification because the comment was already read`, false, {created: action.created, lastReadTime: report.lastReadTime});
        return false;
    }

    // If this is a whisper targeted to someone else, don't show it
    if (action && ReportActionsUtils.isWhisperActionTargetedToOthers(action)) {
        Log.info(`${tag} No notification because the action is whispered to someone else`, false);
        return false;
    }

    // Only show notifications for supported types of report actions
    if (action && !ReportActionsUtils.isNotifiableReportAction(action)) {
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

    const localReportID = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
    const report = ReportConnection.getAllReports()?.[localReportID] ?? null;
    if (!report) {
        Log.hmmm("[LocalNotification] couldn't show report action notification because the report wasn't found", {localReportID, reportActionID: reportAction.reportActionID});
        return;
    }

    const onClick = () =>
        Modal.close(() => {
            const policyID = lastVisitedPath && extractPolicyIDFromPath(lastVisitedPath);
            const policyEmployeeAccountIDs = policyID ? getPolicyEmployeeAccountIDs(policyID) : [];
            const reportBelongsToWorkspace = policyID ? doesReportBelongToWorkspace(report, policyEmployeeAccountIDs, policyID) : false;
            if (!reportBelongsToWorkspace) {
                Navigation.navigateWithSwitchPolicyID({route: ROUTES.HOME});
            }
            navigateFromNotification(reportID);
        });

    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE) {
        LocalNotification.showModifiedExpenseNotification(report, reportAction, onClick);
    } else {
        LocalNotification.showCommentNotification(report, reportAction, onClick);
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

    const parameters: AddEmojiReactionParams = {
        reportID,
        skinTone,
        emojiCode: emoji.name,
        reportActionID,
        createdAt,
        // This will be removed as part of https://github.com/Expensify/App/issues/19535
        useEmojiReactions: true,
    };

    API.write(WRITE_COMMANDS.ADD_EMOJI_REACTION, parameters, {optimisticData, successData, failureData});
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

    const parameters: RemoveEmojiReactionParams = {
        reportID,
        reportActionID,
        emojiCode: emoji.name,
        // This will be removed as part of https://github.com/Expensify/App/issues/19535
        useEmojiReactions: true,
    };

    API.write(WRITE_COMMANDS.REMOVE_EMOJI_REACTION, parameters, {optimisticData});
}

/**
 * Calls either addEmojiReaction or removeEmojiReaction depending on if the current user has reacted to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 */
function toggleEmojiReaction(
    reportID: string,
    reportAction: ReportAction,
    reactionObject: Emoji,
    existingReactions: OnyxEntry<ReportActionReactions>,
    paramSkinTone: number = preferredSkinTone,
    ignoreSkinToneOnCompare = false,
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

    if (existingReactionObject && EmojiUtils.hasAccountIDEmojiReacted(currentUserAccountID, existingReactionObject.users, ignoreSkinToneOnCompare ? undefined : skinTone)) {
        removeEmojiReaction(originalReportID, reportAction.reportActionID, emoji);
        return;
    }

    addEmojiReaction(originalReportID, reportAction.reportActionID, emoji, skinTone);
}

function openReportFromDeepLink(url: string) {
    const reportID = ReportUtils.getReportIDFromLink(url);
    const isAuthenticated = Session.hasAuthToken();

    if (reportID && !isAuthenticated) {
        // Call the OpenReport command to check in the server if it's a public room. If so, we'll open it as an anonymous user
        openReport(reportID, '', [], undefined, '0', true);

        // Show the sign-in page if the app is offline
        if (networkStatus === CONST.NETWORK.NETWORK_STATUS.OFFLINE) {
            Onyx.set(ONYXKEYS.IS_CHECKING_PUBLIC_ROOM, false);
        }
    } else {
        // If we're not opening a public room (no reportID) or the user is authenticated, we unblock the UI (hide splash screen)
        Onyx.set(ONYXKEYS.IS_CHECKING_PUBLIC_ROOM, false);
    }

    const route = ReportUtils.getRouteFromLink(url);

    // If we are not authenticated and are navigating to a public screen, we don't want to navigate again to the screen after sign-in/sign-up
    if (!isAuthenticated && isPublicScreenRoute(route)) {
        return;
    }

    // Navigate to the report after sign-in/sign-up.
    InteractionManager.runAfterInteractions(() => {
        Session.waitForUserSignIn().then(() => {
            const connection = Onyx.connect({
                key: ONYXKEYS.NVP_ONBOARDING,
                callback: (onboarding) => {
                    if (onboarding) {
                        // Once the onboarding data is available, we want to disconnect the connection
                        // so it won't trigger the deeplink again every time the data is changed, for example, when relogin.
                        Onyx.disconnect(connection);
                    }

                    Navigation.waitForProtectedRoutes().then(() => {
                        if (route && Session.isAnonymousUser() && !Session.canAnonymousUserAccessRoute(route)) {
                            Session.signOutAndRedirectToSignIn(true);
                            return;
                        }

                        // We don't want to navigate to the exitTo route when creating a new workspace from a deep link,
                        // because we already handle creating the optimistic policy and navigating to it in App.setUpPoliciesAndNavigate,
                        // which is already called when AuthScreens mounts.
                        if (url && new URL(url).searchParams.get('exitTo') === ROUTES.WORKSPACE_NEW) {
                            return;
                        }

                        const state = navigationRef.getRootState();
                        const currentFocusedRoute = findFocusedRoute(state);
                        const hasCompletedGuidedSetupFlow = hasCompletedGuidedSetupFlowSelector(onboarding);

                        // We need skip deeplinking if the user hasn't completed the guided setup flow.
                        if (!hasCompletedGuidedSetupFlow) {
                            Welcome.isOnboardingFlowCompleted({
                                onNotCompleted: () => OnboardingFlow.startOnboardingFlow(),
                            });
                            return;
                        }

                        if (isOnboardingFlowName(currentFocusedRoute?.name)) {
                            Welcome.setOnboardingErrorMessage(Localize.translateLocal('onboarding.purpose.errorBackButton'));
                            return;
                        }

                        if (shouldSkipDeepLinkNavigation(route)) {
                            return;
                        }

                        if (isAuthenticated) {
                            return;
                        }

                        Navigation.navigate(route as Route, CONST.NAVIGATION.ACTION_TYPE.PUSH);
                    });
                },
            });
        });
    });
}

function getCurrentUserAccountID(): number {
    return currentUserAccountID;
}

function navigateToMostRecentReport(currentReport: OnyxEntry<Report>) {
    const lastAccessedReportID = ReportUtils.findLastAccessedReport(false, false, undefined, currentReport?.reportID)?.reportID;

    if (lastAccessedReportID) {
        const lastAccessedReportRoute = ROUTES.REPORT_WITH_ID.getRoute(lastAccessedReportID ?? '-1');
        Navigation.goBack(lastAccessedReportRoute);
    } else {
        const isChatThread = ReportUtils.isChatThread(currentReport);

        // If it is not a chat thread we should call Navigation.goBack to pop the current route first before navigating to Concierge.
        if (!isChatThread) {
            Navigation.goBack();
        }

        navigateToConciergeChat(false, () => true, CONST.NAVIGATION.TYPE.UP);
    }
}

function getMostRecentReportID(currentReport: OnyxEntry<Report>) {
    const lastAccessedReportID = ReportUtils.findLastAccessedReport(false, false, undefined, currentReport?.reportID)?.reportID;
    return lastAccessedReportID ?? conciergeChatReportID;
}

function joinRoom(report: OnyxEntry<Report>) {
    if (!report) {
        return;
    }
    updateNotificationPreference(
        report.reportID,
        ReportUtils.getReportNotificationPreference(report),
        CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
        false,
        report.parentReportID,
        report.parentReportActionID,
        report,
    );
}

function leaveGroupChat(reportID: string) {
    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (!report) {
        Log.warn('Attempting to leave Group Chat that does not existing locally');
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: null,
        },
    ];
    // Clean up any quick actions for the report we're leaving from
    if (quickAction?.chatReportID?.toString() === reportID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: null,
        });
    }

    navigateToMostRecentReport(report);
    API.write(WRITE_COMMANDS.LEAVE_GROUP_CHAT, {reportID}, {optimisticData});
}

/** Leave a report by setting the state to submitted and closed */
function leaveRoom(reportID: string, isWorkspaceMemberLeavingWorkspaceRoom = false) {
    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

    if (!report) {
        return;
    }
    const isChatThread = ReportUtils.isChatThread(report);

    // Pusher's leavingStatus should be sent earlier.
    // Place the broadcast before calling the LeaveRoom API to prevent a race condition
    // between Onyx report being null and Pusher's leavingStatus becoming true.
    broadcastUserIsLeavingRoom(reportID);

    // If a workspace member is leaving a workspace room, they don't actually lose the room from Onyx.
    // Instead, their notification preference just gets set to "hidden".
    // Same applies for chat threads too
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value:
                isWorkspaceMemberLeavingWorkspaceRoom || isChatThread
                    ? {
                          participants: {
                              [currentUserAccountID]: {
                                  notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                              },
                          },
                      }
                    : {
                          reportID: null,
                          stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                          statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                          participants: {
                              [currentUserAccountID]: {
                                  notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                              },
                          },
                      },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value:
                isWorkspaceMemberLeavingWorkspaceRoom || isChatThread
                    ? {
                          participants: {
                              [currentUserAccountID]: {
                                  notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                              },
                          },
                      }
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

    if (report.parentReportID && report.parentReportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`,
            value: {[report.parentReportActionID]: {childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN}},
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`,
            value: {[report.parentReportActionID]: {childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN}},
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`,
            value: {[report.parentReportActionID]: {childReportNotificationPreference: ReportUtils.getReportNotificationPreference(report, false)}},
        });
    }

    const parameters: LeaveRoomParams = {
        reportID,
    };

    API.write(WRITE_COMMANDS.LEAVE_ROOM, parameters, {optimisticData, successData, failureData});

    // If this is the leave action from a workspace room, simply dismiss the modal, i.e., allow the user to view the room and join again immediately.
    // If this is the leave action from a chat thread (even if the chat thread is in a room), do not allow the user to stay in the thread after leaving.
    if (isWorkspaceMemberLeavingWorkspaceRoom && !isChatThread) {
        return;
    }
    // In other cases, the report is deleted and we should move the user to another report.
    navigateToMostRecentReport(report);
}

/** Invites people to a room */
function inviteToRoom(reportID: string, inviteeEmailsToAccountIDs: InvitedEmailsToAccountIDs) {
    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (!report) {
        return;
    }

    const defaultNotificationPreference = ReportUtils.getDefaultNotificationPreferenceForReport(report);

    const inviteeEmails = Object.keys(inviteeEmailsToAccountIDs);
    const inviteeAccountIDs = Object.values(inviteeEmailsToAccountIDs);

    const logins = inviteeEmails.map((memberLogin) => PhoneNumber.addSMSDomainIfPhoneNumber(memberLogin));
    const {newAccountIDs, newLogins} = PersonalDetailsUtils.getNewAccountIDsAndLogins(logins, inviteeAccountIDs);

    const participantsAfterInvitation = inviteeAccountIDs.reduce(
        (reportParticipants: Participants, accountID: number) => {
            const participant: ReportParticipant = {
                notificationPreference: defaultNotificationPreference,
                role: CONST.REPORT.ROLE.MEMBER,
            };
            // eslint-disable-next-line no-param-reassign
            reportParticipants[accountID] = participant;
            return reportParticipants;
        },
        {...report.participants},
    );

    const newPersonalDetailsOnyxData = PersonalDetailsUtils.getPersonalDetailsOnyxDataForOptimisticUsers(newLogins, newAccountIDs);
    const pendingChatMembers = ReportUtils.getPendingChatMembers(inviteeAccountIDs, report?.pendingChatMembers ?? [], CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

    const newParticipantAccountCleanUp = newAccountIDs.reduce<Record<number, null>>((participantCleanUp, newAccountID) => {
        // eslint-disable-next-line no-param-reassign
        participantCleanUp[newAccountID] = null;
        return participantCleanUp;
    }, {});

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                participants: participantsAfterInvitation,
                pendingChatMembers,
            },
        },
    ];
    optimisticData.push(...newPersonalDetailsOnyxData.optimisticData);

    const successPendingChatMembers = report?.pendingChatMembers
        ? report?.pendingChatMembers?.filter(
              (pendingMember) => !(inviteeAccountIDs.includes(Number(pendingMember.accountID)) && pendingMember.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
          )
        : null;
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingChatMembers: successPendingChatMembers,
                participants: newParticipantAccountCleanUp,
            },
        },
    ];
    successData.push(...newPersonalDetailsOnyxData.finallyData);

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingChatMembers:
                    pendingChatMembers.map((pendingChatMember) => {
                        if (!inviteeAccountIDs.includes(Number(pendingChatMember.accountID))) {
                            return pendingChatMember;
                        }
                        return {
                            ...pendingChatMember,
                            errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('roomMembersPage.error.genericAdd'),
                        };
                    }) ?? null,
            },
        },
    ];

    if (ReportUtils.isGroupChat(report)) {
        const parameters: InviteToGroupChatParams = {
            reportID,
            inviteeEmails,
            accountIDList: newAccountIDs.join(),
        };

        API.write(WRITE_COMMANDS.INVITE_TO_GROUP_CHAT, parameters, {optimisticData, successData, failureData});
        return;
    }

    const parameters: InviteToRoomParams = {
        reportID,
        inviteeEmails,
        accountIDList: newAccountIDs.join(),
    };

    // eslint-disable-next-line rulesdir/no-multiple-api-calls
    API.write(WRITE_COMMANDS.INVITE_TO_ROOM, parameters, {optimisticData, successData, failureData});
}

function clearAddRoomMemberError(reportID: string, invitedAccountID: string) {
    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        pendingChatMembers: report?.pendingChatMembers?.filter((pendingChatMember) => pendingChatMember.accountID !== invitedAccountID),
        participants: {
            [invitedAccountID]: null,
        },
    });
    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        [invitedAccountID]: null,
    });
}

function updateGroupChatMemberRoles(reportID: string, accountIDList: number[], role: ValueOf<typeof CONST.REPORT.ROLE>) {
    const memberRoles: Record<number, string> = {};
    const optimisticParticipants: Record<number, Partial<ReportParticipant>> = {};
    const successParticipants: Record<number, Partial<ReportParticipant>> = {};

    accountIDList.forEach((accountID) => {
        memberRoles[accountID] = role;
        optimisticParticipants[accountID] = {
            role,
            pendingFields: {
                role: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        };
        successParticipants[accountID] = {
            pendingFields: {
                role: null,
            },
            pendingAction: null,
        };
    });

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {participants: optimisticParticipants},
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {participants: successParticipants},
        },
    ];
    const parameters: UpdateGroupChatMemberRolesParams = {reportID, memberRoles: JSON.stringify(memberRoles)};
    API.write(WRITE_COMMANDS.UPDATE_GROUP_CHAT_MEMBER_ROLES, parameters, {optimisticData, successData});
}

/** Invites people to a group chat */
function inviteToGroupChat(reportID: string, inviteeEmailsToAccountIDs: InvitedEmailsToAccountIDs) {
    inviteToRoom(reportID, inviteeEmailsToAccountIDs);
}

/** Removes people from a room
 *  Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
 */
function removeFromRoom(reportID: string, targetAccountIDs: number[]) {
    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (!report) {
        return;
    }

    const removeParticipantsData: Record<number, null> = {};
    targetAccountIDs.forEach((accountID) => {
        removeParticipantsData[accountID] = null;
    });
    const pendingChatMembers = ReportUtils.getPendingChatMembers(targetAccountIDs, report?.pendingChatMembers ?? [], CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingChatMembers,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingChatMembers: report?.pendingChatMembers ?? null,
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
                participants: removeParticipantsData,
                pendingChatMembers: report?.pendingChatMembers ?? null,
            },
        },
    ];

    if (ReportUtils.isGroupChat(report)) {
        const parameters: RemoveFromGroupChatParams = {
            reportID,
            accountIDList: targetAccountIDs.join(),
        };
        API.write(WRITE_COMMANDS.REMOVE_FROM_GROUP_CHAT, parameters, {optimisticData, failureData, successData});
        return;
    }

    const parameters: RemoveFromRoomParams = {
        reportID,
        targetAccountIDs,
    };

    // eslint-disable-next-line rulesdir/no-multiple-api-calls
    API.write(WRITE_COMMANDS.REMOVE_FROM_ROOM, parameters, {optimisticData, failureData, successData});
}

function removeFromGroupChat(reportID: string, accountIDList: number[]) {
    removeFromRoom(reportID, accountIDList);
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
    const message = ReportActionsUtils.getReportActionMessage(reportAction);

    if (!message || !reportAction) {
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

    const parameters: FlagCommentParams = {
        severity,
        reportActionID,
        // This check is to prevent flooding Concierge with test flags
        // If you need to test moderation responses from Concierge on dev, set this to false!
        isDevRequest: Environment.isDevelopment(),
    };

    API.write(WRITE_COMMANDS.FLAG_COMMENT, parameters, {optimisticData, successData, failureData});
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
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('privateNotes.error.genericFailureMessage'),
                    },
                },
            },
        },
    ];

    const parameters: UpdateReportPrivateNoteParams = {reportID, privateNotes: note};

    API.write(WRITE_COMMANDS.UPDATE_REPORT_PRIVATE_NOTE, parameters, {optimisticData, successData, failureData});
};

/** Fetches all the private notes for a given report */
function getReportPrivateNote(reportID: string | undefined) {
    if (Session.isAnonymousUser()) {
        return;
    }

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

    const parameters: GetReportPrivateNoteParams = {reportID};

    API.read(READ_COMMANDS.GET_REPORT_PRIVATE_NOTE, parameters, {optimisticData, successData, failureData});
}

function completeOnboarding(
    engagementChoice: OnboardingPurposeType,
    data: ValueOf<typeof CONST.ONBOARDING_MESSAGES>,
    {
        firstName,
        lastName,
    }: {
        firstName: string;
        lastName: string;
    },
    adminsChatReportID?: string,
    onboardingPolicyID?: string,
    paymentSelected?: string,
) {
    const actorAccountID = CONST.ACCOUNT_ID.CONCIERGE;
    const targetChatReport = ReportUtils.getChatByParticipants([actorAccountID, currentUserAccountID]);
    const {reportID: targetChatReportID = '', policyID: targetChatPolicyID = ''} = targetChatReport ?? {};

    // Introductory message
    const introductionComment = ReportUtils.buildOptimisticAddCommentReportAction(delegateEmail, CONST.ONBOARDING_INTRODUCTION, undefined, actorAccountID);
    const introductionCommentAction: OptimisticAddCommentReportAction = introductionComment.reportAction;
    const introductionMessage: AddCommentOrAttachementParams = {
        reportID: targetChatReportID,
        reportActionID: introductionCommentAction.reportActionID,
        reportComment: introductionComment.commentText,
    };

    // Text message
    const textComment = ReportUtils.buildOptimisticAddCommentReportAction(delegateEmail, data.message, undefined, actorAccountID, 1);
    const textCommentAction: OptimisticAddCommentReportAction = textComment.reportAction;
    const textMessage: AddCommentOrAttachementParams = {
        reportID: targetChatReportID,
        reportActionID: textCommentAction.reportActionID,
        reportComment: textComment.commentText,
    };

    let videoCommentAction: OptimisticAddCommentReportAction | null = null;
    let videoMessage: AddCommentOrAttachementParams | null = null;
    if ('video' in data && data.video) {
        const videoComment = ReportUtils.buildOptimisticAddCommentReportAction(delegateEmail, CONST.ATTACHMENT_MESSAGE_TEXT, undefined, actorAccountID, 2);
        videoCommentAction = videoComment.reportAction;
        videoMessage = {
            reportID: targetChatReportID,
            reportActionID: videoCommentAction.reportActionID,
            reportComment: videoComment.commentText,
        };
    }

    const tasksData = data.tasks.map((task, index) => {
        const taskDescription =
            typeof task.description === 'function'
                ? task.description({
                      adminsRoomLink: `${environmentURL}/${ROUTES.REPORT_WITH_ID.getRoute(adminsChatReportID ?? '-1')}`,
                      workspaceCategoriesLink: `${environmentURL}/${ROUTES.WORKSPACE_CATEGORIES.getRoute(onboardingPolicyID ?? '-1')}`,
                      workspaceMembersLink: `${environmentURL}/${ROUTES.WORKSPACE_MEMBERS.getRoute(onboardingPolicyID ?? '-1')}`,
                      workspaceMoreFeaturesLink: `${environmentURL}/${ROUTES.WORKSPACE_MORE_FEATURES.getRoute(onboardingPolicyID ?? '-1')}`,
                  })
                : task.description;
        const currentTask = ReportUtils.buildOptimisticTaskReport(
            actorAccountID,
            currentUserAccountID,
            targetChatReportID,
            task.title,
            taskDescription,
            targetChatPolicyID,
            CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
        );
        const taskCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(CONST.EMAIL.CONCIERGE);
        const taskReportAction = ReportUtils.buildOptimisticTaskCommentReportAction(
            currentTask.reportID,
            task.title,
            0,
            `task for ${task.title}`,
            targetChatReportID,
            actorAccountID,
            index + 3,
        );
        currentTask.parentReportActionID = taskReportAction.reportAction.reportActionID;

        const completedTaskReportAction = task.autoCompleted
            ? ReportUtils.buildOptimisticTaskReportAction(currentTask.reportID, CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED, 'marked as complete', actorAccountID, 2)
            : null;

        return {
            task,
            currentTask,
            taskCreatedAction,
            taskReportAction,
            taskDescription: currentTask.description,
            completedTaskReportAction,
        };
    });

    const tasksForParameters = tasksData.map<TaskForParameters>(({task, currentTask, taskCreatedAction, taskReportAction, taskDescription, completedTaskReportAction}) => ({
        type: 'task',
        task: task.type,
        taskReportID: currentTask.reportID,
        parentReportID: currentTask.parentReportID ?? '-1',
        parentReportActionID: taskReportAction.reportAction.reportActionID,
        assigneeChatReportID: '',
        createdTaskReportActionID: taskCreatedAction.reportActionID,
        completedTaskReportActionID: completedTaskReportAction?.reportActionID ?? undefined,
        title: currentTask.reportName ?? '',
        description: taskDescription ?? '',
    }));

    const hasOutstandingChildTask = tasksData.some((task) => !task.completedTaskReportAction);

    const tasksForOptimisticData = tasksData.reduce<OnyxUpdate[]>((acc, {currentTask, taskCreatedAction, taskReportAction, taskDescription, completedTaskReportAction}) => {
        acc.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
                value: {
                    [taskReportAction.reportAction.reportActionID]: taskReportAction.reportAction as ReportAction,
                },
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${currentTask.reportID}`,
                value: {
                    ...currentTask,
                    description: taskDescription,
                    pendingFields: {
                        createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        reportName: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        description: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        managerID: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                    isOptimisticReport: true,
                    managerID: currentUserAccountID,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${currentTask.reportID}`,
                value: {
                    [taskCreatedAction.reportActionID]: taskCreatedAction as ReportAction,
                },
            },
        );

        if (completedTaskReportAction) {
            acc.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${currentTask.reportID}`,
                value: {
                    [completedTaskReportAction.reportActionID]: completedTaskReportAction as ReportAction,
                },
            });

            acc.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${currentTask.reportID}`,
                value: {
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                    managerID: currentUserAccountID,
                },
            });
        }

        return acc;
    }, []);

    const tasksForFailureData = tasksData.reduce<OnyxUpdate[]>((acc, {currentTask, taskReportAction}) => {
        acc.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
                value: {
                    [taskReportAction.reportAction.reportActionID]: {
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericAddCommentFailureMessage'),
                    } as ReportAction,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${currentTask.reportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${currentTask.reportID}`,
                value: null,
            },
        );

        return acc;
    }, []);

    const tasksForSuccessData = tasksData.reduce<OnyxUpdate[]>((acc, {currentTask, taskCreatedAction, taskReportAction, completedTaskReportAction}) => {
        acc.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
                value: {
                    [taskReportAction.reportAction.reportActionID]: {pendingAction: null},
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${currentTask.reportID}`,
                value: {
                    pendingFields: {
                        createChat: null,
                        reportName: null,
                        description: null,
                        managerID: null,
                    },
                    isOptimisticReport: false,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${currentTask.reportID}`,
                value: {
                    [taskCreatedAction.reportActionID]: {pendingAction: null},
                },
            },
        );

        if (completedTaskReportAction) {
            acc.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${currentTask.reportID}`,
                value: {
                    [completedTaskReportAction.reportActionID]: {pendingAction: null},
                },
            });
        }

        return acc;
    }, []);

    const optimisticData: OnyxUpdate[] = [...tasksForOptimisticData];
    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${targetChatReportID}`,
            value: {
                lastMentionedTime: DateUtils.getDBTime(),
                hasOutstandingChildTask,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
            value: {
                [introductionCommentAction.reportActionID]: introductionCommentAction as ReportAction,
                [textCommentAction.reportActionID]: textCommentAction as ReportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_INTRO_SELECTED,
            value: {choice: engagementChoice},
        },
    );

    const successData: OnyxUpdate[] = [...tasksForSuccessData];
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
        value: {
            [introductionCommentAction.reportActionID]: {pendingAction: null},
            [textCommentAction.reportActionID]: {pendingAction: null},
        },
    });

    let failureReport: Partial<Report> = {
        lastMessageTranslationKey: '',
        lastMessageText: '',
        lastVisibleActionCreated: '',
        hasOutstandingChildTask: false,
    };
    const {lastMessageText = '', lastMessageTranslationKey = ''} = ReportActionsUtils.getLastVisibleMessage(targetChatReportID);
    if (lastMessageText || lastMessageTranslationKey) {
        const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(targetChatReportID);
        const lastVisibleActionCreated = lastVisibleAction?.created;
        const lastActorAccountID = lastVisibleAction?.actorAccountID;
        failureReport = {
            lastMessageTranslationKey,
            lastMessageText,
            lastVisibleActionCreated,
            lastActorAccountID,
        };
    }

    const failureData: OnyxUpdate[] = [...tasksForFailureData];
    failureData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${targetChatReportID}`,
            value: failureReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
            value: {
                [introductionCommentAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericAddCommentFailureMessage'),
                } as ReportAction,
                [textCommentAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericAddCommentFailureMessage'),
                } as ReportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_INTRO_SELECTED,
            value: {choice: null},
        },
    );

    const guidedSetupData: GuidedSetupData = [
        {type: 'message', ...introductionMessage},
        {type: 'message', ...textMessage},
    ];

    if ('video' in data && data.video && videoCommentAction && videoMessage) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
            value: {
                [videoCommentAction.reportActionID]: videoCommentAction as ReportAction,
            },
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
            value: {
                [videoCommentAction.reportActionID]: {pendingAction: null},
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
            value: {
                [videoCommentAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericAddCommentFailureMessage'),
                } as ReportAction,
            },
        });

        guidedSetupData.push({type: 'video', ...data.video, ...videoMessage});
    }

    guidedSetupData.push(...tasksForParameters);

    const parameters: CompleteGuidedSetupParams = {
        engagementChoice,
        firstName,
        lastName,
        actorAccountID,
        guidedSetupData: JSON.stringify(guidedSetupData),
        paymentSelected,
    };

    API.write(WRITE_COMMANDS.COMPLETE_GUIDED_SETUP, parameters, {optimisticData, successData, failureData});
}

/** Loads necessary data for rendering the RoomMembersPage */
function openRoomMembersPage(reportID: string) {
    const parameters: OpenRoomMembersPageParams = {reportID};

    API.read(READ_COMMANDS.OPEN_ROOM_MEMBERS_PAGE, parameters);
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

function searchForReports(searchInput: string, policyID?: string) {
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

    const searchForRoomToMentionParams: SearchForRoomsToMentionParams = {query: searchInput, policyID: policyID ?? '-1'};
    const searchForReportsParams: SearchForReportsParams = {searchInput, canCancel: true};

    // We want to cancel all pending SearchForReports API calls before making another one
    if (!policyID) {
        HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);
    }

    API.read(policyID ? READ_COMMANDS.SEARCH_FOR_ROOMS_TO_MENTION : READ_COMMANDS.SEARCH_FOR_REPORTS, policyID ? searchForRoomToMentionParams : searchForReportsParams, {
        successData,
        failureData,
    });
}

function searchInServer(searchInput: string, policyID?: string) {
    if (isNetworkOffline || !searchInput.trim().length) {
        Onyx.set(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, false);
        return;
    }

    // Why not set this in optimistic data? It won't run until the API request happens and while the API request is debounced
    // we want to show the loading state right away. Otherwise, we will see a flashing UI where the client options are sorted and
    // tell the user there are no options, then we start searching, and tell them there are no options again.
    Onyx.set(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, true);
    searchForReports(searchInput, policyID);
}

function updateLastVisitTime(reportID: string) {
    if (!ReportUtils.isValidReportIDFromPath(reportID)) {
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {lastVisitTime: DateUtils.getDBTime()});
}

function updateLoadingInitialReportAction(reportID: string) {
    if (!ReportUtils.isValidReportIDFromPath(reportID)) {
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {isLoadingInitialReportActions: false});
}

function clearNewRoomFormError() {
    Onyx.set(ONYXKEYS.FORMS.NEW_ROOM_FORM, {
        isLoading: false,
        errorFields: null,
        errors: null,
        [INPUT_IDS.ROOM_NAME]: '',
        [INPUT_IDS.REPORT_DESCRIPTION]: '',
        [INPUT_IDS.POLICY_ID]: '',
        [INPUT_IDS.WRITE_CAPABILITY]: '',
        [INPUT_IDS.VISIBILITY]: '',
    });
}

function resolveActionableMentionWhisper(reportId: string, reportAction: OnyxEntry<ReportAction>, resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION>) {
    const message = ReportActionsUtils.getReportActionMessage(reportAction);
    if (!message || !reportAction) {
        return;
    }

    const updatedMessage: Message = {
        ...message,
        resolution,
    };

    const optimisticReportActions = {
        [reportAction.reportActionID]: {
            originalMessage: {
                resolution,
            },
        },
    };

    const reportUpdateDataWithPreviousLastMessage = ReportUtils.getReportLastMessage(reportId, optimisticReportActions as ReportActions);

    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportId}`];
    const reportUpdateDataWithCurrentLastMessage = {
        lastMessageTranslationKey: report?.lastMessageTranslationKey,
        lastMessageText: report?.lastMessageText,
        lastVisibleActionCreated: report?.lastVisibleActionCreated,
        lastActorAccountID: report?.lastActorAccountID,
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportId}`,
            value: {
                [reportAction.reportActionID]: {
                    message: [updatedMessage],
                    originalMessage: {
                        resolution,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportId}`,
            value: reportUpdateDataWithPreviousLastMessage,
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportId}`,
            value: {
                [reportAction.reportActionID]: {
                    message: [message],
                    originalMessage: {
                        resolution: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportId}`,
            value: reportUpdateDataWithCurrentLastMessage, // revert back to the current report last message data in case of failure
        },
    ];

    const parameters: ResolveActionableMentionWhisperParams = {
        reportActionID: reportAction.reportActionID,
        resolution,
    };

    API.write(WRITE_COMMANDS.RESOLVE_ACTIONABLE_MENTION_WHISPER, parameters, {optimisticData, failureData});
}

function resolveActionableReportMentionWhisper(
    reportId: string,
    reportAction: OnyxEntry<ReportAction>,
    resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION>,
) {
    if (!reportAction) {
        return;
    }

    const optimisticReportActions = {
        [reportAction.reportActionID]: {
            originalMessage: {
                resolution,
            },
        },
    };

    const reportUpdateDataWithPreviousLastMessage = ReportUtils.getReportLastMessage(reportId, optimisticReportActions as ReportActions);

    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportId}`];
    const reportUpdateDataWithCurrentLastMessage = {
        lastMessageTranslationKey: report?.lastMessageTranslationKey,
        lastMessageText: report?.lastMessageText,
        lastVisibleActionCreated: report?.lastVisibleActionCreated,
        lastActorAccountID: report?.lastActorAccountID,
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportId}`,
            value: {
                [reportAction.reportActionID]: {
                    originalMessage: {
                        resolution,
                    },
                },
            } as ReportActions,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportId}`,
            value: reportUpdateDataWithPreviousLastMessage,
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportId}`,
            value: {
                [reportAction.reportActionID]: {
                    originalMessage: {
                        resolution: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportId}`,
            value: reportUpdateDataWithCurrentLastMessage, // revert back to the current report last message data in case of failure
        },
    ];

    const parameters: ResolveActionableReportMentionWhisperParams = {
        reportActionID: reportAction.reportActionID,
        resolution,
    };

    API.write(WRITE_COMMANDS.RESOLVE_ACTIONABLE_REPORT_MENTION_WHISPER, parameters, {optimisticData, failureData});
}

function dismissTrackExpenseActionableWhisper(reportID: string, reportAction: OnyxEntry<ReportAction>): void {
    const isArrayMessage = Array.isArray(reportAction?.message);
    const message = ReportActionsUtils.getReportActionMessage(reportAction);
    if (!message || !reportAction) {
        return;
    }

    const updatedMessage: Message = {
        ...message,
        resolution: CONST.REPORT.ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION.NOTHING,
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    message: isArrayMessage ? [updatedMessage] : updatedMessage,
                    originalMessage: {
                        resolution: CONST.REPORT.ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION.NOTHING,
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    message: [message],
                    originalMessage: {
                        resolution: null,
                    },
                },
            },
        },
    ];

    const params = {
        reportActionID: reportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.DISMISS_TRACK_EXPENSE_ACTIONABLE_WHISPER, params, {optimisticData, failureData});
}

function setGroupDraft(newGroupDraft: Partial<NewGroupChatDraft>) {
    Onyx.merge(ONYXKEYS.NEW_GROUP_CHAT_DRAFT, newGroupDraft);
}

function exportToIntegration(reportID: string, connectionName: ConnectionName) {
    const action = ReportUtils.buildOptimisticExportIntegrationAction(connectionName);
    const optimisticReportActionID = action.reportActionID;

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticReportActionID]: action,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticReportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const params = {
        reportIDList: reportID,
        connectionName,
        type: 'MANUAL',
        optimisticReportActions: JSON.stringify({
            [reportID]: optimisticReportActionID,
        }),
    } satisfies ReportExportParams;

    API.write(WRITE_COMMANDS.REPORT_EXPORT, params, {optimisticData, failureData});
}

function markAsManuallyExported(reportID: string, connectionName: ConnectionName) {
    const action = ReportUtils.buildOptimisticExportIntegrationAction(connectionName, true);
    const label = CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName];
    const optimisticReportActionID = action.reportActionID;

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticReportActionID]: action,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticReportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticReportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const params = {
        markedManually: true,
        data: JSON.stringify([
            {
                reportID,
                label,
                optimisticReportActionID,
            },
        ]),
    } satisfies MarkAsExportedParams;

    API.write(WRITE_COMMANDS.MARK_AS_EXPORTED, params, {optimisticData, successData, failureData});
}

export type {Video};

export {
    searchInServer,
    addComment,
    addAttachment,
    updateDescription,
    updateWriteCapabilityAndNavigate,
    updateNotificationPreference,
    subscribeToReportTypingEvents,
    subscribeToReportLeavingEvents,
    unsubscribeFromReportChannel,
    unsubscribeFromLeavingRoomReportChannel,
    saveReportDraftComment,
    broadcastUserIsTyping,
    broadcastUserIsLeavingRoom,
    togglePinnedState,
    editReportComment,
    handleUserDeletedLinksInHtml,
    deleteReportActionDraft,
    saveReportActionDraft,
    deleteReportComment,
    navigateToConciergeChat,
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
    getMostRecentReportID,
    joinRoom,
    leaveRoom,
    inviteToRoom,
    inviteToGroupChat,
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
    updateLastVisitTime,
    clearNewRoomFormError,
    updateReportField,
    updateReportName,
    deleteReportField,
    clearReportFieldKeyErrors,
    resolveActionableMentionWhisper,
    resolveActionableReportMentionWhisper,
    updateRoomVisibility,
    dismissTrackExpenseActionableWhisper,
    setGroupDraft,
    clearGroupChat,
    startNewChat,
    completeOnboarding,
    updateGroupChatName,
    updateGroupChatAvatar,
    leaveGroupChat,
    removeFromGroupChat,
    updateGroupChatMemberRoles,
    updateLoadingInitialReportAction,
    clearAddRoomMemberError,
    clearAvatarErrors,
    exportToIntegration,
    markAsManuallyExported,
    handleReportChanged,
};
