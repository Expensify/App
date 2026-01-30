/* eslint-disable max-lines */
import {format as timezoneFormat, toZonedTime} from 'date-fns-tz';
import {Str} from 'expensify-common';
import isEmpty from 'lodash/isEmpty';
import {DeviceEventEmitter, InteractionManager, Linking} from 'react-native';
import type {NullishDeep, OnyxCollection, OnyxCollectionInputValue, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {PartialDeep, ValueOf} from 'type-fest';
import type {Emoji} from '@assets/emojis/types';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import * as ActiveClientManager from '@libs/ActiveClientManager';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {waitForWrites} from '@libs/API';
import * as API from '@libs/API';
import type {
    AddCommentOrAttachmentParams,
    AddEmojiReactionParams,
    AddWorkspaceRoomParams,
    CompleteGuidedSetupParams,
    DeleteAppReportParams,
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
    MarkAllMessagesAsReadParams,
    MarkAsExportedParams,
    MarkAsUnreadParams,
    MoveIOUReportToExistingPolicyParams,
    MoveIOUReportToPolicyAndInviteSubmitterParams,
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
    TransactionThreadInfo,
    UpdateChatNameParams,
    UpdateCommentParams,
    UpdateGroupChatAvatarParams,
    UpdateGroupChatMemberRolesParams,
    UpdatePolicyRoomNameParams,
    UpdateReportNotificationPreferenceParams,
    UpdateReportPrivateNoteParams,
    UpdateReportWriteCapabilityParams,
    UpdateRoomAvatarParams,
    UpdateRoomDescriptionParams,
} from '@libs/API/parameters';
import type ExportReportCSVParams from '@libs/API/parameters/ExportReportCSVParams';
import type UpdateRoomVisibilityParams from '@libs/API/parameters/UpdateRoomVisibilityParams';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ApiUtils from '@libs/ApiUtils';
import * as Browser from '@libs/Browser';
import * as CollectionUtils from '@libs/CollectionUtils';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import DateUtils from '@libs/DateUtils';
import * as EmojiUtils from '@libs/EmojiUtils';
import * as Environment from '@libs/Environment/Environment';
import {getOldDotURLFromEnvironment} from '@libs/Environment/Environment';
import getEnvironment from '@libs/Environment/getEnvironment';
import type EnvironmentType from '@libs/Environment/getEnvironment/types';
import {getMicroSecondOnyxErrorWithTranslationKey, getMicroSecondTranslationErrorWithTranslationKey} from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import HttpUtils from '@libs/HttpUtils';
import Log from '@libs/Log';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import {getMovedReportID} from '@libs/ModifiedExpenseMessage';
import type {LinkToOptions} from '@libs/Navigation/helpers/linkTo/types';
import Navigation from '@libs/Navigation/Navigation';
import enhanceParameters from '@libs/Network/enhanceParameters';
import * as NetworkStore from '@libs/Network/NetworkStore';
import NetworkConnection from '@libs/NetworkConnection';
import {buildNextStepNew, buildOptimisticNextStep} from '@libs/NextStepUtils';
import LocalNotification from '@libs/Notification/LocalNotification';
import {rand64} from '@libs/NumberUtils';
import capturePageHTML from '@libs/PageHTMLCapture';
import Parser from '@libs/Parser';
import {getParsedMessageWithShortMentions} from '@libs/ParsingUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PhoneNumber from '@libs/PhoneNumber';
import {
    getDefaultApprover,
    getMemberAccountIDsForWorkspace,
    isInstantSubmitEnabled,
    isPaidGroupPolicy,
    isPolicyAdmin as isPolicyAdminPolicyUtils,
    isPolicyMember,
    isSubmitAndClose,
} from '@libs/PolicyUtils';
import processReportIDDeeplink from '@libs/processReportIDDeeplink';
import Pusher from '@libs/Pusher';
import type {UserIsLeavingRoomEvent, UserIsTypingEvent} from '@libs/Pusher/types';
import * as ReportActionsFollowupUtils from '@libs/ReportActionFollowupUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import {updateTitleFieldToMatchPolicy} from '@libs/ReportTitleUtils';
import type {Ancestor, OptimisticAddCommentReportAction, OptimisticChatReport, SelfDMParameters} from '@libs/ReportUtils';
import {
    buildOptimisticAddCommentReportAction,
    buildOptimisticChangeFieldAction,
    buildOptimisticChangePolicyReportAction,
    buildOptimisticChatReport,
    buildOptimisticCreatedReportAction,
    buildOptimisticEmptyReport,
    buildOptimisticExportIntegrationAction,
    buildOptimisticGroupChatReport,
    buildOptimisticIOUReportAction,
    buildOptimisticMovedReportAction,
    buildOptimisticRenamedRoomReportAction,
    buildOptimisticReportPreview,
    buildOptimisticRoomAvatarUpdatedReportAction,
    buildOptimisticRoomDescriptionUpdatedReportAction,
    buildOptimisticSelfDMReport,
    buildOptimisticUnHoldReportAction,
    buildOptimisticUnreportedTransactionAction,
    buildTransactionThread,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    findLastAccessedReport,
    findSelfDMReportID,
    formatReportLastMessageText,
    generateReportID,
    getChatByParticipants,
    getChildReportNotificationPreference,
    getDefaultNotificationPreferenceForReport,
    getFieldViolation,
    getLastVisibleMessage,
    getNextApproverAccountID,
    getOptimisticDataForAncestors,
    getOriginalReportID,
    getOutstandingChildRequest,
    getParsedComment,
    getPendingChatMembers,
    getPolicyExpenseChat,
    getReportFieldKey,
    getReportFieldsByPolicyID,
    getReportLastMessage,
    getReportLastVisibleActionCreated,
    getReportMetadata,
    getReportNotificationPreference,
    getReportOrDraftReport,
    getReportPreviewMessage,
    getReportTransactions,
    getReportViolations,
    getTitleReportField,
    hasOutstandingChildRequest,
    isAdminRoom,
    isChatThread as isChatThreadReportUtils,
    isConciergeChatReport,
    isCurrentUserSubmitter,
    isExpenseReport,
    isGroupChat as isGroupChatReportUtils,
    isHiddenForCurrentUser,
    isIOUReportUsingReport,
    isOpenExpenseReport,
    isProcessingReport,
    isReportManuallyReimbursed,
    isSelfDM,
    isUnread,
    isValidReportIDFromPath,
    prepareOnboardingOnyxData,
} from '@libs/ReportUtils';
import {getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {getAmount, getCurrency, hasValidModifiedAmount, isOnHold, shouldClearConvertedAmount} from '@libs/TransactionUtils';
import addTrailingForwardSlash from '@libs/UrlUtils';
import Visibility from '@libs/Visibility';
import {clearByKey} from '@userActions/CachedPDFPaths';
import {setDownload} from '@userActions/Download';
import {close} from '@userActions/Modal';
import navigateFromNotification from '@userActions/navigateFromNotification';
import {getAll} from '@userActions/PersistedRequests';
import {buildAddMembersToWorkspaceOnyxData, buildRoomMembersOnyxData} from '@userActions/Policy/Member';
import {createPolicyExpenseChats} from '@userActions/Policy/Policy';
import {
    createUpdateCommentMatcher,
    resolveCommentDeletionConflicts,
    resolveDuplicationConflictAction,
    resolveEditCommentWithNewAddCommentRequest,
    resolveOpenReportDuplicationConflictAction,
} from '@userActions/RequestConflictUtils';
import {isAnonymousUser} from '@userActions/Session';
import {onServerDataReady} from '@userActions/Welcome';
import {getOnboardingMessages} from '@userActions/Welcome/OnboardingFlow';
import type {OnboardingCompanySize, OnboardingMessage} from '@userActions/Welcome/OnboardingFlow';
import CONFIG from '@src/CONFIG';
import type {OnboardingAccounting} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NewRoomForm';
import type {
    BankAccountList,
    IntroSelected,
    InvitedEmailsToAccountIDs,
    NewGroupChatDraft,
    Onboarding,
    OnboardingPurpose,
    PersonalDetailsList,
    Policy,
    PolicyEmployee,
    PolicyEmployeeList,
    PolicyReportField,
    RecentlyUsedReportFields,
    Report,
    ReportAction,
    ReportActionReactions,
    ReportNextStepDeprecated,
    ReportUserIsTyping,
    Transaction,
    TransactionViolations,
} from '@src/types/onyx';
import type {Decision} from '@src/types/onyx/OriginalMessage';
import type {CurrentUserPersonalDetails, Timezone} from '@src/types/onyx/PersonalDetails';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type {NotificationPreference, Participants, Participant as ReportParticipant, RoomVisibility, WriteCapability} from '@src/types/onyx/Report';
import type {Message, ReportActions} from '@src/types/onyx/ReportAction';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {Dimensions} from '@src/types/utils/Layout';

type SubscriberCallback = (isFromCurrentUser: boolean, reportAction: ReportAction | undefined) => void;

type ActionSubscriber = {
    reportID: string;
    callback: SubscriberCallback;
};

type Video = Dimensions & {
    url: string;
    thumbnailUrl: string;
    duration: number;
};

type TaskMessage = Required<Pick<AddCommentOrAttachmentParams, 'reportID' | 'reportActionID' | 'reportComment'>>;

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
    | ({type: 'message'} & AddCommentOrAttachmentParams)
    | TaskForParameters
    | ({
          type: 'video';
      } & Video &
          AddCommentOrAttachmentParams)
>;

type ReportError = {
    type?: string;
};

const addNewMessageWithText = new Set<string>([WRITE_COMMANDS.ADD_COMMENT, WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT]);
let conciergeReportIDOnyxConnect: string | undefined;
let deprecatedCurrentUserAccountID = -1;
/** @deprecated This value is deprecated and will be removed soon after migration. Use the email from useCurrentUserPersonalDetails hook instead. */
let deprecatedCurrentUserLogin: string | undefined;

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        // When signed out, val is undefined
        if (!value?.accountID) {
            conciergeReportIDOnyxConnect = undefined;
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        deprecatedCurrentUserLogin = value.email;
        deprecatedCurrentUserAccountID = value.accountID;
    },
});

Onyx.connect({
    key: ONYXKEYS.CONCIERGE_REPORT_ID,
    callback: (value) => (conciergeReportIDOnyxConnect = value),
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

let allPersonalDetails: OnyxEntry<PersonalDetailsList> = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        allPersonalDetails = value ?? {};
    },
});

const typingWatchTimers: Record<string, NodeJS.Timeout> = {};

