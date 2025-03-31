import {findFocusedRoute} from '@react-navigation/native';
import {format as timezoneFormat, toZonedTime} from 'date-fns-tz';
import {Str} from 'expensify-common';
import isEmpty from 'lodash/isEmpty';
import {DeviceEventEmitter, InteractionManager, Linking} from 'react-native';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {PartialDeep, ValueOf} from 'type-fest';
import type {Emoji} from '@assets/emojis/types';
import type {FileObject} from '@components/AttachmentModal';
import * as ActiveClientManager from '@libs/ActiveClientManager';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import * as API from '@libs/API';
import type {
    AddCommentOrAttachementParams,
    AddEmojiReactionParams,
    AddWorkspaceRoomParams,
    CompleteGuidedSetupParams,
    DeleteCommentParams,
    ExpandURLPreviewParams,
    ExportReportPDFParams,
    FlagCommentParams,
    GetNewerActionsParams,
    GetOlderActionsParams,
    GetReportPrivateNoteParams,
    InviteToGroupChatParams,
    InviteToRoomParams,
    LeaveRoomParams,
    MarkAsExportedParams,
    MarkAsUnreadParams,
    MoveIOUReportToExistingPolicyParams,
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
    UpdateChatNameParams,
    UpdateCommentParams,
    UpdateGroupChatAvatarParams,
    UpdateGroupChatMemberRolesParams,
    UpdatePolicyRoomNameParams,
    UpdateReportNotificationPreferenceParams,
    UpdateReportPrivateNoteParams,
    UpdateReportWriteCapabilityParams,
    UpdateRoomDescriptionParams,
} from '@libs/API/parameters';
import type ExportReportCSVParams from '@libs/API/parameters/ExportReportCSVParams';
import type UpdateRoomVisibilityParams from '@libs/API/parameters/UpdateRoomVisibilityParams';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ApiUtils from '@libs/ApiUtils';
import * as Browser from '@libs/Browser';
import * as CollectionUtils from '@libs/CollectionUtils';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import DateUtils from '@libs/DateUtils';
import {prepareDraftComment} from '@libs/DraftCommentUtils';
import * as EmojiUtils from '@libs/EmojiUtils';
import * as Environment from '@libs/Environment/Environment';
import {getOldDotURLFromEnvironment} from '@libs/Environment/Environment';
import getEnvironment from '@libs/Environment/getEnvironment';
import type EnvironmentType from '@libs/Environment/getEnvironment/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import HttpUtils from '@libs/HttpUtils';
import isPublicScreenRoute from '@libs/isPublicScreenRoute';
import * as Localize from '@libs/Localize';
import Log from '@libs/Log';
import {registerPaginationConfig} from '@libs/Middleware/Pagination';
import {isOnboardingFlowName} from '@libs/Navigation/helpers/isNavigatorName';
import type {LinkToOptions} from '@libs/Navigation/helpers/linkTo/types';
import shouldOpenOnAdminRoom from '@libs/Navigation/helpers/shouldOpenOnAdminRoom';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import enhanceParameters from '@libs/Network/enhanceParameters';
import type {NetworkStatus} from '@libs/NetworkConnection';
import {buildNextStep} from '@libs/NextStepUtils';
import LocalNotification from '@libs/Notification/LocalNotification';
import {rand64} from '@libs/NumberUtils';
import Parser from '@libs/Parser';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PhoneNumber from '@libs/PhoneNumber';
import {extractPolicyIDFromPath, getPolicy} from '@libs/PolicyUtils';
import processReportIDDeeplink from '@libs/processReportIDDeeplink';
import Pusher from '@libs/Pusher';
import type {UserIsLeavingRoomEvent, UserIsTypingEvent} from '@libs/Pusher/types';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import type {OptimisticAddCommentReportAction, OptimisticChatReport, OptimisticNewReport} from '@libs/ReportUtils';
import {
    buildOptimisticAddCommentReportAction,
    buildOptimisticChangeFieldAction,
    buildOptimisticChangePolicyReportAction,
    buildOptimisticChatReport,
    buildOptimisticCreatedReportAction,
    buildOptimisticExportIntegrationAction,
    buildOptimisticGroupChatReport,
    buildOptimisticRenamedRoomReportAction,
    buildOptimisticReportPreview,
    buildOptimisticRoomDescriptionUpdatedReportAction,
    buildOptimisticSelfDMReport,
    buildOptimisticTaskCommentReportAction,
    buildOptimisticTaskReport,
    buildOptimisticTaskReportAction,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    completeShortMention,
    findLastAccessedReport,
    findSelfDMReportID,
    formatReportLastMessageText,
    generateReportID,
    getChatByParticipants,
    getChildReportNotificationPreference,
    getDefaultNotificationPreferenceForReport,
    getExpenseReportStateAndStatus,
    getFieldViolation,
    getLastVisibleMessage,
    getOptimisticDataForParentReportAction,
    getOriginalReportID,
    getParsedComment,
    getPendingChatMembers,
    getPolicyExpenseChat,
    getReportFieldKey,
    getReportFieldsByPolicyID,
    getReportIDFromLink,
    getReportLastMessage,
    getReportLastVisibleActionCreated,
    getReportMetadata,
    getReportNotificationPreference,
    getReportTransactions,
    getReportViolations,
    getRouteFromLink,
    getTitleReportField,
    isChatThread as isChatThreadReportUtils,
    isConciergeChatReport,
    isExpenseReport,
    isGroupChat as isGroupChatReportUtils,
    isHiddenForCurrentUser,
    isIOUReportUsingReport,
    isMoneyRequestReport,
    isSelfDM,
    isValidReportIDFromPath,
    populateOptimisticReportFormula,
} from '@libs/ReportUtils';
import shouldSkipDeepLinkNavigation from '@libs/shouldSkipDeepLinkNavigation';
import {getNavatticURL} from '@libs/TourUtils';
import {addTrailingForwardSlash} from '@libs/Url';
import {generateAccountID} from '@libs/UserUtils';
import Visibility from '@libs/Visibility';
import CONFIG from '@src/CONFIG';
import type {OnboardingAccounting, OnboardingCompanySize} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NewRoomForm';
import type {
    DismissedProductTraining,
    IntroSelected,
    InvitedEmailsToAccountIDs,
    NewGroupChatDraft,
    Onboarding,
    OnboardingPurpose,
    PersonalDetails,
    PersonalDetailsList,
    Policy,
    PolicyReportField,
    QuickAction,
    RecentlyUsedReportFields,
    Report,
    ReportAction,
    ReportActionReactions,
    ReportUserIsTyping,
    Transaction,
} from '@src/types/onyx';
import type {Decision} from '@src/types/onyx/OriginalMessage';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type {NotificationPreference, Participants, Participant as ReportParticipant, RoomVisibility, WriteCapability} from '@src/types/onyx/Report';
import type {Message, ReportActions} from '@src/types/onyx/ReportAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {clearByKey} from './CachedPDFPaths';
import {setDownload} from './Download';
import {close} from './Modal';
import navigateFromNotification from './navigateFromNotification';
import {
    createUpdateCommentMatcher,
    resolveCommentDeletionConflicts,
    resolveDuplicationConflictAction,
    resolveEditCommentWithNewAddCommentRequest,
    resolveOpenReportDuplicationConflictAction,
} from './RequestConflictUtils';
import {canAnonymousUserAccessRoute, hasAuthToken, isAnonymousUser, signOutAndRedirectToSignIn, waitForUserSignIn} from './Session';
import {isOnboardingFlowCompleted, onServerDataReady, setOnboardingErrorMessage} from './Welcome';
import {startOnboardingFlow} from './Welcome/OnboardingFlow';

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
          assigneeChatReportID?: string;
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
const addNewMessageWithText = new Set<string>([WRITE_COMMANDS.ADD_COMMENT, WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT]);
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

Onyx.connect({
    key: ONYXKEYS.DERIVED.CONCIERGE_CHAT_REPORT_ID,
    callback: (value) => (conciergeChatReportID = value),
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
    callback: (actions, key) => {
        if (!key || !actions) {
            return;
        }
        const reportID = CollectionUtils.extractCollectionItemID(key);
        allReportActions[reportID] = actions;
    },
});

let allReports: OnyxCollection<Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
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

let onboarding: OnyxEntry<Onboarding>;
Onyx.connect({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (val) => {
        if (Array.isArray(val)) {
            return;
        }
        onboarding = val;
    },
});

let introSelected: OnyxEntry<IntroSelected> = {};
Onyx.connect({
    key: ONYXKEYS.NVP_INTRO_SELECTED,
    callback: (val) => (introSelected = val),
});

let allReportDraftComments: Record<string, string | undefined> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
    waitForCollectionCallback: true,
    callback: (value) => (allReportDraftComments = value),
});

let nvpDismissedProductTraining: OnyxEntry<DismissedProductTraining>;
Onyx.connect({
    key: ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING,
    callback: (value) => (nvpDismissedProductTraining = value),
});

let environmentURL: string;
Environment.getEnvironmentURL().then((url: string) => (environmentURL = url));

let environment: EnvironmentType;
getEnvironment().then((env) => {
    environment = env;
});

