"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePrivateNotes = void 0;
exports.addAttachment = addAttachment;
exports.addComment = addComment;
exports.addPolicyReport = addPolicyReport;
exports.broadcastUserIsLeavingRoom = broadcastUserIsLeavingRoom;
exports.broadcastUserIsTyping = broadcastUserIsTyping;
exports.clearAddRoomMemberError = clearAddRoomMemberError;
exports.clearAvatarErrors = clearAvatarErrors;
exports.clearDeleteTransactionNavigateBackUrl = clearDeleteTransactionNavigateBackUrl;
exports.clearGroupChat = clearGroupChat;
exports.clearIOUError = clearIOUError;
exports.clearNewRoomFormError = clearNewRoomFormError;
exports.setNewRoomFormLoading = setNewRoomFormLoading;
exports.clearPolicyRoomNameErrors = clearPolicyRoomNameErrors;
exports.clearPrivateNotesError = clearPrivateNotesError;
exports.clearReportFieldKeyErrors = clearReportFieldKeyErrors;
exports.completeOnboarding = completeOnboarding;
exports.createNewReport = createNewReport;
exports.deleteReport = deleteReport;
exports.deleteReportActionDraft = deleteReportActionDraft;
exports.deleteReportComment = deleteReportComment;
exports.deleteReportField = deleteReportField;
exports.dismissTrackExpenseActionableWhisper = dismissTrackExpenseActionableWhisper;
exports.doneCheckingPublicRoom = doneCheckingPublicRoom;
exports.downloadReportPDF = downloadReportPDF;
exports.editReportComment = editReportComment;
exports.expandURLPreview = expandURLPreview;
exports.exportReportToCSV = exportReportToCSV;
exports.exportReportToPDF = exportReportToPDF;
exports.exportToIntegration = exportToIntegration;
exports.flagComment = flagComment;
exports.getCurrentUserAccountID = getCurrentUserAccountID;
exports.getCurrentUserEmail = getCurrentUserEmail;
exports.getDraftPrivateNote = getDraftPrivateNote;
exports.getMostRecentReportID = getMostRecentReportID;
exports.getNewerActions = getNewerActions;
exports.getOlderActions = getOlderActions;
exports.getReportPrivateNote = getReportPrivateNote;
exports.handleReportChanged = handleReportChanged;
exports.handleUserDeletedLinksInHtml = handleUserDeletedLinksInHtml;
exports.hasErrorInPrivateNotes = hasErrorInPrivateNotes;
exports.inviteToGroupChat = inviteToGroupChat;
exports.buildInviteToRoomOnyxData = buildInviteToRoomOnyxData;
exports.inviteToRoom = inviteToRoom;
exports.joinRoom = joinRoom;
exports.leaveGroupChat = leaveGroupChat;
exports.leaveRoom = leaveRoom;
exports.markAsManuallyExported = markAsManuallyExported;
exports.markCommentAsUnread = markCommentAsUnread;
exports.navigateToAndOpenChildReport = navigateToAndOpenChildReport;
exports.navigateToAndOpenReport = navigateToAndOpenReport;
exports.navigateToAndOpenReportWithAccountIDs = navigateToAndOpenReportWithAccountIDs;
exports.navigateToConciergeChat = navigateToConciergeChat;
exports.navigateToConciergeChatAndDeleteReport = navigateToConciergeChatAndDeleteReport;
exports.clearCreateChatError = clearCreateChatError;
exports.notifyNewAction = notifyNewAction;
exports.openLastOpenedPublicRoom = openLastOpenedPublicRoom;
exports.openReport = openReport;
exports.openReportFromDeepLink = openReportFromDeepLink;
exports.openRoomMembersPage = openRoomMembersPage;
exports.readNewestAction = readNewestAction;
exports.markAllMessagesAsRead = markAllMessagesAsRead;
exports.removeFromGroupChat = removeFromGroupChat;
exports.removeFromRoom = removeFromRoom;
exports.resolveActionableMentionWhisper = resolveActionableMentionWhisper;
exports.resolveActionableReportMentionWhisper = resolveActionableReportMentionWhisper;
exports.resolveConciergeCategoryOptions = resolveConciergeCategoryOptions;
exports.savePrivateNotesDraft = savePrivateNotesDraft;
exports.saveReportActionDraft = saveReportActionDraft;
exports.saveReportDraftComment = saveReportDraftComment;
exports.searchInServer = searchInServer;
exports.setDeleteTransactionNavigateBackUrl = setDeleteTransactionNavigateBackUrl;
exports.setGroupDraft = setGroupDraft;
exports.setIsComposerFullSize = setIsComposerFullSize;
exports.setLastOpenedPublicRoom = setLastOpenedPublicRoom;
exports.shouldShowReportActionNotification = shouldShowReportActionNotification;
exports.showReportActionNotification = showReportActionNotification;
exports.startNewChat = startNewChat;
exports.subscribeToNewActionEvent = subscribeToNewActionEvent;
exports.subscribeToReportLeavingEvents = subscribeToReportLeavingEvents;
exports.subscribeToReportTypingEvents = subscribeToReportTypingEvents;
exports.toggleEmojiReaction = toggleEmojiReaction;
exports.togglePinnedState = togglePinnedState;
exports.toggleSubscribeToChildReport = toggleSubscribeToChildReport;
exports.unsubscribeFromLeavingRoomReportChannel = unsubscribeFromLeavingRoomReportChannel;
exports.unsubscribeFromReportChannel = unsubscribeFromReportChannel;
exports.updateDescription = updateDescription;
exports.updateGroupChatAvatar = updateGroupChatAvatar;
exports.updateGroupChatMemberRoles = updateGroupChatMemberRoles;
exports.updateChatName = updateChatName;
exports.updateLastVisitTime = updateLastVisitTime;
exports.updateLoadingInitialReportAction = updateLoadingInitialReportAction;
exports.updateNotificationPreference = updateNotificationPreference;
exports.updatePolicyRoomName = updatePolicyRoomName;
exports.updateReportField = updateReportField;
exports.updateReportName = updateReportName;
exports.updateRoomVisibility = updateRoomVisibility;
exports.updateWriteCapability = updateWriteCapability;
exports.deleteAppReport = deleteAppReport;
exports.getOptimisticChatReport = getOptimisticChatReport;
exports.saveReportDraft = saveReportDraft;
exports.moveIOUReportToPolicy = moveIOUReportToPolicy;
exports.moveIOUReportToPolicyAndInviteSubmitter = moveIOUReportToPolicyAndInviteSubmitter;
exports.dismissChangePolicyModal = dismissChangePolicyModal;
exports.changeReportPolicy = changeReportPolicy;
exports.changeReportPolicyAndInviteSubmitter = changeReportPolicyAndInviteSubmitter;
exports.removeFailedReport = removeFailedReport;
exports.openUnreportedExpense = openUnreportedExpense;
var native_1 = require("@react-navigation/native");
var date_fns_tz_1 = require("date-fns-tz");
var expensify_common_1 = require("expensify-common");
var isEmpty_1 = require("lodash/isEmpty");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var ActiveClientManager = require("@libs/ActiveClientManager");
var addEncryptedAuthTokenToURL_1 = require("@libs/addEncryptedAuthTokenToURL");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ApiUtils = require("@libs/ApiUtils");
var CollectionUtils = require("@libs/CollectionUtils");
var DateUtils_1 = require("@libs/DateUtils");
var DraftCommentUtils_1 = require("@libs/DraftCommentUtils");
var EmojiUtils = require("@libs/EmojiUtils");
var Environment = require("@libs/Environment/Environment");
var Environment_1 = require("@libs/Environment/Environment");
var getEnvironment_1 = require("@libs/Environment/getEnvironment");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var fileDownload_1 = require("@libs/fileDownload");
var getIsNarrowLayout_1 = require("@libs/getIsNarrowLayout");
var HttpUtils_1 = require("@libs/HttpUtils");
var isPublicScreenRoute_1 = require("@libs/isPublicScreenRoute");
var Localize = require("@libs/Localize");
var Log_1 = require("@libs/Log");
var Pagination_1 = require("@libs/Middleware/Pagination");
var isNavigatorName_1 = require("@libs/Navigation/helpers/isNavigatorName");
var normalizePath_1 = require("@libs/Navigation/helpers/normalizePath");
var shouldOpenOnAdminRoom_1 = require("@libs/Navigation/helpers/shouldOpenOnAdminRoom");
var Navigation_1 = require("@libs/Navigation/Navigation");
var enhanceParameters_1 = require("@libs/Network/enhanceParameters");
var NextStepUtils_1 = require("@libs/NextStepUtils");
var LocalNotification_1 = require("@libs/Notification/LocalNotification");
var NumberUtils_1 = require("@libs/NumberUtils");
var OnboardingUtils_1 = require("@libs/OnboardingUtils");
var Parser_1 = require("@libs/Parser");
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
var PhoneNumber = require("@libs/PhoneNumber");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var processReportIDDeeplink_1 = require("@libs/processReportIDDeeplink");
var Pusher_1 = require("@libs/Pusher");
var ReportActionsUtils = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var shouldSkipDeepLinkNavigation_1 = require("@libs/shouldSkipDeepLinkNavigation");
var Sound_1 = require("@libs/Sound");
var Url_1 = require("@libs/Url");
var Visibility_1 = require("@libs/Visibility");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var NewRoomForm_1 = require("@src/types/form/NewRoomForm");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var CachedPDFPaths_1 = require("./CachedPDFPaths");
var Download_1 = require("./Download");
var Modal_1 = require("./Modal");
var navigateFromNotification_1 = require("./navigateFromNotification");
var PersistedRequests_1 = require("./PersistedRequests");
var Member_1 = require("./Policy/Member");
var Policy_1 = require("./Policy/Policy");
var RequestConflictUtils_1 = require("./RequestConflictUtils");
var Session_1 = require("./Session");
var Welcome_1 = require("./Welcome");
var OnboardingFlow_1 = require("./Welcome/OnboardingFlow");
var addNewMessageWithText = new Set([types_1.WRITE_COMMANDS.ADD_COMMENT, types_1.WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT]);
var conciergeReportID;
var currentUserAccountID = -1;
var currentUserEmail;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (value) {
        // When signed out, val is undefined
        if (!(value === null || value === void 0 ? void 0 : value.accountID)) {
            conciergeReportID = undefined;
            return;
        }
        currentUserEmail = value.email;
        currentUserAccountID = value.accountID;
    },
});
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.CONCIERGE_REPORT_ID,
    callback: function (value) { return (conciergeReportID = value); },
});
var preferredSkinTone = CONST_1.default.EMOJI_DEFAULT_SKIN_TONE;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PREFERRED_EMOJI_SKIN_TONE,
    callback: function (value) {
        preferredSkinTone = EmojiUtils.getPreferredSkinToneIndex(value);
    },
});
// map of reportID to all reportActions for that report
var allReportActions = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS,
    callback: function (actions, key) {
        if (!key || !actions) {
            return;
        }
        var reportID = CollectionUtils.extractCollectionItemID(key);
        allReportActions[reportID] = actions;
    },
});
var allTransactionViolations = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: function (value) { return (allTransactionViolations = value); },
});
var allReports;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
var isNetworkOffline = false;
var networkStatus;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NETWORK,
    callback: function (value) {
        var _a, _b;
        isNetworkOffline = (_a = value === null || value === void 0 ? void 0 : value.isOffline) !== null && _a !== void 0 ? _a : false;
        networkStatus = (_b = value === null || value === void 0 ? void 0 : value.networkStatus) !== null && _b !== void 0 ? _b : CONST_1.default.NETWORK.NETWORK_STATUS.UNKNOWN;
    },
});
var allPersonalDetails = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
    callback: function (value) {
        allPersonalDetails = value !== null && value !== void 0 ? value : {};
    },
});
var account = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.ACCOUNT,
    callback: function (value) {
        account = value !== null && value !== void 0 ? value : {};
    },
});
var draftNoteMap = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.PRIVATE_NOTES_DRAFT,
    callback: function (value, key) {
        if (!key) {
            return;
        }
        var reportID = key.replace(ONYXKEYS_1.default.COLLECTION.PRIVATE_NOTES_DRAFT, '');
        draftNoteMap[reportID] = value;
    },
});
var typingWatchTimers = {};
var reportIDDeeplinkedFromOldDot;
react_native_1.Linking.getInitialURL().then(function (url) {
    reportIDDeeplinkedFromOldDot = (0, processReportIDDeeplink_1.default)(url !== null && url !== void 0 ? url : '');
});
var allRecentlyUsedReportFields = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.RECENTLY_USED_REPORT_FIELDS,
    callback: function (val) { return (allRecentlyUsedReportFields = val); },
});
var quickAction = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
    callback: function (val) { return (quickAction = val); },
});
var onboarding;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_ONBOARDING,
    callback: function (val) {
        if (Array.isArray(val)) {
            return;
        }
        onboarding = val;
    },
});
var introSelected = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_INTRO_SELECTED,
    callback: function (val) { return (introSelected = val); },
});
var allReportDraftComments = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT,
    waitForCollectionCallback: true,
    callback: function (value) { return (allReportDraftComments = value); },
});
var nvpDismissedProductTraining;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING,
    callback: function (value) { return (nvpDismissedProductTraining = value); },
});
var allPolicies = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    callback: function (val, key) {
        if (!key) {
            return;
        }
        if (val === null || val === undefined) {
            // If we are deleting a policy, we have to check every report linked to that policy
            // and unset the draft indicator (pencil icon) alongside removing any draft comments. Clearing these values will keep the newly archived chats from being displayed in the LHN.
            // More info: https://github.com/Expensify/App/issues/14260
            var policyID = key.replace(ONYXKEYS_1.default.COLLECTION.POLICY, '');
            var policyReports = (0, ReportUtils_1.getAllPolicyReports)(policyID);
            var cleanUpSetQueries_1 = {};
            policyReports.forEach(function (policyReport) {
                if (!policyReport) {
                    return;
                }
                var reportID = policyReport.reportID;
                cleanUpSetQueries_1["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(reportID)] = null;
                cleanUpSetQueries_1["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS).concat(reportID)] = null;
            });
            react_native_onyx_1.default.multiSet(cleanUpSetQueries_1);
            delete allPolicies[key];
            return;
        }
        allPolicies[key] = val;
    },
});
var allTransactions = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: function (value) {
        if (!value) {
            allTransactions = {};
            return;
        }
        allTransactions = value;
    },
});
var environment;
(0, getEnvironment_1.default)().then(function (env) {
    environment = env;
});
(0, Pagination_1.registerPaginationConfig)({
    initialCommand: types_1.WRITE_COMMANDS.OPEN_REPORT,
    previousCommand: types_1.READ_COMMANDS.GET_OLDER_ACTIONS,
    nextCommand: types_1.READ_COMMANDS.GET_NEWER_ACTIONS,
    resourceCollectionKey: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS,
    pageCollectionKey: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_PAGES,
    sortItems: function (reportActions, reportID) {
        var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
        var canUserPerformWriteAction = (0, ReportUtils_1.canUserPerformWriteAction)(report);
        return ReportActionsUtils.getSortedReportActionsForDisplay(reportActions, canUserPerformWriteAction, true);
    },
    getItemID: function (reportAction) { return reportAction.reportActionID; },
});
function clearGroupChat() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.NEW_GROUP_CHAT_DRAFT, null);
}
function startNewChat() {
    clearGroupChat();
    Navigation_1.default.navigate(ROUTES_1.default.NEW);
}
/** Get the private pusher channel name for a Report. */
function getReportChannelName(reportID) {
    return "".concat(CONST_1.default.PUSHER.PRIVATE_REPORT_CHANNEL_PREFIX).concat(reportID).concat(CONFIG_1.default.PUSHER.SUFFIX);
}
function openUnreportedExpense(reportID, backToReport) {
    if (!reportID) {
        return;
    }
    Navigation_1.default.navigate(ROUTES_1.default.ADD_UNREPORTED_EXPENSE.getRoute(reportID, backToReport));
}
/**
 * There are 2 possibilities that we can receive via pusher for a user's typing/leaving status:
 * 1. The "new" way from New Expensify is passed as {[login]: Boolean} (e.g. {yuwen@expensify.com: true}), where the value
 * is whether the user with that login is typing/leaving on the report or not.
 * 2. The "old" way from e.com which is passed as {userLogin: login} (e.g. {userLogin: bstites@expensify.com})
 *
 * This method makes sure that no matter which we get, we return the "new" format
 */
function getNormalizedStatus(typingStatus) {
    var _a;
    var normalizedStatus;
    if (typingStatus.userLogin) {
        normalizedStatus = (_a = {}, _a[typingStatus.userLogin] = true, _a);
    }
    else {
        normalizedStatus = typingStatus;
    }
    return normalizedStatus;
}
/** Initialize our pusher subscriptions to listen for someone typing in a report. */
function subscribeToReportTypingEvents(reportID) {
    if (!reportID) {
        return;
    }
    // Make sure we have a clean Typing indicator before subscribing to typing events
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_USER_IS_TYPING).concat(reportID), {});
    var pusherChannelName = getReportChannelName(reportID);
    Pusher_1.default.subscribe(pusherChannelName, Pusher_1.default.TYPE.USER_IS_TYPING, function (typingStatus) {
        // If the pusher message comes from OldDot, we expect the typing status to be keyed by user
        // login OR by 'Concierge'. If the pusher message comes from NewDot, it is keyed by accountID
        // since personal details are keyed by accountID.
        var normalizedTypingStatus = getNormalizedStatus(typingStatus);
        var accountIDOrLogin = Object.keys(normalizedTypingStatus).at(0);
        if (!accountIDOrLogin) {
            return;
        }
        // Don't show the typing indicator if the user is typing on another platform
        if (Number(accountIDOrLogin) === currentUserAccountID) {
            return;
        }
        // Use a combo of the reportID and the accountID or login as a key for holding our timers.
        var reportUserIdentifier = "".concat(reportID, "-").concat(accountIDOrLogin);
        clearTimeout(typingWatchTimers[reportUserIdentifier]);
        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_USER_IS_TYPING).concat(reportID), normalizedTypingStatus);
        // Regular user typing indicators: time out after 1.5s of inactivity.
        // Concierge (AgentZero-initiated): use a longer 10s timeout. AgentZero sends a single typing event for Concierge, not a stream, so client holds the indicator longer.
        var isCurrentlyTyping = normalizedTypingStatus[accountIDOrLogin];
        if (isCurrentlyTyping) {
            // While the accountIDOrLogin could be 'Concierge' from OldDot, we only want the longer timeout for events queued from AgentZero (which will only send the accountID)
            var isConciergeUser = Number(accountIDOrLogin) === CONST_1.default.ACCOUNT_ID.CONCIERGE;
            var timeoutDuration = isConciergeUser ? 10000 : 1500;
            typingWatchTimers[reportUserIdentifier] = setTimeout(function () {
                var typingStoppedStatus = {};
                typingStoppedStatus[accountIDOrLogin] = false;
                react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_USER_IS_TYPING).concat(reportID), typingStoppedStatus);
                delete typingWatchTimers[reportUserIdentifier];
            }, timeoutDuration);
        }
    }).catch(function (error) {
        Log_1.default.hmmm('[Report] Failed to initially subscribe to Pusher channel', { errorType: error.type, pusherChannelName: pusherChannelName });
    });
}
/** Initialize our pusher subscriptions to listen for someone leaving a room. */
function subscribeToReportLeavingEvents(reportID) {
    if (!reportID) {
        return;
    }
    // Make sure we have a clean Leaving indicator before subscribing to leaving events
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_USER_IS_LEAVING_ROOM).concat(reportID), false);
    var pusherChannelName = getReportChannelName(reportID);
    Pusher_1.default.subscribe(pusherChannelName, Pusher_1.default.TYPE.USER_IS_LEAVING_ROOM, function (leavingStatus) {
        // If the pusher message comes from OldDot, we expect the leaving status to be keyed by user
        // login OR by 'Concierge'. If the pusher message comes from NewDot, it is keyed by accountID
        // since personal details are keyed by accountID.
        var normalizedLeavingStatus = getNormalizedStatus(leavingStatus);
        var accountIDOrLogin = Object.keys(normalizedLeavingStatus).at(0);
        if (!accountIDOrLogin) {
            return;
        }
        if (Number(accountIDOrLogin) !== currentUserAccountID) {
            return;
        }
        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_USER_IS_LEAVING_ROOM).concat(reportID), true);
    }).catch(function (error) {
        Log_1.default.hmmm('[Report] Failed to initially subscribe to Pusher channel', { errorType: error.type, pusherChannelName: pusherChannelName });
    });
}
/**
 * Remove our pusher subscriptions to listen for someone typing in a report.
 */
function unsubscribeFromReportChannel(reportID) {
    if (!reportID) {
        return;
    }
    var pusherChannelName = getReportChannelName(reportID);
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_USER_IS_TYPING).concat(reportID), {});
    Pusher_1.default.unsubscribe(pusherChannelName, Pusher_1.default.TYPE.USER_IS_TYPING);
}
/**
 * Remove our pusher subscriptions to listen for someone leaving a report.
 */
function unsubscribeFromLeavingRoomReportChannel(reportID) {
    if (!reportID) {
        return;
    }
    var pusherChannelName = getReportChannelName(reportID);
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_USER_IS_LEAVING_ROOM).concat(reportID), false);
    Pusher_1.default.unsubscribe(pusherChannelName, Pusher_1.default.TYPE.USER_IS_LEAVING_ROOM);
}
// New action subscriber array for report pages
var newActionSubscribers = [];
/**
 * Enables the Report actions file to let the ReportActionsView know that a new comment has arrived in realtime for the current report
 * Add subscriber for report id
 * @returns Remove subscriber for report id
 */