let reportIDDeeplinkedFromOldDot: string | undefined;
Linking.getInitialURL().then((url) => {
    reportIDDeeplinkedFromOldDot = processReportIDDeeplink(url ?? '');
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

let environment: EnvironmentType;
getEnvironment().then((env) => {
    environment = env;
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

function openUnreportedExpense(reportID: string | undefined, backToReport?: string) {
    if (!reportID) {
        return;
    }
    Navigation.navigate(ROUTES.ADD_UNREPORTED_EXPENSE.getRoute(reportID, backToReport));
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
function subscribeToReportTypingEvents(reportID: string, currentUserAccountID: number) {
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

        // Regular user typing indicators: time out after 1.5s of inactivity.
        // Concierge (AgentZero-initiated): use a longer 10s timeout. AgentZero sends a single typing event for Concierge, not a stream, so client holds the indicator longer.
        const isCurrentlyTyping = normalizedTypingStatus[accountIDOrLogin];
        if (isCurrentlyTyping) {
            // While the accountIDOrLogin could be 'Concierge' from OldDot, we only want the longer timeout for events queued from AgentZero (which will only send the accountID)
            const isConciergeUser = Number(accountIDOrLogin) === CONST.ACCOUNT_ID.CONCIERGE;
            const timeoutDuration = isConciergeUser ? 10000 : 1500;
            typingWatchTimers[reportUserIdentifier] = setTimeout(() => {
                const typingStoppedStatus: ReportUserIsTyping = {};
                typingStoppedStatus[accountIDOrLogin] = false;
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, typingStoppedStatus);
                delete typingWatchTimers[reportUserIdentifier];
            }, timeoutDuration);
        }
    }).catch((error: ReportError) => {
        Log.hmmm('[Report] Failed to initially subscribe to Pusher channel', {errorType: error.type, pusherChannelName});
    });
}

/** Initialize our pusher subscriptions to listen for someone leaving a room. */
function subscribeToReportLeavingEvents(reportID: string | undefined, currentUserAccountID: number) {
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
function notifyNewAction(reportID: string | undefined, accountID: number | undefined, reportAction?: ReportAction | undefined) {
    const actionSubscriber = newActionSubscribers.find((subscriber) => subscriber.reportID === reportID);
    if (!actionSubscriber) {
        return;
    }
    const isFromCurrentUser = accountID === deprecatedCurrentUserAccountID;
    actionSubscriber.callback(isFromCurrentUser, reportAction);
}

/**
 * Builds an optimistic report action with resolved followups (followup-list marked as selected).
 * @param reportAction - The report action to check and potentially resolve
 * @returns Null if the action doesn't have unresolved followups or the updated report action with resolved followups.
 */
function buildOptimisticResolvedFollowups(reportAction: OnyxEntry<ReportAction>): ReportAction | null {
    if (!reportAction) {
        return null;
    }

    const message = ReportActionsUtils.getReportActionMessage(reportAction);
    if (!message) {
        return null;
    }
    const html = message?.html ?? '';
    const followups = ReportActionsFollowupUtils.parseFollowupsFromHtml(html);

    if (!followups || followups.length === 0) {
        return null;
    }

    // Mark followup-list as selected after a comment has been posted below the follow up list comment
    const updatedHtml = html.replace(/<followup-list(\s[^>]*)?>/, '<followup-list selected>');
    return {
        ...reportAction,
        message: [
            {
                ...message,
                html: updatedHtml,
            },
        ],
    };
}

/**
 * Add up to two report actions to a report. This method can be called for the following situations:
 *
 * - Adding one comment
 * - Adding one attachment
 * - Add both a comment and attachment simultaneously
 *
 * @param report - The report where the comment should be added
 * @param notifyReportID - The report ID we should notify for new actions. This is usually the same as reportID, except when adding a comment to an expense report with a single transaction thread, in which case we want to notify the parent expense report.
 * @param isInSidePanel - Whether the comment is being added from the side panel
 */
function addActions(report: OnyxEntry<Report>, notifyReportID: string, ancestors: Ancestor[], timezoneParam: Timezone, text = '', file?: FileObject, isInSidePanel = false) {
    if (!report?.reportID) {
        return;
    }
    const reportID = report.reportID;
    let reportCommentText = '';
    let reportCommentAction: OptimisticAddCommentReportAction | undefined;
    let attachmentAction: OptimisticAddCommentReportAction | undefined;
    let commandName: typeof WRITE_COMMANDS.ADD_COMMENT | typeof WRITE_COMMANDS.ADD_ATTACHMENT | typeof WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT = WRITE_COMMANDS.ADD_COMMENT;

    if (text && !file) {
        const reportComment = buildOptimisticAddCommentReportAction(text, undefined, undefined, undefined, reportID);
        reportCommentAction = reportComment.reportAction;
        reportCommentText = reportComment.commentText;
    }

    if (file) {
        // When we are adding an attachment we will call AddAttachment.
        // It supports sending an attachment with an optional comment and AddComment supports adding a single text comment only.
        commandName = WRITE_COMMANDS.ADD_ATTACHMENT;
        const attachment = buildOptimisticAddCommentReportAction(text, file, undefined, undefined, reportID);
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
    const currentTime = NetworkConnection.getDBTimeWithSkew();
    const lastComment = ReportActionsUtils.getReportActionMessage(lastAction);
    const lastCommentText = formatReportLastMessageText(lastComment?.text ?? '');

    const optimisticReport: Partial<Report> = {
        lastVisibleActionCreated: lastAction?.created,
        lastMessageText: lastCommentText,
        lastMessageHtml: lastCommentText,
        lastActorAccountID: deprecatedCurrentUserAccountID,
        lastReadTime: currentTime,
    };

    const shouldUpdateNotificationPreference = !isEmptyObject(report) && isHiddenForCurrentUser(report);
    if (shouldUpdateNotificationPreference) {
        optimisticReport.participants = {
            [deprecatedCurrentUserAccountID]: {notificationPreference: getDefaultNotificationPreferenceForReport(report)},
        };
    }

    // Optimistically add the new actions to the store before waiting to save them to the server
    const optimisticReportActions: OnyxCollection<OptimisticAddCommentReportAction | ReportAction> = {};

    // Only add the reportCommentAction when there is no file attachment. If there is both a file attachment and text, that will all be contained in the attachmentAction.
    if (text && reportCommentAction?.reportActionID && !file) {
        optimisticReportActions[reportCommentAction.reportActionID] = reportCommentAction;
    }
    if (file && attachmentAction?.reportActionID) {
        optimisticReportActions[attachmentAction.reportActionID] = attachmentAction;
    }

    // Check if the last visible action is from Concierge with unresolved followups
    // If so, optimistically resolve them by adding the updated action to optimisticReportActions
    const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(reportID);
    const lastActorAccountID = lastVisibleAction?.actorAccountID;
    const lastActionReportActionID = lastVisibleAction?.reportActionID;
    const resolvedAction = buildOptimisticResolvedFollowups(lastVisibleAction);
    if (lastActorAccountID === CONST.ACCOUNT_ID.CONCIERGE && lastActionReportActionID && resolvedAction) {
        optimisticReportActions[lastActionReportActionID] = resolvedAction;
    }

    const parameters: AddCommentOrAttachmentParams = {
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

    if (isInSidePanel && (isConciergeChatReport(report) || isAdminRoom(report))) {
        const pageHTML = capturePageHTML();
        if (pageHTML) {
            parameters.pageHTML = pageHTML;
        }
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.PERSONAL_DETAILS_LIST>> = [
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

    optimisticData.push(...getOptimisticDataForAncestors(ancestors, currentTime, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD));

    const successReportActions: OnyxCollection<NullishDeep<ReportAction>> = {};

    for (const [actionKey] of Object.entries(optimisticReportActions)) {
        successReportActions[actionKey] = {pendingAction: null, isOptimisticAction: null};
    }

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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
        const lastVisibleActionCreated = lastVisibleAction?.created;
        failureReport = {
            lastMessageText,
            lastVisibleActionCreated,
            lastActorAccountID,
        };
    }

    const failureReportActions: Record<string, OptimisticAddCommentReportAction | ReportAction> = {};

    for (const [actionKey, action] of Object.entries(optimisticReportActions)) {
        failureReportActions[actionKey] = {
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            ...(action as OptimisticAddCommentReportAction),
            errors: getMicroSecondOnyxErrorWithTranslationKey('report.genericAddCommentFailureMessage'),
        };
    }
    // In case of error bring back the follow up buttons to the cast comment
    if (lastActorAccountID === CONST.ACCOUNT_ID.CONCIERGE && lastActionReportActionID) {
        failureReportActions[lastActionReportActionID] = lastVisibleAction;
    }

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    // Update the timezone if it's been 5 minutes from the last time the user added a comment
    if (DateUtils.canUpdateTimezone() && deprecatedCurrentUserAccountID) {
        const timezone = DateUtils.getCurrentTimezone(timezoneParam);
        parameters.timezone = JSON.stringify(timezone);
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {[deprecatedCurrentUserAccountID]: {timezone}},
        });
        DateUtils.setTimezoneUpdated();
    }

    API.write(commandName, parameters, {
        optimisticData,
        successData,
        failureData,
    });
    notifyNewAction(notifyReportID, lastAction?.actorAccountID, lastAction);
}

/** Add an attachment with an optional comment to a report */
function addAttachmentWithComment(
    report: OnyxEntry<Report>,
    notifyReportID: string,
    ancestors: Ancestor[],
    attachments: FileObject | FileObject[],
    text = '',
    timezone: Timezone = CONST.DEFAULT_TIME_ZONE,
    shouldPlaySound = false,
    isInSidePanel = false,
) {
    if (!report?.reportID) {
        return;
    }

    const handlePlaySound = () => {
        if (!shouldPlaySound) {
            return;
        }
        playSound(SOUNDS.DONE);
    };

    // Single attachment
    if (!Array.isArray(attachments)) {
        addActions(report, notifyReportID, ancestors, timezone, text, attachments, isInSidePanel);
        handlePlaySound();
        return;
    }

    // Multiple attachments - first: combine text + first attachment as a single action
    addActions(report, notifyReportID, ancestors, timezone, text, attachments?.at(0), isInSidePanel);

    // Remaining: attachment-only actions (no text duplication)
    for (let i = 1; i < attachments?.length; i += 1) {
        addActions(report, notifyReportID, ancestors, timezone, '', attachments?.at(i), isInSidePanel);
    }

    // Play sound once
    handlePlaySound();
}

/** Add a single comment to a report */
function addComment(report: OnyxEntry<Report>, notifyReportID: string, ancestors: Ancestor[], text: string, timezoneParam: Timezone, shouldPlaySound?: boolean, isInSidePanel?: boolean) {
    if (shouldPlaySound) {
        playSound(SOUNDS.DONE);
    }
    addActions(report, notifyReportID, ancestors, timezoneParam, text, undefined, isInSidePanel);
}

function reportActionsExist(reportID: string): boolean {
    return allReportActions?.[reportID] !== undefined;
}

function updateChatName(reportID: string, oldReportName: string | undefined, reportName: string, type: typeof CONST.REPORT.CHAT_TYPE.GROUP | typeof CONST.REPORT.CHAT_TYPE.TRIP_ROOM) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                reportName: oldReportName ?? null,
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

/**
 * Helper function to build optimistic, success, and failure Onyx updates
 * when updating or removing a report's avatar.
 *
 * @param reportID - The report ID of the policy room.
 * @param oldAvatarUrl - The existing avatar URL before the update.
 * @param [file] - (Optional) The selected image file to update the avatar with.
 * If not provided, the existing avatar will be removed.
 */
function buildUpdateReportAvatarOnyxData(reportID: string, oldAvatarUrl: string | undefined, file?: File | CustomRNImageManipulatorResult) {
    // If we have no file that means we are removing the avatar.
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                avatarUrl: file ? (file?.uri ?? '') : null,
                pendingFields: {
                    avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    avatar: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                avatarUrl: oldAvatarUrl ?? null,
                pendingFields: {
                    avatar: null,
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    return {optimisticData, successData, failureData};
}

/**
 * Updates the avatar for a group chat.
 */
function updateGroupChatAvatar(reportID: string, oldAvatarUrl: string | undefined, file?: File | CustomRNImageManipulatorResult) {
    const {optimisticData, successData, failureData} = buildUpdateReportAvatarOnyxData(reportID, oldAvatarUrl, file);
    const parameters: UpdateGroupChatAvatarParams = {file, reportID};
    API.write(WRITE_COMMANDS.UPDATE_GROUP_CHAT_AVATAR, parameters, {optimisticData, failureData, successData});
}

/**
 * Updates the avatar for a policy room.
 */
function updatePolicyRoomAvatar(reportID: string, currentUserAccountID: number, oldAvatarUrl: string | undefined, file?: File | CustomRNImageManipulatorResult) {
    const avatarURL = file?.uri ?? '';
    const {optimisticData, successData, failureData} = buildUpdateReportAvatarOnyxData(reportID, oldAvatarUrl, file);

    const optimisticAction = buildOptimisticRoomAvatarUpdatedReportAction(avatarURL);
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        value: {[optimisticAction.reportActionID]: optimisticAction},
    });

    // Update the report with last action details
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        value: {
            lastActorAccountID: currentUserAccountID,
            lastVisibleActionCreated: optimisticAction.created,
            lastMessageText: (optimisticAction.message as Message[]).at(0)?.text,
        },
    });

    // Add success data to clear pending action
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        value: {
            [optimisticAction.reportActionID]: {pendingAction: null},
        },
    });

    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        value: {
            [optimisticAction.reportActionID]: {
                pendingAction: null,
            },
        },
    });

    const parameters: UpdateRoomAvatarParams = {reportID, file, reportActionID: optimisticAction.reportActionID};
    API.write(WRITE_COMMANDS.UPDATE_ROOM_AVATAR, parameters, {optimisticData, failureData, successData});
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
 * @param avatar The avatar file to upload for a new group chat
 * @param isNewThread Whether this is a new thread being created
 * @param transaction The transaction object for legacy transactions that don't have a transaction thread or money request preview yet
 * @param transactionViolations The violations for the transaction, if any
 * @param parentReportID The parent report ID for the transaction thread (optional, defaults to transaction.reportID)
 * @param optimisticSelfDMReport The optimistic selfDM report when it exists on the server but was filtered out from OpenApp response (e.g., no actions yet)
 */