registerPaginationConfig({
    initialCommand: WRITE_COMMANDS.OPEN_REPORT,
    previousCommand: READ_COMMANDS.GET_OLDER_ACTIONS,
    nextCommand: READ_COMMANDS.GET_NEWER_ACTIONS,
    resourceCollectionKey: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    pageCollectionKey: ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES,
    sortItems: (reportActions, reportID) => {
        const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
        const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report);
        return ReportActionsUtils.getSortedReportActionsForDisplay(reportActions, canUserPerformWriteAction, true);
    },
    getItemID: (reportAction) => reportAction.reportActionID,
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
function getNormalizedStatus(typingStatus: UserIsTypingEvent | UserIsLeavingRoomEvent): ReportUserIsTyping {
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
        const accountIDOrLogin = Object.keys(normalizedTypingStatus).at(0);

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
function subscribeToReportLeavingEvents(reportID: string | undefined) {
    if (!reportID) {
        return;
    }

    // Make sure we have a clean Leaving indicator before subscribing to leaving events
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportID}`, false);

    const pusherChannelName = getReportChannelName(reportID);
    Pusher.subscribe(pusherChannelName, Pusher.TYPE.USER_IS_LEAVING_ROOM, (leavingStatus: UserIsLeavingRoomEvent) => {
        // If the pusher message comes from OldDot, we expect the leaving status to be keyed by user
        // login OR by 'Concierge'. If the pusher message comes from NewDot, it is keyed by accountID
        // since personal details are keyed by accountID.
        const normalizedLeavingStatus = getNormalizedStatus(leavingStatus);
        const accountIDOrLogin = Object.keys(normalizedLeavingStatus).at(0);

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
function unsubscribeFromLeavingRoomReportChannel(reportID: string | undefined) {
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
function notifyNewAction(reportID: string | undefined, accountID?: number, reportActionID?: string) {
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
        const reportComment = buildOptimisticAddCommentReportAction(text, undefined, undefined, undefined, undefined, reportID);
        reportCommentAction = reportComment.reportAction;
        reportCommentText = reportComment.commentText;
    }

    if (file) {
        // When we are adding an attachment we will call AddAttachment.
        // It supports sending an attachment with an optional comment and AddComment supports adding a single text comment only.
        commandName = WRITE_COMMANDS.ADD_ATTACHMENT;
        const attachment = buildOptimisticAddCommentReportAction(text, file, undefined, undefined, undefined, reportID);
        attachmentAction = attachment.reportAction;
    }

    if (text && file) {
        // When there is both text and a file, the text for the report comment needs to be parsed)
        reportCommentText = getParsedComment(text ?? '', {reportID});

        // And the API command needs to go to the new API which supports combining both text and attachments in a single report action
        commandName = WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT;
    }

    // Always prefer the file as the last action over text
    const lastAction = attachmentAction ?? reportCommentAction;
    const currentTime = DateUtils.getDBTimeWithSkew();
    const lastComment = ReportActionsUtils.getReportActionMessage(lastAction);
    const lastCommentText = formatReportLastMessageText(lastComment?.text ?? '');

    const optimisticReport: Partial<Report> = {
        lastVisibleActionCreated: lastAction?.created,
        lastMessageText: lastCommentText,
        lastMessageHtml: lastCommentText,
        lastActorAccountID: currentUserAccountID,
        lastReadTime: currentTime,
    };

    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const shouldUpdateNotificationPreference = !isEmptyObject(report) && isHiddenForCurrentUser(report);
    if (shouldUpdateNotificationPreference) {
        optimisticReport.participants = {
            [currentUserAccountID]: {notificationPreference: getDefaultNotificationPreferenceForReport(report)},
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
        idempotencyKey: Str.guid(),
    };

    if (reportIDDeeplinkedFromOldDot === reportID && isConciergeChatReport(report)) {
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

    let failureReport: Partial<Report> = {
        lastMessageText: '',
        lastVisibleActionCreated: '',
    };
    const {lastMessageText = ''} = ReportActionsUtils.getLastVisibleMessage(reportID);
    if (lastMessageText) {
        const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(reportID);
        const lastVisibleActionCreated = lastVisibleAction?.created;
        const lastActorAccountID = lastVisibleAction?.actorAccountID;
        failureReport = {
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
    const optimisticParentReportData = getOptimisticDataForParentReportAction(reportID, currentTime, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
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

function updateChatName(reportID: string, reportName: string, type: typeof CONST.REPORT.CHAT_TYPE.GROUP | typeof CONST.REPORT.CHAT_TYPE.TRIP_ROOM) {
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
                reportName: allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.reportName ?? null,
                pendingFields: {
                    reportName: null,
                },
            },
        },
    ];

    const command = type === CONST.REPORT.CHAT_TYPE.GROUP ? WRITE_COMMANDS.UPDATE_GROUP_CHAT_NAME : WRITE_COMMANDS.UPDATE_TRIP_ROOM_NAME;
    const parameters: UpdateChatNameParams = {reportName, reportID};

    API.write(command, parameters, {optimisticData, successData, failureData});
}

function updateGroupChatAvatar(reportID: string, file?: File | CustomRNImageManipulatorResult) {
    // If we have no file that means we are removing the avatar.
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                avatarUrl: file ? file?.uri ?? '' : null,
                pendingFields: {
                    avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    avatar: null,
                },
            },
        },
    ];

    const fetchedReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                avatarUrl: fetchedReport?.avatarUrl ?? null,
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
    reportID: string | undefined,
    reportActionID?: string,
    participantLoginList: string[] = [],
    newReportObject?: OptimisticChatReport,
    parentReportActionID?: string,
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
              reportName: allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.reportName ?? CONST.REPORT.DEFAULT_REPORT_NAME,
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

    const finallyData: OnyxUpdate[] = [];

    const parameters: OpenReportParams = {
        reportID,
        reportActionID,
        emailList: participantLoginList ? participantLoginList.join(',') : '',
        accountIDList: participantAccountIDList ? participantAccountIDList.join(',') : '',
        parentReportActionID,
    };

    const isInviteOnboardingComplete = introSelected?.isInviteOnboardingComplete ?? false;
    const isOnboardingCompleted = onboarding?.hasCompletedGuidedSetupFlow ?? false;

    // Prepare guided setup data only when nvp_introSelected is set and onboarding is not completed
    // OldDot users will never have nvp_introSelected set, so they will not see guided setup messages
    if (introSelected && !isOnboardingCompleted && !isInviteOnboardingComplete) {
        const {choice, inviteType} = introSelected;
        const isInviteIOUorInvoice = inviteType === CONST.ONBOARDING_INVITE_TYPES.IOU || inviteType === CONST.ONBOARDING_INVITE_TYPES.INVOICE;
        const isInviteChoiceCorrect = choice === CONST.ONBOARDING_CHOICES.ADMIN || choice === CONST.ONBOARDING_CHOICES.SUBMIT || choice === CONST.ONBOARDING_CHOICES.CHAT_SPLIT;

        if (isInviteChoiceCorrect && !isInviteIOUorInvoice) {
            const onboardingMessage = CONST.ONBOARDING_MESSAGES[choice];
            if (choice === CONST.ONBOARDING_CHOICES.CHAT_SPLIT) {
                const updatedTasks = onboardingMessage.tasks.map((task) => (task.type === 'startChat' ? {...task, autoCompleted: true} : task));
                onboardingMessage.tasks = updatedTasks;
            }

            const onboardingData = prepareOnboardingOnyxData(choice, onboardingMessage);

            if (onboardingData) {
                optimisticData.push(...onboardingData.optimisticData, {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NVP_INTRO_SELECTED,
                    value: {
                        isInviteOnboardingComplete: true,
                    },
                });

                successData.push(...onboardingData.successData);

                failureData.push(...onboardingData.failureData);

                parameters.guidedSetupData = JSON.stringify(onboardingData.guidedSetupData);
            }
        }
    }

    const isGroupChat = isGroupChatReportUtils(newReportObject);
    if (isGroupChat) {
        parameters.chatType = CONST.REPORT.CHAT_TYPE.GROUP;
        parameters.groupChatAdminLogins = currentUserEmail;
        parameters.optimisticAccountIDList = Object.keys(newReportObject?.participants ?? {}).join(',');
        parameters.reportName = newReportObject?.reportName ?? '';

        // If we have an avatar then include it with the parameters
        if (avatar) {
            parameters.file = avatar;
        }

        InteractionManager.runAfterInteractions(() => {
            clearGroupChat();
        });
    }

    if (isFromDeepLink) {
        parameters.shouldRetry = false;
    }

    // If we are creating a new report, we need to add the optimistic report data and a report action
    const isCreatingNewReport = !isEmptyObject(newReportObject);
    if (isCreatingNewReport) {
        // Change the method to set for new reports because it doesn't exist yet, is faster,
        // and we need the data to be available when we navigate to the chat page
        const optimisticDataItem = optimisticData.at(0);
        if (optimisticDataItem) {
            optimisticDataItem.onyxMethod = Onyx.METHOD.SET;
            optimisticDataItem.value = {
                ...optimisticReport,
                reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
                ...newReportObject,
                pendingFields: {
                    createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    ...(isGroupChat && {reportName: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}),
                },
            };
        }

        let emailCreatingAction: string = CONST.REPORT.OWNER_EMAIL_FAKE;
        if (newReportObject.ownerAccountID && newReportObject.ownerAccountID !== CONST.REPORT.OWNER_ACCOUNT_ID_FAKE) {
            emailCreatingAction = allPersonalDetails?.[newReportObject.ownerAccountID]?.login ?? '';
        }
        const optimisticCreatedAction = buildOptimisticCreatedReportAction(emailCreatingAction);
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
                value: {[optimisticCreatedAction.reportActionID]: optimisticCreatedAction},
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                value: {
                    isOptimisticReport: true,
                },
            },
        );
        successData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
                value: {[optimisticCreatedAction.reportActionID]: {pendingAction: null}},
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                value: {
                    isOptimisticReport: false,
                },
            },
        );

        // Add optimistic personal details for new participants
        const optimisticPersonalDetails: OnyxEntry<PersonalDetailsList> = {};
        const settledPersonalDetails: OnyxEntry<PersonalDetailsList> = {};
        const redundantParticipants: Record<number, null> = {};
        const participantAccountIDs = PersonalDetailsUtils.getAccountIDsByLogins(participantLoginList);
        participantLoginList.forEach((login, index) => {
            const accountID = participantAccountIDs.at(index) ?? -1;
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

        successData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    participants: redundantParticipants,
                    pendingFields: {
                        createChat: null,
                        reportName: null,
                    },
                    errorFields: {
                        createChat: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                value: {
                    isOptimisticReport: false,
                },
            },
        );

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
                value: {[parentReportActionID]: {childType: ''}},
            });
        }
    }

    parameters.clientLastReadTime = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.lastReadTime ?? '';

    const paginationConfig = {
        resourceID: reportID,
        cursorID: reportActionID,
    };

    if (isFromDeepLink) {
        finallyData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.IS_CHECKING_PUBLIC_ROOM,
            value: false,
        });

        API.paginate(CONST.API_REQUEST_TYPE.WRITE, WRITE_COMMANDS.OPEN_REPORT, parameters, {optimisticData, successData, failureData, finallyData}, paginationConfig);
    } else {
        // eslint-disable-next-line rulesdir/no-multiple-api-calls
        API.paginate(CONST.API_REQUEST_TYPE.WRITE, WRITE_COMMANDS.OPEN_REPORT, parameters, {optimisticData, successData, failureData, finallyData}, paginationConfig, {
            checkAndFixConflictingRequest: (persistedRequests) => resolveOpenReportDuplicationConflictAction(persistedRequests, parameters),
        });
    }
}

/**
 * This will return an optimistic report object for a given user we want to create a chat with without saving it, when the only thing we know about recipient is his accountID. *
 * @param accountID accountID of the user that the optimistic chat report is created with.
 */
function getOptimisticChatReport(accountID: number): OptimisticChatReport {
    return buildOptimisticChatReport({
        participantList: [accountID, currentUserAccountID],
        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
    });
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
    reportName?: string,
    avatarUri?: string,
    avatarFile?: File | CustomRNImageManipulatorResult | undefined,
    optimisticReportID?: string,
    isGroupChat = false,
) {
    let newChat: OptimisticChatReport | undefined;
    let chat: OnyxEntry<Report>;
    const participantAccountIDs = PersonalDetailsUtils.getAccountIDsByLogins(userLogins);

    // If we are not creating a new Group Chat then we are creating a 1:1 DM and will look for an existing chat
    if (!isGroupChat) {
        chat = getChatByParticipants([...participantAccountIDs, currentUserAccountID]);
    }

    if (isEmptyObject(chat)) {
        if (isGroupChat) {
            // If we are creating a group chat then participantAccountIDs is expected to contain currentUserAccountID
            newChat = buildOptimisticGroupChatReport(participantAccountIDs, reportName ?? '', avatarUri ?? '', optimisticReportID, CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);
        } else {
            newChat = buildOptimisticChatReport({
                participantList: [...participantAccountIDs, currentUserAccountID],
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
            });
        }
    }
    const report = isEmptyObject(chat) ? newChat : chat;

    // We want to pass newChat here because if anything is passed in that param (even an existing chat), we will try to create a chat on the server
    openReport(report?.reportID, '', userLogins, newChat, undefined, undefined, undefined, avatarFile);
    if (shouldDismissModal) {
        if (getIsNarrowLayout()) {
            Navigation.dismissModalWithReport({report});
            return;
        }

        Navigation.dismissModal();
    }

    // In some cases when RHP modal gets hidden and then we navigate to report Composer focus breaks, wrapping navigation in setTimeout fixes this
    setTimeout(() => {
        Navigation.isNavigationReady().then(() => Navigation.navigateToReportWithPolicyCheck({report}));
    }, 0);
}

/**
 * This will find an existing chat, or create a new one if none exists, for the given accountID or set of accountIDs. It will then navigate to this chat.
 *
 * @param participantAccountIDs of user logins to start a chat report with.
 */
function navigateToAndOpenReportWithAccountIDs(participantAccountIDs: number[]) {
    let newChat: OptimisticChatReport | undefined;
    const chat = getChatByParticipants([...participantAccountIDs, currentUserAccountID]);
    if (!chat) {
        newChat = buildOptimisticChatReport({
            participantList: [...participantAccountIDs, currentUserAccountID],
        });
    }
    const report = chat ?? newChat;

    // We want to pass newChat here because if anything is passed in that param (even an existing chat), we will try to create a chat on the server
    openReport(report?.reportID, '', [], newChat, '0', false, participantAccountIDs);
    Navigation.navigateToReportWithPolicyCheck({report});
}

/**
 * This will navigate to an existing thread, or create a new one if necessary
 *
 * @param childReportID The reportID we are trying to open
 * @param parentReportAction the parent comment of a thread
 * @param parentReportID The reportID of the parent
 */
function navigateToAndOpenChildReport(childReportID: string | undefined, parentReportAction: Partial<ReportAction> = {}, parentReportID?: string) {
    const childReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${childReportID}`];
    if (childReport?.reportID) {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID));
    } else {
        const participantAccountIDs = [...new Set([currentUserAccountID, Number(parentReportAction.actorAccountID)])];
        const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`];
        // Threads from DMs and selfDMs don't have a chatType. All other threads inherit the chatType from their parent
        const childReportChatType = parentReport && isSelfDM(parentReport) ? undefined : parentReport?.chatType;
        const newChat = buildOptimisticChatReport({
            participantList: participantAccountIDs,
            reportName: ReportActionsUtils.getReportActionText(parentReportAction),
            chatType: childReportChatType,
            policyID: parentReport?.policyID ?? CONST.POLICY.OWNER_EMAIL_FAKE,
            ownerAccountID: CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
            oldPolicyName: parentReport?.policyName ?? '',
            notificationPreference: getChildReportNotificationPreference(parentReportAction),
            parentReportActionID: parentReportAction.reportActionID,
            parentReportID,
            optimisticReportID: childReportID,
        });

        if (!childReportID) {
            const participantLogins = PersonalDetailsUtils.getLoginsByAccountIDs(Object.keys(newChat.participants ?? {}).map(Number));
            openReport(newChat.reportID, '', participantLogins, newChat, parentReportAction.reportActionID);
        } else {
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${childReportID}`, newChat);
        }

        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(newChat.reportID));
    }
}