function subscribeToNewActionEvent(reportID, callback) {
    newActionSubscribers.push({ callback: callback, reportID: reportID });
    return function () {
        newActionSubscribers = newActionSubscribers.filter(function (subscriber) { return subscriber.reportID !== reportID; });
    };
}
/** Notify the ReportActionsView that a new comment has arrived */
function notifyNewAction(reportID, accountID, reportAction) {
    var actionSubscriber = newActionSubscribers.find(function (subscriber) { return subscriber.reportID === reportID; });
    if (!actionSubscriber) {
        return;
    }
    var isFromCurrentUser = accountID === currentUserAccountID;
    actionSubscriber.callback(isFromCurrentUser, reportAction);
}
/**
 * Add up to two report actions to a report. This method can be called for the following situations:
 *
 * - Adding one comment
 * - Adding one attachment
 * - Add both a comment and attachment simultaneously
 */
function addActions(reportID, text, file) {
    var _a, _b;
    var _c;
    if (text === void 0) { text = ''; }
    var reportCommentText = '';
    var reportCommentAction;
    var attachmentAction;
    var commandName = types_1.WRITE_COMMANDS.ADD_COMMENT;
    if (text && !file) {
        var reportComment = (0, ReportUtils_1.buildOptimisticAddCommentReportAction)(text, undefined, undefined, undefined, undefined, reportID);
        reportCommentAction = reportComment.reportAction;
        reportCommentText = reportComment.commentText;
    }
    if (file) {
        // When we are adding an attachment we will call AddAttachment.
        // It supports sending an attachment with an optional comment and AddComment supports adding a single text comment only.
        commandName = types_1.WRITE_COMMANDS.ADD_ATTACHMENT;
        var attachment = (0, ReportUtils_1.buildOptimisticAddCommentReportAction)(text, file, undefined, undefined, undefined, reportID);
        attachmentAction = attachment.reportAction;
    }
    if (text && file) {
        // When there is both text and a file, the text for the report comment needs to be parsed)
        reportCommentText = (0, ReportUtils_1.getParsedComment)(text !== null && text !== void 0 ? text : '', { reportID: reportID });
        // And the API command needs to go to the new API which supports combining both text and attachments in a single report action
        commandName = types_1.WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT;
    }
    // Always prefer the file as the last action over text
    var lastAction = attachmentAction !== null && attachmentAction !== void 0 ? attachmentAction : reportCommentAction;
    var currentTime = DateUtils_1.default.getDBTimeWithSkew();
    var lastComment = ReportActionsUtils.getReportActionMessage(lastAction);
    var lastCommentText = (0, ReportUtils_1.formatReportLastMessageText)((_c = lastComment === null || lastComment === void 0 ? void 0 : lastComment.text) !== null && _c !== void 0 ? _c : '');
    var optimisticReport = {
        lastVisibleActionCreated: lastAction === null || lastAction === void 0 ? void 0 : lastAction.created,
        lastMessageText: lastCommentText,
        lastMessageHtml: lastCommentText,
        lastActorAccountID: currentUserAccountID,
        lastReadTime: currentTime,
    };
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    var shouldUpdateNotificationPreference = !(0, EmptyObject_1.isEmptyObject)(report) && (0, ReportUtils_1.isHiddenForCurrentUser)(report);
    if (shouldUpdateNotificationPreference) {
        optimisticReport.participants = (_a = {},
            _a[currentUserAccountID] = { notificationPreference: (0, ReportUtils_1.getDefaultNotificationPreferenceForReport)(report) },
            _a);
    }
    // Optimistically add the new actions to the store before waiting to save them to the server
    var optimisticReportActions = {};
    // Only add the reportCommentAction when there is no file attachment. If there is both a file attachment and text, that will all be contained in the attachmentAction.
    if (text && (reportCommentAction === null || reportCommentAction === void 0 ? void 0 : reportCommentAction.reportActionID) && !file) {
        optimisticReportActions[reportCommentAction.reportActionID] = reportCommentAction;
    }
    if (file && (attachmentAction === null || attachmentAction === void 0 ? void 0 : attachmentAction.reportActionID)) {
        optimisticReportActions[attachmentAction.reportActionID] = attachmentAction;
    }
    var parameters = {
        reportID: reportID,
        reportActionID: file ? attachmentAction === null || attachmentAction === void 0 ? void 0 : attachmentAction.reportActionID : reportCommentAction === null || reportCommentAction === void 0 ? void 0 : reportCommentAction.reportActionID,
        commentReportActionID: file && reportCommentAction ? reportCommentAction.reportActionID : null,
        reportComment: reportCommentText,
        file: file,
        clientCreatedTime: file ? attachmentAction === null || attachmentAction === void 0 ? void 0 : attachmentAction.created : reportCommentAction === null || reportCommentAction === void 0 ? void 0 : reportCommentAction.created,
        idempotencyKey: expensify_common_1.Str.guid(),
    };
    if (reportIDDeeplinkedFromOldDot === reportID && (0, ReportUtils_1.isConciergeChatReport)(report)) {
        parameters.isOldDotConciergeChat = true;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: optimisticReport,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: optimisticReportActions,
        },
    ];
    var successReportActions = {};
    Object.entries(optimisticReportActions).forEach(function (_a) {
        var actionKey = _a[0];
        successReportActions[actionKey] = { pendingAction: null, isOptimisticAction: null };
    });
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: successReportActions,
        },
    ];
    var failureReport = {
        lastMessageText: '',
        lastVisibleActionCreated: '',
    };
    var _d = ReportActionsUtils.getLastVisibleMessage(reportID).lastMessageText, lastMessageText = _d === void 0 ? '' : _d;
    if (lastMessageText) {
        var lastVisibleAction = ReportActionsUtils.getLastVisibleAction(reportID);
        var lastVisibleActionCreated = lastVisibleAction === null || lastVisibleAction === void 0 ? void 0 : lastVisibleAction.created;
        var lastActorAccountID = lastVisibleAction === null || lastVisibleAction === void 0 ? void 0 : lastVisibleAction.actorAccountID;
        failureReport = {
            lastMessageText: lastMessageText,
            lastVisibleActionCreated: lastVisibleActionCreated,
            lastActorAccountID: lastActorAccountID,
        };
    }
    var failureReportActions = {};
    Object.entries(optimisticReportActions).forEach(function (_a) {
        var actionKey = _a[0], action = _a[1];
        failureReportActions[actionKey] = __assign(__assign({}, action), { errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericAddCommentFailureMessage') });
    });
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: failureReport,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: failureReportActions,
        },
    ];
    // Update optimistic data for parent report action if the report is a child report
    var optimisticParentReportData = (0, ReportUtils_1.getOptimisticDataForParentReportAction)(reportID, currentTime, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    optimisticParentReportData.forEach(function (parentReportData) {
        if ((0, EmptyObject_1.isEmptyObject)(parentReportData)) {
            return;
        }
        optimisticData.push(parentReportData);
    });
    // Update the timezone if it's been 5 minutes from the last time the user added a comment
    if (DateUtils_1.default.canUpdateTimezone() && currentUserAccountID) {
        var timezone = DateUtils_1.default.getCurrentTimezone();
        parameters.timezone = JSON.stringify(timezone);
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: (_b = {}, _b[currentUserAccountID] = { timezone: timezone }, _b),
        });
        DateUtils_1.default.setTimezoneUpdated();
    }
    API.write(commandName, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
    notifyNewAction(reportID, lastAction === null || lastAction === void 0 ? void 0 : lastAction.actorAccountID, lastAction);
}
/** Add an attachment and optional comment. */
function addAttachment(reportID, file, text, shouldPlaySound) {
    if (text === void 0) { text = ''; }
    if (shouldPlaySound) {
        (0, Sound_1.default)(Sound_1.SOUNDS.DONE);
    }
    addActions(reportID, text, file);
}
/** Add a single comment to a report */
function addComment(reportID, text, shouldPlaySound) {
    if (shouldPlaySound) {
        (0, Sound_1.default)(Sound_1.SOUNDS.DONE);
    }
    addActions(reportID, text);
}
function reportActionsExist(reportID) {
    return (allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions[reportID]) !== undefined;
}
function updateChatName(reportID, reportName, type) {
    var _a, _b;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                reportName: reportName,
                pendingFields: {
                    reportName: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    reportName: null,
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                pendingFields: {
                    reportName: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                reportName: (_b = (_a = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)]) === null || _a === void 0 ? void 0 : _a.reportName) !== null && _b !== void 0 ? _b : null,
                pendingFields: {
                    reportName: null,
                },
            },
        },
    ];
    var command = type === CONST_1.default.REPORT.CHAT_TYPE.GROUP ? types_1.WRITE_COMMANDS.UPDATE_GROUP_CHAT_NAME : types_1.WRITE_COMMANDS.UPDATE_TRIP_ROOM_NAME;
    var parameters = { reportName: reportName, reportID: reportID };
    API.write(command, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function updateGroupChatAvatar(reportID, file) {
    var _a, _b;
    // If we have no file that means we are removing the avatar.
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                avatarUrl: file ? ((_a = file === null || file === void 0 ? void 0 : file.uri) !== null && _a !== void 0 ? _a : '') : null,
                pendingFields: {
                    avatar: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    avatar: null,
                },
            },
        },
    ];
    var fetchedReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                avatarUrl: (_b = fetchedReport === null || fetchedReport === void 0 ? void 0 : fetchedReport.avatarUrl) !== null && _b !== void 0 ? _b : null,
                pendingFields: {
                    avatar: null,
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                pendingFields: {
                    avatar: null,
                },
            },
        },
    ];
    var parameters = { file: file, reportID: reportID };
    API.write(types_1.WRITE_COMMANDS.UPDATE_GROUP_CHAT_AVATAR, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
/**
 * Clear error and pending fields for the report avatar
 */
function clearAvatarErrors(reportID) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), {
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
 * @param temporaryShouldUseTableReportView For now MoneyRequestReportView is only supported on Search pages. Once the view is handled on ReportScreens as well we will remove this flag
 */
function openReport(reportID, reportActionID, participantLoginList, newReportObject, parentReportActionID, isFromDeepLink, participantAccountIDList, avatar, temporaryShouldUseTableReportView, transactionID) {
    var _a, _b, _c, _d;
    var _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    if (participantLoginList === void 0) { participantLoginList = []; }
    if (isFromDeepLink === void 0) { isFromDeepLink = false; }
    if (participantAccountIDList === void 0) { participantAccountIDList = []; }
    if (temporaryShouldUseTableReportView === void 0) { temporaryShouldUseTableReportView = false; }
    if (!reportID) {
        return;
    }
    var optimisticReport = reportActionsExist(reportID)
        ? {}
        : {
            reportName: (_f = (_e = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)]) === null || _e === void 0 ? void 0 : _e.reportName) !== null && _f !== void 0 ? _f : CONST_1.default.REPORT.DEFAULT_REPORT_NAME,
        };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: optimisticReport,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                isLoadingInitialReportActions: true,
                isLoadingOlderReportActions: false,
                hasLoadingOlderReportActionsError: false,
                isLoadingNewerReportActions: false,
                hasLoadingNewerReportActionsError: false,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                errorFields: {
                    notFound: null,
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                hasOnceLoadedReportActions: true,
                isLoadingInitialReportActions: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                isLoadingInitialReportActions: false,
            },
        },
    ];
    var finallyData = [];
    var parameters = {
        reportID: reportID,
        reportActionID: reportActionID,
        emailList: participantLoginList ? participantLoginList.join(',') : '',
        accountIDList: participantAccountIDList ? participantAccountIDList.join(',') : '',
        parentReportActionID: parentReportActionID,
        transactionID: transactionID,
    };
    // This is a legacy transactions that doesn't have either a transaction thread or a money request preview
    if (transactionID && !parentReportActionID) {
        var transaction = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions[transactionID];
        if (transaction) {
            var selfDMReportID = (0, ReportUtils_1.findSelfDMReportID)();
            if (selfDMReportID) {
                var generatedReportActionID = (0, NumberUtils_1.rand64)();
                var optimisticParentAction = (0, ReportUtils_1.buildOptimisticIOUReportAction)({
                    type: CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE,
                    amount: Math.abs(transaction.amount),
                    currency: transaction.currency,
                    comment: (_h = (_g = transaction.comment) === null || _g === void 0 ? void 0 : _g.comment) !== null && _h !== void 0 ? _h : '',
                    participants: [{ accountID: currentUserAccountID, login: currentUserEmail !== null && currentUserEmail !== void 0 ? currentUserEmail : '' }],
                    transactionID: transactionID,
                    isOwnPolicyExpenseChat: true,
                });
                optimisticData.push({
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
                    value: {
                        parentReportID: selfDMReportID,
                        parentReportActionID: generatedReportActionID,
                    },
                });
                optimisticData.push({
                    onyxMethod: react_native_onyx_1.default.METHOD.SET,
                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(selfDMReportID).concat(generatedReportActionID),
                    value: __assign(__assign({}, optimisticParentAction), { reportActionID: generatedReportActionID, childReportID: reportID }),
                });
                parameters.moneyRequestPreviewReportActionID = generatedReportActionID;
            }
        }
    }
    // temporary flag will be removed once ReportScreen supports MoneyRequestReportView - https://github.com/Expensify/App/issues/57509
    if (temporaryShouldUseTableReportView) {
        parameters.useTableReportView = true;
    }
    var isInviteOnboardingComplete = (_j = introSelected === null || introSelected === void 0 ? void 0 : introSelected.isInviteOnboardingComplete) !== null && _j !== void 0 ? _j : false;
    var isOnboardingCompleted = (_k = onboarding === null || onboarding === void 0 ? void 0 : onboarding.hasCompletedGuidedSetupFlow) !== null && _k !== void 0 ? _k : false;
    // Some cases we can have two open report requests with guide setup data because isInviteOnboardingComplete is not updated completely.
    // Then we need to check the list request and prevent the guided setup data from being duplicated.
    var allPersistedRequests = (0, PersistedRequests_1.getAll)();
    var hasOpenReportWithGuidedSetupData = allPersistedRequests.some(function (request) { var _a; return request.command === types_1.WRITE_COMMANDS.OPEN_REPORT && ((_a = request.data) === null || _a === void 0 ? void 0 : _a.guidedSetupData); });
    // Prepare guided setup data only when nvp_introSelected is set and onboarding is not completed
    // OldDot users will never have nvp_introSelected set, so they will not see guided setup messages
    if (introSelected && !isOnboardingCompleted && !isInviteOnboardingComplete && !hasOpenReportWithGuidedSetupData) {
        var choice = introSelected.choice, inviteType = introSelected.inviteType;
        var isInviteIOUorInvoice = inviteType === CONST_1.default.ONBOARDING_INVITE_TYPES.IOU || inviteType === CONST_1.default.ONBOARDING_INVITE_TYPES.INVOICE;
        var isInviteChoiceCorrect = choice === CONST_1.default.ONBOARDING_CHOICES.ADMIN || choice === CONST_1.default.ONBOARDING_CHOICES.SUBMIT || choice === CONST_1.default.ONBOARDING_CHOICES.CHAT_SPLIT;
        if (isInviteChoiceCorrect && !isInviteIOUorInvoice) {
            var onboardingMessage = (0, OnboardingFlow_1.getOnboardingMessages)().onboardingMessages[choice];
            if (choice === CONST_1.default.ONBOARDING_CHOICES.CHAT_SPLIT) {
                var updatedTasks = onboardingMessage.tasks.map(function (task) { return (task.type === 'startChat' ? __assign(__assign({}, task), { autoCompleted: true }) : task); });
                onboardingMessage.tasks = updatedTasks;
            }
            var onboardingData = (0, ReportUtils_1.prepareOnboardingOnyxData)(introSelected, choice, onboardingMessage);
            if (onboardingData) {
                optimisticData.push.apply(optimisticData, __spreadArray(__spreadArray([], onboardingData.optimisticData, false), [{
                        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                        key: ONYXKEYS_1.default.NVP_INTRO_SELECTED,
                        value: {
                            isInviteOnboardingComplete: true,
                        },
                    }], false));
                successData.push.apply(successData, onboardingData.successData);
                failureData.push.apply(failureData, onboardingData.failureData);
                parameters.guidedSetupData = JSON.stringify(onboardingData.guidedSetupData);
            }
        }
    }
    var isGroupChat = (0, ReportUtils_1.isGroupChat)(newReportObject);
    if (isGroupChat) {
        parameters.chatType = CONST_1.default.REPORT.CHAT_TYPE.GROUP;
        parameters.groupChatAdminLogins = currentUserEmail;
        parameters.optimisticAccountIDList = Object.keys((_l = newReportObject === null || newReportObject === void 0 ? void 0 : newReportObject.participants) !== null && _l !== void 0 ? _l : {}).join(',');
        parameters.reportName = (_m = newReportObject === null || newReportObject === void 0 ? void 0 : newReportObject.reportName) !== null && _m !== void 0 ? _m : '';
        // If we have an avatar then include it with the parameters
        if (avatar) {
            parameters.file = avatar;
        }
        react_native_1.InteractionManager.runAfterInteractions(function () {
            clearGroupChat();
        });
    }
    if (isFromDeepLink) {
        parameters.shouldRetry = false;
    }
    // If we are creating a new report, we need to add the optimistic report data and a report action
    var isCreatingNewReport = !(0, EmptyObject_1.isEmptyObject)(newReportObject);
    if (isCreatingNewReport) {
        // Change the method to set for new reports because it doesn't exist yet, is faster,
        // and we need the data to be available when we navigate to the chat page
        var optimisticDataItem = optimisticData.at(0);
        if (optimisticDataItem) {
            optimisticDataItem.onyxMethod = react_native_onyx_1.default.METHOD.SET;
            optimisticDataItem.value = __assign(__assign(__assign(__assign({}, optimisticReport), { reportName: CONST_1.default.REPORT.DEFAULT_REPORT_NAME }), newReportObject), { pendingFields: __assign({ createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }, (isGroupChat && { reportName: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD })) });
        }
        var emailCreatingAction = CONST_1.default.REPORT.OWNER_EMAIL_FAKE;
        if (newReportObject.ownerAccountID && newReportObject.ownerAccountID !== CONST_1.default.REPORT.OWNER_ACCOUNT_ID_FAKE) {
            emailCreatingAction = (_p = (_o = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[newReportObject.ownerAccountID]) === null || _o === void 0 ? void 0 : _o.login) !== null && _p !== void 0 ? _p : '';
        }
        var optimisticCreatedAction = (0, ReportUtils_1.buildOptimisticCreatedReportAction)(emailCreatingAction);
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_a = {}, _a[optimisticCreatedAction.reportActionID] = optimisticCreatedAction, _a),
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                isOptimisticReport: true,
            },
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_b = {}, _b[optimisticCreatedAction.reportActionID] = { pendingAction: null }, _b),
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                isOptimisticReport: false,
            },
        });
        // Add optimistic personal details for new participants
        var optimisticPersonalDetails_1 = {};
        var settledPersonalDetails_1 = {};
        var redundantParticipants_1 = {};
        var participantAccountIDs_1 = PersonalDetailsUtils.getAccountIDsByLogins(participantLoginList);
        participantLoginList.forEach(function (login, index) {
            var _a;
            var accountID = (_a = participantAccountIDs_1.at(index)) !== null && _a !== void 0 ? _a : -1;
            var isOptimisticAccount = !(allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID]);
            if (!isOptimisticAccount) {
                return;
            }
            optimisticPersonalDetails_1[accountID] = {
                login: login,
                accountID: accountID,
                displayName: login,
                isOptimisticPersonalDetail: true,
            };
            settledPersonalDetails_1[accountID] = null;
            // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
            redundantParticipants_1[accountID] = null;
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                participants: redundantParticipants_1,
                pendingFields: {
                    createChat: null,
                    reportName: null,
                },
                errorFields: {
                    createChat: null,
                },
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                isOptimisticReport: false,
            },
        });
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: optimisticPersonalDetails_1,
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: settledPersonalDetails_1,
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: settledPersonalDetails_1,
        });
        // Add the createdReportActionID parameter to the API call
        parameters.createdReportActionID = optimisticCreatedAction.reportActionID;
        // If we are creating a thread, ensure the report action has childReportID property added
        if (newReportObject.parentReportID && parentReportActionID) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(newReportObject.parentReportID),
                value: (_c = {}, _c[parentReportActionID] = { childReportID: reportID, childType: CONST_1.default.REPORT.TYPE.CHAT }, _c),
            });
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(newReportObject.parentReportID),
                value: (_d = {}, _d[parentReportActionID] = { childType: '' }, _d),
            });
        }
    }
    parameters.clientLastReadTime = (_r = (_q = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)]) === null || _q === void 0 ? void 0 : _q.lastReadTime) !== null && _r !== void 0 ? _r : '';
    var paginationConfig = {
        resourceID: reportID,
        cursorID: reportActionID,
    };
    if (isFromDeepLink) {
        finallyData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.IS_CHECKING_PUBLIC_ROOM,
            value: false,
        });
        API.paginate(CONST_1.default.API_REQUEST_TYPE.WRITE, types_1.WRITE_COMMANDS.OPEN_REPORT, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData, finallyData: finallyData }, paginationConfig);
    }
    else {
        // eslint-disable-next-line rulesdir/no-multiple-api-calls
        API.paginate(CONST_1.default.API_REQUEST_TYPE.WRITE, types_1.WRITE_COMMANDS.OPEN_REPORT, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData, finallyData: finallyData }, paginationConfig, {
            checkAndFixConflictingRequest: function (persistedRequests) { return (0, RequestConflictUtils_1.resolveOpenReportDuplicationConflictAction)(persistedRequests, parameters); },
        });
    }
}
/**
 * This will return an optimistic report object for a given user we want to create a chat with without saving it, when the only thing we know about recipient is his accountID. *
 * @param accountID accountID of the user that the optimistic chat report is created with.
 */
function getOptimisticChatReport(accountID) {
    return (0, ReportUtils_1.buildOptimisticChatReport)({
        participantList: [accountID, currentUserAccountID],
        notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
    });
}
/**
 * This will find an existing chat, or create a new one if none exists, for the given user or set of users. It will then navigate to this chat.
 *
 * @param userLogins list of user logins to start a chat report with.
 * @param shouldDismissModal a flag to determine if we should dismiss modal before navigate to report or navigate to report directly.
 */