// eslint-disable-next-line @typescript-eslint/max-params
function openReport(
    reportID: string | undefined,
    reportActionID?: string,
    participantLoginList: string[] = [],
    newReportObject?: OptimisticChatReport,
    parentReportActionID?: string,
    isFromDeepLink = false,
    participantAccountIDList: number[] = [],
    avatar?: File | CustomRNImageManipulatorResult,
    isNewThread = false,
    transaction?: Transaction,
    transactionViolations?: TransactionViolations,
    parentReportID?: string,
    shouldAddPendingFields = true,
    optimisticSelfDMReport?: Report,
) {
    if (!reportID) {
        return;
    }

    const optimisticReport = reportActionsExist(reportID)
        ? {}
        : {
              reportName: allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.reportName ?? CONST.REPORT.DEFAULT_REPORT_NAME,
          };

    const optimisticData: Array<
        | OnyxUpdate<
              | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
              | typeof ONYXKEYS.COLLECTION.REPORT
              | typeof ONYXKEYS.COLLECTION.TRANSACTION
              | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
              | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
              | typeof ONYXKEYS.NVP_INTRO_SELECTED
              | typeof ONYXKEYS.COLLECTION.POLICY
              | typeof ONYXKEYS.NVP_ONBOARDING
              | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
          >
        | OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>
    > = [
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

    // Only add the report update if optimisticReport has data
    if (Object.keys(optimisticReport).length > 0) {
        optimisticData.unshift({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: optimisticReport,
        });
    }

    const successData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.POLICY
            | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
            | typeof ONYXKEYS.NVP_ONBOARDING
        >
    > = [
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
                hasOnceLoadedReportActions: true,
                isLoadingInitialReportActions: false,
            },
        },
    ];

    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.NVP_INTRO_SELECTED
            | typeof ONYXKEYS.NVP_ONBOARDING
            | typeof ONYXKEYS.COLLECTION.POLICY
            | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingInitialReportActions: false,
            },
        },
    ];

    if (isNewThread) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {errorFields: {createChatThread: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage')}},
        });
    }

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.IS_CHECKING_PUBLIC_ROOM>> = [];

    const parameters: OpenReportParams = {
        reportID,
        reportActionID,
        emailList: participantLoginList ? participantLoginList.join(',') : '',
        accountIDList: participantAccountIDList ? participantAccountIDList.join(',') : '',
        parentReportActionID,
        transactionID: transaction?.transactionID,
        includePartiallySetupBankAccounts: true,
    };

    if (optimisticSelfDMReport) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticSelfDMReport.reportID}`,
            value: optimisticSelfDMReport,
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticSelfDMReport.reportID}`,
            value: null,
        });
    }

    // Some old transactions don't have a transaction thread or money request preview because they were
    // created before we started requiring them. When users open the report, we build
    // the missing pieces here so the UI works. Backend also creates them via moneyRequestPreviewReportActionID.
    // We log at the end of this block to track how often this path gets hit.
    // https://github.com/Expensify/App/issues/80180 - remove once all old transactions are migrated
    if (transaction && !parentReportActionID) {
        const transactionParentReportID = parentReportID ?? transaction?.reportID;
        const iouReportActionID = rand64();

        // Get the parent report to determine the actual submitter/owner of the expense
        // Use optimisticSelfDMReport if provided (when selfDM exists but wasn't in allReports)
        const parentReport =
            transactionParentReportID === optimisticSelfDMReport?.reportID ? optimisticSelfDMReport : allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionParentReportID}`];
        const submitterAccountID = parentReport?.ownerAccountID ?? deprecatedCurrentUserAccountID;
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const submitterEmail = PersonalDetailsUtils.getLoginsByAccountIDs([submitterAccountID]).at(0) ?? deprecatedCurrentUserLogin ?? '';
        const submitterPersonalDetails = PersonalDetailsUtils.getPersonalDetailByEmail(submitterEmail);

        const optimisticIOUAction = buildOptimisticIOUReportAction({
            type: isSelfDM(parentReport) ? CONST.IOU.REPORT_ACTION_TYPE.TRACK : CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            amount: Math.abs(transaction.amount),
            currency: transaction.currency,
            comment: transaction.comment?.comment ?? '',
            participants: [],
            transactionID: transaction.transactionID,
            isOwnPolicyExpenseChat: false,
            reportActionID: iouReportActionID,
            iouReportID: transactionParentReportID,
        });

        // Override actor fields to show the submitter instead of current user.
        // This is needed for legacy transactions where the approver opens the transaction but it should show the submitter
        optimisticIOUAction.actorAccountID = submitterAccountID;
        optimisticIOUAction.person = [
            {
                style: 'strong',
                text: submitterPersonalDetails?.displayName ?? submitterEmail,
                type: 'TEXT',
            },
        ];
        optimisticIOUAction.avatar = submitterPersonalDetails?.avatar;

        // We have a case where the transaction data is only available from the snapshot
        // So we need to add the transaction data to Onyx so it's available when opening the report
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: transaction,
        });

        // Add violations if they exist. This is needed when opening from search results where
        // violations are in the snapshot but not yet synced to the main collections, so we need
        // to add them to Onyx to ensure they show up in the transaction thread
        if (transactionViolations) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
                value: transactionViolations,
            });
        }

        // Attach the optimistic IOU report action created for the transaction to the transaction thread
        // Set chatReportID to link back to the parent policy expense chat for proper avatar rendering
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                parentReportActionID: iouReportActionID,
                chatReportID: transactionParentReportID,
            },
        });

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionParentReportID}`,
            value: {
                [iouReportActionID]: {
                    ...optimisticIOUAction,
                    childReportID: reportID,
                },
            },
        });

        parameters.moneyRequestPreviewReportActionID = iouReportActionID;

        // Log how often the legacy transaction fallback path is taken
        Log.info('[Report] Legacy transaction fallback: creating money request preview', false, {
            transactionParentReportID,
            transactionID: transaction.transactionID,
            reportID,
        });
    }

    const isInviteOnboardingComplete = introSelected?.isInviteOnboardingComplete ?? false;
    const isOnboardingCompleted = onboarding?.hasCompletedGuidedSetupFlow ?? false;

    // Some cases we can have two open report requests with guide setup data because isInviteOnboardingComplete is not updated completely.
    // Then we need to check the list request and prevent the guided setup data from being duplicated.
    const allPersistedRequests = getAll();
    const hasOpenReportWithGuidedSetupData = allPersistedRequests.some((request) => request.command === WRITE_COMMANDS.OPEN_REPORT && request.data?.guidedSetupData);

    // Prepare guided setup data only when nvp_introSelected is set and onboarding is not completed
    // OldDot users will never have nvp_introSelected set, so they will not see guided setup messages
    if (introSelected && !isOnboardingCompleted && !isInviteOnboardingComplete && !hasOpenReportWithGuidedSetupData) {
        const {choice, inviteType} = introSelected;
        const isInviteIOUorInvoice = inviteType === CONST.ONBOARDING_INVITE_TYPES.IOU || inviteType === CONST.ONBOARDING_INVITE_TYPES.INVOICE;
        const isInviteChoiceCorrect = choice === CONST.ONBOARDING_CHOICES.ADMIN || choice === CONST.ONBOARDING_CHOICES.SUBMIT || choice === CONST.ONBOARDING_CHOICES.CHAT_SPLIT;

        if (isInviteChoiceCorrect && !isInviteIOUorInvoice) {
            const onboardingMessage = getOnboardingMessages().onboardingMessages[choice];
            if (choice === CONST.ONBOARDING_CHOICES.CHAT_SPLIT) {
                const updatedTasks = onboardingMessage.tasks.map((task) => (task.type === 'startChat' ? {...task, autoCompleted: true} : task));
                onboardingMessage.tasks = updatedTasks;
            }

            const onboardingData = prepareOnboardingOnyxData({
                introSelected,
                engagementChoice: choice,
                onboardingMessage,
                companySize: introSelected?.companySize as OnboardingCompanySize,
            });

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
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        parameters.groupChatAdminLogins = deprecatedCurrentUserLogin;
        parameters.optimisticAccountIDList = Object.keys(newReportObject?.participants ?? {}).join(',');
        parameters.reportName = newReportObject?.reportName ?? '';

        // If we have an avatar then include it with the parameters
        if (avatar) {
            parameters.file = avatar;
        }

        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
                pendingFields: shouldAddPendingFields
                    ? {
                          createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                          ...(isGroupChat && {reportName: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}),
                      }
                    : undefined,
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
                value: {[optimisticCreatedAction.reportActionID]: {...optimisticCreatedAction, pendingAction: shouldAddPendingFields ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : null}},
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
        const participantAccountIDs = PersonalDetailsUtils.getAccountIDsByLogins(participantLoginList);
        for (const [index, login] of participantLoginList.entries()) {
            const accountID = participantAccountIDs.at(index) ?? -1;
            const isOptimisticAccount = !allPersonalDetails?.[accountID];

            if (!isOptimisticAccount) {
                continue;
            }

            optimisticPersonalDetails[accountID] = {
                login,
                accountID,
                displayName: login,
                isOptimisticPersonalDetail: true,
            };
            settledPersonalDetails[accountID] = null;
        }

        successData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
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

function prepareOnyxDataForCleanUpOptimisticParticipants(
    reportID: string,
): {settledPersonalDetails: OnyxEntry<PersonalDetailsList>; redundantParticipants: Record<number, null>} | undefined {
    const existingReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (!existingReport?.participants) {
        return undefined;
    }
    const settledPersonalDetails: OnyxEntry<PersonalDetailsList> = {};
    const redundantParticipants: Record<number, null> = {};
    for (const accountID in existingReport.participants) {
        if (!allPersonalDetails?.[accountID]?.isOptimisticPersonalDetail) {
            continue;
        }
        settledPersonalDetails[accountID] = null;
        redundantParticipants[accountID] = null;
    }
    return {settledPersonalDetails, redundantParticipants};
}

/**
 * This will return an optimistic report object for a given user we want to create a chat with without saving it, when the only thing we know about recipient is his accountID. *
 * @param accountID accountID of the user that the optimistic chat report is created with.
 */
function getOptimisticChatReport(accountID: number, currentUserAccountID: number): OptimisticChatReport {
    return buildOptimisticChatReport({
        participantList: [accountID, currentUserAccountID],
        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
    });
}

function createTransactionThreadReport(
    iouReport?: OnyxEntry<Report>,
    iouReportAction?: OnyxEntry<ReportAction>,
    transaction?: Transaction,
    transactionViolations?: TransactionViolations,
): OptimisticChatReport | undefined {
    // Determine if we need selfDM report (for track expenses or unreported transactions)
    const isTrackExpense = !iouReport && ReportActionsUtils.isTrackExpenseAction(iouReportAction);
    const isUnreportedTransaction = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const selfDMReportID = isTrackExpense || isUnreportedTransaction ? findSelfDMReportID() : undefined;

    let optimisticSelfDMReport: Report | undefined;
    let reportToUse = iouReport;
    if (selfDMReportID) {
        reportToUse = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`];

        // selfDMReportID may be set but the report is filtered out.
        // Create an optimistic report if needed to proceed with the transaction thread.
        if (!reportToUse) {
            optimisticSelfDMReport = buildOptimisticSelfDMReport(DateUtils.getDBTime(), selfDMReportID);
            reportToUse = optimisticSelfDMReport;
        }
    }

    if (!reportToUse) {
        Log.warn('Cannot build transaction thread report without a valid report');
        return;
    }

    // Sync fresh report data from snapshot to allReports. When navigating from search,
    // allReports may be stale and missing parentReportID/parentReportActionID, causing
    // getAllAncestorReportActionIDs() to fail when adding comments optimistically.
    if (iouReport?.reportID && reportToUse.reportID === iouReport.reportID) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
    }

    const optimisticTransactionThreadReportID = generateReportID();
    const optimisticTransactionThread = buildTransactionThread(iouReportAction, reportToUse, undefined, optimisticTransactionThreadReportID);
    const shouldAddPendingFields = transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || iouReportAction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
    openReport(
        optimisticTransactionThreadReportID,
        undefined,
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        deprecatedCurrentUserLogin ? [deprecatedCurrentUserLogin] : [],
        optimisticTransactionThread,
        iouReportAction?.reportActionID,
        false,
        [],
        undefined,
        false,
        transaction,
        transactionViolations,
        selfDMReportID,
        shouldAddPendingFields,
        optimisticSelfDMReport,
    );
    return optimisticTransactionThread;
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
        chat = getChatByParticipants([...participantAccountIDs, deprecatedCurrentUserAccountID]);
    }

    if (isEmptyObject(chat)) {
        if (isGroupChat) {
            // If we are creating a group chat then participantAccountIDs is expected to contain deprecatedCurrentUserAccountID
            newChat = buildOptimisticGroupChatReport(participantAccountIDs, reportName ?? '', avatarUri ?? '', optimisticReportID, CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);
        } else {
            newChat = buildOptimisticChatReport({
                participantList: [...participantAccountIDs, deprecatedCurrentUserAccountID],
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
            });
        }
        // We want to pass newChat here because if anything is passed in that param (even an existing chat), we will try to create a chat on the server
        openReport(newChat?.reportID, '', userLogins, newChat, undefined, undefined, undefined, avatarFile);
    }
    const report = isEmptyObject(chat) ? newChat : chat;

    if (shouldDismissModal) {
        Navigation.dismissModal({
            callback: () => {
                if (!report?.reportID) {
                    return;
                }

                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.reportID));
            },
        });
    } else if (report?.reportID) {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.reportID));
    }
    // In some cases when RHP modal gets hidden and then we navigate to report Composer focus breaks, wrapping navigation in setTimeout fixes this
    setTimeout(() => {
        Navigation.isNavigationReady().then(() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report?.reportID)));
    }, 0);
}

/**
 * This will find an existing chat, or create a new one if none exists, for the given accountID or set of accountIDs. It will then navigate to this chat.
 *
 * @param participantAccountIDs of user logins to start a chat report with.
 */
function navigateToAndOpenReportWithAccountIDs(participantAccountIDs: number[], currentUserAccountID: number) {
    let newChat: OptimisticChatReport | undefined;
    const chat = getChatByParticipants([...participantAccountIDs, currentUserAccountID]);
    if (!chat) {
        newChat = buildOptimisticChatReport({
            participantList: [...participantAccountIDs, currentUserAccountID],
        });
        // We want to pass newChat here because if anything is passed in that param (even an existing chat), we will try to create a chat on the server
        openReport(newChat?.reportID, '', [], newChat, '0', false, participantAccountIDs);
    }
    const report = chat ?? newChat;

    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report?.reportID));
}

/**
 * This will navigate to an existing thread, or create a new one if necessary.
 * If the child report doesn't exist, creates an optimistic report and calls openReport().
 *
 * @param childReport The report we are trying to open
 * @param parentReportAction the parent comment of a thread
 * @param parentReport The parent report
 */
function navigateToAndOpenChildReport(childReport: OnyxEntry<Report>, parentReportAction: ReportAction, parentReport: OnyxEntry<Report>) {
    const report = childReport ?? createChildReport(childReport, parentReportAction, parentReport);

    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.reportID, undefined, undefined, Navigation.getActiveRoute()));
}

/**
 * Creates a child report and returns it without checking for existing reports.
 * If childReportID is not provided, creates an optimistic report and calls openReport()
 * so the optimistic data is available when navigating to the thread.
 */
function createChildReport(childReport: OnyxEntry<Report>, parentReportAction: ReportAction, parentReport: OnyxEntry<Report>): Report {
    const participantAccountIDs = [...new Set([deprecatedCurrentUserAccountID, Number(parentReportAction.actorAccountID)])];
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
        parentReportID: parentReport?.reportID,
        optimisticReportID: parentReportAction.childReportID,
    });

    const childReportID = childReport?.reportID ?? parentReportAction.childReportID;
    if (!childReportID) {
        const participantLogins = PersonalDetailsUtils.getLoginsByAccountIDs(Object.keys(newChat.participants ?? {}).map(Number));
        openReport(newChat.reportID, '', participantLogins, newChat, parentReportAction.reportActionID, undefined, undefined, undefined, true);
    } else {
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${childReportID}`, newChat);
    }

    return newChat;
}

/**
 * Creates an explanation thread for a report action with reasoning
 * Adds a "Please explain this to me." comment from the user
 */
function explain(reportAction: OnyxEntry<ReportAction>, originalReportID: string | undefined, translate: LocalizedTranslate, timezone: Timezone = CONST.DEFAULT_TIME_ZONE) {
    if (!originalReportID || !reportAction) {
        return;
    }

    // Check if explanation thread report already exists
    const existingChildReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportAction.childReportID}`];
    const originalReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`];
    const report = existingChildReport ?? createChildReport(existingChildReport, reportAction, originalReport);

    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.reportID, undefined, undefined, Navigation.getActiveRoute()));
    // Schedule adding the explanation comment on the next animation frame
    // so it runs immediately after navigation completes.
    requestAnimationFrame(() => {
        addComment(report, report.reportID, [], translate('reportActionContextMenu.explainMessage'), timezone, true);
    });
}

/**
 * Gets the older actions that have not been read yet.
 * Normally happens when you scroll up on a chat, and the actions have not been read yet.
 */
function getOlderActions(reportID: string | undefined, reportActionID: string | undefined) {
    if (!reportID || !reportActionID) {
        return;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingOlderReportActions: true,
                hasLoadingOlderReportActionsError: false,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingOlderReportActions: false,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingNewerReportActions: true,
                hasLoadingNewerReportActionsError: false,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingNewerReportActions: false,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
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

    const lastReadTime = NetworkConnection.getDBTimeWithSkew();

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

    API.writeWithNoDuplicatesConflictAction(
        WRITE_COMMANDS.READ_NEWEST_ACTION,
        parameters,
        {optimisticData},
        (request) => request.command === WRITE_COMMANDS.READ_NEWEST_ACTION && request.data?.reportID === parameters.reportID,
    );

    if (shouldResetUnreadMarker) {
        DeviceEventEmitter.emit(`readNewestAction_${reportID}`, lastReadTime);
    }
}

function markAllMessagesAsRead(archivedReportsIdSet: ArchivedReportsIDSet) {
    if (isAnonymousUser()) {
        return;
    }

    const newLastReadTime = NetworkConnection.getDBTimeWithSkew();

    type PartialReport = {
        lastReadTime: Report['lastReadTime'] | null;
    };
    const optimisticReports: Record<string, PartialReport> = {};
    const failureReports: Record<string, PartialReport> = {};
    const reportIDList: string[] = [];
    for (const report of Object.values(allReports ?? {})) {
        if (!report) {
            continue;
        }

        const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`];
        const oneTransactionThreadReportID = ReportActionsUtils.getOneTransactionThreadReportID(report, chatReport, allReportActions?.[report.reportID]);
        const oneTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`];
        const isArchivedReport = archivedReportsIdSet.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`);
        if (!isUnread(report, oneTransactionThreadReport, isArchivedReport)) {
            continue;
        }

        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`;
        optimisticReports[reportKey] = {lastReadTime: newLastReadTime};
        failureReports[reportKey] = {lastReadTime: report.lastReadTime ?? null};
        reportIDList.push(report.reportID);
    }

    if (reportIDList.length === 0) {
        return;
    }

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT,
            value: optimisticReports,
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT,
            value: failureReports,
        },
    ];

    const parameters: MarkAllMessagesAsReadParams = {
        reportIDList,
    };

    API.write(WRITE_COMMANDS.MARK_ALL_MESSAGES_AS_READ, parameters, {optimisticData, failureData});
}

/**
 * Sets the last read time on a report
 */