/**
 * Gets the older actions that have not been read yet.
 * Normally happens when you scroll up on a chat, and the actions have not been read yet.
 */
function getOlderActions(reportID: string | undefined, reportActionID: string | undefined) {
    if (!reportID || !reportActionID) {
        return;
    }

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
function getNewerActions(reportID: string | undefined, reportActionID: string | undefined) {
    if (!reportID || !reportActionID) {
        return;
    }

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
function expandURLPreview(reportID: string | undefined, reportActionID: string) {
    if (!reportID) {
        return;
    }

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
function readNewestAction(reportID: string | undefined, shouldResetUnreadMarker = false) {
    if (!reportID) {
        return;
    }

    const lastReadTime = DateUtils.getDBTimeWithSkew();

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
function markCommentAsUnread(reportID: string | undefined, reportAction: ReportAction) {
    if (!reportID) {
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

    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const transactionThreadReportID = ReportActionsUtils.getOneTransactionThreadReportID(reportID, reportActions ?? []);
    const transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`];

    // If no action created date is provided, use the last action's from other user
    const actionCreationTime =
        reportAction?.created || (latestReportActionFromOtherUsers?.created ?? getReportLastVisibleActionCreated(report, transactionThreadReport) ?? DateUtils.getDBTime(0));

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
        reportActionID: reportAction?.reportActionID,
    };

    API.write(WRITE_COMMANDS.MARK_AS_UNREAD, parameters, {optimisticData});
    DeviceEventEmitter.emit(`unreadAction_${reportID}`, lastReadTime);
}

/** Toggles the pinned state of the report. */
function togglePinnedState(reportID: string | undefined, isPinnedChat: boolean) {
    if (!reportID) {
        return;
    }

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

/** Saves the report draft to Onyx */
function saveReportDraft(reportID: string, report: Report) {
    return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`, report);
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
    const typingStatus: UserIsTypingEvent = {
        [currentUserAccountID]: true,
    };
    Pusher.sendEvent(privateReportChannelName, Pusher.TYPE.USER_IS_TYPING, typingStatus);
}

/** Broadcasts to the report's private pusher channel whether a user is leaving a report */
function broadcastUserIsLeavingRoom(reportID: string) {
    const privateReportChannelName = getReportChannelName(reportID);
    const leavingStatus: UserIsLeavingRoomEvent = {
        [currentUserAccountID]: true,
    };
    Pusher.sendEvent(privateReportChannelName, Pusher.TYPE.USER_IS_LEAVING_ROOM, leavingStatus);
}

/** When a report changes in Onyx, this fetches the report from the API if the report doesn't have a name */
function handleReportChanged(report: OnyxEntry<Report>) {
    if (!report) {
        return;
    }

    const {reportID, preexistingReportID, parentReportID, parentReportActionID} = report;

    // Handle cleanup of stale optimistic IOU report and its report preview separately
    if (reportID && preexistingReportID && isMoneyRequestReport(report) && parentReportActionID) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
            [parentReportActionID]: null,
        });
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, null);
        return;
    }

    // It is possible that we optimistically created a DM/group-DM for a set of users for which a report already exists.
    // In this case, the API will let us know by returning a preexistingReportID.
    // We should clear out the optimistically created report and re-route the user to the preexisting report.
    if (reportID && preexistingReportID) {
        let callback = () => {
            const existingReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`];

            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, null);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, {
                ...report,
                reportID: preexistingReportID,
                preexistingReportID: null,
                // Replacing the existing report's participants to avoid duplicates
                participants: existingReport?.participants ?? report.participants,
            });
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, null);
        };
        // Only re-route them if they are still looking at the optimistically created report
        if (Navigation.getActiveRoute().includes(`/r/${reportID}`)) {
            const currCallback = callback;
            callback = () => {
                currCallback();
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(preexistingReportID), {forceReplace: true});
            };

            // The report screen will listen to this event and transfer the draft comment to the existing report
            // This will allow the newest draft comment to be transferred to the existing report
            DeviceEventEmitter.emit(`switchToPreExistingReport_${reportID}`, {
                preexistingReportID,
                callback,
            });

            return;
        }

        // In case the user is not on the report screen, we will transfer the report draft comment directly to the existing report
        // after that clear the optimistically created report
        const draftReportComment = allReportDraftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`];
        if (!draftReportComment) {
            callback();
            return;
        }

        saveReportDraftComment(preexistingReportID, draftReportComment, callback);
    }
}