function navigateToAndOpenReport(userLogins, shouldDismissModal, reportName, avatarUri, avatarFile, optimisticReportID, isGroupChat) {
    if (shouldDismissModal === void 0) { shouldDismissModal = true; }
    if (isGroupChat === void 0) { isGroupChat = false; }
    var newChat;
    var chat;
    var participantAccountIDs = PersonalDetailsUtils.getAccountIDsByLogins(userLogins);
    // If we are not creating a new Group Chat then we are creating a 1:1 DM and will look for an existing chat
    if (!isGroupChat) {
        chat = (0, ReportUtils_1.getChatByParticipants)(__spreadArray(__spreadArray([], participantAccountIDs, true), [currentUserAccountID], false));
    }
    if ((0, EmptyObject_1.isEmptyObject)(chat)) {
        if (isGroupChat) {
            // If we are creating a group chat then participantAccountIDs is expected to contain currentUserAccountID
            newChat = (0, ReportUtils_1.buildOptimisticGroupChatReport)(participantAccountIDs, reportName !== null && reportName !== void 0 ? reportName : '', avatarUri !== null && avatarUri !== void 0 ? avatarUri : '', optimisticReportID, CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);
        }
        else {
            newChat = (0, ReportUtils_1.buildOptimisticChatReport)({
                participantList: __spreadArray(__spreadArray([], participantAccountIDs, true), [currentUserAccountID], false),
                notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
            });
        }
        // We want to pass newChat here because if anything is passed in that param (even an existing chat), we will try to create a chat on the server
        openReport(newChat === null || newChat === void 0 ? void 0 : newChat.reportID, '', userLogins, newChat, undefined, undefined, undefined, avatarFile);
    }
    var report = (0, EmptyObject_1.isEmptyObject)(chat) ? newChat : chat;
    if (shouldDismissModal) {
        if ((0, getIsNarrowLayout_1.default)() && (report === null || report === void 0 ? void 0 : report.reportID)) {
            Navigation_1.default.dismissModalWithReport({ reportID: report.reportID });
            return;
        }
        Navigation_1.default.dismissModal();
    }
    // In some cases when RHP modal gets hidden and then we navigate to report Composer focus breaks, wrapping navigation in setTimeout fixes this
    setTimeout(function () {
        Navigation_1.default.isNavigationReady().then(function () { return Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(report === null || report === void 0 ? void 0 : report.reportID)); });
    }, 0);
}
/**
 * This will find an existing chat, or create a new one if none exists, for the given accountID or set of accountIDs. It will then navigate to this chat.
 *
 * @param participantAccountIDs of user logins to start a chat report with.
 */
function navigateToAndOpenReportWithAccountIDs(participantAccountIDs) {
    var newChat;
    var chat = (0, ReportUtils_1.getChatByParticipants)(__spreadArray(__spreadArray([], participantAccountIDs, true), [currentUserAccountID], false));
    if (!chat) {
        newChat = (0, ReportUtils_1.buildOptimisticChatReport)({
            participantList: __spreadArray(__spreadArray([], participantAccountIDs, true), [currentUserAccountID], false),
        });
        // We want to pass newChat here because if anything is passed in that param (even an existing chat), we will try to create a chat on the server
        openReport(newChat === null || newChat === void 0 ? void 0 : newChat.reportID, '', [], newChat, '0', false, participantAccountIDs);
    }
    var report = chat !== null && chat !== void 0 ? chat : newChat;
    Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(report === null || report === void 0 ? void 0 : report.reportID));
}
/**
 * This will navigate to an existing thread, or create a new one if necessary
 *
 * @param childReportID The reportID we are trying to open
 * @param parentReportAction the parent comment of a thread
 * @param parentReportID The reportID of the parent
 */
function navigateToAndOpenChildReport(childReportID, parentReportAction, parentReportID) {
    var _a, _b, _c;
    if (parentReportAction === void 0) { parentReportAction = {}; }
    var childReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(childReportID)];
    if (childReport === null || childReport === void 0 ? void 0 : childReport.reportID) {
        Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(childReportID, undefined, undefined, undefined, undefined, Navigation_1.default.getActiveRoute()));
    }
    else {
        var participantAccountIDs = __spreadArray([], new Set([currentUserAccountID, Number(parentReportAction.actorAccountID)]), true);
        var parentReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReportID)];
        // Threads from DMs and selfDMs don't have a chatType. All other threads inherit the chatType from their parent
        var childReportChatType = parentReport && (0, ReportUtils_1.isSelfDM)(parentReport) ? undefined : parentReport === null || parentReport === void 0 ? void 0 : parentReport.chatType;
        var newChat = (0, ReportUtils_1.buildOptimisticChatReport)({
            participantList: participantAccountIDs,
            reportName: ReportActionsUtils.getReportActionText(parentReportAction),
            chatType: childReportChatType,
            policyID: (_a = parentReport === null || parentReport === void 0 ? void 0 : parentReport.policyID) !== null && _a !== void 0 ? _a : CONST_1.default.POLICY.OWNER_EMAIL_FAKE,
            ownerAccountID: CONST_1.default.POLICY.OWNER_ACCOUNT_ID_FAKE,
            oldPolicyName: (_b = parentReport === null || parentReport === void 0 ? void 0 : parentReport.policyName) !== null && _b !== void 0 ? _b : '',
            notificationPreference: (0, ReportUtils_1.getChildReportNotificationPreference)(parentReportAction),
            parentReportActionID: parentReportAction.reportActionID,
            parentReportID: parentReportID,
            optimisticReportID: childReportID,
        });
        if (!childReportID) {
            var participantLogins = PersonalDetailsUtils.getLoginsByAccountIDs(Object.keys((_c = newChat.participants) !== null && _c !== void 0 ? _c : {}).map(Number));
            openReport(newChat.reportID, '', participantLogins, newChat, parentReportAction.reportActionID);
        }
        else {
            react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(childReportID), newChat);
        }
        Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(newChat.reportID, undefined, undefined, undefined, undefined, Navigation_1.default.getActiveRoute()));
    }
}
/**
 * Gets the older actions that have not been read yet.
 * Normally happens when you scroll up on a chat, and the actions have not been read yet.
 */
function getOlderActions(reportID, reportActionID) {
    if (!reportID || !reportActionID) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                isLoadingOlderReportActions: true,
                hasLoadingOlderReportActionsError: false,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                isLoadingOlderReportActions: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                isLoadingOlderReportActions: false,
                hasLoadingOlderReportActionsError: true,
            },
        },
    ];
    var parameters = {
        reportID: reportID,
        reportActionID: reportActionID,
    };
    API.paginate(CONST_1.default.API_REQUEST_TYPE.READ, types_1.READ_COMMANDS.GET_OLDER_ACTIONS, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData }, {
        resourceID: reportID,
        cursorID: reportActionID,
    });
}
/**
 * Gets the newer actions that have not been read yet.
 * Normally happens when you are not located at the bottom of the list and scroll down on a chat.
 */
function getNewerActions(reportID, reportActionID) {
    if (!reportID || !reportActionID) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                isLoadingNewerReportActions: true,
                hasLoadingNewerReportActionsError: false,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                isLoadingNewerReportActions: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                isLoadingNewerReportActions: false,
                hasLoadingNewerReportActionsError: true,
            },
        },
    ];
    var parameters = {
        reportID: reportID,
        reportActionID: reportActionID,
    };
    API.paginate(CONST_1.default.API_REQUEST_TYPE.READ, types_1.READ_COMMANDS.GET_NEWER_ACTIONS, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData }, {
        resourceID: reportID,
        cursorID: reportActionID,
    });
}
/**
 * Gets metadata info about links in the provided report action
 */
function expandURLPreview(reportID, reportActionID) {
    if (!reportID) {
        return;
    }
    var parameters = {
        reportID: reportID,
        reportActionID: reportActionID,
    };
    API.read(types_1.READ_COMMANDS.EXPAND_URL_PREVIEW, parameters);
}
/** Marks the new report actions as read
 * @param shouldResetUnreadMarker Indicates whether the unread indicator should be reset.
 * Currently, the unread indicator needs to be reset only when users mark a report as read.
 */
function readNewestAction(reportID, shouldResetUnreadMarker) {
    if (shouldResetUnreadMarker === void 0) { shouldResetUnreadMarker = false; }
    if (!reportID) {
        return;
    }
    var lastReadTime = DateUtils_1.default.getDBTimeWithSkew();
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                lastReadTime: lastReadTime,
            },
        },
    ];
    var parameters = {
        reportID: reportID,
        lastReadTime: lastReadTime,
    };
    API.writeWithNoDuplicatesConflictAction(types_1.WRITE_COMMANDS.READ_NEWEST_ACTION, parameters, { optimisticData: optimisticData }, function (request) { var _a; return request.command === types_1.WRITE_COMMANDS.READ_NEWEST_ACTION && ((_a = request.data) === null || _a === void 0 ? void 0 : _a.reportID) === parameters.reportID; });
    if (shouldResetUnreadMarker) {
        react_native_1.DeviceEventEmitter.emit("readNewestAction_".concat(reportID), lastReadTime);
    }
}
function markAllMessagesAsRead() {
    if ((0, Session_1.isAnonymousUser)()) {
        return;
    }
    var newLastReadTime = DateUtils_1.default.getDBTimeWithSkew();
    var optimisticReports = {};
    var failureReports = {};
    var reportIDList = [];
    Object.values(allReports !== null && allReports !== void 0 ? allReports : {}).forEach(function (report) {
        var _a;
        if (!report) {
            return;
        }
        var chatReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.chatReportID)];
        var oneTransactionThreadReportID = ReportActionsUtils.getOneTransactionThreadReportID(report, chatReport, allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions[report.reportID]);
        var oneTransactionThreadReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oneTransactionThreadReportID)];
        if (!(0, ReportUtils_1.isUnread)(report, oneTransactionThreadReport)) {
            return;
        }
        var reportKey = "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID);
        optimisticReports[reportKey] = { lastReadTime: newLastReadTime };
        failureReports[reportKey] = { lastReadTime: (_a = report.lastReadTime) !== null && _a !== void 0 ? _a : null };
        reportIDList.push(report.reportID);
    });
    if (reportIDList.length === 0) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS_1.default.COLLECTION.REPORT,
            value: optimisticReports,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS_1.default.COLLECTION.REPORT,
            value: failureReports,
        },
    ];
    var parameters = {
        reportIDList: reportIDList,
    };
    API.write(types_1.WRITE_COMMANDS.MARK_ALL_MESSAGES_AS_READ, parameters, { optimisticData: optimisticData, failureData: failureData });
}
/**
 * Sets the last read time on a report
 */
function markCommentAsUnread(reportID, reportAction) {
    var _a, _b;
    if (!reportID) {
        Log_1.default.warn('7339cd6c-3263-4f89-98e5-730f0be15784 Invalid report passed to MarkCommentAsUnread. Not calling the API because it wil fail.');
        return;
    }
    var reportActions = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions[reportID];
    // Find the latest report actions from other users
    var latestReportActionFromOtherUsers = Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {}).reduce(function (latest, current) {
        if (!ReportActionsUtils.isDeletedAction(current) &&
            current.actorAccountID !== currentUserAccountID &&
            (!latest || current.created > latest.created) &&
            // Whisper action doesn't affect lastVisibleActionCreated, so skip whisper action except actionable mention whisper
            (!ReportActionsUtils.isWhisperAction(current) || current.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER)) {
            return current;
        }
        return latest;
    }, null);
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    var chatReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.chatReportID)];
    var transactionThreadReportID = ReportActionsUtils.getOneTransactionThreadReportID(report, chatReport, reportActions !== null && reportActions !== void 0 ? reportActions : []);
    var transactionThreadReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID)];
    // If no action created date is provided, use the last action's from other user
    var actionCreationTime = (reportAction === null || reportAction === void 0 ? void 0 : reportAction.created) || ((_b = (_a = latestReportActionFromOtherUsers === null || latestReportActionFromOtherUsers === void 0 ? void 0 : latestReportActionFromOtherUsers.created) !== null && _a !== void 0 ? _a : (0, ReportUtils_1.getReportLastVisibleActionCreated)(report, transactionThreadReport)) !== null && _b !== void 0 ? _b : DateUtils_1.default.getDBTime(0));
    // We subtract 1 millisecond so that the lastReadTime is updated to just before a given reportAction's created date
    // For example, if we want to mark a report action with ID 100 and created date '2014-04-01 16:07:02.999' unread, we set the lastReadTime to '2014-04-01 16:07:02.998'
    // Since the report action with ID 100 will be the first with a timestamp above '2014-04-01 16:07:02.998', it's the first one that will be shown as unread
    var lastReadTime = DateUtils_1.default.subtractMillisecondsFromDateTime(actionCreationTime, 1);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                lastReadTime: lastReadTime,
            },
        },
    ];
    var parameters = {
        reportID: reportID,
        lastReadTime: lastReadTime,
        reportActionID: reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.MARK_AS_UNREAD, parameters, { optimisticData: optimisticData });
    react_native_1.DeviceEventEmitter.emit("unreadAction_".concat(reportID), lastReadTime);
}
/** Toggles the pinned state of the report. */
function togglePinnedState(reportID, isPinnedChat) {
    if (!reportID) {
        return;
    }
    var pinnedValue = !isPinnedChat;
    // Optimistically pin/unpin the report before we send out the command
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: { isPinned: pinnedValue },
        },
    ];
    var parameters = {
        reportID: reportID,
        pinnedValue: pinnedValue,
    };
    API.write(types_1.WRITE_COMMANDS.TOGGLE_PINNED_CHAT, parameters, { optimisticData: optimisticData });
}
/** Saves the report draft to Onyx */
function saveReportDraft(reportID, report) {
    return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT).concat(reportID), report);
}
/**
 * Saves the comment left by the user as they are typing. By saving this data the user can switch between chats, close
 * tab, refresh etc without worrying about loosing what they typed out.
 * When empty string or null is passed, it will delete the draft comment from Onyx store.
 */
function saveReportDraftComment(reportID, comment, callback) {
    if (callback === void 0) { callback = function () { }; }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(reportID), (0, DraftCommentUtils_1.prepareDraftComment)(comment)).then(callback);
}
/** Broadcasts whether or not a user is typing on a report over the report's private pusher channel. */
function broadcastUserIsTyping(reportID) {
    var _a;
    var privateReportChannelName = getReportChannelName(reportID);
    var typingStatus = (_a = {},
        _a[currentUserAccountID] = true,
        _a);
    Pusher_1.default.sendEvent(privateReportChannelName, Pusher_1.default.TYPE.USER_IS_TYPING, typingStatus);
}
/** Broadcasts to the report's private pusher channel whether a user is leaving a report */
function broadcastUserIsLeavingRoom(reportID) {
    var _a;
    var privateReportChannelName = getReportChannelName(reportID);
    var leavingStatus = (_a = {},
        _a[currentUserAccountID] = true,
        _a);
    Pusher_1.default.sendEvent(privateReportChannelName, Pusher_1.default.TYPE.USER_IS_LEAVING_ROOM, leavingStatus);
}
/** When a report changes in Onyx, this fetches the report from the API if the report doesn't have a name */
function handleReportChanged(report) {
    var _a;
    if (!report) {
        return;
    }
    var reportID = report.reportID, preexistingReportID = report.preexistingReportID, parentReportID = report.parentReportID, parentReportActionID = report.parentReportActionID;
    // Handle cleanup of stale optimistic IOU report and its report preview separately
    if (reportID && preexistingReportID && (0, ReportUtils_1.isMoneyRequestReport)(report) && parentReportActionID) {
        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReportID), (_a = {},
            _a[parentReportActionID] = null,
            _a));
        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), null);
        return;
    }
    // It is possible that we optimistically created a DM/group-DM for a set of users for which a report already exists.
    // In this case, the API will let us know by returning a preexistingReportID.
    // We should clear out the optimistically created report and re-route the user to the preexisting report.
    if (reportID && preexistingReportID) {
        var callback = function () {
            var _a;
            var existingReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(preexistingReportID)];
            react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), null);
            react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(preexistingReportID), __assign(__assign({}, report), { reportID: preexistingReportID, preexistingReportID: null, 
                // Replacing the existing report's participants to avoid duplicates
                participants: (_a = existingReport === null || existingReport === void 0 ? void 0 : existingReport.participants) !== null && _a !== void 0 ? _a : report.participants }));
            react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(reportID), null);
        };
        // Only re-route them if they are still looking at the optimistically created report
        if (Navigation_1.default.getActiveRoute().includes("/r/".concat(reportID))) {
            var currCallback_1 = callback;
            callback = function () {
                currCallback_1();
                Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(preexistingReportID), { forceReplace: true });
            };
            // The report screen will listen to this event and transfer the draft comment to the existing report
            // This will allow the newest draft comment to be transferred to the existing report
            react_native_1.DeviceEventEmitter.emit("switchToPreExistingReport_".concat(reportID), {
                preexistingReportID: preexistingReportID,
                callback: callback,
            });
            return;
        }
        // In case the user is not on the report screen, we will transfer the report draft comment directly to the existing report
        // after that clear the optimistically created report
        var draftReportComment = allReportDraftComments === null || allReportDraftComments === void 0 ? void 0 : allReportDraftComments["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(reportID)];
        if (!draftReportComment) {
            callback();
            return;
        }
        saveReportDraftComment(preexistingReportID, draftReportComment, callback);
    }
}
/** Deletes a comment from the report, basically sets it as empty string */
function deleteReportComment(reportID, reportAction) {
    var _a, _b, _c;
    var _d, _e, _f;
    var originalReportID = (0, ReportUtils_1.getOriginalReportID)(reportID, reportAction);
    var reportActionID = reportAction.reportActionID;
    if (!reportActionID || !originalReportID || !reportID) {
        return;
    }
    var isDeletedParentAction = ReportActionsUtils.isThreadParentMessage(reportAction, reportID);
    var deletedMessage = [
        {
            translationKey: '',
            type: 'COMMENT',
            html: '',
            text: '',
            isEdited: true,
            isDeletedParentAction: isDeletedParentAction,
        },
    ];
    var optimisticReportActions = (_a = {},
        _a[reportActionID] = {
            pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            previousMessage: reportAction.message,
            message: deletedMessage,
            errors: null,
            linkMetadata: [],
        },
        _a);
    // If we are deleting the last visible message, let's find the previous visible one (or set an empty one if there are none) and update the lastMessageText in the LHN.
    // Similarly, if we are deleting the last read comment we will want to update the lastVisibleActionCreated to use the previous visible message.
    var optimisticReport = {
        lastMessageText: '',
        lastVisibleActionCreated: '',
    };
    var _g = (0, ReportUtils_1.getLastVisibleMessage)(originalReportID, optimisticReportActions).lastMessageText, lastMessageText = _g === void 0 ? '' : _g;
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    var canUserPerformWriteAction = (0, ReportUtils_1.canUserPerformWriteAction)(report);
    if (lastMessageText) {
        var lastVisibleAction = ReportActionsUtils.getLastVisibleAction(originalReportID, canUserPerformWriteAction, optimisticReportActions);
        var lastVisibleActionCreated = lastVisibleAction === null || lastVisibleAction === void 0 ? void 0 : lastVisibleAction.created;
        var lastActorAccountID = lastVisibleAction === null || lastVisibleAction === void 0 ? void 0 : lastVisibleAction.actorAccountID;
        optimisticReport = {
            lastMessageText: lastMessageText,
            lastVisibleActionCreated: lastVisibleActionCreated,
            lastActorAccountID: lastActorAccountID,
        };
    }
    var didCommentMentionCurrentUser = ReportActionsUtils.didMessageMentionCurrentUser(reportAction);
    if (didCommentMentionCurrentUser && reportAction.created === (report === null || report === void 0 ? void 0 : report.lastMentionedTime)) {
        var reportActionsForReport = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions[reportID];
        var latestMentionedReportAction = Object.values(reportActionsForReport !== null && reportActionsForReport !== void 0 ? reportActionsForReport : {}).find(function (action) {
            return action.reportActionID !== reportAction.reportActionID &&
                ReportActionsUtils.didMessageMentionCurrentUser(action) &&
                ReportActionsUtils.shouldReportActionBeVisible(action, action.reportActionID);
        });
        optimisticReport.lastMentionedTime = (_d = latestMentionedReportAction === null || latestMentionedReportAction === void 0 ? void 0 : latestMentionedReportAction.created) !== null && _d !== void 0 ? _d : null;
    }
    // If the API call fails we must show the original message again, so we revert the message content back to how it was
    // and and remove the pendingAction so the strike-through clears
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(originalReportID),
            value: (_b = {},
                _b[reportActionID] = {
                    message: reportAction.message,
                    pendingAction: null,
                    previousMessage: null,
                },
                _b),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(originalReportID),
            value: (_c = {},
                _c[reportActionID] = {
                    pendingAction: null,
                    previousMessage: null,
                },
                _c),
        },
    ];
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(originalReportID),
            value: optimisticReportActions,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(originalReportID),
            value: optimisticReport,
        },
    ];
    // Update optimistic data for parent report action if the report is a child report and the reportAction has no visible child
    var childVisibleActionCount = (_e = reportAction.childVisibleActionCount) !== null && _e !== void 0 ? _e : 0;
    if (childVisibleActionCount === 0) {
        var optimisticParentReportData = (0, ReportUtils_1.getOptimisticDataForParentReportAction)(originalReportID, (_f = optimisticReport === null || optimisticReport === void 0 ? void 0 : optimisticReport.lastVisibleActionCreated) !== null && _f !== void 0 ? _f : '', CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        optimisticParentReportData.forEach(function (parentReportData) {
            if ((0, EmptyObject_1.isEmptyObject)(parentReportData)) {
                return;
            }
            optimisticData.push(parentReportData);
        });
    }
    var parameters = {
        reportID: originalReportID,
        reportActionID: reportActionID,
    };
    (0, CachedPDFPaths_1.clearByKey)(reportActionID);
    API.write(types_1.WRITE_COMMANDS.DELETE_COMMENT, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData }, {
        checkAndFixConflictingRequest: function (persistedRequests) { return (0, RequestConflictUtils_1.resolveCommentDeletionConflicts)(persistedRequests, reportActionID, originalReportID); },
    });
    // if we are linking to the report action, and we are deleting it, and it's not a deleted parent action,
    // we should navigate to its report in order to not show not found page
    if (Navigation_1.default.isActiveRoute(ROUTES_1.default.REPORT_WITH_ID.getRoute(reportID, reportActionID)) && !isDeletedParentAction) {
        Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID.getRoute(reportID));
    }
    else if (Navigation_1.default.isActiveRoute(ROUTES_1.default.REPORT_WITH_ID.getRoute(reportAction.childReportID)) && !isDeletedParentAction) {
        Navigation_1.default.goBack(undefined);
    }
}
/**
 * Removes the links in html of a comment.
 * example:
 *      html="test <a href="https://www.google.com" target="_blank" rel="noreferrer noopener">https://www.google.com</a> test"
 *      links=["https://www.google.com"]
 * returns: "test https://www.google.com test"
 */