function markCommentAsUnread(reportID: string | undefined, reportAction: ReportAction, currentUserAccountID: number) {
    if (!reportID) {
        Log.warn('7339cd6c-3263-4f89-98e5-730f0be15784 Invalid report passed to MarkCommentAsUnread. Not calling the API because it wil fail.');
        return;
    }

    const reportActions = allReportActions?.[reportID];

    // Find the latest report actions from other users
    const latestReportActionFromOtherUsers = Object.values(reportActions ?? {}).reduce((latest: ReportAction | null, current: ReportAction) => {
        if (
            !ReportActionsUtils.isDeletedAction(current) &&
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
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
    const transactionThreadReportID = ReportActionsUtils.getOneTransactionThreadReportID(report, chatReport, reportActions ?? []);
    const transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`];

    // If no action created date is provided, use the last action's from other user
    const actionCreationTime =
        reportAction?.created || (latestReportActionFromOtherUsers?.created ?? getReportLastVisibleActionCreated(report, transactionThreadReport) ?? DateUtils.getDBTime(0));

    // We subtract 1 millisecond so that the lastReadTime is updated to just before a given reportAction's created date
    // For example, if we want to mark a report action with ID 100 and created date '2014-04-01 16:07:02.999' unread, we set the lastReadTime to '2014-04-01 16:07:02.998'
    // Since the report action with ID 100 will be the first with a timestamp above '2014-04-01 16:07:02.998', it's the first one that will be shown as unread
    const lastReadTime = DateUtils.subtractMillisecondsFromDateTime(actionCreationTime, 1);

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, comment || null).then(callback);
}

/** Broadcasts whether or not a user is typing on a report over the report's private pusher channel. */
function broadcastUserIsTyping(reportID: string, currentUserAccountID: number) {
    const privateReportChannelName = getReportChannelName(reportID);
    const typingStatus: UserIsTypingEvent = {
        [currentUserAccountID]: true,
    };
    Pusher.sendEvent(privateReportChannelName, Pusher.TYPE.USER_IS_TYPING, typingStatus);
}

/** Broadcasts to the report's private pusher channel whether a user is leaving a report */
function broadcastUserIsLeavingRoom(reportID: string, currentUserAccountID: number) {
    const privateReportChannelName = getReportChannelName(reportID);
    const leavingStatus: UserIsLeavingRoomEvent = {
        [currentUserAccountID]: true,
    };
    Pusher.sendEvent(privateReportChannelName, Pusher.TYPE.USER_IS_LEAVING_ROOM, leavingStatus);
}

/** Deletes a comment from the report, basically sets it as empty string */
function deleteReportComment(
    reportID: string | undefined,
    reportAction: ReportAction,
    ancestors: Ancestor[],
    isReportArchived: boolean | undefined,
    isOriginalReportArchived: boolean | undefined,
    currentEmail: string,
) {
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
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report, isReportArchived);
    const optimisticLastReportData = optimisticReportLastData(originalReportID, optimisticReportActions as ReportActions, canUserPerformWriteAction, isOriginalReportArchived);

    const optimisticReport: Partial<Report> = {
        ...optimisticLastReportData,
    };

    const didCommentMentionCurrentUser = ReportActionsUtils.didMessageMentionCurrentUser(reportAction, currentEmail);
    if (didCommentMentionCurrentUser && reportAction.created === report?.lastMentionedTime) {
        const reportActionsForReport = allReportActions?.[reportID];
        const latestMentionedReportAction = Object.values(reportActionsForReport ?? {}).find(
            (action) =>
                action.reportActionID !== reportAction.reportActionID &&
                ReportActionsUtils.didMessageMentionCurrentUser(action, currentEmail) &&
                ReportActionsUtils.shouldReportActionBeVisible(action, action.reportActionID),
        );
        optimisticReport.lastMentionedTime = latestMentionedReportAction?.created ?? null;
    }
    // If the API call fails we must show the original message again, so we revert the message content back to how it was
    // and and remove the pendingAction so the strike-through clears
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
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
        optimisticData.push(...getOptimisticDataForAncestors(ancestors, optimisticReport?.lastVisibleActionCreated ?? '', CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE));
    }

    // Force LHN re-evaluation for empty child thread by triggering an Onyx update
    if (reportAction.childReportID && childVisibleActionCount === 0) {
        const childReportKey: `${typeof ONYXKEYS.COLLECTION.REPORT}${string}` = `${ONYXKEYS.COLLECTION.REPORT}${reportAction.childReportID}`;
        const childReport = allReports?.[childReportKey];

        if (childReport) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: childReportKey,
                value: {
                    lastMessageText: '',
                },
            });

            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: childReportKey,
                value: {
                    lastMessageText: childReport.lastMessageText ?? '',
                },
            });
        }
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
    for (const link of links) {
        // We want to match the anchor tag of the link and replace the whole anchor tag with the text of the anchor tag
        const regex = new RegExp(`<(a)[^><]*href\\s*=\\s*(['"])(${Str.escapeForRegExp(link)})\\2(?:".*?"|'.*?'|[^'"><])*>([\\s\\S]*?)<\\/\\1>(?![^<]*(<\\/pre>|<\\/code>))`, 'g');
        htmlCopy = htmlCopy.replace(regex, '$4');
    }
    return htmlCopy;
}

/**
 * This function will handle removing only links that were purposely removed by the user while editing.
 *
 * @param newCommentText text of the comment after editing.
 * @param originalCommentMarkdown original markdown of the comment before editing.
 * @param videoAttributeCache cache of video attributes ([videoSource]: videoAttributes)
 */
function handleUserDeletedLinksInHtml(newCommentText: string, originalCommentMarkdown: string, currentUserLogin: string, videoAttributeCache?: Record<string, string>): string {
    if (newCommentText.length > CONST.MAX_MARKUP_LENGTH) {
        return newCommentText;
    }

    const userEmailDomain = isEmailPublicDomain(currentUserLogin) ? '' : Str.extractEmailDomain(currentUserLogin);
    const allPersonalDetailLogins = Object.values(allPersonalDetails ?? {}).map((personalDetail) => personalDetail?.login ?? '');

    const htmlForNewComment = getParsedMessageWithShortMentions({
        text: newCommentText,
        userEmailDomain,
        availableMentionLogins: allPersonalDetailLogins,
        parserOptions: {
            extras: {videoAttributeCache},
        },
    });

    const removedLinks = Parser.getRemovedMarkdownLinks(originalCommentMarkdown, newCommentText);
    return removeLinksFromHtml(htmlForNewComment, removedLinks);
}

/** Saves a new message for a comment. Marks the comment as edited, which will be reflected in the UI. */
function editReportComment(
    originalReport: OnyxEntry<Report>,
    originalReportAction: OnyxEntry<ReportAction>,
    ancestors: Ancestor[],
    textForNewComment: string,
    isOriginalReportArchived: boolean | undefined,
    isOriginalParentReportArchived: boolean | undefined,
    currentUserLogin: string,
    videoAttributeCache?: Record<string, string>,
) {
    const originalReportID = originalReport?.reportID;
    if (!originalReportID || !originalReportAction) {
        return;
    }

    const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(originalReport, isOriginalReportArchived);

    // Do not autolink if someone explicitly tries to remove a link from message.
    // https://github.com/Expensify/App/issues/9090
    // https://github.com/Expensify/App/issues/13221
    const originalCommentHTML = ReportActionsUtils.getReportActionHtml(originalReportAction);
    const originalCommentMarkdown = Parser.htmlToMarkdown(originalCommentHTML ?? '').trim();

    // Skip the Edit if draft is not changed
    if (originalCommentMarkdown === textForNewComment) {
        return;
    }
    const htmlForNewComment = handleUserDeletedLinksInHtml(textForNewComment, originalCommentMarkdown, currentUserLogin, videoAttributeCache);

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
        deleteReportComment(originalReportID, originalReportAction, ancestors, isOriginalReportArchived, isOriginalParentReportArchived, currentUserLogin);
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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
    currentUserAccountID: number,
    parentReportID?: string,
    parentReportActionID?: string,
) {
    // No change needed
    if (previousValue === newValue) {
        return;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {visibility: newValue},
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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
 * This will subscribe to an existing thread, or create a new one and then subscribe to it if necessary
 *
 * @param childReportID The reportID we are trying to open
 * @param parentReportAction the parent comment of a thread
 * @param parentReport The parent report
 * @param prevNotificationPreference The previous notification preference for the child report
 */
function toggleSubscribeToChildReport(
    childReportID: string | undefined,
    currentUserAccountID: number,
    parentReportAction: ReportAction,
    parentReport: OnyxEntry<Report>,
    prevNotificationPreference?: NotificationPreference,
) {
    if (childReportID) {
        openReport(childReportID);
        const parentReportActionID = parentReportAction.reportActionID;
        if (!prevNotificationPreference || isHiddenForCurrentUser(prevNotificationPreference)) {
            updateNotificationPreference(
                childReportID,
                prevNotificationPreference,
                CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                currentUserAccountID,
                parentReport?.reportID,
                parentReportActionID,
            );
        } else {
            updateNotificationPreference(
                childReportID,
                prevNotificationPreference,
                CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                currentUserAccountID,
                parentReport?.reportID,
                parentReportActionID,
            );
        }
    } else {
        const participantAccountIDs = [...new Set([currentUserAccountID, Number(parentReportAction.actorAccountID)])];
        const newChat = buildOptimisticChatReport({
            participantList: participantAccountIDs,
            reportName: ReportActionsUtils.getReportActionText(parentReportAction),
            chatType: parentReport?.chatType,
            policyID: parentReport?.policyID ?? CONST.POLICY.OWNER_EMAIL_FAKE,
            ownerAccountID: CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            parentReportActionID: parentReportAction.reportActionID,
            parentReportID: parentReport?.reportID,
        });

        const participantLogins = PersonalDetailsUtils.getLoginsByAccountIDs(participantAccountIDs);
        openReport(newChat.reportID, '', participantLogins, newChat, parentReportAction.reportActionID);
        const notificationPreference = isHiddenForCurrentUser(prevNotificationPreference) ? CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS : CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
        updateNotificationPreference(newChat.reportID, prevNotificationPreference, notificationPreference, currentUserAccountID, parentReport?.reportID, parentReportAction.reportActionID);
    }
}

function updateReportName(reportID: string, value: string, previousValue: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                reportName: previousValue,
                pendingFields: {
                    reportName: null,
                },
                errorFields: {
                    reportName: getMicroSecondOnyxErrorWithTranslationKey('report.genericUpdateReportNameEditFailureMessage'),
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

function updateReportField(
    report: Report,
    reportField: PolicyReportField,
    previousReportField: PolicyReportField,
    policy: Policy,
    isASAPSubmitBetaEnabled: boolean,
    accountID: number,
    email: string,
    hasViolationsParam: boolean,
    recentlyUsedReportFields: OnyxEntry<RecentlyUsedReportFields>,
    shouldFixViolations = false,
) {
    const reportID = report.reportID;
    const fieldKey = getReportFieldKey(reportField.fieldID);
    const reportViolations = getReportViolations(reportID);
    const fieldViolation = getFieldViolation(reportViolations, reportField);
    const recentlyUsedValues = recentlyUsedReportFields?.[fieldKey] ?? [];

    const optimisticChangeFieldAction = buildOptimisticChangeFieldAction(reportField, previousReportField);
    const predictedNextStatus = policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO ? CONST.REPORT.STATUS_NUM.CLOSED : CONST.REPORT.STATUS_NUM.OPEN;

    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report,
        predictedNextStatus,
        shouldFixViolations,
        policy,
        currentUserAccountIDParam: accountID,
        currentUserEmailParam: email,
        hasViolations: hasViolationsParam,
        isASAPSubmitBetaEnabled,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report,
        predictedNextStatus,
        shouldFixViolations,
        policy,
        currentUserAccountIDParam: accountID,
        currentUserEmailParam: email,
        hasViolations: hasViolationsParam,
        isASAPSubmitBetaEnabled,
    });

    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_VIOLATIONS
            | typeof ONYXKEYS.RECENTLY_USED_REPORT_FIELDS
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                fieldList: {
                    [fieldKey]: reportField,
                },
                nextStep: optimisticNextStep,
                pendingFields: {
                    [fieldKey]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`,
            value: optimisticNextStepDeprecated,
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.RECENTLY_USED_REPORT_FIELDS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                fieldList: {
                    [fieldKey]: previousReportField,
                },
                nextStep: report.nextStep ?? null,
                pendingFields: {
                    [fieldKey]: null,
                    nextStep: null,
                },
                errorFields: {
                    [fieldKey]: getMicroSecondOnyxErrorWithTranslationKey('report.genericUpdateReportFieldFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticChangeFieldAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('report.genericUpdateReportFieldFailureMessage'),
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingFields: {
                    [fieldKey]: null,
                    nextStep: null,
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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
                    [fieldKey]: getMicroSecondOnyxErrorWithTranslationKey('report.genericUpdateReportFieldFailureMessage'),
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

function updateDescription(reportID: string, currentDescription: string, newMarkdownValue: string, currentUserAccountID: number) {
    // No change needed
    if (Parser.htmlToMarkdown(currentDescription) === newMarkdownValue) {
        return;
    }

    const parsedDescription = getParsedComment(newMarkdownValue, {reportID});
    const optimisticDescriptionUpdatedReportAction = buildOptimisticRoomDescriptionUpdatedReportAction(parsedDescription);
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                description: currentDescription,
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
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {writeCapability: newValue},
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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
function navigateToConciergeChat(
    conciergeReportID: string | undefined,
    shouldDismissModal = false,
    checkIfCurrentPageActive = () => true,
    linkToOptions?: LinkToOptions,
    reportActionID?: string,
) {
    // If conciergeReportID contains a concierge report ID, we navigate to the concierge chat using the stored report ID.
    // Otherwise, we would find the concierge chat and navigate to it.
    if (!conciergeReportID) {
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
        Navigation.dismissModalWithReport({reportID: conciergeReportID, reportActionID});
    } else {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(conciergeReportID), linkToOptions);
    }
}

function buildNewReportOptimisticData(
    policy: OnyxEntry<Policy>,
    reportID: string,
    reportActionID: string,
    ownerPersonalDetails: CurrentUserPersonalDetails,
    reportPreviewReportActionID: string,
    hasViolationsParam: boolean,
    isASAPSubmitBetaEnabled: boolean,
) {
    const {accountID, login, email} = ownerPersonalDetails;
    const timeOfCreation = DateUtils.getDBTime();
    const parentReport = getPolicyExpenseChat(accountID, policy?.id);
    const optimisticReportData = buildOptimisticEmptyReport(reportID, accountID, parentReport, reportPreviewReportActionID, policy, timeOfCreation);

    const optimisticNextStep = buildOptimisticNextStep({
        report: optimisticReportData,
        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
        policy,
        currentUserAccountIDParam: accountID,
        currentUserEmailParam: email ?? '',
        hasViolations: hasViolationsParam,
        isASAPSubmitBetaEnabled,
    });
    if (optimisticNextStep) {
        optimisticReportData.nextStep = optimisticNextStep;
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

    const message = getReportPreviewMessage(optimisticReportData);
    const createReportActionMessage = [
        {
            html: message,
            text: message,
            type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
        },
    ];

    const optimisticReportPreview = {
        action: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
        actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
        childReportName: optimisticReportData.reportName,
        childReportID: reportID,
        childType: CONST.REPORT.TYPE.EXPENSE,
        created: timeOfCreation,
        shouldShow: true,
        childOwnerAccountID: accountID,
        automatic: false,
        avatar: ownerPersonalDetails.avatar,
        isAttachmentOnly: false,
        reportActionID: reportPreviewReportActionID,
        message: createReportActionMessage,
        originalMessage: {
            linkedReportID: reportID,
        },
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: accountID,
    };

    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: optimisticReportData,
        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
        policy,
        currentUserAccountIDParam: accountID,
        currentUserEmailParam: email ?? '',
        hasViolations: hasViolationsParam,
        isASAPSubmitBetaEnabled,
    });
    const outstandingChildRequest = getOutstandingChildRequest(optimisticReportData);

    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS
            | typeof ONYXKEYS.COLLECTION.SNAPSHOT
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: optimisticReportData,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                hasOnceLoadedReportActions: true,
            },
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
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport?.reportID}`,
            value: {iouReportID: reportID, ...outstandingChildRequest},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${parentReport?.reportID}`,
            value: {
                hasOnceLoadedReportActions: true,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`,
            value: optimisticNextStepDeprecated,
        },
    ];

    optimisticData.push(...updateTitleFieldToMatchPolicy(reportID, policy));

    const currentSearchQueryJSON = getCurrentSearchQueryJSON();
    if (currentSearchQueryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}` as const,
            value: {
                data: {[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: optimisticReportData},
            },
        });
    } else if (currentSearchQueryJSON?.type === CONST.SEARCH.DATA_TYPES.CHAT) {
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}` as const,
            value: {
                data: {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport?.reportID}`]: {[reportPreviewReportActionID]: {...optimisticReportPreview, reportID: parentReport?.reportID}},
                    [`${ONYXKEYS.COLLECTION.REPORT}${parentReport?.reportID}`]: parentReport,
                    [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: optimisticReportData,
                },
            },
        });
    }

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {errorFields: {createReport: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage')}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            value: {[reportActionID]: {errorFields: {createReport: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage')}}},
        },

        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport?.reportID}`,
            value: {hasOutstandingChildRequest: parentReport?.hasOutstandingChildRequest},
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingFields: {
                    createReport: null,
                },
                errorFields: {
                    createReport: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: null,
                    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                    errorFields: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport?.reportID}`,
            value: {
                [reportPreviewReportActionID]: {
                    pendingAction: null,
                    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                    errorFields: null,
                },
            },
        },
    ];

    return {
        optimisticReportName: optimisticReportData.reportName,
        reportPreviewAction: optimisticReportPreview,
        parentReportID: parentReport?.reportID,
        optimisticData,
        successData,
        failureData,
        optimisticReportData,
    };
}

function createNewReport(
    ownerPersonalDetails: CurrentUserPersonalDetails,
    hasViolationsParam: boolean,
    isASAPSubmitBetaEnabled: boolean,
    policy: OnyxEntry<Policy>,
    shouldNotifyNewAction = false,
    shouldDismissEmptyReportsConfirmation?: boolean,
) {
    const optimisticReportID = generateReportID();
    const reportActionID = rand64();
    const reportPreviewReportActionID = rand64();

    const {parentReportID, reportPreviewAction, optimisticData, successData, failureData, optimisticReportData} = buildNewReportOptimisticData(
        policy,
        optimisticReportID,
        reportActionID,
        ownerPersonalDetails,
        reportPreviewReportActionID,
        hasViolationsParam,
        isASAPSubmitBetaEnabled,
    );

    if (shouldDismissEmptyReportsConfirmation) {
        Onyx.merge(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED, true);
    }

    API.write(
        WRITE_COMMANDS.CREATE_APP_REPORT,
        {
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID: policy?.id,
            reportID: optimisticReportID,
            reportActionID,
            reportPreviewReportActionID,
            ownerEmail: ownerPersonalDetails.login,
            ...(shouldDismissEmptyReportsConfirmation ? {shouldDismissEmptyReportsConfirmation} : {}),
        },
        {optimisticData, successData, failureData},
    );
    if (shouldNotifyNewAction) {
        notifyNewAction(parentReportID, ownerPersonalDetails.accountID, reportPreviewAction);
    }

    return optimisticReportData;
}

/**
 * Removes the report after failure to create. Also removes it's related report actions and next step from Onyx.
 */
function removeFailedReport(reportID: string | undefined) {
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, null);
    Onyx.set(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`, null);
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, null);
}

/** Add a policy report (workspace room) optimistically and navigate to it. */
function addPolicyReport(policyReport: OptimisticChatReport) {
    const createdReportAction = buildOptimisticCreatedReportAction(CONST.POLICY.OWNER_EMAIL_FAKE);

    // Onyx.set is used on the optimistic data so that it is present before navigating to the workspace room. With Onyx.merge the workspace room reportID is not present when
    // fetchReportIfNeeded is called on the ReportScreen, so openReport is called which is unnecessary since the optimistic data will be stored in Onyx.
    // Therefore, Onyx.set is used instead of Onyx.merge.
    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.FORMS.NEW_ROOM_FORM | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>
    > = [
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
    const successData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.FORMS.NEW_ROOM_FORM>
    > = [
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
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.FORMS.NEW_ROOM_FORM | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${policyReport.reportID}`,
            value: {
                errorFields: {
                    addWorkspaceRoom: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
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
    Navigation.dismissModalWithReport({reportID: policyReport.reportID});
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

    for (const transactionID of [...new Set(transactionIDs)]) {
        onyxData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = null;
    }

    Onyx.multiSet(onyxData);

    if (shouldDeleteChildReports) {
        for (const reportAction of Object.values(reportActionsForReport ?? {})) {
            if (!reportAction.childReportID) {
                continue;
            }
            deleteReport(reportAction.childReportID, shouldDeleteChildReports);
        }
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
        Navigation.popToSidebar();
    } else {
        Navigation.goBack();
    }
    navigateToConciergeChat(conciergeReportIDOnyxConnect, false);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => {
        deleteReport(reportID, shouldDeleteChildReports);
    });
}

function clearCreateChatError(report: OnyxEntry<Report>) {
    const metaData = getReportMetadata(report?.reportID);
    const isOptimisticReport = metaData?.isOptimisticReport;
    if (report?.errorFields?.createChat && !isOptimisticReport) {
        clearReportFieldKeyErrors(report.reportID, 'createChat');
        return;
    }

    navigateToConciergeChatAndDeleteReport(report?.reportID, undefined, true);
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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
    const topmostReportID = Navigation.getTopmostReportId();

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
    if (action && action.actorAccountID === deprecatedCurrentUserAccountID) {
        Log.info(`${tag} No notification because comment is from the currently logged in user`);
        return false;
    }

    // If we are currently viewing this report do not show a notification.
    if (reportID === topmostReportID && Visibility.isVisible() && Visibility.hasFocus()) {
        Log.info(`${tag} No notification because it was a comment for the current report`);
        return false;
    }

    // If the report is a transaction thread and we are currently viewing the associated one-transaction report do no show a notification.
    const topmostReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${topmostReportID}`];
    const topmostReportActions = allReportActions?.[`${topmostReport?.reportID}`];
    const chatTopmostReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${topmostReport?.chatReportID}`];
    if (reportID === ReportActionsUtils.getOneTransactionThreadReportID(topmostReport, chatTopmostReport, topmostReportActions) && Visibility.isVisible() && Visibility.hasFocus()) {
        Log.info(`${tag} No notification because the report is a transaction thread associated with the current one-transaction report`);
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

    const onClick = () => close(() => navigateFromNotification(reportID));

    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE) {
        const movedFromReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.FROM)}`];
        const movedToReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.TO)}`];
        LocalNotification.showModifiedExpenseNotification({report, reportAction, onClick, movedFromReport, movedToReport});
    } else {
        LocalNotification.showCommentNotification(report, reportAction, onClick);
    }

    notifyNewAction(reportID, reportAction.actorAccountID);
}

/** Clear the errors associated with the IOUs of a given report. */
function clearIOUError(reportID: string | undefined) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {errorFields: {iou: null}});
}

/**
 * Adds a reaction to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 */
function addEmojiReaction(reportID: string, reportActionID: string, emoji: Emoji, skinTone: number, currentUserAccountID: number) {
    const createdAt = timezoneFormat(toZonedTime(new Date(), 'UTC'), CONST.DATE.FNS_DB_FORMAT_STRING);
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS>> = [
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
                                [skinTone]: createdAt,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS>> = [
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS>> = [
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
    };

    API.write(WRITE_COMMANDS.ADD_EMOJI_REACTION, parameters, {optimisticData, successData, failureData});
}

/**
 * Removes a reaction to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 */
function removeEmojiReaction(reportID: string, reportActionID: string, emoji: Emoji, currentUserAccountID: number) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS>> = [
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
    paramSkinTone: number,
    currentUserAccountID: number,
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
    const skinTone = emoji.types === undefined ? CONST.EMOJI_DEFAULT_SKIN_TONE : paramSkinTone;

    if (existingReactionObject && EmojiUtils.hasAccountIDEmojiReacted(currentUserAccountID, existingReactionObject.users, ignoreSkinToneOnCompare ? undefined : skinTone)) {
        removeEmojiReaction(originalReportID, reportAction.reportActionID, emoji, currentUserAccountID);
        return;
    }

    addEmojiReaction(originalReportID, reportAction.reportActionID, emoji, skinTone, currentUserAccountID);
}

function doneCheckingPublicRoom() {
    Onyx.set(ONYXKEYS.IS_CHECKING_PUBLIC_ROOM, false);
}

function navigateToMostRecentReport(currentReport: OnyxEntry<Report>) {
    const lastAccessedReportID = findLastAccessedReport(false, false, undefined, currentReport?.reportID)?.reportID;

    if (lastAccessedReportID) {
        // Check if route exists for super wide RHP vs regular full screen report
        const topmostSuperWideRHP = Navigation.getTopmostSuperWideRHPReportID();

        if (lastAccessedReportID === topmostSuperWideRHP && !getIsNarrowLayout()) {
            Navigation.dismissToSuperWideRHP();
        } else {
            const lastAccessedReportRoute = ROUTES.REPORT_WITH_ID.getRoute(lastAccessedReportID);
            Navigation.goBack(lastAccessedReportRoute);
        }
    } else {
        const isChatThread = isChatThreadReportUtils(currentReport);

        // If it is not a chat thread we should call Navigation.goBack to pop the current route first before navigating to Concierge.
        if (!isChatThread) {
            Navigation.goBack();
        }

        navigateToConciergeChat(conciergeReportIDOnyxConnect, false, () => true, {forceReplace: true});
    }
}

function getMostRecentReportID(currentReport: OnyxEntry<Report>) {
    const lastAccessedReportID = findLastAccessedReport(false, false, undefined, currentReport?.reportID)?.reportID;
    return lastAccessedReportID ?? conciergeReportIDOnyxConnect;
}

function joinRoom(report: OnyxEntry<Report>, currentUserAccountID: number) {
    if (!report) {
        return;
    }
    updateNotificationPreference(
        report.reportID,
        getReportNotificationPreference(report),
        getDefaultNotificationPreferenceForReport(report),
        currentUserAccountID,
        report.parentReportID,
        report.parentReportActionID,
    );
}

function leaveGroupChat(report: Report, shouldClearQuickAction: boolean, currentUserAccountID: number) {
    const reportID = report.reportID;
    // Use merge instead of set to avoid deleting the report too quickly, which could cause a brief "not found" page to appear.
    // The remaining parts of the report object will be removed after the API call is successful.
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE>> = [
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
    if (shouldClearQuickAction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: null,
        });
    }

    // Ensure that any remaining data is removed upon successful completion, even if the server sends a report removal response.
    // This is done to prevent the removal update from lingering in the applyHTTPSOnyxUpdates function.
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: null,
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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
function leaveRoom(report: Report, currentUserAccountID: number, isWorkspaceMemberLeavingWorkspaceRoom = false) {
    const reportID = report.reportID;
    const isChatThread = isChatThreadReportUtils(report);

    // Pusher's leavingStatus should be sent earlier.
    // Place the broadcast before calling the LeaveRoom API to prevent a race condition
    // between Onyx report being null and Pusher's leavingStatus becoming true.
    broadcastUserIsLeavingRoom(reportID, currentUserAccountID);

    // If a workspace member is leaving a workspace room, they don't actually lose the room from Onyx.
    // Instead, their notification preference just gets set to "hidden".
    // Same applies for chat threads too
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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
        Navigation.dismissModal();
        return;
    }
    // In other cases, the report is deleted and we should move the user to another report.
    navigateToMostRecentReport(report);
}

function buildInviteToRoomOnyxData(report: Report, inviteeEmailsToAccountIDs: InvitedEmailsToAccountIDs, formatPhoneNumber: LocaleContextProps['formatPhoneNumber']) {
    const reportID = report.reportID;
    const reportMetadata = getReportMetadata(reportID);
    const isGroupChat = isGroupChatReportUtils(report);

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

    const newPersonalDetailsOnyxData = PersonalDetailsUtils.getPersonalDetailsOnyxDataForOptimisticUsers(newLogins, newAccountIDs, formatPhoneNumber);
    const pendingChatMembers = getPendingChatMembers(inviteeAccountIDs, reportMetadata?.pendingChatMembers ?? [], CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

    const newParticipantAccountCleanUp = newAccountIDs.reduce<Record<number, null>>((participantCleanUp, newAccountID) => {
        // eslint-disable-next-line no-param-reassign
        participantCleanUp[newAccountID] = null;
        return participantCleanUp;
    }, {});

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.PERSONAL_DETAILS_LIST>> = [
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
    optimisticData.push(...(newPersonalDetailsOnyxData.optimisticData ?? []));

    const successPendingChatMembers = reportMetadata?.pendingChatMembers
        ? reportMetadata?.pendingChatMembers?.filter(
              (pendingMember) => !(inviteeAccountIDs.includes(Number(pendingMember.accountID)) && pendingMember.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
          )
        : null;
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.PERSONAL_DETAILS_LIST>> = [
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
    successData.push(...(newPersonalDetailsOnyxData.finallyData ?? []));

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
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
                            errors: getMicroSecondOnyxErrorWithTranslationKey('roomMembersPage.error.genericAdd'),
                        };
                    }) ?? null,
            },
        },
    ];

    return {optimisticData, successData, failureData, isGroupChat, inviteeEmails, newAccountIDs};
}

/** Invites people to a room */
function inviteToRoom(report: Report, inviteeEmailsToAccountIDs: InvitedEmailsToAccountIDs, formatPhoneNumber: LocaleContextProps['formatPhoneNumber']) {
    const {optimisticData, successData, failureData, isGroupChat, inviteeEmails, newAccountIDs} = buildInviteToRoomOnyxData(report, inviteeEmailsToAccountIDs, formatPhoneNumber);

    if (isGroupChat) {
        const parameters: InviteToGroupChatParams = {
            reportID: report.reportID,
            inviteeEmails,
            accountIDList: newAccountIDs.join(),
        };

        API.write(WRITE_COMMANDS.INVITE_TO_GROUP_CHAT, parameters, {optimisticData, successData, failureData});
        return;
    }

    const parameters: InviteToRoomParams = {
        reportID: report.reportID,
        inviteeEmails,
        accountIDList: newAccountIDs.join(),
    };

    // eslint-disable-next-line rulesdir/no-multiple-api-calls
    API.write(WRITE_COMMANDS.INVITE_TO_ROOM, parameters, {optimisticData, successData, failureData});
}

/** Invites people to a room via concierge whisper */
function inviteToRoomAction(report: Report, ancestors: Ancestor[], inviteeEmailsToAccountIDs: InvitedEmailsToAccountIDs, timezoneParam: Timezone) {
    const inviteeEmails = Object.keys(inviteeEmailsToAccountIDs);

    addComment(report, report.reportID, ancestors, inviteeEmails.map((login) => `@${login}`).join(' '), timezoneParam, false);
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

    for (const accountID of accountIDList) {
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
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {participants: optimisticParticipants},
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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
function inviteToGroupChat(report: Report, inviteeEmailsToAccountIDs: InvitedEmailsToAccountIDs, formatPhoneNumber: LocaleContextProps['formatPhoneNumber']) {
    inviteToRoom(report, inviteeEmailsToAccountIDs, formatPhoneNumber);
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
    for (const accountID of targetAccountIDs) {
        removeParticipantsData[accountID] = null;
    }
    const pendingChatMembers = getPendingChatMembers(targetAccountIDs, reportMetadata?.pendingChatMembers ?? [], CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                pendingChatMembers,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
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
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
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

function optimisticReportLastData(
    reportID: string,
    optimisticReportActions: Record<string, NullishDeep<ReportAction> | null> = {},
    canUserPerformWriteAction?: boolean,
    isReportArchived?: boolean,
) {
    const lastMessageText = getLastVisibleMessage(reportID, isReportArchived, optimisticReportActions).lastMessageText ?? '';
    const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(reportID, canUserPerformWriteAction, optimisticReportActions);
    return {
        lastMessageText,
        lastVisibleActionCreated: lastVisibleAction?.created ?? '',
        lastActorAccountID: lastMessageText ? lastVisibleAction?.actorAccountID : CONST.DEFAULT_NUMBER_ID,
    };
}

/** Flag a comment as offensive */
function flagComment(reportAction: OnyxEntry<ReportAction>, severity: string, originalReport: OnyxEntry<Report> | undefined, isOriginalReportArchived: boolean | undefined) {
    const originalReportID = originalReport?.reportID;
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

    const shouldHideMessage = (
        [CONST.MODERATION.FLAG_SEVERITY_HARASSMENT, CONST.MODERATION.FLAG_SEVERITY_ASSAULT, CONST.MODERATION.FLAG_SEVERITY_INTIMIDATION, CONST.MODERATION.FLAG_SEVERITY_BULLYING] as string[]
    ).includes(severity);

    const updatedMessage: Message = {
        ...message,
        moderationDecision: updatedDecision,
        ...(shouldHideMessage ? {translationKey: '', type: 'COMMENT', html: '', text: '', isEdited: true} : {}),
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

    const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(originalReport, isOriginalReportArchived);

    const optimisticLastReportData = optimisticReportLastData(
        originalReportID ?? String(CONST.DEFAULT_NUMBER_ID),
        {
            [reportActionID]: {...reportAction, message: [updatedMessage], pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
        } as ReportActions,
        canUserPerformWriteAction,
        isOriginalReportArchived,
    );

    const optimisticReport: Partial<Report> = {
        ...optimisticLastReportData,
    };

    if (shouldHideMessage) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`,
            value: optimisticReport,
        });
    }

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

    if (shouldHideMessage) {
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`,
            value: originalReport,
        });
    }

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                privateNotes: {
                    [accountID]: {
                        errors: getMicroSecondOnyxErrorWithTranslationKey('privateNotes.error.genericFailureMessage'),
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingPrivateNotes: true,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingPrivateNotes: false,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
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

type CompleteOnboardingProps = {
    engagementChoice: OnboardingPurpose;
    onboardingMessage: OnboardingMessage;
    firstName?: string;
    lastName?: string;
    adminsChatReportID?: string;
    onboardingPolicyID?: string;
    paymentSelected?: string;
    companySize?: OnboardingCompanySize;
    userReportedIntegration?: OnboardingAccounting;
    wasInvited?: boolean;
    selectedInterestedFeatures?: string[];
    shouldSkipTestDriveModal?: boolean;
    isInvitedAccountant?: boolean;
    onboardingPurposeSelected?: OnboardingPurpose;
    shouldWaitForRHPVariantInitialization?: boolean;
};

async function completeOnboarding({
    engagementChoice,
    onboardingMessage,
    firstName = '',
    lastName = '',
    adminsChatReportID,
    onboardingPolicyID,
    paymentSelected,
    companySize,
    userReportedIntegration,
    wasInvited,
    selectedInterestedFeatures = [],
    shouldSkipTestDriveModal,
    isInvitedAccountant,
    onboardingPurposeSelected,
    shouldWaitForRHPVariantInitialization = false,
}: CompleteOnboardingProps) {
    const onboardingData = prepareOnboardingOnyxData({
        introSelected,
        engagementChoice,
        onboardingMessage,
        adminsChatReportID,
        onboardingPolicyID,
        userReportedIntegration,
        wasInvited,
        companySize,
        selectedInterestedFeatures,
        isInvitedAccountant,
        onboardingPurposeSelected,
    });
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

    // We should only set testDriveModalDismissed to false if it's not already true (i.e., if the modal hasn't been dismissed yet).
    if (!shouldSkipTestDriveModal && onboarding?.testDriveModalDismissed !== true) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_ONBOARDING,
            value: {testDriveModalDismissed: false},
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_ONBOARDING,
            value: {testDriveModalDismissed: false},
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_ONBOARDING,
            value: {testDriveModalDismissed: null},
        });
    }

    if (shouldWaitForRHPVariantInitialization) {
        // Wait for the workspace to be created before completing the guided setup
        await waitForWrites(SIDE_EFFECT_REQUEST_COMMANDS.COMPLETE_GUIDED_SETUP);

        // We need to access the nvp_onboardingRHPVariant directly from the response to redirect the user to the correct page
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.COMPLETE_GUIDED_SETUP, parameters, {optimisticData, successData, failureData});
    }

    // API calls are not chained in this case
    // eslint-disable-next-line rulesdir/no-multiple-api-calls
    return API.write(WRITE_COMMANDS.COMPLETE_GUIDED_SETUP, parameters, {optimisticData, successData, failureData});
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

/**
 * Saves the private notes left by the user as they are typing. By saving this data the user can switch between chats, close
 * tab, refresh etc without worrying about loosing what they typed out.
 */
function savePrivateNotesDraft(reportID: string, note: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_NOTES_DRAFT}${reportID}`, note);
}