/** Deletes a comment from the report, basically sets it as empty string */
function deleteReportComment(reportID: string | undefined, reportAction: ReportAction) {
    const originalReportID = getOriginalReportID(reportID, reportAction);
    const reportActionID = reportAction.reportActionID;

    if (!reportActionID || !originalReportID || !reportID) {
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
        lastMessageText: '',
        lastVisibleActionCreated: '',
    };
    const {lastMessageText = ''} = getLastVisibleMessage(originalReportID, optimisticReportActions as ReportActions);
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report);
    if (lastMessageText) {
        const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(originalReportID, canUserPerformWriteAction, optimisticReportActions as ReportActions);
        const lastVisibleActionCreated = lastVisibleAction?.created;
        const lastActorAccountID = lastVisibleAction?.actorAccountID;
        optimisticReport = {
            lastMessageText,
            lastVisibleActionCreated,
            lastActorAccountID,
        };
    }
    const didCommentMentionCurrentUser = ReportActionsUtils.didMessageMentionCurrentUser(reportAction);
    if (didCommentMentionCurrentUser && reportAction.created === report?.lastMentionedTime) {
        const reportActionsForReport = allReportActions?.[reportID];
        const latestMentioneReportAction = Object.values(reportActionsForReport ?? {}).find(
            (action) =>
                action.reportActionID !== reportAction.reportActionID &&
                ReportActionsUtils.didMessageMentionCurrentUser(action) &&
                ReportActionsUtils.shouldReportActionBeVisible(action, action.reportActionID),
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
        const optimisticParentReportData = getOptimisticDataForParentReportAction(
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

    clearByKey(reportActionID);

    API.write(
        WRITE_COMMANDS.DELETE_COMMENT,
        parameters,
        {optimisticData, successData, failureData},
        {
            checkAndFixConflictingRequest: (persistedRequests) => resolveCommentDeletionConflicts(persistedRequests, reportActionID, originalReportID),
        },
    );

    // if we are linking to the report action, and we are deleting it, and it's not a deleted parent action,
    // we should navigate to its report in order to not show not found page
    if (Navigation.isActiveRoute(ROUTES.REPORT_WITH_ID.getRoute(reportID, reportActionID)) && !isDeletedParentAction) {
        Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(reportID));
    } else if (Navigation.isActiveRoute(ROUTES.REPORT_WITH_ID.getRoute(reportAction.childReportID)) && !isDeletedParentAction) {
        Navigation.goBack(undefined);
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

    const textWithMention = completeShortMention(newCommentText);

    const htmlForNewComment = Parser.replace(textWithMention, {
        extras: {videoAttributeCache},
    });
    const removedLinks = Parser.getRemovedMarkdownLinks(originalCommentMarkdown, textWithMention);
    return removeLinksFromHtml(htmlForNewComment, removedLinks);
}

/** Saves a new message for a comment. Marks the comment as edited, which will be reflected in the UI. */
function editReportComment(reportID: string | undefined, originalReportAction: OnyxEntry<ReportAction>, textForNewComment: string, videoAttributeCache?: Record<string, string>) {
    const originalReportID = getOriginalReportID(reportID, originalReportAction);
    if (!originalReportID || !originalReportAction) {
        return;
    }
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`];
    const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report);

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

    const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(originalReportID, canUserPerformWriteAction, optimisticReportActions as ReportActions);
    if (reportActionID === lastVisibleAction?.reportActionID) {
        const lastMessageText = formatReportLastMessageText(reportComment);
        const optimisticReport = {
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

    API.write(
        WRITE_COMMANDS.UPDATE_COMMENT,
        parameters,
        {optimisticData, successData, failureData},
        {
            checkAndFixConflictingRequest: (persistedRequests) => {
                const addCommentIndex = persistedRequests.findIndex((request) => addNewMessageWithText.has(request.command) && request.data?.reportActionID === reportActionID);
                if (addCommentIndex > -1) {
                    return resolveEditCommentWithNewAddCommentRequest(persistedRequests, parameters, reportActionID, addCommentIndex);
                }
                return resolveDuplicationConflictAction(persistedRequests, createUpdateCommentMatcher(reportActionID));
            },
        },
    );
}

/** Deletes the draft for a comment report action. */
function deleteReportActionDraft(reportID: string | undefined, reportAction: ReportAction) {
    const originalReportID = getOriginalReportID(reportID, reportAction);
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`, {[reportAction.reportActionID]: null});
}

/** Saves the draft for a comment report action. This will put the comment into "edit mode" */
function saveReportActionDraft(reportID: string | undefined, reportAction: ReportAction, draftMessage: string) {
    const originalReportID = getOriginalReportID(reportID, reportAction);
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`, {[reportAction.reportActionID]: {message: draftMessage}});
}

function updateNotificationPreference(
    reportID: string,
    previousValue: NotificationPreference | undefined,
    newValue: NotificationPreference,
    parentReportID?: string,
    parentReportActionID?: string,
) {
    // No change needed
    if (previousValue === newValue) {
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
function toggleSubscribeToChildReport(
    childReportID: string | undefined,
    parentReportAction: Partial<ReportAction> = {},
    parentReportID?: string,
    prevNotificationPreference?: NotificationPreference,
) {
    if (childReportID) {
        openReport(childReportID);
        const parentReportActionID = parentReportAction?.reportActionID;
        if (!prevNotificationPreference || isHiddenForCurrentUser(prevNotificationPreference)) {
            updateNotificationPreference(childReportID, prevNotificationPreference, CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, parentReportID, parentReportActionID);
        } else {
            updateNotificationPreference(childReportID, prevNotificationPreference, CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, parentReportID, parentReportActionID);
        }
    } else {
        const participantAccountIDs = [...new Set([currentUserAccountID, Number(parentReportAction?.actorAccountID)])];
        const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`];
        const newChat = buildOptimisticChatReport({
            participantList: participantAccountIDs,
            reportName: ReportActionsUtils.getReportActionText(parentReportAction),
            chatType: parentReport?.chatType,
            policyID: parentReport?.policyID ?? CONST.POLICY.OWNER_EMAIL_FAKE,
            ownerAccountID: CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            parentReportActionID: parentReportAction.reportActionID,
            parentReportID,
        });

        const participantLogins = PersonalDetailsUtils.getLoginsByAccountIDs(participantAccountIDs);
        openReport(newChat.reportID, '', participantLogins, newChat, parentReportAction.reportActionID);
        const notificationPreference = isHiddenForCurrentUser(prevNotificationPreference) ? CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS : CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
        updateNotificationPreference(newChat.reportID, prevNotificationPreference, notificationPreference, parentReportID, parentReportAction?.reportActionID);
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

function clearReportFieldKeyErrors(reportID: string | undefined, fieldKey: string) {
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
    const fieldKey = getReportFieldKey(reportField.fieldID);
    const reportViolations = getReportViolations(reportID);
    const fieldViolation = getFieldViolation(reportViolations, reportField);
    const recentlyUsedValues = allRecentlyUsedReportFields?.[fieldKey] ?? [];

    const optimisticChangeFieldAction = buildOptimisticChangeFieldAction(reportField, previousReportField);

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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticChangeFieldAction.reportActionID]: optimisticChangeFieldAction,
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticChangeFieldAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericUpdateReportFieldFailureMessage'),
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticChangeFieldAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const parameters = {
        reportID,
        reportFields: JSON.stringify({[fieldKey]: reportField}),
        reportFieldsActionIDs: JSON.stringify({[fieldKey]: optimisticChangeFieldAction.reportActionID}),
    };

    API.write(WRITE_COMMANDS.SET_REPORT_FIELD, parameters, {optimisticData, failureData, successData});
}

function deleteReportField(reportID: string, reportField: PolicyReportField) {
    const fieldKey = getReportFieldKey(reportField.fieldID);

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
    // No change needed
    if (previousValue === newValue) {
        return;
    }

    const parsedDescription = getParsedComment(newValue, {reportID});
    const optimisticDescriptionUpdatedReportAction = buildOptimisticRoomDescriptionUpdatedReportAction(parsedDescription);
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                description: parsedDescription,
                pendingFields: {description: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                lastActorAccountID: currentUserAccountID,
                lastVisibleActionCreated: optimisticDescriptionUpdatedReportAction.created,
                lastMessageText: (optimisticDescriptionUpdatedReportAction?.message as Message[])?.at(0)?.text,
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
}

function updateWriteCapability(report: Report, newValue: WriteCapability) {
    // No change needed
    if (report.writeCapability === newValue) {
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
}

/**
 * Navigates to the 1:1 report with Concierge
 */
function navigateToConciergeChat(shouldDismissModal = false, checkIfCurrentPageActive = () => true, linkToOptions?: LinkToOptions) {
    // If conciergeChatReportID contains a concierge report ID, we navigate to the concierge chat using the stored report ID.
    // Otherwise, we would find the concierge chat and navigate to it.
    if (!conciergeChatReportID) {
        // In order to avoid creating concierge repeatedly,
        // we need to ensure that the server data has been successfully pulled
        onServerDataReady().then(() => {
            // If we don't have a chat with Concierge then create it
            if (!checkIfCurrentPageActive()) {
                return;
            }
            navigateToAndOpenReport([CONST.EMAIL.CONCIERGE], shouldDismissModal);
        });
    } else if (shouldDismissModal) {
        Navigation.dismissModalWithReport({reportID: conciergeChatReportID});
    } else {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(conciergeChatReportID), linkToOptions);
    }
}

function buildNewReportOptimisticData(policy: OnyxEntry<Policy>, reportID: string, reportActionID: string, creatorPersonalDetails: PersonalDetails, reportPreviewReportActionID: string) {
    const {accountID, login} = creatorPersonalDetails;
    const parentReport = getPolicyExpenseChat(accountID, policy?.id);
    const {stateNum, statusNum} = getExpenseReportStateAndStatus(policy);
    const timeOfCreation = DateUtils.getDBTime();
    const titleReportField = getTitleReportField(getReportFieldsByPolicyID(policy?.id) ?? {});
    const optimisticDataValue: OptimisticNewReport = {
        reportID,
        policyID: policy?.id,
        type: CONST.REPORT.TYPE.EXPENSE,
        ownerAccountID: accountID,
        stateNum,
        statusNum,
        total: 0,
        nonReimbursableTotal: 0,
        participants: {},
        lastVisibleActionCreated: timeOfCreation,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        parentReportID: parentReport?.reportID,
    };

    const optimisticReportName = populateOptimisticReportFormula(titleReportField?.defaultValue ?? CONST.POLICY.DEFAULT_REPORT_NAME_PATTERN, optimisticDataValue, policy);
    optimisticDataValue.reportName = optimisticReportName;

    if (accountID) {
        optimisticDataValue.participants = {
            [accountID]: {
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
            },
        };
        optimisticDataValue.ownerAccountID = accountID;
    }

    const optimisticCreateAction = {
        action: CONST.REPORT.ACTIONS.TYPE.CREATED,
        accountEmail: login,
        accountID,
        created: timeOfCreation,
        message: {
            isNewDot: true,
            lastModified: timeOfCreation,
        },
        reportActionID,
        reportID,
        sequenceNumber: 0,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };

    const createReportActionMessage = [
        {
            html: `${policy?.name} owes ${policy?.outputCurrency} 0.00`,
            text: `${policy?.name} owes ${policy?.outputCurrency} 0.00`,
            type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
        },
    ];

    const optimisticReportPreview = {
        action: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
        actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
        childReportName: optimisticReportName,
        childReportID: reportID,
        childType: CONST.REPORT.TYPE.EXPENSE,
        created: timeOfCreation,
        shouldShow: true,
        actorAccountID: accountID,
        automatic: false,
        avatar: creatorPersonalDetails.avatar,
        isAttachmentOnly: false,
        reportActionID: reportPreviewReportActionID,
        message: createReportActionMessage,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };

    const optimisticNextStep = buildNextStep(optimisticDataValue, CONST.REPORT.STATUS_NUM.OPEN);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: optimisticDataValue,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {[reportActionID]: optimisticCreateAction},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport?.reportID}`,
            value: {[reportPreviewReportActionID]: optimisticReportPreview},
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`,
            value: optimisticNextStep,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: {
                action: CONST.QUICK_ACTIONS.CREATE_REPORT,
                chatReportID: parentReport?.reportID,
                isFirstQuickAction: isEmptyObject(quickAction),
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {errorFields: {create: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage')}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {[reportActionID]: {errorFields: {create: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage')}}},
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: quickAction ?? null,
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingAction: null,
                errorFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: null,
                    errorFields: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport?.reportID}`,
            value: {[reportActionID]: {pendingAction: null}},
        },
    ];

    return {optimisticReportName, optimisticData, successData, failureData};
}

function createNewReport(creatorPersonalDetails: PersonalDetails, policyID?: string) {
    const policy = getPolicy(policyID);
    const optimisticReportID = generateReportID();
    const reportActionID = rand64();
    const reportPreviewReportActionID = rand64();

    const {optimisticReportName, optimisticData, successData, failureData} = buildNewReportOptimisticData(
        policy,
        optimisticReportID,
        reportActionID,
        creatorPersonalDetails,
        reportPreviewReportActionID,
    );

    API.write(
        WRITE_COMMANDS.CREATE_APP_REPORT,
        {reportName: optimisticReportName, type: CONST.REPORT.TYPE.EXPENSE, policyID, reportID: optimisticReportID, reportActionID, reportPreviewReportActionID, shouldUpdateQAB: true},
        {optimisticData, successData, failureData},
    );
    return optimisticReportID;
}

/** Add a policy report (workspace room) optimistically and navigate to it. */
function addPolicyReport(policyReport: OptimisticChatReport) {
    const createdReportAction = buildOptimisticCreatedReportAction(CONST.POLICY.OWNER_EMAIL_FAKE);

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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${policyReport.reportID}`,
            value: {
                isOptimisticReport: true,
            },
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
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${policyReport.reportID}`,
            value: {
                isOptimisticReport: false,
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${policyReport.reportID}`,
            value: {
                isOptimisticReport: false,
            },
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
    Navigation.dismissModalWithReport({report: policyReport});
}