function removeLinksFromHtml(html, links) {
    var htmlCopy = html.slice();
    links.forEach(function (link) {
        // We want to match the anchor tag of the link and replace the whole anchor tag with the text of the anchor tag
        var regex = new RegExp("<(a)[^><]*href\\s*=\\s*(['\"])(".concat(expensify_common_1.Str.escapeForRegExp(link), ")\\2(?:\".*?\"|'.*?'|[^'\"><])*>([\\s\\S]*?)<\\/\\1>(?![^<]*(<\\/pre>|<\\/code>))"), 'g');
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
function handleUserDeletedLinksInHtml(newCommentText, originalCommentMarkdown, videoAttributeCache) {
    if (newCommentText.length > CONST_1.default.MAX_MARKUP_LENGTH) {
        return newCommentText;
    }
    var textWithMention = (0, ReportUtils_1.completeShortMention)(newCommentText);
    var htmlForNewComment = Parser_1.default.replace(textWithMention, {
        extras: { videoAttributeCache: videoAttributeCache },
    });
    var removedLinks = Parser_1.default.getRemovedMarkdownLinks(originalCommentMarkdown, textWithMention);
    return removeLinksFromHtml(htmlForNewComment, removedLinks);
}
/** Saves a new message for a comment. Marks the comment as edited, which will be reflected in the UI. */
function editReportComment(reportID, originalReportAction, textForNewComment, videoAttributeCache) {
    var _a, _b, _c;
    var originalReportID = (0, ReportUtils_1.getOriginalReportID)(reportID, originalReportAction);
    if (!originalReportID || !originalReportAction) {
        return;
    }
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(originalReportID)];
    var canUserPerformWriteAction = (0, ReportUtils_1.canUserPerformWriteAction)(report);
    // Do not autolink if someone explicitly tries to remove a link from message.
    // https://github.com/Expensify/App/issues/9090
    // https://github.com/Expensify/App/issues/13221
    var originalCommentHTML = ReportActionsUtils.getReportActionHtml(originalReportAction);
    var originalCommentMarkdown = Parser_1.default.htmlToMarkdown(originalCommentHTML !== null && originalCommentHTML !== void 0 ? originalCommentHTML : '').trim();
    // Skip the Edit if draft is not changed
    if (originalCommentMarkdown === textForNewComment) {
        return;
    }
    var htmlForNewComment = handleUserDeletedLinksInHtml(textForNewComment, originalCommentMarkdown, videoAttributeCache);
    var reportComment = Parser_1.default.htmlToText(htmlForNewComment);
    // For comments shorter than or equal to 10k chars, convert the comment from MD into HTML because that's how it is stored in the database
    // For longer comments, skip parsing and display plaintext for performance reasons. It takes over 40s to parse a 100k long string!!
    var parsedOriginalCommentHTML = originalCommentHTML;
    if (textForNewComment.length <= CONST_1.default.MAX_MARKUP_LENGTH) {
        var autolinkFilter = { filterRules: Parser_1.default.rules.map(function (rule) { return rule.name; }).filter(function (name) { return name !== 'autolink'; }) };
        parsedOriginalCommentHTML = Parser_1.default.replace(originalCommentMarkdown, autolinkFilter);
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
    var reportActionID = originalReportAction.reportActionID;
    var originalMessage = ReportActionsUtils.getReportActionMessage(originalReportAction);
    var optimisticReportActions = (_a = {},
        _a[reportActionID] = {
            pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            message: [
                __assign(__assign({}, originalMessage), { type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT, isEdited: true, html: htmlForNewComment, text: reportComment }),
            ],
            lastModified: DateUtils_1.default.getDBTime(),
        },
        _a);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(originalReportID),
            value: optimisticReportActions,
        },
    ];
    var lastVisibleAction = ReportActionsUtils.getLastVisibleAction(originalReportID, canUserPerformWriteAction, optimisticReportActions);
    if (reportActionID === (lastVisibleAction === null || lastVisibleAction === void 0 ? void 0 : lastVisibleAction.reportActionID)) {
        var lastMessageText = (0, ReportUtils_1.formatReportLastMessageText)(reportComment);
        var optimisticReport = {
            lastMessageText: lastMessageText,
        };
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(originalReportID),
            value: optimisticReport,
        });
    }
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(originalReportID),
            value: (_b = {},
                _b[reportActionID] = __assign(__assign({}, originalReportAction), { pendingAction: null }),
                _b),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(originalReportID),
            value: (_c = {},
                _c[reportActionID] = {
                    pendingAction: null,
                },
                _c),
        },
    ];
    var parameters = {
        reportID: originalReportID,
        reportComment: htmlForNewComment,
        reportActionID: reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_COMMENT, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData }, {
        checkAndFixConflictingRequest: function (persistedRequests) {
            var addCommentIndex = persistedRequests.findIndex(function (request) { var _a; return addNewMessageWithText.has(request.command) && ((_a = request.data) === null || _a === void 0 ? void 0 : _a.reportActionID) === reportActionID; });
            if (addCommentIndex > -1) {
                return (0, RequestConflictUtils_1.resolveEditCommentWithNewAddCommentRequest)(persistedRequests, parameters, reportActionID, addCommentIndex);
            }
            return (0, RequestConflictUtils_1.resolveDuplicationConflictAction)(persistedRequests, (0, RequestConflictUtils_1.createUpdateCommentMatcher)(reportActionID));
        },
    });
}
/** Deletes the draft for a comment report action. */
function deleteReportActionDraft(reportID, reportAction) {
    var _a;
    var originalReportID = (0, ReportUtils_1.getOriginalReportID)(reportID, reportAction);
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS).concat(originalReportID), (_a = {}, _a[reportAction.reportActionID] = null, _a));
}
/** Saves the draft for a comment report action. This will put the comment into "edit mode" */
function saveReportActionDraft(reportID, reportAction, draftMessage) {
    var _a;
    var originalReportID = (0, ReportUtils_1.getOriginalReportID)(reportID, reportAction);
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS).concat(originalReportID), (_a = {}, _a[reportAction.reportActionID] = { message: draftMessage }, _a));
}
function updateNotificationPreference(reportID, previousValue, newValue, parentReportID, parentReportActionID) {
    var _a, _b, _c, _d;
    // No change needed
    if (previousValue === newValue) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                participants: (_a = {},
                    _a[currentUserAccountID] = {
                        notificationPreference: newValue,
                    },
                    _a),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                participants: (_b = {},
                    _b[currentUserAccountID] = {
                        notificationPreference: previousValue,
                    },
                    _b),
            },
        },
    ];
    if (parentReportID && parentReportActionID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReportID),
            value: (_c = {}, _c[parentReportActionID] = { childReportNotificationPreference: newValue }, _c),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReportID),
            value: (_d = {}, _d[parentReportActionID] = { childReportNotificationPreference: previousValue }, _d),
        });
    }
    var parameters = { reportID: reportID, notificationPreference: newValue };
    API.write(types_1.WRITE_COMMANDS.UPDATE_REPORT_NOTIFICATION_PREFERENCE, parameters, { optimisticData: optimisticData, failureData: failureData });
}
function updateRoomVisibility(reportID, previousValue, newValue) {
    if (previousValue === newValue) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: { visibility: newValue },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: { visibility: previousValue },
        },
    ];
    var parameters = { reportID: reportID, visibility: newValue };
    API.write(types_1.WRITE_COMMANDS.UPDATE_ROOM_VISIBILITY, parameters, { optimisticData: optimisticData, failureData: failureData });
}
/**
 * This will subscribe to an existing thread, or create a new one and then subscribe to it if necessary
 *
 * @param childReportID The reportID we are trying to open
 * @param parentReportAction the parent comment of a thread
 * @param parentReportID The reportID of the parent
 * @param prevNotificationPreference The previous notification preference for the child report
 */
function toggleSubscribeToChildReport(childReportID, parentReportAction, parentReportID, prevNotificationPreference) {
    var _a;
    if (parentReportAction === void 0) { parentReportAction = {}; }
    if (childReportID) {
        openReport(childReportID);
        var parentReportActionID = parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.reportActionID;
        if (!prevNotificationPreference || (0, ReportUtils_1.isHiddenForCurrentUser)(prevNotificationPreference)) {
            updateNotificationPreference(childReportID, prevNotificationPreference, CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, parentReportID, parentReportActionID);
        }
        else {
            updateNotificationPreference(childReportID, prevNotificationPreference, CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, parentReportID, parentReportActionID);
        }
    }
    else {
        var participantAccountIDs = __spreadArray([], new Set([currentUserAccountID, Number(parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actorAccountID)]), true);
        var parentReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReportID)];
        var newChat = (0, ReportUtils_1.buildOptimisticChatReport)({
            participantList: participantAccountIDs,
            reportName: ReportActionsUtils.getReportActionText(parentReportAction),
            chatType: parentReport === null || parentReport === void 0 ? void 0 : parentReport.chatType,
            policyID: (_a = parentReport === null || parentReport === void 0 ? void 0 : parentReport.policyID) !== null && _a !== void 0 ? _a : CONST_1.default.POLICY.OWNER_EMAIL_FAKE,
            ownerAccountID: CONST_1.default.POLICY.OWNER_ACCOUNT_ID_FAKE,
            notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            parentReportActionID: parentReportAction.reportActionID,
            parentReportID: parentReportID,
        });
        var participantLogins = PersonalDetailsUtils.getLoginsByAccountIDs(participantAccountIDs);
        openReport(newChat.reportID, '', participantLogins, newChat, parentReportAction.reportActionID);
        var notificationPreference = (0, ReportUtils_1.isHiddenForCurrentUser)(prevNotificationPreference) ? CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS : CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
        updateNotificationPreference(newChat.reportID, prevNotificationPreference, notificationPreference, parentReportID, parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.reportActionID);
    }
}
function updateReportName(reportID, value, previousValue) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                reportName: value,
                pendingFields: {
                    reportName: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                reportName: previousValue,
                pendingFields: {
                    reportName: null,
                },
                errorFields: {
                    reportName: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericUpdateReportNameEditFailureMessage'),
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
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
    var parameters = {
        reportID: reportID,
        reportName: value,
    };
    API.write(types_1.WRITE_COMMANDS.SET_REPORT_NAME, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function clearReportFieldKeyErrors(reportID, fieldKey) {
    var _a, _b;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), {
        pendingFields: (_a = {},
            _a[fieldKey] = null,
            _a),
        errorFields: (_b = {},
            _b[fieldKey] = null,
            _b),
    });
}
function updateReportField(reportID, reportField, previousReportField) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    var _s;
    var fieldKey = (0, ReportUtils_1.getReportFieldKey)(reportField.fieldID);
    var reportViolations = (0, ReportUtils_1.getReportViolations)(reportID);
    var fieldViolation = (0, ReportUtils_1.getFieldViolation)(reportViolations, reportField);
    var recentlyUsedValues = (_s = allRecentlyUsedReportFields === null || allRecentlyUsedReportFields === void 0 ? void 0 : allRecentlyUsedReportFields[fieldKey]) !== null && _s !== void 0 ? _s : [];
    var optimisticChangeFieldAction = (0, ReportUtils_1.buildOptimisticChangeFieldAction)(reportField, previousReportField);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                fieldList: (_a = {},
                    _a[fieldKey] = reportField,
                    _a),
                pendingFields: (_b = {},
                    _b[fieldKey] = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    _b),
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_c = {},
                _c[optimisticChangeFieldAction.reportActionID] = optimisticChangeFieldAction,
                _c),
        },
    ];
    if (fieldViolation) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_VIOLATIONS).concat(reportID),
            value: (_d = {},
                _d[fieldViolation] = (_e = {},
                    _e[reportField.fieldID] = null,
                    _e),
                _d),
        });
    }
    if (reportField.type === 'dropdown' && reportField.value) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.RECENTLY_USED_REPORT_FIELDS,
            value: (_f = {},
                _f[fieldKey] = __spreadArray([], new Set(__spreadArray(__spreadArray([], recentlyUsedValues, true), [reportField.value], false)), true),
                _f),
        });
    }
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                fieldList: (_g = {},
                    _g[fieldKey] = previousReportField,
                    _g),
                pendingFields: (_h = {},
                    _h[fieldKey] = null,
                    _h),
                errorFields: (_j = {},
                    _j[fieldKey] = (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericUpdateReportFieldFailureMessage'),
                    _j),
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_k = {},
                _k[optimisticChangeFieldAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericUpdateReportFieldFailureMessage'),
                },
                _k),
        },
    ];
    if (reportField.type === 'dropdown') {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.RECENTLY_USED_REPORT_FIELDS,
            value: (_l = {},
                _l[fieldKey] = recentlyUsedValues,
                _l),
        });
    }
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                pendingFields: (_m = {},
                    _m[fieldKey] = null,
                    _m),
                errorFields: (_o = {},
                    _o[fieldKey] = null,
                    _o),
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_p = {},
                _p[optimisticChangeFieldAction.reportActionID] = {
                    pendingAction: null,
                },
                _p),
        },
    ];
    var parameters = {
        reportID: reportID,
        reportFields: JSON.stringify((_q = {}, _q[fieldKey] = reportField, _q)),
        reportFieldsActionIDs: JSON.stringify((_r = {}, _r[fieldKey] = optimisticChangeFieldAction.reportActionID, _r)),
    };
    API.write(types_1.WRITE_COMMANDS.SET_REPORT_FIELD, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function deleteReportField(reportID, reportField) {
    var _a, _b, _c, _d, _e, _f, _g;
    var fieldKey = (0, ReportUtils_1.getReportFieldKey)(reportField.fieldID);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                fieldList: (_a = {},
                    _a[fieldKey] = null,
                    _a),
                pendingFields: (_b = {},
                    _b[fieldKey] = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    _b),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                fieldList: (_c = {},
                    _c[fieldKey] = reportField,
                    _c),
                pendingFields: (_d = {},
                    _d[fieldKey] = null,
                    _d),
                errorFields: (_e = {},
                    _e[fieldKey] = (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericUpdateReportFieldFailureMessage'),
                    _e),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                pendingFields: (_f = {},
                    _f[fieldKey] = null,
                    _f),
                errorFields: (_g = {},
                    _g[fieldKey] = null,
                    _g),
            },
        },
    ];
    var parameters = {
        reportID: reportID,
        fieldID: fieldKey,
    };
    API.write(types_1.WRITE_COMMANDS.DELETE_REPORT_FIELD, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateDescription(reportID, currentDescription, newMarkdownValue) {
    var _a, _b, _c;
    var _d, _e;
    // No change needed
    if (Parser_1.default.htmlToMarkdown(currentDescription) === newMarkdownValue) {
        return;
    }
    var parsedDescription = (0, ReportUtils_1.getParsedComment)(newMarkdownValue, { reportID: reportID });
    var optimisticDescriptionUpdatedReportAction = (0, ReportUtils_1.buildOptimisticRoomDescriptionUpdatedReportAction)(parsedDescription);
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                description: parsedDescription,
                pendingFields: { description: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE },
                lastActorAccountID: currentUserAccountID,
                lastVisibleActionCreated: optimisticDescriptionUpdatedReportAction.created,
                lastMessageText: (_e = (_d = optimisticDescriptionUpdatedReportAction === null || optimisticDescriptionUpdatedReportAction === void 0 ? void 0 : optimisticDescriptionUpdatedReportAction.message) === null || _d === void 0 ? void 0 : _d.at(0)) === null || _e === void 0 ? void 0 : _e.text,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_a = {},
                _a[optimisticDescriptionUpdatedReportAction.reportActionID] = optimisticDescriptionUpdatedReportAction,
                _a),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                description: currentDescription,
                pendingFields: { description: null },
                lastActorAccountID: report === null || report === void 0 ? void 0 : report.lastActorAccountID,
                lastVisibleActionCreated: report === null || report === void 0 ? void 0 : report.lastVisibleActionCreated,
                lastMessageText: report === null || report === void 0 ? void 0 : report.lastMessageText,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_b = {},
                _b[optimisticDescriptionUpdatedReportAction.reportActionID] = null,
                _b),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: { pendingFields: { description: null } },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_c = {},
                _c[optimisticDescriptionUpdatedReportAction.reportActionID] = { pendingAction: null },
                _c),
        },
    ];
    var parameters = { reportID: reportID, description: parsedDescription, reportActionID: optimisticDescriptionUpdatedReportAction.reportActionID };
    API.write(types_1.WRITE_COMMANDS.UPDATE_ROOM_DESCRIPTION, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateWriteCapability(report, newValue) {
    // No change needed
    if (report.writeCapability === newValue) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID),
            value: { writeCapability: newValue },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID),
            value: { writeCapability: report.writeCapability },
        },
    ];
    var parameters = { reportID: report.reportID, writeCapability: newValue };
    API.write(types_1.WRITE_COMMANDS.UPDATE_REPORT_WRITE_CAPABILITY, parameters, { optimisticData: optimisticData, failureData: failureData });
}
/**
 * Navigates to the 1:1 report with Concierge
 */