function searchForReports(isOffline: boolean, searchInput: string, policyID?: string) {
    // We do not try to make this request while offline because it sets a loading indicator optimistically
    if (isOffline) {
        Onyx.set(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, false);
        return;
    }

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.IS_SEARCHING_FOR_REPORTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_SEARCHING_FOR_REPORTS,
            value: false,
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.IS_SEARCHING_FOR_REPORTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_SEARCHING_FOR_REPORTS,
            value: false,
        },
    ];

    const searchForRoomToMentionParams: SearchForRoomsToMentionParams = {query: searchInput.toLowerCase(), policyID};
    const searchForReportsParams: SearchForReportsParams = {searchInput: searchInput.toLowerCase(), canCancel: true};

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
    // We are not getting isOffline from components as useEffect change will re-trigger the search on network change
    const isOffline = NetworkStore.isOffline();
    if (isOffline || !searchInput.trim().length) {
        Onyx.set(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, false);
        return;
    }

    // Why not set this in optimistic data? It won't run until the API request happens and while the API request is debounced
    // we want to show the loading state right away. Otherwise, we will see a flashing UI where the client options are sorted and
    // tell the user there are no options, then we start searching, and tell them there are no options again.
    Onyx.set(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, true);
    searchForReports(isOffline, searchInput, policyID);
}