/** Deletes a report, along with its reportActions, any linked reports, and any linked IOU report. */
function deleteReport(reportID: string | undefined, shouldDeleteChildReports = false) {
    if (!reportID) {
        Log.warn('[Report] deleteReport called with no reportID');
        return;
    }
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
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
function navigateToConciergeChatAndDeleteReport(reportID: string | undefined, shouldPopToTop = false, shouldDeleteChildReports = false) {
    // Dismiss the current report screen and replace it with Concierge Chat
    if (shouldPopToTop) {
        Navigation.setShouldPopAllStateOnUP(true);
        Navigation.goBack(undefined, {shouldPopToTop: true});
    } else {
        Navigation.goBack();
    }
    navigateToConciergeChat();
    InteractionManager.runAfterInteractions(() => {
        deleteReport(reportID, shouldDeleteChildReports);
    });
}

/**
 * @param policyRoomReport The policy room report
 * @param policyRoomName The updated name for the policy room
 */
function updatePolicyRoomName(policyRoomReport: Report, policyRoomName: string) {
    const reportID = policyRoomReport.reportID;
    const previousName = policyRoomReport.reportName;

    // No change needed
    if (previousName === policyRoomName) {
        return;
    }

    const optimisticRenamedAction = buildOptimisticRenamedRoomReportAction(policyRoomName, previousName ?? '');

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
    const notificationPreference = getReportNotificationPreference(allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]);
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

    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
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
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (!report) {
        Log.hmmm("[LocalNotification] couldn't show report action notification because the report wasn't found", {localReportID, reportActionID: reportAction.reportActionID});
        return;
    }

    const onClick = () =>
        close(() => {
            const policyID = lastVisitedPath && extractPolicyIDFromPath(lastVisitedPath);
            navigateFromNotification(reportID, policyID);
        });

    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE) {
        LocalNotification.showModifiedExpenseNotification(report, reportAction, onClick);
    } else {
        LocalNotification.showCommentNotification(report, reportAction, onClick);
    }

    notifyNewAction(reportID, reportAction.actorAccountID, reportAction.reportActionID);
}

/** Clear the errors associated with the IOUs of a given report. */
function clearIOUError(reportID: string | undefined) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {errorFields: {iou: null}});
}

/**
 * Adds a reaction to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 */
function addEmojiReaction(reportID: string, reportActionID: string, emoji: Emoji, skinTone: string | number = preferredSkinTone) {
    const createdAt = timezoneFormat(toZonedTime(new Date(), 'UTC'), CONST.DATE.FNS_DB_FORMAT_STRING);
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
    reportID: string | undefined,
    reportAction: ReportAction,
    reactionObject: Emoji,
    existingReactions: OnyxEntry<ReportActionReactions>,
    paramSkinTone: number = preferredSkinTone,
    ignoreSkinToneOnCompare = false,
) {
    const originalReportID = getOriginalReportID(reportID, reportAction);

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
    const reportID = getReportIDFromLink(url);
    const isAuthenticated = hasAuthToken();

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

    const route = getRouteFromLink(url);

    // If we are not authenticated and are navigating to a public screen, we don't want to navigate again to the screen after sign-in/sign-up
    if (!isAuthenticated && isPublicScreenRoute(route)) {
        return;
    }

    // Navigate to the report after sign-in/sign-up.
    InteractionManager.runAfterInteractions(() => {
        waitForUserSignIn().then(() => {
            const connection = Onyx.connect({
                key: ONYXKEYS.NVP_ONBOARDING,
                callback: () => {
                    Navigation.waitForProtectedRoutes().then(() => {
                        if (route && isAnonymousUser() && !canAnonymousUserAccessRoute(route)) {
                            signOutAndRedirectToSignIn(true);
                            return;
                        }

                        // We don't want to navigate to the exitTo route when creating a new workspace from a deep link,
                        // because we already handle creating the optimistic policy and navigating to it in App.setUpPoliciesAndNavigate,
                        // which is already called when AuthScreens mounts.
                        if (url && new URL(url).searchParams.get('exitTo') === ROUTES.WORKSPACE_NEW) {
                            return;
                        }

                        const handleDeeplinkNavigation = () => {
                            // We want to disconnect the connection so it won't trigger the deeplink again
                            // every time the data is changed, for example, when relogin.
                            Onyx.disconnect(connection);

                            const state = navigationRef.getRootState();
                            const currentFocusedRoute = findFocusedRoute(state);

                            if (isOnboardingFlowName(currentFocusedRoute?.name)) {
                                setOnboardingErrorMessage(Localize.translateLocal('onboarding.purpose.errorBackButton'));
                                return;
                            }

                            if (shouldSkipDeepLinkNavigation(route)) {
                                return;
                            }

                            if (isAuthenticated) {
                                return;
                            }

                            // Check if the report exists in the collection
                            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                            // If the report does not exist, navigate to the last accessed report or Concierge chat
                            if (reportID && !report) {
                                const lastAccessedReportID = findLastAccessedReport(false, shouldOpenOnAdminRoom(), undefined, reportID)?.reportID;
                                if (lastAccessedReportID) {
                                    const lastAccessedReportRoute = ROUTES.REPORT_WITH_ID.getRoute(lastAccessedReportID);
                                    Navigation.navigate(lastAccessedReportRoute);
                                    return;
                                }
                                navigateToConciergeChat(false, () => true);
                                return;
                            }

                            Navigation.navigate(route as Route);
                        };

                        if (isAnonymousUser()) {
                            handleDeeplinkNavigation();
                            return;
                        }
                        // We need skip deeplinking if the user hasn't completed the guided setup flow.
                        isOnboardingFlowCompleted({
                            onNotCompleted: startOnboardingFlow,
                            onCompleted: handleDeeplinkNavigation,
                            onCanceled: handleDeeplinkNavigation,
                        });
                    });
                },
            });
        });
    });
}

function getCurrentUserAccountID(): number {
    return currentUserAccountID;
}

function getCurrentUserEmail(): string | undefined {
    return currentUserEmail;
}

function navigateToMostRecentReport(currentReport: OnyxEntry<Report>) {
    const lastAccessedReportID = findLastAccessedReport(false, false, undefined, currentReport?.reportID)?.reportID;

    if (lastAccessedReportID) {
        const lastAccessedReportRoute = ROUTES.REPORT_WITH_ID.getRoute(lastAccessedReportID);
        Navigation.goBack(lastAccessedReportRoute);
    } else {
        const isChatThread = isChatThreadReportUtils(currentReport);

        // If it is not a chat thread we should call Navigation.goBack to pop the current route first before navigating to Concierge.
        if (!isChatThread) {
            Navigation.goBack();
        }

        navigateToConciergeChat(false, () => true, {forceReplace: true});
    }
}

function getMostRecentReportID(currentReport: OnyxEntry<Report>) {
    const lastAccessedReportID = findLastAccessedReport(false, false, undefined, currentReport?.reportID)?.reportID;
    return lastAccessedReportID ?? conciergeChatReportID;
}

function joinRoom(report: OnyxEntry<Report>) {
    if (!report) {
        return;
    }
    updateNotificationPreference(
        report.reportID,
        getReportNotificationPreference(report),
        getDefaultNotificationPreferenceForReport(report),
        report.parentReportID,
        report.parentReportActionID,
    );
}

function leaveGroupChat(reportID: string) {
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (!report) {
        Log.warn('Attempting to leave Group Chat that does not existing locally');
        return;
    }

    // Use merge instead of set to avoid deleting the report too quickly, which could cause a brief "not found" page to appear.
    // The remaining parts of the report object will be removed after the API call is successful.
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
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
    // Clean up any quick actions for the report we're leaving from
    if (quickAction?.chatReportID?.toString() === reportID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: null,
        });
    }

    // Ensure that any remaining data is removed upon successful completion, even if the server sends a report removal response.
    // This is done to prevent the removal update from lingering in the applyHTTPSOnyxUpdates function.
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: null,
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: report,
        },
    ];

    navigateToMostRecentReport(report);
    API.write(WRITE_COMMANDS.LEAVE_GROUP_CHAT, {reportID}, {optimisticData, successData, failureData});
}

/** Leave a report by setting the state to submitted and closed */
function leaveRoom(reportID: string, isWorkspaceMemberLeavingWorkspaceRoom = false) {
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

    if (!report) {
        return;
    }
    const isChatThread = isChatThreadReportUtils(report);

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

    const successData: OnyxUpdate[] = [];
    if (isWorkspaceMemberLeavingWorkspaceRoom || isChatThread) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                participants: {
                    [currentUserAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                },
            },
        });
    } else {
        // Use the Onyx.set method to remove all other key values except reportName to prevent showing the room name as random numbers after leaving it.
        // See https://github.com/Expensify/App/issues/55676 for more information.
        successData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {reportName: report.reportName},
        });
    }

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
            value: {
                [report.parentReportActionID]: {
                    childReportNotificationPreference: report?.participants?.[currentUserAccountID]?.notificationPreference ?? getDefaultNotificationPreferenceForReport(report),
                },
            },
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
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const reportMetadata = getReportMetadata(reportID);
    if (!report) {
        return;
    }

    const defaultNotificationPreference = getDefaultNotificationPreferenceForReport(report);

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
    const pendingChatMembers = getPendingChatMembers(inviteeAccountIDs, reportMetadata?.pendingChatMembers ?? [], CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

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
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                pendingChatMembers,
            },
        },
    ];
    optimisticData.push(...newPersonalDetailsOnyxData.optimisticData);

    const successPendingChatMembers = reportMetadata?.pendingChatMembers
        ? reportMetadata?.pendingChatMembers?.filter(
              (pendingMember) => !(inviteeAccountIDs.includes(Number(pendingMember.accountID)) && pendingMember.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
          )
        : null;
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                participants: newParticipantAccountCleanUp,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                pendingChatMembers: successPendingChatMembers,
            },
        },
    ];
    successData.push(...newPersonalDetailsOnyxData.finallyData);

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
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

    if (isGroupChatReportUtils(report)) {
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
    const reportMetadata = getReportMetadata(reportID);
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        participants: {
            [invitedAccountID]: null,
        },
    });
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {
        pendingChatMembers: reportMetadata?.pendingChatMembers?.filter((pendingChatMember) => pendingChatMember.accountID !== invitedAccountID),
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
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const reportMetadata = getReportMetadata(reportID);
    if (!report) {
        return;
    }

    const removeParticipantsData: Record<number, null> = {};
    targetAccountIDs.forEach((accountID) => {
        removeParticipantsData[accountID] = null;
    });
    const pendingChatMembers = getPendingChatMembers(targetAccountIDs, reportMetadata?.pendingChatMembers ?? [], CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                pendingChatMembers,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                pendingChatMembers: reportMetadata?.pendingChatMembers ?? null,
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
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                pendingChatMembers: reportMetadata?.pendingChatMembers ?? null,
            },
        },
    ];

    if (isGroupChatReportUtils(report)) {
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
function flagComment(reportID: string | undefined, reportAction: OnyxEntry<ReportAction>, severity: string) {
    const originalReportID = getOriginalReportID(reportID, reportAction);
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
    if (isAnonymousUser()) {
        return;
    }

    if (!reportID) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingPrivateNotes: true,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingPrivateNotes: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingPrivateNotes: false,
            },
        },
    ];

    const parameters: GetReportPrivateNoteParams = {reportID};

    API.read(READ_COMMANDS.GET_REPORT_PRIVATE_NOTE, parameters, {optimisticData, successData, failureData});
}