function navigateToConciergeChat(shouldDismissModal, checkIfCurrentPageActive, linkToOptions, reportActionID) {
    if (shouldDismissModal === void 0) { shouldDismissModal = false; }
    if (checkIfCurrentPageActive === void 0) { checkIfCurrentPageActive = function () { return true; }; }
    // If conciergeReportID contains a concierge report ID, we navigate to the concierge chat using the stored report ID.
    // Otherwise, we would find the concierge chat and navigate to it.
    if (!conciergeReportID) {
        // In order to avoid creating concierge repeatedly,
        // we need to ensure that the server data has been successfully pulled
        (0, Welcome_1.onServerDataReady)().then(function () {
            // If we don't have a chat with Concierge then create it
            if (!checkIfCurrentPageActive()) {
                return;
            }
            navigateToAndOpenReport([CONST_1.default.EMAIL.CONCIERGE], shouldDismissModal);
        });
    }
    else if (shouldDismissModal) {
        Navigation_1.default.dismissModalWithReport({ reportID: conciergeReportID, reportActionID: reportActionID });
    }
    else {
        Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(conciergeReportID), linkToOptions);
    }
}
function buildNewReportOptimisticData(policy, reportID, reportActionID, creatorPersonalDetails, reportPreviewReportActionID) {
    var _a, _b, _c, _d, _e;
    var accountID = creatorPersonalDetails.accountID, login = creatorPersonalDetails.login;
    var timeOfCreation = DateUtils_1.default.getDBTime();
    var parentReport = (0, ReportUtils_1.getPolicyExpenseChat)(accountID, policy === null || policy === void 0 ? void 0 : policy.id);
    var optimisticReportData = (0, ReportUtils_1.buildOptimisticEmptyReport)(reportID, accountID, parentReport, reportPreviewReportActionID, policy, timeOfCreation);
    var optimisticCreateAction = {
        action: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
        accountEmail: login,
        accountID: accountID,
        created: timeOfCreation,
        message: {
            isNewDot: true,
            lastModified: timeOfCreation,
        },
        reportActionID: reportActionID,
        reportID: reportID,
        sequenceNumber: 0,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
    var message = (0, ReportUtils_1.getReportPreviewMessage)(optimisticReportData);
    var createReportActionMessage = [
        {
            html: message,
            text: message,
            type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
        },
    ];
    var optimisticReportPreview = {
        action: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
        childReportName: optimisticReportData.reportName,
        childReportID: reportID,
        childType: CONST_1.default.REPORT.TYPE.EXPENSE,
        created: timeOfCreation,
        shouldShow: true,
        childOwnerAccountID: accountID,
        automatic: false,
        avatar: creatorPersonalDetails.avatar,
        isAttachmentOnly: false,
        reportActionID: reportPreviewReportActionID,
        message: createReportActionMessage,
        originalMessage: {
            linkedReportID: reportID,
        },
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: accountID,
    };
    var optimisticNextStep = (0, NextStepUtils_1.buildNextStep)(optimisticReportData, CONST_1.default.REPORT.STATUS_NUM.OPEN);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: optimisticReportData,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                hasOnceLoadedReportActions: true,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_a = {}, _a[reportActionID] = optimisticCreateAction, _a),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID),
            value: (_b = {}, _b[reportPreviewReportActionID] = optimisticReportPreview, _b),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID),
            value: { lastVisibleActionCreated: optimisticReportPreview.created },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(reportID),
            value: optimisticNextStep,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: {
                action: CONST_1.default.QUICK_ACTIONS.CREATE_REPORT,
                chatReportID: parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID,
                isFirstQuickAction: (0, EmptyObject_1.isEmptyObject)(quickAction),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: { errorFields: { createReport: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage') } },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_c = {}, _c[reportActionID] = { errorFields: { createReport: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage') } }, _c),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: quickAction !== null && quickAction !== void 0 ? quickAction : null,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID),
            value: { lastVisibleActionCreated: parentReport === null || parentReport === void 0 ? void 0 : parentReport.lastVisibleActionCreated },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
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
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_d = {},
                _d[reportActionID] = {
                    pendingAction: null,
                    errorFields: null,
                },
                _d),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID),
            value: (_e = {},
                _e[reportPreviewReportActionID] = {
                    pendingAction: null,
                    errorFields: null,
                },
                _e),
        },
    ];
    return {
        optimisticReportName: optimisticReportData.reportName,
        reportPreviewAction: optimisticReportPreview,
        parentReportID: parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID,
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    };
}
function createNewReport(creatorPersonalDetails, policyID, shouldNotifyNewAction) {
    if (shouldNotifyNewAction === void 0) { shouldNotifyNewAction = false; }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = (0, PolicyUtils_1.getPolicy)(policyID);
    var optimisticReportID = (0, ReportUtils_1.generateReportID)();
    var reportActionID = (0, NumberUtils_1.rand64)();
    var reportPreviewReportActionID = (0, NumberUtils_1.rand64)();
    var _a = buildNewReportOptimisticData(policy, optimisticReportID, reportActionID, creatorPersonalDetails, reportPreviewReportActionID), optimisticReportName = _a.optimisticReportName, parentReportID = _a.parentReportID, reportPreviewAction = _a.reportPreviewAction, optimisticData = _a.optimisticData, successData = _a.successData, failureData = _a.failureData;
    API.write(types_1.WRITE_COMMANDS.CREATE_APP_REPORT, { reportName: optimisticReportName, type: CONST_1.default.REPORT.TYPE.EXPENSE, policyID: policyID, reportID: optimisticReportID, reportActionID: reportActionID, reportPreviewReportActionID: reportPreviewReportActionID, shouldUpdateQAB: true }, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    if (shouldNotifyNewAction) {
        notifyNewAction(parentReportID, creatorPersonalDetails.accountID, reportPreviewAction);
    }
    return optimisticReportID;
}
/**
 * Removes the report after failure to create. Also removes it's related report actions and next step from Onyx.
 */
function removeFailedReport(reportID) {
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), null);
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(reportID), null);
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID), null);
}
/** Add a policy report (workspace room) optimistically and navigate to it. */
function addPolicyReport(policyReport) {
    var _a, _b;
    var createdReportAction = (0, ReportUtils_1.buildOptimisticCreatedReportAction)(CONST_1.default.POLICY.OWNER_EMAIL_FAKE);
    // Onyx.set is used on the optimistic data so that it is present before navigating to the workspace room. With Onyx.merge the workspace room reportID is not present when
    // fetchReportIfNeeded is called on the ReportScreen, so openReport is called which is unnecessary since the optimistic data will be stored in Onyx.
    // Therefore, Onyx.set is used instead of Onyx.merge.
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(policyReport.reportID),
            value: __assign({ pendingFields: {
                    addWorkspaceRoom: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                } }, policyReport),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(policyReport.reportID),
            value: (_a = {}, _a[createdReportAction.reportActionID] = createdReportAction, _a),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.NEW_ROOM_FORM,
            value: { isLoading: true },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(policyReport.reportID),
            value: {
                isOptimisticReport: true,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(policyReport.reportID),
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(policyReport.reportID),
            value: {
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(policyReport.reportID),
            value: (_b = {},
                _b[createdReportAction.reportActionID] = {
                    pendingAction: null,
                },
                _b),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.NEW_ROOM_FORM,
            value: { isLoading: false },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(policyReport.reportID),
            value: {
                errorFields: {
                    addWorkspaceRoom: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericCreateReportFailureMessage'),
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.NEW_ROOM_FORM,
            value: { isLoading: false },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(policyReport.reportID),
            value: {
                isOptimisticReport: false,
            },
        },
    ];
    var parameters = {
        policyID: policyReport.policyID,
        reportName: policyReport.reportName,
        visibility: policyReport.visibility,
        reportID: policyReport.reportID,
        createdReportActionID: createdReportAction.reportActionID,
        writeCapability: policyReport.writeCapability,
        description: policyReport.description,
    };
    API.write(types_1.WRITE_COMMANDS.ADD_WORKSPACE_ROOM, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    Navigation_1.default.dismissModalWithReport({ reportID: policyReport.reportID });
}
/** Deletes a report, along with its reportActions, any linked reports, and any linked IOU report. */
function deleteReport(reportID, shouldDeleteChildReports) {
    var _a;
    if (shouldDeleteChildReports === void 0) { shouldDeleteChildReports = false; }
    if (!reportID) {
        Log_1.default.warn('[Report] deleteReport called with no reportID');
        return;
    }
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    var onyxData = (_a = {},
        _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)] = null,
        _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID)] = null,
        _a);
    // Delete linked transactions
    var reportActionsForReport = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions[reportID];
    var transactionIDs = Object.values(reportActionsForReport !== null && reportActionsForReport !== void 0 ? reportActionsForReport : {})
        .filter(function (reportAction) { return ReportActionsUtils.isMoneyRequestAction(reportAction); })
        .map(function (reportAction) { var _a; return (_a = ReportActionsUtils.getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.IOUTransactionID; });
    __spreadArray([], new Set(transactionIDs), true).forEach(function (transactionID) {
        onyxData["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)] = null;
    });
    react_native_onyx_1.default.multiSet(onyxData);
    if (shouldDeleteChildReports) {
        Object.values(reportActionsForReport !== null && reportActionsForReport !== void 0 ? reportActionsForReport : {}).forEach(function (reportAction) {
            if (!reportAction.childReportID) {
                return;
            }
            deleteReport(reportAction.childReportID, shouldDeleteChildReports);
        });
    }
    // Delete linked IOU report
    if (report === null || report === void 0 ? void 0 : report.iouReportID) {
        deleteReport(report.iouReportID, shouldDeleteChildReports);
    }
}
/**
 * @param reportID The reportID of the policy report (workspace room)
 */
function navigateToConciergeChatAndDeleteReport(reportID, shouldPopToTop, shouldDeleteChildReports) {
    if (shouldPopToTop === void 0) { shouldPopToTop = false; }
    if (shouldDeleteChildReports === void 0) { shouldDeleteChildReports = false; }
    // Dismiss the current report screen and replace it with Concierge Chat
    if (shouldPopToTop) {
        Navigation_1.default.popToSidebar();
    }
    else {
        Navigation_1.default.goBack();
    }
    navigateToConciergeChat();
    react_native_1.InteractionManager.runAfterInteractions(function () {
        deleteReport(reportID, shouldDeleteChildReports);
    });
}
function clearCreateChatError(report) {
    var _a;
    var metaData = (0, ReportUtils_1.getReportMetadata)(report === null || report === void 0 ? void 0 : report.reportID);
    var isOptimisticReport = metaData === null || metaData === void 0 ? void 0 : metaData.isOptimisticReport;
    if (((_a = report === null || report === void 0 ? void 0 : report.errorFields) === null || _a === void 0 ? void 0 : _a.createChat) && !isOptimisticReport) {
        clearReportFieldKeyErrors(report.reportID, 'createChat');
        return;
    }
    navigateToConciergeChatAndDeleteReport(report === null || report === void 0 ? void 0 : report.reportID, undefined, true);
}
/**
 * @param policyRoomReport The policy room report
 * @param policyRoomName The updated name for the policy room
 */
function updatePolicyRoomName(policyRoomReport, policyRoomName) {
    var _a, _b, _c;
    var reportID = policyRoomReport.reportID;
    var previousName = policyRoomReport.reportName;
    // No change needed
    if (previousName === policyRoomName) {
        return;
    }
    var optimisticRenamedAction = (0, ReportUtils_1.buildOptimisticRenamedRoomReportAction)(policyRoomName, previousName !== null && previousName !== void 0 ? previousName : '');
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                reportName: policyRoomName,
                pendingFields: {
                    reportName: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    reportName: null,
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_a = {},
                _a[optimisticRenamedAction.reportActionID] = optimisticRenamedAction,
                _a),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                pendingFields: {
                    reportName: null,
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_b = {}, _b[optimisticRenamedAction.reportActionID] = { pendingAction: null }, _b),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                reportName: previousName,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_c = {}, _c[optimisticRenamedAction.reportActionID] = null, _c),
        },
    ];
    var parameters = {
        reportID: reportID,
        policyRoomName: policyRoomName,
        renamedRoomReportActionID: optimisticRenamedAction.reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_POLICY_ROOM_NAME, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * @param reportID The reportID of the policy room.
 */
function clearPolicyRoomNameErrors(reportID) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), {
        errorFields: {
            reportName: null,
        },
        pendingFields: {
            reportName: null,
        },
    });
}
function setIsComposerFullSize(reportID, isComposerFullSize) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE).concat(reportID), isComposerFullSize);
}
/**
 * @param action the associated report action (optional)
 * @param isRemote whether or not this notification is a remote push notification
 */
function shouldShowReportActionNotification(reportID, action, isRemote) {
    if (action === void 0) { action = null; }
    if (isRemote === void 0) { isRemote = false; }
    var tag = isRemote ? '[PushNotification]' : '[LocalNotification]';
    // Due to payload size constraints, some push notifications may have their report action stripped
    // so we must double check that we were provided an action before using it in these checks.
    if (action && ReportActionsUtils.isDeletedAction(action)) {
        Log_1.default.info("".concat(tag, " Skipping notification because the action was deleted"), false, { reportID: reportID, action: action });
        return false;
    }
    if (!ActiveClientManager.isClientTheLeader()) {
        Log_1.default.info("".concat(tag, " Skipping notification because this client is not the leader"));
        return false;
    }
    // We don't want to send a local notification if the user preference is daily, mute or hidden.
    var notificationPreference = (0, ReportUtils_1.getReportNotificationPreference)(allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)]);
    if (notificationPreference !== CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS) {
        Log_1.default.info("".concat(tag, " No notification because user preference is to be notified: ").concat(notificationPreference));
        return false;
    }
    // If this comment is from the current user we don't want to parrot whatever they wrote back to them.
    if (action && action.actorAccountID === currentUserAccountID) {
        Log_1.default.info("".concat(tag, " No notification because comment is from the currently logged in user"));
        return false;
    }
    // If we are currently viewing this report do not show a notification.
    if (reportID === Navigation_1.default.getTopmostReportId() && Visibility_1.default.isVisible() && Visibility_1.default.hasFocus()) {
        Log_1.default.info("".concat(tag, " No notification because it was a comment for the current report"));
        return false;
    }
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    if (!report || (report && report.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE)) {
        Log_1.default.info("".concat(tag, " No notification because the report does not exist or is pending deleted"), false);
        return false;
    }
    // If this notification was delayed and the user saw the message already, don't show it
    if (action && (report === null || report === void 0 ? void 0 : report.lastReadTime) && report.lastReadTime >= action.created) {
        Log_1.default.info("".concat(tag, " No notification because the comment was already read"), false, { created: action.created, lastReadTime: report.lastReadTime });
        return false;
    }
    // If this is a whisper targeted to someone else, don't show it
    if (action && ReportActionsUtils.isWhisperActionTargetedToOthers(action)) {
        Log_1.default.info("".concat(tag, " No notification because the action is whispered to someone else"), false);
        return false;
    }
    // Only show notifications for supported types of report actions
    if (action && !ReportActionsUtils.isNotifiableReportAction(action)) {
        Log_1.default.info("".concat(tag, " No notification because this action type is not supported"), false, { actionName: action === null || action === void 0 ? void 0 : action.actionName });
        return false;
    }
    return true;
}
function showReportActionNotification(reportID, reportAction) {
    if (!shouldShowReportActionNotification(reportID, reportAction)) {
        return;
    }
    Log_1.default.info('[LocalNotification] Creating notification');
    var localReportID = "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID);
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    if (!report) {
        Log_1.default.hmmm("[LocalNotification] couldn't show report action notification because the report wasn't found", { localReportID: localReportID, reportActionID: reportAction.reportActionID });
        return;
    }
    var onClick = function () { return (0, Modal_1.close)(function () { return (0, navigateFromNotification_1.default)(reportID); }); };
    if (reportAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE) {
        LocalNotification_1.default.showModifiedExpenseNotification(report, reportAction, onClick);
    }
    else {
        LocalNotification_1.default.showCommentNotification(report, reportAction, onClick);
    }
    notifyNewAction(reportID, reportAction.actorAccountID);
}
/** Clear the errors associated with the IOUs of a given report. */
function clearIOUError(reportID) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), { errorFields: { iou: null } });
}
/**
 * Adds a reaction to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 */
function addEmojiReaction(reportID, reportActionID, emoji, skinTone) {
    var _a, _b, _c, _d, _e;
    if (skinTone === void 0) { skinTone = preferredSkinTone; }
    var createdAt = (0, date_fns_tz_1.format)((0, date_fns_tz_1.toZonedTime)(new Date(), 'UTC'), CONST_1.default.DATE.FNS_DB_FORMAT_STRING);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_REACTIONS).concat(reportActionID),
            value: (_a = {},
                _a[emoji.name] = {
                    createdAt: createdAt,
                    pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    users: (_b = {},
                        _b[currentUserAccountID] = {
                            skinTones: (_c = {},
                                _c[skinTone !== null && skinTone !== void 0 ? skinTone : CONST_1.default.EMOJI_DEFAULT_SKIN_TONE] = createdAt,
                                _c),
                        },
                        _b),
                },
                _a),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_REACTIONS).concat(reportActionID),
            value: (_d = {},
                _d[emoji.name] = {
                    pendingAction: null,
                },
                _d),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_REACTIONS).concat(reportActionID),
            value: (_e = {},
                _e[emoji.name] = {
                    pendingAction: null,
                },
                _e),
        },
    ];
    var parameters = {
        reportID: reportID,
        skinTone: skinTone,
        emojiCode: emoji.name,
        reportActionID: reportActionID,
        createdAt: createdAt,
        // This will be removed as part of https://github.com/Expensify/App/issues/19535
        useEmojiReactions: true,
    };
    API.write(types_1.WRITE_COMMANDS.ADD_EMOJI_REACTION, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Removes a reaction to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 */
function removeEmojiReaction(reportID, reportActionID, emoji) {
    var _a, _b;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_REACTIONS).concat(reportActionID),
            value: (_a = {},
                _a[emoji.name] = {
                    users: (_b = {},
                        _b[currentUserAccountID] = null,
                        _b),
                },
                _a),
        },
    ];
    var parameters = {
        reportID: reportID,
        reportActionID: reportActionID,
        emojiCode: emoji.name,
        // This will be removed as part of https://github.com/Expensify/App/issues/19535
        useEmojiReactions: true,
    };
    API.write(types_1.WRITE_COMMANDS.REMOVE_EMOJI_REACTION, parameters, { optimisticData: optimisticData });
}
/**
 * Calls either addEmojiReaction or removeEmojiReaction depending on if the current user has reacted to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 */