/**
 * Fetch all outstanding reports to ensure they are available in Onyx
 */
function fetchOutstandingReports() {
    const isOffline = NetworkStore.isOffline();

    // We do not try to make this request while offline because it sets a loading indicator optimistically
    if (isOffline) {
        Onyx.set(ONYXKEYS.IS_LOADING_OUTSTANDING_REPORTS, false);
        return;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_OUTSTANDING_REPORTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_OUTSTANDING_REPORTS,
            value: true,
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_OUTSTANDING_REPORTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_OUTSTANDING_REPORTS,
            value: false,
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_OUTSTANDING_REPORTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_OUTSTANDING_REPORTS,
            value: false,
        },
    ];

    API.read(READ_COMMANDS.GET_OUTSTANDING_REPORTS, null, {
        optimisticData,
        successData,
        failureData,
    });
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

function setNewRoomFormLoading(isLoading = true) {
    Onyx.merge(`${ONYXKEYS.FORMS.NEW_ROOM_FORM}`, {isLoading});
}

function clearNewRoomFormError() {
    return Onyx.set(ONYXKEYS.FORMS.NEW_ROOM_FORM, {
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
    report: OnyxEntry<Report>,
    reportAction: OnyxEntry<ReportAction>,
    resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION> | ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER>,
    isReportArchived: boolean | undefined,
) {
    const reportID = report?.reportID;
    if (!reportAction || !reportID) {
        return;
    }

    const message = ReportActionsUtils.getReportActionMessage(reportAction);
    if (!message) {
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

    const reportUpdateDataWithPreviousLastMessage = getReportLastMessage(reportID, isReportArchived, optimisticReportActions as ReportActions);

    const reportUpdateDataWithCurrentLastMessage = {
        lastMessageText: report.lastMessageText,
        lastVisibleActionCreated: report.lastVisibleActionCreated,
        lastActorAccountID: report.lastActorAccountID,
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

function resolveActionableMentionConfirmWhisper(
    report: OnyxEntry<Report>,
    reportAction: OnyxEntry<ReportAction>,
    resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER>,
    isReportArchived: boolean,
) {
    resolveActionableMentionWhisper(report, reportAction, resolution, isReportArchived);
}

function resolveActionableReportMentionWhisper(
    report: OnyxEntry<Report>,
    reportAction: OnyxEntry<ReportAction>,
    resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION>,
    isReportArchived: boolean | undefined,
) {
    const reportId = report?.reportID;
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

    const reportUpdateDataWithPreviousLastMessage = getReportLastMessage(reportId, isReportArchived, optimisticReportActions as ReportActions);

    const reportUpdateDataWithCurrentLastMessage = {
        lastMessageText: report.lastMessageText,
        lastVisibleActionCreated: report.lastVisibleActionCreated,
        lastActorAccountID: report.lastActorAccountID,
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticReportActionID]: action,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticReportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticReportActionID]: action,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticReportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
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

function exportReportToCSV({reportID, transactionIDList}: ExportReportCSVParams, onDownloadFailed: () => void, translate: LocalizedTranslate) {
    let reportIDParam = reportID;
    const allReportTransactions = getReportTransactions(reportID).filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const allTransactionIDs = allReportTransactions.map((transaction) => transaction.transactionID);
    if (allTransactionIDs.length !== transactionIDList.length) {
        reportIDParam = '-1';
    }
    const finalParameters = enhanceParameters(WRITE_COMMANDS.EXPORT_REPORT_TO_CSV, {
        reportID: reportIDParam,
        transactionIDList,
    });

    const formData = new FormData();
    for (const [key, value] of Object.entries(finalParameters)) {
        if (Array.isArray(value)) {
            formData.append(key, value.join(','));
        } else {
            formData.append(key, String(value));
        }
    }

    fileDownload(translate, ApiUtils.getCommandURL({command: WRITE_COMMANDS.EXPORT_REPORT_TO_CSV}), 'Expensify.csv', '', false, formData, CONST.NETWORK.METHOD.POST, onDownloadFailed);
}

function exportReportToPDF({reportID}: ExportReportPDFParams) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME}${reportID}`,
            value: null,
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME}${reportID}`,
            value: 'error',
        },
    ];
    const params = {
        reportID,
    } satisfies ExportReportPDFParams;

    API.write(WRITE_COMMANDS.EXPORT_REPORT_TO_PDF, params, {optimisticData, failureData});
}

function downloadReportPDF(fileName: string, reportName: string, translate: LocalizedTranslate, currentUserLogin: string) {
    const baseURL = addTrailingForwardSlash(getOldDotURLFromEnvironment(environment));
    const downloadFileName = `${reportName}.pdf`;
    setDownload(fileName, true);
    const pdfURL = `${baseURL}secure?secureType=pdfreport&filename=${encodeURIComponent(fileName)}&downloadName=${encodeURIComponent(downloadFileName)}&email=${encodeURIComponent(
        currentUserLogin,
    )}`;
    fileDownload(translate, addEncryptedAuthTokenToURL(pdfURL, true), downloadFileName, '', Browser.isMobileSafari()).then(() => setDownload(fileName, false));
}

function setDeleteTransactionNavigateBackUrl(url: string) {
    Onyx.set(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL, url);
}

function clearDeleteTransactionNavigateBackUrl() {
    Onyx.merge(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL, null);
}

/** Deletes a report and un-reports all transactions on the report along with its reportActions, any linked reports and any linked IOU report actions. */
function deleteAppReport(
    reportID: string | undefined,
    currentUserEmailParam: string,
    currentUserAccountIDParam: number,
    reportTransactions: Record<string, Transaction>,
    allTransactionViolations: OnyxCollection<TransactionViolations>,
    bankAccountList: OnyxEntry<BankAccountList>,
) {
    if (!reportID) {
        Log.warn('[Report] deleteReport called with no reportID');
        return;
    }
    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    > = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>
    > = [];

    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

    let selfDMReportID = findSelfDMReportID();
    let selfDMReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`];
    let createdAction: ReportAction;
    let selfDMParameters: SelfDMParameters = {};

    if (!selfDMReport) {
        const currentTime = DateUtils.getDBTime();
        selfDMReport = buildOptimisticSelfDMReport(currentTime);
        selfDMReportID = selfDMReport.reportID;
        createdAction = buildOptimisticCreatedReportAction(currentUserEmailParam ?? '', currentTime);
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
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${selfDMReport.reportID}`,
                value: {
                    isOptimisticReport: true,
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
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${selfDMReport.reportID}`,
                value: {
                    isOptimisticReport: false,
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

    // 1. Get all report transactions
    const reportActionsForReport = allReportActions?.[reportID];
    const transactionIDToReportActionAndThreadData: Record<string, TransactionThreadInfo> = {};

    for (const reportAction of Object.values(reportActionsForReport ?? {})) {
        if (!ReportActionsUtils.isMoneyRequestAction(reportAction)) {
            continue;
        }

        if (ReportActionsUtils.isDeletedAction(reportAction)) {
            continue;
        }

        const originalMessage = ReportActionsUtils.getOriginalMessage(reportAction);
        if (originalMessage?.type !== CONST.IOU.REPORT_ACTION_TYPE.CREATE && originalMessage?.type !== CONST.IOU.REPORT_ACTION_TYPE.TRACK) {
            continue;
        }

        const transactionID = ReportActionsUtils.getOriginalMessage(reportAction)?.IOUTransactionID;
        const childReportID = reportAction.childReportID;
        const newReportActionID = rand64();

        // 1. Update the transaction and its violations
        if (transactionID) {
            const transaction = reportTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
            const transactionViolations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];

            optimisticData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                    value: {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, comment: {hold: null}},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                    value: null,
                },
            );

            failureData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                    value: {reportID: transaction?.reportID, comment: {hold: transaction?.comment?.hold}},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                    value: transactionViolations,
                },
            );

            if (isOnHold(transaction)) {
                const unHoldAction = buildOptimisticUnHoldReportAction();
                optimisticData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`,
                    value: {[unHoldAction.reportActionID]: unHoldAction},
                });

                successData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`,
                    value: {[unHoldAction.reportActionID]: {pendingAction: null}},
                });

                failureData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`,
                    value: {[unHoldAction.reportActionID]: null},
                });

                transactionIDToReportActionAndThreadData[transactionID] = {
                    ...transactionIDToReportActionAndThreadData[transactionID],
                    unholdReportActionID: unHoldAction.reportActionID,
                };
            }
        }

        // 2. Move the report action to self DM
        const updatedReportAction = {
            ...reportAction,
            originalMessage: {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                ...reportAction.originalMessage,
                IOUReportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                type: CONST.IOU.TYPE.TRACK,
            },
            reportActionID: newReportActionID,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReportID}`,
            value: {[newReportActionID]: updatedReportAction},
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReportID}`,
            value: {[newReportActionID]: {pendingAction: null}},
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReportID}`,
            value: {[newReportActionID]: null},
        });

        // 3. Update transaction thread
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${childReportID}`,
                value: {
                    parentReportActionID: newReportActionID,
                    parentReportID: selfDMReportID,
                    chatReportID: selfDMReportID,
                    policyID: CONST.POLICY.ID_FAKE,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`,
                value: {
                    [newReportActionID]: {
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        originalMessage: {
                            IOUTransactionID: transactionID,
                            movedToReportID: selfDMReportID,
                        },
                    },
                },
            },
        );

        // 4. Add UNREPORTED_TRANSACTION report action
        const unreportedAction = buildOptimisticUnreportedTransactionAction(childReportID, reportID);

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`,
            value: {[unreportedAction.reportActionID]: unreportedAction},
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`,
            value: {[unreportedAction.reportActionID]: {pendingAction: null}},
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`,
            value: {[unreportedAction.reportActionID]: null},
        });

        if (transactionID) {
            transactionIDToReportActionAndThreadData[transactionID] = {
                ...transactionIDToReportActionAndThreadData[transactionID],
                moneyRequestPreviewReportActionID: newReportActionID,
                movedReportActionID: unreportedAction?.reportActionID,
            };
        }
    }

    // 6. Delete report actions on the report
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        value: null,
    });

    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        value: reportActionsForReport,
    });

    // 7. Mark the iouReport as being deleted and then delete it
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        value: {
            pendingFields: {
                preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            },
        },
    });

    successData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        value: null,
    });

    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
    failureData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        value: report,
    });

    // 8. Mark chat report preview action as deleted
    const reportActionID = report?.parentReportActionID;
    const parentReportID = report?.parentReportID;
    const parentReportAction = parentReportID && reportActionID ? allReportActions?.[parentReportID]?.[reportActionID] : undefined;

    if (reportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            },
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {
                [reportActionID]: {
                    ...parentReportAction,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericDeleteFailureMessage'),
                },
            },
        });
    }

    const chatReport = getReportOrDraftReport(report?.parentReportID);
    if (chatReport) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`,
            value: {
                hasOutstandingChildRequest: hasOutstandingChildRequest(
                    chatReport,
                    report?.reportID,
                    currentUserEmailParam,
                    currentUserAccountIDParam,
                    allTransactionViolations,
                    bankAccountList,
                ),
            },
        });
    }

    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`,
        value: {hasOutstandingChildRequest: report?.hasOutstandingChildRequest},
    });

    const parameters: DeleteAppReportParams = {
        reportID,
        transactionIDToReportActionAndThreadData: JSON.stringify(transactionIDToReportActionAndThreadData),
        selfDMReportID: selfDMParameters.reportID,
        selfDMCreatedReportActionID: selfDMParameters.createdReportActionID,
    };

    API.write(WRITE_COMMANDS.DELETE_APP_REPORT, parameters, {optimisticData, successData, failureData});
}

/**
 * Moves an IOU report to a policy by converting it to an expense report
 */
function moveIOUReportToPolicy(
    iouReport: OnyxEntry<Report>,
    policy: Policy,
    isFromSettlementButton?: boolean,
    reportTransactions: Transaction[] = [],
    isCustomReportNamesBetaEnabled?: boolean,
): {policyExpenseChatReportID?: string; useTemporaryOptimisticExpenseChatReportID: boolean} | undefined {
    // This flow only works for IOU reports
    if (!policy || !iouReport || !isIOUReportUsingReport(iouReport)) {
        return;
    }
    const reportID = iouReport.reportID;
    const isReimbursed = isReportManuallyReimbursed(iouReport);

    // We do not want to create negative amount expenses
    if (!isReimbursed && ReportActionsUtils.hasRequestFromCurrentAccount(reportID, iouReport.managerID ?? CONST.DEFAULT_NUMBER_ID) && !isFromSettlementButton) {
        return;
    }

    const policyID = policy.id;
    const iouReportID = iouReport.reportID;
    const employeeAccountID = iouReport.ownerAccountID;
    const expenseChatReportId = getPolicyExpenseChat(employeeAccountID, policyID)?.reportID;
    const useTemporaryOptimisticExpenseChatReportID = !expenseChatReportId;
    const optimisticExpenseChatReportID = expenseChatReportId ?? generateReportID();

    const {optimisticData, successData, failureData, movedExpenseReportAction, movedReportAction} = convertIOUReportToExpenseReport(
        iouReport,
        policy,
        policyID,
        optimisticExpenseChatReportID,
        reportTransactions,
        isCustomReportNamesBetaEnabled,
    );

    const parameters: MoveIOUReportToExistingPolicyParams = {
        iouReportID,
        policyID,
        changePolicyReportActionID: movedExpenseReportAction.reportActionID,
        dmMovedReportActionID: movedReportAction.reportActionID,
        optimisticReportID: optimisticExpenseChatReportID,
    };

    API.write(WRITE_COMMANDS.MOVE_IOU_REPORT_TO_EXISTING_POLICY, parameters, {optimisticData, successData, failureData});
    return {policyExpenseChatReportID: optimisticExpenseChatReportID, useTemporaryOptimisticExpenseChatReportID};
}

/**
 * Moves an IOU report to a policy by converting it to an expense report and invites the submitter
 */