function prepareOnboardingOnyxData(
    engagementChoice: OnboardingPurpose,
    data: ValueOf<typeof CONST.ONBOARDING_MESSAGES>,
    adminsChatReportID?: string,
    onboardingPolicyID?: string,
    userReportedIntegration?: OnboardingAccounting,
    wasInvited?: boolean,
) {
    if (engagementChoice === CONST.ONBOARDING_CHOICES.PERSONAL_SPEND) {
        // eslint-disable-next-line no-param-reassign
        data = CONST.CREATE_EXPENSE_ONBOARDING_MESSAGES[CONST.ONBOARDING_CHOICES.PERSONAL_SPEND];
    }

    if (engagementChoice === CONST.ONBOARDING_CHOICES.EMPLOYER || engagementChoice === CONST.ONBOARDING_CHOICES.SUBMIT) {
        // eslint-disable-next-line no-param-reassign
        data = CONST.CREATE_EXPENSE_ONBOARDING_MESSAGES[CONST.ONBOARDING_CHOICES.SUBMIT];
    }

    // Guides are assigned and tasks are posted in the #admins room for the MANAGE_TEAM and TRACK_WORKSPACE onboarding actions, except for emails that have a '+'.
    type PostTasksInAdminsRoomOnboardingChoices = 'newDotManageTeam' | 'newDotTrackWorkspace';
    const shouldPostTasksInAdminsRoom =
        [CONST.ONBOARDING_CHOICES.MANAGE_TEAM, CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE].includes(engagementChoice as PostTasksInAdminsRoomOnboardingChoices) &&
        !currentUserEmail?.includes('+');
    const adminsChatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`];
    const targetChatReport = shouldPostTasksInAdminsRoom
        ? adminsChatReport ?? {reportID: adminsChatReportID, policyID: onboardingPolicyID}
        : getChatByParticipants([CONST.ACCOUNT_ID.CONCIERGE, currentUserAccountID], allReports, false, true);
    const {reportID: targetChatReportID = '', policyID: targetChatPolicyID = ''} = targetChatReport ?? {};

    if (!targetChatReportID) {
        Log.warn('Missing reportID for onboarding optimistic data');
        return;
    }

    const integrationName = userReportedIntegration ? CONST.ONBOARDING_ACCOUNTING_MAPPING[userReportedIntegration] : '';
    const assignedGuideEmail = getPolicy(targetChatPolicyID)?.assignedGuide?.email ?? 'Setup Specialist';
    const assignedGuidePersonalDetail = Object.values(allPersonalDetails ?? {}).find((personalDetail) => personalDetail?.login === assignedGuideEmail);
    let assignedGuideAccountID: number;
    if (assignedGuidePersonalDetail && assignedGuidePersonalDetail.accountID) {
        assignedGuideAccountID = assignedGuidePersonalDetail.accountID;
    } else {
        assignedGuideAccountID = generateAccountID(assignedGuideEmail);
        Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [assignedGuideAccountID]: {
                isOptimisticPersonalDetail: assignedGuideEmail === CONST.SETUP_SPECIALIST_LOGIN,
                login: assignedGuideEmail,
                displayName: assignedGuideEmail,
            },
        });
    }
    const actorAccountID = shouldPostTasksInAdminsRoom ? assignedGuideAccountID : CONST.ACCOUNT_ID.CONCIERGE;

    // Text message
    const textComment = buildOptimisticAddCommentReportAction(data.message, undefined, actorAccountID, 1);
    const textCommentAction: OptimisticAddCommentReportAction = textComment.reportAction;
    const textMessage: AddCommentOrAttachementParams = {
        reportID: targetChatReportID,
        reportActionID: textCommentAction.reportActionID,
        reportComment: textComment.commentText,
    };

    const onboardingTaskParams = {
        integrationName,
        workspaceSettingsLink: `${environmentURL}/${ROUTES.WORKSPACE_INITIAL.getRoute(onboardingPolicyID)}`,
        workspaceCategoriesLink: `${environmentURL}/${ROUTES.WORKSPACE_CATEGORIES.getRoute(onboardingPolicyID)}`,
        workspaceMembersLink: `${environmentURL}/${ROUTES.WORKSPACE_MEMBERS.getRoute(onboardingPolicyID)}`,
        workspaceMoreFeaturesLink: `${environmentURL}/${ROUTES.WORKSPACE_MORE_FEATURES.getRoute(onboardingPolicyID)}`,
        navatticURL: getNavatticURL(environment, engagementChoice),
        workspaceAccountingLink: `${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(onboardingPolicyID)}`,
    };

    let createWorkspaceTaskReportID;
    const tasksData = data.tasks
        .filter((task) => {
            if (['setupCategories', 'setupTags'].includes(task.type) && userReportedIntegration) {
                return false;
            }

            if (['addAccountingIntegration', 'setupCategoriesAndTags'].includes(task.type) && !userReportedIntegration) {
                return false;
            }
            type SkipViewTourOnboardingChoices = 'newDotSubmit' | 'newDotSplitChat' | 'newDotPersonalSpend' | 'newDotEmployer';
            if (
                task.type === 'viewTour' &&
                [
                    CONST.ONBOARDING_CHOICES.EMPLOYER,
                    CONST.ONBOARDING_CHOICES.PERSONAL_SPEND,
                    CONST.ONBOARDING_CHOICES.SUBMIT,
                    CONST.ONBOARDING_CHOICES.CHAT_SPLIT,
                    CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                ].includes(introSelected?.choice as SkipViewTourOnboardingChoices) &&
                engagementChoice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM
            ) {
                return false;
            }
            return true;
        })
        .map((task, index) => {
            const taskDescription = typeof task.description === 'function' ? task.description(onboardingTaskParams) : task.description;
            const taskTitle = typeof task.title === 'function' ? task.title(onboardingTaskParams) : task.title;
            const currentTask = buildOptimisticTaskReport(
                actorAccountID,
                targetChatReportID,
                currentUserAccountID,
                taskTitle,
                taskDescription,
                targetChatPolicyID,
                CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                task.mediaAttributes,
            );
            const emailCreatingAction =
                engagementChoice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM ? allPersonalDetails?.[actorAccountID]?.login ?? CONST.EMAIL.CONCIERGE : CONST.EMAIL.CONCIERGE;
            const taskCreatedAction = buildOptimisticCreatedReportAction(emailCreatingAction);
            const taskReportAction = buildOptimisticTaskCommentReportAction(currentTask.reportID, taskTitle, 0, `task for ${taskTitle}`, targetChatReportID, actorAccountID, index + 3);
            currentTask.parentReportActionID = taskReportAction.reportAction.reportActionID;

            const completedTaskReportAction = task.autoCompleted
                ? buildOptimisticTaskReportAction(currentTask.reportID, CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED, 'marked as complete', actorAccountID, 2)
                : null;
            if (task.type === 'createWorkspace') {
                createWorkspaceTaskReportID = currentTask.reportID;
            }

            return {
                task,
                currentTask,
                taskCreatedAction,
                taskReportAction,
                taskDescription: currentTask.description,
                completedTaskReportAction,
            };
        });

    // Sign-off welcome message
    const welcomeSignOffComment = buildOptimisticAddCommentReportAction(Localize.translateLocal('onboarding.welcomeSignOffTitle'), undefined, actorAccountID, tasksData.length + 3);
    const welcomeSignOffCommentAction: OptimisticAddCommentReportAction = welcomeSignOffComment.reportAction;
    const welcomeSignOffMessage = {
        reportID: targetChatReportID,
        reportActionID: welcomeSignOffCommentAction.reportActionID,
        reportComment: welcomeSignOffComment.commentText,
    };

    const tasksForParameters = tasksData.map<TaskForParameters>(({task, currentTask, taskCreatedAction, taskReportAction, taskDescription, completedTaskReportAction}) => ({
        type: 'task',
        task: task.type,
        taskReportID: currentTask.reportID,
        parentReportID: currentTask.parentReportID,
        parentReportActionID: taskReportAction.reportAction.reportActionID,
        createdTaskReportActionID: taskCreatedAction.reportActionID,
        completedTaskReportActionID: completedTaskReportAction?.reportActionID,
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
                    managerID: currentUserAccountID,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${currentTask.reportID}`,
                value: {
                    isOptimisticReport: true,
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
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${currentTask.reportID}`,
                value: {
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
    const lastVisibleActionCreated = welcomeSignOffCommentAction.created;
    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${targetChatReportID}`,
            value: {
                lastMentionedTime: DateUtils.getDBTime(),
                hasOutstandingChildTask,
                lastVisibleActionCreated,
                lastActorAccountID: actorAccountID,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_INTRO_SELECTED,
            value: {
                choice: engagementChoice,
                createWorkspace: createWorkspaceTaskReportID,
            },
        },
    );

    // If we post tasks in the #admins room and introSelected?.choice does not exist, it means that a guide is assigned and all messages except tasks are handled by the backend
    if (!shouldPostTasksInAdminsRoom || !!introSelected?.choice) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
            value: {
                [textCommentAction.reportActionID]: textCommentAction as ReportAction,
            },
        });
    }

    if (!wasInvited) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_ONBOARDING,
            value: {hasCompletedGuidedSetupFlow: true},
        });
    }

    const successData: OnyxUpdate[] = [...tasksForSuccessData];

    // If we post tasks in the #admins room and introSelected?.choice does not exist, it means that a guide is assigned and all messages except tasks are handled by the backend
    if (!shouldPostTasksInAdminsRoom || !!introSelected?.choice) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
            value: {
                [textCommentAction.reportActionID]: {pendingAction: null},
            },
        });
    }

    let failureReport: Partial<Report> = {
        lastMessageText: '',
        lastVisibleActionCreated: '',
        hasOutstandingChildTask: false,
    };
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${targetChatReportID}`];
    const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report);
    const {lastMessageText = ''} = ReportActionsUtils.getLastVisibleMessage(targetChatReportID, canUserPerformWriteAction);
    if (lastMessageText) {
        const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(targetChatReportID, canUserPerformWriteAction);
        const prevLastVisibleActionCreated = lastVisibleAction?.created;
        const lastActorAccountID = lastVisibleAction?.actorAccountID;
        failureReport = {
            lastMessageText,
            lastVisibleActionCreated: prevLastVisibleActionCreated,
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
            key: ONYXKEYS.NVP_INTRO_SELECTED,
            value: {
                choice: null,
                createWorkspace: null,
            },
        },
    );
    // If we post tasks in the #admins room and introSelected?.choice does not exist, it means that a guide is assigned and all messages except tasks are handled by the backend
    if (!shouldPostTasksInAdminsRoom || !!introSelected?.choice) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
            value: {
                [textCommentAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericAddCommentFailureMessage'),
                } as ReportAction,
            },
        });
    }

    if (!wasInvited) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_ONBOARDING,
            value: {hasCompletedGuidedSetupFlow: onboarding?.hasCompletedGuidedSetupFlow ?? null},
        });
    }

    if (userReportedIntegration) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${onboardingPolicyID}`,
            value: {
                areConnectionsEnabled: true,
                pendingFields: {
                    areConnectionsEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${onboardingPolicyID}`,
            value: {
                pendingFields: {
                    areConnectionsEnabled: null,
                },
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${onboardingPolicyID}`,
            value: {
                areConnectionsEnabled: getPolicy(onboardingPolicyID)?.areConnectionsEnabled,
                pendingFields: {
                    areConnectionsEnabled: null,
                },
            },
        });
    }

    // If we post tasks in the #admins room and introSelected?.choice does not exist, it means that a guide is assigned and all messages except tasks are handled by the backend
    const guidedSetupData: GuidedSetupData = [];

    if (!shouldPostTasksInAdminsRoom || !!introSelected?.choice) {
        guidedSetupData.push({type: 'message', ...textMessage});
    }

    type SelfDMParameters = {
        reportID?: string;
        createdReportActionID?: string;
    };

    let selfDMParameters: SelfDMParameters = {};
    if (engagementChoice === CONST.ONBOARDING_CHOICES.PERSONAL_SPEND) {
        const selfDMReportID = findSelfDMReportID();
        let selfDMReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`];
        let createdAction: ReportAction;
        if (!selfDMReport) {
            const currentTime = DateUtils.getDBTime();
            selfDMReport = buildOptimisticSelfDMReport(currentTime);
            createdAction = buildOptimisticCreatedReportAction(currentUserEmail ?? '', currentTime);
            selfDMParameters = {reportID: selfDMReport.reportID, createdReportActionID: createdAction.reportActionID};
            optimisticData.push(
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`,
                    value: {
                        ...selfDMReport,
                        pendingFields: {
                            createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        },
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`,
                    value: {
                        [createdAction.reportActionID]: createdAction,
                    },
                },
            );

            successData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`,
                    value: {
                        pendingFields: {
                            createChat: null,
                        },
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`,
                    value: {
                        [createdAction.reportActionID]: {
                            pendingAction: null,
                        },
                    },
                },
            );
        }
    }

    guidedSetupData.push(...tasksForParameters);

    if (!introSelected?.choice) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
            value: {
                [welcomeSignOffCommentAction.reportActionID]: welcomeSignOffCommentAction as ReportAction,
            },
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
            value: {
                [welcomeSignOffCommentAction.reportActionID]: {pendingAction: null},
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
            value: {
                [welcomeSignOffCommentAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericAddCommentFailureMessage'),
                } as ReportAction,
            },
        });
        guidedSetupData.push({type: 'message', ...welcomeSignOffMessage});
    }

    return {optimisticData, successData, failureData, guidedSetupData, actorAccountID, selfDMParameters};
}

function completeOnboarding(
    engagementChoice: OnboardingPurpose,
    data: ValueOf<typeof CONST.ONBOARDING_MESSAGES>,
    firstName = '',
    lastName = '',
    adminsChatReportID?: string,
    onboardingPolicyID?: string,
    paymentSelected?: string,
    companySize?: OnboardingCompanySize,
    userReportedIntegration?: OnboardingAccounting,
    wasInvited?: boolean,
) {
    const onboardingData = prepareOnboardingOnyxData(engagementChoice, data, adminsChatReportID, onboardingPolicyID, userReportedIntegration, wasInvited);
    if (!onboardingData) {
        return;
    }

    const {optimisticData, successData, failureData, guidedSetupData, actorAccountID, selfDMParameters} = onboardingData;

    const parameters: CompleteGuidedSetupParams = {
        engagementChoice,
        firstName,
        lastName,
        actorAccountID,
        guidedSetupData: JSON.stringify(guidedSetupData),
        paymentSelected,
        companySize,
        userReportedIntegration,
        policyID: onboardingPolicyID,
        selfDMReportID: selfDMParameters.reportID,
        selfDMCreatedReportActionID: selfDMParameters.createdReportActionID,
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

    const searchForRoomToMentionParams: SearchForRoomsToMentionParams = {query: searchInput, policyID};
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
    if (!isValidReportIDFromPath(reportID)) {
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {lastVisitTime: DateUtils.getDBTime()});
}

function updateLoadingInitialReportAction(reportID: string) {
    if (!isValidReportIDFromPath(reportID)) {
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

function resolveActionableMentionWhisper(
    reportID: string | undefined,
    reportAction: OnyxEntry<ReportAction>,
    resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION>,
) {
    const message = ReportActionsUtils.getReportActionMessage(reportAction);
    if (!message || !reportAction || !reportID) {
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

    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const reportUpdateDataWithPreviousLastMessage = getReportLastMessage(reportID, optimisticReportActions as ReportActions);

    const reportUpdateDataWithCurrentLastMessage = {
        lastMessageText: report?.lastMessageText,
        lastVisibleActionCreated: report?.lastVisibleActionCreated,
        lastActorAccountID: report?.lastActorAccountID,
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
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
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: reportUpdateDataWithPreviousLastMessage,
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
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
    reportId: string | undefined,
    reportAction: OnyxEntry<ReportAction>,
    resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION>,
) {
    if (!reportAction || !reportId) {
        return;
    }

    const optimisticReportActions = {
        [reportAction.reportActionID]: {
            originalMessage: {
                resolution,
            },
        },
    };

    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportId}`];
    const reportUpdateDataWithPreviousLastMessage = getReportLastMessage(reportId, optimisticReportActions as ReportActions);

    const reportUpdateDataWithCurrentLastMessage = {
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

function dismissTrackExpenseActionableWhisper(reportID: string | undefined, reportAction: OnyxEntry<ReportAction>): void {
    const isArrayMessage = Array.isArray(reportAction?.message);
    const message = ReportActionsUtils.getReportActionMessage(reportAction);
    if (!message || !reportAction || !reportID) {
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
    const action = buildOptimisticExportIntegrationAction(connectionName);
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
    const action = buildOptimisticExportIntegrationAction(connectionName, true);
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

function exportReportToCSV({reportID, transactionIDList}: ExportReportCSVParams, onDownloadFailed: () => void) {
    const finalParameters = enhanceParameters(WRITE_COMMANDS.EXPORT_REPORT_TO_CSV, {
        reportID,
        transactionIDList,
    });

    const formData = new FormData();
    Object.entries(finalParameters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            formData.append(key, value.join(','));
        } else {
            formData.append(key, String(value));
        }
    });

    fileDownload(ApiUtils.getCommandURL({command: WRITE_COMMANDS.EXPORT_REPORT_TO_CSV}), 'Expensify.csv', '', false, formData, CONST.NETWORK.METHOD.POST, onDownloadFailed);
}

function exportReportToPDF({reportID}: ExportReportPDFParams) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDFFILENAME}${reportID}`,
            value: null,
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDFFILENAME}${reportID}`,
            value: 'error',
        },
    ];
    const params = {
        reportID,
    } satisfies ExportReportPDFParams;

    API.write(WRITE_COMMANDS.EXPORT_REPORT_TO_PDF, params, {optimisticData, failureData});
}