function toggleEmojiReaction(reportID, reportAction, reactionObject, existingReactions, paramSkinTone, ignoreSkinToneOnCompare) {
    if (paramSkinTone === void 0) { paramSkinTone = preferredSkinTone; }
    if (ignoreSkinToneOnCompare === void 0) { ignoreSkinToneOnCompare = false; }
    var originalReportID = (0, ReportUtils_1.getOriginalReportID)(reportID, reportAction);
    if (!originalReportID) {
        return;
    }
    var originalReportAction = ReportActionsUtils.getReportAction(originalReportID, reportAction.reportActionID);
    if ((0, EmptyObject_1.isEmptyObject)(originalReportAction)) {
        return;
    }
    // This will get cleaned up as part of https://github.com/Expensify/App/issues/16506 once the old emoji
    // format is no longer being used
    var emoji = EmojiUtils.findEmojiByCode(reactionObject.code);
    var existingReactionObject = existingReactions === null || existingReactions === void 0 ? void 0 : existingReactions[emoji.name];
    // Only use skin tone if emoji supports it
    var skinTone = emoji.types === undefined ? -1 : paramSkinTone;
    if (existingReactionObject && EmojiUtils.hasAccountIDEmojiReacted(currentUserAccountID, existingReactionObject.users, ignoreSkinToneOnCompare ? undefined : skinTone)) {
        removeEmojiReaction(originalReportID, reportAction.reportActionID, emoji);
        return;
    }
    addEmojiReaction(originalReportID, reportAction.reportActionID, emoji, skinTone);
}
function doneCheckingPublicRoom() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.IS_CHECKING_PUBLIC_ROOM, false);
}
function openReportFromDeepLink(url) {
    var reportID = (0, ReportUtils_1.getReportIDFromLink)(url);
    var isAuthenticated = (0, Session_1.hasAuthToken)();
    if (reportID && !isAuthenticated) {
        // Call the OpenReport command to check in the server if it's a public room. If so, we'll open it as an anonymous user
        openReport(reportID, '', [], undefined, '0', true);
        // Show the sign-in page if the app is offline
        if (networkStatus === CONST_1.default.NETWORK.NETWORK_STATUS.OFFLINE) {
            doneCheckingPublicRoom();
        }
    }
    else {
        // If we're not opening a public room (no reportID) or the user is authenticated, we unblock the UI (hide splash screen)
        doneCheckingPublicRoom();
    }
    var route = (0, ReportUtils_1.getRouteFromLink)(url);
    // Bing search results still link to /signin when searching for “Expensify”, but the /signin route no longer exists in our repo, so we redirect it to the home page to avoid showing a Not Found page.
    if ((0, normalizePath_1.default)(route) === CONST_1.default.SIGNIN_ROUTE) {
        route = '';
    }
    // If we are not authenticated and are navigating to a public screen, we don't want to navigate again to the screen after sign-in/sign-up
    if (!isAuthenticated && (0, isPublicScreenRoute_1.default)(route)) {
        return;
    }
    // Navigate to the report after sign-in/sign-up.
    react_native_1.InteractionManager.runAfterInteractions(function () {
        (0, Session_1.waitForUserSignIn)().then(function () {
            var connection = react_native_onyx_1.default.connect({
                key: ONYXKEYS_1.default.NVP_ONBOARDING,
                callback: function (val) {
                    if (!val && !(0, Session_1.isAnonymousUser)()) {
                        return;
                    }
                    Navigation_1.default.waitForProtectedRoutes().then(function () {
                        if (route && (0, Session_1.isAnonymousUser)() && !(0, Session_1.canAnonymousUserAccessRoute)(route)) {
                            (0, Session_1.signOutAndRedirectToSignIn)(true);
                            return;
                        }
                        // We don't want to navigate to the exitTo route when creating a new workspace from a deep link,
                        // because we already handle creating the optimistic policy and navigating to it in App.setUpPoliciesAndNavigate,
                        // which is already called when AuthScreens mounts.
                        if (!CONFIG_1.default.IS_HYBRID_APP && url && new URL(url).searchParams.get('exitTo') === ROUTES_1.default.WORKSPACE_NEW) {
                            return;
                        }
                        var handleDeeplinkNavigation = function () {
                            var _a;
                            // We want to disconnect the connection so it won't trigger the deeplink again
                            // every time the data is changed, for example, when re-login.
                            react_native_onyx_1.default.disconnect(connection);
                            var state = Navigation_1.navigationRef.getRootState();
                            var currentFocusedRoute = (0, native_1.findFocusedRoute)(state);
                            if ((0, isNavigatorName_1.isOnboardingFlowName)(currentFocusedRoute === null || currentFocusedRoute === void 0 ? void 0 : currentFocusedRoute.name)) {
                                (0, Welcome_1.setOnboardingErrorMessage)(Localize.translateLocal('onboarding.purpose.errorBackButton'));
                                return;
                            }
                            if ((0, shouldSkipDeepLinkNavigation_1.default)(route)) {
                                return;
                            }
                            // Check if the report exists in the collection
                            var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
                            // If the report does not exist, navigate to the last accessed report or Concierge chat
                            if (reportID && !report) {
                                var lastAccessedReportID = (_a = (0, ReportUtils_1.findLastAccessedReport)(false, (0, shouldOpenOnAdminRoom_1.default)(), undefined, reportID)) === null || _a === void 0 ? void 0 : _a.reportID;
                                if (lastAccessedReportID) {
                                    var lastAccessedReportRoute = ROUTES_1.default.REPORT_WITH_ID.getRoute(lastAccessedReportID);
                                    Navigation_1.default.navigate(lastAccessedReportRoute);
                                    return;
                                }
                                navigateToConciergeChat(false, function () { return true; });
                                return;
                            }
                            Navigation_1.default.navigate(route);
                        };
                        if ((0, Session_1.isAnonymousUser)()) {
                            handleDeeplinkNavigation();
                            return;
                        }
                        // We need skip deeplinking if the user hasn't completed the guided setup flow.
                        (0, Welcome_1.isOnboardingFlowCompleted)({
                            onNotCompleted: function () {
                                return (0, OnboardingFlow_1.startOnboardingFlow)({
                                    onboardingValuesParam: val,
                                    hasAccessiblePolicies: !!(account === null || account === void 0 ? void 0 : account.hasAccessibleDomainPolicies),
                                    isUserFromPublicDomain: !!(account === null || account === void 0 ? void 0 : account.isFromPublicDomain),
                                });
                            },
                            onCompleted: handleDeeplinkNavigation,
                            onCanceled: handleDeeplinkNavigation,
                        });
                    });
                },
            });
        });
    });
}
function getCurrentUserAccountID() {
    return currentUserAccountID;
}
function getCurrentUserEmail() {
    return currentUserEmail;
}
function navigateToMostRecentReport(currentReport) {
    var _a;
    var lastAccessedReportID = (_a = (0, ReportUtils_1.findLastAccessedReport)(false, false, undefined, currentReport === null || currentReport === void 0 ? void 0 : currentReport.reportID)) === null || _a === void 0 ? void 0 : _a.reportID;
    if (lastAccessedReportID) {
        var lastAccessedReportRoute = ROUTES_1.default.REPORT_WITH_ID.getRoute(lastAccessedReportID);
        Navigation_1.default.goBack(lastAccessedReportRoute);
    }
    else {
        var isChatThread = (0, ReportUtils_1.isChatThread)(currentReport);
        // If it is not a chat thread we should call Navigation.goBack to pop the current route first before navigating to Concierge.
        if (!isChatThread) {
            Navigation_1.default.goBack();
        }
        navigateToConciergeChat(false, function () { return true; }, { forceReplace: true });
    }
}
function getMostRecentReportID(currentReport) {
    var _a;
    var lastAccessedReportID = (_a = (0, ReportUtils_1.findLastAccessedReport)(false, false, undefined, currentReport === null || currentReport === void 0 ? void 0 : currentReport.reportID)) === null || _a === void 0 ? void 0 : _a.reportID;
    return lastAccessedReportID !== null && lastAccessedReportID !== void 0 ? lastAccessedReportID : conciergeReportID;
}
function joinRoom(report) {
    if (!report) {
        return;
    }
    updateNotificationPreference(report.reportID, (0, ReportUtils_1.getReportNotificationPreference)(report), (0, ReportUtils_1.getDefaultNotificationPreferenceForReport)(report), report.parentReportID, report.parentReportActionID);
}
function leaveGroupChat(reportID) {
    var _a;
    var _b;
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    if (!report) {
        Log_1.default.warn('Attempting to leave Group Chat that does not existing locally');
        return;
    }
    // Use merge instead of set to avoid deleting the report too quickly, which could cause a brief "not found" page to appear.
    // The remaining parts of the report object will be removed after the API call is successful.
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                reportID: null,
                stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED,
                participants: (_a = {},
                    _a[currentUserAccountID] = {
                        notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                    _a),
            },
        },
    ];
    // Clean up any quick actions for the report we're leaving from
    if (((_b = quickAction === null || quickAction === void 0 ? void 0 : quickAction.chatReportID) === null || _b === void 0 ? void 0 : _b.toString()) === reportID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: null,
        });
    }
    // Ensure that any remaining data is removed upon successful completion, even if the server sends a report removal response.
    // This is done to prevent the removal update from lingering in the applyHTTPSOnyxUpdates function.
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: null,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: report,
        },
    ];
    navigateToMostRecentReport(report);
    API.write(types_1.WRITE_COMMANDS.LEAVE_GROUP_CHAT, { reportID: reportID }, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/** Leave a report by setting the state to submitted and closed */
function leaveRoom(reportID, isWorkspaceMemberLeavingWorkspaceRoom) {
    var _a, _b, _c, _d, _e, _f;
    var _g, _h, _j;
    if (isWorkspaceMemberLeavingWorkspaceRoom === void 0) { isWorkspaceMemberLeavingWorkspaceRoom = false; }
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    if (!report) {
        return;
    }
    var isChatThread = (0, ReportUtils_1.isChatThread)(report);
    // Pusher's leavingStatus should be sent earlier.
    // Place the broadcast before calling the LeaveRoom API to prevent a race condition
    // between Onyx report being null and Pusher's leavingStatus becoming true.
    broadcastUserIsLeavingRoom(reportID);
    // If a workspace member is leaving a workspace room, they don't actually lose the room from Onyx.
    // Instead, their notification preference just gets set to "hidden".
    // Same applies for chat threads too
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: isWorkspaceMemberLeavingWorkspaceRoom || isChatThread
                ? {
                    participants: (_a = {},
                        _a[currentUserAccountID] = {
                            notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                        },
                        _a),
                }
                : {
                    reportID: null,
                    stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED,
                    participants: (_b = {},
                        _b[currentUserAccountID] = {
                            notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                        },
                        _b),
                },
        },
    ];
    var successData = [];
    if (isWorkspaceMemberLeavingWorkspaceRoom || isChatThread) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                participants: (_c = {},
                    _c[currentUserAccountID] = {
                        notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                    _c),
            },
        });
    }
    else {
        // Use the Onyx.set method to remove all other key values except reportName to prevent showing the room name as random numbers after leaving it.
        // See https://github.com/Expensify/App/issues/55676 for more information.
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: { reportName: report.reportName },
        });
    }
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: report,
        },
    ];
    if (report.parentReportID && report.parentReportActionID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.parentReportID),
            value: (_d = {}, _d[report.parentReportActionID] = { childReportNotificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN }, _d),
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.parentReportID),
            value: (_e = {}, _e[report.parentReportActionID] = { childReportNotificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN }, _e),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.parentReportID),
            value: (_f = {},
                _f[report.parentReportActionID] = {
                    childReportNotificationPreference: (_j = (_h = (_g = report === null || report === void 0 ? void 0 : report.participants) === null || _g === void 0 ? void 0 : _g[currentUserAccountID]) === null || _h === void 0 ? void 0 : _h.notificationPreference) !== null && _j !== void 0 ? _j : (0, ReportUtils_1.getDefaultNotificationPreferenceForReport)(report),
                },
                _f),
        });
    }
    var parameters = {
        reportID: reportID,
    };
    API.write(types_1.WRITE_COMMANDS.LEAVE_ROOM, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    // If this is the leave action from a workspace room, simply dismiss the modal, i.e., allow the user to view the room and join again immediately.
    // If this is the leave action from a chat thread (even if the chat thread is in a room), do not allow the user to stay in the thread after leaving.
    if (isWorkspaceMemberLeavingWorkspaceRoom && !isChatThread) {
        return;
    }
    // In other cases, the report is deleted and we should move the user to another report.
    navigateToMostRecentReport(report);
}
function buildInviteToRoomOnyxData(reportID, inviteeEmailsToAccountIDs) {
    var _a, _b, _c;
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    var reportMetadata = (0, ReportUtils_1.getReportMetadata)(reportID);
    var isGroupChat = (0, ReportUtils_1.isGroupChat)(report);
    var defaultNotificationPreference = (0, ReportUtils_1.getDefaultNotificationPreferenceForReport)(report);
    var inviteeEmails = Object.keys(inviteeEmailsToAccountIDs);
    var inviteeAccountIDs = Object.values(inviteeEmailsToAccountIDs);
    var logins = inviteeEmails.map(function (memberLogin) { return PhoneNumber.addSMSDomainIfPhoneNumber(memberLogin); });
    var _d = PersonalDetailsUtils.getNewAccountIDsAndLogins(logins, inviteeAccountIDs), newAccountIDs = _d.newAccountIDs, newLogins = _d.newLogins;
    var participantsAfterInvitation = inviteeAccountIDs.reduce(function (reportParticipants, accountID) {
        var participant = {
            notificationPreference: defaultNotificationPreference,
            role: CONST_1.default.REPORT.ROLE.MEMBER,
        };
        // eslint-disable-next-line no-param-reassign
        reportParticipants[accountID] = participant;
        return reportParticipants;
    }, __assign({}, report === null || report === void 0 ? void 0 : report.participants));
    var newPersonalDetailsOnyxData = PersonalDetailsUtils.getPersonalDetailsOnyxDataForOptimisticUsers(newLogins, newAccountIDs);
    var pendingChatMembers = (0, ReportUtils_1.getPendingChatMembers)(inviteeAccountIDs, (_a = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) !== null && _a !== void 0 ? _a : [], CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    var newParticipantAccountCleanUp = newAccountIDs.reduce(function (participantCleanUp, newAccountID) {
        // eslint-disable-next-line no-param-reassign
        participantCleanUp[newAccountID] = null;
        return participantCleanUp;
    }, {});
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                participants: participantsAfterInvitation,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                pendingChatMembers: pendingChatMembers,
            },
        },
    ];
    optimisticData.push.apply(optimisticData, newPersonalDetailsOnyxData.optimisticData);
    var successPendingChatMembers = (reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers)
        ? (_b = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) === null || _b === void 0 ? void 0 : _b.filter(function (pendingMember) { return !(inviteeAccountIDs.includes(Number(pendingMember.accountID)) && pendingMember.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE); })
        : null;
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                participants: newParticipantAccountCleanUp,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                pendingChatMembers: successPendingChatMembers,
            },
        },
    ];
    successData.push.apply(successData, newPersonalDetailsOnyxData.finallyData);
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                pendingChatMembers: (_c = pendingChatMembers.map(function (pendingChatMember) {
                    if (!inviteeAccountIDs.includes(Number(pendingChatMember.accountID))) {
                        return pendingChatMember;
                    }
                    return __assign(__assign({}, pendingChatMember), { errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('roomMembersPage.error.genericAdd') });
                })) !== null && _c !== void 0 ? _c : null,
            },
        },
    ];
    return { optimisticData: optimisticData, successData: successData, failureData: failureData, isGroupChat: isGroupChat, inviteeEmails: inviteeEmails, newAccountIDs: newAccountIDs };
}
/** Invites people to a room */
function inviteToRoom(reportID, inviteeEmailsToAccountIDs) {
    var _a = buildInviteToRoomOnyxData(reportID, inviteeEmailsToAccountIDs), optimisticData = _a.optimisticData, successData = _a.successData, failureData = _a.failureData, isGroupChat = _a.isGroupChat, inviteeEmails = _a.inviteeEmails, newAccountIDs = _a.newAccountIDs;
    if (isGroupChat) {
        var parameters_1 = {
            reportID: reportID,
            inviteeEmails: inviteeEmails,
            accountIDList: newAccountIDs.join(),
        };
        API.write(types_1.WRITE_COMMANDS.INVITE_TO_GROUP_CHAT, parameters_1, { optimisticData: optimisticData, successData: successData, failureData: failureData });
        return;
    }
    var parameters = {
        reportID: reportID,
        inviteeEmails: inviteeEmails,
        accountIDList: newAccountIDs.join(),
    };
    // eslint-disable-next-line rulesdir/no-multiple-api-calls
    API.write(types_1.WRITE_COMMANDS.INVITE_TO_ROOM, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function clearAddRoomMemberError(reportID, invitedAccountID) {
    var _a, _b;
    var _c;
    var reportMetadata = (0, ReportUtils_1.getReportMetadata)(reportID);
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), {
        participants: (_a = {},
            _a[invitedAccountID] = null,
            _a),
    });
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID), {
        pendingChatMembers: (_c = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) === null || _c === void 0 ? void 0 : _c.filter(function (pendingChatMember) { return pendingChatMember.accountID !== invitedAccountID; }),
    });
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_b = {},
        _b[invitedAccountID] = null,
        _b));
}
function updateGroupChatMemberRoles(reportID, accountIDList, role) {
    var memberRoles = {};
    var optimisticParticipants = {};
    var successParticipants = {};
    accountIDList.forEach(function (accountID) {
        memberRoles[accountID] = role;
        optimisticParticipants[accountID] = {
            role: role,
            pendingFields: {
                role: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
            pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        };
        successParticipants[accountID] = {
            pendingFields: {
                role: null,
            },
            pendingAction: null,
        };
    });
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: { participants: optimisticParticipants },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: { participants: successParticipants },
        },
    ];
    var parameters = { reportID: reportID, memberRoles: JSON.stringify(memberRoles) };
    API.write(types_1.WRITE_COMMANDS.UPDATE_GROUP_CHAT_MEMBER_ROLES, parameters, { optimisticData: optimisticData, successData: successData });
}
/** Invites people to a group chat */
function inviteToGroupChat(reportID, inviteeEmailsToAccountIDs) {
    inviteToRoom(reportID, inviteeEmailsToAccountIDs);
}
/** Removes people from a room
 *  Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
 */
function removeFromRoom(reportID, targetAccountIDs) {
    var _a, _b, _c;
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    var reportMetadata = (0, ReportUtils_1.getReportMetadata)(reportID);
    if (!report) {
        return;
    }
    var removeParticipantsData = {};
    targetAccountIDs.forEach(function (accountID) {
        removeParticipantsData[accountID] = null;
    });
    var pendingChatMembers = (0, ReportUtils_1.getPendingChatMembers)(targetAccountIDs, (_a = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) !== null && _a !== void 0 ? _a : [], CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                pendingChatMembers: pendingChatMembers,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                pendingChatMembers: (_b = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) !== null && _b !== void 0 ? _b : null,
            },
        },
    ];
    // We need to add success data here since in high latency situations,
    // the OpenRoomMembersPage call has the chance of overwriting the optimistic data we set above.
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                participants: removeParticipantsData,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                pendingChatMembers: (_c = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) !== null && _c !== void 0 ? _c : null,
            },
        },
    ];
    if ((0, ReportUtils_1.isGroupChat)(report)) {
        var parameters_2 = {
            reportID: reportID,
            accountIDList: targetAccountIDs.join(),
        };
        API.write(types_1.WRITE_COMMANDS.REMOVE_FROM_GROUP_CHAT, parameters_2, { optimisticData: optimisticData, failureData: failureData, successData: successData });
        return;
    }
    var parameters = {
        reportID: reportID,
        targetAccountIDs: targetAccountIDs,
    };
    // eslint-disable-next-line rulesdir/no-multiple-api-calls
    API.write(types_1.WRITE_COMMANDS.REMOVE_FROM_ROOM, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function removeFromGroupChat(reportID, accountIDList) {
    removeFromRoom(reportID, accountIDList);
}
function setLastOpenedPublicRoom(reportID) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.LAST_OPENED_PUBLIC_ROOM_ID, reportID);
}
/** Navigates to the last opened public room */
function openLastOpenedPublicRoom(lastOpenedPublicRoomID) {
    Navigation_1.default.isNavigationReady().then(function () {
        setLastOpenedPublicRoom('');
        Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(lastOpenedPublicRoomID));
    });
}
/** Flag a comment as offensive */
function flagComment(reportID, reportAction, severity) {
    var _a, _b, _c;
    var originalReportID = (0, ReportUtils_1.getOriginalReportID)(reportID, reportAction);
    var message = ReportActionsUtils.getReportActionMessage(reportAction);
    if (!message || !reportAction) {
        return;
    }
    var updatedDecision;
    if (severity === CONST_1.default.MODERATION.FLAG_SEVERITY_SPAM || severity === CONST_1.default.MODERATION.FLAG_SEVERITY_INCONSIDERATE) {
        if (!(message === null || message === void 0 ? void 0 : message.moderationDecision)) {
            updatedDecision = {
                decision: CONST_1.default.MODERATION.MODERATOR_DECISION_PENDING,
            };
        }
        else {
            updatedDecision = message.moderationDecision;
        }
    }
    else if (severity === CONST_1.default.MODERATION.FLAG_SEVERITY_ASSAULT || severity === CONST_1.default.MODERATION.FLAG_SEVERITY_HARASSMENT) {
        updatedDecision = {
            decision: CONST_1.default.MODERATION.MODERATOR_DECISION_PENDING_REMOVE,
        };
    }
    else {
        updatedDecision = {
            decision: CONST_1.default.MODERATION.MODERATOR_DECISION_PENDING_HIDE,
        };
    }
    var reportActionID = reportAction.reportActionID;
    var updatedMessage = __assign(__assign({}, message), { moderationDecision: updatedDecision });
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(originalReportID),
            value: (_a = {},
                _a[reportActionID] = {
                    pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    message: [updatedMessage],
                },
                _a),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(originalReportID),
            value: (_b = {},
                _b[reportActionID] = __assign(__assign({}, reportAction), { pendingAction: null }),
                _b),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(originalReportID),
            value: (_c = {},
                _c[reportActionID] = {
                    pendingAction: null,
                },
                _c),
        },
    ];
    var parameters = {
        severity: severity,
        reportActionID: reportActionID,
        // This check is to prevent flooding Concierge with test flags
        // If you need to test moderation responses from Concierge on dev, set this to false!
        isDevRequest: Environment.isDevelopment(),
    };
    API.write(types_1.WRITE_COMMANDS.FLAG_COMMENT, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/** Updates a given user's private notes on a report */
var updatePrivateNotes = function (reportID, accountID, note) {
    var _a, _b, _c;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                privateNotes: (_a = {},
                    _a[accountID] = {
                        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        errors: null,
                        note: note,
                    },
                    _a),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                privateNotes: (_b = {},
                    _b[accountID] = {
                        pendingAction: null,
                        errors: null,
                    },
                    _b),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                privateNotes: (_c = {},
                    _c[accountID] = {
                        errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('privateNotes.error.genericFailureMessage'),
                    },
                    _c),
            },
        },
    ];
    var parameters = { reportID: reportID, privateNotes: note };
    API.write(types_1.WRITE_COMMANDS.UPDATE_REPORT_PRIVATE_NOTE, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
};
exports.updatePrivateNotes = updatePrivateNotes;
/** Fetches all the private notes for a given report */
function getReportPrivateNote(reportID) {
    if ((0, Session_1.isAnonymousUser)()) {
        return;
    }
    if (!reportID) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                isLoadingPrivateNotes: true,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                isLoadingPrivateNotes: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID),
            value: {
                isLoadingPrivateNotes: false,
            },
        },
    ];
    var parameters = { reportID: reportID };
    API.read(types_1.READ_COMMANDS.GET_REPORT_PRIVATE_NOTE, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function completeOnboarding(_a) {
    var engagementChoice = _a.engagementChoice, onboardingMessage = _a.onboardingMessage, _b = _a.firstName, firstName = _b === void 0 ? '' : _b, _c = _a.lastName, lastName = _c === void 0 ? '' : _c, adminsChatReportID = _a.adminsChatReportID, onboardingPolicyID = _a.onboardingPolicyID, paymentSelected = _a.paymentSelected, companySize = _a.companySize, userReportedIntegration = _a.userReportedIntegration, wasInvited = _a.wasInvited;
    var onboardingData = (0, ReportUtils_1.prepareOnboardingOnyxData)(introSelected, engagementChoice, onboardingMessage, adminsChatReportID, onboardingPolicyID, userReportedIntegration, wasInvited, companySize);
    if (!onboardingData) {
        return;
    }
    var optimisticData = onboardingData.optimisticData, successData = onboardingData.successData, failureData = onboardingData.failureData, guidedSetupData = onboardingData.guidedSetupData, actorAccountID = onboardingData.actorAccountID, selfDMParameters = onboardingData.selfDMParameters;
    var parameters = {
        engagementChoice: engagementChoice,
        firstName: firstName,
        lastName: lastName,
        actorAccountID: actorAccountID,
        guidedSetupData: JSON.stringify(guidedSetupData),
        paymentSelected: paymentSelected,
        companySize: companySize,
        userReportedIntegration: userReportedIntegration,
        policyID: onboardingPolicyID,
        selfDMReportID: selfDMParameters.reportID,
        selfDMCreatedReportActionID: selfDMParameters.createdReportActionID,
    };
    if ((0, OnboardingUtils_1.shouldOnboardingRedirectToOldDot)(companySize, userReportedIntegration)) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_ONBOARDING,
            value: { isLoading: true },
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_ONBOARDING,
            value: { isLoading: false },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_ONBOARDING,
            value: { isLoading: false },
        });
    }
    API.write(types_1.WRITE_COMMANDS.COMPLETE_GUIDED_SETUP, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/** Loads necessary data for rendering the RoomMembersPage */
function openRoomMembersPage(reportID) {
    var parameters = { reportID: reportID };
    API.read(types_1.READ_COMMANDS.OPEN_ROOM_MEMBERS_PAGE, parameters);
}
/**
 * Checks if there are any errors in the private notes for a given report
 *
 * @returns Returns true if there are errors in any of the private notes on the report
 */
function hasErrorInPrivateNotes(report) {
    var _a;
    var privateNotes = (_a = report === null || report === void 0 ? void 0 : report.privateNotes) !== null && _a !== void 0 ? _a : {};
    return Object.values(privateNotes).some(function (privateNote) { return !(0, isEmpty_1.default)(privateNote.errors); });
}
/** Clears all errors associated with a given private note */
function clearPrivateNotesError(reportID, accountID) {
    var _a;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), { privateNotes: (_a = {}, _a[accountID] = { errors: null }, _a) });
}
function getDraftPrivateNote(reportID) {
    var _a;
    return (_a = draftNoteMap === null || draftNoteMap === void 0 ? void 0 : draftNoteMap[reportID]) !== null && _a !== void 0 ? _a : '';
}
/**
 * Saves the private notes left by the user as they are typing. By saving this data the user can switch between chats, close
 * tab, refresh etc without worrying about loosing what they typed out.
 */