function moveIOUReportToPolicyAndInviteSubmitter(
    iouReport: OnyxEntry<Report>,
    policy: Policy,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    reportTransactions: Transaction[] = [],
    isCustomReportNamesBetaEnabled?: boolean,
): {policyExpenseChatReportID?: string} | undefined {
    if (!policy || !iouReport) {
        return;
    }

    const reportID = iouReport.reportID;
    const isPolicyAdmin = isPolicyAdminPolicyUtils(policy);
    const submitterAccountID = iouReport.ownerAccountID;
    const submitterEmail = PersonalDetailsUtils.getLoginByAccountID(submitterAccountID ?? CONST.DEFAULT_NUMBER_ID);
    const submitterLogin = PhoneNumber.addSMSDomainIfPhoneNumber(submitterEmail);
    const policyID = policy.id;

    // This flow only works for admins moving an IOU report to a policy where the submitter is NOT yet a member of the policy
    if (!isPolicyAdmin || !isIOUReportUsingReport(iouReport) || !submitterAccountID || !submitterEmail || isPolicyMember(policy, submitterLogin)) {
        return;
    }

    const isReimbursed = isReportManuallyReimbursed(iouReport);

    // We only allow moving IOU report to a policy if it doesn't have requests from multiple users, as we do not want to create negative amount expenses
    if (!isReimbursed && ReportActionsUtils.hasRequestFromCurrentAccount(reportID, iouReport.managerID ?? CONST.DEFAULT_NUMBER_ID)) {
        return;
    }

    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.POLICY
            | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
        >
    > = [];
    const successData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.POLICY
            | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
        >
    > = [];
    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.POLICY
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
        >
    > = [];

    // Optimistically add the submitter to the workspace and create a expense chat for them
    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;
    const invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs = {
        [submitterEmail]: submitterAccountID,
    };

    // Set up new member optimistic data
    const role = CONST.POLICY.ROLE.USER;

    // Get personal details onyx data (similar to addMembersToWorkspace)
    const {newAccountIDs, newLogins} = PersonalDetailsUtils.getNewAccountIDsAndLogins([submitterLogin], [submitterAccountID]);
    const newPersonalDetailsOnyxData = PersonalDetailsUtils.getPersonalDetailsOnyxDataForOptimisticUsers(newLogins, newAccountIDs, formatPhoneNumber);

    // Build announce room members data for the new member
    const announceRoomMembers = buildRoomMembersOnyxData(CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, policyID, [submitterAccountID]);

    // Create policy expense chat for the submitter
    const policyExpenseChats = createPolicyExpenseChats(policyID, invitedEmailsToAccountIDs);
    const optimisticPolicyExpenseChatReportID = policyExpenseChats.reportCreationData[submitterEmail].reportID;
    const optimisticPolicyExpenseChatCreatedReportActionID = policyExpenseChats.reportCreationData[submitterEmail].reportActionID;

    // Set up optimistic member state
    const optimisticMembersState: OnyxCollectionInputValue<PolicyEmployee> = {
        [submitterLogin]: {
            role,
            email: submitterLogin,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            submitsTo: getDefaultApprover(policy),
        },
    };

    const successMembersState: OnyxCollectionInputValue<PolicyEmployee> = {
        [submitterLogin]: {pendingAction: null},
    };

    const failureMembersState: OnyxCollectionInputValue<PolicyEmployee> = {
        [submitterLogin]: {
            errors: getMicroSecondOnyxErrorWithTranslationKey('workspace.people.error.genericAdd'),
        },
    };

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: policyKey,
        value: {
            employeeList: optimisticMembersState,
        },
    });

    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: policyKey,
        value: {
            employeeList: successMembersState,
        },
    });

    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: policyKey,
        value: {
            employeeList: failureMembersState,
        },
    });

    optimisticData.push(...(newPersonalDetailsOnyxData.optimisticData ?? []), ...policyExpenseChats.onyxOptimisticData, ...(announceRoomMembers.optimisticData ?? []));
    successData.push(...(newPersonalDetailsOnyxData.finallyData ?? []), ...policyExpenseChats.onyxSuccessData, ...(announceRoomMembers.successData ?? []));
    failureData.push(...policyExpenseChats.onyxFailureData, ...(announceRoomMembers.failureData ?? []));

    const {
        optimisticData: convertedOptimisticData,
        successData: convertedSuccessData,
        failureData: convertedFailureData,
        movedExpenseReportAction,
        movedReportAction,
    } = convertIOUReportToExpenseReport(iouReport, policy, policyID, optimisticPolicyExpenseChatReportID, reportTransactions, isCustomReportNamesBetaEnabled);

    optimisticData.push(...convertedOptimisticData);
    successData.push(...convertedSuccessData);
    failureData.push(...convertedFailureData);

    const parameters: MoveIOUReportToPolicyAndInviteSubmitterParams = {
        iouReportID: reportID,
        policyID,
        policyExpenseChatReportID: optimisticPolicyExpenseChatReportID ?? String(CONST.DEFAULT_NUMBER_ID),
        policyExpenseCreatedReportActionID: optimisticPolicyExpenseChatCreatedReportActionID ?? String(CONST.DEFAULT_NUMBER_ID),
        changePolicyReportActionID: movedExpenseReportAction.reportActionID,
        dmMovedReportActionID: movedReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.MOVE_IOU_REPORT_TO_POLICY_AND_INVITE_SUBMITTER, parameters, {optimisticData, successData, failureData});
    return {policyExpenseChatReportID: optimisticPolicyExpenseChatReportID};
}

function convertIOUReportToExpenseReport(
    iouReport: Report,
    policy: Policy,
    policyID: string,
    optimisticPolicyExpenseChatReportID: string,
    reportTransactions: Transaction[] = [],
    isCustomReportNamesBetaEnabled?: boolean,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];

    const expenseReport = {
        ...iouReport,
        chatReportID: optimisticPolicyExpenseChatReportID,
        policyID,
        policyName: policy.name,
        parentReportID: optimisticPolicyExpenseChatReportID,
        type: CONST.REPORT.TYPE.EXPENSE,
        total: -(iouReport?.total ?? 0),
    };

    const nextApproverAccountID = getNextApproverAccountID(iouReport, true);
    if (iouReport.managerID !== nextApproverAccountID) {
        expenseReport.stateNum = CONST.REPORT.STATE_NUM.OPEN;
        expenseReport.statusNum = CONST.REPORT.STATUS_NUM.OPEN;
        expenseReport.managerID = nextApproverAccountID;
    }

    // Only compute optimistic report name if the user is on the CUSTOM_REPORT_NAMES beta
    if (isCustomReportNamesBetaEnabled) {
        const titleReportField = getTitleReportField(getReportFieldsByPolicyID(policyID) ?? {});
        if (!!titleReportField && isPaidGroupPolicy(policy)) {
            // Convert transactions array to Record<string, Transaction> for FormulaContext
            const transactionsRecord: Record<string, Transaction> = {};
            for (const transaction of reportTransactions) {
                if (transaction?.transactionID) {
                    transactionsRecord[transaction.transactionID] = transaction;
                }
            }

            // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
            const Formula = require('@libs/Formula') as {compute: (formula?: string, context?: {report: Report; policy: Policy; allTransactions?: Record<string, Transaction>}) => string};
            const computedName = Formula.compute(titleReportField.defaultValue, {
                report: expenseReport,
                policy,
                allTransactions: transactionsRecord,
            });
            expenseReport.reportName = computedName ?? expenseReport.reportName;
        }
    }

    const reportID = iouReport.reportID;

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        value: expenseReport,
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        value: iouReport,
    });

    // For performance reasons, we are going to compose a merge collection data for transactions
    const transactionsOptimisticData: Record<string, Transaction> = {};
    const transactionFailureData: Record<string, Transaction> = {};
    for (const transaction of reportTransactions) {
        transactionsOptimisticData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = {
            ...transaction,
            amount: -transaction.amount,
            modifiedAmount: hasValidModifiedAmount(transaction) ? -Number(transaction.modifiedAmount) : '',
        };

        transactionFailureData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
    }

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

    // We need to move the report preview action from the DM to the expense chat.
    const oldChatReportID = iouReport.chatReportID;
    const reportPreviewActionID = iouReport.parentReportActionID;
    const reportPreview = !!oldChatReportID && !!reportPreviewActionID ? allReportActions?.[oldChatReportID]?.[reportPreviewActionID] : undefined;

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

        // Add the reportPreview action to expense chat
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticPolicyExpenseChatReportID}`,
            value: {[reportPreview.reportActionID]: {...reportPreview, childReportName: expenseReport.reportName, created: DateUtils.getDBTime()}},
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticPolicyExpenseChatReportID}`,
            value: {[reportPreview.reportActionID]: null},
        });
    }

    // Create MOVED report action and add it to the expense report which indicates to the user where the report has been moved
    const movedExpenseReportAction = buildOptimisticMovedReportAction(iouReport.policyID, policyID, optimisticPolicyExpenseChatReportID, reportID, policy.name, true);
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        value: {[movedExpenseReportAction.reportActionID]: movedExpenseReportAction},
    });
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        value: {
            [movedExpenseReportAction.reportActionID]: {
                ...movedExpenseReportAction,
                pendingAction: null,
            },
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        value: {[movedExpenseReportAction.reportActionID]: null},
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
            iouReportID: reportID,
        },
    });

    // Create the MOVED report action and add it to the DM chat which indicates to the user where the report has been moved
    const movedReportAction = buildOptimisticMovedReportAction(iouReport.policyID, policyID, optimisticPolicyExpenseChatReportID, reportID, policy.name);
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldChatReportID}`,
        value: {[movedReportAction.reportActionID]: movedReportAction},
    });
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldChatReportID}`,
        value: {[movedReportAction.reportActionID]: {pendingAction: null}},
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldChatReportID}`,
        value: {[movedReportAction.reportActionID]: null},
    });

    return {optimisticData, successData, failureData, movedExpenseReportAction, movedReportAction};
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
                [CONST.CHANGE_POLICY_TRAINING_MODAL]: {
                    timestamp: DateUtils.getDBTime(date.valueOf()),
                    dismissedMethod: 'click',
                },
            },
        },
    ];
    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
    API.write(WRITE_COMMANDS.DISMISS_PRODUCT_TRAINING, {name: CONST.CHANGE_POLICY_TRAINING_MODAL, dismissedMethod: 'click'}, {optimisticData});
}

/**
 * @private
 * Builds a map of parentReportID to child report IDs for efficient traversal.
 */
function buildReportIDToThreadsReportIDsMap(): Record<string, string[]> {
    const reportIDToThreadsReportIDsMap: Record<string, string[]> = {};
    for (const report of Object.values(allReports ?? {})) {
        if (!report?.parentReportID) {
            continue;
        }
        if (!reportIDToThreadsReportIDsMap[report.parentReportID]) {
            reportIDToThreadsReportIDsMap[report.parentReportID] = [];
        }
        reportIDToThreadsReportIDsMap[report.parentReportID].push(report.reportID);
    }
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
    for (const childReportID of childReportIDs) {
        updatePolicyIdForReportAndThreads(childReportID, policyID, reportIDToThreadsReportIDsMap, optimisticData, failureData);
    }
}

function navigateToTrainingModal(isChangePolicyTrainingModalDismissed: boolean, reportID: string) {
    if (isChangePolicyTrainingModalDismissed) {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => {
        Navigation.navigate(ROUTES.CHANGE_POLICY_EDUCATIONAL.getRoute(ROUTES.REPORT_WITH_ID.getRoute(reportID)));
    });
}

function buildOptimisticChangePolicyData(
    report: Report,
    policy: Policy,
    currentUserAccountID: number,
    email: string,
    hasViolationsParam: boolean,
    isASAPSubmitBetaEnabled: boolean,
    isReportLastVisibleArchived: boolean | undefined,
    reportNextStep?: ReportNextStepDeprecated,
    optimisticPolicyExpenseChatReport?: Report,
) {
    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.SNAPSHOT
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
        >
    > = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [];
    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
        >
    > = [];

    // 1. Optimistically set the policyID on the report (and all its threads) by:
    // 1.1 Preprocess reports to create a map of parentReportID to child reports list of reportIDs
    // 1.2 Recursively update the policyID of the report and all its child reports
    const reportID = report.reportID;
    const reportIDToThreadsReportIDsMap = buildReportIDToThreadsReportIDsMap();
    updatePolicyIdForReportAndThreads(reportID, policy.id, reportIDToThreadsReportIDsMap, optimisticData, failureData);

    // We reopen and reassign the report if the report is open/submitted and the manager is not a member of the new policy. This is to prevent the old manager from seeing a report that they can't action on.
    let newStatusNum = report?.statusNum;
    const isOpenOrSubmitted = isOpenExpenseReport(report) || isProcessingReport(report);
    const managerLogin = PersonalDetailsUtils.getLoginByAccountID(report.managerID ?? CONST.DEFAULT_NUMBER_ID);
    if (isOpenOrSubmitted && managerLogin && !isPolicyMember(policy, managerLogin)) {
        newStatusNum = CONST.REPORT.STATUS_NUM.OPEN;
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                managerID: getNextApproverAccountID(report, true),
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum: report.stateNum,
                statusNum: report.statusNum,
                managerID: report.managerID,
            },
        });
    }

    const isInstantSubmitEnabledLocal = isInstantSubmitEnabled(policy);
    const isSubmitAndCloseLocal = isSubmitAndClose(policy);
    const arePaymentsDisabled = policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
    if (isProcessingReport(report) && isInstantSubmitEnabledLocal && isSubmitAndCloseLocal && arePaymentsDisabled) {
        newStatusNum = CONST.REPORT.STATUS_NUM.CLOSED;
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum: report.stateNum,
                statusNum: report.statusNum,
            },
        });
    }

    if (newStatusNum != null && newStatusNum !== undefined) {
        // buildOptimisticNextStep is used in parallel
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const optimisticNextStepDeprecated = buildNextStepNew({
            report: {...report, policyID: policy.id},
            predictedNextStatus: newStatusNum,
            policy,
            currentUserAccountIDParam: currentUserAccountID,
            currentUserEmailParam: email,
            hasViolations: hasViolationsParam,
            isASAPSubmitBetaEnabled,
        });
        const optimisticNextStep = buildOptimisticNextStep({
            report: {...report, policyID: policy.id},
            predictedNextStatus: newStatusNum,
            policy,
            currentUserAccountIDParam: currentUserAccountID,
            currentUserEmailParam: email,
            hasViolations: hasViolationsParam,
            isASAPSubmitBetaEnabled,
        });

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`,
            value: optimisticNextStepDeprecated,
        });
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                nextStep: optimisticNextStep,
                pendingFields: {
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingFields: {
                    nextStep: null,
                },
            },
        });

        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`,
            value: reportNextStep,
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                nextStep: report.nextStep ?? null,
                pendingFields: {
                    nextStep: null,
                },
            },
        });
    }

    let shouldSetOutstandingChildRequest = false;
    if (newStatusNum === CONST.REPORT.STATUS_NUM.OPEN || isOpenOrSubmitted) {
        if (newStatusNum === CONST.REPORT.STATUS_NUM.OPEN) {
            shouldSetOutstandingChildRequest = isCurrentUserSubmitter(report);
        } else if (isProcessingReport(report)) {
            shouldSetOutstandingChildRequest = report.managerID === currentUserAccountID;
        }
    }

    // 2. If this is a thread, we have to mark the parent report preview action as deleted to properly update the UI
    if (report.parentReportID && report.parentReportActionID) {
        const oldWorkspaceChatReportID = report.parentReportID;
        const oldReportPreviewActionID = report.parentReportActionID;
        const oldReportPreviewAction = allReportActions?.[oldWorkspaceChatReportID]?.[oldReportPreviewActionID];
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
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldWorkspaceChatReportID}`,
            value: {[oldReportPreviewActionID]: updatedReportPreviewAction},
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldWorkspaceChatReportID}`,
            value: {
                [oldReportPreviewActionID]: {
                    ...oldReportPreviewAction,
                    originalMessage: {
                        deleted: null,
                    },
                    ...(!Array.isArray(oldReportPreviewAction?.message) && {
                        message: {
                            deleted: null,
                        },
                    }),
                },
            },
        });

        // Update the expense chat report
        const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oldWorkspaceChatReportID}`];
        const lastMessageText = getLastVisibleMessage(oldWorkspaceChatReportID, isReportLastVisibleArchived, {
            [oldReportPreviewActionID]: updatedReportPreviewAction as ReportAction,
        })?.lastMessageText;
        const lastVisibleActionCreated = getReportLastMessage(oldWorkspaceChatReportID, isReportLastVisibleArchived, {
            [oldReportPreviewActionID]: updatedReportPreviewAction as ReportAction,
        })?.lastVisibleActionCreated;

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${oldWorkspaceChatReportID}`,
            value: {
                hasOutstandingChildRequest: false,
                iouReportID: null,
                lastMessageText,
                lastVisibleActionCreated,
            },
        });
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${oldWorkspaceChatReportID}`,
            value: chatReport,
        });
    }

    // 3. Optimistically create a new REPORT_PREVIEW reportAction with the newReportPreviewActionID
    // and set it as a parent of the moved report
    const policyExpenseChat = optimisticPolicyExpenseChatReport ?? getPolicyExpenseChat(report.ownerAccountID, policy.id);
    const optimisticReportPreviewAction = buildOptimisticReportPreview(policyExpenseChat, report);

    const newPolicyExpenseChatReportID = policyExpenseChat?.reportID;

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${newPolicyExpenseChatReportID}`,
        value: {[optimisticReportPreviewAction.reportActionID]: optimisticReportPreviewAction},
    });
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${newPolicyExpenseChatReportID}`,
        value: {
            [optimisticReportPreviewAction.reportActionID]: {
                pendingAction: null,
                isOptimisticAction: false,
            },
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${newPolicyExpenseChatReportID}`,
        value: {[optimisticReportPreviewAction.reportActionID]: null},
    });

    // Set the new report preview action as a parent of the moved report,
    // and set the parentReportID on the moved report as the expense chat reportID
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        value: {parentReportActionID: optimisticReportPreviewAction.reportActionID, parentReportID: newPolicyExpenseChatReportID, chatReportID: newPolicyExpenseChatReportID},
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        value: {parentReportActionID: report.parentReportActionID, parentReportID: report.parentReportID, chatReportID: report.chatReportID},
    });

    // Set lastVisibleActionCreated
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${newPolicyExpenseChatReportID}`,
        value: {
            lastVisibleActionCreated: optimisticReportPreviewAction?.created,
            ...(shouldSetOutstandingChildRequest ? {hasOutstandingChildRequest: true} : {}),
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${newPolicyExpenseChatReportID}`,
        value: {lastVisibleActionCreated: policyExpenseChat?.lastVisibleActionCreated, hasOutstandingChildRequest: policyExpenseChat?.hasOutstandingChildRequest},
    });

    // 4. Optimistically create a CHANGE_POLICY reportAction on the report using the reportActionID
    const optimisticMovedReportAction = buildOptimisticChangePolicyReportAction(report.policyID, policy.id);
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        value: {[optimisticMovedReportAction.reportActionID]: optimisticMovedReportAction},
    });
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        value: {
            [optimisticMovedReportAction.reportActionID]: {
                pendingAction: null,
                errors: null,
            },
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        value: {
            [optimisticMovedReportAction.reportActionID]: {
                errors: getMicroSecondTranslationErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
    });

    const currentSearchQueryJSON = getCurrentSearchQueryJSON();

    // Search data might not have the new policy data so we should add it optimistically.
    if (policy && currentSearchQueryJSON) {
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}` as const,
            value: {
                data: {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy},
            },
        });
    }

    // 5. Make sure the expense report is not archived
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
        value: {
            private_isArchived: null,
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
        value: {
            private_isArchived: DateUtils.getDBTime(),
        },
    });

    // 6. Handle transactions when moving to a workspace with a different currency
    // Clear convertedAmount (which is calculated for the old workspace currency) and add pendingAction for proper UI feedback
    // Only clear for transactions that don't match the destination currency - matching transactions can keep their values
    const sourceCurrency = report.currency;
    const destinationCurrency = policy.outputCurrency;
    const transactions = getReportTransactions(reportID);

    for (const transaction of transactions) {
        if (!shouldClearConvertedAmount(transaction, sourceCurrency, destinationCurrency)) {
            continue;
        }

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                convertedAmount: null,
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                pendingAction: null,
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                pendingAction: transaction.pendingAction ?? null,
                convertedAmount: transaction.convertedAmount,
            },
        });
    }

    // 7. Update report totals when source and destination currencies differ
    // Only include transactions that match the destination currency (their amounts can be used directly)
    if (sourceCurrency && destinationCurrency && sourceCurrency !== destinationCurrency) {
        let newTotal = 0;
        let newNonReimbursableTotal = 0;
        let newUnheldNonReimbursableTotal = 0;

        for (const transaction of transactions) {
            const transactionCurrency = getCurrency(transaction);

            // Only include transactions that match the destination currency
            if (transactionCurrency === destinationCurrency) {
                const transactionAmount = getAmount(transaction, true);
                newTotal -= transactionAmount;
                if (!transaction.reimbursable) {
                    newNonReimbursableTotal -= transactionAmount;
                }
                if (!transaction.reimbursable || isOnHold(transaction)) {
                    newUnheldNonReimbursableTotal -= transactionAmount;
                }
            }
        }

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                currency: destinationCurrency,
                total: newTotal,
                nonReimbursableTotal: newNonReimbursableTotal,
                unheldNonReimbursableTotal: newUnheldNonReimbursableTotal,
                pendingFields: {
                    ...(report.pendingFields ?? {}),
                    total: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingFields: {
                    total: null,
                },
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                currency: report.currency,
                total: report.total,
                nonReimbursableTotal: report.nonReimbursableTotal,
                unheldNonReimbursableTotal: report.unheldNonReimbursableTotal,
                pendingFields: {
                    ...(report.pendingFields ?? {}),
                    total: null,
                },
            },
        });
    }

    return {optimisticData, successData, failureData, optimisticReportPreviewAction, optimisticMovedReportAction};
}