function downloadReportPDF(fileName: string, reportName: string) {
    const baseURL = addTrailingForwardSlash(getOldDotURLFromEnvironment(environment));
    const downloadFileName = `${reportName}.pdf`;
    setDownload(fileName, true);
    const pdfURL = `${baseURL}secure?secureType=pdfreport&filename=${encodeURIComponent(fileName)}&downloadName=${encodeURIComponent(downloadFileName)}&email=${encodeURIComponent(
        currentUserEmail ?? '',
    )}`;
    fileDownload(addEncryptedAuthTokenToURL(pdfURL, true), downloadFileName, '', Browser.isMobileSafari()).then(() => setDownload(fileName, false));
}

function setDeleteTransactionNavigateBackUrl(url: string) {
    Onyx.set(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL, url);
}

function clearDeleteTransactionNavigateBackUrl() {
    Onyx.merge(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL, null);
}

/**
 * Moves an IOU report to a policy by converting it to an expense report
 * @param reportID - The ID of the IOU report to move
 * @param policyID - The ID of the policy to move the report to
 */
function moveIOUReportToPolicy(reportID: string, policyID: string) {
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const policy = getPolicy(policyID);

    // This flow only works for IOU reports
    if (!policy || !iouReport || !isIOUReportUsingReport(iouReport)) {
        return;
    }
    // We do not want to create negative amount expenses
    if (ReportActionsUtils.hasRequestFromCurrentAccount(iouReport.reportID, iouReport.managerID ?? CONST.DEFAULT_NUMBER_ID)) {
        return;
    }

    // Generate new variables for the policy
    const policyName = policy.name ?? '';
    const iouReportID = iouReport.reportID;
    const employeeAccountID = iouReport.ownerAccountID;
    const expenseChatReportId = getPolicyExpenseChat(employeeAccountID, policyID)?.reportID;

    if (!expenseChatReportId) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [];

    const successData: OnyxUpdate[] = [];

    const failureData: OnyxUpdate[] = [];

    // Next we need to convert the IOU report to Expense report.
    // We need to change:
    // - report type
    // - change the sign of the report total
    // - update its policyID and policyName
    // - update the chatReportID to point to the workspace chat if the policy has policy expense chat enabled
    const expenseReport = {
        ...iouReport,
        chatReportID: policy.isPolicyExpenseChatEnabled ? expenseChatReportId : undefined,
        policyID,
        policyName,
        parentReportID: iouReport.parentReportID,
        type: CONST.REPORT.TYPE.EXPENSE,
        total: -(iouReport?.total ?? 0),
    };
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
        value: expenseReport,
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
        value: iouReport,
    });

    // The expense report transactions need to have the amount reversed to negative values
    const reportTransactions = getReportTransactions(iouReportID);

    // For performance reasons, we are going to compose a merge collection data for transactions
    const transactionsOptimisticData: Record<string, Transaction> = {};
    const transactionFailureData: Record<string, Transaction> = {};
    reportTransactions.forEach((transaction) => {
        transactionsOptimisticData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = {
            ...transaction,
            amount: -transaction.amount,
            modifiedAmount: transaction.modifiedAmount ? -transaction.modifiedAmount : 0,
        };

        transactionFailureData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
    });

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}`,
        value: transactionsOptimisticData,
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}`,
        value: transactionFailureData,
    });

    // We need to move the report preview action from the DM to the workspace chat.
    const parentReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.parentReportID}`];
    const parentReportActionID = iouReport.parentReportActionID;
    const reportPreview = iouReport?.parentReportID && parentReportActionID ? parentReportActions?.[parentReportActionID] : undefined;
    const oldChatReportID = iouReport.chatReportID;

    if (reportPreview?.reportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldChatReportID}`,
            value: {[reportPreview.reportActionID]: null},
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldChatReportID}`,
            value: {[reportPreview.reportActionID]: reportPreview},
        });

        // Add the reportPreview action to workspace chat
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseChatReportId}`,
            value: {[reportPreview.reportActionID]: {...reportPreview, created: DateUtils.getDBTime()}},
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseChatReportId}`,
            value: {[reportPreview.reportActionID]: null},
        });
    }

    // Create the CHANGE_POLICY report action and add it to the expense report which indicates to the user where the report has been moved
    const changePolicyReportAction = buildOptimisticChangePolicyReportAction(iouReport.policyID, policyID, true);
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseChatReportId}`,
        value: {[changePolicyReportAction.reportActionID]: changePolicyReportAction},
    });
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseChatReportId}`,
        value: {
            [changePolicyReportAction.reportActionID]: {
                ...changePolicyReportAction,
                pendingAction: null,
            },
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseChatReportId}`,
        value: {[changePolicyReportAction.reportActionID]: null},
    });

    // To optimistically remove the GBR from the DM we need to update the hasOutstandingChildRequest param to false
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${oldChatReportID}`,
        value: {
            hasOutstandingChildRequest: false,
            iouReportID: null,
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${oldChatReportID}`,
        value: {
            hasOutstandingChildRequest: true,
            iouReportID,
        },
    });

    const parameters: MoveIOUReportToExistingPolicyParams = {
        iouReportID,
        policyID,
        changePolicyReportActionID: changePolicyReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.MOVE_IOU_REPORT_TO_EXISTING_POLICY, parameters, {optimisticData, successData, failureData});
}