function savePrivateNotesDraft(reportID, note) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.PRIVATE_NOTES_DRAFT).concat(reportID), note);
}
function searchForReports(searchInput, policyID) {
    // We do not try to make this request while offline because it sets a loading indicator optimistically
    if (isNetworkOffline) {
        react_native_onyx_1.default.set(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, false);
        return;
    }
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS,
            value: false,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS,
            value: false,
        },
    ];
    var searchForRoomToMentionParams = { query: searchInput, policyID: policyID };
    var searchForReportsParams = { searchInput: searchInput, canCancel: true };
    // We want to cancel all pending SearchForReports API calls before making another one
    if (!policyID) {
        HttpUtils_1.default.cancelPendingRequests(types_1.READ_COMMANDS.SEARCH_FOR_REPORTS);
    }
    API.read(policyID ? types_1.READ_COMMANDS.SEARCH_FOR_ROOMS_TO_MENTION : types_1.READ_COMMANDS.SEARCH_FOR_REPORTS, policyID ? searchForRoomToMentionParams : searchForReportsParams, {
        successData: successData,
        failureData: failureData,
    });
}
function searchInServer(searchInput, policyID) {
    if (isNetworkOffline || !searchInput.trim().length) {
        react_native_onyx_1.default.set(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, false);
        return;
    }
    // Why not set this in optimistic data? It won't run until the API request happens and while the API request is debounced
    // we want to show the loading state right away. Otherwise, we will see a flashing UI where the client options are sorted and
    // tell the user there are no options, then we start searching, and tell them there are no options again.
    react_native_onyx_1.default.set(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, true);
    searchForReports(searchInput, policyID);
}
function updateLastVisitTime(reportID) {
    if (!(0, ReportUtils_1.isValidReportIDFromPath)(reportID)) {
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID), { lastVisitTime: DateUtils_1.default.getDBTime() });
}
function updateLoadingInitialReportAction(reportID) {
    if (!(0, ReportUtils_1.isValidReportIDFromPath)(reportID)) {
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID), { isLoadingInitialReportActions: false });
}
function setNewRoomFormLoading(isLoading) {
    if (isLoading === void 0) { isLoading = true; }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.FORMS.NEW_ROOM_FORM), { isLoading: isLoading });
}
function clearNewRoomFormError() {
    var _a;
    return react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.NEW_ROOM_FORM, (_a = {
            isLoading: false,
            errorFields: null,
            errors: null
        },
        _a[NewRoomForm_1.default.ROOM_NAME] = '',
        _a[NewRoomForm_1.default.REPORT_DESCRIPTION] = '',
        _a[NewRoomForm_1.default.POLICY_ID] = '',
        _a[NewRoomForm_1.default.WRITE_CAPABILITY] = '',
        _a[NewRoomForm_1.default.VISIBILITY] = '',
        _a));
}
function resolveActionableMentionWhisper(reportID, reportAction, resolution) {
    var _a, _b, _c;
    var message = ReportActionsUtils.getReportActionMessage(reportAction);
    if (!message || !reportAction || !reportID) {
        return;
    }
    var updatedMessage = __assign(__assign({}, message), { resolution: resolution });
    var optimisticReportActions = (_a = {},
        _a[reportAction.reportActionID] = {
            originalMessage: {
                resolution: resolution,
            },
        },
        _a);
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    var reportUpdateDataWithPreviousLastMessage = (0, ReportUtils_1.getReportLastMessage)(reportID, optimisticReportActions);
    var reportUpdateDataWithCurrentLastMessage = {
        lastMessageText: report === null || report === void 0 ? void 0 : report.lastMessageText,
        lastVisibleActionCreated: report === null || report === void 0 ? void 0 : report.lastVisibleActionCreated,
        lastActorAccountID: report === null || report === void 0 ? void 0 : report.lastActorAccountID,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_b = {},
                _b[reportAction.reportActionID] = {
                    message: [updatedMessage],
                    originalMessage: {
                        resolution: resolution,
                    },
                },
                _b),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: reportUpdateDataWithPreviousLastMessage,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_c = {},
                _c[reportAction.reportActionID] = {
                    message: [message],
                    originalMessage: {
                        resolution: null,
                    },
                },
                _c),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: reportUpdateDataWithCurrentLastMessage, // revert back to the current report last message data in case of failure
        },
    ];
    var parameters = {
        reportActionID: reportAction.reportActionID,
        resolution: resolution,
    };
    API.write(types_1.WRITE_COMMANDS.RESOLVE_ACTIONABLE_MENTION_WHISPER, parameters, { optimisticData: optimisticData, failureData: failureData });
}
function resolveActionableReportMentionWhisper(reportId, reportAction, resolution) {
    var _a, _b, _c;
    if (!reportAction || !reportId) {
        return;
    }
    var optimisticReportActions = (_a = {},
        _a[reportAction.reportActionID] = {
            originalMessage: {
                resolution: resolution,
            },
        },
        _a);
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportId)];
    var reportUpdateDataWithPreviousLastMessage = (0, ReportUtils_1.getReportLastMessage)(reportId, optimisticReportActions);
    var reportUpdateDataWithCurrentLastMessage = {
        lastMessageText: report === null || report === void 0 ? void 0 : report.lastMessageText,
        lastVisibleActionCreated: report === null || report === void 0 ? void 0 : report.lastVisibleActionCreated,
        lastActorAccountID: report === null || report === void 0 ? void 0 : report.lastActorAccountID,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportId),
            value: (_b = {},
                _b[reportAction.reportActionID] = {
                    originalMessage: {
                        resolution: resolution,
                    },
                },
                _b),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportId),
            value: reportUpdateDataWithPreviousLastMessage,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportId),
            value: (_c = {},
                _c[reportAction.reportActionID] = {
                    originalMessage: {
                        resolution: null,
                    },
                },
                _c),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportId),
            value: reportUpdateDataWithCurrentLastMessage, // revert back to the current report last message data in case of failure
        },
    ];
    var parameters = {
        reportActionID: reportAction.reportActionID,
        resolution: resolution,
    };
    API.write(types_1.WRITE_COMMANDS.RESOLVE_ACTIONABLE_REPORT_MENTION_WHISPER, parameters, { optimisticData: optimisticData, failureData: failureData });
}
function dismissTrackExpenseActionableWhisper(reportID, reportAction) {
    var _a, _b;
    var isArrayMessage = Array.isArray(reportAction === null || reportAction === void 0 ? void 0 : reportAction.message);
    var message = ReportActionsUtils.getReportActionMessage(reportAction);
    if (!message || !reportAction || !reportID) {
        return;
    }
    var updatedMessage = __assign(__assign({}, message), { resolution: CONST_1.default.REPORT.ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION.NOTHING });
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_a = {},
                _a[reportAction.reportActionID] = {
                    message: isArrayMessage ? [updatedMessage] : updatedMessage,
                    originalMessage: {
                        resolution: CONST_1.default.REPORT.ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION.NOTHING,
                    },
                },
                _a),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_b = {},
                _b[reportAction.reportActionID] = {
                    message: [message],
                    originalMessage: {
                        resolution: null,
                    },
                },
                _b),
        },
    ];
    var params = {
        reportActionID: reportAction.reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.DISMISS_TRACK_EXPENSE_ACTIONABLE_WHISPER, params, { optimisticData: optimisticData, failureData: failureData });
}
function setGroupDraft(newGroupDraft) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NEW_GROUP_CHAT_DRAFT, newGroupDraft);
}
function exportToIntegration(reportID, connectionName) {
    var _a, _b, _c;
    var action = (0, ReportUtils_1.buildOptimisticExportIntegrationAction)(connectionName);
    var optimisticReportActionID = action.reportActionID;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_a = {},
                _a[optimisticReportActionID] = action,
                _a),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_b = {},
                _b[optimisticReportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('common.genericErrorMessage'),
                },
                _b),
        },
    ];
    var params = {
        reportIDList: reportID,
        connectionName: connectionName,
        type: 'MANUAL',
        optimisticReportActions: JSON.stringify((_c = {},
            _c[reportID] = optimisticReportActionID,
            _c)),
    };
    API.write(types_1.WRITE_COMMANDS.REPORT_EXPORT, params, { optimisticData: optimisticData, failureData: failureData });
}
function markAsManuallyExported(reportID, connectionName) {
    var _a, _b, _c;
    var action = (0, ReportUtils_1.buildOptimisticExportIntegrationAction)(connectionName, true);
    var label = CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName];
    var optimisticReportActionID = action.reportActionID;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_a = {},
                _a[optimisticReportActionID] = action,
                _a),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_b = {},
                _b[optimisticReportActionID] = {
                    pendingAction: null,
                },
                _b),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_c = {},
                _c[optimisticReportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('common.genericErrorMessage'),
                },
                _c),
        },
    ];
    var params = {
        markedManually: true,
        data: JSON.stringify([
            {
                reportID: reportID,
                label: label,
                optimisticReportActionID: optimisticReportActionID,
            },
        ]),
    };
    API.write(types_1.WRITE_COMMANDS.MARK_AS_EXPORTED, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function exportReportToCSV(_a, onDownloadFailed) {
    var reportID = _a.reportID, transactionIDList = _a.transactionIDList;
    var finalParameters = (0, enhanceParameters_1.default)(types_1.WRITE_COMMANDS.EXPORT_REPORT_TO_CSV, {
        reportID: reportID,
        transactionIDList: transactionIDList,
    });
    var formData = new FormData();
    Object.entries(finalParameters).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (Array.isArray(value)) {
            formData.append(key, value.join(','));
        }
        else {
            formData.append(key, String(value));
        }
    });
    (0, fileDownload_1.default)(ApiUtils.getCommandURL({ command: types_1.WRITE_COMMANDS.EXPORT_REPORT_TO_CSV }), 'Expensify.csv', '', false, formData, CONST_1.default.NETWORK.METHOD.POST, onDownloadFailed);
}
function exportReportToPDF(_a) {
    var reportID = _a.reportID;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME).concat(reportID),
            value: null,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME).concat(reportID),
            value: 'error',
        },
    ];
    var params = {
        reportID: reportID,
    };
    API.write(types_1.WRITE_COMMANDS.EXPORT_REPORT_TO_PDF, params, { optimisticData: optimisticData, failureData: failureData });
}
function downloadReportPDF(fileName, reportName) {
    var baseURL = (0, Url_1.addTrailingForwardSlash)((0, Environment_1.getOldDotURLFromEnvironment)(environment));
    var downloadFileName = "".concat(reportName, ".pdf");
    (0, Download_1.setDownload)(fileName, true);
    var pdfURL = "".concat(baseURL, "secure?secureType=pdfreport&filename=").concat(encodeURIComponent(fileName), "&downloadName=").concat(encodeURIComponent(downloadFileName), "&email=").concat(encodeURIComponent(currentUserEmail !== null && currentUserEmail !== void 0 ? currentUserEmail : ''));
    // The shouldOpenExternalLink parameter must always be set to
    // true to avoid CORS errors for as long as we use the OD URL.
    // See https://github.com/Expensify/App/issues/61937
    (0, fileDownload_1.default)((0, addEncryptedAuthTokenToURL_1.default)(pdfURL, true), downloadFileName, '', true).then(function () { return (0, Download_1.setDownload)(fileName, false); });
}
function setDeleteTransactionNavigateBackUrl(url) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL, url);
}
function clearDeleteTransactionNavigateBackUrl() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL, null);
}
/** Deletes a report and un-reports all transactions on the report along with its reportActions, any linked reports and any linked IOU report actions. */
function deleteAppReport(reportID) {
    var _a, _b, _c, _d;
    if (!reportID) {
        Log_1.default.warn('[Report] deleteReport called with no reportID');
        return;
    }
    var optimisticData = [];
    var successData = [];
    var failureData = [];
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    var selfDMReportID = (0, ReportUtils_1.findSelfDMReportID)();
    var selfDMReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(selfDMReportID)];
    var createdAction;
    var selfDMParameters = {};
    if (!selfDMReport) {
        var currentTime = DateUtils_1.default.getDBTime();
        selfDMReport = (0, ReportUtils_1.buildOptimisticSelfDMReport)(currentTime);
        selfDMReportID = selfDMReport.reportID;
        createdAction = (0, ReportUtils_1.buildOptimisticCreatedReportAction)(currentUserEmail !== null && currentUserEmail !== void 0 ? currentUserEmail : '', currentTime);
        selfDMParameters = { reportID: selfDMReport.reportID, createdReportActionID: createdAction.reportActionID };
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(selfDMReport.reportID),
            value: __assign(__assign({}, selfDMReport), { pendingFields: {
                    createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                } }),
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(selfDMReport.reportID),
            value: {
                isOptimisticReport: true,
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(selfDMReport.reportID),
            value: (_a = {},
                _a[createdAction.reportActionID] = createdAction,
                _a),
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(selfDMReport.reportID),
            value: {
                pendingFields: {
                    createChat: null,
                },
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(selfDMReport.reportID),
            value: {
                isOptimisticReport: false,
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(selfDMReport.reportID),
            value: (_b = {},
                _b[createdAction.reportActionID] = {
                    pendingAction: null,
                },
                _b),
        });
    }
    // 1. Get all report transactions
    var reportActionsForReport = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions[reportID];
    var transactionIDToReportActionAndThreadData = {};
    Object.values(reportActionsForReport !== null && reportActionsForReport !== void 0 ? reportActionsForReport : {}).forEach(function (reportAction) {
        var _a, _b, _c, _d, _e;
        var _f;
        if (!ReportActionsUtils.isMoneyRequestAction(reportAction)) {
            return;
        }
        var originalMessage = ReportActionsUtils.getOriginalMessage(reportAction);
        if ((originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type) !== CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE && (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type) !== CONST_1.default.IOU.REPORT_ACTION_TYPE.TRACK) {
            return;
        }
        var transactionID = (_f = ReportActionsUtils.getOriginalMessage(reportAction)) === null || _f === void 0 ? void 0 : _f.IOUTransactionID;
        var childReportID = reportAction.childReportID;
        var newReportActionID = (0, NumberUtils_1.rand64)();
        // 1. Update the transaction and its violations
        if (transactionID) {
            var transaction = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
            var transactionViolations = allTransactionViolations === null || allTransactionViolations === void 0 ? void 0 : allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID)];
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
                value: { reportID: CONST_1.default.REPORT.UNREPORTED_REPORT_ID },
            }, {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
                value: null,
            });
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID),
                value: { reportID: transaction === null || transaction === void 0 ? void 0 : transaction.reportID },
            }, {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
                value: transactionViolations,
            });
        }
        // 2. Move the report action to self DM
        var updatedReportAction = __assign(__assign({}, reportAction), { originalMessage: __assign(__assign({}, reportAction.originalMessage), { IOUReportID: CONST_1.default.REPORT.UNREPORTED_REPORT_ID, type: CONST_1.default.IOU.TYPE.TRACK }), reportActionID: newReportActionID, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD });
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(selfDMReportID),
            value: (_a = {}, _a[newReportActionID] = updatedReportAction, _a),
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(selfDMReportID),
            value: (_b = {}, _b[newReportActionID] = { pendingAction: null }, _b),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(selfDMReportID),
            value: (_c = {}, _c[newReportActionID] = null, _c),
        });
        // 3. Update transaction thread
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(childReportID),
            value: {
                parentReportActionID: newReportActionID,
                parentReportID: selfDMReportID,
                chatReportID: selfDMReportID,
                policyID: CONST_1.default.POLICY.ID_FAKE,
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(childReportID),
            value: (_d = {},
                _d[newReportActionID] = {
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                    originalMessage: {
                        IOUTransactionID: transactionID,
                        movedToReportID: selfDMReportID,
                    },
                },
                _d),
        });
        // 4. Add UNREPORTED_TRANSACTION report action
        var unreportedAction = (0, ReportUtils_1.buildOptimisticUnreportedTransactionAction)(childReportID, reportID);
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(childReportID),
            value: (_e = {}, _e[unreportedAction.reportActionID] = unreportedAction, _e),
        });
        if (transactionID) {
            transactionIDToReportActionAndThreadData[transactionID] = {
                moneyRequestPreviewReportActionID: newReportActionID,
                movedReportActionID: unreportedAction === null || unreportedAction === void 0 ? void 0 : unreportedAction.reportActionID,
            };
        }
    });
    // 6. Delete report actions on the report
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
        value: null,
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
        value: reportActionsForReport,
    });
    // 7. Delete the report
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
        value: null,
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
        value: report,
    });
    // 8. Delete chat report preview
    var reportActionID = report === null || report === void 0 ? void 0 : report.parentReportActionID;
    var reportAction = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions[reportID];
    var parentReportID = report === null || report === void 0 ? void 0 : report.parentReportID;
    if (reportActionID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReportID),
            value: (_c = {},
                _c[reportActionID] = null,
                _c),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReportID),
            value: (_d = {},
                _d[reportActionID] = reportAction,
                _d),
        });
    }
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.parentReportID),
        value: { hasOutstandingChildRequest: false },
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.parentReportID),
        value: { hasOutstandingChildRequest: report === null || report === void 0 ? void 0 : report.hasOutstandingChildRequest },
    });
    var parameters = {
        reportID: reportID,
        transactionIDToReportActionAndThreadData: JSON.stringify(transactionIDToReportActionAndThreadData),
        selfDMReportID: selfDMParameters.reportID,
        selfDMCreatedReportActionID: selfDMParameters.createdReportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.DELETE_APP_REPORT, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Moves an IOU report to a policy by converting it to an expense report
 * @param reportID - The ID of the IOU report to move
 * @param policyID - The ID of the policy to move the report to
 */
function moveIOUReportToPolicy(reportID, policyID) {
    var _a, _b, _c, _d, _e, _f, _g;
    var _h, _j, _k, _l;
    var iouReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = (0, PolicyUtils_1.getPolicy)(policyID);
    // This flow only works for IOU reports
    if (!policy || !iouReport || !(0, ReportUtils_1.isIOUReportUsingReport)(iouReport)) {
        return;
    }
    var isReimbursed = (0, ReportUtils_1.isReportManuallyReimbursed)(iouReport);
    // We do not want to create negative amount expenses
    if (!isReimbursed && ReportActionsUtils.hasRequestFromCurrentAccount(reportID, (_h = iouReport.managerID) !== null && _h !== void 0 ? _h : CONST_1.default.DEFAULT_NUMBER_ID)) {
        return;
    }
    // Generate new variables for the policy
    var policyName = (_j = policy.name) !== null && _j !== void 0 ? _j : '';
    var iouReportID = iouReport.reportID;
    var employeeAccountID = iouReport.ownerAccountID;
    var expenseChatReportId = (_k = (0, ReportUtils_1.getPolicyExpenseChat)(employeeAccountID, policyID)) === null || _k === void 0 ? void 0 : _k.reportID;
    if (!expenseChatReportId) {
        return;
    }
    var optimisticData = [];
    var successData = [];
    var failureData = [];
    // Next we need to convert the IOU report to Expense report.
    // We need to change:
    // - report type
    // - change the sign of the report total
    // - update its policyID and policyName
    // - update the chatReportID to point to the expense chat if the policy has policy expense chat enabled
    var expenseReport = __assign(__assign({}, iouReport), { chatReportID: policy.isPolicyExpenseChatEnabled ? expenseChatReportId : undefined, policyID: policyID, policyName: policyName, parentReportID: iouReport.parentReportID, type: CONST_1.default.REPORT.TYPE.EXPENSE, total: -((_l = iouReport === null || iouReport === void 0 ? void 0 : iouReport.total) !== null && _l !== void 0 ? _l : 0) });
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReportID),
        value: expenseReport,
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReportID),
        value: iouReport,
    });
    // The expense report transactions need to have the amount reversed to negative values
    var reportTransactions = (0, ReportUtils_1.getReportTransactions)(iouReportID);
    // For performance reasons, we are going to compose a merge collection data for transactions
    var transactionsOptimisticData = {};
    var transactionFailureData = {};
    reportTransactions.forEach(function (transaction) {
        transactionsOptimisticData["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID)] = __assign(__assign({}, transaction), { amount: -transaction.amount, modifiedAmount: transaction.modifiedAmount ? -transaction.modifiedAmount : 0 });
        transactionFailureData["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID)] = transaction;
    });
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE_COLLECTION,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION),
        value: transactionsOptimisticData,
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE_COLLECTION,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION),
        value: transactionFailureData,
    });
    // We need to move the report preview action from the DM to the expense chat.
    var parentReportActions = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(iouReport.parentReportID)];
    var parentReportActionID = iouReport.parentReportActionID;
    var reportPreview = (iouReport === null || iouReport === void 0 ? void 0 : iouReport.parentReportID) && parentReportActionID ? parentReportActions === null || parentReportActions === void 0 ? void 0 : parentReportActions[parentReportActionID] : undefined;
    var oldChatReportID = iouReport.chatReportID;
    if (reportPreview === null || reportPreview === void 0 ? void 0 : reportPreview.reportActionID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(oldChatReportID),
            value: (_a = {}, _a[reportPreview.reportActionID] = null, _a),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(oldChatReportID),
            value: (_b = {}, _b[reportPreview.reportActionID] = reportPreview, _b),
        });
        // Add the reportPreview action to expense chat
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseChatReportId),
            value: (_c = {}, _c[reportPreview.reportActionID] = __assign(__assign({}, reportPreview), { created: DateUtils_1.default.getDBTime() }), _c),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseChatReportId),
            value: (_d = {}, _d[reportPreview.reportActionID] = null, _d),
        });
    }
    // Create the CHANGE_POLICY report action and add it to the expense report which indicates to the user where the report has been moved
    var changePolicyReportAction = (0, ReportUtils_1.buildOptimisticChangePolicyReportAction)(iouReport.policyID, policyID, true);
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
        value: (_e = {}, _e[changePolicyReportAction.reportActionID] = changePolicyReportAction, _e),
    });
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
        value: (_f = {},
            _f[changePolicyReportAction.reportActionID] = __assign(__assign({}, changePolicyReportAction), { pendingAction: null }),
            _f),
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
        value: (_g = {}, _g[changePolicyReportAction.reportActionID] = null, _g),
    });
    // To optimistically remove the GBR from the DM we need to update the hasOutstandingChildRequest param to false
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oldChatReportID),
        value: {
            hasOutstandingChildRequest: false,
            iouReportID: null,
        },
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oldChatReportID),
        value: {
            hasOutstandingChildRequest: true,
            iouReportID: iouReportID,
        },
    });
    var parameters = {
        iouReportID: iouReportID,
        policyID: policyID,
        changePolicyReportActionID: changePolicyReportAction.reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.MOVE_IOU_REPORT_TO_EXISTING_POLICY, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Moves an IOU report to a policy by converting it to an expense report
 * @param reportID - The ID of the IOU report to move
 * @param policyID - The ID of the policy to move the report to
 */
function moveIOUReportToPolicyAndInviteSubmitter(reportID, policyID) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var _m, _o, _p;
    var iouReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = (0, PolicyUtils_1.getPolicy)(policyID);
    if (!policy || !iouReport) {
        return;
    }
    var isPolicyAdmin = (0, PolicyUtils_1.isPolicyAdmin)(policy);
    var submitterAccountID = iouReport.ownerAccountID;
    var submitterEmail = PersonalDetailsUtils.getLoginByAccountID(submitterAccountID !== null && submitterAccountID !== void 0 ? submitterAccountID : CONST_1.default.DEFAULT_NUMBER_ID);
    var submitterLogin = PhoneNumber.addSMSDomainIfPhoneNumber(submitterEmail);
    // This flow only works for admins moving an IOU report to a policy where the submitter is NOT yet a member of the policy
    if (!isPolicyAdmin || !(0, ReportUtils_1.isIOUReportUsingReport)(iouReport) || !submitterAccountID || !submitterEmail || (0, PolicyUtils_1.isPolicyMember)(submitterLogin, policyID)) {
        return;
    }
    var isReimbursed = (0, ReportUtils_1.isReportManuallyReimbursed)(iouReport);
    // We only allow moving IOU report to a policy if it doesn't have requests from multiple users, as we do not want to create negative amount expenses
    if (!isReimbursed && ReportActionsUtils.hasRequestFromCurrentAccount(reportID, (_m = iouReport.managerID) !== null && _m !== void 0 ? _m : CONST_1.default.DEFAULT_NUMBER_ID)) {
        return;
    }
    var optimisticData = [];
    var successData = [];
    var failureData = [];
    // Optimistically add the submitter to the workspace and create a expense chat for them
    var policyKey = "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID);
    var invitedEmailsToAccountIDs = (_a = {},
        _a[submitterEmail] = submitterAccountID,
        _a);
    // Set up new member optimistic data
    var role = CONST_1.default.POLICY.ROLE.USER;
    // Get personal details onyx data (similar to addMembersToWorkspace)
    var _q = PersonalDetailsUtils.getNewAccountIDsAndLogins([submitterLogin], [submitterAccountID]), newAccountIDs = _q.newAccountIDs, newLogins = _q.newLogins;
    var newPersonalDetailsOnyxData = PersonalDetailsUtils.getPersonalDetailsOnyxDataForOptimisticUsers(newLogins, newAccountIDs);
    // Build announce room members data for the new member
    var announceRoomMembers = (0, Member_1.buildRoomMembersOnyxData)(CONST_1.default.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, policyID, [submitterAccountID]);
    // Create policy expense chat for the submitter
    var policyExpenseChats = (0, Policy_1.createPolicyExpenseChats)(policyID, invitedEmailsToAccountIDs);
    var optimisticPolicyExpenseChatReportID = policyExpenseChats.reportCreationData[submitterEmail].reportID;
    var optimisticPolicyExpenseChatCreatedReportActionID = policyExpenseChats.reportCreationData[submitterEmail].reportActionID;
    // Set up optimistic member state
    var optimisticMembersState = (_b = {},
        _b[submitterLogin] = {
            role: role,
            email: submitterLogin,
            pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            submitsTo: (0, PolicyUtils_1.getDefaultApprover)(allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies[policyKey]),
        },
        _b);
    var successMembersState = (_c = {},
        _c[submitterLogin] = { pendingAction: null },
        _c);
    var failureMembersState = (_d = {},
        _d[submitterLogin] = {
            errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('workspace.people.error.genericAdd'),
        },
        _d);
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: policyKey,
        value: {
            employeeList: optimisticMembersState,
        },
    });
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: policyKey,
        value: {
            employeeList: successMembersState,
        },
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: policyKey,
        value: {
            employeeList: failureMembersState,
        },
    });
    optimisticData.push.apply(optimisticData, __spreadArray(__spreadArray(__spreadArray([], newPersonalDetailsOnyxData.optimisticData, false), policyExpenseChats.onyxOptimisticData, false), announceRoomMembers.optimisticData, false));
    successData.push.apply(successData, __spreadArray(__spreadArray(__spreadArray([], newPersonalDetailsOnyxData.finallyData, false), policyExpenseChats.onyxSuccessData, false), announceRoomMembers.successData, false));
    failureData.push.apply(failureData, __spreadArray(__spreadArray([], policyExpenseChats.onyxFailureData, false), announceRoomMembers.failureData, false));
    // Next we need to convert the IOU report to Expense report.
    // We need to change:
    // - report type
    // - change the sign of the report total
    // - update its policyID and policyName
    // - update the chatReportID to point to the expense chat if the policy has policy expense chat enabled
    var expenseReport = __assign(__assign({}, iouReport), { chatReportID: optimisticPolicyExpenseChatReportID, policyID: policyID, policyName: policy.name, parentReportID: optimisticPolicyExpenseChatReportID, type: CONST_1.default.REPORT.TYPE.EXPENSE, total: -((_o = iouReport === null || iouReport === void 0 ? void 0 : iouReport.total) !== null && _o !== void 0 ? _o : 0) });
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
        value: expenseReport,
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
        value: iouReport,
    });
    // The expense report transactions need to have the amount reversed to negative values
    var reportTransactions = (0, ReportUtils_1.getReportTransactions)(reportID);
    // For performance reasons, we are going to compose a merge collection data for transactions
    var transactionsOptimisticData = {};
    var transactionFailureData = {};
    reportTransactions.forEach(function (transaction) {
        transactionsOptimisticData["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID)] = __assign(__assign({}, transaction), { amount: -transaction.amount, modifiedAmount: transaction.modifiedAmount ? -transaction.modifiedAmount : 0 });
        transactionFailureData["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID)] = transaction;
    });
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE_COLLECTION,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION),
        value: transactionsOptimisticData,
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE_COLLECTION,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION),
        value: transactionFailureData,
    });
    // We need to move the report preview action from the DM to the expense chat.
    var oldChatReportID = iouReport.chatReportID;
    var reportPreviewActionID = iouReport.parentReportActionID;
    var reportPreview = !!oldChatReportID && !!reportPreviewActionID ? (_p = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions[oldChatReportID]) === null || _p === void 0 ? void 0 : _p[reportPreviewActionID] : undefined;
    if (reportPreview === null || reportPreview === void 0 ? void 0 : reportPreview.reportActionID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(oldChatReportID),
            value: (_e = {}, _e[reportPreview.reportActionID] = null, _e),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(oldChatReportID),
            value: (_f = {}, _f[reportPreview.reportActionID] = reportPreview, _f),
        });
        // Add the reportPreview action to expense chat
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticPolicyExpenseChatReportID),
            value: (_g = {}, _g[reportPreview.reportActionID] = __assign(__assign({}, reportPreview), { created: DateUtils_1.default.getDBTime() }), _g),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticPolicyExpenseChatReportID),
            value: (_h = {}, _h[reportPreview.reportActionID] = null, _h),
        });
    }
    // Create the CHANGE_POLICY report action and add it to the expense report which indicates to the user where the report has been moved
    var changePolicyReportAction = (0, ReportUtils_1.buildOptimisticChangePolicyReportAction)(iouReport.policyID, policyID, true);
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
        value: (_j = {}, _j[changePolicyReportAction.reportActionID] = changePolicyReportAction, _j),
    });
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
        value: (_k = {},
            _k[changePolicyReportAction.reportActionID] = __assign(__assign({}, changePolicyReportAction), { pendingAction: null }),
            _k),
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
        value: (_l = {}, _l[changePolicyReportAction.reportActionID] = null, _l),
    });
    // To optimistically remove the GBR from the DM we need to update the hasOutstandingChildRequest param to false
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oldChatReportID),
        value: {
            hasOutstandingChildRequest: false,
            iouReportID: null,
        },
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oldChatReportID),
        value: {
            hasOutstandingChildRequest: true,
            iouReportID: reportID,
        },
    });
    var parameters = {
        iouReportID: reportID,
        policyID: policyID,
        policyExpenseChatReportID: optimisticPolicyExpenseChatReportID !== null && optimisticPolicyExpenseChatReportID !== void 0 ? optimisticPolicyExpenseChatReportID : String(CONST_1.default.DEFAULT_NUMBER_ID),
        policyExpenseCreatedReportActionID: optimisticPolicyExpenseChatCreatedReportActionID !== null && optimisticPolicyExpenseChatCreatedReportActionID !== void 0 ? optimisticPolicyExpenseChatCreatedReportActionID : String(CONST_1.default.DEFAULT_NUMBER_ID),
        changePolicyReportActionID: changePolicyReportAction.reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.MOVE_IOU_REPORT_TO_POLICY_AND_INVITE_SUBMITTER, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Dismisses the change report policy educational modal so that it doesn't show up again.
 */
function dismissChangePolicyModal() {
    var _a;
    var date = new Date();
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING,
            value: (_a = {},
                _a[CONST_1.default.CHANGE_POLICY_TRAINING_MODAL] = {
                    timestamp: DateUtils_1.default.getDBTime(date.valueOf()),
                    dismissedMethod: 'click',
                },
                _a),
        },
    ];
    API.write(types_1.WRITE_COMMANDS.DISMISS_PRODUCT_TRAINING, { name: CONST_1.default.CHANGE_POLICY_TRAINING_MODAL, dismissedMethod: 'click' }, { optimisticData: optimisticData });
}
/**
 * @private
 * Builds a map of parentReportID to child report IDs for efficient traversal.
 */