/**
 * Changes the policy of a report and all its child reports, and moves the report to the new policy's expense chat.
 */
function changeReportPolicy(
    report: Report,
    policy: Policy,
    accountID: number,
    email: string,
    hasViolationsParam: boolean,
    isChangePolicyTrainingModalDismissed: boolean,
    isASAPSubmitBetaEnabled: boolean,
    reportNextStep?: ReportNextStepDeprecated,
    isReportLastVisibleArchived = false,
) {
    if (!report || !policy || report.policyID === policy.id || !isExpenseReport(report)) {
        return;
    }

    const {optimisticData, successData, failureData, optimisticReportPreviewAction, optimisticMovedReportAction} = buildOptimisticChangePolicyData(
        report,
        policy,
        accountID,
        email,
        hasViolationsParam,
        isASAPSubmitBetaEnabled,
        isReportLastVisibleArchived,
        reportNextStep,
    );

    const params = {
        reportID: report.reportID,
        policyID: policy.id,
        reportPreviewReportActionID: optimisticReportPreviewAction.reportActionID,
        changePolicyReportActionID: optimisticMovedReportAction.reportActionID,
    };
    API.write(WRITE_COMMANDS.CHANGE_REPORT_POLICY, params, {optimisticData, successData, failureData});

    // If the dismissedProductTraining.changeReportModal is not set,
    // navigate to CHANGE_POLICY_EDUCATIONAL and a backTo param for the report page.
    navigateToTrainingModal(isChangePolicyTrainingModalDismissed, report.reportID);
}

/**
 * Invites the submitter to the new report policy, changes the policy of a report and all its child reports, and moves the report to the new policy's expense chat
 */
function changeReportPolicyAndInviteSubmitter(
    report: Report,
    policy: Policy,
    currentUserAccountID: number,
    email: string,
    hasViolationsParam: boolean,
    isChangePolicyTrainingModalDismissed: boolean,
    isASAPSubmitBetaEnabled: boolean,
    employeeList: PolicyEmployeeList | undefined,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    isReportLastVisibleArchived: boolean | undefined,
) {
    if (!report.reportID || !policy?.id || report.policyID === policy.id || !isExpenseReport(report) || !report.ownerAccountID) {
        return;
    }

    const submitterEmail = PersonalDetailsUtils.getLoginByAccountID(report.ownerAccountID);

    if (!submitterEmail) {
        return;
    }
    const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(employeeList, false, false));
    const {optimisticData, successData, failureData, membersChats} = buildAddMembersToWorkspaceOnyxData(
        {[submitterEmail]: report.ownerAccountID},
        policy.id,
        policyMemberAccountIDs,
        CONST.POLICY.ROLE.USER,
        formatPhoneNumber,
        CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
    );
    const optimisticPolicyExpenseChatReportID = membersChats.reportCreationData[submitterEmail].reportID;
    const optimisticPolicyExpenseChatCreatedReportActionID = membersChats.reportCreationData[submitterEmail].reportActionID;

    if (!optimisticPolicyExpenseChatReportID) {
        return;
    }

    const {
        optimisticData: optimisticChangePolicyData,
        successData: successChangePolicyData,
        failureData: failureChangePolicyData,
        optimisticReportPreviewAction,
        optimisticMovedReportAction,
    } = buildOptimisticChangePolicyData(
        report,
        policy,
        currentUserAccountID,
        email,
        hasViolationsParam,
        isASAPSubmitBetaEnabled,
        isReportLastVisibleArchived,
        undefined,
        membersChats.reportCreationData[submitterEmail],
    );
    optimisticData.push(...optimisticChangePolicyData);
    successData.push(...successChangePolicyData);
    failureData.push(...failureChangePolicyData);

    const params = {
        reportID: report.reportID,
        policyID: policy.id,
        reportPreviewReportActionID: optimisticReportPreviewAction.reportActionID,
        changePolicyReportActionID: optimisticMovedReportAction.reportActionID,
        policyExpenseChatReportID: optimisticPolicyExpenseChatReportID,
        policyExpenseCreatedReportActionID: optimisticPolicyExpenseChatCreatedReportActionID,
    };
    API.write(WRITE_COMMANDS.CHANGE_REPORT_POLICY_AND_INVITE_SUBMITTER, params, {optimisticData, successData, failureData});

    // If the dismissedProductTraining.changeReportModal is not set,
    // navigate to CHANGE_POLICY_EDUCATIONAL and a backTo param for the report page.
    navigateToTrainingModal(isChangePolicyTrainingModalDismissed, report.reportID);
}

/**
 * Generic helper function to resolve Concierge AI-suggested options (category or description)
 * @param reportID - The report ID where the comment should be added and the report action should be updated
 * @param notifyReportID - The report ID we should notify for new actions
 * @param reportActionID - The specific report action ID to update
 * @param selectedValue - The value selected by the user
 * @param timezoneParam - The user's timezone
 * @param selectedField - The field to update in the original message ('selectedCategory' or 'selectedDescription')
 * @param ancestors - Array of ancestor reports for proper threading
 */
function resolveConciergeOptions(
    report: OnyxEntry<Report>,
    notifyReportID: string | undefined,
    reportActionID: string | undefined,
    selectedValue: string,
    timezoneParam: Timezone,
    selectedField: 'selectedCategory' | 'selectedDescription',
    ancestors: Ancestor[] = [],
) {
    if (!report?.reportID || !reportActionID) {
        return;
    }

    const reportID = report.reportID;
    addComment(report, notifyReportID ?? reportID, ancestors, selectedValue, timezoneParam);

    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        [reportActionID]: {
            originalMessage: {
                [selectedField]: selectedValue,
            },
        },
    } as Partial<ReportActions>);
}

/**
 * Resolves Concierge category options by adding a comment and updating the report action
 * @param reportID - The report ID where the comment should be added and the report action should be updated
 * @param notifyReportID - The report ID we should notify for new actions. This is usually the same as reportID, except when adding a comment to an expense report with a single transaction thread, in which case we want to notify the parent expense report.
 * @param reportActionID - The specific report action ID to update
 * @param selectedCategory - The category selected by the user
 * @param timezoneParam - The user's timezone
 * @param ancestors - Array of ancestor reports for proper threading
 */
function resolveConciergeCategoryOptions(
    report: OnyxEntry<Report>,
    notifyReportID: string | undefined,
    reportActionID: string | undefined,
    selectedCategory: string,
    timezoneParam: Timezone,
    ancestors: Ancestor[] = [],
) {
    resolveConciergeOptions(report, notifyReportID, reportActionID, selectedCategory, timezoneParam, 'selectedCategory', ancestors);
}

/**
 * Resolves Concierge description options by adding a comment and updating the report action
 * @param reportID - The report ID where the comment should be added and the report action should be updated
 * @param notifyReportID - The report ID we should notify for new actions. This is usually the same as reportID, except when adding a comment to an expense report with a single transaction thread, in which case we want to notify the parent expense report.
 * @param reportActionID - The specific report action ID to update
 * @param selectedDescription - The description selected by the user
 * @param timezoneParam - The user's timezone
 * @param ancestors - Array of ancestor reports for proper threading
 */
function resolveConciergeDescriptionOptions(
    report: OnyxEntry<Report>,
    notifyReportID: string | undefined,
    reportActionID: string | undefined,
    selectedDescription: string,
    timezoneParam: Timezone,
    ancestors: Ancestor[] = [],
) {
    resolveConciergeOptions(report, notifyReportID, reportActionID, selectedDescription, timezoneParam, 'selectedDescription', ancestors);
}

/**
 * Enhances existing transaction thread reports with additional context for navigation
 *
 * This is NOT the same as createTransactionThreadReport - this function only adds missing
 * context fields to existing transaction threads, while createTransactionThreadReport
 * creates entirely new transaction threads with comprehensive data.
 *
 * Use this when navigating to existing transaction threads that need additional context
 * like policyID, parentReportID, etc. for proper threading and navigation.
 */
function setOptimisticTransactionThread(reportID?: string, parentReportID?: string, parentReportActionID?: string, policyID?: string) {
    if (!reportID) {
        return;
    }

    // Use merge with selective updates to avoid overwriting existing comprehensive data
    // This will only add/update the specified fields without overwriting existing data
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        reportID,
        policyID,
        parentReportID,
        parentReportActionID,
        chatReportID: parentReportID,
        type: CONST.REPORT.TYPE.CHAT,
        // Add additional fields to ensure complete report structure
        lastReadTime: DateUtils.getDBTime(),
        lastVisibleActionCreated: DateUtils.getDBTime(),
    });
}

export type {Video, GuidedSetupData, TaskForParameters, IntroSelected};

export {
    addAttachmentWithComment,
    addComment,
    addPolicyReport,
    broadcastUserIsLeavingRoom,
    broadcastUserIsTyping,
    buildOptimisticChangePolicyData,
    buildOptimisticResolvedFollowups,
    clearAddRoomMemberError,
    clearAvatarErrors,
    clearDeleteTransactionNavigateBackUrl,
    clearGroupChat,
    clearIOUError,
    clearNewRoomFormError,
    setNewRoomFormLoading,
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
    doneCheckingPublicRoom,
    downloadReportPDF,
    editReportComment,
    explain,
    expandURLPreview,
    exportReportToCSV,
    exportReportToPDF,
    exportToIntegration,
    flagComment,
    getMostRecentReportID,
    getNewerActions,
    getOlderActions,
    getReportPrivateNote,
    handleUserDeletedLinksInHtml,
    hasErrorInPrivateNotes,
    inviteToGroupChat,
    buildInviteToRoomOnyxData,
    inviteToRoom,
    inviteToRoomAction,
    joinRoom,
    leaveGroupChat,
    leaveRoom,
    markAsManuallyExported,
    markCommentAsUnread,
    navigateToAndOpenChildReport,
    createChildReport,
    navigateToAndOpenReport,
    navigateToAndOpenReportWithAccountIDs,
    navigateToConciergeChat,
    navigateToConciergeChatAndDeleteReport,
    clearCreateChatError,
    notifyNewAction,
    openReport,
    openRoomMembersPage,
    readNewestAction,
    markAllMessagesAsRead,
    removeFromGroupChat,
    removeFromRoom,
    resolveActionableMentionWhisper,
    resolveActionableMentionConfirmWhisper,
    resolveActionableReportMentionWhisper,
    resolveConciergeCategoryOptions,
    resolveConciergeDescriptionOptions,
    savePrivateNotesDraft,
    saveReportActionDraft,
    saveReportDraftComment,
    searchInServer,
    fetchOutstandingReports,
    setDeleteTransactionNavigateBackUrl,
    setGroupDraft,
    setIsComposerFullSize,
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
    updatePolicyRoomAvatar,
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
    deleteAppReport,
    getOptimisticChatReport,
    saveReportDraft,
    moveIOUReportToPolicy,
    moveIOUReportToPolicyAndInviteSubmitter,
    dismissChangePolicyModal,
    changeReportPolicy,
    changeReportPolicyAndInviteSubmitter,
    removeFailedReport,
    createTransactionThreadReport,
    openUnreportedExpense,
    optimisticReportLastData,
    setOptimisticTransactionThread,
    prepareOnyxDataForCleanUpOptimisticParticipants,
};