/**
 * Dismisses the change report policy educational modal so that it doesn't show up again.
 */
function dismissChangePolicyModal() {
    const date = new Date();
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING,
            value: {
                [CONST.CHANGE_POLICY_TRAINING_MODAL]: DateUtils.getDBTime(date.valueOf()),
            },
        },
    ];
    API.write(WRITE_COMMANDS.DISMISS_PRODUCT_TRAINING, {name: CONST.CHANGE_POLICY_TRAINING_MODAL}, {optimisticData});
}

/**
 * @private
 * Builds a map of parentReportID to child report IDs for efficient traversal.
 */
function buildReportIDToThreadsReportIDsMap(): Record<string, string[]> {
    const reportIDToThreadsReportIDsMap: Record<string, string[]> = {};
    Object.values(allReports ?? {}).forEach((report) => {
        if (!report?.parentReportID) {
            return;
        }
        if (!reportIDToThreadsReportIDsMap[report.parentReportID]) {
            reportIDToThreadsReportIDsMap[report.parentReportID] = [];
        }
        reportIDToThreadsReportIDsMap[report.parentReportID].push(report.reportID);
    });
    return reportIDToThreadsReportIDsMap;
}

/**
 * @private
 * Recursively updates the policyID for a report and all its child reports.
 */
function updatePolicyIdForReportAndThreads(
    currentReportID: string,
    policyID: string,
    reportIDToThreadsReportIDsMap: Record<string, string[]>,
    optimisticData: OnyxUpdate[],
    failureData: OnyxUpdate[],
) {
    const currentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${currentReportID}`];
    const originalPolicyID = currentReport?.policyID;

    if (originalPolicyID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${currentReportID}`,
            value: {policyID},
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${currentReportID}`,
            value: {policyID: originalPolicyID},
        });
    }

    // Recursively process child reports for the current report
    const childReportIDs = reportIDToThreadsReportIDsMap[currentReportID] || [];
    childReportIDs.forEach((childReportID) => {
        updatePolicyIdForReportAndThreads(childReportID, policyID, reportIDToThreadsReportIDsMap, optimisticData, failureData);
    });
}

/**
 * Changes the policy of a report and all its child reports, and moves the report to the new policy's workspace chat.
 */
function changeReportPolicy(reportID: string, policyID: string) {
    if (!reportID || !policyID) {
        return;
    }
    const reportToMove = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (!reportToMove || reportToMove?.policyID === policyID || !isExpenseReport(reportToMove)) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    // 1. Optimistically set the policyID on the report (and all its threads)

    // Preprocess reports to create a map of parentReportID to child reports list of reportIDs
    const reportIDToThreadsReportIDsMap = buildReportIDToThreadsReportIDsMap();

    // Recursively update the policyID of the report and all its child reports
    updatePolicyIdForReportAndThreads(reportID, policyID, reportIDToThreadsReportIDsMap, optimisticData, failureData);

    // 2. If the old workspace had a workspace chat, mark the report preview action as deleted
    if (reportToMove?.parentReportID && reportToMove?.parentReportActionID) {
        const workspaceChatReportID = reportToMove.parentReportID;
        const reportPreviewActionID = reportToMove.parentReportActionID;
        const oldReportPreviewAction = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChatReportID}`]?.[reportPreviewActionID];
        const deletedTime = DateUtils.getDBTime();
        const firstMessage = Array.isArray(oldReportPreviewAction?.message) ? oldReportPreviewAction.message.at(0) : null;
        const updatedReportPreviewAction = {
            ...oldReportPreviewAction,
            originalMessage: {
                deleted: deletedTime,
            },
            ...(firstMessage && {
                message: [
                    {
                        ...firstMessage,
                        deleted: deletedTime,
                    },
                    ...(Array.isArray(oldReportPreviewAction?.message) ? oldReportPreviewAction.message.slice(1) : []),
                ],
            }),
            ...(!Array.isArray(oldReportPreviewAction?.message) && {
                message: {
                    deleted: deletedTime,
                },
            }),
        };

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChatReportID}`,
            value: {[reportPreviewActionID]: updatedReportPreviewAction},
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChatReportID}`,
            value: {[reportPreviewActionID]: oldReportPreviewAction},
        });

        // Update the workspace chat report
        const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${workspaceChatReportID}`];
        const lastMessageText = getLastVisibleMessage(workspaceChatReportID, {[reportPreviewActionID]: updatedReportPreviewAction as ReportAction})?.lastMessageText;
        const lastVisibleActionCreated = getReportLastMessage(workspaceChatReportID, {[reportPreviewActionID]: updatedReportPreviewAction as ReportAction})?.lastVisibleActionCreated;

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${workspaceChatReportID}`,
            value: {
                hasOutstandingChildRequest: false,
                iouReportID: null,
                lastMessageText,
                lastVisibleActionCreated,
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${workspaceChatReportID}`,
            value: chatReport,
        });
    }

    // 3. Optimistically create a new REPORTPREVIEW reportAction with the newReportPreviewActionID
    // and set it as a parent of the moved report
    const policyExpenseChat = getPolicyExpenseChat(currentUserAccountID, policyID);
    const optimisticReportPreviewAction = buildOptimisticReportPreview(policyExpenseChat, reportToMove);

    if (policyExpenseChat) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyExpenseChat.reportID}`,
            value: {[optimisticReportPreviewAction.reportActionID]: optimisticReportPreviewAction},
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyExpenseChat.reportID}`,
            value: {
                [optimisticReportPreviewAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyExpenseChat.reportID}`,
            value: {[optimisticReportPreviewAction.reportActionID]: null},
        });

        // Set the new report preview action as a parent of the moved report,
        // and set the parentReportID on the moved report as the workspace chat reportID
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {parentReportActionID: optimisticReportPreviewAction.reportActionID, parentReportID: policyExpenseChat.reportID},
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {parentReportActionID: reportToMove.parentReportActionID, parentReportID: reportToMove.parentReportID},
        });

        // Set lastVisibleActionCreated
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`,
            value: {lastVisibleActionCreated: optimisticReportPreviewAction?.created},
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`,
            value: {lastVisibleActionCreated: policyExpenseChat.lastVisibleActionCreated},
        });
    }

    // 4. Optimistically create a CHANGEPOLICY reportAction on the report using the reportActionID
    const optimisticMovedReportAction = buildOptimisticChangePolicyReportAction(reportToMove.policyID, policyID);
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportToMove.reportID}`,
        value: {[optimisticMovedReportAction.reportActionID]: optimisticMovedReportAction},
    });
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportToMove.reportID}`,
        value: {
            [optimisticMovedReportAction.reportActionID]: {
                pendingAction: null,
                errors: null,
            },
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportToMove.reportID}`,
        value: {
            [optimisticMovedReportAction.reportActionID]: {
                errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
    });

    // Call the ChangeReportPolicy API endpoint
    const params = {
        reportID: reportToMove.reportID,
        policyID,
        reportPreviewReportActionID: optimisticReportPreviewAction.reportActionID,
        changePolicyReportActionID: optimisticMovedReportAction.reportActionID,
    };
    API.write(WRITE_COMMANDS.CHANGE_REPORT_POLICY, params, {optimisticData, successData, failureData});

    // 5. If the dismissedProductTraining.changeReportModal is not set,
    // navigate to CHANGE_POLICY_EDUCATIONAL and a backTo param for the report page.
    if (!nvpDismissedProductTraining?.[CONST.CHANGE_POLICY_TRAINING_MODAL]) {
        Navigation.navigate(ROUTES.CHANGE_POLICY_EDUCATIONAL.getRoute(ROUTES.REPORT_WITH_ID.getRoute(reportToMove.reportID)));
    }
}

export type {Video};

export {
    addAttachment,
    addComment,
    addPolicyReport,
    broadcastUserIsLeavingRoom,
    broadcastUserIsTyping,
    clearAddRoomMemberError,
    clearAvatarErrors,
    clearDeleteTransactionNavigateBackUrl,
    clearGroupChat,
    clearIOUError,
    clearNewRoomFormError,
    clearPolicyRoomNameErrors,
    clearPrivateNotesError,
    clearReportFieldKeyErrors,
    completeOnboarding,
    createNewReport,
    deleteReport,
    deleteReportActionDraft,
    deleteReportComment,
    deleteReportField,
    dismissTrackExpenseActionableWhisper,
    downloadReportPDF,
    editReportComment,
    expandURLPreview,
    exportReportToCSV,
    exportReportToPDF,
    exportToIntegration,
    flagComment,
    getCurrentUserAccountID,
    getCurrentUserEmail,
    getDraftPrivateNote,
    getMostRecentReportID,
    getNewerActions,
    getOlderActions,
    getReportPrivateNote,
    handleReportChanged,
    handleUserDeletedLinksInHtml,
    hasErrorInPrivateNotes,
    inviteToGroupChat,
    inviteToRoom,
    joinRoom,
    leaveGroupChat,
    leaveRoom,
    markAsManuallyExported,
    markCommentAsUnread,
    navigateToAndOpenChildReport,
    navigateToAndOpenReport,
    navigateToAndOpenReportWithAccountIDs,
    navigateToConciergeChat,
    navigateToConciergeChatAndDeleteReport,
    notifyNewAction,
    openLastOpenedPublicRoom,
    openReport,
    openReportFromDeepLink,
    openRoomMembersPage,
    readNewestAction,
    removeFromGroupChat,
    removeFromRoom,
    resolveActionableMentionWhisper,
    resolveActionableReportMentionWhisper,
    savePrivateNotesDraft,
    saveReportActionDraft,
    saveReportDraftComment,
    searchInServer,
    setDeleteTransactionNavigateBackUrl,
    setGroupDraft,
    setIsComposerFullSize,
    setLastOpenedPublicRoom,
    shouldShowReportActionNotification,
    showReportActionNotification,
    startNewChat,
    subscribeToNewActionEvent,
    subscribeToReportLeavingEvents,
    subscribeToReportTypingEvents,
    toggleEmojiReaction,
    togglePinnedState,
    toggleSubscribeToChildReport,
    unsubscribeFromLeavingRoomReportChannel,
    unsubscribeFromReportChannel,
    updateDescription,
    updateGroupChatAvatar,
    updateGroupChatMemberRoles,
    updateChatName,
    updateLastVisitTime,
    updateLoadingInitialReportAction,
    updateNotificationPreference,
    updatePolicyRoomName,
    updatePrivateNotes,
    updateReportField,
    updateReportName,
    updateRoomVisibility,
    updateWriteCapability,
    getOptimisticChatReport,
    saveReportDraft,
    prepareOnboardingOnyxData,
    moveIOUReportToPolicy,
    dismissChangePolicyModal,
    changeReportPolicy,
};