function buildReportIDToThreadsReportIDsMap() {
    var reportIDToThreadsReportIDsMap = {};
    Object.values(allReports !== null && allReports !== void 0 ? allReports : {}).forEach(function (report) {
        if (!(report === null || report === void 0 ? void 0 : report.parentReportID)) {
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
function updatePolicyIdForReportAndThreads(currentReportID, policyID, reportIDToThreadsReportIDsMap, optimisticData, failureData) {
    var currentReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(currentReportID)];
    var originalPolicyID = currentReport === null || currentReport === void 0 ? void 0 : currentReport.policyID;
    if (originalPolicyID) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(currentReportID),
            value: { policyID: policyID },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(currentReportID),
            value: { policyID: originalPolicyID },
        });
    }
    // Recursively process child reports for the current report
    var childReportIDs = reportIDToThreadsReportIDsMap[currentReportID] || [];
    childReportIDs.forEach(function (childReportID) {
        updatePolicyIdForReportAndThreads(childReportID, policyID, reportIDToThreadsReportIDsMap, optimisticData, failureData);
    });
}
function navigateToTrainingModal(dismissedProductTrainingNVP, reportID) {
    if (dismissedProductTrainingNVP === null || dismissedProductTrainingNVP === void 0 ? void 0 : dismissedProductTrainingNVP[CONST_1.default.CHANGE_POLICY_TRAINING_MODAL]) {
        return;
    }
    Navigation_1.default.navigate(ROUTES_1.default.CHANGE_POLICY_EDUCATIONAL.getRoute(ROUTES_1.default.REPORT_WITH_ID.getRoute(reportID)));
}
function buildOptimisticChangePolicyData(report, policyID, reportNextStep) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var _l, _m, _o, _p;
    var optimisticData = [];
    var successData = [];
    var failureData = [];
    // 1. Optimistically set the policyID on the report (and all its threads) by:
    // 1.1 Preprocess reports to create a map of parentReportID to child reports list of reportIDs
    // 1.2 Recursively update the policyID of the report and all its child reports
    var reportID = report.reportID;
    var reportIDToThreadsReportIDsMap = buildReportIDToThreadsReportIDsMap();
    updatePolicyIdForReportAndThreads(reportID, policyID, reportIDToThreadsReportIDsMap, optimisticData, failureData);
    // We reopen and reassign the report if the report is open/submitted and the manager is not a member of the new policy. This is to prevent the old manager from seeing a report that they can't action on.
    var isOpenOrSubmitted = (0, ReportUtils_1.isOpenExpenseReport)(report) || (0, ReportUtils_1.isProcessingReport)(report);
    var managerLogin = PersonalDetailsUtils.getLoginByAccountID((_l = report.managerID) !== null && _l !== void 0 ? _l : CONST_1.default.DEFAULT_NUMBER_ID);
    if (isOpenOrSubmitted && managerLogin && !(0, PolicyUtils_1.isPolicyMember)(managerLogin, policyID)) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                managerID: (0, ReportUtils_1.getNextApproverAccountID)(report, true),
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(reportID),
            value: (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.OPEN),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                stateNum: report.stateNum,
                statusNum: report.statusNum,
                managerID: report.managerID,
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(reportID),
            value: reportNextStep,
        });
    }
    // 2. If this is a thread, we have to mark the parent report preview action as deleted to properly update the UI
    if (report.parentReportID && report.parentReportActionID) {
        var oldWorkspaceChatReportID = report.parentReportID;
        var oldReportPreviewActionID = report.parentReportActionID;
        var oldReportPreviewAction = (_m = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions[oldWorkspaceChatReportID]) === null || _m === void 0 ? void 0 : _m[oldReportPreviewActionID];
        var deletedTime = DateUtils_1.default.getDBTime();
        var firstMessage = Array.isArray(oldReportPreviewAction === null || oldReportPreviewAction === void 0 ? void 0 : oldReportPreviewAction.message) ? oldReportPreviewAction.message.at(0) : null;
        var updatedReportPreviewAction = __assign(__assign(__assign(__assign({}, oldReportPreviewAction), { originalMessage: {
                deleted: deletedTime,
            } }), (firstMessage && {
            message: __spreadArray([
                __assign(__assign({}, firstMessage), { deleted: deletedTime })
            ], (Array.isArray(oldReportPreviewAction === null || oldReportPreviewAction === void 0 ? void 0 : oldReportPreviewAction.message) ? oldReportPreviewAction.message.slice(1) : []), true),
        })), (!Array.isArray(oldReportPreviewAction === null || oldReportPreviewAction === void 0 ? void 0 : oldReportPreviewAction.message) && {
            message: {
                deleted: deletedTime,
            },
        }));
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(oldWorkspaceChatReportID),
            value: (_a = {}, _a[oldReportPreviewActionID] = updatedReportPreviewAction, _a),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(oldWorkspaceChatReportID),
            value: (_b = {},
                _b[oldReportPreviewActionID] = __assign(__assign(__assign({}, oldReportPreviewAction), { originalMessage: {
                        deleted: null,
                    } }), (!Array.isArray(oldReportPreviewAction === null || oldReportPreviewAction === void 0 ? void 0 : oldReportPreviewAction.message) && {
                    message: {
                        deleted: null,
                    },
                })),
                _b),
        });
        // Update the expense chat report
        var chatReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oldWorkspaceChatReportID)];
        var lastMessageText = (_o = (0, ReportUtils_1.getLastVisibleMessage)(oldWorkspaceChatReportID, (_c = {}, _c[oldReportPreviewActionID] = updatedReportPreviewAction, _c))) === null || _o === void 0 ? void 0 : _o.lastMessageText;
        var lastVisibleActionCreated = (_p = (0, ReportUtils_1.getReportLastMessage)(oldWorkspaceChatReportID, (_d = {}, _d[oldReportPreviewActionID] = updatedReportPreviewAction, _d))) === null || _p === void 0 ? void 0 : _p.lastVisibleActionCreated;
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oldWorkspaceChatReportID),
            value: {
                hasOutstandingChildRequest: false,
                iouReportID: null,
                lastMessageText: lastMessageText,
                lastVisibleActionCreated: lastVisibleActionCreated,
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oldWorkspaceChatReportID),
            value: chatReport,
        });
    }
    // 3. Optimistically create a new REPORT_PREVIEW reportAction with the newReportPreviewActionID
    // and set it as a parent of the moved report
    var policyExpenseChat = (0, ReportUtils_1.getPolicyExpenseChat)(currentUserAccountID, policyID);
    var optimisticReportPreviewAction = (0, ReportUtils_1.buildOptimisticReportPreview)(policyExpenseChat, report);
    var newPolicyExpenseChatReportID = policyExpenseChat === null || policyExpenseChat === void 0 ? void 0 : policyExpenseChat.reportID;
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(newPolicyExpenseChatReportID),
        value: (_e = {}, _e[optimisticReportPreviewAction.reportActionID] = optimisticReportPreviewAction, _e),
    });
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(newPolicyExpenseChatReportID),
        value: (_f = {},
            _f[optimisticReportPreviewAction.reportActionID] = {
                pendingAction: null,
            },
            _f),
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(newPolicyExpenseChatReportID),
        value: (_g = {}, _g[optimisticReportPreviewAction.reportActionID] = null, _g),
    });
    // Set the new report preview action as a parent of the moved report,
    // and set the parentReportID on the moved report as the expense chat reportID
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
        value: { parentReportActionID: optimisticReportPreviewAction.reportActionID, parentReportID: newPolicyExpenseChatReportID },
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
        value: { parentReportActionID: report.parentReportActionID, parentReportID: report.parentReportID },
    });
    // Set lastVisibleActionCreated
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(newPolicyExpenseChatReportID),
        value: { lastVisibleActionCreated: optimisticReportPreviewAction === null || optimisticReportPreviewAction === void 0 ? void 0 : optimisticReportPreviewAction.created },
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(newPolicyExpenseChatReportID),
        value: { lastVisibleActionCreated: policyExpenseChat === null || policyExpenseChat === void 0 ? void 0 : policyExpenseChat.lastVisibleActionCreated },
    });
    // 4. Optimistically create a CHANGE_POLICY reportAction on the report using the reportActionID
    var optimisticMovedReportAction = (0, ReportUtils_1.buildOptimisticChangePolicyReportAction)(report.policyID, policyID);
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
        value: (_h = {}, _h[optimisticMovedReportAction.reportActionID] = optimisticMovedReportAction, _h),
    });
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
        value: (_j = {},
            _j[optimisticMovedReportAction.reportActionID] = {
                pendingAction: null,
                errors: null,
            },
            _j),
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
        value: (_k = {},
            _k[optimisticMovedReportAction.reportActionID] = {
                errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('common.genericErrorMessage'),
            },
            _k),
    });
    return { optimisticData: optimisticData, successData: successData, failureData: failureData, optimisticReportPreviewAction: optimisticReportPreviewAction, optimisticMovedReportAction: optimisticMovedReportAction };
}
/**
 * Changes the policy of a report and all its child reports, and moves the report to the new policy's expense chat.
 */
function changeReportPolicy(report, policyID, reportNextStep) {
    if (!report || !policyID || report.policyID === policyID || !(0, ReportUtils_1.isExpenseReport)(report)) {
        return;
    }
    var _a = buildOptimisticChangePolicyData(report, policyID, reportNextStep), optimisticData = _a.optimisticData, successData = _a.successData, failureData = _a.failureData, optimisticReportPreviewAction = _a.optimisticReportPreviewAction, optimisticMovedReportAction = _a.optimisticMovedReportAction;
    var params = {
        reportID: report.reportID,
        policyID: policyID,
        reportPreviewReportActionID: optimisticReportPreviewAction.reportActionID,
        changePolicyReportActionID: optimisticMovedReportAction.reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.CHANGE_REPORT_POLICY, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    // If the dismissedProductTraining.changeReportModal is not set,
    // navigate to CHANGE_POLICY_EDUCATIONAL and a backTo param for the report page.
    navigateToTrainingModal(nvpDismissedProductTraining, report.reportID);
}
/**
 * Invites the submitter to the new report policy, changes the policy of a report and all its child reports, and moves the report to the new policy's expense chat
 */
function changeReportPolicyAndInviteSubmitter(report, policyID, employeeList) {
    var _a;
    if (!report.reportID || !policyID || report.policyID === policyID || !(0, ReportUtils_1.isExpenseReport)(report) || !report.ownerAccountID) {
        return;
    }
    var submitterEmail = PersonalDetailsUtils.getLoginByAccountID(report.ownerAccountID);
    if (!submitterEmail) {
        return;
    }
    var policyMemberAccountIDs = Object.values((0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(employeeList, false, false));
    var _b = (0, Member_1.buildAddMembersToWorkspaceOnyxData)((_a = {}, _a[submitterEmail] = report.ownerAccountID, _a), policyID, policyMemberAccountIDs, CONST_1.default.POLICY.ROLE.USER), optimisticData = _b.optimisticData, successData = _b.successData, failureData = _b.failureData, membersChats = _b.membersChats;
    var optimisticPolicyExpenseChatReportID = membersChats.reportCreationData[submitterEmail].reportID;
    var optimisticPolicyExpenseChatCreatedReportActionID = membersChats.reportCreationData[submitterEmail].reportActionID;
    if (!optimisticPolicyExpenseChatReportID) {
        return;
    }
    var _c = buildOptimisticChangePolicyData(report, policyID), optimisticChangePolicyData = _c.optimisticData, successChangePolicyData = _c.successData, failureChangePolicyData = _c.failureData, optimisticReportPreviewAction = _c.optimisticReportPreviewAction, optimisticMovedReportAction = _c.optimisticMovedReportAction;
    optimisticData.push.apply(optimisticData, optimisticChangePolicyData);
    successData.push.apply(successData, successChangePolicyData);
    failureData.push.apply(failureData, failureChangePolicyData);
    var params = {
        reportID: report.reportID,
        policyID: policyID,
        reportPreviewReportActionID: optimisticReportPreviewAction.reportActionID,
        changePolicyReportActionID: optimisticMovedReportAction.reportActionID,
        policyExpenseChatReportID: optimisticPolicyExpenseChatReportID,
        policyExpenseCreatedReportActionID: optimisticPolicyExpenseChatCreatedReportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.CHANGE_REPORT_POLICY_AND_INVITE_SUBMITTER, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    // If the dismissedProductTraining.changeReportModal is not set,
    // navigate to CHANGE_POLICY_EDUCATIONAL and a backTo param for the report page.
    navigateToTrainingModal(nvpDismissedProductTraining, report.reportID);
}
/**
 * Resolves Concierge category options by adding a comment and updating the report action
 * @param reportID - The report ID where the comment should be added
 * @param actionReportID - The report ID where the report action should be updated (may be different for threads)
 * @param reportActionID - The specific report action ID to update
 * @param selectedCategory - The category selected by the user
 */
function resolveConciergeCategoryOptions(reportID, actionReportID, reportActionID, selectedCategory) {
    var _a;
    if (!reportID || !actionReportID || !reportActionID) {
        return;
    }
    addComment(reportID, selectedCategory);
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(actionReportID), (_a = {},
        _a[reportActionID] = {
            originalMessage: {
                selectedCategory: selectedCategory,
            },
        },
        _a));
}
