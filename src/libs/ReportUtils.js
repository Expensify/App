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
exports.changeMoneyRequestHoldStatus = exports.buildReportNameFromParticipantNames = void 0;
exports.addDomainToShortMention = addDomainToShortMention;
exports.completeShortMention = completeShortMention;
exports.areAllRequestsBeingSmartScanned = areAllRequestsBeingSmartScanned;
exports.buildOptimisticAddCommentReportAction = buildOptimisticAddCommentReportAction;
exports.buildOptimisticApprovedReportAction = buildOptimisticApprovedReportAction;
exports.buildOptimisticUnapprovedReportAction = buildOptimisticUnapprovedReportAction;
exports.buildOptimisticCancelPaymentReportAction = buildOptimisticCancelPaymentReportAction;
exports.buildOptimisticChangedTaskAssigneeReportAction = buildOptimisticChangedTaskAssigneeReportAction;
exports.buildOptimisticChatReport = buildOptimisticChatReport;
exports.buildOptimisticClosedReportAction = buildOptimisticClosedReportAction;
exports.buildOptimisticCreatedReportAction = buildOptimisticCreatedReportAction;
exports.buildOptimisticDismissedViolationReportAction = buildOptimisticDismissedViolationReportAction;
exports.buildOptimisticEditedTaskFieldReportAction = buildOptimisticEditedTaskFieldReportAction;
exports.buildOptimisticExpenseReport = buildOptimisticExpenseReport;
exports.buildOptimisticEmptyReport = buildOptimisticEmptyReport;
exports.buildOptimisticGroupChatReport = buildOptimisticGroupChatReport;
exports.buildOptimisticHoldReportAction = buildOptimisticHoldReportAction;
exports.buildOptimisticHoldReportActionComment = buildOptimisticHoldReportActionComment;
exports.buildOptimisticRetractedReportAction = buildOptimisticRetractedReportAction;
exports.buildOptimisticReopenedReportAction = buildOptimisticReopenedReportAction;
exports.buildOptimisticIOUReport = buildOptimisticIOUReport;
exports.buildOptimisticIOUReportAction = buildOptimisticIOUReportAction;
exports.buildOptimisticModifiedExpenseReportAction = buildOptimisticModifiedExpenseReportAction;
exports.buildOptimisticMoneyRequestEntities = buildOptimisticMoneyRequestEntities;
exports.buildOptimisticMovedReportAction = buildOptimisticMovedReportAction;
exports.buildOptimisticChangePolicyReportAction = buildOptimisticChangePolicyReportAction;
exports.buildOptimisticRenamedRoomReportAction = buildOptimisticRenamedRoomReportAction;
exports.buildOptimisticRoomDescriptionUpdatedReportAction = buildOptimisticRoomDescriptionUpdatedReportAction;
exports.buildOptimisticReportPreview = buildOptimisticReportPreview;
exports.buildOptimisticActionableTrackExpenseWhisper = buildOptimisticActionableTrackExpenseWhisper;
exports.buildOptimisticSubmittedReportAction = buildOptimisticSubmittedReportAction;
exports.buildOptimisticTaskCommentReportAction = buildOptimisticTaskCommentReportAction;
exports.buildOptimisticTaskReport = buildOptimisticTaskReport;
exports.buildOptimisticTaskReportAction = buildOptimisticTaskReportAction;
exports.buildOptimisticUnHoldReportAction = buildOptimisticUnHoldReportAction;
exports.buildOptimisticAnnounceChat = buildOptimisticAnnounceChat;
exports.buildOptimisticWorkspaceChats = buildOptimisticWorkspaceChats;
exports.buildOptimisticCardAssignedReportAction = buildOptimisticCardAssignedReportAction;
exports.buildOptimisticDetachReceipt = buildOptimisticDetachReceipt;
exports.buildParticipantsFromAccountIDs = buildParticipantsFromAccountIDs;
exports.buildTransactionThread = buildTransactionThread;
exports.canAccessReport = canAccessReport;
exports.isReportNotFound = isReportNotFound;
exports.canAddTransaction = canAddTransaction;
exports.canDeleteTransaction = canDeleteTransaction;
exports.canBeAutoReimbursed = canBeAutoReimbursed;
exports.canCreateRequest = canCreateRequest;
exports.canCreateTaskInReport = canCreateTaskInReport;
exports.canCurrentUserOpenReport = canCurrentUserOpenReport;
exports.canDeleteReportAction = canDeleteReportAction;
exports.canHoldUnholdReportAction = canHoldUnholdReportAction;
exports.canEditReportPolicy = canEditReportPolicy;
exports.canEditFieldOfMoneyRequest = canEditFieldOfMoneyRequest;
exports.canEditMoneyRequest = canEditMoneyRequest;
exports.canEditPolicyDescription = canEditPolicyDescription;
exports.canEditReportAction = canEditReportAction;
exports.canEditReportDescription = canEditReportDescription;
exports.canEditRoomVisibility = canEditRoomVisibility;
exports.canEditWriteCapability = canEditWriteCapability;
exports.canFlagReportAction = canFlagReportAction;
exports.isNonAdminOrOwnerOfPolicyExpenseChat = isNonAdminOrOwnerOfPolicyExpenseChat;
exports.canJoinChat = canJoinChat;
exports.canLeaveChat = canLeaveChat;
exports.canReportBeMentionedWithinPolicy = canReportBeMentionedWithinPolicy;
exports.canRequestMoney = canRequestMoney;
exports.canSeeDefaultRoom = canSeeDefaultRoom;
exports.canShowReportRecipientLocalTime = canShowReportRecipientLocalTime;
exports.canUserPerformWriteAction = canUserPerformWriteAction;
exports.chatIncludesChronos = chatIncludesChronos;
exports.chatIncludesChronosWithID = chatIncludesChronosWithID;
exports.chatIncludesConcierge = chatIncludesConcierge;
exports.createDraftTransactionAndNavigateToParticipantSelector = createDraftTransactionAndNavigateToParticipantSelector;
exports.doesReportBelongToWorkspace = doesReportBelongToWorkspace;
exports.shouldEnableNegative = shouldEnableNegative;
exports.findLastAccessedReport = findLastAccessedReport;
exports.findSelfDMReportID = findSelfDMReportID;
exports.formatReportLastMessageText = formatReportLastMessageText;
exports.generateReportID = generateReportID;
exports.getCreationReportErrors = getCreationReportErrors;
exports.getAllAncestorReportActionIDs = getAllAncestorReportActionIDs;
exports.getAllAncestorReportActions = getAllAncestorReportActions;
exports.getAllHeldTransactions = getAllHeldTransactions;
exports.getAllPolicyReports = getAllPolicyReports;
exports.getAllWorkspaceReports = getAllWorkspaceReports;
exports.getAvailableReportFields = getAvailableReportFields;
exports.getBankAccountRoute = getBankAccountRoute;
exports.getChatByParticipants = getChatByParticipants;
exports.getChatRoomSubtitle = getChatRoomSubtitle;
exports.getChildReportNotificationPreference = getChildReportNotificationPreference;
exports.getCommentLength = getCommentLength;
exports.getDefaultGroupAvatar = getDefaultGroupAvatar;
exports.getDefaultWorkspaceAvatar = getDefaultWorkspaceAvatar;
exports.getDefaultWorkspaceAvatarTestID = getDefaultWorkspaceAvatarTestID;
exports.getDeletedParentActionMessageForChatReport = getDeletedParentActionMessageForChatReport;
exports.getDisplayNameForParticipant = getDisplayNameForParticipant;
exports.getDisplayNamesWithTooltips = getDisplayNamesWithTooltips;
exports.getGroupChatName = getGroupChatName;
exports.prepareOnboardingOnyxData = prepareOnboardingOnyxData;
exports.getIOUReportActionDisplayMessage = getIOUReportActionDisplayMessage;
exports.getIOUReportActionMessage = getIOUReportActionMessage;
exports.getRejectedReportMessage = getRejectedReportMessage;
exports.getWorkspaceNameUpdatedMessage = getWorkspaceNameUpdatedMessage;
exports.getDeletedTransactionMessage = getDeletedTransactionMessage;
exports.getUpgradeWorkspaceMessage = getUpgradeWorkspaceMessage;
exports.getDowngradeWorkspaceMessage = getDowngradeWorkspaceMessage;
exports.getIcons = getIcons;
exports.getIconsForParticipants = getIconsForParticipants;
exports.getIndicatedMissingPaymentMethod = getIndicatedMissingPaymentMethod;
exports.getLastVisibleMessage = getLastVisibleMessage;
exports.getMoneyRequestOptions = getMoneyRequestOptions;
exports.getMoneyRequestSpendBreakdown = getMoneyRequestSpendBreakdown;
exports.getNonHeldAndFullAmount = getNonHeldAndFullAmount;
exports.getOptimisticDataForParentReportAction = getOptimisticDataForParentReportAction;
exports.getOriginalReportID = getOriginalReportID;
exports.getOutstandingChildRequest = getOutstandingChildRequest;
exports.getParentNavigationSubtitle = getParentNavigationSubtitle;
exports.getParsedComment = getParsedComment;
exports.getParticipantsAccountIDsForDisplay = getParticipantsAccountIDsForDisplay;
exports.getParticipantsList = getParticipantsList;
exports.getParticipants = getParticipants;
exports.getPendingChatMembers = getPendingChatMembers;
exports.getPersonalDetailsForAccountID = getPersonalDetailsForAccountID;
exports.getPolicyDescriptionText = getPolicyDescriptionText;
exports.getPolicyExpenseChat = getPolicyExpenseChat;
exports.getPolicyExpenseChatName = getPolicyExpenseChatName;
exports.getPolicyName = getPolicyName;
exports.getPolicyType = getPolicyType;
exports.getReimbursementDeQueuedOrCanceledActionMessage = getReimbursementDeQueuedOrCanceledActionMessage;
exports.getReimbursementQueuedActionMessage = getReimbursementQueuedActionMessage;
exports.getReportActionActorAccountID = getReportActionActorAccountID;
exports.getReportDescription = getReportDescription;
exports.getReportFieldKey = getReportFieldKey;
exports.getReportIDFromLink = getReportIDFromLink;
exports.getReportName = getReportName;
exports.getSearchReportName = getSearchReportName;
exports.getReportTransactions = getReportTransactions;
exports.reportTransactionsSelector = reportTransactionsSelector;
exports.getReportNotificationPreference = getReportNotificationPreference;
exports.getReportOfflinePendingActionAndErrors = getReportOfflinePendingActionAndErrors;
exports.getReportParticipantsTitle = getReportParticipantsTitle;
exports.getReportPreviewMessage = getReportPreviewMessage;
exports.getReportRecipientAccountIDs = getReportRecipientAccountIDs;
exports.getParentReport = getParentReport;
exports.getReportOrDraftReport = getReportOrDraftReport;
exports.getRoom = getRoom;
exports.getRootParentReport = getRootParentReport;
exports.getRouteFromLink = getRouteFromLink;
exports.canDeleteCardTransactionByLiabilityType = canDeleteCardTransactionByLiabilityType;
exports.getTaskAssigneeChatOnyxData = getTaskAssigneeChatOnyxData;
exports.getTransactionDetails = getTransactionDetails;
exports.getTransactionReportName = getTransactionReportName;
exports.getDisplayedReportID = getDisplayedReportID;
exports.getTransactionsWithReceipts = getTransactionsWithReceipts;
exports.getUserDetailTooltipText = getUserDetailTooltipText;
exports.getWhisperDisplayNames = getWhisperDisplayNames;
exports.getWorkspaceChats = getWorkspaceChats;
exports.getWorkspaceIcon = getWorkspaceIcon;
exports.goBackToDetailsPage = goBackToDetailsPage;
exports.goBackFromPrivateNotes = goBackFromPrivateNotes;
exports.getInvoicePayerName = getInvoicePayerName;
exports.getInvoicesChatName = getInvoicesChatName;
exports.getPayeeName = getPayeeName;
exports.getQuickActionDetails = getQuickActionDetails;
exports.hasActionsWithErrors = hasActionsWithErrors;
exports.hasAutomatedExpensifyAccountIDs = hasAutomatedExpensifyAccountIDs;
exports.hasExpensifyGuidesEmails = hasExpensifyGuidesEmails;
exports.hasHeldExpenses = hasHeldExpenses;
exports.hasIOUWaitingOnCurrentUserBankAccount = hasIOUWaitingOnCurrentUserBankAccount;
exports.hasMissingPaymentMethod = hasMissingPaymentMethod;
exports.hasMissingSmartscanFields = hasMissingSmartscanFields;
exports.hasNonReimbursableTransactions = hasNonReimbursableTransactions;
exports.hasOnlyHeldExpenses = hasOnlyHeldExpenses;
exports.hasOnlyTransactionsWithPendingRoutes = hasOnlyTransactionsWithPendingRoutes;
exports.hasReceiptError = hasReceiptError;
exports.hasReceiptErrors = hasReceiptErrors;
exports.hasReportNameError = hasReportNameError;
exports.getReportActionWithSmartscanError = getReportActionWithSmartscanError;
exports.hasSmartscanError = hasSmartscanError;
exports.hasUpdatedTotal = hasUpdatedTotal;
exports.hasViolations = hasViolations;
exports.hasWarningTypeViolations = hasWarningTypeViolations;
exports.hasNoticeTypeViolations = hasNoticeTypeViolations;
exports.isActionCreator = isActionCreator;
exports.isAdminRoom = isAdminRoom;
exports.isAdminsOnlyPostingRoom = isAdminsOnlyPostingRoom;
exports.isAllowedToApproveExpenseReport = isAllowedToApproveExpenseReport;
exports.isAllowedToComment = isAllowedToComment;
exports.isAnnounceRoom = isAnnounceRoom;
exports.isArchivedNonExpenseReport = isArchivedNonExpenseReport;
exports.isArchivedReport = isArchivedReport;
exports.isArchivedNonExpenseReportWithID = isArchivedNonExpenseReportWithID;
exports.isClosedReport = isClosedReport;
exports.isCanceledTaskReport = isCanceledTaskReport;
exports.isChatReport = isChatReport;
exports.isChatRoom = isChatRoom;
exports.isTripRoom = isTripRoom;
exports.isChatThread = isChatThread;
exports.isChildReport = isChildReport;
exports.isClosedExpenseReportWithNoExpenses = isClosedExpenseReportWithNoExpenses;
exports.isCompletedTaskReport = isCompletedTaskReport;
exports.isConciergeChatReport = isConciergeChatReport;
exports.isControlPolicyExpenseChat = isControlPolicyExpenseChat;
exports.isControlPolicyExpenseReport = isControlPolicyExpenseReport;
exports.isCurrentUserSubmitter = isCurrentUserSubmitter;
exports.isCurrentUserTheOnlyParticipant = isCurrentUserTheOnlyParticipant;
exports.isDM = isDM;
exports.isDefaultRoom = isDefaultRoom;
exports.isDeprecatedGroupDM = isDeprecatedGroupDM;
exports.isEmptyReport = isEmptyReport;
exports.generateIsEmptyReport = generateIsEmptyReport;
exports.isRootGroupChat = isRootGroupChat;
exports.isExpenseReport = isExpenseReport;
exports.isExpenseRequest = isExpenseRequest;
exports.isFinancialReportsForBusinesses = isFinancialReportsForBusinesses;
exports.isExpensifyOnlyParticipantInReport = isExpensifyOnlyParticipantInReport;
exports.isGroupChat = isGroupChat;
exports.isGroupChatAdmin = isGroupChatAdmin;
exports.isGroupPolicy = isGroupPolicy;
exports.isReportInGroupPolicy = isReportInGroupPolicy;
exports.isHoldCreator = isHoldCreator;
exports.isIOUOwnedByCurrentUser = isIOUOwnedByCurrentUser;
exports.isIOUReport = isIOUReport;
exports.isIOUReportUsingReport = isIOUReportUsingReport;
exports.isJoinRequestInAdminRoom = isJoinRequestInAdminRoom;
exports.isDomainRoom = isDomainRoom;
exports.isMoneyRequest = isMoneyRequest;
exports.isMoneyRequestReport = isMoneyRequestReport;
exports.isMoneyRequestReportPendingDeletion = isMoneyRequestReportPendingDeletion;
exports.isOneOnOneChat = isOneOnOneChat;
exports.isOneTransactionThread = isOneTransactionThread;
exports.isOpenExpenseReport = isOpenExpenseReport;
exports.isOpenTaskReport = isOpenTaskReport;
exports.isOptimisticPersonalDetail = isOptimisticPersonalDetail;
exports.isPaidGroupPolicy = isPaidGroupPolicy;
exports.isPaidGroupPolicyExpenseChat = isPaidGroupPolicyExpenseChat;
exports.isPaidGroupPolicyExpenseReport = isPaidGroupPolicyExpenseReport;
exports.isPayer = isPayer;
exports.isPolicyAdmin = isPolicyAdmin;
exports.isPolicyExpenseChat = isPolicyExpenseChat;
exports.isPolicyExpenseChatAdmin = isPolicyExpenseChatAdmin;
exports.isProcessingReport = isProcessingReport;
exports.isOpenReport = isOpenReport;
exports.isReportIDApproved = isReportIDApproved;
exports.isAwaitingFirstLevelApproval = isAwaitingFirstLevelApproval;
exports.isPublicAnnounceRoom = isPublicAnnounceRoom;
exports.isPublicRoom = isPublicRoom;
exports.isReportApproved = isReportApproved;
exports.isReportManuallyReimbursed = isReportManuallyReimbursed;
exports.isReportDataReady = isReportDataReady;
exports.isReportFieldDisabled = isReportFieldDisabled;
exports.isReportFieldOfTypeTitle = isReportFieldOfTypeTitle;
exports.isReportManager = isReportManager;
exports.isReportOwner = isReportOwner;
exports.isReportParticipant = isReportParticipant;
exports.isSelfDM = isSelfDM;
exports.isSettled = isSettled;
exports.isSystemChat = isSystemChat;
exports.isTaskReport = isTaskReport;
exports.isThread = isThread;
exports.isTrackExpenseReport = isTrackExpenseReport;
exports.isUnread = isUnread;
exports.isUnreadWithMention = isUnreadWithMention;
exports.isUserCreatedPolicyRoom = isUserCreatedPolicyRoom;
exports.isValidReport = isValidReport;
exports.isValidReportIDFromPath = isValidReportIDFromPath;
exports.isWaitingForAssigneeToCompleteAction = isWaitingForAssigneeToCompleteAction;
exports.isWaitingForSubmissionFromCurrentUser = isWaitingForSubmissionFromCurrentUser;
exports.isInvoiceRoom = isInvoiceRoom;
exports.isInvoiceRoomWithID = isInvoiceRoomWithID;
exports.isInvoiceReport = isInvoiceReport;
exports.isNewDotInvoice = isNewDotInvoice;
exports.isOpenInvoiceReport = isOpenInvoiceReport;
exports.isReportTransactionThread = isReportTransactionThread;
exports.getDefaultNotificationPreferenceForReport = getDefaultNotificationPreferenceForReport;
exports.canWriteInReport = canWriteInReport;
exports.navigateToDetailsPage = navigateToDetailsPage;
exports.navigateToPrivateNotes = navigateToPrivateNotes;
exports.navigateBackOnDeleteTransaction = navigateBackOnDeleteTransaction;
exports.parseReportRouteParams = parseReportRouteParams;
exports.parseReportActionHtmlToText = parseReportActionHtmlToText;
exports.requiresAttentionFromCurrentUser = requiresAttentionFromCurrentUser;
exports.shouldAutoFocusOnKeyPress = shouldAutoFocusOnKeyPress;
exports.shouldCreateNewMoneyRequestReport = shouldCreateNewMoneyRequestReport;
exports.shouldDisableDetailPage = shouldDisableDetailPage;
exports.shouldDisableRename = shouldDisableRename;
exports.shouldDisableThread = shouldDisableThread;
exports.shouldDisplayThreadReplies = shouldDisplayThreadReplies;
exports.shouldDisplayViolationsRBRInLHN = shouldDisplayViolationsRBRInLHN;
exports.shouldReportBeInOptionList = shouldReportBeInOptionList;
exports.shouldReportShowSubscript = shouldReportShowSubscript;
exports.shouldShowFlagComment = shouldShowFlagComment;
exports.getReportActionWithMissingSmartscanFields = getReportActionWithMissingSmartscanFields;
exports.shouldShowRBRForMissingSmartscanFields = shouldShowRBRForMissingSmartscanFields;
exports.shouldUseFullTitleToDisplay = shouldUseFullTitleToDisplay;
exports.updateOptimisticParentReportAction = updateOptimisticParentReportAction;
exports.updateReportPreview = updateReportPreview;
exports.temporary_getMoneyRequestOptions = temporary_getMoneyRequestOptions;
exports.getTripIDFromTransactionParentReportID = getTripIDFromTransactionParentReportID;
exports.buildOptimisticInvoiceReport = buildOptimisticInvoiceReport;
exports.getInvoiceChatByParticipants = getInvoiceChatByParticipants;
exports.isCurrentUserInvoiceReceiver = isCurrentUserInvoiceReceiver;
exports.isDraftReport = isDraftReport;
exports.isAdminOwnerApproverOrReportOwner = isAdminOwnerApproverOrReportOwner;
exports.createDraftWorkspaceAndNavigateToConfirmationScreen = createDraftWorkspaceAndNavigateToConfirmationScreen;
exports.isChatUsedForOnboarding = isChatUsedForOnboarding;
exports.buildOptimisticExportIntegrationAction = buildOptimisticExportIntegrationAction;
exports.getChatUsedForOnboarding = getChatUsedForOnboarding;
exports.getFieldViolationTranslation = getFieldViolationTranslation;
exports.getFieldViolation = getFieldViolation;
exports.getReportViolations = getReportViolations;
exports.findPolicyExpenseChatByPolicyID = findPolicyExpenseChatByPolicyID;
exports.getIntegrationIcon = getIntegrationIcon;
exports.canBeExported = canBeExported;
exports.isExported = isExported;
exports.hasExportError = hasExportError;
exports.getHelpPaneReportType = getHelpPaneReportType;
exports.hasOnlyNonReimbursableTransactions = hasOnlyNonReimbursableTransactions;
exports.getReportLastMessage = getReportLastMessage;
exports.getReportLastVisibleActionCreated = getReportLastVisibleActionCreated;
exports.getMostRecentlyVisitedReport = getMostRecentlyVisitedReport;
exports.getSourceIDFromReportAction = getSourceIDFromReportAction;
exports.getIntegrationNameFromExportMessage = getIntegrationNameFromExportMessage;
exports.getReportNameValuePairs = getReportNameValuePairs;
exports.hasReportViolations = hasReportViolations;
exports.isPayAtEndExpenseReport = isPayAtEndExpenseReport;
exports.getArchiveReason = getArchiveReason;
exports.getApprovalChain = getApprovalChain;
exports.isIndividualInvoiceRoom = isIndividualInvoiceRoom;
exports.isAuditor = isAuditor;
exports.hasMissingInvoiceBankAccount = hasMissingInvoiceBankAccount;
exports.reasonForReportToBeInOptionList = reasonForReportToBeInOptionList;
exports.getReasonAndReportActionThatRequiresAttention = getReasonAndReportActionThatRequiresAttention;
exports.buildOptimisticChangeFieldAction = buildOptimisticChangeFieldAction;
exports.isPolicyRelatedReport = isPolicyRelatedReport;
exports.hasReportErrorsOtherThanFailedReceipt = hasReportErrorsOtherThanFailedReceipt;
exports.getAllReportErrors = getAllReportErrors;
exports.getAllReportActionsErrorsAndReportActionThatRequiresAttention = getAllReportActionsErrorsAndReportActionThatRequiresAttention;
exports.hasInvoiceReports = hasInvoiceReports;
exports.shouldUnmaskChat = shouldUnmaskChat;
exports.getReportMetadata = getReportMetadata;
exports.buildOptimisticSelfDMReport = buildOptimisticSelfDMReport;
exports.isHiddenForCurrentUser = isHiddenForCurrentUser;
exports.isSelectedManagerMcTest = isSelectedManagerMcTest;
exports.isTestTransactionReport = isTestTransactionReport;
exports.getReportSubtitlePrefix = getReportSubtitlePrefix;
exports.getPolicyChangeMessage = getPolicyChangeMessage;
exports.getMovedTransactionMessage = getMovedTransactionMessage;
exports.getExpenseReportStateAndStatus = getExpenseReportStateAndStatus;
exports.generateReportName = generateReportName;
exports.navigateToLinkedReportAction = navigateToLinkedReportAction;
exports.buildOptimisticUnreportedTransactionAction = buildOptimisticUnreportedTransactionAction;
exports.buildOptimisticResolvedDuplicatesReportAction = buildOptimisticResolvedDuplicatesReportAction;
exports.getTitleReportField = getTitleReportField;
exports.getReportFieldsByPolicyID = getReportFieldsByPolicyID;
exports.getGroupChatDraft = getGroupChatDraft;
exports.getInvoiceReportName = getInvoiceReportName;
exports.getChatListItemReportName = getChatListItemReportName;
exports.buildOptimisticMovedTransactionAction = buildOptimisticMovedTransactionAction;
exports.populateOptimisticReportFormula = populateOptimisticReportFormula;
exports.getOutstandingReportsForUser = getOutstandingReportsForUser;
exports.isReportOutstanding = isReportOutstanding;
exports.generateReportAttributes = generateReportAttributes;
exports.getReportPersonalDetailsParticipants = getReportPersonalDetailsParticipants;
exports.isAllowedToSubmitDraftExpenseReport = isAllowedToSubmitDraftExpenseReport;
exports.findReportIDForAction = findReportIDForAction;
exports.isWorkspaceEligibleForReportChange = isWorkspaceEligibleForReportChange;
exports.pushTransactionViolationsOnyxData = pushTransactionViolationsOnyxData;
exports.navigateOnDeleteExpense = navigateOnDeleteExpense;
exports.hasReportBeenReopened = hasReportBeenReopened;
exports.getMoneyReportPreviewName = getMoneyReportPreviewName;
exports.getNextApproverAccountID = getNextApproverAccountID;
exports.isOneTransactionReport = isOneTransactionReport;
exports.isWorkspaceTaskReport = isWorkspaceTaskReport;
exports.isWorkspaceThread = isWorkspaceThread;
var native_1 = require("@react-navigation/native");
var date_fns_1 = require("date-fns");
var expensify_common_1 = require("expensify-common");
var fast_equals_1 = require("fast-equals");
var escape_1 = require("lodash/escape");
var intersection_1 = require("lodash/intersection");
var isEmpty_1 = require("lodash/isEmpty");
var isNumber_1 = require("lodash/isNumber");
var mapValues_1 = require("lodash/mapValues");
var maxBy_1 = require("lodash/maxBy");
var react_native_onyx_1 = require("react-native-onyx");
var Expensicons_1 = require("@components/Icon/Expensicons");
var defaultGroupAvatars = require("@components/Icon/GroupDefaultAvatars");
var defaultWorkspaceAvatars = require("@components/Icon/WorkspaceDefaultAvatars");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var IOU_1 = require("./actions/IOU");
var Policy_1 = require("./actions/Policy/Policy");
var store_1 = require("./actions/ReimbursementAccount/store");
var Report_1 = require("./actions/Report");
var Session_1 = require("./actions/Session");
var OnboardingFlow_1 = require("./actions/Welcome/OnboardingFlow");
var CurrencyUtils_1 = require("./CurrencyUtils");
var DateUtils_1 = require("./DateUtils");
var DraftCommentUtils_1 = require("./DraftCommentUtils");
var Environment_1 = require("./Environment/Environment");
var ErrorUtils_1 = require("./ErrorUtils");
var getAttachmentDetails_1 = require("./fileDownload/getAttachmentDetails");
var isReportMessageAttachment_1 = require("./isReportMessageAttachment");
var LocaleCompare_1 = require("./LocaleCompare");
var LocalePhoneNumber_1 = require("./LocalePhoneNumber");
var Localize_1 = require("./Localize");
var Log_1 = require("./Log");
var LoginUtils_1 = require("./LoginUtils");
// eslint-disable-next-line import/no-cycle
var ModifiedExpenseMessage_1 = require("./ModifiedExpenseMessage");
var getStateFromPath_1 = require("./Navigation/helpers/getStateFromPath");
var isNavigatorName_1 = require("./Navigation/helpers/isNavigatorName");
var linkingConfig_1 = require("./Navigation/linkingConfig");
var Navigation_1 = require("./Navigation/Navigation");
var NumberUtils_1 = require("./NumberUtils");
var Parser_1 = require("./Parser");
var Permissions_1 = require("./Permissions");
var PersonalDetailsUtils_1 = require("./PersonalDetailsUtils");
var PhoneNumber_1 = require("./PhoneNumber");
var PolicyUtils_1 = require("./PolicyUtils");
var ReportActionsUtils_1 = require("./ReportActionsUtils");
var SubscriptionUtils_1 = require("./SubscriptionUtils");
var TourUtils_1 = require("./TourUtils");
var TransactionUtils_1 = require("./TransactionUtils");
var Url_1 = require("./Url");
var UserUtils_1 = require("./UserUtils");
var ViolationsUtils_1 = require("./Violations/ViolationsUtils");
// Dynamic Import to avoid circular dependency
var UnreadIndicatorUpdaterHelper = function () { return Promise.resolve().then(function () { return require('./UnreadIndicatorUpdater'); }); };
var currentUserEmail;
var currentUserPrivateDomain;
var currentUserAccountID;
var isAnonymousUser = false;
var environmentURL;
(0, Environment_1.getEnvironmentURL)().then(function (url) { return (environmentURL = url); });
var environment;
(0, Environment_1.getEnvironment)().then(function (env) {
    environment = env;
});
// This cache is used to save parse result of report action html message into text
// to prevent unnecessary parsing when the report action is not changed/modified.
// Example case: when we need to get a report name of a thread which is dependent on a report action message.
var parsedReportActionMessageCache = {};
var conciergeReportID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.CONCIERGE_REPORT_ID,
    callback: function (value) {
        conciergeReportID = value;
    },
});
var defaultAvatarBuildingIconTestID = 'SvgDefaultAvatarBuilding Icon';
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (value) {
        // When signed out, val is undefined
        if (!value) {
            return;
        }
        currentUserEmail = value.email;
        currentUserAccountID = value.accountID;
        isAnonymousUser = value.authTokenType === CONST_1.default.AUTH_TOKEN_TYPES.ANONYMOUS;
        currentUserPrivateDomain = (0, LoginUtils_1.isEmailPublicDomain)(currentUserEmail !== null && currentUserEmail !== void 0 ? currentUserEmail : '') ? '' : expensify_common_1.Str.extractEmailDomain(currentUserEmail !== null && currentUserEmail !== void 0 ? currentUserEmail : '');
    },
});
var allPersonalDetails;
var allPersonalDetailLogins;
var currentUserPersonalDetails;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
    callback: function (value) {
        var _a;
        if (currentUserAccountID) {
            currentUserPersonalDetails = (_a = value === null || value === void 0 ? void 0 : value[currentUserAccountID]) !== null && _a !== void 0 ? _a : undefined;
        }
        allPersonalDetails = value !== null && value !== void 0 ? value : {};
        allPersonalDetailLogins = Object.values(allPersonalDetails).map(function (personalDetail) { var _a; return (_a = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _a !== void 0 ? _a : ''; });
    },
});
var allReportsDraft;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT,
    waitForCollectionCallback: true,
    callback: function (value) { return (allReportsDraft = value); },
});
var allPolicies;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: function (value) { return (allPolicies = value); },
});
var allReports;
var reportsByPolicyID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
        UnreadIndicatorUpdaterHelper().then(function (module) {
            module.triggerUnreadUpdate();
        });
        if (!value) {
            return;
        }
        reportsByPolicyID = Object.values(value).reduce(function (acc, report) {
            var _a;
            if (!report) {
                return acc;
            }
            (0, Report_1.handleReportChanged)(report);
            // Get all reports, which are the ones that are:
            // - Owned by the same user
            // - Are either open or submitted
            // - Belong to the same workspace
            if (report.policyID && report.ownerAccountID === currentUserAccountID && ((_a = report.stateNum) !== null && _a !== void 0 ? _a : 0) <= 1) {
                if (!acc[report.policyID]) {
                    acc[report.policyID] = [];
                }
                acc[report.policyID].push(report);
            }
            return acc;
        }, {});
    },
});
var allBetas;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.BETAS,
    callback: function (value) { return (allBetas = value); },
});
var allTransactions = {};
var reportsTransactions = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: function (value) {
        if (!value) {
            return;
        }
        allTransactions = Object.fromEntries(Object.entries(value).filter(function (_a) {
            var transaction = _a[1];
            return transaction;
        }));
        reportsTransactions = Object.values(value).reduce(function (all, transaction) {
            var reportsMap = all;
            if (!(transaction === null || transaction === void 0 ? void 0 : transaction.reportID)) {
                return reportsMap;
            }
            if (!reportsMap[transaction.reportID]) {
                reportsMap[transaction.reportID] = [];
            }
            reportsMap[transaction.reportID].push(transaction);
            return all;
        }, {});
    },
});
var allReportActions;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: function (actions) {
        if (!actions) {
            return;
        }
        allReportActions = actions;
    },
});
var allReportMetadata;
var allReportMetadataKeyValue = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_METADATA,
    waitForCollectionCallback: true,
    callback: function (value) {
        if (!value) {
            return;
        }
        allReportMetadata = value;
        Object.entries(value).forEach(function (_a) {
            var reportID = _a[0], reportMetadata = _a[1];
            if (!reportMetadata) {
                return;
            }
            var _b = reportID.split('_'), id = _b[1];
            allReportMetadataKeyValue[id] = reportMetadata;
        });
    },
});
var allReportNameValuePair;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    waitForCollectionCallback: true,
    callback: function (value) {
        if (!value) {
            return;
        }
        allReportNameValuePair = value;
    },
});
var allReportsViolations;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: function (value) {
        if (!value) {
            return;
        }
        allReportsViolations = value;
    },
});
var onboarding;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_ONBOARDING,
    callback: function (value) { return (onboarding = value); },
});
var delegateEmail = '';
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.ACCOUNT,
    callback: function (value) {
        var _a, _b;
        delegateEmail = (_b = (_a = value === null || value === void 0 ? void 0 : value.delegatedAccess) === null || _a === void 0 ? void 0 : _a.delegate) !== null && _b !== void 0 ? _b : '';
    },
});
var activePolicyID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID,
    callback: function (value) { return (activePolicyID = value); },
});
var reportAttributesDerivedValue;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES,
    callback: function (value) {
        var _a;
        reportAttributesDerivedValue = (_a = value === null || value === void 0 ? void 0 : value.reports) !== null && _a !== void 0 ? _a : {};
    },
});
var newGroupChatDraft;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NEW_GROUP_CHAT_DRAFT,
    callback: function (value) { return (newGroupChatDraft = value); },
});
var onboardingCompanySize;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.ONBOARDING_COMPANY_SIZE,
    callback: function (value) {
        onboardingCompanySize = value;
    },
});
var hiddenTranslation = '';
var unavailableTranslation = '';
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.ARE_TRANSLATIONS_LOADING,
    initWithStoredValues: false,
    callback: function (value) {
        if (value !== null && value !== void 0 ? value : true) {
            return;
        }
        hiddenTranslation = (0, Localize_1.translateLocal)('common.hidden');
        unavailableTranslation = (0, Localize_1.translateLocal)('workspace.common.unavailable');
    },
});
function getCurrentUserAvatar() {
    return currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.avatar;
}
function getCurrentUserDisplayNameOrEmail() {
    var _a;
    return (_a = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.displayName) !== null && _a !== void 0 ? _a : currentUserEmail;
}
function getChatType(report) {
    return report === null || report === void 0 ? void 0 : report.chatType;
}
/**
 * Get the report or draft report given a reportID
 */
function getReportOrDraftReport(reportID, searchReports) {
    var _a;
    var searchReport = searchReports === null || searchReports === void 0 ? void 0 : searchReports.find(function (report) { return report.reportID === reportID; });
    var onyxReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    return (_a = searchReport !== null && searchReport !== void 0 ? searchReport : onyxReport) !== null && _a !== void 0 ? _a : allReportsDraft === null || allReportsDraft === void 0 ? void 0 : allReportsDraft["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT).concat(reportID)];
}
function reportTransactionsSelector(transactions, reportID) {
    if (!transactions || !reportID) {
        return [];
    }
    return Object.values(transactions).filter(function (transaction) { return !!transaction && transaction.reportID === reportID; });
}
function getReportTransactions(reportID, allReportsTransactions) {
    var _a;
    if (allReportsTransactions === void 0) { allReportsTransactions = reportsTransactions; }
    if (!reportID) {
        return [];
    }
    return (_a = allReportsTransactions[reportID]) !== null && _a !== void 0 ? _a : [];
}
/**
 * Check if a report is a draft report
 */
function isDraftReport(reportID) {
    var draftReport = allReportsDraft === null || allReportsDraft === void 0 ? void 0 : allReportsDraft["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT).concat(reportID)];
    return !!draftReport;
}
/**
 * @private
 */
function isSearchReportArray(object) {
    if (!Array.isArray(object)) {
        return false;
    }
    var firstItem = object.at(0);
    return firstItem !== undefined && 'private_isArchived' in firstItem;
}
/**
 * @private
 * Returns the report
 */
function getReport(reportID, reports) {
    if (isSearchReportArray(reports)) {
        reports === null || reports === void 0 ? void 0 : reports.find(function (report) { return report.reportID === reportID; });
    }
    else {
        return reports === null || reports === void 0 ? void 0 : reports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    }
}
/**
 * Returns the report
 * @deprecated Get the data straight from Onyx
 */
function getReportNameValuePairs(reportID, reportNameValuePairs) {
    if (reportNameValuePairs === void 0) { reportNameValuePairs = allReportNameValuePair; }
    return reportNameValuePairs === null || reportNameValuePairs === void 0 ? void 0 : reportNameValuePairs["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(reportID)];
}
/**
 * Returns the parentReport if the given report is a thread
 */
function getParentReport(report) {
    if (!(report === null || report === void 0 ? void 0 : report.parentReportID)) {
        return undefined;
    }
    return getReport(report.parentReportID, allReports);
}
/**
 * Returns the root parentReport if the given report is nested.
 * Uses recursion to iterate any depth of nested reports.
 */
function getRootParentReport(_a) {
    var report = _a.report, reports = _a.reports, _b = _a.visitedReportIDs, visitedReportIDs = _b === void 0 ? new Set() : _b;
    if (!report) {
        return undefined;
    }
    // Returns the current report as the root report, because it does not have a parentReportID
    if (!(report === null || report === void 0 ? void 0 : report.parentReportID)) {
        return report;
    }
    // Detect and prevent an infinite loop caused by a cycle in the ancestry. This should normally
    // never happen
    if (visitedReportIDs.has(report.reportID)) {
        Log_1.default.alert('Report ancestry cycle detected.', { reportID: report.reportID, ancestry: Array.from(visitedReportIDs) });
        return undefined;
    }
    visitedReportIDs.add(report.reportID);
    var parentReport = getReportOrDraftReport(report === null || report === void 0 ? void 0 : report.parentReportID, reports);
    // Runs recursion to iterate a parent report
    return getRootParentReport({ report: !(0, EmptyObject_1.isEmptyObject)(parentReport) ? parentReport : undefined, visitedReportIDs: visitedReportIDs, reports: reports });
}
/**
 * Returns the policy of the report
 * @deprecated Get the data straight from Onyx - This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
 */
function getPolicy(policyID) {
    if (!allPolicies || !policyID) {
        return undefined;
    }
    return allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
}
/**
 * Get the policy type from a given report
 * @param policies must have Onyxkey prefix (i.e 'policy_') for keys
 */
function getPolicyType(report, policies) {
    var _a, _b;
    return (_b = (_a = policies === null || policies === void 0 ? void 0 : policies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID)]) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : '';
}
/**
 * Get the policy name from a given report
 */
function getPolicyName(_a) {
    var report = _a.report, _b = _a.returnEmptyIfNotFound, returnEmptyIfNotFound = _b === void 0 ? false : _b, policy = _a.policy, policies = _a.policies, reports = _a.reports;
    var noPolicyFound = returnEmptyIfNotFound ? '' : unavailableTranslation;
    if ((0, EmptyObject_1.isEmptyObject)(report) || ((0, EmptyObject_1.isEmptyObject)(policies) && (0, EmptyObject_1.isEmptyObject)(allPolicies) && !(report === null || report === void 0 ? void 0 : report.policyName))) {
        return noPolicyFound;
    }
    var finalPolicy = (function () {
        if ((0, EmptyObject_1.isEmptyObject)(policy)) {
            if (policies) {
                return policies.find(function (p) { return p.id === report.policyID; });
            }
            return allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report.policyID)];
        }
        return policy !== null && policy !== void 0 ? policy : policies === null || policies === void 0 ? void 0 : policies.find(function (p) { return p.id === report.policyID; });
    })();
    var parentReport = getRootParentReport({ report: report, reports: reports });
    // Rooms send back the policy name with the reportSummary,
    // since they can also be accessed by people who aren't in the workspace
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var policyName = (finalPolicy === null || finalPolicy === void 0 ? void 0 : finalPolicy.name) || (report === null || report === void 0 ? void 0 : report.policyName) || (report === null || report === void 0 ? void 0 : report.oldPolicyName) || (parentReport === null || parentReport === void 0 ? void 0 : parentReport.oldPolicyName) || noPolicyFound;
    return policyName;
}
/**
 * Returns the concatenated title for the PrimaryLogins of a report
 */
function getReportParticipantsTitle(accountIDs) {
    // Somehow it's possible for the logins coming from report.participantAccountIDs to contain undefined values so we use .filter(Boolean) to remove them.
    return accountIDs.filter(Boolean).join(', ');
}
/**
 * Checks if a report is a chat report.
 */
function isChatReport(report) {
    return (report === null || report === void 0 ? void 0 : report.type) === CONST_1.default.REPORT.TYPE.CHAT;
}
function isInvoiceReport(report) {
    return (report === null || report === void 0 ? void 0 : report.type) === CONST_1.default.REPORT.TYPE.INVOICE;
}
function isFinancialReportsForBusinesses(report) {
    return (report === null || report === void 0 ? void 0 : report.type) === CONST_1.default.REPORT.TYPE.EXPENSE || (report === null || report === void 0 ? void 0 : report.type) === CONST_1.default.REPORT.TYPE.INVOICE;
}
function isNewDotInvoice(invoiceRoomID) {
    if (!invoiceRoomID) {
        return false;
    }
    return isInvoiceRoom(getReport(invoiceRoomID, allReports));
}
/**
 * Checks if the report with supplied ID has been approved or not
 */
function isReportIDApproved(reportID) {
    if (!reportID) {
        return;
    }
    var report = getReport(reportID, allReports);
    if (!report) {
        return;
    }
    return isReportApproved({ report: report });
}
/**
 * Checks if a report is an Expense report.
 */
function isExpenseReport(report) {
    return (report === null || report === void 0 ? void 0 : report.type) === CONST_1.default.REPORT.TYPE.EXPENSE;
}
/**
 * Checks if a report is an IOU report using report or reportID
 */
function isIOUReport(reportOrID) {
    var _a;
    var report = typeof reportOrID === 'string' ? ((_a = getReport(reportOrID, allReports)) !== null && _a !== void 0 ? _a : null) : reportOrID;
    return (report === null || report === void 0 ? void 0 : report.type) === CONST_1.default.REPORT.TYPE.IOU;
}
/**
 * Checks if a report is an IOU report using report
 */
function isIOUReportUsingReport(report) {
    return (report === null || report === void 0 ? void 0 : report.type) === CONST_1.default.REPORT.TYPE.IOU;
}
/**
 * Checks if a report is a task report.
 */
function isTaskReport(report) {
    return (report === null || report === void 0 ? void 0 : report.type) === CONST_1.default.REPORT.TYPE.TASK;
}
/**
 * Checks if a task has been cancelled
 * When a task is deleted, the parentReportAction is updated to have a isDeletedParentAction deleted flag
 * This is because when you delete a task, we still allow you to chat on the report itself
 * There's another situation where you don't have access to the parentReportAction (because it was created in a chat you don't have access to)
 * In this case, we have added the key to the report itself
 */
function isCanceledTaskReport(report, parentReportAction) {
    var _a, _b;
    if (parentReportAction === void 0) { parentReportAction = null; }
    if (!(0, EmptyObject_1.isEmptyObject)(parentReportAction) && ((_b = (_a = (0, ReportActionsUtils_1.getReportActionMessage)(parentReportAction)) === null || _a === void 0 ? void 0 : _a.isDeletedParentAction) !== null && _b !== void 0 ? _b : false)) {
        return true;
    }
    if (!(0, EmptyObject_1.isEmptyObject)(report) && (report === null || report === void 0 ? void 0 : report.isDeletedParentAction)) {
        return true;
    }
    return false;
}
/**
 * Checks if a report is an open task report.
 *
 * @param parentReportAction - The parent report action of the report (Used to check if the task has been canceled)
 */
function isOpenTaskReport(report, parentReportAction) {
    if (parentReportAction === void 0) { parentReportAction = null; }
    return (isTaskReport(report) && !isCanceledTaskReport(report, parentReportAction) && (report === null || report === void 0 ? void 0 : report.stateNum) === CONST_1.default.REPORT.STATE_NUM.OPEN && (report === null || report === void 0 ? void 0 : report.statusNum) === CONST_1.default.REPORT.STATUS_NUM.OPEN);
}
/**
 * Checks if a report is a completed task report.
 */
function isCompletedTaskReport(report) {
    return isTaskReport(report) && (report === null || report === void 0 ? void 0 : report.stateNum) === CONST_1.default.REPORT.STATE_NUM.APPROVED && (report === null || report === void 0 ? void 0 : report.statusNum) === CONST_1.default.REPORT.STATUS_NUM.APPROVED;
}
/**
 * Checks if the current user is the manager of the supplied report
 */
function isReportManager(report) {
    return !!(report && report.managerID === currentUserAccountID);
}
/**
 * Checks if the supplied report has been approved
 */
function isReportApproved(_a) {
    var report = _a.report, _b = _a.parentReportAction, parentReportAction = _b === void 0 ? undefined : _b;
    if (!report) {
        return (parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.childStateNum) === CONST_1.default.REPORT.STATE_NUM.APPROVED && (parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.childStatusNum) === CONST_1.default.REPORT.STATUS_NUM.APPROVED;
    }
    return (report === null || report === void 0 ? void 0 : report.stateNum) === CONST_1.default.REPORT.STATE_NUM.APPROVED && (report === null || report === void 0 ? void 0 : report.statusNum) === CONST_1.default.REPORT.STATUS_NUM.APPROVED;
}
/**
 * Checks if the supplied report has been manually reimbursed
 */
function isReportManuallyReimbursed(report) {
    return (report === null || report === void 0 ? void 0 : report.stateNum) === CONST_1.default.REPORT.STATE_NUM.APPROVED && (report === null || report === void 0 ? void 0 : report.statusNum) === CONST_1.default.REPORT.STATUS_NUM.REIMBURSED;
}
/**
 * Checks if the supplied report is an expense report in Open state and status.
 */
function isOpenExpenseReport(report) {
    return isExpenseReport(report) && (report === null || report === void 0 ? void 0 : report.stateNum) === CONST_1.default.REPORT.STATE_NUM.OPEN && (report === null || report === void 0 ? void 0 : report.statusNum) === CONST_1.default.REPORT.STATUS_NUM.OPEN;
}
/**
 * Checks if the supplied report has a member with the array passed in params.
 */
function hasParticipantInArray(report, memberAccountIDs) {
    if (!(report === null || report === void 0 ? void 0 : report.participants)) {
        return false;
    }
    var memberAccountIDsSet = new Set(memberAccountIDs);
    for (var accountID in report.participants) {
        if (memberAccountIDsSet.has(Number(accountID))) {
            return true;
        }
    }
    return false;
}
/**
 * Whether the Money Request report is settled
 */
function isSettled(reportOrID, reports) {
    var _a;
    if (!reportOrID) {
        return false;
    }
    var report = typeof reportOrID === 'string' ? ((_a = getReport(reportOrID, reports !== null && reports !== void 0 ? reports : allReports)) !== null && _a !== void 0 ? _a : null) : reportOrID;
    if (!report) {
        return false;
    }
    if ((0, EmptyObject_1.isEmptyObject)(report)) {
        return false;
    }
    // In case the payment is scheduled and we are waiting for the payee to set up their wallet,
    // consider the report as paid as well.
    if (report.isWaitingOnBankAccount && report.statusNum === CONST_1.default.REPORT.STATUS_NUM.APPROVED) {
        return false;
    }
    return (report === null || report === void 0 ? void 0 : report.statusNum) === CONST_1.default.REPORT.STATUS_NUM.REIMBURSED;
}
/**
 * Whether the current user is the submitter of the report
 */
function isCurrentUserSubmitter(reportID) {
    if (!allReports || !reportID) {
        return false;
    }
    var report = allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    return !!(report && report.ownerAccountID === currentUserAccountID);
}
/**
 * Whether the provided report is an Admin room
 */
function isAdminRoom(report) {
    return getChatType(report) === CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS;
}
/**
 * Whether the provided report is an Admin-only posting room
 */
function isAdminsOnlyPostingRoom(report) {
    return (report === null || report === void 0 ? void 0 : report.writeCapability) === CONST_1.default.REPORT.WRITE_CAPABILITIES.ADMINS;
}
/**
 * Whether the provided report is a Announce room
 */
function isAnnounceRoom(report) {
    return getChatType(report) === CONST_1.default.REPORT.CHAT_TYPE.POLICY_ANNOUNCE;
}
/**
 * Whether the provided report is a default room
 */
function isDefaultRoom(report) {
    return CONST_1.default.DEFAULT_POLICY_ROOM_CHAT_TYPES.some(function (type) { return type === getChatType(report); });
}
/**
 * Whether the provided report is a Domain room
 */
function isDomainRoom(report) {
    return getChatType(report) === CONST_1.default.REPORT.CHAT_TYPE.DOMAIN_ALL;
}
/**
 * Whether the provided report is a user created policy room
 */
function isUserCreatedPolicyRoom(report) {
    return getChatType(report) === CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM;
}
/**
 * Whether the provided report is a Policy Expense chat.
 */
function isPolicyExpenseChat(option) {
    return getChatType(option) === CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT || !!(option && typeof option === 'object' && 'isPolicyExpenseChat' in option && option.isPolicyExpenseChat);
}
function isInvoiceRoom(report) {
    return getChatType(report) === CONST_1.default.REPORT.CHAT_TYPE.INVOICE;
}
function isInvoiceRoomWithID(reportID) {
    if (!reportID) {
        return false;
    }
    var report = getReport(reportID, allReports);
    return isInvoiceRoom(report);
}
/**
 * Checks if a report is a completed task report.
 */
function isTripRoom(report) {
    return isChatReport(report) && getChatType(report) === CONST_1.default.REPORT.CHAT_TYPE.TRIP_ROOM;
}
function isIndividualInvoiceRoom(report) {
    var _a;
    return isInvoiceRoom(report) && ((_a = report === null || report === void 0 ? void 0 : report.invoiceReceiver) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;
}
function isCurrentUserInvoiceReceiver(report) {
    var _a, _b;
    if (((_a = report === null || report === void 0 ? void 0 : report.invoiceReceiver) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
        return currentUserAccountID === report.invoiceReceiver.accountID;
    }
    if (((_b = report === null || report === void 0 ? void 0 : report.invoiceReceiver) === null || _b === void 0 ? void 0 : _b.type) === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS) {
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line deprecation/deprecation
        var policy = getPolicy(report.invoiceReceiver.policyID);
        return (0, PolicyUtils_1.isPolicyAdmin)(policy);
    }
    return false;
}
/**
 * Whether the provided report belongs to a Control policy and is an expense chat
 */
function isControlPolicyExpenseChat(report) {
    return isPolicyExpenseChat(report) && getPolicyType(report, allPolicies) === CONST_1.default.POLICY.TYPE.CORPORATE;
}
/**
 * Whether the provided policyType is a Free, Collect or Control policy type
 */
function isGroupPolicy(policyType) {
    return policyType === CONST_1.default.POLICY.TYPE.CORPORATE || policyType === CONST_1.default.POLICY.TYPE.TEAM;
}
/**
 * Whether the provided report belongs to a Free, Collect or Control policy
 */
function isReportInGroupPolicy(report, policy) {
    var _a;
    var policyType = (_a = policy === null || policy === void 0 ? void 0 : policy.type) !== null && _a !== void 0 ? _a : getPolicyType(report, allPolicies);
    return isGroupPolicy(policyType);
}
/**
 * Whether the provided report belongs to a Control or Collect policy
 */
function isPaidGroupPolicy(report) {
    var policyType = getPolicyType(report, allPolicies);
    return policyType === CONST_1.default.POLICY.TYPE.CORPORATE || policyType === CONST_1.default.POLICY.TYPE.TEAM;
}
/**
 * Whether the provided report belongs to a Control or Collect policy and is an expense chat
 */
function isPaidGroupPolicyExpenseChat(report) {
    return isPolicyExpenseChat(report) && isPaidGroupPolicy(report);
}
/**
 * Whether the provided report belongs to a Control policy and is an expense report
 */
function isControlPolicyExpenseReport(report) {
    return isExpenseReport(report) && getPolicyType(report, allPolicies) === CONST_1.default.POLICY.TYPE.CORPORATE;
}
/**
 * Whether the provided report belongs to a Control or Collect policy and is an expense report
 */
function isPaidGroupPolicyExpenseReport(report) {
    return isExpenseReport(report) && isPaidGroupPolicy(report);
}
/**
 * Checks if the supplied report is an invoice report in Open state and status.
 */
function isOpenInvoiceReport(report) {
    return isInvoiceReport(report) && (report === null || report === void 0 ? void 0 : report.statusNum) === CONST_1.default.REPORT.STATUS_NUM.OPEN;
}
/**
 * Whether the provided report is a chat room
 */
function isChatRoom(report) {
    return isUserCreatedPolicyRoom(report) || isDefaultRoom(report) || isInvoiceRoom(report) || isTripRoom(report);
}
/**
 * Whether the provided report is a public room
 */
function isPublicRoom(report) {
    return (report === null || report === void 0 ? void 0 : report.visibility) === CONST_1.default.REPORT.VISIBILITY.PUBLIC || (report === null || report === void 0 ? void 0 : report.visibility) === CONST_1.default.REPORT.VISIBILITY.PUBLIC_ANNOUNCE;
}
/**
 * Whether the provided report is a public announce room
 */
function isPublicAnnounceRoom(report) {
    return (report === null || report === void 0 ? void 0 : report.visibility) === CONST_1.default.REPORT.VISIBILITY.PUBLIC_ANNOUNCE;
}
/**
 * If the report is a policy expense, the route should be for adding bank account for that policy
 * else since the report is a personal IOU, the route should be for personal bank account.
 */
function getBankAccountRoute(report) {
    var _a, _b;
    if (isPolicyExpenseChat(report)) {
        return ROUTES_1.default.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(report === null || report === void 0 ? void 0 : report.policyID, undefined, Navigation_1.default.getActiveRoute());
    }
    if (isInvoiceRoom(report) && ((_a = report === null || report === void 0 ? void 0 : report.invoiceReceiver) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS) {
        return ROUTES_1.default.WORKSPACE_INVOICES.getRoute((_b = report === null || report === void 0 ? void 0 : report.invoiceReceiver) === null || _b === void 0 ? void 0 : _b.policyID);
    }
    return ROUTES_1.default.SETTINGS_ADD_BANK_ACCOUNT.route;
}
/**
 * Check if personal detail of accountID is empty or optimistic data
 */
function isOptimisticPersonalDetail(accountID) {
    var _a;
    return (0, EmptyObject_1.isEmptyObject)(allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID]) || !!((_a = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID]) === null || _a === void 0 ? void 0 : _a.isOptimisticPersonalDetail);
}
/**
 * Checks if a report is a task report from a policy expense chat.
 */
function isWorkspaceTaskReport(report) {
    if (!isTaskReport(report)) {
        return false;
    }
    var parentReport = (report === null || report === void 0 ? void 0 : report.parentReportID) ? getReport(report === null || report === void 0 ? void 0 : report.parentReportID, allReports) : undefined;
    return isPolicyExpenseChat(parentReport);
}
/**
 * Returns true if report has a parent
 */
function isThread(report) {
    return !!((report === null || report === void 0 ? void 0 : report.parentReportID) && (report === null || report === void 0 ? void 0 : report.parentReportActionID));
}
/**
 * Returns true if report is of type chat and has a parent and is therefore a Thread.
 */
function isChatThread(report) {
    return isThread(report) && (report === null || report === void 0 ? void 0 : report.type) === CONST_1.default.REPORT.TYPE.CHAT;
}
function isDM(report) {
    return isChatReport(report) && !getChatType(report) && !isThread(report);
}
function isSelfDM(report) {
    return getChatType(report) === CONST_1.default.REPORT.CHAT_TYPE.SELF_DM;
}
function isGroupChat(report) {
    return getChatType(report) === CONST_1.default.REPORT.CHAT_TYPE.GROUP;
}
/**
 * Only returns true if this is the Expensify DM report.
 *
 * Note that this chat is no longer used for new users. We still need this function for users who have this chat.
 */
function isSystemChat(report) {
    return getChatType(report) === CONST_1.default.REPORT.CHAT_TYPE.SYSTEM;
}
function getDefaultNotificationPreferenceForReport(report) {
    if (isAnnounceRoom(report)) {
        return CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS;
    }
    if (isPublicRoom(report)) {
        return CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.DAILY;
    }
    if (!getChatType(report) || isGroupChat(report)) {
        return CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS;
    }
    if (isAdminRoom(report) || isPolicyExpenseChat(report) || isInvoiceRoom(report)) {
        return CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS;
    }
    if (isSelfDM(report)) {
        return CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.MUTE;
    }
    return CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.DAILY;
}
/**
 * Get the notification preference given a report. This should ALWAYS default to 'hidden'. Do not change this!
 */
function getReportNotificationPreference(report) {
    var _a, _b;
    var participant = currentUserAccountID ? (_a = report === null || report === void 0 ? void 0 : report.participants) === null || _a === void 0 ? void 0 : _a[currentUserAccountID] : undefined;
    return (_b = participant === null || participant === void 0 ? void 0 : participant.notificationPreference) !== null && _b !== void 0 ? _b : CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
}
/**
 * Only returns true if this is our main 1:1 DM report with Concierge.
 */
function isConciergeChatReport(report) {
    return !!report && (report === null || report === void 0 ? void 0 : report.reportID) === conciergeReportID;
}
function findSelfDMReportID() {
    if (!allReports) {
        return;
    }
    var selfDMReport = Object.values(allReports).find(function (report) { return isSelfDM(report) && !isThread(report); });
    return selfDMReport === null || selfDMReport === void 0 ? void 0 : selfDMReport.reportID;
}
/**
 * Checks if the supplied report is from a policy or is an invoice report from a policy
 */
function isPolicyRelatedReport(report, policyID) {
    return (report === null || report === void 0 ? void 0 : report.policyID) === policyID || !!((report === null || report === void 0 ? void 0 : report.invoiceReceiver) && 'policyID' in report.invoiceReceiver && report.invoiceReceiver.policyID === policyID);
}
/**
 * Checks if the supplied report belongs to workspace based on the provided params. If the report's policyID is _FAKE_ or has no value, it means this report is a DM.
 * In this case report and workspace members must be compared to determine whether the report belongs to the workspace.
 */
function doesReportBelongToWorkspace(report, policyMemberAccountIDs, policyID) {
    return (isConciergeChatReport(report) ||
        ((report === null || report === void 0 ? void 0 : report.policyID) === CONST_1.default.POLICY.ID_FAKE || !(report === null || report === void 0 ? void 0 : report.policyID) ? hasParticipantInArray(report, policyMemberAccountIDs) : isPolicyRelatedReport(report, policyID)));
}
/**
 * Returns true if the report is an expense report or a group policy and the iouType is not split.
 */
function shouldEnableNegative(report, policy, iouType) {
    var _a;
    return (isExpenseReport(report) || isGroupPolicy((_a = policy === null || policy === void 0 ? void 0 : policy.type) !== null && _a !== void 0 ? _a : '') || iouType === CONST_1.default.IOU.TYPE.CREATE) && iouType !== CONST_1.default.IOU.TYPE.SPLIT;
}
/**
 * Given an array of reports, return them filtered by a policyID and policyMemberAccountIDs.
 */
function filterReportsByPolicyIDAndMemberAccountIDs(reports, policyMemberAccountIDs, policyID) {
    if (policyMemberAccountIDs === void 0) { policyMemberAccountIDs = []; }
    return reports.filter(function (report) { return !!report && doesReportBelongToWorkspace(report, policyMemberAccountIDs, policyID); });
}
/**
 * Returns true if report is still being processed
 */
function isProcessingReport(report) {
    return (report === null || report === void 0 ? void 0 : report.stateNum) === CONST_1.default.REPORT.STATE_NUM.SUBMITTED && (report === null || report === void 0 ? void 0 : report.statusNum) === CONST_1.default.REPORT.STATUS_NUM.SUBMITTED;
}
function isOpenReport(report) {
    return (report === null || report === void 0 ? void 0 : report.stateNum) === CONST_1.default.REPORT.STATE_NUM.OPEN && (report === null || report === void 0 ? void 0 : report.statusNum) === CONST_1.default.REPORT.STATUS_NUM.OPEN;
}
function isAwaitingFirstLevelApproval(report) {
    if (!report) {
        return false;
    }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var submitsToAccountID = (0, PolicyUtils_1.getSubmitToAccountID)(getPolicy(report.policyID), report);
    return isProcessingReport(report) && submitsToAccountID === report.managerID;
}
/**
 * Pushes optimistic transaction violations to OnyxData for the given policy and categories onyx update.
 *
 * @param policyUpdate Changed policy properties, if none pass empty object
 * @param policyCategoriesUpdate Changed categories properties, if none pass empty object
 */
function pushTransactionViolationsOnyxData(onyxData, policyID, policyTagLists, policyCategories, allTransactionViolations, policyUpdate, policyCategoriesUpdate) {
    if (policyUpdate === void 0) { policyUpdate = {}; }
    if (policyCategoriesUpdate === void 0) { policyCategoriesUpdate = {}; }
    if ((0, EmptyObject_1.isEmptyObject)(policyUpdate) && (0, EmptyObject_1.isEmptyObject)(policyCategoriesUpdate)) {
        return onyxData;
    }
    var optimisticPolicyCategories = Object.keys(policyCategories).reduce(function (acc, categoryName) {
        var _a;
        acc[categoryName] = __assign(__assign({}, policyCategories[categoryName]), ((_a = policyCategoriesUpdate === null || policyCategoriesUpdate === void 0 ? void 0 : policyCategoriesUpdate[categoryName]) !== null && _a !== void 0 ? _a : {}));
        return acc;
    }, {});
    var optimisticPolicy = __assign(__assign({}, allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]), policyUpdate);
    var hasDependentTags = (0, PolicyUtils_1.hasDependentTags)(optimisticPolicy, policyTagLists);
    getAllPolicyReports(policyID).forEach(function (report) {
        if (!(report === null || report === void 0 ? void 0 : report.reportID)) {
            return;
        }
        var isReportAnInvoice = isInvoiceReport(report);
        getReportTransactions(report.reportID).forEach(function (transaction) {
            var _a, _b, _c;
            var transactionViolations = (_a = allTransactionViolations === null || allTransactionViolations === void 0 ? void 0 : allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID)]) !== null && _a !== void 0 ? _a : [];
            var optimisticTransactionViolations = ViolationsUtils_1.default.getViolationsOnyxData(transaction, transactionViolations, optimisticPolicy, policyTagLists, optimisticPolicyCategories, hasDependentTags, isReportAnInvoice);
            if (optimisticTransactionViolations) {
                (_b = onyxData === null || onyxData === void 0 ? void 0 : onyxData.optimisticData) === null || _b === void 0 ? void 0 : _b.push(optimisticTransactionViolations);
                (_c = onyxData === null || onyxData === void 0 ? void 0 : onyxData.failureData) === null || _c === void 0 ? void 0 : _c.push({
                    onyxMethod: react_native_onyx_1.default.METHOD.SET,
                    key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID),
                    value: transactionViolations,
                });
            }
        });
    });
    return onyxData;
}
/**
 * Check if the report is a single chat report that isn't a thread
 * and personal detail of participant is optimistic data
 */
function shouldDisableDetailPage(report) {
    var _a, _b;
    if (isChatRoom(report) || isPolicyExpenseChat(report) || isChatThread(report) || isTaskReport(report)) {
        return false;
    }
    if (isOneOnOneChat(report)) {
        var participantAccountIDs = Object.keys((_a = report === null || report === void 0 ? void 0 : report.participants) !== null && _a !== void 0 ? _a : {})
            .map(Number)
            .filter(function (accountID) { return accountID !== currentUserAccountID; });
        return isOptimisticPersonalDetail((_b = participantAccountIDs.at(0)) !== null && _b !== void 0 ? _b : -1);
    }
    return false;
}
/**
 * Returns true if this report has only one participant and it's an Expensify account.
 */
function isExpensifyOnlyParticipantInReport(report) {
    var _a;
    var otherParticipants = Object.keys((_a = report === null || report === void 0 ? void 0 : report.participants) !== null && _a !== void 0 ? _a : {})
        .map(Number)
        .filter(function (accountID) { return accountID !== currentUserAccountID; });
    return otherParticipants.length === 1 && otherParticipants.some(function (accountID) { return CONST_1.default.EXPENSIFY_ACCOUNT_IDS.includes(accountID); });
}
/**
 * Returns whether a given report can have tasks created in it.
 * We only prevent the task option if it's a DM/group-DM and the other users are all special Expensify accounts
 *
 */
function canCreateTaskInReport(report) {
    var _a;
    var otherParticipants = Object.keys((_a = report === null || report === void 0 ? void 0 : report.participants) !== null && _a !== void 0 ? _a : {})
        .map(Number)
        .filter(function (accountID) { return accountID !== currentUserAccountID; });
    var areExpensifyAccountsOnlyOtherParticipants = otherParticipants.length >= 1 && otherParticipants.every(function (accountID) { return CONST_1.default.EXPENSIFY_ACCOUNT_IDS.includes(accountID); });
    if (areExpensifyAccountsOnlyOtherParticipants && isDM(report)) {
        return false;
    }
    return true;
}
function isHiddenForCurrentUser(reportOrPreference) {
    if (typeof reportOrPreference === 'object' && reportOrPreference !== null) {
        var notificationPreference = getReportNotificationPreference(reportOrPreference);
        return isHiddenForCurrentUser(notificationPreference);
    }
    if (reportOrPreference === undefined || reportOrPreference === null || reportOrPreference === '') {
        return true;
    }
    return reportOrPreference === CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
}
/**
 * Returns true if there are any guides accounts (team.expensify.com) in a list of accountIDs
 * by cross-referencing the accountIDs with personalDetails since guides that are participants
 * of the user's chats should have their personal details in Onyx.
 */
function hasExpensifyGuidesEmails(accountIDs) {
    return accountIDs.some(function (accountID) { var _a, _b; return expensify_common_1.Str.extractEmailDomain((_b = (_a = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID]) === null || _a === void 0 ? void 0 : _a.login) !== null && _b !== void 0 ? _b : '') === CONST_1.default.EMAIL.GUIDES_DOMAIN; });
}
function getMostRecentlyVisitedReport(reports, reportMetadata) {
    var filteredReports = reports.filter(function (report) {
        var _a, _b;
        var shouldKeep = !isChatThread(report) || !isHiddenForCurrentUser(report);
        return shouldKeep && !!(report === null || report === void 0 ? void 0 : report.reportID) && !!((_b = (_a = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report.reportID)]) === null || _a === void 0 ? void 0 : _a.lastVisitTime) !== null && _b !== void 0 ? _b : report === null || report === void 0 ? void 0 : report.lastReadTime);
    });
    return (0, maxBy_1.default)(filteredReports, function (a) { var _a, _b, _c; return [(_b = (_a = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(a === null || a === void 0 ? void 0 : a.reportID)]) === null || _a === void 0 ? void 0 : _a.lastVisitTime) !== null && _b !== void 0 ? _b : '', (_c = a === null || a === void 0 ? void 0 : a.lastReadTime) !== null && _c !== void 0 ? _c : '']; });
}
function findLastAccessedReport(ignoreDomainRooms, openOnAdminRoom, policyID, excludeReportID) {
    // If it's the user's first time using New Expensify, then they could either have:
    //   - just a Concierge report, if so we'll return that
    //   - their Concierge report, and a separate report that must have deeplinked them to the app before they created their account.
    // If it's the latter, we'll use the deeplinked report over the Concierge report,
    // since the Concierge report would be incorrectly selected over the deep-linked report in the logic below.
    var _a;
    if (openOnAdminRoom === void 0) { openOnAdminRoom = false; }
    var policyMemberAccountIDs = (0, PolicyUtils_1.getPolicyEmployeeListByIdWithoutCurrentUser)(allPolicies, policyID, currentUserAccountID);
    var reportsValues = Object.values(allReports !== null && allReports !== void 0 ? allReports : {});
    if (!!policyID || policyMemberAccountIDs.length > 0) {
        reportsValues = filterReportsByPolicyIDAndMemberAccountIDs(reportsValues, policyMemberAccountIDs, policyID);
    }
    var adminReport;
    if (openOnAdminRoom) {
        adminReport = reportsValues.find(function (report) {
            var chatType = getChatType(report);
            return chatType === CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS;
        });
    }
    if (adminReport) {
        return adminReport;
    }
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var shouldFilter = excludeReportID || ignoreDomainRooms;
    if (shouldFilter) {
        reportsValues = reportsValues.filter(function (report) {
            var _a;
            if (excludeReportID && (report === null || report === void 0 ? void 0 : report.reportID) === excludeReportID) {
                return false;
            }
            // We allow public announce rooms, admins, and announce rooms through since we bypass the default rooms beta for them.
            // Check where findLastAccessedReport is called in MainDrawerNavigator.js for more context.
            // Domain rooms are now the only type of default room that are on the defaultRooms beta.
            if (ignoreDomainRooms && isDomainRoom(report) && !hasExpensifyGuidesEmails(Object.keys((_a = report === null || report === void 0 ? void 0 : report.participants) !== null && _a !== void 0 ? _a : {}).map(Number))) {
                return false;
            }
            return true;
        });
    }
    // Filter out the system chat (Expensify chat) because the composer is disabled in it,
    // and it prompts the user to use the Concierge chat instead.
    reportsValues =
        (_a = reportsValues.filter(function (report) {
            // This will get removed as part of https://github.com/Expensify/App/issues/59961
            // eslint-disable-next-line deprecation/deprecation
            var reportNameValuePairs = getReportNameValuePairs(report === null || report === void 0 ? void 0 : report.reportID);
            return !isSystemChat(report) && !isArchivedReport(reportNameValuePairs);
        })) !== null && _a !== void 0 ? _a : [];
    // At least two reports remain: self DM and Concierge chat.
    // Return the most recently visited report. Get the last read report from the report metadata.
    // If allReportMetadata is empty we'll return most recent report owned by user
    if ((0, EmptyObject_1.isEmptyObject)(allReportMetadata)) {
        var ownedReports = reportsValues.filter(function (report) { return (report === null || report === void 0 ? void 0 : report.ownerAccountID) === currentUserAccountID; });
        if (ownedReports.length > 0) {
            return (0, maxBy_1.default)(ownedReports, function (a) { var _a; return (_a = a === null || a === void 0 ? void 0 : a.lastReadTime) !== null && _a !== void 0 ? _a : ''; });
        }
        return (0, maxBy_1.default)(reportsValues, function (a) { var _a; return (_a = a === null || a === void 0 ? void 0 : a.lastReadTime) !== null && _a !== void 0 ? _a : ''; });
    }
    return getMostRecentlyVisitedReport(reportsValues, allReportMetadata);
}
/**
 * Whether the provided report has expenses
 */
function hasExpenses(reportID, transactions) {
    if (transactions) {
        return !!(transactions === null || transactions === void 0 ? void 0 : transactions.find(function (transaction) { return (transaction === null || transaction === void 0 ? void 0 : transaction.reportID) === reportID; }));
    }
    return !!Object.values(allTransactions !== null && allTransactions !== void 0 ? allTransactions : {}).find(function (transaction) { return (transaction === null || transaction === void 0 ? void 0 : transaction.reportID) === reportID; });
}
/**
 * Whether the provided report is a closed expense report with no expenses
 */
function isClosedExpenseReportWithNoExpenses(report, transactions) {
    return (report === null || report === void 0 ? void 0 : report.statusNum) === CONST_1.default.REPORT.STATUS_NUM.CLOSED && isExpenseReport(report) && !hasExpenses(report.reportID, transactions);
}
/**
 * Whether the provided report is an archived room
 */
function isArchivedNonExpenseReport(report, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    return isReportArchived && !(isExpenseReport(report) || isExpenseRequest(report));
}
/**
 * Whether the provided report is an archived report
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isArchivedReport(reportNameValuePairs) {
    return !!(reportNameValuePairs === null || reportNameValuePairs === void 0 ? void 0 : reportNameValuePairs.private_isArchived);
}
/**
 * Whether the report with the provided reportID is an archived non-expense report
 */
function isArchivedNonExpenseReportWithID(report, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    if (!report) {
        return false;
    }
    return !(isExpenseReport(report) || isExpenseRequest(report)) && isReportArchived;
}
/**
 * Whether the provided report is a closed report
 */
function isClosedReport(report) {
    return (report === null || report === void 0 ? void 0 : report.statusNum) === CONST_1.default.REPORT.STATUS_NUM.CLOSED;
}
/**
 * Whether the provided report is the admin's room
 */
function isJoinRequestInAdminRoom(report) {
    if (!report) {
        return false;
    }
    // If this policy isn't owned by Expensify,
    // Account manager/guide should not have the workspace join request pinned to their LHN,
    // since they are not a part of the company, and should not action it on their behalf.
    if (report.policyID) {
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line deprecation/deprecation
        var policy = getPolicy(report.policyID);
        if (!(0, PolicyUtils_1.isExpensifyTeam)(policy === null || policy === void 0 ? void 0 : policy.owner) && (0, PolicyUtils_1.isExpensifyTeam)(currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.login)) {
            return false;
        }
    }
    return (0, ReportActionsUtils_1.isActionableJoinRequestPending)(report.reportID);
}
/**
 * Checks if the user has auditor permission in the provided report
 */
function isAuditor(report) {
    var _a;
    if (report === null || report === void 0 ? void 0 : report.policyID) {
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line deprecation/deprecation
        var policy = getPolicy(report.policyID);
        return (0, PolicyUtils_1.isPolicyAuditor)(policy);
    }
    if (Array.isArray(report === null || report === void 0 ? void 0 : report.permissions) && (report === null || report === void 0 ? void 0 : report.permissions.length) > 0) {
        return (_a = report === null || report === void 0 ? void 0 : report.permissions) === null || _a === void 0 ? void 0 : _a.includes(CONST_1.default.REPORT.PERMISSIONS.AUDITOR);
    }
    return false;
}
/**
 * Checks if the user can write in the provided report
 */
function canWriteInReport(report) {
    var _a, _b;
    if (Array.isArray(report === null || report === void 0 ? void 0 : report.permissions) && (report === null || report === void 0 ? void 0 : report.permissions.length) > 0 && !((_a = report === null || report === void 0 ? void 0 : report.permissions) === null || _a === void 0 ? void 0 : _a.includes(CONST_1.default.REPORT.PERMISSIONS.AUDITOR))) {
        return (_b = report === null || report === void 0 ? void 0 : report.permissions) === null || _b === void 0 ? void 0 : _b.includes(CONST_1.default.REPORT.PERMISSIONS.WRITE);
    }
    return true;
}
/**
 * Checks if the current user is allowed to comment on the given report.
 */
function isAllowedToComment(report) {
    var _a;
    if (isAuditor(report)) {
        return true;
    }
    if (!canWriteInReport(report)) {
        return false;
    }
    // Default to allowing all users to post
    var capability = (_a = report === null || report === void 0 ? void 0 : report.writeCapability) !== null && _a !== void 0 ? _a : CONST_1.default.REPORT.WRITE_CAPABILITIES.ALL;
    if (capability === CONST_1.default.REPORT.WRITE_CAPABILITIES.ALL) {
        return true;
    }
    // If unauthenticated user opens public chat room using deeplink, they do not have policies available and they cannot comment
    if (!allPolicies) {
        return false;
    }
    // If we've made it here, commenting on this report is restricted.
    // If the user is an admin, allow them to post.
    var policy = allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID)];
    return (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
}
/**
 * Checks if the current user is the admin of the policy given the policy expense chat.
 */
function isPolicyExpenseChatAdmin(report, policies) {
    var _a;
    if (!isPolicyExpenseChat(report)) {
        return false;
    }
    var policyRole = (_a = policies === null || policies === void 0 ? void 0 : policies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID)]) === null || _a === void 0 ? void 0 : _a.role;
    return policyRole === CONST_1.default.POLICY.ROLE.ADMIN;
}
/**
 * Checks if the current user is the admin of the policy.
 */
function isPolicyAdmin(policyID, policies) {
    var _a;
    if (!policyID) {
        return false;
    }
    var policyRole = (_a = policies === null || policies === void 0 ? void 0 : policies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) === null || _a === void 0 ? void 0 : _a.role;
    return policyRole === CONST_1.default.POLICY.ROLE.ADMIN;
}
/**
 * Checks whether all the transactions linked to the IOU report are of the Distance Request type with pending routes
 */
function hasOnlyTransactionsWithPendingRoutes(iouReportID) {
    var transactions = getReportTransactions(iouReportID);
    // Early return false in case not having any transaction
    if (!transactions || transactions.length === 0) {
        return false;
    }
    return transactions.every(function (transaction) { return (0, TransactionUtils_1.isFetchingWaypointsFromServer)(transaction); });
}
/**
 * If the report is a thread and has a chat type set, it is a expense chat.
 */
function isWorkspaceThread(report) {
    var chatType = getChatType(report);
    return isThread(report) && isChatReport(report) && CONST_1.default.WORKSPACE_ROOM_TYPES.some(function (type) { return chatType === type; });
}
/**
 * Checks if a report is a child report.
 */
function isChildReport(report) {
    return isThread(report) || isTaskReport(report);
}
/**
 * An Expense Request is a thread where the parent report is an Expense Report and
 * the parentReportAction is a transaction.
 */
function isExpenseRequest(report) {
    var _a;
    if (isThread(report)) {
        var parentReportAction = (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.parentReportID)]) === null || _a === void 0 ? void 0 : _a[report.parentReportActionID];
        var parentReport = getReport(report === null || report === void 0 ? void 0 : report.parentReportID, allReports);
        return isExpenseReport(parentReport) && !(0, EmptyObject_1.isEmptyObject)(parentReportAction) && (0, ReportActionsUtils_1.isTransactionThread)(parentReportAction);
    }
    return false;
}
/**
 * An IOU Request is a thread where the parent report is an IOU Report and
 * the parentReportAction is a transaction.
 */
function isIOURequest(report) {
    var _a;
    if (isThread(report)) {
        var parentReportAction = (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.parentReportID)]) === null || _a === void 0 ? void 0 : _a[report.parentReportActionID];
        var parentReport = getReport(report === null || report === void 0 ? void 0 : report.parentReportID, allReports);
        return isIOUReport(parentReport) && !(0, EmptyObject_1.isEmptyObject)(parentReportAction) && (0, ReportActionsUtils_1.isTransactionThread)(parentReportAction);
    }
    return false;
}
/**
 * A Track Expense Report is a thread where the parent the parentReportAction is a transaction, and
 * parentReportAction has type of track.
 */
function isTrackExpenseReport(report) {
    var _a;
    if (isThread(report)) {
        var selfDMReportID = findSelfDMReportID();
        var parentReportAction = (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.parentReportID)]) === null || _a === void 0 ? void 0 : _a[report.parentReportActionID];
        return !(0, EmptyObject_1.isEmptyObject)(parentReportAction) && selfDMReportID === report.parentReportID && (0, ReportActionsUtils_1.isTrackExpenseAction)(parentReportAction);
    }
    return false;
}
/**
 * Checks if a report is an IOU or expense request.
 */
function isMoneyRequest(reportOrID) {
    var _a;
    var report = typeof reportOrID === 'string' ? ((_a = getReport(reportOrID, allReports)) !== null && _a !== void 0 ? _a : null) : reportOrID;
    return isIOURequest(report) || isExpenseRequest(report);
}
/**
 * Checks if a report is an IOU or expense report.
 */
function isMoneyRequestReport(reportOrID, reports) {
    var _a;
    var report = typeof reportOrID === 'string' ? ((_a = getReport(reportOrID, reports !== null && reports !== void 0 ? reports : allReports)) !== null && _a !== void 0 ? _a : null) : reportOrID;
    return isIOUReport(report) || isExpenseReport(report);
}
/**
 * Determines the Help Panel report type based on the given report.
 */
function getHelpPaneReportType(report) {
    if (!report) {
        return undefined;
    }
    if (isConciergeChatReport(report)) {
        return CONST_1.default.REPORT.HELP_TYPE.CHAT_CONCIERGE;
    }
    if (report === null || report === void 0 ? void 0 : report.chatType) {
        return getChatType(report);
    }
    switch (report === null || report === void 0 ? void 0 : report.type) {
        case CONST_1.default.REPORT.TYPE.EXPENSE:
            return CONST_1.default.REPORT.HELP_TYPE.EXPENSE_REPORT;
        case CONST_1.default.REPORT.TYPE.CHAT:
            return CONST_1.default.REPORT.HELP_TYPE.CHAT;
        case CONST_1.default.REPORT.TYPE.IOU:
            return CONST_1.default.REPORT.HELP_TYPE.IOU;
        case CONST_1.default.REPORT.TYPE.INVOICE:
            return CONST_1.default.REPORT.HELP_TYPE.INVOICE;
        case CONST_1.default.REPORT.TYPE.TASK:
            return CONST_1.default.REPORT.HELP_TYPE.TASK;
        default:
            return undefined;
    }
}
/**
 * Checks if a report contains only Non-Reimbursable transactions
 */
function hasOnlyNonReimbursableTransactions(iouReportID) {
    var transactions = getReportTransactions(iouReportID);
    if (!transactions || transactions.length === 0) {
        return false;
    }
    return transactions.every(function (transaction) { return !(0, TransactionUtils_1.getReimbursable)(transaction); });
}
/**
 * Checks if a report has only one transaction associated with it
 */
function isOneTransactionReport(report) {
    var _a;
    var reportActions = (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report === null || report === void 0 ? void 0 : report.reportID)]) !== null && _a !== void 0 ? _a : [];
    var chatReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.chatReportID)];
    return (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(report, chatReport, reportActions) !== null;
}
/*
 * Whether the report contains only one expense and the expense should be paid later
 */
function isPayAtEndExpenseReport(report, transactions) {
    var _a;
    if ((!!transactions && transactions.length !== 1) || !isOneTransactionReport(report)) {
        return false;
    }
    return (0, TransactionUtils_1.isPayAtEndExpense)((_a = transactions === null || transactions === void 0 ? void 0 : transactions[0]) !== null && _a !== void 0 ? _a : getReportTransactions(report === null || report === void 0 ? void 0 : report.reportID).at(0));
}
/**
 * Checks if a report is a transaction thread associated with a report that has only one transaction
 */
function isOneTransactionThread(report, parentReport, threadParentReportAction) {
    var _a;
    if (!report || !parentReport) {
        return false;
    }
    var parentReportActions = (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID)]) !== null && _a !== void 0 ? _a : [];
    var chatReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport === null || parentReport === void 0 ? void 0 : parentReport.chatReportID)];
    var transactionThreadReportID = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(parentReport, chatReport, parentReportActions);
    return (report === null || report === void 0 ? void 0 : report.reportID) === transactionThreadReportID && !(0, ReportActionsUtils_1.isSentMoneyReportAction)(threadParentReportAction);
}
/**
 * Checks if given report is a transaction thread
 */
function isReportTransactionThread(report) {
    return isMoneyRequest(report) || isTrackExpenseReport(report);
}
/**
 * Get displayed report ID, it will be parentReportID if the report is one transaction thread
 */
function getDisplayedReportID(reportID) {
    var report = getReport(reportID, allReports);
    var parentReportID = report === null || report === void 0 ? void 0 : report.parentReportID;
    var parentReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReportID)];
    var parentReportAction = (0, ReportActionsUtils_1.getReportAction)(parentReportID, report === null || report === void 0 ? void 0 : report.parentReportActionID);
    return parentReportID && isOneTransactionThread(report, parentReport, parentReportAction) ? parentReportID : reportID;
}
/**
 * Should return true only for personal 1:1 report
 *
 */
function isOneOnOneChat(report) {
    var _a;
    var participants = (_a = report === null || report === void 0 ? void 0 : report.participants) !== null && _a !== void 0 ? _a : {};
    var participant = currentUserAccountID ? participants[currentUserAccountID] : undefined;
    var isCurrentUserParticipant = participant ? 1 : 0;
    var participantAmount = Object.keys(participants).length - isCurrentUserParticipant;
    if (participantAmount !== 1) {
        return false;
    }
    return (((report === null || report === void 0 ? void 0 : report.policyID) === CONST_1.default.POLICY.ID_FAKE || !(report === null || report === void 0 ? void 0 : report.policyID)) &&
        !isChatRoom(report) &&
        !isExpenseRequest(report) &&
        !isMoneyRequestReport(report) &&
        !isPolicyExpenseChat(report) &&
        !isTaskReport(report) &&
        isDM(report) &&
        !isIOUReport(report));
}
/**
 * Checks if the current user is a payer of the expense
 */
function isPayer(session, iouReport, onlyShowPayElsewhere, reportPolicy) {
    var _a, _b, _c;
    if (onlyShowPayElsewhere === void 0) { onlyShowPayElsewhere = false; }
    var isApproved = isReportApproved({ report: iouReport });
    var policy = (_a = reportPolicy !== null && reportPolicy !== void 0 ? reportPolicy : allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(iouReport === null || iouReport === void 0 ? void 0 : iouReport.policyID)]) !== null && _a !== void 0 ? _a : null;
    var policyType = policy === null || policy === void 0 ? void 0 : policy.type;
    var isAdmin = policyType !== CONST_1.default.POLICY.TYPE.PERSONAL && (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    var isManager = (iouReport === null || iouReport === void 0 ? void 0 : iouReport.managerID) === (session === null || session === void 0 ? void 0 : session.accountID);
    if (isPaidGroupPolicy(iouReport)) {
        if ((policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) === CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES) {
            // If we get here without a reimburser only show the pay button if we are the admin.
            if (!((_b = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _b === void 0 ? void 0 : _b.reimburser)) {
                return isAdmin;
            }
            // If we are the reimburser and the report is approved or we are the manager then we can pay it.
            var isReimburser = (session === null || session === void 0 ? void 0 : session.email) === ((_c = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _c === void 0 ? void 0 : _c.reimburser);
            return isReimburser && (isApproved || isManager);
        }
        if ((policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) === CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL || onlyShowPayElsewhere) {
            return isAdmin && (isApproved || isManager);
        }
        return false;
    }
    return isAdmin || (isMoneyRequestReport(iouReport) && isManager);
}
/**
 * Checks if the current user is the action's author
 */
function isActionCreator(reportAction) {
    return (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID) === currentUserAccountID;
}
/**
 * Returns the notification preference of the action's child report if it exists.
 * Otherwise, calculates it based on the action's authorship.
 */
function getChildReportNotificationPreference(reportAction) {
    var _a;
    var childReportNotificationPreference = (_a = reportAction === null || reportAction === void 0 ? void 0 : reportAction.childReportNotificationPreference) !== null && _a !== void 0 ? _a : '';
    if (childReportNotificationPreference) {
        return childReportNotificationPreference;
    }
    return isActionCreator(reportAction) ? CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS : CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
}
function canAddOrDeleteTransactions(moneyRequestReport, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    if (!isMoneyRequestReport(moneyRequestReport) || isReportArchived) {
        return false;
    }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.policyID);
    if ((0, PolicyUtils_1.isInstantSubmitEnabled)(policy) && (0, PolicyUtils_1.isSubmitAndClose)(policy) && !(0, PolicyUtils_1.arePaymentsEnabled)(policy)) {
        return false;
    }
    if ((0, PolicyUtils_1.isInstantSubmitEnabled)(policy) && isProcessingReport(moneyRequestReport)) {
        return isAwaitingFirstLevelApproval(moneyRequestReport);
    }
    if (isReportApproved({ report: moneyRequestReport }) || isClosedReport(moneyRequestReport) || isSettled(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID)) {
        return false;
    }
    return true;
}
/**
 * Checks whether the supplied report supports adding more transactions to it.
 * Return true if:
 * - report is a non-settled IOU
 * - report is a draft
 */
function canAddTransaction(moneyRequestReport, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    if (!isMoneyRequestReport(moneyRequestReport)) {
        return false;
    }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.policyID);
    if ((0, PolicyUtils_1.isInstantSubmitEnabled)(policy) && (0, PolicyUtils_1.isSubmitAndClose)(policy) && hasOnlyNonReimbursableTransactions(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID)) {
        return false;
    }
    return canAddOrDeleteTransactions(moneyRequestReport, isReportArchived);
}
/**
 * Checks whether the supplied report supports deleting more transactions from it.
 * Return true if:
 * - report is a non-settled IOU
 * - report is a non-approved IOU
 */
function canDeleteTransaction(moneyRequestReport, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    return canAddOrDeleteTransactions(moneyRequestReport, isReportArchived);
}
/**
 * Checks whether the card transaction support deleting based on liability type
 */
function canDeleteCardTransactionByLiabilityType(transaction) {
    var _a;
    var isCardTransaction = (0, TransactionUtils_1.isCardTransaction)(transaction);
    if (!isCardTransaction) {
        return true;
    }
    return ((_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.liabilityType) === CONST_1.default.TRANSACTION.LIABILITY_TYPE.ALLOW;
}
/**
 * Can only delete if the author is this user and the action is an ADD_COMMENT action or an IOU action in an unsettled report, or if the user is a
 * policy admin
 */
function canDeleteReportAction(reportAction, reportID, iouTransaction) {
    var _a, _b;
    var report = getReportOrDraftReport(reportID);
    var isActionOwner = (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID) === currentUserAccountID;
    var policy = (_a = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID)]) !== null && _a !== void 0 ? _a : null;
    if ((0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction)) {
        var isCardTransactionCanBeDeleted = canDeleteCardTransactionByLiabilityType(iouTransaction);
        // For now, users cannot delete split actions
        var isSplitAction = ((_b = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction)) === null || _b === void 0 ? void 0 : _b.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.SPLIT;
        if (isSplitAction) {
            return false;
        }
        if (isActionOwner) {
            if (!(0, EmptyObject_1.isEmptyObject)(report) && (isMoneyRequestReport(report) || isInvoiceReport(report))) {
                return canDeleteTransaction(report) && isCardTransactionCanBeDeleted;
            }
            return true;
        }
    }
    if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) !== CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT ||
        (reportAction === null || reportAction === void 0 ? void 0 : reportAction.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
        (0, ReportActionsUtils_1.isCreatedTaskReportAction)(reportAction) ||
        (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID) === CONST_1.default.ACCOUNT_ID.CONCIERGE) {
        return false;
    }
    var isAdmin = (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN && !(0, EmptyObject_1.isEmptyObject)(report) && !isDM(report);
    return isActionOwner || isAdmin;
}
/**
 * Returns true if Concierge is one of the chat participants (1:1 as well as group chats)
 */
function chatIncludesConcierge(report) {
    var _a;
    var participantAccountIDs = Object.keys((_a = report === null || report === void 0 ? void 0 : report.participants) !== null && _a !== void 0 ? _a : {}).map(Number);
    return participantAccountIDs.includes(CONST_1.default.ACCOUNT_ID.CONCIERGE);
}
/**
 * Returns true if there is any automated expensify account `in accountIDs
 */
function hasAutomatedExpensifyAccountIDs(accountIDs) {
    return accountIDs.some(function (accountID) { return CONST_1.default.EXPENSIFY_ACCOUNT_IDS.includes(accountID); });
}
function getReportRecipientAccountIDs(report, currentLoginAccountID) {
    var _a;
    var finalReport = report;
    // In 1:1 chat threads, the participants will be the same as parent report. If a report is specifically a 1:1 chat thread then we will
    // get parent report and use its participants array.
    if (isThread(report) && !(isTaskReport(report) || isMoneyRequestReport(report))) {
        var parentReport = getReport(report === null || report === void 0 ? void 0 : report.parentReportID, allReports);
        if (isOneOnOneChat(parentReport)) {
            finalReport = parentReport;
        }
    }
    var finalParticipantAccountIDs = [];
    if (isTaskReport(report)) {
        // Task reports `managerID` will change when assignee is changed, in that case the old `managerID` is still present in `participants`
        // along with the new one. We only need the `managerID` as a participant here.
        finalParticipantAccountIDs = (report === null || report === void 0 ? void 0 : report.managerID) ? [report === null || report === void 0 ? void 0 : report.managerID] : [];
    }
    else {
        finalParticipantAccountIDs = Object.keys((_a = finalReport === null || finalReport === void 0 ? void 0 : finalReport.participants) !== null && _a !== void 0 ? _a : {}).map(Number);
    }
    var otherParticipantsWithoutExpensifyAccountIDs = finalParticipantAccountIDs.filter(function (accountID) {
        if (accountID === currentLoginAccountID) {
            return false;
        }
        if (CONST_1.default.EXPENSIFY_ACCOUNT_IDS.includes(accountID)) {
            return false;
        }
        return true;
    });
    return otherParticipantsWithoutExpensifyAccountIDs;
}
/**
 * Whether the time row should be shown for a report.
 */
function canShowReportRecipientLocalTime(personalDetails, report, accountID) {
    var _a, _b;
    var reportRecipientAccountIDs = getReportRecipientAccountIDs(report, accountID);
    var hasMultipleParticipants = reportRecipientAccountIDs.length > 1;
    var reportRecipient = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[reportRecipientAccountIDs[0]];
    var reportRecipientTimezone = (_a = reportRecipient === null || reportRecipient === void 0 ? void 0 : reportRecipient.timezone) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_TIME_ZONE;
    var isReportParticipantValidated = (_b = reportRecipient === null || reportRecipient === void 0 ? void 0 : reportRecipient.validated) !== null && _b !== void 0 ? _b : false;
    return !!(!hasMultipleParticipants &&
        !isChatRoom(report) &&
        !isPolicyExpenseChat(getRootParentReport({ report: report })) &&
        reportRecipient &&
        (reportRecipientTimezone === null || reportRecipientTimezone === void 0 ? void 0 : reportRecipientTimezone.selected) &&
        isReportParticipantValidated);
}
/**
 * Shorten last message text to fixed length and trim spaces.
 */
function formatReportLastMessageText(lastMessageText, isModifiedExpenseMessage) {
    if (isModifiedExpenseMessage === void 0) { isModifiedExpenseMessage = false; }
    if (isModifiedExpenseMessage) {
        return String(lastMessageText).trim().replace(CONST_1.default.REGEX.LINE_BREAK, '').trim();
    }
    return (0, ReportActionsUtils_1.formatLastMessageText)(lastMessageText);
}
/**
 * Helper method to return the default avatar associated with the given login
 */
function getDefaultWorkspaceAvatar(workspaceName) {
    if (!workspaceName) {
        return defaultWorkspaceAvatars.WorkspaceBuilding;
    }
    // Remove all chars not A-Z or 0-9 including underscore
    var alphaNumeric = workspaceName
        .normalize('NFD')
        .replace(/[^0-9a-z]/gi, '')
        .toUpperCase();
    var workspace = "Workspace".concat(alphaNumeric[0]);
    var defaultWorkspaceAvatar = defaultWorkspaceAvatars[workspace];
    return !alphaNumeric ? defaultWorkspaceAvatars.WorkspaceBuilding : defaultWorkspaceAvatar;
}
/**
 * Helper method to return the default avatar testID associated with the given login
 */
function getDefaultWorkspaceAvatarTestID(workspaceName) {
    if (!workspaceName) {
        return defaultAvatarBuildingIconTestID;
    }
    // Remove all chars not A-Z or 0-9 including underscore
    var alphaNumeric = workspaceName
        .normalize('NFD')
        .replace(/[^0-9a-z]/gi, '')
        .toLowerCase();
    return !alphaNumeric ? defaultAvatarBuildingIconTestID : "SvgDefaultAvatar_".concat(alphaNumeric[0], " Icon");
}
/**
 * Helper method to return the default avatar associated with the given reportID
 */
function getDefaultGroupAvatar(reportID) {
    if (!reportID) {
        return defaultGroupAvatars.Avatar1;
    }
    var reportIDHashBucket = ((Number(reportID) % CONST_1.default.DEFAULT_GROUP_AVATAR_COUNT) + 1);
    return defaultGroupAvatars["Avatar".concat(reportIDHashBucket)];
}
/**
 * Returns the appropriate icons for the given chat report using the stored personalDetails.
 * The Avatar sources can be URLs or Icon components according to the chat type.
 */
function getIconsForParticipants(participants, personalDetails) {
    var _a, _b, _c, _d, _e, _f, _g;
    var participantDetails = [];
    var participantsList = participants || [];
    for (var _i = 0, participantsList_1 = participantsList; _i < participantsList_1.length; _i++) {
        var accountID = participantsList_1[_i];
        var avatarSource = (_b = (_a = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) === null || _a === void 0 ? void 0 : _a.avatar) !== null && _b !== void 0 ? _b : Expensicons_1.FallbackAvatar;
        var displayNameLogin = ((_c = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) === null || _c === void 0 ? void 0 : _c.displayName) ? (_d = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) === null || _d === void 0 ? void 0 : _d.displayName : (_e = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) === null || _e === void 0 ? void 0 : _e.login;
        participantDetails.push([accountID, displayNameLogin !== null && displayNameLogin !== void 0 ? displayNameLogin : '', avatarSource, (_g = (_f = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) === null || _f === void 0 ? void 0 : _f.fallbackIcon) !== null && _g !== void 0 ? _g : '']);
    }
    var sortedParticipantDetails = participantDetails.sort(function (first, second) {
        // First sort by displayName/login
        var displayNameLoginOrder = (0, LocaleCompare_1.default)(first[1], second[1]);
        if (displayNameLoginOrder !== 0) {
            return displayNameLoginOrder;
        }
        // Then fallback on accountID as the final sorting criteria.
        // This will ensure that the order of avatars with same login/displayName
        // stay consistent across all users and devices
        return first[0] - second[0];
    });
    // Now that things are sorted, gather only the avatars (second element in the array) and return those
    var avatars = [];
    for (var _h = 0, sortedParticipantDetails_1 = sortedParticipantDetails; _h < sortedParticipantDetails_1.length; _h++) {
        var sortedParticipantDetail = sortedParticipantDetails_1[_h];
        var userIcon = {
            id: sortedParticipantDetail[0],
            source: sortedParticipantDetail[2],
            type: CONST_1.default.ICON_TYPE_AVATAR,
            name: sortedParticipantDetail[1],
            fallbackIcon: sortedParticipantDetail[3],
        };
        avatars.push(userIcon);
    }
    return avatars;
}
/**
 * Cache the workspace icons
 */
var workSpaceIconsCache = new Map();
/**
 * Given a report, return the associated workspace icon.
 */
function getWorkspaceIcon(report, policy) {
    var _a, _b;
    var workspaceName = getPolicyName({ report: report, policy: policy });
    var cacheKey = (_a = report === null || report === void 0 ? void 0 : report.policyID) !== null && _a !== void 0 ? _a : workspaceName;
    var iconFromCache = workSpaceIconsCache.get(cacheKey);
    var reportPolicy = policy !== null && policy !== void 0 ? policy : allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID)];
    var policyAvatarURL = reportPolicy ? reportPolicy === null || reportPolicy === void 0 ? void 0 : reportPolicy.avatarURL : report === null || report === void 0 ? void 0 : report.policyAvatar;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var policyExpenseChatAvatarSource = policyAvatarURL || getDefaultWorkspaceAvatar(workspaceName);
    var isSameAvatarURL = ((_b = iconFromCache === null || iconFromCache === void 0 ? void 0 : iconFromCache.icon) === null || _b === void 0 ? void 0 : _b.source) === policyExpenseChatAvatarSource;
    var hasWorkSpaceNameChanged = (iconFromCache === null || iconFromCache === void 0 ? void 0 : iconFromCache.name) !== workspaceName;
    if (iconFromCache && (isSameAvatarURL || policyAvatarURL === undefined) && !hasWorkSpaceNameChanged) {
        return iconFromCache.icon;
    }
    var workspaceIcon = {
        source: policyExpenseChatAvatarSource !== null && policyExpenseChatAvatarSource !== void 0 ? policyExpenseChatAvatarSource : '',
        type: CONST_1.default.ICON_TYPE_WORKSPACE,
        name: workspaceName,
        id: report === null || report === void 0 ? void 0 : report.policyID,
    };
    workSpaceIconsCache.set(cacheKey, { name: workspaceName, icon: workspaceIcon });
    return workspaceIcon;
}
/**
 * Gets the personal details for a login by looking in the ONYXKEYS.PERSONAL_DETAILS_LIST Onyx key (stored in the local variable, allPersonalDetails). If it doesn't exist in Onyx,
 * then a default object is constructed.
 */
function getPersonalDetailsForAccountID(accountID, personalDetailsData) {
    var _a, _b;
    if (!accountID) {
        return {};
    }
    var defaultDetails = {
        isOptimisticPersonalDetail: true,
    };
    if (!personalDetailsData) {
        return (_a = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID]) !== null && _a !== void 0 ? _a : defaultDetails;
    }
    return (_b = personalDetailsData === null || personalDetailsData === void 0 ? void 0 : personalDetailsData[accountID]) !== null && _b !== void 0 ? _b : defaultDetails;
}
/**
 * Returns the personal details or a default object if the personal details are not available.
 */
function getPersonalDetailsOrDefault(personalDetails) {
    return personalDetails !== null && personalDetails !== void 0 ? personalDetails : { isOptimisticPersonalDetail: true };
}
var phoneNumberCache = {};
/**
 * Get the displayName for a single report participant.
 */
function getDisplayNameForParticipant(_a) {
    var _b, _c;
    var accountID = _a.accountID, _d = _a.shouldUseShortForm, shouldUseShortForm = _d === void 0 ? false : _d, _e = _a.shouldFallbackToHidden, shouldFallbackToHidden = _e === void 0 ? true : _e, _f = _a.shouldAddCurrentUserPostfix, shouldAddCurrentUserPostfix = _f === void 0 ? false : _f, _g = _a.personalDetailsData, personalDetailsData = _g === void 0 ? allPersonalDetails : _g, _h = _a.shouldRemoveDomain, shouldRemoveDomain = _h === void 0 ? false : _h;
    if (!accountID) {
        return '';
    }
    var personalDetails = getPersonalDetailsOrDefault(personalDetailsData === null || personalDetailsData === void 0 ? void 0 : personalDetailsData[accountID]);
    if (!personalDetails) {
        return '';
    }
    var login = (_b = personalDetails.login) !== null && _b !== void 0 ? _b : '';
    // Check if the phone number is already cached
    var formattedLogin = phoneNumberCache[login];
    if (!formattedLogin) {
        formattedLogin = (0, LocalePhoneNumber_1.formatPhoneNumber)(login);
        // Store the formatted phone number in the cache
        phoneNumberCache[login] = formattedLogin;
    }
    // This is to check if account is an invite/optimistically created one
    // and prevent from falling back to 'Hidden', so a correct value is shown
    // when searching for a new user
    if (personalDetails.isOptimisticPersonalDetail === true) {
        return formattedLogin;
    }
    // For selfDM, we display the user's displayName followed by '(you)' as a postfix
    var shouldAddPostfix = shouldAddCurrentUserPostfix && accountID === currentUserAccountID;
    var longName = (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(personalDetails, formattedLogin, shouldFallbackToHidden, shouldAddPostfix);
    if (shouldRemoveDomain && longName === formattedLogin) {
        longName = (_c = longName.split('@').at(0)) !== null && _c !== void 0 ? _c : '';
    }
    // If the user's personal details (first name) should be hidden, make sure we return "hidden" instead of the short name
    if (shouldFallbackToHidden && longName === hiddenTranslation) {
        return (0, LocalePhoneNumber_1.formatPhoneNumber)(longName);
    }
    var shortName = personalDetails.firstName ? personalDetails.firstName : longName;
    return shouldUseShortForm ? shortName : longName;
}
function getParticipantsAccountIDsForDisplay(report, shouldExcludeHidden, shouldExcludeDeleted, shouldForceExcludeCurrentUser, reportMetadataParam) {
    var _a;
    if (shouldExcludeHidden === void 0) { shouldExcludeHidden = false; }
    if (shouldExcludeDeleted === void 0) { shouldExcludeDeleted = false; }
    if (shouldForceExcludeCurrentUser === void 0) { shouldForceExcludeCurrentUser = false; }
    var reportParticipants = (_a = report === null || report === void 0 ? void 0 : report.participants) !== null && _a !== void 0 ? _a : {};
    var reportMetadata = reportMetadataParam !== null && reportMetadataParam !== void 0 ? reportMetadataParam : getReportMetadata(report === null || report === void 0 ? void 0 : report.reportID);
    var participantsEntries = Object.entries(reportParticipants);
    // We should not show participants that have an optimistic entry with the same login in the personal details
    var nonOptimisticLoginMap = {};
    for (var _i = 0, participantsEntries_1 = participantsEntries; _i < participantsEntries_1.length; _i++) {
        var entry = participantsEntries_1[_i];
        var accountID = entry[0];
        var personalDetail = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID];
        if ((personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) && !personalDetail.isOptimisticPersonalDetail) {
            nonOptimisticLoginMap[personalDetail.login] = true;
        }
    }
    participantsEntries = participantsEntries.filter(function (_a) {
        var accountID = _a[0];
        var personalDetail = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID];
        if ((personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) && personalDetail.isOptimisticPersonalDetail) {
            return !nonOptimisticLoginMap[personalDetail.login];
        }
        return true;
    });
    var participantsIds = participantsEntries.map(function (_a) {
        var accountID = _a[0];
        return Number(accountID);
    });
    // For 1:1 chat, we don't want to include the current user as a participant in order to not mark 1:1 chats as having multiple participants
    // For system chat, we want to display Expensify as the only participant
    var shouldExcludeCurrentUser = isOneOnOneChat(report) || isSystemChat(report) || shouldForceExcludeCurrentUser;
    if (shouldExcludeCurrentUser || shouldExcludeHidden || shouldExcludeDeleted) {
        participantsIds = participantsIds.filter(function (accountID) {
            var _a, _b, _c;
            if (shouldExcludeCurrentUser && accountID === currentUserAccountID) {
                return false;
            }
            if (shouldExcludeHidden && isHiddenForCurrentUser((_a = reportParticipants[accountID]) === null || _a === void 0 ? void 0 : _a.notificationPreference)) {
                return false;
            }
            if (shouldExcludeDeleted &&
                ((_c = (_b = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) === null || _b === void 0 ? void 0 : _b.findLast(function (member) { return Number(member.accountID) === accountID; })) === null || _c === void 0 ? void 0 : _c.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return false;
            }
            return true;
        });
    }
    return participantsIds.filter(function (accountID) { return (0, isNumber_1.default)(accountID); });
}
function getParticipantsList(report, personalDetails, isRoomMembersList, reportMetadata) {
    if (isRoomMembersList === void 0) { isRoomMembersList = false; }
    if (reportMetadata === void 0) { reportMetadata = undefined; }
    var isReportGroupChat = isGroupChat(report);
    var shouldExcludeHiddenParticipants = !isReportGroupChat && !isMoneyRequestReport(report) && !isMoneyRequest(report);
    var chatParticipants = getParticipantsAccountIDsForDisplay(report, isRoomMembersList || shouldExcludeHiddenParticipants, false, false, reportMetadata);
    return chatParticipants.filter(function (accountID) {
        var details = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID];
        if (!isRoomMembersList) {
            if (!details) {
                Log_1.default.hmmm("[ReportParticipantsPage] no personal details found for Group chat member with accountID: ".concat(accountID));
                return false;
            }
        }
        else {
            // When adding a new member to a room (whose personal detail does not exist in Onyx), an optimistic personal detail
            // is created. However, when the real personal detail is returned from the backend, a duplicate member may appear
            // briefly before the optimistic personal detail is deleted. To address this, we filter out the optimistically created
            // member here.
            var isDuplicateOptimisticDetail = (details === null || details === void 0 ? void 0 : details.isOptimisticPersonalDetail) && chatParticipants.some(function (accID) { var _a; return accID !== accountID && details.login === ((_a = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accID]) === null || _a === void 0 ? void 0 : _a.login); });
            if (!details || isDuplicateOptimisticDetail) {
                Log_1.default.hmmm("[RoomMembersPage] no personal details found for room member with accountID: ".concat(accountID));
                return false;
            }
        }
        return true;
    });
}
function buildParticipantsFromAccountIDs(accountIDs) {
    var finalParticipants = {};
    return accountIDs.reduce(function (participants, accountID) {
        // eslint-disable-next-line no-param-reassign
        participants[accountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS };
        return participants;
    }, finalParticipants);
}
/**
 * Returns the report name if the report is a group chat
 */
function getGroupChatName(participants, shouldApplyLimit, report, reportMetadataParam) {
    var _a, _b, _c;
    if (shouldApplyLimit === void 0) { shouldApplyLimit = false; }
    // If we have a report always try to get the name from the report.
    if (report === null || report === void 0 ? void 0 : report.reportName) {
        return report.reportName;
    }
    var reportMetadata = reportMetadataParam !== null && reportMetadataParam !== void 0 ? reportMetadataParam : getReportMetadata(report === null || report === void 0 ? void 0 : report.reportID);
    var pendingMemberAccountIDs = new Set((_a = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) === null || _a === void 0 ? void 0 : _a.filter(function (member) { return member.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; }).map(function (member) { return member.accountID; }));
    var participantAccountIDs = (_b = participants === null || participants === void 0 ? void 0 : participants.map(function (participant) { return participant.accountID; })) !== null && _b !== void 0 ? _b : Object.keys((_c = report === null || report === void 0 ? void 0 : report.participants) !== null && _c !== void 0 ? _c : {})
        .map(Number)
        .filter(function (accountID) { return !pendingMemberAccountIDs.has(accountID.toString()); });
    var shouldAddEllipsis = participantAccountIDs.length > CONST_1.default.DISPLAY_PARTICIPANTS_LIMIT && shouldApplyLimit;
    if (shouldApplyLimit) {
        participantAccountIDs = participantAccountIDs.slice(0, CONST_1.default.DISPLAY_PARTICIPANTS_LIMIT);
    }
    var isMultipleParticipantReport = participantAccountIDs.length > 1;
    if (isMultipleParticipantReport) {
        return participantAccountIDs
            .map(function (participantAccountID, index) { var _a, _b; return getDisplayNameForParticipant({ accountID: participantAccountID, shouldUseShortForm: isMultipleParticipantReport }) || (0, LocalePhoneNumber_1.formatPhoneNumber)((_b = (_a = participants === null || participants === void 0 ? void 0 : participants[index]) === null || _a === void 0 ? void 0 : _a.login) !== null && _b !== void 0 ? _b : ''); })
            .sort(function (first, second) { return (0, LocaleCompare_1.default)(first !== null && first !== void 0 ? first : '', second !== null && second !== void 0 ? second : ''); })
            .filter(Boolean)
            .join(', ')
            .slice(0, CONST_1.default.REPORT_NAME_LIMIT)
            .concat(shouldAddEllipsis ? '...' : '');
    }
    return (0, Localize_1.translateLocal)('groupChat.defaultReportName', { displayName: getDisplayNameForParticipant({ accountID: participantAccountIDs.at(0) }) });
}
function getParticipants(reportID) {
    var report = getReportOrDraftReport(reportID);
    if (!report) {
        return {};
    }
    return report.participants;
}
function getParticipantIcon(accountID, personalDetails, shouldUseShortForm) {
    var _a;
    if (shouldUseShortForm === void 0) { shouldUseShortForm = false; }
    if (!accountID) {
        return {
            id: CONST_1.default.DEFAULT_NUMBER_ID,
            source: Expensicons_1.FallbackAvatar,
            type: CONST_1.default.ICON_TYPE_AVATAR,
            name: '',
        };
    }
    var details = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID];
    var displayName = (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(details, '', shouldUseShortForm);
    return {
        id: accountID,
        source: (_a = details === null || details === void 0 ? void 0 : details.avatar) !== null && _a !== void 0 ? _a : Expensicons_1.FallbackAvatar,
        type: CONST_1.default.ICON_TYPE_AVATAR,
        name: displayName,
        fallbackIcon: details === null || details === void 0 ? void 0 : details.fallbackIcon,
    };
}
/**
 * Helper function to get the icons for the invoice receiver. Only to be used in getIcons().
 */
function getInvoiceReceiverIcons(report, personalDetails, invoiceReceiverPolicy) {
    var _a, _b, _c;
    if (((_a = report === null || report === void 0 ? void 0 : report.invoiceReceiver) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
        return getIconsForParticipants([report === null || report === void 0 ? void 0 : report.invoiceReceiver.accountID], personalDetails);
    }
    var receiverPolicyID = (_b = report === null || report === void 0 ? void 0 : report.invoiceReceiver) === null || _b === void 0 ? void 0 : _b.policyID;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var receiverPolicy = invoiceReceiverPolicy !== null && invoiceReceiverPolicy !== void 0 ? invoiceReceiverPolicy : getPolicy(receiverPolicyID);
    if (!(0, EmptyObject_1.isEmptyObject)(receiverPolicy)) {
        return [
            {
                source: (_c = receiverPolicy === null || receiverPolicy === void 0 ? void 0 : receiverPolicy.avatarURL) !== null && _c !== void 0 ? _c : getDefaultWorkspaceAvatar(receiverPolicy.name),
                type: CONST_1.default.ICON_TYPE_WORKSPACE,
                name: receiverPolicy.name,
                id: receiverPolicyID,
            },
        ];
    }
    return [];
}
/**
 * Helper function to get the icons for an expense request. Only to be used in getIcons().
 */
function getIconsForExpenseRequest(report, personalDetails, policy) {
    var _a, _b, _c;
    if (!report || !(report === null || report === void 0 ? void 0 : report.parentReportID) || !(report === null || report === void 0 ? void 0 : report.parentReportActionID)) {
        return [];
    }
    var parentReportAction = (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.parentReportID)]) === null || _a === void 0 ? void 0 : _a[report.parentReportActionID];
    var workspaceIcon = getWorkspaceIcon(report, policy);
    var actorDetails = (parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actorAccountID) ? personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[parentReportAction.actorAccountID] : undefined;
    var memberIcon = {
        source: (_b = actorDetails === null || actorDetails === void 0 ? void 0 : actorDetails.avatar) !== null && _b !== void 0 ? _b : Expensicons_1.FallbackAvatar,
        id: parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actorAccountID,
        type: CONST_1.default.ICON_TYPE_AVATAR,
        name: (_c = actorDetails === null || actorDetails === void 0 ? void 0 : actorDetails.displayName) !== null && _c !== void 0 ? _c : '',
        fallbackIcon: actorDetails === null || actorDetails === void 0 ? void 0 : actorDetails.fallbackIcon,
    };
    return [memberIcon, workspaceIcon];
}
/**
 * Helper function to get the icons for a chat thread. Only to be used in getIcons().
 */
function getIconsForChatThread(report, personalDetails, policy) {
    var _a, _b;
    if (!report || !(report === null || report === void 0 ? void 0 : report.parentReportID) || !(report === null || report === void 0 ? void 0 : report.parentReportActionID)) {
        return [];
    }
    var parentReportAction = (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.parentReportID)]) === null || _a === void 0 ? void 0 : _a[report.parentReportActionID];
    var actorAccountID = getReportActionActorAccountID(parentReportAction, report, report);
    var actorDetails = actorAccountID ? personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[actorAccountID] : undefined;
    var actorDisplayName = (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(actorDetails, '', false);
    var actorIcon = {
        id: actorAccountID,
        source: (_b = actorDetails === null || actorDetails === void 0 ? void 0 : actorDetails.avatar) !== null && _b !== void 0 ? _b : Expensicons_1.FallbackAvatar,
        name: (0, LocalePhoneNumber_1.formatPhoneNumber)(actorDisplayName),
        type: CONST_1.default.ICON_TYPE_AVATAR,
        fallbackIcon: actorDetails === null || actorDetails === void 0 ? void 0 : actorDetails.fallbackIcon,
    };
    if (isWorkspaceThread(report)) {
        var workspaceIcon = getWorkspaceIcon(report, policy);
        return [actorIcon, workspaceIcon];
    }
    return [actorIcon];
}
/**
 * Helper function to get the icons for a task report. Only to be used in getIcons().
 */
function getIconsForTaskReport(report, personalDetails, policy) {
    var ownerIcon = getParticipantIcon(report === null || report === void 0 ? void 0 : report.ownerAccountID, personalDetails, true);
    if (report && isWorkspaceTaskReport(report)) {
        var workspaceIcon = getWorkspaceIcon(report, policy);
        return [ownerIcon, workspaceIcon];
    }
    return [ownerIcon];
}
/**
 * Helper function to get the icons for a domain room. Only to be used in getIcons().
 */
function getIconsForDomainRoom(report) {
    var _a;
    var domainName = (_a = report === null || report === void 0 ? void 0 : report.reportName) === null || _a === void 0 ? void 0 : _a.substring(1);
    var policyExpenseChatAvatarSource = getDefaultWorkspaceAvatar(domainName);
    var domainIcon = {
        source: policyExpenseChatAvatarSource,
        type: CONST_1.default.ICON_TYPE_WORKSPACE,
        name: domainName !== null && domainName !== void 0 ? domainName : '',
        id: report === null || report === void 0 ? void 0 : report.policyID,
    };
    return [domainIcon];
}
/**
 * Helper function to get the icons for a policy room. Only to be used in getIcons().
 */
function getIconsForPolicyRoom(report, personalDetails, policy, invoiceReceiverPolicy) {
    if (!report) {
        return [];
    }
    var icons = [getWorkspaceIcon(report, policy)];
    if (report && isInvoiceRoom(report)) {
        icons.push.apply(icons, getInvoiceReceiverIcons(report, personalDetails, invoiceReceiverPolicy));
    }
    return icons;
}
/**
 * Helper function to get the icons for a policy expense chat. Only to be used in getIcons().
 */
function getIconsForPolicyExpenseChat(report, personalDetails, policy) {
    if (!report) {
        return [];
    }
    var workspaceIcon = getWorkspaceIcon(report, policy);
    var memberIcon = getParticipantIcon(report === null || report === void 0 ? void 0 : report.ownerAccountID, personalDetails, true);
    return [workspaceIcon, memberIcon];
}
/**
 * Helper function to get the icons for an expense report. Only to be used in getIcons().
 */
function getIconsForExpenseReport(report, personalDetails, policy) {
    if (!report) {
        return [];
    }
    var workspaceIcon = getWorkspaceIcon(report, policy);
    var memberIcon = getParticipantIcon(report === null || report === void 0 ? void 0 : report.ownerAccountID, personalDetails, true);
    return [memberIcon, workspaceIcon];
}
/**
 * Helper function to get the icons for an iou report. Only to be used in getIcons().
 */
function getIconsForIOUReport(report, personalDetails) {
    var _a, _b, _c, _d;
    if (!report) {
        return [];
    }
    var managerDetails = (report === null || report === void 0 ? void 0 : report.managerID) ? personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[report.managerID] : undefined;
    var ownerDetails = (report === null || report === void 0 ? void 0 : report.ownerAccountID) ? personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[report.ownerAccountID] : undefined;
    var managerIcon = {
        source: (_a = managerDetails === null || managerDetails === void 0 ? void 0 : managerDetails.avatar) !== null && _a !== void 0 ? _a : Expensicons_1.FallbackAvatar,
        id: report === null || report === void 0 ? void 0 : report.managerID,
        type: CONST_1.default.ICON_TYPE_AVATAR,
        name: (_b = managerDetails === null || managerDetails === void 0 ? void 0 : managerDetails.displayName) !== null && _b !== void 0 ? _b : '',
        fallbackIcon: managerDetails === null || managerDetails === void 0 ? void 0 : managerDetails.fallbackIcon,
    };
    var ownerIcon = {
        id: report === null || report === void 0 ? void 0 : report.ownerAccountID,
        source: (_c = ownerDetails === null || ownerDetails === void 0 ? void 0 : ownerDetails.avatar) !== null && _c !== void 0 ? _c : Expensicons_1.FallbackAvatar,
        type: CONST_1.default.ICON_TYPE_AVATAR,
        name: (_d = ownerDetails === null || ownerDetails === void 0 ? void 0 : ownerDetails.displayName) !== null && _d !== void 0 ? _d : '',
        fallbackIcon: ownerDetails === null || ownerDetails === void 0 ? void 0 : ownerDetails.fallbackIcon,
    };
    var isManager = currentUserAccountID === (report === null || report === void 0 ? void 0 : report.managerID);
    // For one transaction IOUs, display a simplified report icon
    if (isOneTransactionReport(report)) {
        return [ownerIcon];
    }
    return isManager ? [managerIcon, ownerIcon] : [ownerIcon, managerIcon];
}
/**
 * Helper function to get the icons for a group chat. Only to be used in getIcons().
 */
function getIconsForGroupChat(report) {
    if (!report) {
        return [];
    }
    var groupChatIcon = {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        source: report.avatarUrl || getDefaultGroupAvatar(report.reportID),
        id: -1,
        type: CONST_1.default.ICON_TYPE_AVATAR,
        name: getGroupChatName(undefined, true, report),
    };
    return [groupChatIcon];
}
/**
 * Helper function to get the icons for an invoice report. Only to be used in getIcons().
 */
function getIconsForInvoiceReport(report, personalDetails, policy, invoiceReceiverPolicy) {
    var _a, _b, _c;
    if (!report) {
        return [];
    }
    var invoiceRoomReport = getReportOrDraftReport(report.chatReportID);
    var icons = [getWorkspaceIcon(invoiceRoomReport, policy)];
    if (((_a = invoiceRoomReport === null || invoiceRoomReport === void 0 ? void 0 : invoiceRoomReport.invoiceReceiver) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
        icons.push.apply(icons, getIconsForParticipants([invoiceRoomReport === null || invoiceRoomReport === void 0 ? void 0 : invoiceRoomReport.invoiceReceiver.accountID], personalDetails));
        return icons;
    }
    var receiverPolicyID = (_b = invoiceRoomReport === null || invoiceRoomReport === void 0 ? void 0 : invoiceRoomReport.invoiceReceiver) === null || _b === void 0 ? void 0 : _b.policyID;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var receiverPolicy = invoiceReceiverPolicy !== null && invoiceReceiverPolicy !== void 0 ? invoiceReceiverPolicy : getPolicy(receiverPolicyID);
    if (!(0, EmptyObject_1.isEmptyObject)(receiverPolicy)) {
        icons.push({
            source: (_c = receiverPolicy === null || receiverPolicy === void 0 ? void 0 : receiverPolicy.avatarURL) !== null && _c !== void 0 ? _c : getDefaultWorkspaceAvatar(receiverPolicy.name),
            type: CONST_1.default.ICON_TYPE_WORKSPACE,
            name: receiverPolicy.name,
            id: receiverPolicyID,
        });
    }
    return icons;
}
/**
 * Returns the appropriate icons for the given chat report using the stored personalDetails.
 * The Avatar sources can be URLs or Icon components according to the chat type.
 */
function getIcons(report, personalDetails, defaultIcon, defaultName, defaultAccountID, policy, invoiceReceiverPolicy) {
    var _a, _b, _c;
    if (personalDetails === void 0) { personalDetails = allPersonalDetails; }
    if (defaultIcon === void 0) { defaultIcon = null; }
    if (defaultName === void 0) { defaultName = ''; }
    if (defaultAccountID === void 0) { defaultAccountID = -1; }
    if ((0, EmptyObject_1.isEmptyObject)(report)) {
        return [
            {
                source: defaultIcon !== null && defaultIcon !== void 0 ? defaultIcon : Expensicons_1.FallbackAvatar,
                type: CONST_1.default.ICON_TYPE_AVATAR,
                name: defaultName,
                id: defaultAccountID,
            },
        ];
    }
    if (isExpenseRequest(report)) {
        return getIconsForExpenseRequest(report, personalDetails, policy);
    }
    if (isChatThread(report)) {
        return getIconsForChatThread(report, personalDetails, policy);
    }
    if (isTaskReport(report)) {
        return getIconsForTaskReport(report, personalDetails, policy);
    }
    if (isDomainRoom(report)) {
        return getIconsForDomainRoom(report);
    }
    var reportNameValuePairs = allReportNameValuePair === null || allReportNameValuePair === void 0 ? void 0 : allReportNameValuePair["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.reportID)];
    // This will get removed as part of https://github.com/Expensify/App/issues/59961
    // eslint-disable-next-line deprecation/deprecation
    if (isAdminRoom(report) ||
        isAnnounceRoom(report) ||
        isChatRoom(report) ||
        (isArchivedNonExpenseReport(report, !!(reportNameValuePairs === null || reportNameValuePairs === void 0 ? void 0 : reportNameValuePairs.private_isArchived)) && !chatIncludesConcierge(report))) {
        return getIconsForPolicyRoom(report, personalDetails, policy, invoiceReceiverPolicy);
    }
    if (isPolicyExpenseChat(report)) {
        return getIconsForPolicyExpenseChat(report, personalDetails, policy);
    }
    if (isExpenseReport(report)) {
        return getIconsForExpenseReport(report, personalDetails, policy);
    }
    if (isIOUReport(report)) {
        return getIconsForIOUReport(report, personalDetails);
    }
    if (isSelfDM(report)) {
        return getIconsForParticipants(currentUserAccountID ? [currentUserAccountID] : [], personalDetails);
    }
    if (isSystemChat(report)) {
        return getIconsForParticipants([(_a = CONST_1.default.ACCOUNT_ID.NOTIFICATIONS) !== null && _a !== void 0 ? _a : 0], personalDetails);
    }
    if (isGroupChat(report)) {
        return getIconsForGroupChat(report);
    }
    if (isInvoiceReport(report)) {
        return getIconsForInvoiceReport(report, personalDetails, policy, invoiceReceiverPolicy);
    }
    if (isOneOnOneChat(report)) {
        var otherParticipantsAccountIDs = Object.keys((_b = report.participants) !== null && _b !== void 0 ? _b : {})
            .map(Number)
            .filter(function (accountID) { return accountID !== currentUserAccountID; });
        return getIconsForParticipants(otherParticipantsAccountIDs, personalDetails);
    }
    var participantAccountIDs = Object.keys((_c = report.participants) !== null && _c !== void 0 ? _c : {}).map(Number);
    return getIconsForParticipants(participantAccountIDs, personalDetails);
}
function getDisplayNamesWithTooltips(personalDetailsList, shouldUseShortForm, shouldFallbackToHidden, shouldAddCurrentUserPostfix) {
    if (shouldFallbackToHidden === void 0) { shouldFallbackToHidden = true; }
    if (shouldAddCurrentUserPostfix === void 0) { shouldAddCurrentUserPostfix = false; }
    var personalDetailsListArray = Array.isArray(personalDetailsList) ? personalDetailsList : Object.values(personalDetailsList);
    return personalDetailsListArray
        .map(function (user) {
        var _a, _b;
        var accountID = Number(user === null || user === void 0 ? void 0 : user.accountID);
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        var displayName = getDisplayNameForParticipant({ accountID: accountID, shouldUseShortForm: shouldUseShortForm, shouldFallbackToHidden: shouldFallbackToHidden, shouldAddCurrentUserPostfix: shouldAddCurrentUserPostfix }) || (user === null || user === void 0 ? void 0 : user.login) || '';
        var avatar = user && 'avatar' in user ? user.avatar : undefined;
        var pronouns = (_a = user === null || user === void 0 ? void 0 : user.pronouns) !== null && _a !== void 0 ? _a : undefined;
        if (pronouns === null || pronouns === void 0 ? void 0 : pronouns.startsWith(CONST_1.default.PRONOUNS.PREFIX)) {
            var pronounTranslationKey = pronouns.replace(CONST_1.default.PRONOUNS.PREFIX, '');
            pronouns = (0, Localize_1.translateLocal)("pronouns.".concat(pronounTranslationKey));
        }
        return {
            displayName: displayName,
            avatar: avatar,
            login: (_b = user === null || user === void 0 ? void 0 : user.login) !== null && _b !== void 0 ? _b : '',
            accountID: accountID,
            pronouns: pronouns,
        };
    })
        .sort(function (first, second) {
        // First sort by displayName/login
        var displayNameLoginOrder = (0, LocaleCompare_1.default)(first.displayName, second.displayName);
        if (displayNameLoginOrder !== 0) {
            return displayNameLoginOrder;
        }
        // Then fallback on accountID as the final sorting criteria.
        return first.accountID - second.accountID;
    });
}
/**
 * Returns the the display names of the given user accountIDs
 */
function getUserDetailTooltipText(accountID, fallbackUserDisplayName) {
    if (fallbackUserDisplayName === void 0) { fallbackUserDisplayName = ''; }
    var displayNameForParticipant = getDisplayNameForParticipant({ accountID: accountID });
    return displayNameForParticipant || fallbackUserDisplayName;
}
/**
 * For a deleted parent report action within a chat report,
 * let us return the appropriate display message
 *
 * @param reportAction - The deleted report action of a chat report for which we need to return message.
 */
function getDeletedParentActionMessageForChatReport(reportAction) {
    // By default, let us display [Deleted message]
    var deletedMessageText = (0, Localize_1.translateLocal)('parentReportAction.deletedMessage');
    if ((0, ReportActionsUtils_1.isCreatedTaskReportAction)(reportAction)) {
        // For canceled task report, let us display [Deleted task]
        deletedMessageText = (0, Localize_1.translateLocal)('parentReportAction.deletedTask');
    }
    return deletedMessageText;
}
/**
 * Returns the preview message for `REIMBURSEMENT_QUEUED` action
 */
function getReimbursementQueuedActionMessage(_a) {
    var _b;
    var reportAction = _a.reportAction, reportOrID = _a.reportOrID, _c = _a.shouldUseShortDisplayName, shouldUseShortDisplayName = _c === void 0 ? true : _c, reports = _a.reports, personalDetails = _a.personalDetails;
    var report = typeof reportOrID === 'string' ? getReport(reportOrID, reports !== null && reports !== void 0 ? reports : allReports) : reportOrID;
    var submitterDisplayName = (_b = getDisplayNameForParticipant({ accountID: report === null || report === void 0 ? void 0 : report.ownerAccountID, shouldUseShortForm: shouldUseShortDisplayName, personalDetailsData: personalDetails })) !== null && _b !== void 0 ? _b : '';
    var originalMessage = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction);
    var messageKey;
    if ((originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.paymentType) === CONST_1.default.IOU.PAYMENT_TYPE.EXPENSIFY) {
        messageKey = 'iou.waitingOnEnabledWallet';
    }
    else {
        messageKey = 'iou.waitingOnBankAccount';
    }
    return (0, Localize_1.translateLocal)(messageKey, { submitterDisplayName: submitterDisplayName });
}
/**
 * Returns the preview message for `REIMBURSEMENT_DEQUEUED` or `REIMBURSEMENT_ACH_CANCELED` action
 */
function getReimbursementDeQueuedOrCanceledActionMessage(reportAction, reportOrID, isLHNPreview) {
    var _a;
    if (isLHNPreview === void 0) { isLHNPreview = false; }
    var report = typeof reportOrID === 'string' ? getReport(reportOrID, allReports) : reportOrID;
    var originalMessage = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction);
    var amount = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.amount;
    var currency = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.currency;
    var formattedAmount = (0, CurrencyUtils_1.convertToDisplayString)(amount, currency);
    if ((originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.cancellationReason) === CONST_1.default.REPORT.CANCEL_PAYMENT_REASONS.ADMIN || (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.cancellationReason) === CONST_1.default.REPORT.CANCEL_PAYMENT_REASONS.USER) {
        var payerOrApproverName = (report === null || report === void 0 ? void 0 : report.managerID) === currentUserAccountID || !isLHNPreview ? '' : getDisplayNameForParticipant({ accountID: report === null || report === void 0 ? void 0 : report.managerID, shouldUseShortForm: true });
        return (0, Localize_1.translateLocal)('iou.adminCanceledRequest', { manager: payerOrApproverName, amount: formattedAmount });
    }
    var submitterDisplayName = (_a = getDisplayNameForParticipant({ accountID: report === null || report === void 0 ? void 0 : report.ownerAccountID, shouldUseShortForm: true })) !== null && _a !== void 0 ? _a : '';
    return (0, Localize_1.translateLocal)('iou.canceledRequest', { submitterDisplayName: submitterDisplayName, amount: formattedAmount });
}
/**
 * Builds an optimistic REIMBURSEMENT_DEQUEUED report action with a randomly generated reportActionID.
 *
 */
function buildOptimisticChangeFieldAction(reportField, previousReportField) {
    return {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CHANGE_FIELD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: 'TEXT',
                style: 'strong',
                text: 'You',
            },
            {
                type: 'TEXT',
                style: 'normal',
                text: " modified field '".concat(reportField.name, "'."),
            },
            {
                type: 'TEXT',
                style: 'normal',
                text: " New value is '".concat(reportField.value, "'"),
            },
            {
                type: 'TEXT',
                style: 'normal',
                text: " (previously '".concat(previousReportField.value, "')."),
            },
        ],
        originalMessage: {
            fieldName: reportField.name,
            newType: reportField.type,
            newValue: reportField.value,
            oldType: previousReportField.type,
            oldValue: previousReportField.value,
        },
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: (0, NumberUtils_1.rand64)(),
        created: DateUtils_1.default.getDBTime(),
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}
/**
 * Builds an optimistic REIMBURSEMENT_DEQUEUED report action with a randomly generated reportActionID.
 *
 */
function buildOptimisticCancelPaymentReportAction(expenseReportID, amount, currency) {
    return {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED,
        actorAccountID: currentUserAccountID,
        message: [
            {
                cancellationReason: CONST_1.default.REPORT.CANCEL_PAYMENT_REASONS.ADMIN,
                expenseReportID: expenseReportID,
                type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
                text: '',
                amount: amount,
                currency: currency,
            },
        ],
        originalMessage: {
            cancellationReason: CONST_1.default.REPORT.CANCEL_PAYMENT_REASONS.ADMIN,
            expenseReportID: expenseReportID,
            amount: amount,
            currency: currency,
        },
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: (0, NumberUtils_1.rand64)(),
        shouldShow: true,
        created: DateUtils_1.default.getDBTime(),
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}
/**
 * Returns the last visible message for a given report after considering the given optimistic actions
 *
 * @param reportID - the report for which last visible message has to be fetched
 * @param [actionsToMerge] - the optimistic merge actions that needs to be considered while fetching last visible message

 */
function getLastVisibleMessage(reportID, actionsToMerge) {
    if (actionsToMerge === void 0) { actionsToMerge = {}; }
    var report = getReportOrDraftReport(reportID);
    var lastVisibleAction = (0, ReportActionsUtils_1.getLastVisibleAction)(reportID, canUserPerformWriteAction(report), actionsToMerge);
    // For Chat Report with deleted parent actions, let us fetch the correct message
    if ((0, ReportActionsUtils_1.isDeletedParentAction)(lastVisibleAction) && !(0, EmptyObject_1.isEmptyObject)(report) && isChatReport(report)) {
        var lastMessageText = getDeletedParentActionMessageForChatReport(lastVisibleAction);
        return {
            lastMessageText: lastMessageText,
        };
    }
    // Fetch the last visible message for report represented by reportID and based on actions to merge.
    return (0, ReportActionsUtils_1.getLastVisibleMessage)(reportID, canUserPerformWriteAction(report), actionsToMerge);
}
/**
 * Checks if a report is waiting for the manager to complete an action.
 * Example: the assignee of an open task report or the manager of a processing expense report.
 *
 * @param [parentReportAction] - The parent report action of the report (Used to check if the task has been canceled)
 */
function isWaitingForAssigneeToCompleteAction(report, parentReportAction) {
    if (report === null || report === void 0 ? void 0 : report.hasOutstandingChildTask) {
        return true;
    }
    if ((report === null || report === void 0 ? void 0 : report.hasParentAccess) === false && isReportManager(report)) {
        if (isOpenTaskReport(report, parentReportAction)) {
            return true;
        }
        if (isProcessingReport(report) && isExpenseReport(report)) {
            return true;
        }
    }
    return false;
}
function isUnreadWithMention(reportOrOption) {
    var _a, _b;
    if (!reportOrOption) {
        return false;
    }
    // lastMentionedTime and lastReadTime are both datetime strings and can be compared directly
    var lastMentionedTime = (_a = reportOrOption.lastMentionedTime) !== null && _a !== void 0 ? _a : '';
    var lastReadTime = (_b = reportOrOption.lastReadTime) !== null && _b !== void 0 ? _b : '';
    return !!('isUnreadWithMention' in reportOrOption && reportOrOption.isUnreadWithMention) || lastReadTime < lastMentionedTime;
}
function getReasonAndReportActionThatRequiresAttention(optionOrReport, parentReportAction, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    if (!optionOrReport) {
        return null;
    }
    var reportActions = (0, ReportActionsUtils_1.getAllReportActions)(optionOrReport.reportID);
    if (isJoinRequestInAdminRoom(optionOrReport)) {
        return {
            reason: CONST_1.default.REQUIRES_ATTENTION_REASONS.HAS_JOIN_REQUEST,
            reportAction: (0, ReportActionsUtils_1.getActionableJoinRequestPendingReportAction)(optionOrReport.reportID),
        };
    }
    if (isReportArchived) {
        return null;
    }
    if (isUnreadWithMention(optionOrReport)) {
        return {
            reason: CONST_1.default.REQUIRES_ATTENTION_REASONS.IS_UNREAD_WITH_MENTION,
        };
    }
    if (isWaitingForAssigneeToCompleteAction(optionOrReport, parentReportAction)) {
        return {
            reason: CONST_1.default.REQUIRES_ATTENTION_REASONS.IS_WAITING_FOR_ASSIGNEE_TO_COMPLETE_ACTION,
            reportAction: Object.values(reportActions).find(function (action) { return action.childType === CONST_1.default.REPORT.TYPE.TASK; }),
        };
    }
    var iouReportActionToApproveOrPay = (0, IOU_1.getIOUReportActionToApproveOrPay)(optionOrReport, optionOrReport.reportID);
    var iouReportID = (0, ReportActionsUtils_1.getIOUReportIDFromReportActionPreview)(iouReportActionToApproveOrPay);
    var transactions = getReportTransactions(iouReportID);
    var hasOnlyPendingTransactions = transactions.length > 0 && transactions.every(function (t) { return (0, TransactionUtils_1.isExpensifyCardTransaction)(t) && (0, TransactionUtils_1.isPending)(t); });
    // Has a child report that is awaiting action (e.g. approve, pay, add bank account) from current user
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(optionOrReport.policyID);
    if ((optionOrReport.hasOutstandingChildRequest === true || (iouReportActionToApproveOrPay === null || iouReportActionToApproveOrPay === void 0 ? void 0 : iouReportActionToApproveOrPay.reportActionID)) &&
        ((policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) !== CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO || !hasOnlyPendingTransactions)) {
        return {
            reason: CONST_1.default.REQUIRES_ATTENTION_REASONS.HAS_CHILD_REPORT_AWAITING_ACTION,
            reportAction: iouReportActionToApproveOrPay,
        };
    }
    if (hasMissingInvoiceBankAccount(optionOrReport.reportID) && !isSettled(optionOrReport.reportID)) {
        return {
            reason: CONST_1.default.REQUIRES_ATTENTION_REASONS.HAS_MISSING_INVOICE_BANK_ACCOUNT,
        };
    }
    if (isInvoiceRoom(optionOrReport)) {
        var reportAction = Object.values(reportActions).find(function (action) {
            return action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW &&
                action.childReportID &&
                hasMissingInvoiceBankAccount(action.childReportID) &&
                !isSettled(action.childReportID);
        });
        return reportAction
            ? {
                reason: CONST_1.default.REQUIRES_ATTENTION_REASONS.HAS_MISSING_INVOICE_BANK_ACCOUNT,
                reportAction: reportAction,
            }
            : null;
    }
    return null;
}
/**
 * Determines if the option requires action from the current user. This can happen when it:
 *  - is unread and the user was mentioned in one of the unread comments
 *  - is for an outstanding task waiting on the user
 *  - has an outstanding child expense that is waiting for an action from the current user (e.g. pay, approve, add bank account)
 *  - is either the system or concierge chat, the user free trial has ended and it didn't add a payment card yet
 *
 * @param option (report or optionItem)
 * @param parentReportAction (the report action the current report is a thread of)
 */
function requiresAttentionFromCurrentUser(optionOrReport, parentReportAction, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    return !!getReasonAndReportActionThatRequiresAttention(optionOrReport, parentReportAction, isReportArchived);
}
/**
 * Checks if the report contains at least one Non-Reimbursable transaction
 */
function hasNonReimbursableTransactions(iouReportID, reportsTransactionsParam) {
    if (reportsTransactionsParam === void 0) { reportsTransactionsParam = reportsTransactions; }
    var transactions = getReportTransactions(iouReportID, reportsTransactionsParam);
    return transactions.filter(function (transaction) { return transaction.reimbursable === false; }).length > 0;
}
function getMoneyRequestSpendBreakdown(report, searchReports) {
    var _a, _b;
    var reports = searchReports !== null && searchReports !== void 0 ? searchReports : allReports;
    var moneyRequestReport;
    if (report && (isMoneyRequestReport(report, searchReports) || isInvoiceReport(report))) {
        moneyRequestReport = report;
    }
    if (reports && (report === null || report === void 0 ? void 0 : report.iouReportID)) {
        moneyRequestReport = getReport(report.iouReportID, allReports);
    }
    if (moneyRequestReport) {
        var nonReimbursableSpend = (_a = moneyRequestReport.nonReimbursableTotal) !== null && _a !== void 0 ? _a : 0;
        var totalSpend = (_b = moneyRequestReport.total) !== null && _b !== void 0 ? _b : 0;
        if (nonReimbursableSpend + totalSpend !== 0) {
            // There is a possibility that if the Expense report has a negative total.
            // This is because there are instances where you can get a credit back on your card,
            // or you enter a negative expense to "offset" future expenses
            nonReimbursableSpend = isExpenseReport(moneyRequestReport) ? nonReimbursableSpend * -1 : nonReimbursableSpend;
            totalSpend = isExpenseReport(moneyRequestReport) ? totalSpend * -1 : totalSpend;
            var totalDisplaySpend = totalSpend;
            var reimbursableSpend = totalDisplaySpend - nonReimbursableSpend;
            return {
                nonReimbursableSpend: nonReimbursableSpend,
                reimbursableSpend: reimbursableSpend,
                totalDisplaySpend: totalDisplaySpend,
            };
        }
    }
    return {
        nonReimbursableSpend: 0,
        reimbursableSpend: 0,
        totalDisplaySpend: 0,
    };
}
/**
 * Get the title for a policy expense chat which depends on the role of the policy member seeing this report
 */
function getPolicyExpenseChatName(_a) {
    var _b, _c;
    var report = _a.report, policy = _a.policy, _d = _a.personalDetailsList, personalDetailsList = _d === void 0 ? allPersonalDetails : _d, policies = _a.policies, reports = _a.reports;
    var ownerAccountID = report === null || report === void 0 ? void 0 : report.ownerAccountID;
    var personalDetails = ownerAccountID ? personalDetailsList === null || personalDetailsList === void 0 ? void 0 : personalDetailsList[ownerAccountID] : undefined;
    var login = personalDetails ? personalDetails.login : null;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var reportOwnerDisplayName = getDisplayNameForParticipant({ accountID: ownerAccountID, shouldRemoveDomain: true }) || login;
    if (reportOwnerDisplayName) {
        return (0, Localize_1.translateLocal)('workspace.common.policyExpenseChatName', { displayName: reportOwnerDisplayName });
    }
    var policyExpenseChatRole = 'user';
    var policyItem = policies ? policies.find(function (p) { return p.id === (report === null || report === void 0 ? void 0 : report.policyID); }) : allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID)];
    if (policyItem) {
        policyExpenseChatRole = policyItem.role || 'user';
    }
    // If this user is not admin and this policy expense chat has been archived because of account merging, this must be an old expense chat
    // of the account which was merged into the current user's account. Use the name of the policy as the name of the report.
    // This will get removed as part of https://github.com/Expensify/App/issues/59961
    // eslint-disable-next-line deprecation/deprecation
    if (isArchivedNonExpenseReport(report, !!((_b = getReportNameValuePairs(report === null || report === void 0 ? void 0 : report.reportID)) === null || _b === void 0 ? void 0 : _b.private_isArchived))) {
        var lastAction = (0, ReportActionsUtils_1.getLastVisibleAction)(report === null || report === void 0 ? void 0 : report.reportID);
        var archiveReason = (0, ReportActionsUtils_1.isClosedAction)(lastAction) ? (_c = (0, ReportActionsUtils_1.getOriginalMessage)(lastAction)) === null || _c === void 0 ? void 0 : _c.reason : CONST_1.default.REPORT.ARCHIVE_REASON.DEFAULT;
        if (archiveReason === CONST_1.default.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED && policyExpenseChatRole !== CONST_1.default.POLICY.ROLE.ADMIN) {
            return getPolicyName({ report: report, policy: policy, policies: policies, reports: reports });
        }
    }
    return report === null || report === void 0 ? void 0 : report.reportName;
}
function getArchiveReason(reportActions) {
    var _a;
    var lastClosedReportAction = (0, ReportActionsUtils_1.getLastClosedReportAction)(reportActions);
    if (!lastClosedReportAction) {
        return undefined;
    }
    return (0, ReportActionsUtils_1.isClosedAction)(lastClosedReportAction) ? (_a = (0, ReportActionsUtils_1.getOriginalMessage)(lastClosedReportAction)) === null || _a === void 0 ? void 0 : _a.reason : CONST_1.default.REPORT.ARCHIVE_REASON.DEFAULT;
}
/**
 * Given a report field, check if the field is for the report title.
 */
function isReportFieldOfTypeTitle(reportField) {
    return (reportField === null || reportField === void 0 ? void 0 : reportField.fieldID) === CONST_1.default.REPORT_FIELD_TITLE_FIELD_ID;
}
/**
 * Check if Report has any held expenses
 */
function isHoldCreator(transaction, reportID) {
    var _a, _b;
    var holdReportAction = (0, ReportActionsUtils_1.getReportAction)(reportID, "".concat((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.hold) !== null && _b !== void 0 ? _b : ''));
    return isActionCreator(holdReportAction);
}
/**
 * Given a report field, check if the field can be edited or not.
 * For title fields, its considered disabled if `deletable` prop is `true` (https://github.com/Expensify/App/issues/35043#issuecomment-1911275433)
 * For non title fields, its considered disabled if:
 * 1. The user is not admin of the report
 * 2. Report is settled or it is closed
 */
function isReportFieldDisabled(report, reportField, policy) {
    var _a;
    if (isInvoiceReport(report)) {
        return true;
    }
    var isReportSettled = isSettled(report === null || report === void 0 ? void 0 : report.reportID);
    var isReportClosed = isClosedReport(report);
    var isTitleField = isReportFieldOfTypeTitle(reportField);
    var isAdmin = isPolicyAdmin(report === null || report === void 0 ? void 0 : report.policyID, (_a = {}, _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy === null || policy === void 0 ? void 0 : policy.id)] = policy, _a));
    var isApproved = isReportApproved({ report: report });
    if (!isAdmin && (isReportSettled || isReportClosed || isApproved)) {
        return true;
    }
    if (isTitleField) {
        return !(reportField === null || reportField === void 0 ? void 0 : reportField.deletable);
    }
    return false;
}
/**
 * Given a set of report fields, return the field that refers to title
 */
function getTitleReportField(reportFields) {
    return Object.values(reportFields).find(function (field) { return isReportFieldOfTypeTitle(field); });
}
/**
 * Get the key for a report field
 */
function getReportFieldKey(reportFieldId) {
    if (!reportFieldId) {
        return '';
    }
    // We don't need to add `expensify_` prefix to the title field key, because backend stored title under a unique key `text_title`,
    // and all the other report field keys are stored under `expensify_FIELD_ID`.
    if (reportFieldId === CONST_1.default.REPORT_FIELD_TITLE_FIELD_ID) {
        return reportFieldId;
    }
    return "expensify_".concat(reportFieldId);
}
/**
 * Get the report fields attached to the policy given policyID
 */
function getReportFieldsByPolicyID(policyID) {
    var _a;
    if (!policyID) {
        return {};
    }
    var policyReportFields = Object.entries(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).find(function (_a) {
        var key = _a[0];
        return key.replace(ONYXKEYS_1.default.COLLECTION.POLICY, '') === policyID;
    });
    var fieldList = (_a = policyReportFields === null || policyReportFields === void 0 ? void 0 : policyReportFields[1]) === null || _a === void 0 ? void 0 : _a.fieldList;
    if (!policyReportFields || !fieldList) {
        return {};
    }
    return fieldList;
}
/**
 * Get the report fields that we should display a MoneyReportView gets opened
 */
function getAvailableReportFields(report, policyReportFields) {
    var _a;
    // Get the report fields that are attached to a report. These will persist even if a field is deleted from the policy.
    var reportFields = Object.values((_a = report === null || report === void 0 ? void 0 : report.fieldList) !== null && _a !== void 0 ? _a : {});
    var reportIsSettled = isSettled(report === null || report === void 0 ? void 0 : report.reportID);
    // If the report is settled, we don't want to show any new field that gets added to the policy.
    if (reportIsSettled) {
        return reportFields;
    }
    // If the report is unsettled, we want to merge the new fields that get added to the policy with the fields that
    // are attached to the report.
    var mergedFieldIds = Array.from(new Set(__spreadArray(__spreadArray([], policyReportFields.map(function (_a) {
        var fieldID = _a.fieldID;
        return fieldID;
    }), true), reportFields.map(function (_a) {
        var fieldID = _a.fieldID;
        return fieldID;
    }), true)));
    var fields = mergedFieldIds.map(function (id) {
        var _a;
        var field = (_a = report === null || report === void 0 ? void 0 : report.fieldList) === null || _a === void 0 ? void 0 : _a[getReportFieldKey(id)];
        if (field) {
            return field;
        }
        var policyReportField = policyReportFields.find(function (_a) {
            var fieldID = _a.fieldID;
            return fieldID === id;
        });
        if (policyReportField) {
            return policyReportField;
        }
        return null;
    });
    return fields.filter(Boolean);
}
/**
 * Get the title for an IOU or expense chat which will be showing the payer and the amount
 */
function getMoneyRequestReportName(_a) {
    var _b, _c;
    var report = _a.report, policy = _a.policy, invoiceReceiverPolicy = _a.invoiceReceiverPolicy;
    if ((report === null || report === void 0 ? void 0 : report.reportName) && isExpenseReport(report)) {
        return report.reportName;
    }
    var moneyRequestTotal = getMoneyRequestSpendBreakdown(report).totalDisplaySpend;
    var formattedAmount = (0, CurrencyUtils_1.convertToDisplayString)(moneyRequestTotal, report === null || report === void 0 ? void 0 : report.currency);
    var payerOrApproverName;
    if (isExpenseReport(report)) {
        var parentReport = getParentReport(report);
        payerOrApproverName = getPolicyName({ report: parentReport !== null && parentReport !== void 0 ? parentReport : report, policy: policy });
    }
    else if (isInvoiceReport(report)) {
        var chatReport = getReportOrDraftReport(report === null || report === void 0 ? void 0 : report.chatReportID);
        payerOrApproverName = getInvoicePayerName(chatReport, invoiceReceiverPolicy);
    }
    else {
        payerOrApproverName = (_b = getDisplayNameForParticipant({ accountID: report === null || report === void 0 ? void 0 : report.managerID })) !== null && _b !== void 0 ? _b : '';
    }
    var payerPaidAmountMessage = (0, Localize_1.translateLocal)('iou.payerPaidAmount', {
        payer: payerOrApproverName,
        amount: formattedAmount,
    });
    if (isReportApproved({ report: report })) {
        return (0, Localize_1.translateLocal)('iou.managerApprovedAmount', {
            manager: payerOrApproverName,
            amount: formattedAmount,
        });
    }
    if (report === null || report === void 0 ? void 0 : report.isWaitingOnBankAccount) {
        return "".concat(payerPaidAmountMessage, " ").concat(CONST_1.default.DOT_SEPARATOR, " ").concat((0, Localize_1.translateLocal)('iou.pending'));
    }
    if (!isSettled(report === null || report === void 0 ? void 0 : report.reportID) && hasNonReimbursableTransactions(report === null || report === void 0 ? void 0 : report.reportID)) {
        payerOrApproverName = (_c = getDisplayNameForParticipant({ accountID: report === null || report === void 0 ? void 0 : report.ownerAccountID })) !== null && _c !== void 0 ? _c : '';
        return (0, Localize_1.translateLocal)('iou.payerSpentAmount', { payer: payerOrApproverName, amount: formattedAmount });
    }
    if (isProcessingReport(report) || isOpenExpenseReport(report) || isOpenInvoiceReport(report) || moneyRequestTotal === 0) {
        return (0, Localize_1.translateLocal)('iou.payerOwesAmount', { payer: payerOrApproverName, amount: formattedAmount });
    }
    return payerPaidAmountMessage;
}
/**
 * Gets transaction created, amount, currency, comment, and waypoints (for distance expense)
 * into a flat object. Used for displaying transactions and sending them in API commands
 */
function getTransactionDetails(transaction, createdDateFormat, policy, allowNegativeAmount, disableOppositeConversion) {
    if (createdDateFormat === void 0) { createdDateFormat = CONST_1.default.DATE.FNS_FORMAT_STRING; }
    if (policy === void 0) { policy = undefined; }
    if (allowNegativeAmount === void 0) { allowNegativeAmount = false; }
    if (disableOppositeConversion === void 0) { disableOppositeConversion = false; }
    if (!transaction) {
        return;
    }
    var report = getReportOrDraftReport(transaction === null || transaction === void 0 ? void 0 : transaction.reportID);
    return {
        created: (0, TransactionUtils_1.getFormattedCreated)(transaction, createdDateFormat),
        amount: (0, TransactionUtils_1.getAmount)(transaction, !(0, EmptyObject_1.isEmptyObject)(report) && isExpenseReport(report), undefined, allowNegativeAmount, disableOppositeConversion),
        attendees: (0, TransactionUtils_1.getAttendees)(transaction),
        taxAmount: (0, TransactionUtils_1.getTaxAmount)(transaction, !(0, EmptyObject_1.isEmptyObject)(report) && isExpenseReport(report)),
        taxCode: (0, TransactionUtils_1.getTaxCode)(transaction),
        currency: (0, TransactionUtils_1.getCurrency)(transaction),
        comment: (0, TransactionUtils_1.getDescription)(transaction),
        merchant: (0, TransactionUtils_1.getMerchant)(transaction, policy),
        waypoints: (0, TransactionUtils_1.getWaypoints)(transaction),
        customUnitRateID: (0, TransactionUtils_1.getRateID)(transaction),
        category: (0, TransactionUtils_1.getCategory)(transaction),
        billable: (0, TransactionUtils_1.getBillable)(transaction),
        tag: (0, TransactionUtils_1.getTag)(transaction),
        mccGroup: (0, TransactionUtils_1.getMCCGroup)(transaction),
        cardID: (0, TransactionUtils_1.getCardID)(transaction),
        cardName: (0, TransactionUtils_1.getCardName)(transaction),
        originalAmount: (0, TransactionUtils_1.getOriginalAmount)(transaction),
        originalCurrency: (0, TransactionUtils_1.getOriginalCurrency)(transaction),
        postedDate: (0, TransactionUtils_1.getFormattedPostedDate)(transaction),
    };
}
function getTransactionCommentObject(transaction) {
    var _a, _b;
    return __assign(__assign({}, transaction === null || transaction === void 0 ? void 0 : transaction.comment), { comment: Parser_1.default.htmlToMarkdown((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.comment) !== null && _b !== void 0 ? _b : ''), waypoints: (0, TransactionUtils_1.getWaypoints)(transaction) });
}
function isWorkspacePayer(memberLogin, policy) {
    var _a, _b, _c, _d;
    var isAdmin = ((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _a === void 0 ? void 0 : _a[memberLogin]) === null || _b === void 0 ? void 0 : _b.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    if ((0, PolicyUtils_1.isPaidGroupPolicy)(policy)) {
        if ((policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) === CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES) {
            // If we get here without a reimburser only admin is the payer.
            if (!((_c = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _c === void 0 ? void 0 : _c.reimburser)) {
                return isAdmin;
            }
            // If we are the reimburser then we are the payer.
            var isReimburser = memberLogin === ((_d = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _d === void 0 ? void 0 : _d.reimburser);
            return isReimburser;
        }
        if ((policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) === CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL) {
            return isAdmin;
        }
        return false;
    }
    return false;
}
/**
 * Can only edit if:
 *
 * - in case of IOU report
 *    - the current user is the requestor and is not settled yet
 * - in case of expense report
 *    - the current user is the requestor and is not settled yet
 *    - the current user is the manager of the report
 *    - or the current user is an admin on the policy the expense report is tied to
 *
 *    This is used in conjunction with canEditRestrictedField to control editing of specific fields like amount, currency, created, receipt, and distance.
 *    On its own, it only controls allowing/disallowing navigating to the editing pages or showing/hiding the 'Edit' icon on report actions
 */
function canEditMoneyRequest(reportAction, linkedTransaction) {
    var isDeleted = (0, ReportActionsUtils_1.isDeletedAction)(reportAction);
    if (isDeleted) {
        return false;
    }
    var allowedReportActionType = [CONST_1.default.IOU.REPORT_ACTION_TYPE.TRACK, CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE];
    var originalMessage = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction);
    var actionType = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type;
    if (!actionType || !allowedReportActionType.includes(actionType)) {
        return false;
    }
    var transaction = linkedTransaction !== null && linkedTransaction !== void 0 ? linkedTransaction : getLinkedTransaction(reportAction !== null && reportAction !== void 0 ? reportAction : undefined);
    // In case the transaction is failed to be created, we should disable editing the money request
    if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) || ((transaction === null || transaction === void 0 ? void 0 : transaction.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD && !(0, EmptyObject_1.isEmptyObject)(transaction.errors))) {
        return false;
    }
    var moneyRequestReportID = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.IOUReportID;
    if (!moneyRequestReportID) {
        return actionType === CONST_1.default.IOU.REPORT_ACTION_TYPE.TRACK;
    }
    var moneyRequestReport = getReportOrDraftReport(String(moneyRequestReportID));
    var isRequestor = currentUserAccountID === (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID);
    var isSubmitted = isProcessingReport(moneyRequestReport);
    if (isIOUReport(moneyRequestReport)) {
        return isSubmitted && isRequestor;
    }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.policyID);
    var isAdmin = (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    var isManager = currentUserAccountID === (moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.managerID);
    if (isInvoiceReport(moneyRequestReport) && isManager) {
        return false;
    }
    // Admin & managers can always edit coding fields such as tag, category, billable, etc.
    if (isAdmin || isManager) {
        return true;
    }
    if ((policy === null || policy === void 0 ? void 0 : policy.type) === CONST_1.default.POLICY.TYPE.CORPORATE && moneyRequestReport && isSubmitted && isCurrentUserSubmitter(moneyRequestReport.reportID)) {
        var isForwarded = (0, PolicyUtils_1.getSubmitToAccountID)(policy, moneyRequestReport) !== moneyRequestReport.managerID;
        return !isForwarded;
    }
    return !isReportApproved({ report: moneyRequestReport }) && !isSettled(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID) && !isClosedReport(moneyRequestReport) && isRequestor;
}
function getNextApproverAccountID(report, isUnapproved) {
    if (isUnapproved === void 0) { isUnapproved = false; }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(report === null || report === void 0 ? void 0 : report.policyID);
    var approvalChain = getApprovalChain(policy, report);
    var submitToAccountID = (0, PolicyUtils_1.getSubmitToAccountID)(policy, report);
    if (isUnapproved) {
        if (approvalChain.includes(currentUserEmail !== null && currentUserEmail !== void 0 ? currentUserEmail : '')) {
            return currentUserAccountID;
        }
        return report === null || report === void 0 ? void 0 : report.managerID;
    }
    if (approvalChain.length === 0) {
        return submitToAccountID;
    }
    var nextApproverEmail = approvalChain.length === 1 ? approvalChain.at(0) : approvalChain.at(approvalChain.indexOf(currentUserEmail !== null && currentUserEmail !== void 0 ? currentUserEmail : '') + 1);
    if (!nextApproverEmail) {
        return submitToAccountID;
    }
    return (0, PersonalDetailsUtils_1.getAccountIDsByLogins)([nextApproverEmail]).at(0);
}
function canEditReportPolicy(report, reportPolicy) {
    var isAdmin = (0, PolicyUtils_1.isPolicyAdmin)(reportPolicy);
    var isManager = isReportManager(report);
    var isSubmitter = isReportOwner(report);
    var isReportAuditor = isAuditor(report);
    var isIOUType = isIOUReport(report);
    var isInvoiceType = isInvoiceReport(report);
    var isExpenseType = isExpenseReport(report);
    var isOpen = isOpenReport(report);
    var isSubmitted = isProcessingReport(report);
    var isReimbursed = isReportManuallyReimbursed(report);
    if (isIOUType) {
        return isOpen || isSubmitted || isReimbursed;
    }
    if (isInvoiceType) {
        return isOpen && !isReportAuditor;
    }
    if (isExpenseType) {
        if (isOpen) {
            return isSubmitter || isAdmin;
        }
        if (isSubmitted) {
            return (isSubmitter && isAwaitingFirstLevelApproval(report)) || isManager || isAdmin;
        }
        return isManager || isAdmin;
    }
    return false;
}
/**
 * Checks if the current user can edit the provided property of an expense
 *
 */
function canEditFieldOfMoneyRequest(reportAction, fieldToEdit, isDeleteAction) {
    var _a, _b;
    // A list of fields that cannot be edited by anyone, once an expense has been settled
    var restrictedFields = [
        CONST_1.default.EDIT_REQUEST_FIELD.AMOUNT,
        CONST_1.default.EDIT_REQUEST_FIELD.CURRENCY,
        CONST_1.default.EDIT_REQUEST_FIELD.MERCHANT,
        CONST_1.default.EDIT_REQUEST_FIELD.DATE,
        CONST_1.default.EDIT_REQUEST_FIELD.RECEIPT,
        CONST_1.default.EDIT_REQUEST_FIELD.DISTANCE,
        CONST_1.default.EDIT_REQUEST_FIELD.DISTANCE_RATE,
        CONST_1.default.EDIT_REQUEST_FIELD.REPORT,
    ];
    if (!(0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction) || !canEditMoneyRequest(reportAction)) {
        return false;
    }
    // If we're editing fields such as category, tag, description, etc. the check above should be enough for handling the permission
    if (!restrictedFields.includes(fieldToEdit)) {
        return true;
    }
    var iouMessage = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction);
    var moneyRequestReport = (iouMessage === null || iouMessage === void 0 ? void 0 : iouMessage.IOUReportID) ? ((_a = getReport(iouMessage === null || iouMessage === void 0 ? void 0 : iouMessage.IOUReportID, allReports)) !== null && _a !== void 0 ? _a : {}) : {};
    var transaction = (_b = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(iouMessage === null || iouMessage === void 0 ? void 0 : iouMessage.IOUTransactionID)]) !== null && _b !== void 0 ? _b : {};
    if (isSettled(String(moneyRequestReport.reportID)) || isReportIDApproved(String(moneyRequestReport.reportID))) {
        return false;
    }
    if ((fieldToEdit === CONST_1.default.EDIT_REQUEST_FIELD.AMOUNT || fieldToEdit === CONST_1.default.EDIT_REQUEST_FIELD.CURRENCY || fieldToEdit === CONST_1.default.EDIT_REQUEST_FIELD.DATE) &&
        (0, TransactionUtils_1.isCardTransaction)(transaction)) {
        return false;
    }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.policyID);
    var isAdmin = isExpenseReport(moneyRequestReport) && (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    var isManager = isExpenseReport(moneyRequestReport) && currentUserAccountID === (moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.managerID);
    if ((fieldToEdit === CONST_1.default.EDIT_REQUEST_FIELD.AMOUNT || fieldToEdit === CONST_1.default.EDIT_REQUEST_FIELD.CURRENCY) && (0, TransactionUtils_1.isDistanceRequest)(transaction)) {
        return isAdmin || isManager;
    }
    if ((fieldToEdit === CONST_1.default.EDIT_REQUEST_FIELD.AMOUNT || fieldToEdit === CONST_1.default.EDIT_REQUEST_FIELD.CURRENCY || fieldToEdit === CONST_1.default.EDIT_REQUEST_FIELD.MERCHANT) &&
        (0, TransactionUtils_1.isPerDiemRequest)(transaction)) {
        return false;
    }
    if (fieldToEdit === CONST_1.default.EDIT_REQUEST_FIELD.RECEIPT) {
        var isRequestor = currentUserAccountID === (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID);
        return (!isInvoiceReport(moneyRequestReport) &&
            !(0, TransactionUtils_1.isReceiptBeingScanned)(transaction) &&
            !(0, TransactionUtils_1.isDistanceRequest)(transaction) &&
            !(0, TransactionUtils_1.isPerDiemRequest)(transaction) &&
            (isAdmin || isManager || isRequestor) &&
            (isDeleteAction ? isRequestor : true));
    }
    if (fieldToEdit === CONST_1.default.EDIT_REQUEST_FIELD.DISTANCE_RATE) {
        // The distance rate can be modified only on the distance expense reports
        return isExpenseReport(moneyRequestReport) && (0, TransactionUtils_1.isDistanceRequest)(transaction);
    }
    if (fieldToEdit === CONST_1.default.EDIT_REQUEST_FIELD.REPORT) {
        // Unreported transaction from OldDot can have the reportID as an empty string
        var isUnreported = !(transaction === null || transaction === void 0 ? void 0 : transaction.reportID) || (transaction === null || transaction === void 0 ? void 0 : transaction.reportID) === CONST_1.default.REPORT.UNREPORTED_REPORT_ID;
        return isUnreported
            ? Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).flatMap(function (currentPolicy) { return getOutstandingReportsForUser(currentPolicy === null || currentPolicy === void 0 ? void 0 : currentPolicy.id, currentUserAccountID, allReports !== null && allReports !== void 0 ? allReports : {}); }).length > 0
            : Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).flatMap(function (currentPolicy) { return getOutstandingReportsForUser(currentPolicy === null || currentPolicy === void 0 ? void 0 : currentPolicy.id, moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.ownerAccountID, allReports !== null && allReports !== void 0 ? allReports : {}); }).length > 1;
    }
    return true;
}
/**
 * Can only edit if:
 *
 * - It was written by the current user
 * - It's an ADD_COMMENT that is not an attachment
 * - It's an expense where conditions for modifications are defined in canEditMoneyRequest method
 * - It's not pending deletion
 */
function canEditReportAction(reportAction) {
    var isCommentOrIOU = (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT || (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU;
    var message = reportAction ? (0, ReportActionsUtils_1.getReportActionMessage)(reportAction) : undefined;
    return !!((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID) === currentUserAccountID &&
        isCommentOrIOU &&
        (!(0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction) || canEditMoneyRequest(reportAction)) && // Returns true for non-IOU actions
        !(0, isReportMessageAttachment_1.isReportMessageAttachment)(message) &&
        ((!reportAction.isAttachmentWithText && !reportAction.isAttachmentOnly) || !reportAction.isOptimisticAction) &&
        !(0, ReportActionsUtils_1.isDeletedAction)(reportAction) &&
        !(0, ReportActionsUtils_1.isCreatedTaskReportAction)(reportAction) &&
        (reportAction === null || reportAction === void 0 ? void 0 : reportAction.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
}
/**
 * This function is needed due to the fact that when we first create an empty report, its preview action has an actorAccountID of '0'.
 * This is not the case when the report is automatically created by adding expenses to the chat where no open report is available.
 * Can be simplified by comparing actorAccountID to accountID when mentioned issue is no longer a thing on a BE side.
 */
function isActionOrReportPreviewOwner(report) {
    var parentAction = (0, ReportActionsUtils_1.getReportAction)(report.parentReportID, report.parentReportActionID);
    var accountID = (currentUserPersonalDetails !== null && currentUserPersonalDetails !== void 0 ? currentUserPersonalDetails : {}).accountID;
    var _a = parentAction !== null && parentAction !== void 0 ? parentAction : {}, actorAccountID = _a.actorAccountID, actionName = _a.actionName, childOwnerAccountID = _a.childOwnerAccountID;
    if (typeof accountID === 'number' && typeof actorAccountID === 'number' && accountID === actorAccountID) {
        return true;
    }
    return actionName === CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && childOwnerAccountID === accountID;
}
function canHoldUnholdReportAction(reportAction) {
    var _a, _b, _c, _d;
    if (!(0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction)) {
        return { canHoldRequest: false, canUnholdRequest: false };
    }
    var moneyRequestReportID = (_a = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction)) === null || _a === void 0 ? void 0 : _a.IOUReportID;
    var moneyRequestReport = getReportOrDraftReport(String(moneyRequestReportID));
    if (!moneyRequestReportID || !moneyRequestReport) {
        return { canHoldRequest: false, canUnholdRequest: false };
    }
    if (isInvoiceReport(moneyRequestReport)) {
        return {
            canHoldRequest: false,
            canUnholdRequest: false,
        };
    }
    var isRequestSettled = isSettled(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID);
    var isApproved = isReportApproved({ report: moneyRequestReport });
    var transactionID = moneyRequestReport ? (_b = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction)) === null || _b === void 0 ? void 0 : _b.IOUTransactionID : undefined;
    var transaction = (_c = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)]) !== null && _c !== void 0 ? _c : {};
    var parentReportAction = isThread(moneyRequestReport)
        ? (_d = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(moneyRequestReport.parentReportID)]) === null || _d === void 0 ? void 0 : _d[moneyRequestReport.parentReportActionID]
        : undefined;
    var isRequestIOU = isIOUReport(moneyRequestReport);
    var isHoldActionCreator = isHoldCreator(transaction, reportAction.childReportID);
    var isTrackExpenseMoneyReport = isTrackExpenseReport(moneyRequestReport);
    var isActionOwner = isActionOrReportPreviewOwner(moneyRequestReport);
    var isApprover = isMoneyRequestReport(moneyRequestReport) && (moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.managerID) !== null && (currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID) === (moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.managerID);
    var isAdmin = isPolicyAdmin(moneyRequestReport.policyID, allPolicies);
    var isOnHold = (0, TransactionUtils_1.isOnHold)(transaction);
    var isClosed = isClosedReport(moneyRequestReport);
    var isSubmitted = isProcessingReport(moneyRequestReport);
    var canModifyStatus = !isTrackExpenseMoneyReport && (isAdmin || isActionOwner || isApprover);
    var canModifyUnholdStatus = !isTrackExpenseMoneyReport && (isAdmin || (isActionOwner && isHoldActionCreator) || isApprover);
    var isDeletedParentActionLocal = (0, EmptyObject_1.isEmptyObject)(parentReportAction) || (0, ReportActionsUtils_1.isDeletedAction)(parentReportAction);
    var canHoldOrUnholdRequest = !isRequestSettled && !isApproved && !isDeletedParentActionLocal && !isClosed && !(0, ReportActionsUtils_1.isDeletedParentAction)(reportAction);
    var canHoldRequest = canHoldOrUnholdRequest && !isOnHold && (isRequestIOU || canModifyStatus) && !(0, TransactionUtils_1.isScanning)(transaction) && (isSubmitted || isActionOwner);
    var canUnholdRequest = !!(canHoldOrUnholdRequest && isOnHold && (isRequestIOU ? isHoldActionCreator : canModifyUnholdStatus));
    return { canHoldRequest: canHoldRequest, canUnholdRequest: canUnholdRequest };
}
var changeMoneyRequestHoldStatus = function (reportAction) {
    var _a, _b, _c, _d, _e;
    if (!(0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction)) {
        return;
    }
    var moneyRequestReportID = (_a = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction)) === null || _a === void 0 ? void 0 : _a.IOUReportID;
    var moneyRequestReport = getReportOrDraftReport(String(moneyRequestReportID));
    if (!moneyRequestReportID || !moneyRequestReport) {
        return;
    }
    var transactionID = (_b = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction)) === null || _b === void 0 ? void 0 : _b.IOUTransactionID;
    if (!transactionID || !reportAction.childReportID) {
        Log_1.default.warn('Missing transactionID and reportAction.childReportID during the change of the money request hold status');
        return;
    }
    var transaction = (_c = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)]) !== null && _c !== void 0 ? _c : {};
    var isOnHold = (0, TransactionUtils_1.isOnHold)(transaction);
    var policy = (_d = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(moneyRequestReport.policyID)]) !== null && _d !== void 0 ? _d : null;
    if (isOnHold) {
        (0, IOU_1.unholdRequest)(transactionID, reportAction.childReportID);
    }
    else {
        var activeRoute = encodeURIComponent(Navigation_1.default.getActiveRoute());
        Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_HOLD_REASON.getRoute((_e = policy === null || policy === void 0 ? void 0 : policy.type) !== null && _e !== void 0 ? _e : CONST_1.default.POLICY.TYPE.PERSONAL, transactionID, reportAction.childReportID, activeRoute));
    }
};
exports.changeMoneyRequestHoldStatus = changeMoneyRequestHoldStatus;
/**
 * Gets all transactions on an IOU report with a receipt
 */
function getTransactionsWithReceipts(iouReportID) {
    var transactions = getReportTransactions(iouReportID);
    return transactions.filter(function (transaction) { return (0, TransactionUtils_1.hasReceipt)(transaction); });
}
/**
 * For report previews, we display a "Receipt scan in progress" indicator
 * instead of the report total only when we have no report total ready to show. This is the case when
 * all requests are receipts that are being SmartScanned. As soon as we have a non-receipt request,
 * or as soon as one receipt request is done scanning, we have at least one
 * "ready" expense, and we remove this indicator to show the partial report total.
 */
function areAllRequestsBeingSmartScanned(iouReportID, reportPreviewAction) {
    var transactionsWithReceipts = getTransactionsWithReceipts(iouReportID);
    // If we have more requests than requests with receipts, we have some manual requests
    if ((0, ReportActionsUtils_1.getNumberOfMoneyRequests)(reportPreviewAction) > transactionsWithReceipts.length) {
        return false;
    }
    return transactionsWithReceipts.every(function (transaction) { return (0, TransactionUtils_1.isScanning)(transaction); });
}
/**
 * Get the transactions related to a report preview with receipts
 * Get the details linked to the IOU reportAction
 *
 * NOTE: This method is only meant to be used inside this action file. Do not export and use it elsewhere. Use withOnyx or Onyx.connect() instead.
 */
function getLinkedTransaction(reportAction, transactions) {
    var _a;
    var transactionID;
    if ((0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction)) {
        transactionID = (_a = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction)) === null || _a === void 0 ? void 0 : _a.IOUTransactionID;
    }
    return transactions ? transactions.find(function (transaction) { return transaction.transactionID === transactionID; }) : allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
}
/**
 * Check if any of the transactions in the report has required missing fields
 */
function hasMissingSmartscanFields(iouReportID, transactions) {
    var reportTransactions = transactions !== null && transactions !== void 0 ? transactions : getReportTransactions(iouReportID);
    return reportTransactions.some(TransactionUtils_1.hasMissingSmartscanFields);
}
/**
 * Get report action which is missing smartscan fields
 */
function getReportActionWithMissingSmartscanFields(iouReportID) {
    var reportActions = Object.values((0, ReportActionsUtils_1.getAllReportActions)(iouReportID));
    return reportActions.find(function (action) {
        if (!(0, ReportActionsUtils_1.isMoneyRequestAction)(action)) {
            return false;
        }
        var transaction = getLinkedTransaction(action);
        if ((0, EmptyObject_1.isEmptyObject)(transaction)) {
            return false;
        }
        if (!(0, ReportActionsUtils_1.wasActionTakenByCurrentUser)(action)) {
            return false;
        }
        return (0, TransactionUtils_1.hasMissingSmartscanFields)(transaction);
    });
}
/**
 * Check if iouReportID has required missing fields
 */
function shouldShowRBRForMissingSmartscanFields(iouReportID) {
    return !!getReportActionWithMissingSmartscanFields(iouReportID);
}
/**
 * Given a parent IOU report action get report name for the LHN.
 */
function getTransactionReportName(_a) {
    var _b, _c;
    var reportAction = _a.reportAction, transactions = _a.transactions, reports = _a.reports;
    if ((0, ReportActionsUtils_1.isReversedTransaction)(reportAction)) {
        return (0, Localize_1.translateLocal)('parentReportAction.reversedTransaction');
    }
    if ((0, ReportActionsUtils_1.isDeletedAction)(reportAction)) {
        return (0, Localize_1.translateLocal)('parentReportAction.deletedExpense');
    }
    var transaction = getLinkedTransaction(reportAction, transactions);
    if ((0, EmptyObject_1.isEmptyObject)(transaction)) {
        // Transaction data might be empty on app's first load, if so we fallback to Expense/Track Expense
        return (0, ReportActionsUtils_1.isTrackExpenseAction)(reportAction) ? (0, Localize_1.translateLocal)('iou.createExpense') : (0, Localize_1.translateLocal)('iou.expense');
    }
    if ((0, TransactionUtils_1.isScanning)(transaction)) {
        return (0, Localize_1.translateLocal)('iou.receiptScanning', { count: 1 });
    }
    if ((0, TransactionUtils_1.hasMissingSmartscanFields)(transaction)) {
        return (0, Localize_1.translateLocal)('iou.receiptMissingDetails');
    }
    if ((0, TransactionUtils_1.isFetchingWaypointsFromServer)(transaction) && (0, TransactionUtils_1.getMerchant)(transaction) === (0, Localize_1.translateLocal)('iou.fieldPending')) {
        return (0, Localize_1.translateLocal)('iou.fieldPending');
    }
    if ((0, ReportActionsUtils_1.isSentMoneyReportAction)(reportAction)) {
        return getIOUReportActionDisplayMessage(reportAction, transaction);
    }
    var report = getReportOrDraftReport(transaction === null || transaction === void 0 ? void 0 : transaction.reportID, reports);
    var amount = (_b = (0, TransactionUtils_1.getAmount)(transaction, !(0, EmptyObject_1.isEmptyObject)(report) && isExpenseReport(report))) !== null && _b !== void 0 ? _b : 0;
    var formattedAmount = (_c = (0, CurrencyUtils_1.convertToDisplayString)(amount, (0, TransactionUtils_1.getCurrency)(transaction))) !== null && _c !== void 0 ? _c : '';
    var comment = (0, TransactionUtils_1.getMerchantOrDescription)(transaction);
    return (0, Localize_1.translateLocal)('iou.threadExpenseReportName', { formattedAmount: formattedAmount, comment: comment });
}
/**
 * Get expense message for an IOU report
 *
 * @param [iouReportAction] This is always an IOU action. When necessary, report preview actions will be unwrapped and the child iou report action is passed here (the original report preview
 *     action will be passed as `originalReportAction` in this case).
 * @param [originalReportAction] This can be either a report preview action or the IOU action. This will be the original report preview action in cases where `iouReportAction` was unwrapped
 *     from a report preview action. Otherwise, it will be the same as `iouReportAction`.
 */
function getReportPreviewMessage(reportOrID, iouReportAction, shouldConsiderScanningReceiptOrPendingRoute, isPreviewMessageForParentChatReport, policy, isForListPreview, originalReportAction) {
    var _a, _b, _c, _d, _e, _f;
    if (iouReportAction === void 0) { iouReportAction = null; }
    if (shouldConsiderScanningReceiptOrPendingRoute === void 0) { shouldConsiderScanningReceiptOrPendingRoute = false; }
    if (isPreviewMessageForParentChatReport === void 0) { isPreviewMessageForParentChatReport = false; }
    if (isForListPreview === void 0) { isForListPreview = false; }
    if (originalReportAction === void 0) { originalReportAction = iouReportAction; }
    var report = typeof reportOrID === 'string' ? getReport(reportOrID, allReports) : reportOrID;
    var reportActionMessage = (0, ReportActionsUtils_1.getReportActionHtml)(iouReportAction);
    if ((0, EmptyObject_1.isEmptyObject)(report) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
        // This iouReport may be unavailable for one of the following reasons:
        // 1. After SignIn, the OpenApp API won't return iouReports if they're settled.
        // 2. The iouReport exists in local storage but hasn't been loaded into the allReports. It will be loaded automatically when the user opens the iouReport.
        // Until we know how to solve this the best, we just display the report action message.
        return reportActionMessage;
    }
    var allReportTransactions = getReportTransactions(report.reportID);
    var transactionsWithReceipts = allReportTransactions.filter(TransactionUtils_1.hasReceipt);
    var numberOfScanningReceipts = transactionsWithReceipts.filter(TransactionUtils_1.isScanning).length;
    if (!(0, EmptyObject_1.isEmptyObject)(iouReportAction) && !isIOUReport(report) && iouReportAction && (0, ReportActionsUtils_1.isSplitBillAction)(iouReportAction)) {
        // This covers group chats where the last action is a split expense action
        var linkedTransaction_1 = getLinkedTransaction(iouReportAction);
        if ((0, EmptyObject_1.isEmptyObject)(linkedTransaction_1)) {
            return reportActionMessage;
        }
        if (!(0, EmptyObject_1.isEmptyObject)(linkedTransaction_1)) {
            if ((0, TransactionUtils_1.isScanning)(linkedTransaction_1)) {
                return (0, Localize_1.translateLocal)('iou.receiptScanning', { count: 1 });
            }
            if ((0, TransactionUtils_1.hasMissingSmartscanFields)(linkedTransaction_1)) {
                return (0, Localize_1.translateLocal)('iou.receiptMissingDetails');
            }
            var amount_1 = (_a = (0, TransactionUtils_1.getAmount)(linkedTransaction_1, !(0, EmptyObject_1.isEmptyObject)(report) && isExpenseReport(report))) !== null && _a !== void 0 ? _a : 0;
            var formattedAmount_1 = (_b = (0, CurrencyUtils_1.convertToDisplayString)(amount_1, (0, TransactionUtils_1.getCurrency)(linkedTransaction_1))) !== null && _b !== void 0 ? _b : '';
            return (0, Localize_1.translateLocal)('iou.didSplitAmount', { formattedAmount: formattedAmount_1, comment: (0, TransactionUtils_1.getMerchantOrDescription)(linkedTransaction_1) });
        }
    }
    if (!(0, EmptyObject_1.isEmptyObject)(iouReportAction) && !isIOUReport(report) && iouReportAction && (0, ReportActionsUtils_1.isTrackExpenseAction)(iouReportAction)) {
        // This covers group chats where the last action is a track expense action
        var linkedTransaction_2 = getLinkedTransaction(iouReportAction);
        if ((0, EmptyObject_1.isEmptyObject)(linkedTransaction_2)) {
            return reportActionMessage;
        }
        if (!(0, EmptyObject_1.isEmptyObject)(linkedTransaction_2)) {
            if ((0, TransactionUtils_1.isScanning)(linkedTransaction_2)) {
                return (0, Localize_1.translateLocal)('iou.receiptScanning', { count: 1 });
            }
            if ((0, TransactionUtils_1.hasMissingSmartscanFields)(linkedTransaction_2)) {
                return (0, Localize_1.translateLocal)('iou.receiptMissingDetails');
            }
            var amount_2 = (_c = (0, TransactionUtils_1.getAmount)(linkedTransaction_2, !(0, EmptyObject_1.isEmptyObject)(report) && isExpenseReport(report))) !== null && _c !== void 0 ? _c : 0;
            var formattedAmount_2 = (_d = (0, CurrencyUtils_1.convertToDisplayString)(amount_2, (0, TransactionUtils_1.getCurrency)(linkedTransaction_2))) !== null && _d !== void 0 ? _d : '';
            return (0, Localize_1.translateLocal)('iou.trackedAmount', { formattedAmount: formattedAmount_2, comment: (0, TransactionUtils_1.getMerchantOrDescription)(linkedTransaction_2) });
        }
    }
    var containsNonReimbursable = hasNonReimbursableTransactions(report.reportID);
    var _g = getMoneyRequestSpendBreakdown(report), totalAmount = _g.totalDisplaySpend, reimbursableSpend = _g.reimbursableSpend;
    var parentReport = getParentReport(report);
    var policyName = getPolicyName({ report: parentReport !== null && parentReport !== void 0 ? parentReport : report, policy: policy });
    var payerName = isExpenseReport(report) ? policyName : getDisplayNameForParticipant({ accountID: report.managerID, shouldUseShortForm: !isPreviewMessageForParentChatReport });
    var formattedAmount = (0, CurrencyUtils_1.convertToDisplayString)(totalAmount, report.currency);
    if (isReportApproved({ report: report }) && isPaidGroupPolicy(report)) {
        return (0, Localize_1.translateLocal)('iou.managerApprovedAmount', {
            manager: payerName !== null && payerName !== void 0 ? payerName : '',
            amount: formattedAmount,
        });
    }
    var linkedTransaction;
    if (!(0, EmptyObject_1.isEmptyObject)(iouReportAction) && shouldConsiderScanningReceiptOrPendingRoute && iouReportAction && (0, ReportActionsUtils_1.isMoneyRequestAction)(iouReportAction)) {
        linkedTransaction = getLinkedTransaction(iouReportAction);
    }
    if (!(0, EmptyObject_1.isEmptyObject)(linkedTransaction) && (0, TransactionUtils_1.isScanning)(linkedTransaction)) {
        return (0, Localize_1.translateLocal)('iou.receiptScanning', { count: numberOfScanningReceipts });
    }
    if (!(0, EmptyObject_1.isEmptyObject)(linkedTransaction) && (0, TransactionUtils_1.isFetchingWaypointsFromServer)(linkedTransaction) && !(0, TransactionUtils_1.getAmount)(linkedTransaction)) {
        return (0, Localize_1.translateLocal)('iou.fieldPending');
    }
    var originalMessage = !(0, EmptyObject_1.isEmptyObject)(iouReportAction) && (0, ReportActionsUtils_1.isMoneyRequestAction)(iouReportAction) ? (0, ReportActionsUtils_1.getOriginalMessage)(iouReportAction) : undefined;
    // Show Paid preview message if it's settled or if the amount is paid & stuck at receivers end for only chat reports.
    if (isSettled(report.reportID) || (report.isWaitingOnBankAccount && isPreviewMessageForParentChatReport)) {
        var formattedReimbursableAmount = (0, CurrencyUtils_1.convertToDisplayString)(reimbursableSpend, report.currency);
        // A settled report preview message can come in three formats "paid ... elsewhere" or "paid ... with Expensify"
        var translatePhraseKey = 'iou.paidElsewhere';
        if (isPreviewMessageForParentChatReport) {
            translatePhraseKey = 'iou.payerPaidAmount';
        }
        else if ([CONST_1.default.IOU.PAYMENT_TYPE.VBBA, CONST_1.default.IOU.PAYMENT_TYPE.EXPENSIFY].some(function (paymentType) { return paymentType === (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.paymentType); }) ||
            !!reportActionMessage.match(/ (with Expensify|using Expensify)$/) ||
            report.isWaitingOnBankAccount) {
            translatePhraseKey = 'iou.paidWithExpensify';
            if (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.automaticAction) {
                translatePhraseKey = 'iou.automaticallyPaidWithExpensify';
            }
        }
        var actualPayerName = report.managerID === currentUserAccountID ? '' : getDisplayNameForParticipant({ accountID: report.managerID, shouldUseShortForm: true });
        actualPayerName = actualPayerName && isForListPreview && !isPreviewMessageForParentChatReport ? "".concat(actualPayerName, ":") : actualPayerName;
        var payerDisplayName = isPreviewMessageForParentChatReport ? payerName : actualPayerName;
        return (0, Localize_1.translateLocal)(translatePhraseKey, { amount: formattedReimbursableAmount, payer: payerDisplayName !== null && payerDisplayName !== void 0 ? payerDisplayName : '' });
    }
    if (report.isWaitingOnBankAccount) {
        var submitterDisplayName = (_e = getDisplayNameForParticipant({ accountID: report.ownerAccountID, shouldUseShortForm: true })) !== null && _e !== void 0 ? _e : '';
        return (0, Localize_1.translateLocal)('iou.waitingOnBankAccount', { submitterDisplayName: submitterDisplayName });
    }
    var lastActorID = iouReportAction === null || iouReportAction === void 0 ? void 0 : iouReportAction.actorAccountID;
    var amount = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.amount;
    var currency = (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.currency) ? originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.currency : report.currency;
    if (!(0, EmptyObject_1.isEmptyObject)(linkedTransaction)) {
        amount = (0, TransactionUtils_1.getAmount)(linkedTransaction, isExpenseReport(report));
        currency = (0, TransactionUtils_1.getCurrency)(linkedTransaction);
    }
    if ((0, EmptyObject_1.isEmptyObject)(linkedTransaction) && !(0, EmptyObject_1.isEmptyObject)(iouReportAction)) {
        linkedTransaction = getLinkedTransaction(iouReportAction);
    }
    var comment = !(0, EmptyObject_1.isEmptyObject)(linkedTransaction) ? (0, TransactionUtils_1.getMerchantOrDescription)(linkedTransaction) : undefined;
    if (!(0, EmptyObject_1.isEmptyObject)(originalReportAction) && (0, ReportActionsUtils_1.isReportPreviewAction)(originalReportAction) && (0, ReportActionsUtils_1.getNumberOfMoneyRequests)(originalReportAction) !== 1) {
        comment = undefined;
    }
    // if we have the amount in the originalMessage and lastActorID, we can use that to display the preview message for the latest expense
    if (amount !== undefined && lastActorID && !isPreviewMessageForParentChatReport) {
        var amountToDisplay = (0, CurrencyUtils_1.convertToDisplayString)(Math.abs(amount), currency);
        // We only want to show the actor name in the preview if it's not the current user who took the action
        var requestorName = lastActorID && lastActorID !== currentUserAccountID ? getDisplayNameForParticipant({ accountID: lastActorID, shouldUseShortForm: !isPreviewMessageForParentChatReport }) : '';
        return "".concat(requestorName ? "".concat(requestorName, ": ") : '').concat((0, Localize_1.translateLocal)('iou.expenseAmount', { formattedAmount: amountToDisplay, comment: comment }));
    }
    if (containsNonReimbursable) {
        return (0, Localize_1.translateLocal)('iou.payerSpentAmount', { payer: (_f = getDisplayNameForParticipant({ accountID: report.ownerAccountID })) !== null && _f !== void 0 ? _f : '', amount: formattedAmount });
    }
    return (0, Localize_1.translateLocal)('iou.payerOwesAmount', { payer: payerName !== null && payerName !== void 0 ? payerName : '', amount: formattedAmount, comment: comment });
}
/**
 * Given the updates user made to the expense, compose the originalMessage
 * object of the modified expense action.
 *
 * At the moment, we only allow changing one transaction field at a time.
 */
function getModifiedExpenseOriginalMessage(oldTransaction, transactionChanges, isFromExpenseReport, policy, updatedTransaction, allowNegative) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    if (allowNegative === void 0) { allowNegative = false; }
    var originalMessage = {};
    // Remark: Comment field is the only one which has new/old prefixes for the keys (newComment/ oldComment),
    // all others have old/- pattern such as oldCreated/created
    if ('comment' in transactionChanges) {
        originalMessage.oldComment = (0, TransactionUtils_1.getDescription)(oldTransaction);
        originalMessage.newComment = transactionChanges === null || transactionChanges === void 0 ? void 0 : transactionChanges.comment;
    }
    if ('created' in transactionChanges) {
        originalMessage.oldCreated = (0, TransactionUtils_1.getFormattedCreated)(oldTransaction);
        originalMessage.created = transactionChanges === null || transactionChanges === void 0 ? void 0 : transactionChanges.created;
    }
    if ('merchant' in transactionChanges) {
        originalMessage.oldMerchant = (0, TransactionUtils_1.getMerchant)(oldTransaction);
        originalMessage.merchant = transactionChanges === null || transactionChanges === void 0 ? void 0 : transactionChanges.merchant;
    }
    if ('attendees' in transactionChanges) {
        originalMessage.oldAttendees = (0, TransactionUtils_1.getAttendees)(oldTransaction);
        originalMessage.newAttendees = transactionChanges === null || transactionChanges === void 0 ? void 0 : transactionChanges.attendees;
    }
    // The amount is always a combination of the currency and the number value so when one changes we need to store both
    // to match how we handle the modified expense action in oldDot
    var didAmountOrCurrencyChange = 'amount' in transactionChanges || 'currency' in transactionChanges;
    if (didAmountOrCurrencyChange) {
        originalMessage.oldAmount = (0, TransactionUtils_1.getAmount)(oldTransaction, isFromExpenseReport, false, allowNegative);
        originalMessage.amount = (_a = transactionChanges === null || transactionChanges === void 0 ? void 0 : transactionChanges.amount) !== null && _a !== void 0 ? _a : transactionChanges.oldAmount;
        originalMessage.oldCurrency = (0, TransactionUtils_1.getCurrency)(oldTransaction);
        originalMessage.currency = (_b = transactionChanges === null || transactionChanges === void 0 ? void 0 : transactionChanges.currency) !== null && _b !== void 0 ? _b : transactionChanges.oldCurrency;
    }
    if ('category' in transactionChanges) {
        originalMessage.oldCategory = (0, TransactionUtils_1.getCategory)(oldTransaction);
        originalMessage.category = transactionChanges === null || transactionChanges === void 0 ? void 0 : transactionChanges.category;
    }
    if ('tag' in transactionChanges) {
        originalMessage.oldTag = (0, TransactionUtils_1.getTag)(oldTransaction);
        originalMessage.tag = transactionChanges === null || transactionChanges === void 0 ? void 0 : transactionChanges.tag;
    }
    // We only want to display a tax rate update system message when tax rate is updated by user.
    // Tax rate can change as a result of currency update. In such cases, we want to skip displaying a system message, as discussed.
    var didTaxCodeChange = 'taxCode' in transactionChanges;
    if (didTaxCodeChange && !didAmountOrCurrencyChange) {
        originalMessage.oldTaxRate = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _c === void 0 ? void 0 : _c.taxes[(0, TransactionUtils_1.getTaxCode)(oldTransaction)]) === null || _d === void 0 ? void 0 : _d.value;
        originalMessage.taxRate = (transactionChanges === null || transactionChanges === void 0 ? void 0 : transactionChanges.taxCode) && ((_f = (_e = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _e === void 0 ? void 0 : _e.taxes[transactionChanges === null || transactionChanges === void 0 ? void 0 : transactionChanges.taxCode]) === null || _f === void 0 ? void 0 : _f.value);
    }
    // We only want to display a tax amount update system message when tax amount is updated by user.
    // Tax amount can change as a result of amount, currency or tax rate update. In such cases, we want to skip displaying a system message, as discussed.
    if ('taxAmount' in transactionChanges && !(didAmountOrCurrencyChange || didTaxCodeChange)) {
        originalMessage.oldTaxAmount = (0, TransactionUtils_1.getTaxAmount)(oldTransaction, isFromExpenseReport);
        originalMessage.taxAmount = transactionChanges === null || transactionChanges === void 0 ? void 0 : transactionChanges.taxAmount;
        originalMessage.currency = (0, TransactionUtils_1.getCurrency)(oldTransaction);
    }
    if ('billable' in transactionChanges) {
        var oldBillable = (0, TransactionUtils_1.getBillable)(oldTransaction);
        originalMessage.oldBillable = oldBillable ? (0, Localize_1.translateLocal)('common.billable').toLowerCase() : (0, Localize_1.translateLocal)('common.nonBillable').toLowerCase();
        originalMessage.billable = (transactionChanges === null || transactionChanges === void 0 ? void 0 : transactionChanges.billable) ? (0, Localize_1.translateLocal)('common.billable').toLowerCase() : (0, Localize_1.translateLocal)('common.nonBillable').toLowerCase();
    }
    if ('customUnitRateID' in transactionChanges && ((_h = (_g = updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.comment) === null || _g === void 0 ? void 0 : _g.customUnit) === null || _h === void 0 ? void 0 : _h.customUnitRateID)) {
        originalMessage.oldAmount = (0, TransactionUtils_1.getAmount)(oldTransaction, isFromExpenseReport, false, true);
        originalMessage.oldCurrency = (0, TransactionUtils_1.getCurrency)(oldTransaction);
        originalMessage.oldMerchant = (0, TransactionUtils_1.getMerchant)(oldTransaction);
        // For the originalMessage, we should use the non-negative amount, similar to what getAmount does for oldAmount
        originalMessage.amount = Math.abs((_j = updatedTransaction.modifiedAmount) !== null && _j !== void 0 ? _j : 0);
        originalMessage.currency = (_k = updatedTransaction.modifiedCurrency) !== null && _k !== void 0 ? _k : CONST_1.default.CURRENCY.USD;
        originalMessage.merchant = updatedTransaction.modifiedMerchant;
    }
    return originalMessage;
}
/**
 * Check if original message is an object and can be used as a ChangeLog type
 * @param originalMessage
 */
function isChangeLogObject(originalMessage) {
    if (originalMessage && typeof originalMessage === 'object') {
        return originalMessage;
    }
    return undefined;
}
/**
 * Build invited usernames for admin chat threads
 * @param parentReportAction
 * @param parentReportActionMessage
 */
function getAdminRoomInvitedParticipants(parentReportAction, parentReportActionMessage) {
    var _a, _b;
    if ((0, EmptyObject_1.isEmptyObject)(parentReportAction)) {
        return parentReportActionMessage || (0, Localize_1.translateLocal)('parentReportAction.deletedMessage');
    }
    if (!(0, ReportActionsUtils_1.getOriginalMessage)(parentReportAction)) {
        return parentReportActionMessage || (0, Localize_1.translateLocal)('parentReportAction.deletedMessage');
    }
    if (!(0, ReportActionsUtils_1.isPolicyChangeLogAction)(parentReportAction) && !(0, ReportActionsUtils_1.isRoomChangeLogAction)(parentReportAction)) {
        return parentReportActionMessage || (0, Localize_1.translateLocal)('parentReportAction.deletedMessage');
    }
    var originalMessage = isChangeLogObject((0, ReportActionsUtils_1.getOriginalMessage)(parentReportAction));
    var personalDetails = (0, PersonalDetailsUtils_1.getPersonalDetailsByIDs)({ accountIDs: (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.targetAccountIDs) !== null && _a !== void 0 ? _a : [], currentUserAccountID: 0 });
    var participants = personalDetails.map(function (personalDetail) {
        var name = (0, PersonalDetailsUtils_1.getEffectiveDisplayName)(personalDetail);
        if (name && (name === null || name === void 0 ? void 0 : name.length) > 0) {
            return name;
        }
        return (0, Localize_1.translateLocal)('common.hidden');
    });
    var users = participants.length > 1 ? participants.join(" ".concat((0, Localize_1.translateLocal)('common.and'), " ")) : participants.at(0);
    if (!users) {
        return parentReportActionMessage;
    }
    var actionType = parentReportAction.actionName;
    var isInviteAction = actionType === CONST_1.default.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM || actionType === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM;
    var verbKey = isInviteAction ? 'workspace.invite.invited' : 'workspace.invite.removed';
    var prepositionKey = isInviteAction ? 'workspace.invite.to' : 'workspace.invite.from';
    var verb = (0, Localize_1.translateLocal)(verbKey);
    var preposition = (0, Localize_1.translateLocal)(prepositionKey);
    var roomName = (_b = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.roomName) !== null && _b !== void 0 ? _b : '';
    return roomName ? "".concat(verb, " ").concat(users, " ").concat(preposition, " ").concat(roomName) : "".concat(verb, " ").concat(users);
}
/**
 * Get the invoice payer name based on its type:
 * - Individual - a receiver display name.
 * - Policy - a receiver policy name.
 */
function getInvoicePayerName(report, invoiceReceiverPolicy, invoiceReceiverPersonalDetail) {
    var invoiceReceiver = report === null || report === void 0 ? void 0 : report.invoiceReceiver;
    var isIndividual = (invoiceReceiver === null || invoiceReceiver === void 0 ? void 0 : invoiceReceiver.type) === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;
    if (isIndividual) {
        return (0, LocalePhoneNumber_1.formatPhoneNumber)((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(invoiceReceiverPersonalDetail !== null && invoiceReceiverPersonalDetail !== void 0 ? invoiceReceiverPersonalDetail : allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[invoiceReceiver.accountID]));
    }
    return getPolicyName({ report: report, policy: invoiceReceiverPolicy !== null && invoiceReceiverPolicy !== void 0 ? invoiceReceiverPolicy : allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(invoiceReceiver === null || invoiceReceiver === void 0 ? void 0 : invoiceReceiver.policyID)] });
}
/**
 * Parse html of reportAction into text
 */
function parseReportActionHtmlToText(reportAction, reportID, childReportID) {
    var _a, _b;
    if (!reportAction) {
        return '';
    }
    var key = "".concat(reportID, "_").concat(reportAction.reportActionID, "_").concat(reportAction.lastModified);
    var cachedText = parsedReportActionMessageCache[key];
    if (cachedText !== undefined) {
        return cachedText;
    }
    var _c = (_a = (0, ReportActionsUtils_1.getReportActionMessage)(reportAction)) !== null && _a !== void 0 ? _a : {}, html = _c.html, text = _c.text;
    if (!html) {
        return text !== null && text !== void 0 ? text : '';
    }
    var mentionReportRegex = /<mention-report reportID="?(\d+)"?(?: *\/>|><\/mention-report>)/gi;
    var matches = html.matchAll(mentionReportRegex);
    var reportIDToName = {};
    for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
        var match = matches_1[_i];
        if (match[1] !== childReportID) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            reportIDToName[match[1]] = (_b = getReportName(getReportOrDraftReport(match[1]))) !== null && _b !== void 0 ? _b : '';
        }
    }
    var mentionUserRegex = /(?:<mention-user accountID="?(\d+)"?(?: *\/>|><\/mention-user>))/gi;
    var accountIDToName = {};
    var accountIDs = Array.from(html.matchAll(mentionUserRegex), function (mention) { return Number(mention[1]); });
    var logins = (0, PersonalDetailsUtils_1.getLoginsByAccountIDs)(accountIDs);
    accountIDs.forEach(function (id, index) {
        var _a;
        var login = logins.at(index);
        var user = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[id];
        var displayName = (0, LocalePhoneNumber_1.formatPhoneNumber)(login !== null && login !== void 0 ? login : '') || (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(user);
        accountIDToName[id] = (_a = (0, PersonalDetailsUtils_1.getShortMentionIfFound)(displayName, id.toString(), currentUserPersonalDetails, login)) !== null && _a !== void 0 ? _a : '';
    });
    var textMessage = expensify_common_1.Str.removeSMSDomain(Parser_1.default.htmlToText(html, { reportIDToName: reportIDToName, accountIDToName: accountIDToName }));
    parsedReportActionMessageCache[key] = textMessage;
    return textMessage;
}
/**
 * Get the report action message for a report action.
 */
function getReportActionMessage(_a) {
    var reportAction = _a.reportAction, reportID = _a.reportID, childReportID = _a.childReportID, reports = _a.reports, personalDetails = _a.personalDetails;
    if ((0, EmptyObject_1.isEmptyObject)(reportAction)) {
        return '';
    }
    if (reportAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.HOLD) {
        return (0, Localize_1.translateLocal)('iou.heldExpense');
    }
    if (reportAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION) {
        return (0, ReportActionsUtils_1.getExportIntegrationLastMessageText)(reportAction);
    }
    if (reportAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.UNHOLD) {
        return (0, Localize_1.translateLocal)('iou.unheldExpense');
    }
    if ((0, ReportActionsUtils_1.isApprovedOrSubmittedReportAction)(reportAction) || (0, ReportActionsUtils_1.isActionOfType)(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSED)) {
        return (0, ReportActionsUtils_1.getReportActionMessageText)(reportAction);
    }
    if ((0, ReportActionsUtils_1.isReimbursementQueuedAction)(reportAction)) {
        return getReimbursementQueuedActionMessage({
            reportAction: reportAction,
            reportOrID: getReportOrDraftReport(reportID, reports),
            shouldUseShortDisplayName: false,
            reports: reports,
            personalDetails: personalDetails,
        });
    }
    if (reportAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED) {
        return (0, Localize_1.translateLocal)('receipt.scanFailed');
    }
    if ((0, ReportActionsUtils_1.isReimbursementDeQueuedOrCanceledAction)(reportAction)) {
        return getReimbursementDeQueuedOrCanceledActionMessage(reportAction, getReportOrDraftReport(reportID, reports));
    }
    return parseReportActionHtmlToText(reportAction, reportID, childReportID);
}
/**
 * Get the title for an invoice room.
 */
function getInvoicesChatName(_a) {
    var _b;
    var report = _a.report, receiverPolicy = _a.receiverPolicy, personalDetails = _a.personalDetails, policies = _a.policies;
    var invoiceReceiver = report === null || report === void 0 ? void 0 : report.invoiceReceiver;
    var isIndividual = (invoiceReceiver === null || invoiceReceiver === void 0 ? void 0 : invoiceReceiver.type) === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;
    var invoiceReceiverAccountID = isIndividual ? invoiceReceiver.accountID : CONST_1.default.DEFAULT_NUMBER_ID;
    var invoiceReceiverPolicyID = isIndividual ? undefined : invoiceReceiver === null || invoiceReceiver === void 0 ? void 0 : invoiceReceiver.policyID;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var invoiceReceiverPolicy = receiverPolicy !== null && receiverPolicy !== void 0 ? receiverPolicy : getPolicy(invoiceReceiverPolicyID);
    var isCurrentUserReceiver = (isIndividual && invoiceReceiverAccountID === currentUserAccountID) || (!isIndividual && (0, PolicyUtils_1.isPolicyAdmin)(invoiceReceiverPolicy));
    if (isCurrentUserReceiver) {
        return getPolicyName({ report: report, policies: policies });
    }
    if (isIndividual) {
        return (0, LocalePhoneNumber_1.formatPhoneNumber)((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)((_b = (personalDetails !== null && personalDetails !== void 0 ? personalDetails : allPersonalDetails)) === null || _b === void 0 ? void 0 : _b[invoiceReceiverAccountID]));
    }
    return getPolicyName({ report: report, policy: invoiceReceiverPolicy, policies: policies });
}
/**
 * Generates a report title using the names of participants, excluding the current user.
 * This function is useful in contexts such as 1:1 direct messages (DMs) or other group chats.
 * It limits to a maximum of 5 participants for the title and uses short names unless there is only one participant.
 */
var buildReportNameFromParticipantNames = function (_a) {
    var _b;
    var report = _a.report, personalDetailsData = _a.personalDetails;
    return Object.keys((_b = report === null || report === void 0 ? void 0 : report.participants) !== null && _b !== void 0 ? _b : {})
        .map(Number)
        .filter(function (id) { return id !== currentUserAccountID; })
        .slice(0, 5)
        .map(function (accountID) { return ({
        accountID: accountID,
        name: getDisplayNameForParticipant({
            accountID: accountID,
            shouldUseShortForm: true,
            personalDetailsData: personalDetailsData,
        }),
    }); })
        .filter(function (participant) { return participant.name; })
        .reduce(function (formattedNames, _a, _, array) {
        var name = _a.name, accountID = _a.accountID;
        // If there is only one participant (if it is 0 or less the function will return empty string), return their full name
        if (array.length < 2) {
            return getDisplayNameForParticipant({
                accountID: accountID,
                personalDetailsData: personalDetailsData,
            });
        }
        return formattedNames ? "".concat(formattedNames, ", ").concat(name) : name;
    }, '');
};
exports.buildReportNameFromParticipantNames = buildReportNameFromParticipantNames;
function generateReportName(report) {
    if (!report) {
        return '';
    }
    return getReportNameInternal({ report: report });
}
/**
 * Get the title for a report.
 */
function getReportName(report, policy, parentReportActionParam, personalDetails, invoiceReceiverPolicy, reportAttributes) {
    var _a;
    // Check if we can use report name in derived values - only when we have report but no other params
    var canUseDerivedValue = report && policy === undefined && parentReportActionParam === undefined && personalDetails === undefined && invoiceReceiverPolicy === undefined;
    var attributes = reportAttributes !== null && reportAttributes !== void 0 ? reportAttributes : reportAttributesDerivedValue;
    var derivedNameExists = report && !!((_a = attributes === null || attributes === void 0 ? void 0 : attributes[report.reportID]) === null || _a === void 0 ? void 0 : _a.reportName);
    if (canUseDerivedValue && derivedNameExists) {
        return attributes[report.reportID].reportName;
    }
    return getReportNameInternal({ report: report, policy: policy, parentReportActionParam: parentReportActionParam, personalDetails: personalDetails, invoiceReceiverPolicy: invoiceReceiverPolicy });
}
function getSearchReportName(props) {
    var report = props.report, policy = props.policy;
    if (isChatThread(report) && (policy === null || policy === void 0 ? void 0 : policy.name)) {
        return policy.name;
    }
    return getReportNameInternal(props);
}
function getInvoiceReportName(report, policy, invoiceReceiverPolicy) {
    var _a;
    var moneyRequestReportName = getMoneyRequestReportName({ report: report, policy: policy, invoiceReceiverPolicy: invoiceReceiverPolicy });
    var oldDotInvoiceName = (_a = report === null || report === void 0 ? void 0 : report.reportName) !== null && _a !== void 0 ? _a : moneyRequestReportName;
    return isNewDotInvoice(report === null || report === void 0 ? void 0 : report.chatReportID) ? moneyRequestReportName : oldDotInvoiceName;
}
function generateArchivedReportName(reportName) {
    return "".concat(reportName, " (").concat((0, Localize_1.translateLocal)('common.archived'), ") ");
}
function getReportNameInternal(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var report = _a.report, policy = _a.policy, parentReportActionParam = _a.parentReportActionParam, personalDetails = _a.personalDetails, invoiceReceiverPolicy = _a.invoiceReceiverPolicy, transactions = _a.transactions, reports = _a.reports, _q = _a.reportNameValuePairs, reportNameValuePairs = _q === void 0 ? allReportNameValuePair : _q, policies = _a.policies;
    var formattedName;
    var parentReportAction;
    if (parentReportActionParam) {
        parentReportAction = parentReportActionParam;
    }
    else {
        parentReportAction = isThread(report) ? (_b = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.parentReportID)]) === null || _b === void 0 ? void 0 : _b[report.parentReportActionID] : undefined;
    }
    var parentReportActionMessage = (0, ReportActionsUtils_1.getReportActionMessage)(parentReportAction);
    var isArchivedNonExpense = isArchivedNonExpenseReport(report, !!((_d = reportNameValuePairs === null || reportNameValuePairs === void 0 ? void 0 : reportNameValuePairs["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat((_c = report === null || report === void 0 ? void 0 : report.reportID) !== null && _c !== void 0 ? _c : String(CONST_1.default.DEFAULT_NUMBER_ID))]) === null || _d === void 0 ? void 0 : _d.private_isArchived));
    if ((0, ReportActionsUtils_1.isActionOfType)(parentReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED) ||
        (0, ReportActionsUtils_1.isActionOfType)(parentReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED) ||
        (0, ReportActionsUtils_1.isMarkAsClosedAction)(parentReportAction)) {
        var harvesting = !(0, ReportActionsUtils_1.isMarkAsClosedAction)(parentReportAction) ? ((_f = (_e = (0, ReportActionsUtils_1.getOriginalMessage)(parentReportAction)) === null || _e === void 0 ? void 0 : _e.harvesting) !== null && _f !== void 0 ? _f : false) : false;
        if (harvesting) {
            return (0, Localize_1.translateLocal)('iou.automaticallySubmitted');
        }
        return (0, Localize_1.translateLocal)('iou.submitted');
    }
    if ((0, ReportActionsUtils_1.isActionOfType)(parentReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.FORWARDED)) {
        var automaticAction = ((_g = (0, ReportActionsUtils_1.getOriginalMessage)(parentReportAction)) !== null && _g !== void 0 ? _g : {}).automaticAction;
        if (automaticAction) {
            return (0, Localize_1.translateLocal)('iou.automaticallyForwarded');
        }
        return (0, Localize_1.translateLocal)('iou.forwarded');
    }
    if ((parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.REJECTED) {
        return getRejectedReportMessage();
    }
    if ((parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.RETRACTED) {
        return (0, ReportActionsUtils_1.getRetractedMessage)();
    }
    if ((parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.REOPENED) {
        return (0, ReportActionsUtils_1.getReopenedMessage)();
    }
    if ((parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
        return getUpgradeWorkspaceMessage();
    }
    if ((parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
        return getDowngradeWorkspaceMessage();
    }
    if ((parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY) {
        return (0, ReportActionsUtils_1.getWorkspaceCurrencyUpdateMessage)(parentReportAction);
    }
    if ((parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD) {
        return (0, ReportActionsUtils_1.getWorkspaceUpdateFieldMessage)(parentReportAction);
    }
    if ((parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION) {
        return (0, Localize_1.translateLocal)('systemMessage.mergedWithCashTransaction');
    }
    if ((parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME) {
        return expensify_common_1.Str.htmlDecode(getWorkspaceNameUpdatedMessage(parentReportAction));
    }
    if ((parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY) {
        return (0, ReportActionsUtils_1.getWorkspaceFrequencyUpdateMessage)(parentReportAction);
    }
    if ((parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD) {
        return (0, ReportActionsUtils_1.getWorkspaceReportFieldAddMessage)(parentReportAction);
    }
    if ((parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD) {
        return (0, ReportActionsUtils_1.getWorkspaceReportFieldUpdateMessage)(parentReportAction);
    }
    if ((parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD) {
        return (0, ReportActionsUtils_1.getWorkspaceReportFieldDeleteMessage)(parentReportAction);
    }
    if ((0, ReportActionsUtils_1.isActionOfType)(parentReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT)) {
        return (0, ReportActionsUtils_1.getPolicyChangeLogMaxExpenseAmountNoReceiptMessage)(parentReportAction);
    }
    if ((0, ReportActionsUtils_1.isActionOfType)(parentReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE)) {
        return (0, ReportActionsUtils_1.getPolicyChangeLogDefaultBillableMessage)(parentReportAction);
    }
    if ((0, ReportActionsUtils_1.isActionOfType)(parentReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED)) {
        return (0, ReportActionsUtils_1.getPolicyChangeLogDefaultTitleEnforcedMessage)(parentReportAction);
    }
    if ((0, ReportActionsUtils_1.isActionOfType)(parentReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.CHANGE_POLICY)) {
        return getPolicyChangeMessage(parentReportAction);
    }
    if ((0, ReportActionsUtils_1.isMoneyRequestAction)(parentReportAction)) {
        var originalMessage = (0, ReportActionsUtils_1.getOriginalMessage)(parentReportAction);
        if ((originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY) {
            if (originalMessage.paymentType === CONST_1.default.IOU.PAYMENT_TYPE.ELSEWHERE) {
                return (0, Localize_1.translateLocal)('iou.paidElsewhere');
            }
            if (originalMessage.paymentType === CONST_1.default.IOU.PAYMENT_TYPE.VBBA || originalMessage.paymentType === CONST_1.default.IOU.PAYMENT_TYPE.EXPENSIFY) {
                if (originalMessage.automaticAction) {
                    return (0, Localize_1.translateLocal)('iou.automaticallyPaidWithExpensify');
                }
                return (0, Localize_1.translateLocal)('iou.paidWithExpensify');
            }
        }
    }
    if ((0, ReportActionsUtils_1.isActionOfType)(parentReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.APPROVED)) {
        var automaticAction = ((_h = (0, ReportActionsUtils_1.getOriginalMessage)(parentReportAction)) !== null && _h !== void 0 ? _h : {}).automaticAction;
        if (automaticAction) {
            return (0, Localize_1.translateLocal)('iou.automaticallyApproved');
        }
        return (0, Localize_1.translateLocal)('iou.approvedMessage');
    }
    if ((0, ReportActionsUtils_1.isUnapprovedAction)(parentReportAction)) {
        return (0, Localize_1.translateLocal)('iou.unapproved');
    }
    if ((0, ReportActionsUtils_1.isActionableJoinRequest)(parentReportAction)) {
        return (0, ReportActionsUtils_1.getJoinRequestMessage)(parentReportAction);
    }
    if (isTaskReport(report) && isCanceledTaskReport(report, parentReportAction)) {
        return (0, Localize_1.translateLocal)('parentReportAction.deletedTask');
    }
    if (isTaskReport(report)) {
        return Parser_1.default.htmlToText((_j = report === null || report === void 0 ? void 0 : report.reportName) !== null && _j !== void 0 ? _j : '').trim();
    }
    if ((0, ReportActionsUtils_1.isActionOfType)(parentReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
        return (0, ReportActionsUtils_1.getIntegrationSyncFailedMessage)(parentReportAction, report === null || report === void 0 ? void 0 : report.policyID);
    }
    if ((0, ReportActionsUtils_1.isActionOfType)(parentReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
        return (0, ReportActionsUtils_1.getTravelUpdateMessage)(parentReportAction);
    }
    if (isChatThread(report)) {
        if (!(0, EmptyObject_1.isEmptyObject)(parentReportAction) && (0, ReportActionsUtils_1.isTransactionThread)(parentReportAction)) {
            formattedName = getTransactionReportName({ reportAction: parentReportAction, transactions: transactions, reports: reports });
            // This will get removed as part of https://github.com/Expensify/App/issues/59961
            // eslint-disable-next-line deprecation/deprecation
            if (isArchivedNonExpense) {
                formattedName = generateArchivedReportName(formattedName);
            }
            return formatReportLastMessageText(formattedName);
        }
        if (!(0, EmptyObject_1.isEmptyObject)(parentReportAction) && (0, ReportActionsUtils_1.isOldDotReportAction)(parentReportAction)) {
            return (0, ReportActionsUtils_1.getMessageOfOldDotReportAction)(parentReportAction);
        }
        if ((0, ReportActionsUtils_1.isRenamedAction)(parentReportAction)) {
            return (0, ReportActionsUtils_1.getRenamedAction)(parentReportAction, isExpenseReport(getReport(report.parentReportID, allReports)));
        }
        if (parentReportActionMessage === null || parentReportActionMessage === void 0 ? void 0 : parentReportActionMessage.isDeletedParentAction) {
            return (0, Localize_1.translateLocal)('parentReportAction.deletedMessage');
        }
        if ((parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES) {
            return (0, Localize_1.translateLocal)('violations.resolvedDuplicates');
        }
        var isAttachment = (0, ReportActionsUtils_1.isReportActionAttachment)(!(0, EmptyObject_1.isEmptyObject)(parentReportAction) ? parentReportAction : undefined);
        var reportActionMessage = getReportActionMessage({
            reportAction: parentReportAction,
            reportID: report === null || report === void 0 ? void 0 : report.parentReportID,
            childReportID: report === null || report === void 0 ? void 0 : report.reportID,
            reports: reports,
            personalDetails: personalDetails,
        }).replace(/(\n+|\r\n|\n|\r)/gm, ' ');
        if (isAttachment && reportActionMessage) {
            return "[".concat((0, Localize_1.translateLocal)('common.attachment'), "]");
        }
        if (((_k = parentReportActionMessage === null || parentReportActionMessage === void 0 ? void 0 : parentReportActionMessage.moderationDecision) === null || _k === void 0 ? void 0 : _k.decision) === CONST_1.default.MODERATION.MODERATOR_DECISION_PENDING_HIDE ||
            ((_l = parentReportActionMessage === null || parentReportActionMessage === void 0 ? void 0 : parentReportActionMessage.moderationDecision) === null || _l === void 0 ? void 0 : _l.decision) === CONST_1.default.MODERATION.MODERATOR_DECISION_HIDDEN ||
            ((_m = parentReportActionMessage === null || parentReportActionMessage === void 0 ? void 0 : parentReportActionMessage.moderationDecision) === null || _m === void 0 ? void 0 : _m.decision) === CONST_1.default.MODERATION.MODERATOR_DECISION_PENDING_REMOVE) {
            return (0, Localize_1.translateLocal)('parentReportAction.hiddenMessage');
        }
        if (isAdminRoom(report) || isUserCreatedPolicyRoom(report)) {
            return getAdminRoomInvitedParticipants(parentReportAction, reportActionMessage);
        }
        // This will get removed as part of https://github.com/Expensify/App/issues/59961
        // eslint-disable-next-line deprecation/deprecation
        if (reportActionMessage && isArchivedNonExpense) {
            return generateArchivedReportName(reportActionMessage);
        }
        if (!(0, EmptyObject_1.isEmptyObject)(parentReportAction) && (0, ReportActionsUtils_1.isModifiedExpenseAction)(parentReportAction)) {
            var modifiedMessage = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report === null || report === void 0 ? void 0 : report.reportID, reportAction: parentReportAction, searchReports: reports });
            return formatReportLastMessageText(modifiedMessage);
        }
        if (isTripRoom(report) && (report === null || report === void 0 ? void 0 : report.reportName) !== CONST_1.default.REPORT.DEFAULT_REPORT_NAME) {
            return (_o = report === null || report === void 0 ? void 0 : report.reportName) !== null && _o !== void 0 ? _o : '';
        }
        if ((0, ReportActionsUtils_1.isCardIssuedAction)(parentReportAction)) {
            return (0, ReportActionsUtils_1.getCardIssuedMessage)({ reportAction: parentReportAction });
        }
        return reportActionMessage;
    }
    if (isClosedExpenseReportWithNoExpenses(report, transactions)) {
        return (0, Localize_1.translateLocal)('parentReportAction.deletedReport');
    }
    if (isGroupChat(report)) {
        return (_p = getGroupChatName(undefined, true, report)) !== null && _p !== void 0 ? _p : '';
    }
    if (isChatRoom(report)) {
        formattedName = report === null || report === void 0 ? void 0 : report.reportName;
    }
    if (isPolicyExpenseChat(report)) {
        formattedName = getPolicyExpenseChatName({ report: report, policy: policy, personalDetailsList: personalDetails, reports: reports });
    }
    if (isMoneyRequestReport(report)) {
        formattedName = getMoneyRequestReportName({ report: report, policy: policy });
    }
    if (isInvoiceReport(report)) {
        formattedName = getInvoiceReportName(report, policy, invoiceReceiverPolicy);
    }
    if (isInvoiceRoom(report)) {
        formattedName = getInvoicesChatName({ report: report, receiverPolicy: invoiceReceiverPolicy, personalDetails: personalDetails, policies: policies });
    }
    if (isSelfDM(report)) {
        formattedName = getDisplayNameForParticipant({ accountID: currentUserAccountID, shouldAddCurrentUserPostfix: true, personalDetailsData: personalDetails });
    }
    if (formattedName) {
        return formatReportLastMessageText(isArchivedNonExpense ? generateArchivedReportName(formattedName) : formattedName);
    }
    // Not a room or PolicyExpenseChat, generate title from first 5 other participants
    formattedName = buildReportNameFromParticipantNames({ report: report, personalDetails: personalDetails });
    return isArchivedNonExpense ? generateArchivedReportName(formattedName) : formattedName;
}
/**
 * Get the payee name given a report.
 */
function getPayeeName(report) {
    var _a;
    if ((0, EmptyObject_1.isEmptyObject)(report)) {
        return undefined;
    }
    var participantsWithoutCurrentUser = Object.keys((_a = report === null || report === void 0 ? void 0 : report.participants) !== null && _a !== void 0 ? _a : {})
        .map(Number)
        .filter(function (accountID) { return accountID !== currentUserAccountID; });
    if (participantsWithoutCurrentUser.length === 0) {
        return undefined;
    }
    return getDisplayNameForParticipant({ accountID: participantsWithoutCurrentUser.at(0), shouldUseShortForm: true });
}
function getReportSubtitlePrefix(report) {
    if ((!isChatRoom(report) && !isPolicyExpenseChat(report)) || isThread(report)) {
        return '';
    }
    var filteredPolicies = Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).filter(function (policy) { return (0, PolicyUtils_1.shouldShowPolicy)(policy, false, currentUserEmail); });
    if (filteredPolicies.length < 2) {
        return '';
    }
    var policyName = getPolicyName({ report: report, returnEmptyIfNotFound: true });
    if (!policyName) {
        return '';
    }
    return "".concat(policyName, " ").concat(CONST_1.default.DOT_SEPARATOR, " ");
}
/**
 * Get either the policyName or domainName the chat is tied to
 */
function getChatRoomSubtitle(report, config) {
    var _a, _b, _c, _d;
    if (config === void 0) { config = { isCreateExpenseFlow: false }; }
    if (isChatThread(report)) {
        return '';
    }
    if (isSelfDM(report)) {
        return (0, Localize_1.translateLocal)('reportActionsView.yourSpace');
    }
    if (isInvoiceRoom(report)) {
        return (0, Localize_1.translateLocal)('workspace.common.invoices');
    }
    if (isConciergeChatReport(report)) {
        return (0, Localize_1.translateLocal)('reportActionsView.conciergeSupport');
    }
    if (!isDefaultRoom(report) && !isUserCreatedPolicyRoom(report) && !isPolicyExpenseChat(report)) {
        return '';
    }
    if (getChatType(report) === CONST_1.default.REPORT.CHAT_TYPE.DOMAIN_ALL) {
        // The domainAll rooms are just #domainName, so we ignore the prefix '#' to get the domainName
        return (_b = (_a = report === null || report === void 0 ? void 0 : report.reportName) === null || _a === void 0 ? void 0 : _a.substring(1)) !== null && _b !== void 0 ? _b : '';
    }
    if ((isPolicyExpenseChat(report) && !!(report === null || report === void 0 ? void 0 : report.isOwnPolicyExpenseChat)) || isExpenseReport(report)) {
        var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID)];
        var submitToAccountID = (0, PolicyUtils_1.getSubmitToAccountID)(policy, report);
        var submitsToAccountDetails = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[submitToAccountID];
        var subtitle = (_c = submitsToAccountDetails === null || submitsToAccountDetails === void 0 ? void 0 : submitsToAccountDetails.displayName) !== null && _c !== void 0 ? _c : submitsToAccountDetails === null || submitsToAccountDetails === void 0 ? void 0 : submitsToAccountDetails.login;
        if (!subtitle || !config.isCreateExpenseFlow) {
            return getPolicyName({ report: report });
        }
        return "".concat(getReportSubtitlePrefix(report)).concat((0, Localize_1.translateLocal)('iou.submitsTo', { name: subtitle !== null && subtitle !== void 0 ? subtitle : '' }));
    }
    // This will get removed as part of https://github.com/Expensify/App/issues/59961
    // eslint-disable-next-line deprecation/deprecation
    if (isArchivedReport(getReportNameValuePairs(report === null || report === void 0 ? void 0 : report.reportID))) {
        return (_d = report === null || report === void 0 ? void 0 : report.oldPolicyName) !== null && _d !== void 0 ? _d : '';
    }
    return getPolicyName({ report: report });
}
/**
 * Get pending members for reports
 */
function getPendingChatMembers(accountIDs, previousPendingChatMembers, pendingAction) {
    var pendingChatMembers = accountIDs.map(function (accountID) { return ({ accountID: accountID.toString(), pendingAction: pendingAction }); });
    return __spreadArray(__spreadArray([], previousPendingChatMembers, true), pendingChatMembers, true);
}
/**
 * Gets the parent navigation subtitle for the report
 */
function getParentNavigationSubtitle(report, invoiceReceiverPolicy) {
    var _a;
    var parentReport = getParentReport(report);
    if ((0, EmptyObject_1.isEmptyObject)(parentReport)) {
        return {};
    }
    if (isInvoiceReport(report) || isInvoiceRoom(parentReport)) {
        var reportName = "".concat(getPolicyName({ report: parentReport }), " & ").concat(getInvoicePayerName(parentReport, invoiceReceiverPolicy));
        // This will get removed as part of https://github.com/Expensify/App/issues/59961
        // eslint-disable-next-line deprecation/deprecation
        if (isArchivedNonExpenseReport(parentReport, !!((_a = getReportNameValuePairs(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID)) === null || _a === void 0 ? void 0 : _a.private_isArchived))) {
            reportName += " (".concat((0, Localize_1.translateLocal)('common.archived'), ")");
        }
        return {
            reportName: reportName,
        };
    }
    return {
        reportName: getReportName(parentReport),
        workspaceName: getPolicyName({ report: parentReport, returnEmptyIfNotFound: true }),
    };
}
/**
 * Navigate to the details page of a given report
 */
function navigateToDetailsPage(report, backTo, shouldUseActiveRoute) {
    var isSelfDMReport = isSelfDM(report);
    var isOneOnOneChatReport = isOneOnOneChat(report);
    var participantAccountID = getParticipantsAccountIDsForDisplay(report);
    if (isSelfDMReport || isOneOnOneChatReport) {
        Navigation_1.default.navigate(ROUTES_1.default.PROFILE.getRoute(participantAccountID.at(0), isSelfDMReport || shouldUseActiveRoute ? Navigation_1.default.getActiveRoute() : backTo));
        return;
    }
    if (report === null || report === void 0 ? void 0 : report.reportID) {
        Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(report === null || report === void 0 ? void 0 : report.reportID, backTo));
    }
}
/**
 * Go back to the details page of a given report
 */
function goBackToDetailsPage(report, backTo, shouldGoBackToDetailsPage) {
    if (shouldGoBackToDetailsPage === void 0) { shouldGoBackToDetailsPage = false; }
    var isOneOnOneChatReport = isOneOnOneChat(report);
    var participantAccountID = getParticipantsAccountIDsForDisplay(report);
    if (isOneOnOneChatReport) {
        Navigation_1.default.goBack(ROUTES_1.default.PROFILE.getRoute(participantAccountID.at(0), backTo));
        return;
    }
    if (report === null || report === void 0 ? void 0 : report.reportID) {
        if (shouldGoBackToDetailsPage) {
            Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
        }
        else {
            Navigation_1.default.goBack(ROUTES_1.default.REPORT_SETTINGS.getRoute(report.reportID, backTo));
        }
    }
    else {
        Log_1.default.warn('Missing reportID during navigation back to the details page');
    }
}
function navigateBackOnDeleteTransaction(backRoute, isFromRHP) {
    var _a;
    if (!backRoute) {
        return;
    }
    var rootState = (_a = Navigation_1.navigationRef.current) === null || _a === void 0 ? void 0 : _a.getRootState();
    var lastFullScreenRoute = rootState === null || rootState === void 0 ? void 0 : rootState.routes.findLast(function (route) { return (0, isNavigatorName_1.isFullScreenName)(route.name); });
    if ((lastFullScreenRoute === null || lastFullScreenRoute === void 0 ? void 0 : lastFullScreenRoute.name) === NAVIGATORS_1.default.SEARCH_FULLSCREEN_NAVIGATOR) {
        Navigation_1.default.dismissModal();
        return;
    }
    if (isFromRHP) {
        Navigation_1.default.dismissModal();
    }
    Navigation_1.default.isNavigationReady().then(function () {
        Navigation_1.default.goBack(backRoute);
    });
}
/**
 * Go back to the previous page from the edit private page of a given report
 */
function goBackFromPrivateNotes(report, accountID, backTo) {
    var _a, _b, _c;
    if ((0, isEmpty_1.default)(report) || !accountID) {
        return;
    }
    var currentUserPrivateNote = (_c = (_b = (_a = report.privateNotes) === null || _a === void 0 ? void 0 : _a[accountID]) === null || _b === void 0 ? void 0 : _b.note) !== null && _c !== void 0 ? _c : '';
    if ((0, isEmpty_1.default)(currentUserPrivateNote)) {
        var participantAccountIDs = getParticipantsAccountIDsForDisplay(report);
        if (isOneOnOneChat(report)) {
            Navigation_1.default.goBack(ROUTES_1.default.PROFILE.getRoute(participantAccountIDs.at(0), backTo));
            return;
        }
        if (report === null || report === void 0 ? void 0 : report.reportID) {
            Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(report === null || report === void 0 ? void 0 : report.reportID, backTo));
            return;
        }
    }
    Navigation_1.default.goBack(ROUTES_1.default.PRIVATE_NOTES_LIST.getRoute(report.reportID, backTo));
}
function navigateOnDeleteExpense(backToRoute) {
    var rootState = Navigation_1.navigationRef.getRootState();
    var focusedRoute = (0, native_1.findFocusedRoute)(rootState);
    if ((focusedRoute === null || focusedRoute === void 0 ? void 0 : focusedRoute.params) && 'backTo' in focusedRoute.params) {
        Navigation_1.default.goBack(focusedRoute.params.backTo);
        return;
    }
    Navigation_1.default.goBack(backToRoute);
}
/**
 * Generate a random reportID up to 53 bits aka 9,007,199,254,740,991 (Number.MAX_SAFE_INTEGER).
 * There were approximately 98,000,000 reports with sequential IDs generated before we started using this approach, those make up roughly one billionth of the space for these numbers,
 * so we live with the 1 in a billion chance of a collision with an older ID until we can switch to 64-bit IDs.
 *
 * In a test of 500M reports (28 years of reports at our current max rate) we got 20-40 collisions meaning that
 * this is more than random enough for our needs.
 */
function generateReportID() {
    return (Math.floor(Math.random() * Math.pow(2, 21)) * Math.pow(2, 32) + Math.floor(Math.random() * Math.pow(2, 32))).toString();
}
function hasReportNameError(report) {
    var _a;
    return !(0, EmptyObject_1.isEmptyObject)((_a = report === null || report === void 0 ? void 0 : report.errorFields) === null || _a === void 0 ? void 0 : _a.reportName);
}
/**
 * Adds a domain to a short mention, converting it into a full mention with email or SMS domain.
 * @param mention The user mention to be converted.
 * @returns The converted mention as a full mention string or undefined if conversion is not applicable.
 */
function addDomainToShortMention(mention) {
    if (!expensify_common_1.Str.isValidEmail(mention) && currentUserPrivateDomain) {
        var mentionWithEmailDomain = "".concat(mention, "@").concat(currentUserPrivateDomain);
        if (allPersonalDetailLogins.includes(mentionWithEmailDomain)) {
            return mentionWithEmailDomain;
        }
    }
    if (expensify_common_1.Str.isValidE164Phone(mention)) {
        var mentionWithSmsDomain = (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)(mention);
        if (allPersonalDetailLogins.includes(mentionWithSmsDomain)) {
            return mentionWithSmsDomain;
        }
    }
    return undefined;
}
/**
 * Replaces all valid short mention found in a text to a full mention
 *
 * Example:
 * "Hello \@example -> Hello \@example\@expensify.com"
 */
function completeShortMention(text) {
    return text.replace(CONST_1.default.REGEX.SHORT_MENTION, function (match) {
        if (!expensify_common_1.Str.isValidMention(match)) {
            return match;
        }
        var mention = match.substring(1);
        var mentionWithDomain = addDomainToShortMention(mention);
        return mentionWithDomain ? "@".concat(mentionWithDomain) : match;
    });
}
/**
 * For comments shorter than or equal to 10k chars, convert the comment from MD into HTML because that's how it is stored in the database
 * For longer comments, skip parsing, but still escape the text, and display plaintext for performance reasons. It takes over 40s to parse a 100k long string!!
 */
function getParsedComment(text, parsingDetails, mediaAttributes, disabledRules) {
    var _a;
    var isGroupPolicyReport = false;
    if (parsingDetails === null || parsingDetails === void 0 ? void 0 : parsingDetails.reportID) {
        var currentReport = getReportOrDraftReport(parsingDetails === null || parsingDetails === void 0 ? void 0 : parsingDetails.reportID);
        isGroupPolicyReport = isReportInGroupPolicy(currentReport);
    }
    if (parsingDetails === null || parsingDetails === void 0 ? void 0 : parsingDetails.policyID) {
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line deprecation/deprecation
        var policyType = (_a = getPolicy(parsingDetails === null || parsingDetails === void 0 ? void 0 : parsingDetails.policyID)) === null || _a === void 0 ? void 0 : _a.type;
        if (policyType) {
            isGroupPolicyReport = isGroupPolicy(policyType);
        }
    }
    var textWithMention = completeShortMention(text);
    var rules = disabledRules !== null && disabledRules !== void 0 ? disabledRules : [];
    return text.length <= CONST_1.default.MAX_MARKUP_LENGTH
        ? Parser_1.default.replace(textWithMention, {
            shouldEscapeText: parsingDetails === null || parsingDetails === void 0 ? void 0 : parsingDetails.shouldEscapeText,
            disabledRules: isGroupPolicyReport ? __spreadArray([], rules, true) : __spreadArray(['reportMentions'], rules, true),
            extras: { mediaAttributeCache: mediaAttributes },
        })
        : (0, escape_1.default)(text);
}
function getUploadingAttachmentHtml(file) {
    var _a, _b;
    if (!file || typeof file.uri !== 'string') {
        return '';
    }
    var dataAttributes = [
        "".concat(CONST_1.default.ATTACHMENT_OPTIMISTIC_SOURCE_ATTRIBUTE, "=\"").concat(file.uri, "\""),
        "".concat(CONST_1.default.ATTACHMENT_SOURCE_ATTRIBUTE, "=\"").concat(file.uri, "\""),
        "".concat(CONST_1.default.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE, "=\"").concat(file.name, "\""),
        'width' in file && "".concat(CONST_1.default.ATTACHMENT_THUMBNAIL_WIDTH_ATTRIBUTE, "=\"").concat(file.width, "\""),
        'height' in file && "".concat(CONST_1.default.ATTACHMENT_THUMBNAIL_HEIGHT_ATTRIBUTE, "=\"").concat(file.height, "\""),
    ]
        .filter(function (x) { return !!x; })
        .join(' ');
    // file.type is a known mime type like image/png, image/jpeg, video/mp4 etc.
    if ((_a = file.type) === null || _a === void 0 ? void 0 : _a.startsWith('image')) {
        return "<img src=\"".concat(file.uri, "\" alt=\"").concat(file.name, "\" ").concat(dataAttributes, " />");
    }
    if ((_b = file.type) === null || _b === void 0 ? void 0 : _b.startsWith('video')) {
        return "<video src=\"".concat(file.uri, "\" ").concat(dataAttributes, ">").concat(file.name, "</video>");
    }
    // For all other types, we present a generic download link
    return "<a href=\"".concat(file.uri, "\" ").concat(dataAttributes, ">").concat(file.name, "</a>");
}
function getReportDescription(report) {
    var _a, _b, _c;
    if (!(report === null || report === void 0 ? void 0 : report.description)) {
        return '';
    }
    try {
        var reportDescription = report === null || report === void 0 ? void 0 : report.description;
        var objectDescription = JSON.parse(reportDescription);
        return (_b = (_a = objectDescription.html) !== null && _a !== void 0 ? _a : reportDescription) !== null && _b !== void 0 ? _b : '';
    }
    catch (error) {
        return (_c = report === null || report === void 0 ? void 0 : report.description) !== null && _c !== void 0 ? _c : '';
    }
}
function getPolicyDescriptionText(policy) {
    if (!(policy === null || policy === void 0 ? void 0 : policy.description)) {
        return '';
    }
    return Parser_1.default.htmlToText(policy.description);
}
function buildOptimisticAddCommentReportAction(text, file, actorAccountID, createdOffset, shouldEscapeText, reportID, reportActionID) {
    var _a, _b, _c, _d;
    if (createdOffset === void 0) { createdOffset = 0; }
    if (reportActionID === void 0) { reportActionID = (0, NumberUtils_1.rand64)(); }
    var commentText = getParsedComment(text !== null && text !== void 0 ? text : '', { shouldEscapeText: shouldEscapeText, reportID: reportID });
    var attachmentHtml = getUploadingAttachmentHtml(file);
    var htmlForNewComment = "".concat(commentText).concat(commentText && attachmentHtml ? '<br /><br />' : '').concat(attachmentHtml);
    var textForNewComment = Parser_1.default.htmlToText(htmlForNewComment);
    var isAttachmentOnly = file && !text;
    var isAttachmentWithText = !!text && file !== undefined;
    var accountID = (_a = actorAccountID !== null && actorAccountID !== void 0 ? actorAccountID : currentUserAccountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
    var delegateAccountDetails = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(delegateEmail);
    // Remove HTML from text when applying optimistic offline comment
    return {
        commentText: commentText,
        reportAction: {
            reportActionID: reportActionID,
            reportID: reportID,
            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            actorAccountID: accountID,
            person: [
                {
                    style: 'strong',
                    text: (_c = (_b = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID]) === null || _b === void 0 ? void 0 : _b.displayName) !== null && _c !== void 0 ? _c : currentUserEmail,
                    type: 'TEXT',
                },
            ],
            automatic: false,
            avatar: (_d = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID]) === null || _d === void 0 ? void 0 : _d.avatar,
            created: DateUtils_1.default.getDBTimeWithSkew(Date.now() + createdOffset),
            message: [
                {
                    translationKey: isAttachmentOnly ? CONST_1.default.TRANSLATION_KEYS.ATTACHMENT : '',
                    type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
                    html: htmlForNewComment,
                    text: textForNewComment,
                },
            ],
            originalMessage: {
                html: htmlForNewComment,
                whisperedTo: [],
            },
            isFirstItem: false,
            isAttachmentOnly: isAttachmentOnly,
            isAttachmentWithText: isAttachmentWithText,
            pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            shouldShow: true,
            isOptimisticAction: true,
            delegateAccountID: delegateAccountDetails === null || delegateAccountDetails === void 0 ? void 0 : delegateAccountDetails.accountID,
        },
    };
}
/**
 * update optimistic parent reportAction when a comment is added or remove in the child report
 * @param parentReportAction - Parent report action of the child report
 * @param lastVisibleActionCreated - Last visible action created of the child report
 * @param type - The type of action in the child report
 */
function updateOptimisticParentReportAction(parentReportAction, lastVisibleActionCreated, type) {
    var _a, _b, _c;
    var childVisibleActionCount = (_a = parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.childVisibleActionCount) !== null && _a !== void 0 ? _a : 0;
    var childCommenterCount = (_b = parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.childCommenterCount) !== null && _b !== void 0 ? _b : 0;
    var childOldestFourAccountIDs = parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.childOldestFourAccountIDs;
    if (type === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        childVisibleActionCount += 1;
        var oldestFourAccountIDs = childOldestFourAccountIDs ? childOldestFourAccountIDs.split(',') : [];
        if (oldestFourAccountIDs.length < 4) {
            var index = oldestFourAccountIDs.findIndex(function (accountID) { return accountID === (currentUserAccountID === null || currentUserAccountID === void 0 ? void 0 : currentUserAccountID.toString()); });
            if (index === -1) {
                childCommenterCount += 1;
                oldestFourAccountIDs.push((_c = currentUserAccountID === null || currentUserAccountID === void 0 ? void 0 : currentUserAccountID.toString()) !== null && _c !== void 0 ? _c : '');
            }
        }
        childOldestFourAccountIDs = oldestFourAccountIDs.join(',');
    }
    else if (type === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
        if (childVisibleActionCount > 0) {
            childVisibleActionCount -= 1;
        }
        if (childVisibleActionCount === 0) {
            childCommenterCount = 0;
            childOldestFourAccountIDs = '';
        }
    }
    return {
        childVisibleActionCount: childVisibleActionCount,
        childCommenterCount: childCommenterCount,
        childLastVisibleActionCreated: lastVisibleActionCreated,
        childOldestFourAccountIDs: childOldestFourAccountIDs,
    };
}
/**
 * Builds an optimistic reportAction for the parent report when a task is created
 * @param taskReportID - Report ID of the task
 * @param taskTitle - Title of the task
 * @param taskAssigneeAccountID - AccountID of the person assigned to the task
 * @param text - Text of the comment
 * @param parentReportID - Report ID of the parent report
 * @param createdOffset - The offset for task's created time that created via a loop
 */
function buildOptimisticTaskCommentReportAction(taskReportID, taskTitle, taskAssigneeAccountID, text, parentReportID, actorAccountID, createdOffset) {
    var _a;
    if (createdOffset === void 0) { createdOffset = 0; }
    var reportAction = buildOptimisticAddCommentReportAction(text, undefined, undefined, createdOffset, undefined, taskReportID);
    if (Array.isArray(reportAction.reportAction.message)) {
        var message = reportAction.reportAction.message.at(0);
        if (message) {
            message.taskReportID = taskReportID;
        }
    }
    else if (!Array.isArray(reportAction.reportAction.message) && reportAction.reportAction.message) {
        reportAction.reportAction.message.taskReportID = taskReportID;
    }
    // These parameters are not saved on the reportAction, but are used to display the task in the UI
    // Added when we fetch the reportActions on a report
    // eslint-disable-next-line
    reportAction.reportAction.originalMessage = {
        html: (0, ReportActionsUtils_1.getReportActionHtml)(reportAction.reportAction),
        taskReportID: (_a = (0, ReportActionsUtils_1.getReportActionMessage)(reportAction.reportAction)) === null || _a === void 0 ? void 0 : _a.taskReportID,
        whisperedTo: [],
    };
    reportAction.reportAction.childReportID = taskReportID;
    reportAction.reportAction.parentReportID = parentReportID;
    reportAction.reportAction.childType = CONST_1.default.REPORT.TYPE.TASK;
    reportAction.reportAction.childReportName = taskTitle;
    reportAction.reportAction.childManagerAccountID = taskAssigneeAccountID;
    reportAction.reportAction.childStatusNum = CONST_1.default.REPORT.STATUS_NUM.OPEN;
    reportAction.reportAction.childStateNum = CONST_1.default.REPORT.STATE_NUM.OPEN;
    if (actorAccountID) {
        reportAction.reportAction.actorAccountID = actorAccountID;
    }
    return reportAction;
}
function buildOptimisticSelfDMReport(created) {
    var _a;
    return {
        reportID: generateReportID(),
        participants: (_a = {},
            _a[currentUserAccountID !== null && currentUserAccountID !== void 0 ? currentUserAccountID : CONST_1.default.DEFAULT_NUMBER_ID] = {
                notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.MUTE,
            },
            _a),
        type: CONST_1.default.REPORT.TYPE.CHAT,
        chatType: CONST_1.default.REPORT.CHAT_TYPE.SELF_DM,
        isOwnPolicyExpenseChat: false,
        lastActorAccountID: 0,
        lastMessageHtml: '',
        lastMessageText: undefined,
        lastReadTime: created,
        lastVisibleActionCreated: created,
        ownerAccountID: currentUserAccountID,
        reportName: '',
        stateNum: 0,
        statusNum: 0,
        writeCapability: CONST_1.default.REPORT.WRITE_CAPABILITIES.ALL,
    };
}
/**
 * Builds an optimistic IOU report with a randomly generated reportID
 *
 * @param payeeAccountID - AccountID of the person generating the IOU.
 * @param payerAccountID - AccountID of the other person participating in the IOU.
 * @param total - IOU amount in the smallest unit of the currency.
 * @param chatReportID - Report ID of the chat where the IOU is.
 * @param currency - IOU currency.
 * @param isSendingMoney - If we pay someone the IOU should be created as settled
 * @param parentReportActionID - The parent report action ID of the IOU report
 * @param optimisticIOUReportID - Optimistic IOU report id
 */
function buildOptimisticIOUReport(payeeAccountID, payerAccountID, total, chatReportID, currency, isSendingMoney, parentReportActionID, optimisticIOUReportID) {
    var _a;
    var _b;
    if (isSendingMoney === void 0) { isSendingMoney = false; }
    var formattedTotal = (0, CurrencyUtils_1.convertToDisplayString)(total, currency);
    var personalDetails = getPersonalDetailsForAccountID(payerAccountID);
    var payerEmail = 'login' in personalDetails ? personalDetails.login : '';
    var policyID = chatReportID ? (_b = getReport(chatReportID, allReports)) === null || _b === void 0 ? void 0 : _b.policyID : undefined;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var participants = (_a = {},
        _a[payeeAccountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN },
        _a[payerAccountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN },
        _a);
    return {
        type: CONST_1.default.REPORT.TYPE.IOU,
        chatReportID: chatReportID,
        currency: currency,
        managerID: payerAccountID,
        ownerAccountID: payeeAccountID,
        participants: participants,
        reportID: optimisticIOUReportID !== null && optimisticIOUReportID !== void 0 ? optimisticIOUReportID : generateReportID(),
        stateNum: isSendingMoney ? CONST_1.default.REPORT.STATE_NUM.APPROVED : CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
        statusNum: isSendingMoney ? CONST_1.default.REPORT.STATUS_NUM.REIMBURSED : CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
        total: total,
        unheldTotal: total,
        nonReimbursableTotal: 0,
        unheldNonReimbursableTotal: 0,
        // We don't translate reportName because the server response is always in English
        reportName: "".concat(payerEmail, " owes ").concat(formattedTotal),
        parentReportID: chatReportID,
        lastVisibleActionCreated: DateUtils_1.default.getDBTime(),
        fieldList: policy === null || policy === void 0 ? void 0 : policy.fieldList,
        parentReportActionID: parentReportActionID,
    };
}
function getHumanReadableStatus(statusNum) {
    var status = Object.keys(CONST_1.default.REPORT.STATUS_NUM).find(function (key) { return CONST_1.default.REPORT.STATUS_NUM[key] === statusNum; });
    return status ? "".concat(status.charAt(0)).concat(status.slice(1).toLowerCase()) : '';
}
/**
 * Populates the report field formula with the values from the report and policy.
 * Currently, this only supports optimistic expense reports.
 * Each formula field is either replaced with a value, or removed.
 * If after all replacements the formula is empty, the original formula is returned.
 * See {@link https://help.expensify.com/articles/expensify-classic/insights-and-custom-reporting/Custom-Templates}
 */
function populateOptimisticReportFormula(formula, report, policy) {
    var _a, _b, _c, _d;
    var createdDate = report.lastVisibleActionCreated ? new Date(report.lastVisibleActionCreated) : undefined;
    var result = formula
        // We don't translate because the server response is always in English
        .replaceAll(/\{report:type\}/gi, 'Expense Report')
        .replaceAll(/\{report:startdate\}/gi, createdDate ? (0, date_fns_1.format)(createdDate, CONST_1.default.DATE.FNS_FORMAT_STRING) : '')
        .replaceAll(/\{report:total\}/gi, report.total !== undefined ? (0, CurrencyUtils_1.convertToDisplayString)(Math.abs(report.total), report.currency).toString() : '')
        .replaceAll(/\{report:currency\}/gi, (_a = report.currency) !== null && _a !== void 0 ? _a : '')
        .replaceAll(/\{report:policyname\}/gi, (_b = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _b !== void 0 ? _b : '')
        .replaceAll(/\{report:workspacename\}/gi, (_c = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _c !== void 0 ? _c : '')
        .replaceAll(/\{report:created\}/gi, createdDate ? (0, date_fns_1.format)(createdDate, CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING) : '')
        .replaceAll(/\{report:created:yyyy-MM-dd\}/gi, createdDate ? (0, date_fns_1.format)(createdDate, CONST_1.default.DATE.FNS_FORMAT_STRING) : '')
        .replaceAll(/\{report:status\}/gi, report.statusNum !== undefined ? getHumanReadableStatus(report.statusNum) : '')
        .replaceAll(/\{user:email\}/gi, currentUserEmail !== null && currentUserEmail !== void 0 ? currentUserEmail : '')
        .replaceAll(/\{user:email\|frontPart\}/gi, (_d = (currentUserEmail ? currentUserEmail.split('@').at(0) : '')) !== null && _d !== void 0 ? _d : '')
        .replaceAll(/\{report:(.+)\}/gi, '');
    return result.trim().length ? result : formula;
}
/** Builds an optimistic invoice report with a randomly generated reportID */
function buildOptimisticInvoiceReport(chatReportID, policyID, receiverAccountID, receiverName, total, currency) {
    var _a;
    var formattedTotal = (0, CurrencyUtils_1.convertToDisplayString)(total, currency);
    var invoiceReport = {
        reportID: generateReportID(),
        chatReportID: chatReportID,
        policyID: policyID,
        type: CONST_1.default.REPORT.TYPE.INVOICE,
        ownerAccountID: currentUserAccountID,
        managerID: receiverAccountID,
        currency: currency,
        // We don't translate reportName because the server response is always in English
        reportName: "".concat(receiverName, " owes ").concat(formattedTotal),
        stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
        total: total * -1,
        participants: (_a = {},
            _a[receiverAccountID] = {
                notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
            },
            _a),
        parentReportID: chatReportID,
        lastVisibleActionCreated: DateUtils_1.default.getDBTime(),
    };
    if (currentUserAccountID) {
        invoiceReport.participants[currentUserAccountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN };
    }
    return invoiceReport;
}
/**
 * Returns the stateNum and statusNum for an expense report based on the policy settings
 * @param policy
 */
function getExpenseReportStateAndStatus(policy, isEmptyOptimisticReport) {
    if (isEmptyOptimisticReport === void 0) { isEmptyOptimisticReport = false; }
    var isASAPSubmitBetaEnabled = Permissions_1.default.isBetaEnabled(CONST_1.default.BETAS.ASAP_SUBMIT, allBetas);
    if (isASAPSubmitBetaEnabled) {
        return {
            stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
        };
    }
    var isInstantSubmitEnabledLocal = (0, PolicyUtils_1.isInstantSubmitEnabled)(policy);
    var isSubmitAndCloseLocal = (0, PolicyUtils_1.isSubmitAndClose)(policy);
    var arePaymentsDisabled = (policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) === CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
    if (isInstantSubmitEnabledLocal && arePaymentsDisabled && isSubmitAndCloseLocal && !isEmptyOptimisticReport) {
        return {
            stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED,
        };
    }
    if (isInstantSubmitEnabledLocal) {
        return {
            stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
        };
    }
    return {
        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
    };
}
/**
 * Builds an optimistic Expense report with a randomly generated reportID
 *
 * @param chatReportID - Report ID of the PolicyExpenseChat where the Expense Report is
 * @param policyID - The policy ID of the PolicyExpenseChat
 * @param payeeAccountID - AccountID of the employee (payee)
 * @param total - Amount in cents
 * @param currency
 * @param reimbursable – Whether the expense is reimbursable
 * @param parentReportActionID – The parent ReportActionID of the PolicyExpenseChat
 * @param optimisticIOUReportID – Optimistic IOU report id
 */
function buildOptimisticExpenseReport(chatReportID, policyID, payeeAccountID, total, currency, nonReimbursableTotal, parentReportActionID, optimisticIOUReportID) {
    var _a;
    var _b;
    if (nonReimbursableTotal === void 0) { nonReimbursableTotal = 0; }
    // The amount for Expense reports are stored as negative value in the database
    var storedTotal = total * -1;
    var storedNonReimbursableTotal = nonReimbursableTotal * -1;
    var report = chatReportID ? getReport(chatReportID, allReports) : undefined;
    var policyName = getPolicyName({ report: report });
    var formattedTotal = (0, CurrencyUtils_1.convertToDisplayString)(storedTotal, currency);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var _c = getExpenseReportStateAndStatus(policy), stateNum = _c.stateNum, statusNum = _c.statusNum;
    var expenseReport = {
        reportID: optimisticIOUReportID !== null && optimisticIOUReportID !== void 0 ? optimisticIOUReportID : generateReportID(),
        chatReportID: chatReportID,
        policyID: policyID,
        type: CONST_1.default.REPORT.TYPE.EXPENSE,
        ownerAccountID: payeeAccountID,
        currency: currency,
        // We don't translate reportName because the server response is always in English
        reportName: "".concat(policyName, " owes ").concat(formattedTotal),
        stateNum: stateNum,
        statusNum: statusNum,
        total: storedTotal,
        unheldTotal: storedTotal,
        nonReimbursableTotal: storedNonReimbursableTotal,
        unheldNonReimbursableTotal: storedNonReimbursableTotal,
        participants: (_a = {},
            _a[payeeAccountID] = {
                notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
            },
            _a),
        parentReportID: chatReportID,
        lastVisibleActionCreated: DateUtils_1.default.getDBTime(),
        parentReportActionID: parentReportActionID,
    };
    // Get the approver/manager for this report to properly display the optimistic data
    var submitToAccountID = (0, PolicyUtils_1.getSubmitToAccountID)(policy, expenseReport);
    if (submitToAccountID) {
        expenseReport.managerID = submitToAccountID;
    }
    var titleReportField = getTitleReportField((_b = getReportFieldsByPolicyID(policyID)) !== null && _b !== void 0 ? _b : {});
    if (!!titleReportField && isPaidGroupPolicyExpenseReport(expenseReport)) {
        expenseReport.reportName = populateOptimisticReportFormula(titleReportField.defaultValue, expenseReport, policy);
    }
    expenseReport.fieldList = policy === null || policy === void 0 ? void 0 : policy.fieldList;
    return expenseReport;
}
function buildOptimisticEmptyReport(reportID, accountID, parentReport, parentReportActionID, policy, timeOfCreation) {
    var _a;
    var _b, _c;
    var _d = getExpenseReportStateAndStatus(policy, true), stateNum = _d.stateNum, statusNum = _d.statusNum;
    var titleReportField = getTitleReportField((_b = getReportFieldsByPolicyID(policy === null || policy === void 0 ? void 0 : policy.id)) !== null && _b !== void 0 ? _b : {});
    var optimisticEmptyReport = {
        reportName: '',
        reportID: reportID,
        policyID: policy === null || policy === void 0 ? void 0 : policy.id,
        type: CONST_1.default.REPORT.TYPE.EXPENSE,
        currency: policy === null || policy === void 0 ? void 0 : policy.outputCurrency,
        ownerAccountID: accountID,
        stateNum: stateNum,
        statusNum: statusNum,
        total: 0,
        nonReimbursableTotal: 0,
        participants: {},
        lastVisibleActionCreated: timeOfCreation,
        pendingFields: { createReport: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD },
        parentReportID: parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID,
        parentReportActionID: parentReportActionID,
        chatReportID: parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID,
        managerID: (0, PolicyUtils_1.getManagerAccountID)(policy, { ownerAccountID: accountID }),
    };
    var optimisticReportName = populateOptimisticReportFormula((_c = titleReportField === null || titleReportField === void 0 ? void 0 : titleReportField.defaultValue) !== null && _c !== void 0 ? _c : CONST_1.default.POLICY.DEFAULT_REPORT_NAME_PATTERN, optimisticEmptyReport, policy);
    optimisticEmptyReport.reportName = optimisticReportName;
    optimisticEmptyReport.participants = accountID
        ? (_a = {},
            _a[accountID] = {
                notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
            },
            _a) : {};
    optimisticEmptyReport.ownerAccountID = accountID;
    return optimisticEmptyReport;
}
function getRejectedReportMessage() {
    return (0, Localize_1.translateLocal)('iou.rejectedThisReport');
}
function getUpgradeWorkspaceMessage() {
    return (0, Localize_1.translateLocal)('workspaceActions.upgradedWorkspace');
}
function getDowngradeWorkspaceMessage() {
    return (0, Localize_1.translateLocal)('workspaceActions.downgradedWorkspace');
}
function getWorkspaceNameUpdatedMessage(action) {
    var _a;
    var _b = (_a = (0, ReportActionsUtils_1.getOriginalMessage)(action)) !== null && _a !== void 0 ? _a : {}, oldName = _b.oldName, newName = _b.newName;
    var message = oldName && newName ? (0, Localize_1.translateLocal)('workspaceActions.renamedWorkspaceNameAction', { oldName: oldName, newName: newName }) : (0, ReportActionsUtils_1.getReportActionText)(action);
    return expensify_common_1.Str.htmlEncode(message);
}
function getDeletedTransactionMessage(action) {
    var _a, _b, _c, _d, _e;
    var deletedTransactionOriginalMessage = (_a = (0, ReportActionsUtils_1.getOriginalMessage)(action)) !== null && _a !== void 0 ? _a : {};
    var amount = Math.abs((_b = deletedTransactionOriginalMessage.amount) !== null && _b !== void 0 ? _b : 0);
    var currency = (_c = deletedTransactionOriginalMessage.currency) !== null && _c !== void 0 ? _c : '';
    var formattedAmount = (_d = (0, CurrencyUtils_1.convertToDisplayString)(amount, currency)) !== null && _d !== void 0 ? _d : '';
    var message = (0, Localize_1.translateLocal)('iou.deletedTransaction', {
        amount: formattedAmount,
        merchant: (_e = deletedTransactionOriginalMessage.merchant) !== null && _e !== void 0 ? _e : '',
    });
    return message;
}
function getReportDetails(reportID) {
    var _a, _b;
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    return {
        reportName: (_b = (_a = getReportName(report)) !== null && _a !== void 0 ? _a : report === null || report === void 0 ? void 0 : report.reportName) !== null && _b !== void 0 ? _b : '',
        reportUrl: "".concat(environmentURL, "/r/").concat(reportID),
    };
}
function getMovedTransactionMessage(action) {
    var _a;
    var movedTransactionOriginalMessage = (_a = (0, ReportActionsUtils_1.getOriginalMessage)(action)) !== null && _a !== void 0 ? _a : {};
    var toReportID = movedTransactionOriginalMessage.toReportID;
    var _b = getReportDetails(toReportID), reportName = _b.reportName, reportUrl = _b.reportUrl;
    var message = (0, Localize_1.translateLocal)('iou.movedTransaction', {
        reportUrl: reportUrl,
        reportName: reportName,
    });
    return message;
}
function getPolicyChangeMessage(action) {
    var _a;
    var PolicyChangeOriginalMessage = (_a = (0, ReportActionsUtils_1.getOriginalMessage)(action)) !== null && _a !== void 0 ? _a : {};
    var _b = PolicyChangeOriginalMessage, fromPolicyID = _b.fromPolicy, toPolicyID = _b.toPolicy;
    var message = (0, Localize_1.translateLocal)('report.actions.type.changeReportPolicy', {
        fromPolicyName: fromPolicyID ? (0, PolicyUtils_1.getPolicyNameByID)(fromPolicyID) : undefined,
        toPolicyName: (0, PolicyUtils_1.getPolicyNameByID)(toPolicyID),
    });
    return message;
}
/**
 * @param iouReportID - the report ID of the IOU report the action belongs to
 * @param type - IOUReportAction type. Can be oneOf(create, decline, cancel, pay, split)
 * @param total - IOU total in cents
 * @param comment - IOU comment
 * @param currency - IOU currency
 * @param paymentType - IOU paymentMethodType. Can be oneOf(Elsewhere, Expensify)
 * @param isSettlingUp - Whether we are settling up an IOU
 */
function getIOUReportActionMessage(iouReportID, type, total, comment, currency, paymentType, isSettlingUp) {
    if (paymentType === void 0) { paymentType = ''; }
    if (isSettlingUp === void 0) { isSettlingUp = false; }
    var report = getReportOrDraftReport(iouReportID);
    var amount = type === CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY && !(0, EmptyObject_1.isEmptyObject)(report)
        ? (0, CurrencyUtils_1.convertToDisplayString)(getMoneyRequestSpendBreakdown(report).totalDisplaySpend, currency)
        : (0, CurrencyUtils_1.convertToDisplayString)(total, currency);
    var paymentMethodMessage;
    switch (paymentType) {
        case CONST_1.default.IOU.PAYMENT_TYPE.VBBA:
        case CONST_1.default.IOU.PAYMENT_TYPE.EXPENSIFY:
            paymentMethodMessage = ' with Expensify';
            break;
        default:
            paymentMethodMessage = " elsewhere";
            break;
    }
    var iouMessage;
    switch (type) {
        case CONST_1.default.REPORT.ACTIONS.TYPE.APPROVED:
            iouMessage = "approved ".concat(amount);
            break;
        case CONST_1.default.REPORT.ACTIONS.TYPE.FORWARDED:
            iouMessage = "approved ".concat(amount);
            break;
        case CONST_1.default.REPORT.ACTIONS.TYPE.UNAPPROVED:
            iouMessage = "unapproved ".concat(amount);
            break;
        case CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE:
            iouMessage = "submitted ".concat(amount).concat(comment && " for ".concat(comment));
            break;
        case CONST_1.default.IOU.REPORT_ACTION_TYPE.TRACK:
            iouMessage = "tracking ".concat(amount).concat(comment && " for ".concat(comment));
            break;
        case CONST_1.default.IOU.REPORT_ACTION_TYPE.SPLIT:
            iouMessage = "split ".concat(amount).concat(comment && " for ".concat(comment));
            break;
        case CONST_1.default.IOU.REPORT_ACTION_TYPE.DELETE:
            iouMessage = "deleted the ".concat(amount, " expense").concat(comment && " for ".concat(comment));
            break;
        case CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY:
            iouMessage = isSettlingUp ? "paid ".concat(amount).concat(paymentMethodMessage) : "sent ".concat(amount).concat(comment && " for ".concat(comment)).concat(paymentMethodMessage);
            break;
        case CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED:
            iouMessage = (0, Localize_1.translateLocal)('iou.expenseAmount', { formattedAmount: amount });
            break;
        default:
            break;
    }
    return [
        {
            html: (0, escape_1.default)(iouMessage),
            text: iouMessage !== null && iouMessage !== void 0 ? iouMessage : '',
            isEdited: false,
            type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
        },
    ];
}
/**
 * Builds an optimistic IOU reportAction object
 *
 * @param type - IOUReportAction type. Can be oneOf(create, delete, pay, split).
 * @param amount - IOU amount in cents.
 * @param currency
 * @param comment - User comment for the IOU.
 * @param participants - An array with participants details.
 * @param [transactionID] - Not required if the IOUReportAction type is 'pay'
 * @param [paymentType] - Only required if the IOUReportAction type is 'pay'. Can be oneOf(elsewhere, Expensify).
 * @param [iouReportID] - Only required if the IOUReportActions type is oneOf(decline, cancel, pay). Generates a randomID as default.
 * @param [isSettlingUp] - Whether we are settling up an IOU.
 * @param [isSendMoneyFlow] - Whether this is pay someone flow
 * @param [receipt]
 * @param [isOwnPolicyExpenseChat] - Whether this is an expense report create from the current user's policy expense chat
 */
function buildOptimisticIOUReportAction(params) {
    var _a, _b;
    var type = params.type, amount = params.amount, currency = params.currency, comment = params.comment, participants = params.participants, transactionID = params.transactionID, paymentType = params.paymentType, _c = params.iouReportID, iouReportID = _c === void 0 ? '' : _c, _d = params.isSettlingUp, isSettlingUp = _d === void 0 ? false : _d, _e = params.isSendMoneyFlow, isSendMoneyFlow = _e === void 0 ? false : _e, _f = params.isOwnPolicyExpenseChat, isOwnPolicyExpenseChat = _f === void 0 ? false : _f, _g = params.created, created = _g === void 0 ? DateUtils_1.default.getDBTime() : _g, linkedExpenseReportAction = params.linkedExpenseReportAction, _h = params.isPersonalTrackingExpense, isPersonalTrackingExpense = _h === void 0 ? false : _h;
    var IOUReportID = isPersonalTrackingExpense ? undefined : iouReportID || generateReportID();
    var originalMessage = {
        amount: amount,
        comment: comment,
        currency: currency,
        IOUTransactionID: transactionID,
        IOUReportID: IOUReportID,
        type: type,
    };
    var delegateAccountDetails = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(delegateEmail);
    if (type === CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY) {
        // In pay someone flow, we store amount, comment, currency in IOUDetails when type = pay
        if (isSendMoneyFlow) {
            var keys = ['amount', 'comment', 'currency'];
            keys.forEach(function (key) {
                delete originalMessage[key];
            });
            originalMessage.IOUDetails = { amount: amount, comment: comment, currency: currency };
            originalMessage.paymentType = paymentType;
        }
        else {
            // In case of pay someone action, we dont store the comment
            // and there is no single transactionID to link the action to.
            delete originalMessage.IOUTransactionID;
            delete originalMessage.comment;
            originalMessage.paymentType = paymentType;
        }
    }
    // IOUs of type split only exist in group DMs and those don't have an iouReport so we need to delete the IOUReportID key
    if (type === CONST_1.default.IOU.REPORT_ACTION_TYPE.SPLIT) {
        delete originalMessage.IOUReportID;
    }
    if (type !== CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY) {
        // Split expense made from a policy expense chat only have the payee's accountID as the participant because the payer could be any policy admin
        if (isOwnPolicyExpenseChat && type === CONST_1.default.IOU.REPORT_ACTION_TYPE.SPLIT) {
            originalMessage.participantAccountIDs = currentUserAccountID ? [currentUserAccountID] : [];
        }
        else {
            originalMessage.participantAccountIDs = currentUserAccountID
                ? __spreadArray([
                    currentUserAccountID
                ], participants.filter(function (participant) { return participant.accountID !== currentUserAccountID; }).map(function (participant) { var _a; return (_a = participant.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID; }), true) : participants.map(function (participant) { var _a; return (_a = participant.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID; });
        }
    }
    var iouReportAction = __assign(__assign({}, linkedExpenseReportAction), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU, actorAccountID: currentUserAccountID, automatic: false, isAttachmentOnly: false, originalMessage: originalMessage, reportActionID: (0, NumberUtils_1.rand64)(), shouldShow: true, created: created, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD, delegateAccountID: delegateAccountDetails === null || delegateAccountDetails === void 0 ? void 0 : delegateAccountDetails.accountID, person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ], avatar: getCurrentUserAvatar(), message: getIOUReportActionMessage(iouReportID, type, amount, comment, currency, paymentType, isSettlingUp) });
    var managerMcTestParticipant = participants.find(function (participant) { return isSelectedManagerMcTest(participant.login); });
    if (managerMcTestParticipant) {
        return __assign(__assign({}, iouReportAction), { actorAccountID: managerMcTestParticipant.accountID, avatar: (_b = (_a = managerMcTestParticipant.icons) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.source, person: [
                {
                    style: 'strong',
                    text: getDisplayNameForParticipant(managerMcTestParticipant),
                    type: 'TEXT',
                },
            ] });
    }
    return iouReportAction;
}
/**
 * Builds an optimistic APPROVED report action with a randomly generated reportActionID.
 */
function buildOptimisticApprovedReportAction(amount, currency, expenseReportID) {
    var originalMessage = {
        amount: amount,
        currency: currency,
        expenseReportID: expenseReportID,
    };
    var delegateAccountDetails = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(delegateEmail);
    return {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.APPROVED,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        isAttachmentOnly: false,
        originalMessage: originalMessage,
        message: getIOUReportActionMessage(expenseReportID, CONST_1.default.REPORT.ACTIONS.TYPE.APPROVED, Math.abs(amount), '', currency),
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: (0, NumberUtils_1.rand64)(),
        shouldShow: true,
        created: DateUtils_1.default.getDBTime(),
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        delegateAccountID: delegateAccountDetails === null || delegateAccountDetails === void 0 ? void 0 : delegateAccountDetails.accountID,
    };
}
/**
 * Builds an optimistic APPROVED report action with a randomly generated reportActionID.
 */
function buildOptimisticUnapprovedReportAction(amount, currency, expenseReportID) {
    var delegateAccountDetails = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(delegateEmail);
    return {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.UNAPPROVED,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        isAttachmentOnly: false,
        originalMessage: {
            amount: amount,
            currency: currency,
            expenseReportID: expenseReportID,
        },
        message: getIOUReportActionMessage(expenseReportID, CONST_1.default.REPORT.ACTIONS.TYPE.UNAPPROVED, Math.abs(amount), '', currency),
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: (0, NumberUtils_1.rand64)(),
        shouldShow: true,
        created: DateUtils_1.default.getDBTime(),
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        delegateAccountID: delegateAccountDetails === null || delegateAccountDetails === void 0 ? void 0 : delegateAccountDetails.accountID,
    };
}
/**
 * Builds an optimistic MOVED report action with a randomly generated reportActionID.
 * This action is used when we move reports across workspaces.
 */
function buildOptimisticMovedReportAction(fromPolicyID, toPolicyID, newParentReportID, movedReportID, policyName, isIouReport) {
    if (isIouReport === void 0) { isIouReport = false; }
    var originalMessage = {
        fromPolicyID: fromPolicyID,
        toPolicyID: toPolicyID,
        newParentReportID: newParentReportID,
        movedReportID: movedReportID,
    };
    var movedActionMessage = [
        {
            html: isIouReport
                ? "moved this <a href='".concat(CONST_1.default.NEW_EXPENSIFY_URL, "r/").concat(movedReportID, "' target='_blank' rel='noreferrer noopener'>report</a> to the <a href='").concat(CONST_1.default.NEW_EXPENSIFY_URL, "r/").concat(newParentReportID, "' target='_blank' rel='noreferrer noopener'>").concat(policyName, "</a> workspace")
                : "moved this report to the <a href='".concat(CONST_1.default.NEW_EXPENSIFY_URL, "r/").concat(newParentReportID, "' target='_blank' rel='noreferrer noopener'>").concat(policyName, "</a> workspace"),
            text: "moved this report to the ".concat(policyName, " workspace"),
            type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
        },
    ];
    return {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MOVED,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        isAttachmentOnly: false,
        originalMessage: originalMessage,
        message: movedActionMessage,
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: (0, NumberUtils_1.rand64)(),
        shouldShow: true,
        created: DateUtils_1.default.getDBTime(),
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}
/**
 * Builds an optimistic CHANGE_POLICY report action with a randomly generated reportActionID.
 * This action is used when we change the workspace of a report.
 */
function buildOptimisticChangePolicyReportAction(fromPolicyID, toPolicyID, automaticAction) {
    if (automaticAction === void 0) { automaticAction = false; }
    var originalMessage = {
        fromPolicy: fromPolicyID,
        toPolicy: toPolicyID,
        automaticAction: automaticAction,
    };
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var fromPolicy = getPolicy(fromPolicyID);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var toPolicy = getPolicy(toPolicyID);
    var changePolicyReportActionMessage = __spreadArray([
        {
            type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
            text: "changed the workspace to ".concat(toPolicy === null || toPolicy === void 0 ? void 0 : toPolicy.name),
        }
    ], (fromPolicyID
        ? [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                text: " (previously ".concat(fromPolicy === null || fromPolicy === void 0 ? void 0 : fromPolicy.name, ")"),
            },
        ]
        : []), true);
    return {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CHANGE_POLICY,
        actorAccountID: currentUserAccountID,
        avatar: getCurrentUserAvatar(),
        created: DateUtils_1.default.getDBTime(),
        originalMessage: originalMessage,
        message: changePolicyReportActionMessage,
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: (0, NumberUtils_1.rand64)(),
        shouldShow: true,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}
function buildOptimisticTransactionAction(type, transactionThreadReportID, targetReportID) {
    var _a, _b;
    var reportName = (_b = (_a = allReports === null || allReports === void 0 ? void 0 : allReports[targetReportID]) === null || _a === void 0 ? void 0 : _a.reportName) !== null && _b !== void 0 ? _b : '';
    var url = "".concat(environmentURL, "/r/").concat(targetReportID);
    var _c = type === CONST_1.default.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION
        ? ["moved this expense to ".concat(reportName), "moved this expense to <a href='".concat(url, "' target='_blank' rel='noreferrer noopener'>").concat(reportName, "</a>")]
        : ['moved this expense to your personal space', 'moved this expense to your personal space'], actionText = _c[0], messageHtml = _c[1];
    return {
        actionName: type,
        reportID: transactionThreadReportID,
        actorAccountID: currentUserAccountID,
        avatar: getCurrentUserAvatar(),
        created: DateUtils_1.default.getDBTime(),
        originalMessage: type === CONST_1.default.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION ? { toReportID: targetReportID } : { fromReportID: targetReportID },
        message: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                html: messageHtml,
                text: actionText,
            },
        ],
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: (0, NumberUtils_1.rand64)(),
        shouldShow: true,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}
/**
 * Builds an optimistic MOVED_TRANSACTION report action with a randomly generated reportActionID.
 * This action is used when we change the workspace of a report.
 */
function buildOptimisticMovedTransactionAction(transactionThreadReportID, toReportID) {
    return buildOptimisticTransactionAction(CONST_1.default.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION, transactionThreadReportID, toReportID);
}
/**
 * Builds an optimistic UNREPORTED_TRANSACTION report action with a randomly generated reportActionID.
 * This action is used when we un-report a transaction.
 */
function buildOptimisticUnreportedTransactionAction(transactionThreadReportID, fromReportID) {
    return buildOptimisticTransactionAction(CONST_1.default.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION, transactionThreadReportID, fromReportID);
}
/**
 * Builds an optimistic SUBMITTED report action with a randomly generated reportActionID.
 *
 */
function buildOptimisticSubmittedReportAction(amount, currency, expenseReportID, adminAccountID) {
    var originalMessage = {
        amount: amount,
        currency: currency,
        expenseReportID: expenseReportID,
    };
    var delegateAccountDetails = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(delegateEmail);
    return {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED,
        actorAccountID: currentUserAccountID,
        adminAccountID: adminAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        isAttachmentOnly: false,
        originalMessage: originalMessage,
        message: getIOUReportActionMessage(expenseReportID, CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED, Math.abs(amount), '', currency),
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: (0, NumberUtils_1.rand64)(),
        shouldShow: true,
        created: DateUtils_1.default.getDBTime(),
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        delegateAccountID: delegateAccountDetails === null || delegateAccountDetails === void 0 ? void 0 : delegateAccountDetails.accountID,
    };
}
/**
 * Builds an optimistic report preview action with a randomly generated reportActionID.
 *
 * @param chatReport
 * @param iouReport
 * @param [comment] - User comment for the IOU.
 * @param [transaction] - optimistic first transaction of preview
 * @param reportActionID
 */
function buildOptimisticReportPreview(chatReport, iouReport, comment, transaction, childReportID, reportActionID) {
    var _a;
    var _b, _c;
    if (comment === void 0) { comment = ''; }
    if (transaction === void 0) { transaction = null; }
    var hasReceipt = (0, TransactionUtils_1.hasReceipt)(transaction);
    var message = getReportPreviewMessage(iouReport);
    var created = DateUtils_1.default.getDBTime();
    var reportActorAccountID = (_b = (isInvoiceReport(iouReport) || isExpenseReport(iouReport) ? iouReport === null || iouReport === void 0 ? void 0 : iouReport.ownerAccountID : iouReport === null || iouReport === void 0 ? void 0 : iouReport.managerID)) !== null && _b !== void 0 ? _b : -1;
    var delegateAccountDetails = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(delegateEmail);
    var isTestTransaction = isTestTransactionReport(iouReport);
    var isTestDriveTransaction = !!((_c = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _c === void 0 ? void 0 : _c.isTestDriveReceipt);
    var isScanRequest = transaction ? (0, TransactionUtils_1.isScanRequest)(transaction) : false;
    return __assign({ reportActionID: reportActionID !== null && reportActionID !== void 0 ? reportActionID : (0, NumberUtils_1.rand64)(), reportID: chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID, actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD, originalMessage: {
            linkedReportID: iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID,
        }, message: [
            {
                html: message,
                text: message,
                isEdited: false,
                type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
            },
        ], delegateAccountID: delegateAccountDetails === null || delegateAccountDetails === void 0 ? void 0 : delegateAccountDetails.accountID, created: created, accountID: iouReport === null || iouReport === void 0 ? void 0 : iouReport.managerID, 
        // The preview is initially whispered if created with a receipt, so the actor is the current user as well
        actorAccountID: hasReceipt ? currentUserAccountID : reportActorAccountID, childReportID: childReportID !== null && childReportID !== void 0 ? childReportID : iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID, childMoneyRequestCount: 1, childLastActorAccountID: currentUserAccountID, childLastMoneyRequestComment: comment, childRecentReceiptTransactionIDs: hasReceipt && !(0, EmptyObject_1.isEmptyObject)(transaction) && (transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) ? (_a = {}, _a[transaction.transactionID] = created, _a) : undefined }, ((isTestDriveTransaction || isTestTransaction) && !isScanRequest && { childStateNum: 2, childStatusNum: 4 }));
}
/**
 * Builds an optimistic ACTIONABLE_TRACK_EXPENSE_WHISPER action with a randomly generated reportActionID.
 */
function buildOptimisticActionableTrackExpenseWhisper(iouAction, transactionID) {
    var currentTime = DateUtils_1.default.getDBTime();
    var targetEmail = CONST_1.default.EMAIL.CONCIERGE;
    var actorAccountID = (0, PersonalDetailsUtils_1.getAccountIDsByLogins)([targetEmail]).at(0);
    var reportActionID = (0, NumberUtils_1.rand64)();
    return {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER,
        actorAccountID: actorAccountID,
        avatar: (0, UserUtils_1.getDefaultAvatarURL)(actorAccountID),
        created: DateUtils_1.default.addMillisecondsFromDateTime(currentTime, 1),
        lastModified: DateUtils_1.default.addMillisecondsFromDateTime(currentTime, 1),
        message: [
            {
                html: CONST_1.default.ACTIONABLE_TRACK_EXPENSE_WHISPER_MESSAGE,
                text: CONST_1.default.ACTIONABLE_TRACK_EXPENSE_WHISPER_MESSAGE,
                whisperedTo: [],
                type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
            },
        ],
        originalMessage: {
            lastModified: DateUtils_1.default.addMillisecondsFromDateTime(currentTime, 1),
            transactionID: transactionID,
        },
        person: [
            {
                text: CONST_1.default.DISPLAY_NAME.EXPENSIFY_CONCIERGE,
                type: 'TEXT',
            },
        ],
        reportActionID: reportActionID,
        shouldShow: true,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}
/**
 * Builds an optimistic modified expense action with a randomly generated reportActionID.
 */
function buildOptimisticModifiedExpenseReportAction(transactionThread, oldTransaction, transactionChanges, isFromExpenseReport, policy, updatedTransaction, allowNegative) {
    var _a;
    if (allowNegative === void 0) { allowNegative = false; }
    var originalMessage = getModifiedExpenseOriginalMessage(oldTransaction, transactionChanges, isFromExpenseReport, policy, updatedTransaction, allowNegative);
    var delegateAccountDetails = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(delegateEmail);
    return {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: DateUtils_1.default.getDBTime(),
        isAttachmentOnly: false,
        message: [
            {
                // Currently we are composing the message from the originalMessage and message is only used in OldDot and not in the App
                text: 'You',
                style: 'strong',
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
            },
        ],
        originalMessage: originalMessage,
        person: [
            {
                style: 'strong',
                text: (_a = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.displayName) !== null && _a !== void 0 ? _a : String(currentUserAccountID),
                type: 'TEXT',
            },
        ],
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        reportActionID: (0, NumberUtils_1.rand64)(),
        reportID: transactionThread === null || transactionThread === void 0 ? void 0 : transactionThread.reportID,
        shouldShow: true,
        delegateAccountID: delegateAccountDetails === null || delegateAccountDetails === void 0 ? void 0 : delegateAccountDetails.accountID,
    };
}
/**
 * Builds an optimistic DETACH_RECEIPT report action with a randomly generated reportActionID.
 */
function buildOptimisticDetachReceipt(reportID, transactionID, merchant) {
    var _a;
    if (merchant === void 0) { merchant = CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT; }
    return {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: DateUtils_1.default.getDBTime(),
        isAttachmentOnly: false,
        originalMessage: {
            transactionID: transactionID,
            merchant: "".concat(merchant),
        },
        message: [
            {
                type: 'COMMENT',
                html: "detached a receipt from expense '".concat(merchant, "'"),
                text: "detached a receipt from expense '".concat(merchant, "'"),
                whisperedTo: [],
            },
        ],
        person: [
            {
                style: 'strong',
                text: (_a = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.displayName) !== null && _a !== void 0 ? _a : String(currentUserAccountID),
                type: 'TEXT',
            },
        ],
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        reportActionID: (0, NumberUtils_1.rand64)(),
        reportID: reportID,
        shouldShow: true,
    };
}
/**
 * Updates a report preview action that exists for an IOU report.
 *
 * @param [comment] - User comment for the IOU.
 * @param [transaction] - optimistic newest transaction of a report preview
 *
 */
function updateReportPreview(iouReport, reportPreviewAction, isPayRequest, comment, transaction) {
    var _a;
    var _b, _c;
    if (isPayRequest === void 0) { isPayRequest = false; }
    if (comment === void 0) { comment = ''; }
    var hasReceipt = (0, TransactionUtils_1.hasReceipt)(transaction);
    var recentReceiptTransactions = (_b = reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.childRecentReceiptTransactionIDs) !== null && _b !== void 0 ? _b : {};
    var transactionsToKeep = (0, TransactionUtils_1.getRecentTransactions)(recentReceiptTransactions);
    var previousTransactionsArray = Object.entries(recentReceiptTransactions !== null && recentReceiptTransactions !== void 0 ? recentReceiptTransactions : {}).map(function (_a) {
        var _b;
        var key = _a[0], value = _a[1];
        return (transactionsToKeep.includes(key) ? (_b = {}, _b[key] = value, _b) : null);
    });
    var previousTransactions = {};
    for (var _i = 0, previousTransactionsArray_1 = previousTransactionsArray; _i < previousTransactionsArray_1.length; _i++) {
        var obj = previousTransactionsArray_1[_i];
        for (var key in obj) {
            if (obj) {
                previousTransactions[key] = obj[key];
            }
        }
    }
    var message = getReportPreviewMessage(iouReport, reportPreviewAction);
    var originalMessage = (0, ReportActionsUtils_1.getOriginalMessage)(reportPreviewAction);
    return __assign(__assign({}, reportPreviewAction), { message: [
            {
                html: message,
                text: message,
                isEdited: false,
                type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
            },
        ], childLastMoneyRequestComment: comment || (reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.childLastMoneyRequestComment), childMoneyRequestCount: ((_c = reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.childMoneyRequestCount) !== null && _c !== void 0 ? _c : 0) + (isPayRequest ? 0 : 1), childRecentReceiptTransactionIDs: hasReceipt
            ? __assign(__assign({}, (transaction && (_a = {}, _a[transaction.transactionID] = transaction === null || transaction === void 0 ? void 0 : transaction.created, _a))), previousTransactions) : recentReceiptTransactions, 
        // As soon as we add a transaction without a receipt to the report, it will have ready expenses,
        // so we remove the whisper
        originalMessage: originalMessage
            ? __assign(__assign({}, originalMessage), { whisperedTo: hasReceipt ? originalMessage.whisperedTo : [], linkedReportID: originalMessage.linkedReportID }) : undefined });
}
function buildOptimisticTaskReportAction(taskReportID, actionName, message, actorAccountID, createdOffset) {
    var _a;
    if (message === void 0) { message = ''; }
    if (actorAccountID === void 0) { actorAccountID = currentUserAccountID; }
    if (createdOffset === void 0) { createdOffset = 0; }
    var originalMessage = {
        taskReportID: taskReportID,
        type: actionName,
        text: message,
        html: message,
        whisperedTo: [],
    };
    var delegateAccountDetails = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(delegateEmail);
    return {
        actionName: actionName,
        actorAccountID: actorAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        isAttachmentOnly: false,
        originalMessage: originalMessage,
        message: [
            {
                text: message,
                taskReportID: taskReportID,
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
            },
        ],
        person: [
            {
                style: 'strong',
                text: (_a = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.displayName) !== null && _a !== void 0 ? _a : String(currentUserAccountID),
                type: 'TEXT',
            },
        ],
        reportActionID: (0, NumberUtils_1.rand64)(),
        shouldShow: true,
        created: DateUtils_1.default.getDBTimeWithSkew(Date.now() + createdOffset),
        isFirstItem: false,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        delegateAccountID: delegateAccountDetails === null || delegateAccountDetails === void 0 ? void 0 : delegateAccountDetails.accountID,
    };
}
function isWorkspaceChat(chatType) {
    return chatType === CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS || chatType === CONST_1.default.REPORT.CHAT_TYPE.POLICY_ANNOUNCE || chatType === CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT;
}
function buildOptimisticChatReport(_a) {
    var _b;
    var participantList = _a.participantList, _c = _a.reportName, reportName = _c === void 0 ? CONST_1.default.REPORT.DEFAULT_REPORT_NAME : _c, chatType = _a.chatType, _d = _a.policyID, policyID = _d === void 0 ? CONST_1.default.POLICY.OWNER_EMAIL_FAKE : _d, _e = _a.ownerAccountID, ownerAccountID = _e === void 0 ? CONST_1.default.REPORT.OWNER_ACCOUNT_ID_FAKE : _e, _f = _a.isOwnPolicyExpenseChat, isOwnPolicyExpenseChat = _f === void 0 ? false : _f, _g = _a.oldPolicyName, oldPolicyName = _g === void 0 ? '' : _g, visibility = _a.visibility, writeCapability = _a.writeCapability, _h = _a.notificationPreference, notificationPreference = _h === void 0 ? CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS : _h, _j = _a.parentReportActionID, parentReportActionID = _j === void 0 ? '' : _j, _k = _a.parentReportID, parentReportID = _k === void 0 ? undefined : _k, _l = _a.description, description = _l === void 0 ? '' : _l, _m = _a.avatarUrl, avatarUrl = _m === void 0 ? '' : _m, _o = _a.optimisticReportID, optimisticReportID = _o === void 0 ? '' : _o;
    var isWorkspaceChatType = chatType && isWorkspaceChat(chatType);
    var participants = participantList.reduce(function (reportParticipants, accountID) {
        var participant = __assign({ notificationPreference: notificationPreference }, (!isWorkspaceChatType && { role: accountID === currentUserAccountID ? CONST_1.default.REPORT.ROLE.ADMIN : CONST_1.default.REPORT.ROLE.MEMBER }));
        // eslint-disable-next-line no-param-reassign
        reportParticipants[accountID] = participant;
        return reportParticipants;
    }, {});
    var currentTime = DateUtils_1.default.getDBTime();
    var optimisticChatReport = {
        type: CONST_1.default.REPORT.TYPE.CHAT,
        chatType: chatType,
        isOwnPolicyExpenseChat: isOwnPolicyExpenseChat,
        isPinned: false,
        lastActorAccountID: 0,
        lastMessageHtml: '',
        lastMessageText: undefined,
        lastReadTime: currentTime,
        lastVisibleActionCreated: currentTime,
        oldPolicyName: oldPolicyName,
        ownerAccountID: ownerAccountID || CONST_1.default.REPORT.OWNER_ACCOUNT_ID_FAKE,
        parentReportActionID: parentReportActionID,
        parentReportID: parentReportID,
        participants: participants,
        policyID: policyID,
        reportID: optimisticReportID || generateReportID(),
        reportName: reportName,
        stateNum: 0,
        statusNum: 0,
        visibility: visibility,
        description: description,
        writeCapability: writeCapability,
        avatarUrl: avatarUrl,
    };
    if (chatType === CONST_1.default.REPORT.CHAT_TYPE.INVOICE) {
        // TODO: update to support workspace as an invoice receiver when workspace-to-workspace invoice room implemented
        optimisticChatReport.invoiceReceiver = {
            type: 'individual',
            accountID: (_b = participantList.at(0)) !== null && _b !== void 0 ? _b : -1,
        };
    }
    return optimisticChatReport;
}
function buildOptimisticGroupChatReport(participantAccountIDs, reportName, avatarUri, optimisticReportID, notificationPreference) {
    return buildOptimisticChatReport({
        participantList: participantAccountIDs,
        reportName: reportName,
        chatType: CONST_1.default.REPORT.CHAT_TYPE.GROUP,
        notificationPreference: notificationPreference,
        avatarUrl: avatarUri,
        optimisticReportID: optimisticReportID,
    });
}
/**
 * Returns the necessary reportAction onyx data to indicate that the chat has been created optimistically
 * @param [created] - Action created time
 */
function buildOptimisticCreatedReportAction(emailCreatingAction, created, optimisticReportActionID) {
    if (created === void 0) { created = DateUtils_1.default.getDBTime(); }
    return {
        reportActionID: optimisticReportActionID !== null && optimisticReportActionID !== void 0 ? optimisticReportActionID : (0, NumberUtils_1.rand64)(),
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: emailCreatingAction,
            },
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: ' created this report',
            },
        ],
        person: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: created,
        shouldShow: true,
    };
}
/**
 * Returns the necessary reportAction onyx data to indicate that the room has been renamed
 */
function buildOptimisticRenamedRoomReportAction(newName, oldName) {
    var now = DateUtils_1.default.getDBTime();
    return {
        reportActionID: (0, NumberUtils_1.rand64)(),
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.RENAMED,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: 'You',
            },
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: " renamed this report. New title is '".concat(newName, "' (previously '").concat(oldName, "')."),
            },
        ],
        person: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        originalMessage: {
            oldName: oldName,
            newName: newName,
            html: "Room renamed to ".concat(newName),
            lastModified: now,
        },
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: now,
        shouldShow: true,
    };
}
/**
 * Returns the necessary reportAction onyx data to indicate that the room description has been updated
 */
function buildOptimisticRoomDescriptionUpdatedReportAction(description) {
    var now = DateUtils_1.default.getDBTime();
    return {
        reportActionID: (0, NumberUtils_1.rand64)(),
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
                text: description ? "set the room description to: ".concat(Parser_1.default.htmlToText(description)) : 'cleared the room description',
                html: description ? "<muted-text>set the room description to: ".concat(description, "</muted-text>") : '<muted-text>cleared the room description</muted-text>',
            },
        ],
        person: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        originalMessage: {
            description: description,
            lastModified: now,
        },
        created: now,
    };
}
/**
 * Returns the necessary reportAction onyx data to indicate that the transaction has been put on hold optimistically
 * @param [created] - Action created time
 */
function buildOptimisticHoldReportAction(created) {
    if (created === void 0) { created = DateUtils_1.default.getDBTime(); }
    return {
        reportActionID: (0, NumberUtils_1.rand64)(),
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.HOLD,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: (0, Localize_1.translateLocal)('iou.heldExpense'),
            },
        ],
        person: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: created,
        shouldShow: true,
    };
}
/**
 * Returns the necessary reportAction onyx data to indicate that the transaction has been put on hold optimistically
 * @param [created] - Action created time
 */
function buildOptimisticHoldReportActionComment(comment, created) {
    if (created === void 0) { created = DateUtils_1.default.getDBTime(); }
    return {
        reportActionID: (0, NumberUtils_1.rand64)(),
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
                text: comment,
                html: comment, // as discussed on https://github.com/Expensify/App/pull/39452 we will not support HTML for now
            },
        ],
        person: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: created,
        shouldShow: true,
    };
}
/**
 * Returns the necessary reportAction onyx data to indicate that the transaction has been removed from hold optimistically
 * @param [created] - Action created time
 */
function buildOptimisticUnHoldReportAction(created) {
    if (created === void 0) { created = DateUtils_1.default.getDBTime(); }
    return {
        reportActionID: (0, NumberUtils_1.rand64)(),
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.UNHOLD,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: (0, Localize_1.translateLocal)('iou.unheldExpense'),
            },
        ],
        person: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: created,
        shouldShow: true,
    };
}
function buildOptimisticRetractedReportAction(created) {
    if (created === void 0) { created = DateUtils_1.default.getDBTime(); }
    return {
        reportActionID: (0, NumberUtils_1.rand64)(),
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.RETRACTED,
        actorAccountID: currentUserAccountID,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        message: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
                text: 'retracted',
                html: "<muted-text>retracted</muted-text>",
            },
        ],
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: created,
        shouldShow: true,
    };
}
function buildOptimisticReopenedReportAction(created) {
    if (created === void 0) { created = DateUtils_1.default.getDBTime(); }
    return {
        reportActionID: (0, NumberUtils_1.rand64)(),
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REOPENED,
        actorAccountID: currentUserAccountID,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        message: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
                text: 'reopened',
                html: '<muted-text>reopened</muted-text>',
            },
        ],
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: created,
        shouldShow: true,
    };
}
function buildOptimisticEditedTaskFieldReportAction(_a) {
    var title = _a.title, description = _a.description;
    // We do not modify title & description in one request, so we need to create a different optimistic action for each field modification
    var field = '';
    var value = '';
    if (title !== undefined) {
        field = 'task title';
        value = title;
    }
    else if (description !== undefined) {
        field = 'description';
        value = description;
    }
    var changelog = 'edited this task';
    if (field && value) {
        changelog = "updated the ".concat(field, " to ").concat(value);
    }
    else if (field) {
        changelog = "removed the ".concat(field);
    }
    var delegateAccountDetails = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(delegateEmail);
    return {
        reportActionID: (0, NumberUtils_1.rand64)(),
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.TASK_EDITED,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
                text: changelog,
                html: getParsedComment(changelog, undefined, undefined, title !== undefined ? __spreadArray([], CONST_1.default.TASK_TITLE_DISABLED_RULES, true) : undefined),
            },
        ],
        person: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: DateUtils_1.default.getDBTime(),
        shouldShow: false,
        delegateAccountID: delegateAccountDetails === null || delegateAccountDetails === void 0 ? void 0 : delegateAccountDetails.accountID,
    };
}
function buildOptimisticCardAssignedReportAction(assigneeAccountID) {
    return {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CARD_ASSIGNED,
        actorAccountID: currentUserAccountID,
        avatar: getCurrentUserAvatar(),
        created: DateUtils_1.default.getDBTime(),
        originalMessage: { assigneeAccountID: assigneeAccountID, cardID: -1 },
        message: [{ type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT, text: '', html: '' }],
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        person: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        reportActionID: (0, NumberUtils_1.rand64)(),
        shouldShow: true,
    };
}
function buildOptimisticChangedTaskAssigneeReportAction(assigneeAccountID) {
    var delegateAccountDetails = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(delegateEmail);
    return {
        reportActionID: (0, NumberUtils_1.rand64)(),
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.TASK_EDITED,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
                text: "assigned to ".concat(getDisplayNameForParticipant({ accountID: assigneeAccountID })),
                html: "assigned to <mention-user accountID=\"".concat(assigneeAccountID, "\"/>"),
            },
        ],
        person: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: DateUtils_1.default.getDBTime(),
        shouldShow: false,
        delegateAccountID: delegateAccountDetails === null || delegateAccountDetails === void 0 ? void 0 : delegateAccountDetails.accountID,
    };
}
/**
 * Returns the necessary reportAction onyx data to indicate that a chat has been archived
 *
 * @param reason - A reason why the chat has been archived
 */
function buildOptimisticClosedReportAction(emailClosingReport, policyName, reason) {
    if (reason === void 0) { reason = CONST_1.default.REPORT.ARCHIVE_REASON.DEFAULT; }
    return {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CLOSED,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: DateUtils_1.default.getDBTime(),
        message: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: emailClosingReport,
            },
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: ' closed this report',
            },
        ],
        originalMessage: {
            policyName: policyName,
            reason: reason,
        },
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        person: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        reportActionID: (0, NumberUtils_1.rand64)(),
        shouldShow: true,
    };
}
/**
 * Returns an optimistic Dismissed Violation Report Action. Use the originalMessage customize this to the type of
 * violation being dismissed.
 */
function buildOptimisticDismissedViolationReportAction(originalMessage) {
    return {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION,
        actorAccountID: currentUserAccountID,
        avatar: getCurrentUserAvatar(),
        created: DateUtils_1.default.getDBTime(),
        message: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: (0, ReportActionsUtils_1.getDismissedViolationMessageText)(originalMessage),
            },
        ],
        originalMessage: originalMessage,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        person: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        reportActionID: (0, NumberUtils_1.rand64)(),
        shouldShow: true,
    };
}
function buildOptimisticResolvedDuplicatesReportAction() {
    return {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES,
        actorAccountID: currentUserAccountID,
        avatar: getCurrentUserAvatar(),
        created: DateUtils_1.default.getDBTime(),
        message: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: (0, Localize_1.translateLocal)('violations.resolvedDuplicates'),
            },
        ],
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        person: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        reportActionID: (0, NumberUtils_1.rand64)(),
        shouldShow: true,
    };
}
function buildOptimisticAnnounceChat(policyID, accountIDs) {
    var _a, _b, _c;
    var announceReport = getRoom(CONST_1.default.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, policyID);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var announceRoomOnyxData = {
        onyxOptimisticData: [],
        onyxSuccessData: [],
        onyxFailureData: [],
    };
    // Do not create #announce room if the room already exists or if there are less than 3 participants in workspace
    if (accountIDs.length < 3 || announceReport) {
        return {
            announceChatReportID: '',
            announceChatReportActionID: '',
            announceChatData: announceRoomOnyxData,
        };
    }
    var announceChatData = buildOptimisticChatReport({
        participantList: accountIDs,
        reportName: CONST_1.default.REPORT.WORKSPACE_CHAT_ROOMS.ANNOUNCE,
        chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
        policyID: policyID,
        ownerAccountID: CONST_1.default.POLICY.OWNER_ACCOUNT_ID_FAKE,
        oldPolicyName: policy === null || policy === void 0 ? void 0 : policy.name,
        writeCapability: CONST_1.default.REPORT.WRITE_CAPABILITIES.ADMINS,
        notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
    });
    var announceCreatedAction = buildOptimisticCreatedReportAction(CONST_1.default.POLICY.OWNER_EMAIL_FAKE);
    announceRoomOnyxData.onyxOptimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(announceChatData.reportID),
        value: __assign({ pendingFields: {
                addWorkspaceRoom: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            } }, announceChatData),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT).concat(announceChatData.reportID),
        value: null,
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(announceChatData.reportID),
        value: (_a = {},
            _a[announceCreatedAction.reportActionID] = announceCreatedAction,
            _a),
    });
    announceRoomOnyxData.onyxSuccessData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(announceChatData.reportID),
        value: {
            pendingFields: {
                addWorkspaceRoom: null,
            },
            pendingAction: null,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(announceChatData.reportID),
        value: {
            isOptimisticReport: false,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(announceChatData.reportID),
        value: (_b = {},
            _b[announceCreatedAction.reportActionID] = {
                pendingAction: null,
            },
            _b),
    });
    announceRoomOnyxData.onyxFailureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(announceChatData.reportID),
        value: {
            pendingFields: {
                addWorkspaceRoom: null,
            },
            pendingAction: null,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(announceChatData.reportID),
        value: {
            isOptimisticReport: false,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(announceChatData.reportID),
        value: (_c = {},
            _c[announceCreatedAction.reportActionID] = {
                pendingAction: null,
            },
            _c),
    });
    return {
        announceChatReportID: announceChatData.reportID,
        announceChatReportActionID: announceCreatedAction.reportActionID,
        announceChatData: announceRoomOnyxData,
    };
}
function buildOptimisticWorkspaceChats(policyID, policyName, expenseReportId) {
    var _a, _b;
    var pendingChatMembers = getPendingChatMembers(currentUserAccountID ? [currentUserAccountID] : [], [], CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    var adminsChatData = __assign({}, buildOptimisticChatReport({
        participantList: currentUserAccountID ? [currentUserAccountID] : [],
        reportName: CONST_1.default.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS,
        chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS,
        policyID: policyID,
        ownerAccountID: CONST_1.default.POLICY.OWNER_ACCOUNT_ID_FAKE,
        oldPolicyName: policyName,
    }));
    var adminsChatReportID = adminsChatData.reportID;
    var adminsCreatedAction = buildOptimisticCreatedReportAction(CONST_1.default.POLICY.OWNER_EMAIL_FAKE);
    var adminsReportActionData = (_a = {},
        _a[adminsCreatedAction.reportActionID] = adminsCreatedAction,
        _a);
    var expenseChatData = buildOptimisticChatReport({
        participantList: currentUserAccountID ? [currentUserAccountID] : [],
        reportName: '',
        chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        policyID: policyID,
        ownerAccountID: currentUserAccountID,
        isOwnPolicyExpenseChat: true,
        oldPolicyName: policyName,
        optimisticReportID: expenseReportId,
    });
    var expenseChatReportID = expenseChatData.reportID;
    var expenseReportCreatedAction = buildOptimisticCreatedReportAction(currentUserEmail !== null && currentUserEmail !== void 0 ? currentUserEmail : '');
    var expenseReportActionData = (_b = {},
        _b[expenseReportCreatedAction.reportActionID] = expenseReportCreatedAction,
        _b);
    return {
        adminsChatReportID: adminsChatReportID,
        adminsChatData: adminsChatData,
        adminsReportActionData: adminsReportActionData,
        adminsCreatedReportActionID: adminsCreatedAction.reportActionID,
        expenseChatReportID: expenseChatReportID,
        expenseChatData: expenseChatData,
        expenseReportActionData: expenseReportActionData,
        expenseCreatedReportActionID: expenseReportCreatedAction.reportActionID,
        pendingChatMembers: pendingChatMembers,
    };
}
/**
 * Builds an optimistic Task Report with a randomly generated reportID
 *
 * @param ownerAccountID - Account ID of the person generating the Task.
 * @param assigneeAccountID - AccountID of the other person participating in the Task.
 * @param parentReportID - Report ID of the chat where the Task is.
 * @param title - Task title.
 * @param description - Task description.
 * @param policyID - PolicyID of the parent report
 */
function buildOptimisticTaskReport(ownerAccountID, parentReportID, assigneeAccountID, title, description, policyID, notificationPreference, mediaAttributes) {
    var _a;
    if (assigneeAccountID === void 0) { assigneeAccountID = 0; }
    if (policyID === void 0) { policyID = CONST_1.default.POLICY.OWNER_EMAIL_FAKE; }
    if (notificationPreference === void 0) { notificationPreference = CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN; }
    var participants = (_a = {},
        _a[ownerAccountID] = {
            notificationPreference: notificationPreference,
        },
        _a);
    if (assigneeAccountID) {
        participants[assigneeAccountID] = { notificationPreference: notificationPreference };
    }
    return {
        reportID: generateReportID(),
        reportName: getParsedComment(title !== null && title !== void 0 ? title : '', undefined, undefined, __spreadArray([], CONST_1.default.TASK_TITLE_DISABLED_RULES, true)),
        description: getParsedComment(description !== null && description !== void 0 ? description : '', {}, mediaAttributes),
        ownerAccountID: ownerAccountID,
        participants: participants,
        managerID: assigneeAccountID,
        type: CONST_1.default.REPORT.TYPE.TASK,
        parentReportID: parentReportID,
        policyID: policyID,
        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
        lastVisibleActionCreated: DateUtils_1.default.getDBTime(),
        hasParentAccess: true,
    };
}
/**
 * Builds an optimistic EXPORTED_TO_INTEGRATION report action
 *
 * @param integration - The connectionName of the integration
 * @param markedManually - Whether the integration was marked as manually exported
 */
function buildOptimisticExportIntegrationAction(integration, markedManually) {
    if (markedManually === void 0) { markedManually = false; }
    var label = CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[integration];
    return {
        reportActionID: (0, NumberUtils_1.rand64)(),
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION,
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [],
        person: [
            {
                type: CONST_1.default.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: DateUtils_1.default.getDBTime(),
        shouldShow: true,
        originalMessage: {
            label: label,
            lastModified: DateUtils_1.default.getDBTime(),
            markedManually: markedManually,
            inProgress: true,
        },
    };
}
/**
 * A helper method to create transaction thread
 *
 * @param reportAction - the parent IOU report action from which to create the thread
 * @param moneyRequestReport - the report which the report action belongs to
 */
function buildTransactionThread(reportAction, moneyRequestReport, existingTransactionThreadReportID) {
    var participantAccountIDs = __spreadArray([], new Set([currentUserAccountID, Number(reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID)]), true).filter(Boolean);
    var existingTransactionThreadReport = getReportOrDraftReport(existingTransactionThreadReportID);
    if (existingTransactionThreadReportID && existingTransactionThreadReport) {
        return __assign(__assign({}, existingTransactionThreadReport), { parentReportActionID: reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID, parentReportID: moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID, reportName: getTransactionReportName({ reportAction: reportAction }), policyID: moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.policyID });
    }
    return buildOptimisticChatReport({
        participantList: participantAccountIDs,
        reportName: getTransactionReportName({ reportAction: reportAction }),
        policyID: moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.policyID,
        ownerAccountID: CONST_1.default.POLICY.OWNER_ACCOUNT_ID_FAKE,
        notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
        parentReportActionID: reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID,
        parentReportID: moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID,
    });
}
/**
 * Build optimistic expense entities:
 *
 * 1. CREATED action for the chatReport
 * 2. CREATED action for the iouReport
 * 3. IOU action for the iouReport linked to the transaction thread via `childReportID`
 * 4. Transaction Thread linked to the IOU action via `parentReportActionID`
 * 5. CREATED action for the Transaction Thread
 */
function buildOptimisticMoneyRequestEntities(_a) {
    var iouReport = _a.iouReport, type = _a.type, amount = _a.amount, currency = _a.currency, comment = _a.comment, payeeEmail = _a.payeeEmail, participants = _a.participants, transactionID = _a.transactionID, paymentType = _a.paymentType, _b = _a.isSettlingUp, isSettlingUp = _b === void 0 ? false : _b, _c = _a.isSendMoneyFlow, isSendMoneyFlow = _c === void 0 ? false : _c, _d = _a.isOwnPolicyExpenseChat, isOwnPolicyExpenseChat = _d === void 0 ? false : _d, isPersonalTrackingExpense = _a.isPersonalTrackingExpense, existingTransactionThreadReportID = _a.existingTransactionThreadReportID, linkedTrackedExpenseReportAction = _a.linkedTrackedExpenseReportAction, optimisticCreatedReportActionID = _a.optimisticCreatedReportActionID;
    var createdActionForChat = buildOptimisticCreatedReportAction(payeeEmail, undefined, optimisticCreatedReportActionID);
    // The `CREATED` action must be optimistically generated before the IOU action so that it won't appear after the IOU action in the chat.
    var iouActionCreationTime = DateUtils_1.default.getDBTime();
    var createdActionForIOUReport = buildOptimisticCreatedReportAction(payeeEmail, DateUtils_1.default.subtractMillisecondsFromDateTime(iouActionCreationTime, 1));
    var iouAction = buildOptimisticIOUReportAction({
        type: type,
        amount: amount,
        currency: currency,
        comment: comment,
        participants: participants,
        transactionID: transactionID,
        paymentType: paymentType,
        iouReportID: iouReport.reportID,
        isPersonalTrackingExpense: isPersonalTrackingExpense,
        isSettlingUp: isSettlingUp,
        isSendMoneyFlow: isSendMoneyFlow,
        isOwnPolicyExpenseChat: isOwnPolicyExpenseChat,
        created: iouActionCreationTime,
        linkedExpenseReportAction: linkedTrackedExpenseReportAction,
    });
    // Create optimistic transactionThread and the `CREATED` action for it, if existingTransactionThreadReportID is undefined
    var transactionThread = buildTransactionThread(iouAction, iouReport, existingTransactionThreadReportID);
    var createdActionForTransactionThread = existingTransactionThreadReportID ? null : buildOptimisticCreatedReportAction(payeeEmail);
    // The IOU action and the transactionThread are co-dependent as parent-child, so we need to link them together
    iouAction.childReportID = existingTransactionThreadReportID !== null && existingTransactionThreadReportID !== void 0 ? existingTransactionThreadReportID : transactionThread.reportID;
    return [createdActionForChat, createdActionForIOUReport, iouAction, transactionThread, createdActionForTransactionThread];
}
/**
 * Check if the report is empty, meaning it has no visible messages (i.e. only a "created" report action).
 * Added caching mechanism via derived values.
 */
function isEmptyReport(report) {
    if (!report) {
        return true;
    }
    // Get the `isEmpty` state from cached report attributes
    var attributes = reportAttributesDerivedValue === null || reportAttributesDerivedValue === void 0 ? void 0 : reportAttributesDerivedValue[report.reportID];
    if (attributes) {
        return attributes.isEmpty;
    }
    return generateIsEmptyReport(report);
}
/**
 * Check if the report is empty, meaning it has no visible messages (i.e. only a "created" report action).
 * No cache implementation which bypasses derived value check.
 */
function generateIsEmptyReport(report) {
    if (!report) {
        return true;
    }
    if (report.lastMessageText) {
        return false;
    }
    var lastVisibleMessage = getLastVisibleMessage(report.reportID);
    return !lastVisibleMessage.lastMessageText;
}
// We need oneTransactionThreadReport to get the correct last visible action created
function isUnread(report, oneTransactionThreadReport) {
    var _a, _b;
    if (!report) {
        return false;
    }
    if (isEmptyReport(report)) {
        return false;
    }
    // lastVisibleActionCreated and lastReadTime are both datetime strings and can be compared directly
    var lastVisibleActionCreated = getReportLastVisibleActionCreated(report, oneTransactionThreadReport);
    var lastReadTime = (_a = report.lastReadTime) !== null && _a !== void 0 ? _a : '';
    var lastMentionedTime = (_b = report.lastMentionedTime) !== null && _b !== void 0 ? _b : '';
    // If the user was mentioned and the comment got deleted the lastMentionedTime will be more recent than the lastVisibleActionCreated
    return lastReadTime < (lastVisibleActionCreated !== null && lastVisibleActionCreated !== void 0 ? lastVisibleActionCreated : '') || lastReadTime < lastMentionedTime;
}
function isIOUOwnedByCurrentUser(report, allReportsDict) {
    var allAvailableReports = allReportsDict !== null && allReportsDict !== void 0 ? allReportsDict : allReports;
    if (!report || !allAvailableReports) {
        return false;
    }
    var reportToLook = report;
    if (report.iouReportID) {
        var iouReport = allAvailableReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.iouReportID)];
        if (iouReport) {
            reportToLook = iouReport;
        }
    }
    return reportToLook.ownerAccountID === currentUserAccountID;
}
/**
 * Assuming the passed in report is a default room, lets us know whether we can see it or not, based on permissions and
 * the various subsets of users we've allowed to use default rooms.
 */
function canSeeDefaultRoom(report, betas) {
    var _a, _b;
    // Include archived rooms
    // This will get removed as part of https://github.com/Expensify/App/issues/59961
    // eslint-disable-next-line deprecation/deprecation
    if (isArchivedNonExpenseReport(report, !!((_a = getReportNameValuePairs(report === null || report === void 0 ? void 0 : report.reportID)) === null || _a === void 0 ? void 0 : _a.private_isArchived))) {
        return true;
    }
    // If the room has an assigned guide, it can be seen.
    if (hasExpensifyGuidesEmails(Object.keys((_b = report === null || report === void 0 ? void 0 : report.participants) !== null && _b !== void 0 ? _b : {}).map(Number))) {
        return true;
    }
    // Include any admins and announce rooms, since only non partner-managed domain rooms are on the beta now.
    if (isAdminRoom(report) || isAnnounceRoom(report)) {
        return true;
    }
    // For all other cases, just check that the user belongs to the default rooms beta
    return Permissions_1.default.isBetaEnabled(CONST_1.default.BETAS.DEFAULT_ROOMS, betas !== null && betas !== void 0 ? betas : []);
}
function canAccessReport(report, betas) {
    var _a;
    // We hide default rooms (it's basically just domain rooms now) from people who aren't on the defaultRooms beta.
    if (isDefaultRoom(report) && !canSeeDefaultRoom(report, betas)) {
        return false;
    }
    if ((_a = report === null || report === void 0 ? void 0 : report.errorFields) === null || _a === void 0 ? void 0 : _a.notFound) {
        return false;
    }
    return true;
}
// eslint-disable-next-line rulesdir/no-negated-variables
function isReportNotFound(report) {
    var _a;
    return !!((_a = report === null || report === void 0 ? void 0 : report.errorFields) === null || _a === void 0 ? void 0 : _a.notFound);
}
/**
 * Check if the report is the parent report of the currently viewed report or at least one child report has report action
 */
function shouldHideReport(report, currentReportId) {
    var _a, _b;
    var currentReport = getReportOrDraftReport(currentReportId);
    var parentReport = getParentReport(!(0, EmptyObject_1.isEmptyObject)(currentReport) ? currentReport : undefined);
    var reportActions = (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report === null || report === void 0 ? void 0 : report.reportID)]) !== null && _a !== void 0 ? _a : {};
    var isChildReportHasComment = (_b = Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {})) === null || _b === void 0 ? void 0 : _b.some(function (reportAction) { var _a; return ((_a = reportAction === null || reportAction === void 0 ? void 0 : reportAction.childVisibleActionCount) !== null && _a !== void 0 ? _a : 0) > 0 && (0, ReportActionsUtils_1.shouldReportActionBeVisible)(reportAction, reportAction.reportActionID, canUserPerformWriteAction(report)); });
    return (parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID) !== (report === null || report === void 0 ? void 0 : report.reportID) && !isChildReportHasComment;
}
/**
 * Should we display a RBR on the LHN on this report due to violations?
 */
function shouldDisplayViolationsRBRInLHN(report, transactionViolations) {
    var _a;
    // We only show the RBR in the highest level, which is the expense chat
    if (!report || !isPolicyExpenseChat(report)) {
        return false;
    }
    // We only show the RBR to the submitter
    if (!isCurrentUserSubmitter(report.reportID)) {
        return false;
    }
    if (!report.policyID || !reportsByPolicyID) {
        return false;
    }
    // If any report has a violation, then it should have a RBR
    var potentialReports = (_a = reportsByPolicyID[report.policyID]) !== null && _a !== void 0 ? _a : [];
    return potentialReports.some(function (potentialReport) {
        return (!isInvoiceReport(potentialReport) &&
            (hasViolations(potentialReport.reportID, transactionViolations, true) ||
                hasWarningTypeViolations(potentialReport.reportID, transactionViolations, true) ||
                hasNoticeTypeViolations(potentialReport.reportID, transactionViolations, true)));
    });
}
/**
 * Checks to see if a report contains a violation
 */
function hasViolations(reportID, transactionViolations, shouldShowInReview, reportTransactions) {
    var transactions = reportTransactions !== null && reportTransactions !== void 0 ? reportTransactions : getReportTransactions(reportID);
    return transactions.some(function (transaction) { return (0, TransactionUtils_1.hasViolation)(transaction, transactionViolations, shouldShowInReview); });
}
/**
 * Checks to see if a report contains a violation of type `warning`
 */
function hasWarningTypeViolations(reportID, transactionViolations, shouldShowInReview) {
    var transactions = getReportTransactions(reportID);
    return transactions.some(function (transaction) { return (0, TransactionUtils_1.hasWarningTypeViolation)(transaction, transactionViolations, shouldShowInReview); });
}
/**
 * Checks to see if a transaction contains receipt error
 */
function hasReceiptError(transaction) {
    var _a, _b, _c, _d;
    var errors = __assign({}, ((_d = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.errorFields) === null || _a === void 0 ? void 0 : _a.route) !== null && _b !== void 0 ? _b : (_c = transaction === null || transaction === void 0 ? void 0 : transaction.errorFields) === null || _c === void 0 ? void 0 : _c.waypoints) !== null && _d !== void 0 ? _d : transaction === null || transaction === void 0 ? void 0 : transaction.errors));
    var errorEntries = Object.entries(errors !== null && errors !== void 0 ? errors : {});
    var errorMessages = (0, mapValues_1.default)(Object.fromEntries(errorEntries), function (error) { return error; });
    return Object.values(errorMessages).some(function (error) { return (0, ErrorUtils_1.isReceiptError)(error); });
}
/**
 * Checks to see if a report contains receipt error
 */
function hasReceiptErrors(reportID) {
    var transactions = getReportTransactions(reportID);
    return transactions.some(hasReceiptError);
}
/**
 * Checks to see if a report contains a violation of type `notice`
 */
function hasNoticeTypeViolations(reportID, transactionViolations, shouldShowInReview) {
    var transactions = getReportTransactions(reportID);
    return transactions.some(function (transaction) { return (0, TransactionUtils_1.hasNoticeTypeViolation)(transaction, transactionViolations, shouldShowInReview); });
}
function hasReportViolations(reportID) {
    if (!reportID) {
        return false;
    }
    var reportViolations = allReportsViolations === null || allReportsViolations === void 0 ? void 0 : allReportsViolations["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_VIOLATIONS).concat(reportID)];
    return Object.values(reportViolations !== null && reportViolations !== void 0 ? reportViolations : {}).some(function (violations) { return !(0, EmptyObject_1.isEmptyObject)(violations); });
}
function getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions) {
    var _a, _b;
    var reportActionsArray = Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {}).filter(function (action) { return !(0, ReportActionsUtils_1.isDeletedAction)(action); });
    var reportActionErrors = {};
    var reportAction;
    for (var _i = 0, reportActionsArray_1 = reportActionsArray; _i < reportActionsArray_1.length; _i++) {
        var action = reportActionsArray_1[_i];
        if (action && !(0, EmptyObject_1.isEmptyObject)(action.errors)) {
            Object.assign(reportActionErrors, action.errors);
            if (!reportAction) {
                reportAction = action;
            }
        }
    }
    var parentReportAction = !(report === null || report === void 0 ? void 0 : report.parentReportID) || !(report === null || report === void 0 ? void 0 : report.parentReportActionID)
        ? undefined
        : (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.parentReportID)]) === null || _a === void 0 ? void 0 : _a[report.parentReportActionID];
    // This will get removed as part of https://github.com/Expensify/App/issues/59961
    // eslint-disable-next-line deprecation/deprecation
    var reportNameValuePairs = getReportNameValuePairs(report === null || report === void 0 ? void 0 : report.reportID);
    if (!isArchivedReport(reportNameValuePairs)) {
        if ((0, ReportActionsUtils_1.wasActionTakenByCurrentUser)(parentReportAction) && (0, ReportActionsUtils_1.isTransactionThread)(parentReportAction)) {
            var transactionID = (0, ReportActionsUtils_1.isMoneyRequestAction)(parentReportAction) ? (_b = (0, ReportActionsUtils_1.getOriginalMessage)(parentReportAction)) === null || _b === void 0 ? void 0 : _b.IOUTransactionID : null;
            var transaction = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
            if ((0, TransactionUtils_1.hasMissingSmartscanFields)(transaction !== null && transaction !== void 0 ? transaction : null) && !isSettled(transaction === null || transaction === void 0 ? void 0 : transaction.reportID)) {
                reportActionErrors.smartscan = (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericSmartscanFailureMessage');
                reportAction = undefined;
            }
        }
        else if ((isIOUReport(report) || isExpenseReport(report)) && (report === null || report === void 0 ? void 0 : report.ownerAccountID) === currentUserAccountID) {
            if (shouldShowRBRForMissingSmartscanFields(report === null || report === void 0 ? void 0 : report.reportID) && !isSettled(report === null || report === void 0 ? void 0 : report.reportID)) {
                reportActionErrors.smartscan = (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericSmartscanFailureMessage');
                reportAction = getReportActionWithMissingSmartscanFields(report === null || report === void 0 ? void 0 : report.reportID);
            }
        }
        else if (hasSmartscanError(reportActionsArray)) {
            reportActionErrors.smartscan = (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('iou.error.genericSmartscanFailureMessage');
            reportAction = getReportActionWithSmartscanError(reportActionsArray);
        }
    }
    return {
        errors: reportActionErrors,
        reportAction: reportAction,
    };
}
/**
 * Get an object of error messages keyed by microtime by combining all error objects related to the report.
 */
function getAllReportErrors(report, reportActions) {
    var _a;
    var reportErrorFields = (_a = report === null || report === void 0 ? void 0 : report.errorFields) !== null && _a !== void 0 ? _a : {};
    var reportActionErrors = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions).errors;
    // All error objects related to the report. Each object in the sources contains error messages keyed by microtime
    var errorSources = __assign(__assign({}, reportErrorFields), reportActionErrors);
    // Combine all error messages keyed by microtime into one object
    var errorSourcesArray = Object.values(errorSources !== null && errorSources !== void 0 ? errorSources : {});
    var allReportErrors = {};
    for (var _i = 0, errorSourcesArray_1 = errorSourcesArray; _i < errorSourcesArray_1.length; _i++) {
        var errors = errorSourcesArray_1[_i];
        if (!(0, EmptyObject_1.isEmptyObject)(errors)) {
            Object.assign(allReportErrors, errors);
        }
    }
    return allReportErrors;
}
function hasReportErrorsOtherThanFailedReceipt(report, chatReport, doesReportHaveViolations, transactionViolations, reportAttributes) {
    var _a, _b;
    var allReportErrors = (_b = (_a = reportAttributes === null || reportAttributes === void 0 ? void 0 : reportAttributes[report === null || report === void 0 ? void 0 : report.reportID]) === null || _a === void 0 ? void 0 : _a.reportErrors) !== null && _b !== void 0 ? _b : {};
    var transactionReportActions = (0, ReportActionsUtils_1.getAllReportActions)(report.reportID);
    var oneTransactionThreadReportID = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(report, chatReport, transactionReportActions, undefined);
    var doesTransactionThreadReportHasViolations = false;
    if (oneTransactionThreadReportID) {
        var transactionReport = getReport(oneTransactionThreadReportID, allReports);
        doesTransactionThreadReportHasViolations = !!transactionReport && shouldDisplayViolationsRBRInLHN(transactionReport, transactionViolations);
    }
    return (doesTransactionThreadReportHasViolations ||
        doesReportHaveViolations ||
        Object.values(allReportErrors).some(function (error) { return (error === null || error === void 0 ? void 0 : error[0]) !== (0, Localize_1.translateLocal)('iou.error.genericSmartscanFailureMessage'); }));
}
function reasonForReportToBeInOptionList(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var report = _a.report, chatReport = _a.chatReport, currentReportId = _a.currentReportId, isInFocusMode = _a.isInFocusMode, betas = _a.betas, excludeEmptyChats = _a.excludeEmptyChats, doesReportHaveViolations = _a.doesReportHaveViolations, _j = _a.includeSelfDM, includeSelfDM = _j === void 0 ? false : _j, login = _a.login, _k = _a.includeDomainEmail, includeDomainEmail = _k === void 0 ? false : _k, _l = _a.isReportArchived, isReportArchived = _l === void 0 ? false : _l;
    var isInDefaultMode = !isInFocusMode;
    // Exclude reports that have no data because there wouldn't be anything to show in the option item.
    // This can happen if data is currently loading from the server or a report is in various stages of being created.
    // This can also happen for anyone accessing a public room or archived room for which they don't have access to the underlying policy.
    // Optionally exclude reports that do not belong to currently active workspace
    var parentReportAction = isThread(report) ? (_b = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.parentReportID)]) === null || _b === void 0 ? void 0 : _b[report.parentReportActionID] : undefined;
    if (!(report === null || report === void 0 ? void 0 : report.reportID) ||
        !(report === null || report === void 0 ? void 0 : report.type) ||
        (report === null || report === void 0 ? void 0 : report.reportName) === undefined ||
        (!(report === null || report === void 0 ? void 0 : report.participants) &&
            // We omit sending back participants for chat rooms when searching for reports since they aren't needed to display the results and can get very large.
            // So we allow showing rooms with no participants–in any other circumstances we should never have these reports with no participants in Onyx.
            !isChatRoom(report) &&
            !isChatThread(report) &&
            !isReportArchived &&
            !isMoneyRequestReport(report) &&
            !isTaskReport(report) &&
            !isSelfDM(report) &&
            !isSystemChat(report) &&
            !isGroupChat(report))) {
        return null;
    }
    var currentReportActions = (_c = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report === null || report === void 0 ? void 0 : report.reportID)]) !== null && _c !== void 0 ? _c : {};
    var reportActionValues = Object.values(currentReportActions);
    var hasOnlyCreatedAction = reportActionValues.length === 1 && ((_d = reportActionValues.at(0)) === null || _d === void 0 ? void 0 : _d.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.CREATED;
    // Hide empty reports that have only a `CREATED` action, a total of 0, and are in a submitted state
    // These reports should be hidden because they appear empty to users and there is nothing actionable for them to do
    if ((report === null || report === void 0 ? void 0 : report.total) === 0 && (report === null || report === void 0 ? void 0 : report.stateNum) === CONST_1.default.REPORT.STATE_NUM.SUBMITTED && (report === null || report === void 0 ? void 0 : report.statusNum) === CONST_1.default.REPORT.STATUS_NUM.SUBMITTED && hasOnlyCreatedAction) {
        return null;
    }
    // We used to use the system DM for A/B testing onboarding tasks, but now only create them in the Concierge chat. We
    // still need to allow existing users who have tasks in the system DM to see them, but otherwise we don't need to
    // show that chat
    if (((_e = report === null || report === void 0 ? void 0 : report.participants) === null || _e === void 0 ? void 0 : _e[CONST_1.default.ACCOUNT_ID.NOTIFICATIONS]) && isEmptyReport(report)) {
        return null;
    }
    if (!canAccessReport(report, betas)) {
        return null;
    }
    var parentReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.parentReportID)];
    // If this is a transaction thread associated with a report that only has one transaction, omit it
    if (isOneTransactionThread(report, parentReport, parentReportAction)) {
        return null;
    }
    if (Object.values(CONST_1.default.REPORT.UNSUPPORTED_TYPE).includes((_f = report === null || report === void 0 ? void 0 : report.type) !== null && _f !== void 0 ? _f : '')) {
        return null;
    }
    // Include the currently viewed report. If we excluded the currently viewed report, then there
    // would be no way to highlight it in the options list and it would be confusing to users because they lose
    // a sense of context.
    if (report.reportID === currentReportId) {
        return CONST_1.default.REPORT_IN_LHN_REASONS.IS_FOCUSED;
    }
    // Retrieve the draft comment for the report and convert it to a boolean
    var hasDraftComment = (0, DraftCommentUtils_1.hasValidDraftComment)(report.reportID);
    // Include reports that are relevant to the user in any view mode. Criteria include having a draft or having a GBR showing.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (hasDraftComment) {
        return CONST_1.default.REPORT_IN_LHN_REASONS.HAS_DRAFT_COMMENT;
    }
    if (requiresAttentionFromCurrentUser(report, undefined, isReportArchived)) {
        return CONST_1.default.REPORT_IN_LHN_REASONS.HAS_GBR;
    }
    var isEmptyChat = isEmptyReport(report);
    var canHideReport = shouldHideReport(report, currentReportId);
    // Include reports if they are pinned
    if (report.isPinned) {
        return CONST_1.default.REPORT_IN_LHN_REASONS.PINNED_BY_USER;
    }
    var reportIsSettled = report.statusNum === CONST_1.default.REPORT.STATUS_NUM.REIMBURSED;
    // Always show IOU reports with violations unless they are reimbursed
    if (isExpenseRequest(report) && doesReportHaveViolations && !reportIsSettled) {
        return CONST_1.default.REPORT_IN_LHN_REASONS.HAS_IOU_VIOLATIONS;
    }
    // Hide only chat threads that haven't been commented on (other threads are actionable)
    if (isChatThread(report) && canHideReport && isEmptyChat) {
        return null;
    }
    // Include reports that have errors from trying to add a workspace
    // If we excluded it, then the red-brock-road pattern wouldn't work for the user to resolve the error
    if ((_g = report.errorFields) === null || _g === void 0 ? void 0 : _g.addWorkspaceRoom) {
        return CONST_1.default.REPORT_IN_LHN_REASONS.HAS_ADD_WORKSPACE_ROOM_ERRORS;
    }
    // All unread chats (even archived ones) in GSD mode will be shown. This is because GSD mode is specifically for focusing the user on the most relevant chats, primarily, the unread ones
    if (isInFocusMode) {
        var oneTransactionThreadReportID = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(report, chatReport, allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID)]);
        var oneTransactionThreadReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oneTransactionThreadReportID)];
        return isUnread(report, oneTransactionThreadReport) && getReportNotificationPreference(report) !== CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.MUTE
            ? CONST_1.default.REPORT_IN_LHN_REASONS.IS_UNREAD
            : null;
    }
    // Archived reports should always be shown when in default (most recent) mode. This is because you should still be able to access and search for the chats to find them.
    // This will get removed as part of https://github.com/Expensify/App/issues/59961
    // eslint-disable-next-line deprecation/deprecation
    if (isInDefaultMode && isArchivedNonExpenseReport(report, !!((_h = getReportNameValuePairs(report === null || report === void 0 ? void 0 : report.reportID)) === null || _h === void 0 ? void 0 : _h.private_isArchived))) {
        return CONST_1.default.REPORT_IN_LHN_REASONS.IS_ARCHIVED;
    }
    // Hide chats between two users that haven't been commented on from the LNH
    if (excludeEmptyChats && isEmptyChat && isChatReport(report) && !isPolicyExpenseChat(report) && !isSystemChat(report) && canHideReport) {
        return null;
    }
    if (isSelfDM(report)) {
        return includeSelfDM ? CONST_1.default.REPORT_IN_LHN_REASONS.IS_SELF_DM : null;
    }
    if (expensify_common_1.Str.isDomainEmail(login !== null && login !== void 0 ? login : '') && !includeDomainEmail) {
        return null;
    }
    // Hide chat threads where the parent message is pending removal
    if (!(0, EmptyObject_1.isEmptyObject)(parentReportAction) && (0, ReportActionsUtils_1.isPendingRemove)(parentReportAction) && (0, ReportActionsUtils_1.isThreadParentMessage)(parentReportAction, report === null || report === void 0 ? void 0 : report.reportID)) {
        return null;
    }
    return CONST_1.default.REPORT_IN_LHN_REASONS.DEFAULT;
}
/**
 * Takes several pieces of data from Onyx and evaluates if a report should be shown in the option list (either when searching
 * for reports or the reports shown in the LHN).
 *
 * This logic is very specific and the order of the logic is very important. It should fail quickly in most cases and also
 * filter out the majority of reports before filtering out very specific minority of reports.
 */
function shouldReportBeInOptionList(params) {
    return reasonForReportToBeInOptionList(params) !== null;
}
/**
 * Attempts to find a report in onyx with the provided list of participants. Does not include threads, task, expense, room, and policy expense chat.
 */
function getChatByParticipants(newParticipantList, reports, shouldIncludeGroupChats, shouldExcludeClosedReports) {
    if (reports === void 0) { reports = allReports; }
    if (shouldIncludeGroupChats === void 0) { shouldIncludeGroupChats = false; }
    if (shouldExcludeClosedReports === void 0) { shouldExcludeClosedReports = false; }
    var sortedNewParticipantList = newParticipantList.sort();
    return Object.values(reports !== null && reports !== void 0 ? reports : {}).find(function (report) {
        var _a;
        var participantAccountIDs = Object.keys((_a = report === null || report === void 0 ? void 0 : report.participants) !== null && _a !== void 0 ? _a : {});
        // This will get removed as part of https://github.com/Expensify/App/issues/59961
        // eslint-disable-next-line deprecation/deprecation
        var reportNameValuePairs = getReportNameValuePairs(report === null || report === void 0 ? void 0 : report.reportID);
        if (shouldExcludeClosedReports && isArchivedReport(reportNameValuePairs)) {
            return false;
        }
        // Skip if it's not a 1:1 chat
        if (!shouldIncludeGroupChats && !isOneOnOneChat(report) && !isSystemChat(report)) {
            return false;
        }
        // If we are looking for a group chat, then skip non-group chat report
        if (shouldIncludeGroupChats && !isGroupChat(report)) {
            return false;
        }
        var sortedParticipantsAccountIDs = participantAccountIDs.map(Number).sort();
        // Only return the chat if it has all the participants
        return (0, fast_equals_1.deepEqual)(sortedNewParticipantList, sortedParticipantsAccountIDs);
    });
}
/**
 * Attempts to find an invoice chat report in onyx with the provided policyID and receiverID.
 */
function getInvoiceChatByParticipants(receiverID, receiverType, policyID, reports) {
    if (reports === void 0) { reports = allReports; }
    return Object.values(reports !== null && reports !== void 0 ? reports : {}).find(function (report) {
        // This will get removed as part of https://github.com/Expensify/App/issues/59961
        // eslint-disable-next-line deprecation/deprecation
        var reportNameValuePairs = getReportNameValuePairs(report === null || report === void 0 ? void 0 : report.reportID);
        var isReportArchived = isArchivedReport(reportNameValuePairs);
        if (!report || !isInvoiceRoom(report) || isArchivedNonExpenseReport(report, isReportArchived)) {
            return false;
        }
        var isSameReceiver = report.invoiceReceiver &&
            report.invoiceReceiver.type === receiverType &&
            (('accountID' in report.invoiceReceiver && report.invoiceReceiver.accountID === receiverID) ||
                ('policyID' in report.invoiceReceiver && report.invoiceReceiver.policyID === receiverID));
        return report.policyID === policyID && isSameReceiver;
    });
}
/**
 * Attempts to find a policy expense report in onyx that is owned by ownerAccountID in a given policy
 */
function getPolicyExpenseChat(ownerAccountID, policyID) {
    if (!ownerAccountID || !policyID) {
        return;
    }
    return Object.values(allReports !== null && allReports !== void 0 ? allReports : {}).find(function (report) {
        // If the report has been deleted, then skip it
        if (!report) {
            return false;
        }
        return report.policyID === policyID && isPolicyExpenseChat(report) && !isThread(report) && report.ownerAccountID === ownerAccountID;
    });
}
function getAllPolicyReports(policyID) {
    return Object.values(allReports !== null && allReports !== void 0 ? allReports : {}).filter(function (report) { return (report === null || report === void 0 ? void 0 : report.policyID) === policyID; });
}
/**
 * Returns true if Chronos is one of the chat participants (1:1)
 */
function chatIncludesChronos(report) {
    var _a;
    var participantAccountIDs = Object.keys((_a = report === null || report === void 0 ? void 0 : report.participants) !== null && _a !== void 0 ? _a : {}).map(Number);
    return participantAccountIDs.includes(CONST_1.default.ACCOUNT_ID.CHRONOS);
}
function chatIncludesChronosWithID(reportOrID) {
    if (!reportOrID) {
        return false;
    }
    var report = typeof reportOrID === 'string' ? getReport(reportOrID, allReports) : reportOrID;
    return chatIncludesChronos(report);
}
/**
 * Can only flag if:
 *
 * - It was written by someone else and isn't a whisper
 * - It's a welcome message whisper
 * - It's an ADD_COMMENT that is not an attachment
 */
function canFlagReportAction(reportAction, reportID) {
    var _a;
    var isCurrentUserAction = (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID) === currentUserAccountID;
    if ((0, ReportActionsUtils_1.isWhisperAction)(reportAction)) {
        // Allow flagging whispers that are sent by other users
        if (!isCurrentUserAction && (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID) !== CONST_1.default.ACCOUNT_ID.CONCIERGE) {
            return true;
        }
        // Disallow flagging the rest of whisper as they are sent by us
        return false;
    }
    var report = getReportOrDraftReport(reportID);
    // If the childReportID exists in reportAction and is equal to the reportID,
    // the report action being evaluated is the parent report action in a thread, and we should get the parent report to evaluate instead.
    if (((_a = reportAction === null || reportAction === void 0 ? void 0 : reportAction.childReportID) === null || _a === void 0 ? void 0 : _a.toString()) === (reportID === null || reportID === void 0 ? void 0 : reportID.toString())) {
        report = getReportOrDraftReport(report === null || report === void 0 ? void 0 : report.parentReportID);
    }
    return !!(!isCurrentUserAction &&
        (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT &&
        !(0, ReportActionsUtils_1.isDeletedAction)(reportAction) &&
        !(0, ReportActionsUtils_1.isCreatedTaskReportAction)(reportAction) &&
        !(0, EmptyObject_1.isEmptyObject)(report) &&
        report &&
        isAllowedToComment(report));
}
/**
 * Whether flag comment page should show
 */
function shouldShowFlagComment(reportAction, report, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    return (canFlagReportAction(reportAction, report === null || report === void 0 ? void 0 : report.reportID) &&
        !isArchivedNonExpenseReport(report, isReportArchived) &&
        !chatIncludesChronos(report) &&
        !isConciergeChatReport(report) &&
        (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID) !== CONST_1.default.ACCOUNT_ID.CONCIERGE);
}
/**
 * Performs the markdown conversion, and replaces code points > 127 with C escape sequences
 * Used for compatibility with the backend auth validator for AddComment, and to account for MD in comments
 * @returns The comment's total length as seen from the backend
 */
function getCommentLength(textComment, parsingDetails) {
    return getParsedComment(textComment, parsingDetails)
        .replace(/[^ -~]/g, '\\u????')
        .trim().length;
}
function getRouteFromLink(url) {
    if (!url) {
        return '';
    }
    // Get the reportID from URL
    var route = url;
    var localWebAndroidRegEx = /^(https:\/\/([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3}))/;
    linkingConfig_1.linkingConfig.prefixes.forEach(function (prefix) {
        if (route.startsWith(prefix)) {
            route = route.replace(prefix, '');
        }
        else if (localWebAndroidRegEx.test(route)) {
            route = route.replace(localWebAndroidRegEx, '');
        }
        else {
            return;
        }
        // Remove the port if it's a localhost URL
        if (/^:\d+/.test(route)) {
            route = route.replace(/:\d+/, '');
        }
        // Remove the leading slash if exists
        if (route.startsWith('/')) {
            route = route.replace('/', '');
        }
    });
    return route;
}
function parseReportRouteParams(route) {
    var _a;
    var parsingRoute = route;
    if (parsingRoute.at(0) === '/') {
        // remove the first slash
        parsingRoute = parsingRoute.slice(1);
    }
    if (!parsingRoute.startsWith((0, Url_1.addTrailingForwardSlash)(ROUTES_1.default.REPORT))) {
        return { reportID: '', isSubReportPageRoute: false };
    }
    var state = (0, getStateFromPath_1.default)(parsingRoute);
    var focusedRoute = (0, native_1.findFocusedRoute)(state);
    var reportID = (focusedRoute === null || focusedRoute === void 0 ? void 0 : focusedRoute.params) && 'reportID' in focusedRoute.params ? (_a = focusedRoute === null || focusedRoute === void 0 ? void 0 : focusedRoute.params) === null || _a === void 0 ? void 0 : _a.reportID : '';
    if (!reportID) {
        return { reportID: '', isSubReportPageRoute: false };
    }
    return {
        reportID: reportID,
        // We're checking the route start with `r/`, the sub report route is the route that we can open from report screen like `r/:reportID/details`
        isSubReportPageRoute: (focusedRoute === null || focusedRoute === void 0 ? void 0 : focusedRoute.name) !== SCREENS_1.default.REPORT,
    };
}
function getReportIDFromLink(url) {
    var route = getRouteFromLink(url);
    var _a = parseReportRouteParams(route), reportID = _a.reportID, isSubReportPageRoute = _a.isSubReportPageRoute;
    if (isSubReportPageRoute) {
        // We allow the Sub-Report deep link routes (settings, details, etc.) to be handled by their respective component pages
        return '';
    }
    return reportID;
}
/**
 * Check if the chat report is linked to an iou that is waiting for the current user to add a credit bank account.
 */
function hasIOUWaitingOnCurrentUserBankAccount(chatReport) {
    if (chatReport === null || chatReport === void 0 ? void 0 : chatReport.iouReportID) {
        var iouReport = getReport(chatReport.iouReportID, allReports);
        if ((iouReport === null || iouReport === void 0 ? void 0 : iouReport.isWaitingOnBankAccount) && (iouReport === null || iouReport === void 0 ? void 0 : iouReport.ownerAccountID) === currentUserAccountID) {
            return true;
        }
    }
    return false;
}
/**
 * Users can submit an expense:
 * - in policy expense chats only if they are in a role of a member in the chat (in other words, if it's their policy expense chat)
 * - in an open or submitted expense report tied to a policy expense chat the user owns
 *     - employee can submit expenses in a submitted expense report only if the policy has Instant Submit settings turned on
 * - in an IOU report, which is not settled yet
 * - in a 1:1 DM chat
 */
function canRequestMoney(report, policy, otherParticipants) {
    var _a, _b;
    // User cannot submit expenses in a chat thread, task report or in a chat room
    if (isChatThread(report) || isTaskReport(report) || isChatRoom(report) || isSelfDM(report) || isGroupChat(report)) {
        return false;
    }
    // Users can only submit expenses in DMs if they are a 1:1 DM
    if (isDM(report)) {
        return otherParticipants.length === 1;
    }
    // Prevent requesting money if pending IOU report waiting for their bank account already exists
    if (hasIOUWaitingOnCurrentUserBankAccount(report)) {
        return false;
    }
    var isOwnPolicyExpenseChat = (_a = report === null || report === void 0 ? void 0 : report.isOwnPolicyExpenseChat) !== null && _a !== void 0 ? _a : false;
    if (isExpenseReport(report) && getParentReport(report)) {
        isOwnPolicyExpenseChat = !!((_b = getParentReport(report)) === null || _b === void 0 ? void 0 : _b.isOwnPolicyExpenseChat);
    }
    // In case there are no other participants than the current user and it's not user's own policy expense chat, they can't submit expenses from such report
    if (otherParticipants.length === 0 && !isOwnPolicyExpenseChat) {
        return false;
    }
    // Current user must be a manager or owner of this IOU
    if (isIOUReport(report) && currentUserAccountID !== (report === null || report === void 0 ? void 0 : report.managerID) && currentUserAccountID !== (report === null || report === void 0 ? void 0 : report.ownerAccountID)) {
        return false;
    }
    // User can submit expenses in any IOU report, unless paid, but the user can only submit expenses in an expense report
    // which is tied to their expense chat.
    if (isMoneyRequestReport(report)) {
        var canAddTransactions = canAddTransaction(report);
        return isReportInGroupPolicy(report) ? isOwnPolicyExpenseChat && canAddTransactions : canAddTransactions;
    }
    // In the case of policy expense chat, users can only submit expenses from their own policy expense chat
    return !isPolicyExpenseChat(report) || isOwnPolicyExpenseChat;
}
function isGroupChatAdmin(report, accountID) {
    var _a;
    if (!(report === null || report === void 0 ? void 0 : report.participants)) {
        return false;
    }
    var reportParticipants = (_a = report.participants) !== null && _a !== void 0 ? _a : {};
    var participant = reportParticipants[accountID];
    return (participant === null || participant === void 0 ? void 0 : participant.role) === CONST_1.default.REPORT.ROLE.ADMIN;
}
/**
 * Helper method to define what expense options we want to show for particular method.
 * There are 4 expense options: Submit, Split, Pay and Track expense:
 * - Submit option should show for:
 *     - DMs
 *     - own policy expense chats
 *     - open and processing expense reports tied to own policy expense chat
 *     - unsettled IOU reports
 * - Pay option should show for:
 *     - DMs
 * - Split options should show for:
 *     - DMs
 *     - chat/policy rooms with more than 1 participant
 *     - groups chats with 2 and more participants
 *     - corporate expense chats
 * - Track expense option should show for:
 *    - Self DMs
 *    - own policy expense chats
 *    - open and processing expense reports tied to own policy expense chat
 * - Send invoice option should show for:
 *    - invoice rooms if the user is an admin of the sender workspace
 * None of the options should show in chat threads or if there is some special Expensify account
 * as a participant of the report.
 */
function getMoneyRequestOptions(report, policy, reportParticipants, filterDeprecatedTypes) {
    var _a;
    if (filterDeprecatedTypes === void 0) { filterDeprecatedTypes = false; }
    var teacherUnitePolicyID = environment === CONST_1.default.ENVIRONMENT.PRODUCTION ? CONST_1.default.TEACHERS_UNITE.PROD_POLICY_ID : CONST_1.default.TEACHERS_UNITE.TEST_POLICY_ID;
    var isTeachersUniteReport = (report === null || report === void 0 ? void 0 : report.policyID) === teacherUnitePolicyID;
    // This will get removed as part of https://github.com/Expensify/App/issues/59961
    // eslint-disable-next-line deprecation/deprecation
    var reportNameValuePairs = getReportNameValuePairs(report === null || report === void 0 ? void 0 : report.reportID);
    // In any thread, task report or trip room, we do not allow any new expenses
    if (isChatThread(report) || isTaskReport(report) || isInvoiceReport(report) || isSystemChat(report) || isArchivedReport(reportNameValuePairs) || isTripRoom(report)) {
        return [];
    }
    if (isInvoiceRoom(report)) {
        if ((0, PolicyUtils_1.canSendInvoiceFromWorkspace)(policy === null || policy === void 0 ? void 0 : policy.id) && isPolicyAdmin(report === null || report === void 0 ? void 0 : report.policyID, allPolicies)) {
            return [CONST_1.default.IOU.TYPE.INVOICE];
        }
        return [];
    }
    // We don't allow IOU actions if an Expensify account is a participant of the report, unless the policy that the report is on is owned by an Expensify account
    var doParticipantsIncludeExpensifyAccounts = (0, intersection_1.default)(reportParticipants, CONST_1.default.EXPENSIFY_ACCOUNT_IDS).length > 0;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policyOwnerAccountID = (_a = getPolicy(report === null || report === void 0 ? void 0 : report.policyID)) === null || _a === void 0 ? void 0 : _a.ownerAccountID;
    var isPolicyOwnedByExpensifyAccounts = policyOwnerAccountID ? CONST_1.default.EXPENSIFY_ACCOUNT_IDS.includes(policyOwnerAccountID) : false;
    if (doParticipantsIncludeExpensifyAccounts && !isPolicyOwnedByExpensifyAccounts) {
        // Allow create expense option for Manager McTest report
        if (reportParticipants.some(function (accountID) { return accountID === CONST_1.default.ACCOUNT_ID.MANAGER_MCTEST; }) && Permissions_1.default.isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MANAGER_MCTEST, allBetas)) {
            return [CONST_1.default.IOU.TYPE.SUBMIT];
        }
        return [];
    }
    var otherParticipants = reportParticipants.filter(function (accountID) { return (currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID) !== accountID; });
    var hasSingleParticipantInReport = otherParticipants.length === 1;
    var options = [];
    if (isSelfDM(report)) {
        options = [CONST_1.default.IOU.TYPE.TRACK];
    }
    if (canRequestMoney(report, policy, otherParticipants)) {
        // For Teachers Unite policy, don't show Create Expense option
        if (!isTeachersUniteReport) {
            options = __spreadArray(__spreadArray([], options, true), [CONST_1.default.IOU.TYPE.SUBMIT], false);
            if (!filterDeprecatedTypes) {
                options = __spreadArray(__spreadArray([], options, true), [CONST_1.default.IOU.TYPE.REQUEST], false);
            }
        }
        // If the user can request money from the workspace report, they can also track expenses
        if (isPolicyExpenseChat(report) || isExpenseReport(report)) {
            options = __spreadArray(__spreadArray([], options, true), [CONST_1.default.IOU.TYPE.TRACK], false);
        }
    }
    // For expense reports on Teachers Unite workspace, disable "Create report" option
    if (isExpenseReport(report) && (report === null || report === void 0 ? void 0 : report.policyID) === teacherUnitePolicyID) {
        options = options.filter(function (option) { return option !== CONST_1.default.IOU.TYPE.SUBMIT; });
    }
    // User created policy rooms and default rooms like #admins or #announce will always have the Split Expense option
    // unless there are no other participants at all (e.g. #admins room for a policy with only 1 admin)
    // DM chats will have the Split Expense option.
    // Your own expense chats will have the split expense option.
    // Only show Split Expense for TU policy
    if ((isChatRoom(report) && !isAnnounceRoom(report) && otherParticipants.length > 0) ||
        (isDM(report) && otherParticipants.length > 0) ||
        (isGroupChat(report) && otherParticipants.length > 0) ||
        (isPolicyExpenseChat(report) && (report === null || report === void 0 ? void 0 : report.isOwnPolicyExpenseChat) && isTeachersUniteReport)) {
        options = __spreadArray(__spreadArray([], options, true), [CONST_1.default.IOU.TYPE.SPLIT], false);
    }
    // Pay someone option should be visible only in 1:1 DMs
    if (isDM(report) && hasSingleParticipantInReport) {
        options = __spreadArray(__spreadArray([], options, true), [CONST_1.default.IOU.TYPE.PAY], false);
        if (!filterDeprecatedTypes) {
            options = __spreadArray(__spreadArray([], options, true), [CONST_1.default.IOU.TYPE.SEND], false);
        }
    }
    return options;
}
/**
 * This is a temporary function to help with the smooth transition with the oldDot.
 * This function will be removed once the transition occurs in oldDot to new links.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
function temporary_getMoneyRequestOptions(report, policy, reportParticipants) {
    return getMoneyRequestOptions(report, policy, reportParticipants, true);
}
/**
 * Invoice sender, invoice receiver and auto-invited admins cannot leave
 */
function canLeaveInvoiceRoom(report) {
    var _a, _b, _c;
    if (!report || !(report === null || report === void 0 ? void 0 : report.invoiceReceiver)) {
        return false;
    }
    if ((report === null || report === void 0 ? void 0 : report.statusNum) === CONST_1.default.REPORT.STATUS_NUM.CLOSED) {
        return false;
    }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var isSenderPolicyAdmin = ((_a = getPolicy(report.policyID)) === null || _a === void 0 ? void 0 : _a.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    if (isSenderPolicyAdmin) {
        return false;
    }
    if (report.invoiceReceiver.type === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
        return ((_b = report === null || report === void 0 ? void 0 : report.invoiceReceiver) === null || _b === void 0 ? void 0 : _b.accountID) !== currentUserAccountID;
    }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var isReceiverPolicyAdmin = ((_c = getPolicy(report.invoiceReceiver.policyID)) === null || _c === void 0 ? void 0 : _c.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    if (isReceiverPolicyAdmin) {
        return false;
    }
    return true;
}
function isCurrentUserTheOnlyParticipant(participantAccountIDs) {
    return !!((participantAccountIDs === null || participantAccountIDs === void 0 ? void 0 : participantAccountIDs.length) === 1 && (participantAccountIDs === null || participantAccountIDs === void 0 ? void 0 : participantAccountIDs.at(0)) === currentUserAccountID);
}
/**
 * Returns display names for those that can see the whisper.
 * However, it returns "you" if the current user is the only one who can see it besides the person that sent it.
 */
function getWhisperDisplayNames(participantAccountIDs) {
    var isWhisperOnlyVisibleToCurrentUser = isCurrentUserTheOnlyParticipant(participantAccountIDs);
    // When the current user is the only participant, the display name needs to be "you" because that's the only person reading it
    if (isWhisperOnlyVisibleToCurrentUser) {
        return (0, Localize_1.translateLocal)('common.youAfterPreposition');
    }
    return participantAccountIDs === null || participantAccountIDs === void 0 ? void 0 : participantAccountIDs.map(function (accountID) { return getDisplayNameForParticipant({ accountID: accountID, shouldUseShortForm: !isWhisperOnlyVisibleToCurrentUser }); }).join(', ');
}
/**
 * Show subscript on expense chats / threads and expense requests
 */
function shouldReportShowSubscript(report, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    if (isArchivedNonExpenseReport(report, isReportArchived) && !isWorkspaceThread(report)) {
        return false;
    }
    if (isPolicyExpenseChat(report) && !isChatThread(report) && !isTaskReport(report) && !(report === null || report === void 0 ? void 0 : report.isOwnPolicyExpenseChat)) {
        return true;
    }
    if (isPolicyExpenseChat(report) && !isThread(report) && !isTaskReport(report)) {
        return true;
    }
    if (isExpenseRequest(report)) {
        return true;
    }
    if (isExpenseReport(report) && isOneTransactionReport(report)) {
        return true;
    }
    if (isWorkspaceTaskReport(report)) {
        return true;
    }
    if (isWorkspaceThread(report)) {
        return true;
    }
    if (isInvoiceRoom(report) || isInvoiceReport(report)) {
        return true;
    }
    return false;
}
/**
 * Return true if reports data exists
 */
function isReportDataReady() {
    return !(0, EmptyObject_1.isEmptyObject)(allReports) && Object.keys(allReports !== null && allReports !== void 0 ? allReports : {}).some(function (key) { var _a; return (_a = allReports === null || allReports === void 0 ? void 0 : allReports[key]) === null || _a === void 0 ? void 0 : _a.reportID; });
}
/**
 * Return true if reportID from path is valid
 */
function isValidReportIDFromPath(reportIDFromPath) {
    return !!reportIDFromPath && !['', 'null', 'undefined', '0', '-1'].includes(reportIDFromPath);
}
/**
 * Return the errors we have when creating a chat, a workspace room, or a new empty report
 */
function getCreationReportErrors(report) {
    var _a, _b, _c, _d, _e;
    // We are either adding a workspace room, creating a chat, or we're creating a report, it isn't possible for all of these to have errors for the same report at the same time, so
    // simply looking up the first truthy value will get the relevant property if it's set.
    return (_d = (_b = (_a = report === null || report === void 0 ? void 0 : report.errorFields) === null || _a === void 0 ? void 0 : _a.addWorkspaceRoom) !== null && _b !== void 0 ? _b : (_c = report === null || report === void 0 ? void 0 : report.errorFields) === null || _c === void 0 ? void 0 : _c.createChat) !== null && _d !== void 0 ? _d : (_e = report === null || report === void 0 ? void 0 : report.errorFields) === null || _e === void 0 ? void 0 : _e.createReport;
}
/**
 * Return true if the expense report is marked for deletion.
 */
function isMoneyRequestReportPendingDeletion(reportOrID) {
    var report = typeof reportOrID === 'string' ? getReport(reportOrID, allReports) : reportOrID;
    if (!isMoneyRequestReport(report)) {
        return false;
    }
    var parentReportAction = (0, ReportActionsUtils_1.getReportAction)(report === null || report === void 0 ? void 0 : report.parentReportID, report === null || report === void 0 ? void 0 : report.parentReportActionID);
    return (parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}
function navigateToLinkedReportAction(ancestor, isInNarrowPaneModal, canUserPerformWrite, isOffline) {
    var parentReport = getReportOrDraftReport(ancestor.report.parentReportID);
    var parentReportAction = (0, ReportActionsUtils_1.getReportAction)(ancestor.report.parentReportID, ancestor.report.parentReportActionID);
    var newAncestor = ancestor;
    // If `parentReport` is an IOU or Expense report, navigate directly to `parentReport`,
    // preventing redundant navigation when threading back to the parent chat thread
    if (parentReport && parentReportAction && (isIOUReport(parentReport) || isExpenseReport(parentReport))) {
        newAncestor = __assign(__assign({}, ancestor), { report: parentReport, reportAction: parentReportAction });
    }
    if (isInNarrowPaneModal) {
        Navigation_1.default.navigate(ROUTES_1.default.SEARCH_REPORT.getRoute({
            reportID: newAncestor.report.reportID,
            reportActionID: newAncestor.reportAction.reportActionID,
            backTo: SCREENS_1.default.SEARCH.REPORT_RHP,
        }));
        return;
    }
    // Pop the thread report screen before navigating to the chat report.
    Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID.getRoute(newAncestor.report.reportID));
    var isVisibleAction = (0, ReportActionsUtils_1.shouldReportActionBeVisible)(newAncestor.reportAction, newAncestor.reportAction.reportActionID, canUserPerformWrite);
    if (isVisibleAction && !isOffline) {
        // Pop the chat report screen before navigating to the linked report action.
        Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID.getRoute(newAncestor.report.reportID, newAncestor.reportAction.reportActionID));
    }
}
function canUserPerformWriteAction(report) {
    var reportErrors = getCreationReportErrors(report);
    // If the expense report is marked for deletion, let us prevent any further write action.
    if (isMoneyRequestReportPendingDeletion(report)) {
        return false;
    }
    // This will get removed as part of https://github.com/Expensify/App/issues/59961
    // eslint-disable-next-line deprecation/deprecation
    var reportNameValuePairs = getReportNameValuePairs(report === null || report === void 0 ? void 0 : report.reportID);
    return (!isArchivedNonExpenseReport(report, !!(reportNameValuePairs === null || reportNameValuePairs === void 0 ? void 0 : reportNameValuePairs.private_isArchived)) &&
        (0, EmptyObject_1.isEmptyObject)(reportErrors) &&
        report &&
        isAllowedToComment(report) &&
        !isAnonymousUser &&
        canWriteInReport(report));
}
/**
 * Returns ID of the original report from which the given reportAction is first created.
 */
function getOriginalReportID(reportID, reportAction) {
    var _a, _b;
    if (!reportID) {
        return undefined;
    }
    var reportActions = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID)];
    var currentReportAction = (reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID) ? reportActions === null || reportActions === void 0 ? void 0 : reportActions[reportAction.reportActionID] : undefined;
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    var chatReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.chatReportID)];
    var transactionThreadReportID = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(report, chatReport, reportActions !== null && reportActions !== void 0 ? reportActions : []);
    var isThreadReportParentAction = ((_a = reportAction === null || reportAction === void 0 ? void 0 : reportAction.childReportID) === null || _a === void 0 ? void 0 : _a.toString()) === reportID;
    if (Object.keys(currentReportAction !== null && currentReportAction !== void 0 ? currentReportAction : {}).length === 0) {
        return isThreadReportParentAction ? (_b = getReport(reportID, allReports)) === null || _b === void 0 ? void 0 : _b.parentReportID : (transactionThreadReportID !== null && transactionThreadReportID !== void 0 ? transactionThreadReportID : reportID);
    }
    return reportID;
}
/**
 * Return the pendingAction and the errors resulting from either
 *
 * - creating a workspace room
 * - starting a chat
 * - paying the expense
 *
 * while being offline
 */
function getReportOfflinePendingActionAndErrors(report) {
    var _a, _b, _c, _d, _e, _f, _g;
    // It shouldn't be possible for all of these actions to be pending (or to have errors) for the same report at the same time, so just take the first that exists
    var reportPendingAction = (_f = (_d = (_b = (_a = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _a === void 0 ? void 0 : _a.addWorkspaceRoom) !== null && _b !== void 0 ? _b : (_c = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _c === void 0 ? void 0 : _c.createChat) !== null && _d !== void 0 ? _d : (_e = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _e === void 0 ? void 0 : _e.reimbursed) !== null && _f !== void 0 ? _f : (_g = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _g === void 0 ? void 0 : _g.createReport;
    var reportErrors = getCreationReportErrors(report);
    return { reportPendingAction: reportPendingAction, reportErrors: reportErrors };
}
/**
 * Check if the report can create the expense with type is iouType
 */
function canCreateRequest(report, policy, iouType) {
    var _a;
    var participantAccountIDs = Object.keys((_a = report === null || report === void 0 ? void 0 : report.participants) !== null && _a !== void 0 ? _a : {}).map(Number);
    if (!canUserPerformWriteAction(report)) {
        return false;
    }
    var requestOptions = getMoneyRequestOptions(report, policy, participantAccountIDs);
    requestOptions.push(CONST_1.default.IOU.TYPE.CREATE);
    return requestOptions.includes(iouType);
}
function getWorkspaceChats(policyID, accountIDs, reports) {
    if (reports === void 0) { reports = allReports; }
    return Object.values(reports !== null && reports !== void 0 ? reports : {}).filter(function (report) { return isPolicyExpenseChat(report) && !!policyID && (report === null || report === void 0 ? void 0 : report.policyID) === policyID && (report === null || report === void 0 ? void 0 : report.ownerAccountID) && accountIDs.includes(report === null || report === void 0 ? void 0 : report.ownerAccountID); });
}
/**
 * Gets all reports that relate to the policy
 *
 * @param policyID - the workspace ID to get all associated reports
 */
function getAllWorkspaceReports(policyID) {
    if (!policyID) {
        return [];
    }
    return Object.values(allReports !== null && allReports !== void 0 ? allReports : {}).filter(function (report) { return (report === null || report === void 0 ? void 0 : report.policyID) === policyID; });
}
/**
 * @param policy - the workspace the report is on, null if the user isn't a member of the workspace
 */
function shouldDisableRename(report, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    if (isDefaultRoom(report) ||
        isReportArchived ||
        isPublicRoom(report) ||
        isThread(report) ||
        isMoneyRequest(report) ||
        isMoneyRequestReport(report) ||
        isPolicyExpenseChat(report) ||
        isInvoiceRoom(report) ||
        isInvoiceReport(report) ||
        isSystemChat(report)) {
        return true;
    }
    if (isGroupChat(report)) {
        return false;
    }
    if (isDeprecatedGroupDM(report) || isTaskReport(report)) {
        return true;
    }
    return false;
}
/**
 * @param policy - the workspace the report is on, null if the user isn't a member of the workspace
 */
function canEditWriteCapability(report, policy, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    return (0, PolicyUtils_1.isPolicyAdmin)(policy) && !isAdminRoom(report) && !isReportArchived && !isThread(report) && !isInvoiceRoom(report) && !isPolicyExpenseChat(report);
}
/**
 * @param policy - the workspace the room is on, null if the user isn't a member of the workspace
 * @param isReportArchived - whether the workspace room is archived
 */
function canEditRoomVisibility(policy, isReportArchived) {
    return !isReportArchived && (0, PolicyUtils_1.isPolicyAdmin)(policy);
}
/**
 * Returns the onyx data needed for the task assignee chat
 */
function getTaskAssigneeChatOnyxData(accountID, assigneeAccountID, taskReportID, assigneeChatReportID, parentReportID, title, assigneeChatReport) {
    var _a, _b, _c, _d, _e, _f, _g;
    var _h, _j, _k;
    // Set if we need to add a comment to the assignee chat notifying them that they have been assigned a task
    var optimisticAssigneeAddComment;
    // Set if this is a new chat that needs to be created for the assignee
    var optimisticChatCreatedReportAction;
    var assigneeChatReportMetadata = getReportMetadata(assigneeChatReportID);
    var currentTime = DateUtils_1.default.getDBTime();
    var optimisticData = [];
    var successData = [];
    var failureData = [];
    // You're able to assign a task to someone you haven't chatted with before - so we need to optimistically create the chat and the chat reportActions
    // Only add the assignee chat report to onyx if we haven't already set it optimistically
    if ((assigneeChatReportMetadata === null || assigneeChatReportMetadata === void 0 ? void 0 : assigneeChatReportMetadata.isOptimisticReport) && ((_h = assigneeChatReport === null || assigneeChatReport === void 0 ? void 0 : assigneeChatReport.pendingFields) === null || _h === void 0 ? void 0 : _h.createChat) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        optimisticChatCreatedReportAction = buildOptimisticCreatedReportAction(assigneeChatReportID);
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(assigneeChatReportID),
            value: {
                pendingFields: {
                    createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(assigneeChatReportID),
            value: {
                isOptimisticReport: true,
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(assigneeChatReportID),
            value: (_a = {}, _a[optimisticChatCreatedReportAction.reportActionID] = optimisticChatCreatedReportAction, _a),
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(assigneeChatReportID),
            value: {
                pendingFields: {
                    createChat: null,
                },
                // BE will send a different participant. We clear the optimistic one to avoid duplicated entries
                participants: (_b = {}, _b[assigneeAccountID] = null, _b),
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(assigneeChatReportID),
            value: {
                isOptimisticReport: false,
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(assigneeChatReportID),
            value: {
                isOptimisticReport: false,
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(assigneeChatReportID),
            value: null,
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(assigneeChatReportID),
            value: (_c = {}, _c[optimisticChatCreatedReportAction.reportActionID] = { pendingAction: null }, _c),
        }, 
        // If we failed, we want to remove the optimistic personal details as it was likely due to an invalid login
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: (_d = {},
                _d[assigneeAccountID] = null,
                _d),
        });
    }
    // If you're choosing to share the task in the same DM as the assignee then we don't need to create another reportAction indicating that you've been assigned
    if (assigneeChatReportID !== parentReportID) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        var displayname = ((_j = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[assigneeAccountID]) === null || _j === void 0 ? void 0 : _j.displayName) || ((_k = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[assigneeAccountID]) === null || _k === void 0 ? void 0 : _k.login) || '';
        optimisticAssigneeAddComment = buildOptimisticTaskCommentReportAction(taskReportID, title, assigneeAccountID, "assigned to ".concat(displayname), parentReportID);
        var lastAssigneeCommentText = formatReportLastMessageText((0, ReportActionsUtils_1.getReportActionText)(optimisticAssigneeAddComment.reportAction));
        var optimisticAssigneeReport = {
            lastVisibleActionCreated: currentTime,
            lastMessageText: lastAssigneeCommentText,
            lastActorAccountID: accountID,
            lastReadTime: currentTime,
        };
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(assigneeChatReportID),
            value: (_e = {}, _e[optimisticAssigneeAddComment.reportAction.reportActionID] = optimisticAssigneeAddComment.reportAction, _e),
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(assigneeChatReportID),
            value: optimisticAssigneeReport,
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(assigneeChatReportID),
            value: (_f = {}, _f[optimisticAssigneeAddComment.reportAction.reportActionID] = { isOptimisticAction: null }, _f),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(assigneeChatReportID),
            value: (_g = {}, _g[optimisticAssigneeAddComment.reportAction.reportActionID] = { pendingAction: null }, _g),
        });
    }
    return {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
        optimisticAssigneeAddComment: optimisticAssigneeAddComment,
        optimisticChatCreatedReportAction: optimisticChatCreatedReportAction,
    };
}
/**
 * Return iou report action display message
 */
function getIOUReportActionDisplayMessage(reportAction, transaction) {
    var _a, _b, _c, _d, _e;
    if (!(0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction)) {
        return '';
    }
    var originalMessage = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction);
    var _f = originalMessage !== null && originalMessage !== void 0 ? originalMessage : {}, IOUReportID = _f.IOUReportID, automaticAction = _f.automaticAction;
    var iouReport = getReportOrDraftReport(IOUReportID);
    var translationKey;
    if ((originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY) {
        // The `REPORT_ACTION_TYPE.PAY` action type is used for both fulfilling existing requests and sending money. To
        // differentiate between these two scenarios, we check if the `originalMessage` contains the `IOUDetails`
        // property. If it does, it indicates that this is a 'Pay someone' action.
        var _g = (_b = (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.IOUDetails) !== null && _a !== void 0 ? _a : originalMessage) !== null && _b !== void 0 ? _b : {}, amount_3 = _g.amount, currency = _g.currency;
        var formattedAmount_3 = (_c = (0, CurrencyUtils_1.convertToDisplayString)(Math.abs(amount_3), currency)) !== null && _c !== void 0 ? _c : '';
        switch (originalMessage.paymentType) {
            case CONST_1.default.IOU.PAYMENT_TYPE.ELSEWHERE:
                translationKey = hasMissingInvoiceBankAccount(IOUReportID) ? 'iou.payerSettledWithMissingBankAccount' : 'iou.paidElsewhere';
                break;
            case CONST_1.default.IOU.PAYMENT_TYPE.EXPENSIFY:
            case CONST_1.default.IOU.PAYMENT_TYPE.VBBA:
                translationKey = 'iou.paidWithExpensify';
                if (automaticAction) {
                    translationKey = 'iou.automaticallyPaidWithExpensify';
                }
                break;
            default:
                translationKey = 'iou.payerPaidAmount';
                break;
        }
        return (0, Localize_1.translateLocal)(translationKey, { amount: formattedAmount_3, payer: '' });
    }
    var amount = (_d = (0, TransactionUtils_1.getAmount)(transaction, !(0, EmptyObject_1.isEmptyObject)(iouReport) && isExpenseReport(iouReport))) !== null && _d !== void 0 ? _d : 0;
    var formattedAmount = (_e = (0, CurrencyUtils_1.convertToDisplayString)(amount, (0, TransactionUtils_1.getCurrency)(transaction))) !== null && _e !== void 0 ? _e : '';
    var isRequestSettled = isSettled(IOUReportID);
    var isApproved = isReportApproved({ report: iouReport });
    if (isRequestSettled) {
        return (0, Localize_1.translateLocal)('iou.payerSettled', {
            amount: formattedAmount,
        });
    }
    if (isApproved) {
        return (0, Localize_1.translateLocal)('iou.approvedAmount', {
            amount: formattedAmount,
        });
    }
    if ((0, ReportActionsUtils_1.isSplitBillAction)(reportAction)) {
        translationKey = 'iou.didSplitAmount';
    }
    else if ((0, ReportActionsUtils_1.isTrackExpenseAction)(reportAction)) {
        translationKey = 'iou.trackedAmount';
    }
    else {
        translationKey = 'iou.expenseAmount';
    }
    return (0, Localize_1.translateLocal)(translationKey, {
        formattedAmount: formattedAmount,
        comment: (0, TransactionUtils_1.getMerchantOrDescription)(transaction),
    });
}
/**
 * Checks if a report is a group chat.
 *
 * A report is a group chat if it meets the following conditions:
 * - Not a chat thread.
 * - Not a task report.
 * - Not an expense / IOU report.
 * - Not an archived room.
 * - Not a public / admin / announce chat room (chat type doesn't match any of the specified types).
 * - More than 2 participants.
 *
 */
function isDeprecatedGroupDM(report) {
    var _a;
    return !!(report &&
        !isChatThread(report) &&
        !isTaskReport(report) &&
        !isInvoiceReport(report) &&
        !isMoneyRequestReport(report) &&
        // This will get removed as part of https://github.com/Expensify/App/issues/59961
        // eslint-disable-next-line deprecation/deprecation
        !isArchivedReport(getReportNameValuePairs(report === null || report === void 0 ? void 0 : report.reportID)) &&
        !Object.values(CONST_1.default.REPORT.CHAT_TYPE).some(function (chatType) { return chatType === getChatType(report); }) &&
        Object.keys((_a = report.participants) !== null && _a !== void 0 ? _a : {})
            .map(Number)
            .filter(function (accountID) { return accountID !== currentUserAccountID; }).length > 1);
}
/**
 * A "root" group chat is the top level group chat and does not refer to any threads off of a Group Chat
 */
function isRootGroupChat(report) {
    return !isChatThread(report) && (isGroupChat(report) || isDeprecatedGroupDM(report));
}
/**
 * Assume any report without a reportID is unusable.
 */
function isValidReport(report) {
    return !!(report === null || report === void 0 ? void 0 : report.reportID);
}
/**
 * Check to see if we are a participant of this report.
 */
function isReportParticipant(accountID, report) {
    var _a;
    if (!accountID) {
        return false;
    }
    var possibleAccountIDs = Object.keys((_a = report === null || report === void 0 ? void 0 : report.participants) !== null && _a !== void 0 ? _a : {}).map(Number);
    if (report === null || report === void 0 ? void 0 : report.ownerAccountID) {
        possibleAccountIDs.push(report === null || report === void 0 ? void 0 : report.ownerAccountID);
    }
    if (report === null || report === void 0 ? void 0 : report.managerID) {
        possibleAccountIDs.push(report === null || report === void 0 ? void 0 : report.managerID);
    }
    return possibleAccountIDs.includes(accountID);
}
/**
 * Check to see if the current user has access to view the report.
 */
function canCurrentUserOpenReport(report) {
    return (isReportParticipant(currentUserAccountID, report) || isPublicRoom(report)) && canAccessReport(report, allBetas);
}
function shouldUseFullTitleToDisplay(report) {
    return (isMoneyRequestReport(report) || isPolicyExpenseChat(report) || isChatRoom(report) || isChatThread(report) || isTaskReport(report) || isGroupChat(report) || isInvoiceReport(report));
}
function getRoom(type, policyID) {
    var room = Object.values(allReports !== null && allReports !== void 0 ? allReports : {}).find(function (report) { return (report === null || report === void 0 ? void 0 : report.policyID) === policyID && (report === null || report === void 0 ? void 0 : report.chatType) === type && !isThread(report); });
    return room;
}
/**
 *  We only want policy members who are members of the report to be able to modify the report description, but not in thread chat.
 */
function canEditReportDescription(report, policy, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    return (!isMoneyRequestReport(report) &&
        !isReportArchived &&
        isChatRoom(report) &&
        !isChatThread(report) &&
        !(0, isEmpty_1.default)(policy) &&
        hasParticipantInArray(report, currentUserAccountID ? [currentUserAccountID] : []) &&
        !isAuditor(report));
}
function canEditPolicyDescription(policy) {
    return (0, PolicyUtils_1.isPolicyAdmin)(policy);
}
function getReportActionWithSmartscanError(reportActions) {
    return reportActions.find(function (action) {
        var _a, _b;
        var isReportPreview = (0, ReportActionsUtils_1.isReportPreviewAction)(action);
        var isSplitReportAction = (0, ReportActionsUtils_1.isSplitBillAction)(action);
        if (!isSplitReportAction && !isReportPreview) {
            return false;
        }
        var IOUReportID = (0, ReportActionsUtils_1.getIOUReportIDFromReportActionPreview)(action);
        var isReportPreviewError = isReportPreview && shouldShowRBRForMissingSmartscanFields(IOUReportID) && !isSettled(IOUReportID);
        if (isReportPreviewError) {
            return true;
        }
        var transactionID = (0, ReportActionsUtils_1.isMoneyRequestAction)(action) ? (_a = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _a === void 0 ? void 0 : _a.IOUTransactionID : undefined;
        var transaction = (_b = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)]) !== null && _b !== void 0 ? _b : {};
        var isSplitBillError = isSplitReportAction && (0, TransactionUtils_1.hasMissingSmartscanFields)(transaction);
        return isSplitBillError;
    });
}
/**
 * Checks if report action has error when smart scanning
 */
function hasSmartscanError(reportActions) {
    return !!getReportActionWithSmartscanError(reportActions);
}
function shouldAutoFocusOnKeyPress(event) {
    if (event.key.length > 1) {
        return false;
    }
    // If a key is pressed in combination with Meta, Control or Alt do not focus
    if (event.ctrlKey || event.metaKey) {
        return false;
    }
    if (event.code === 'Space') {
        return false;
    }
    return true;
}
/**
 * Navigates to the appropriate screen based on the presence of a private note for the current user.
 */
function navigateToPrivateNotes(report, session, backTo) {
    var _a, _b, _c;
    if ((0, isEmpty_1.default)(report) || (0, isEmpty_1.default)(session) || !session.accountID) {
        return;
    }
    var currentUserPrivateNote = (_c = (_b = (_a = report.privateNotes) === null || _a === void 0 ? void 0 : _a[session.accountID]) === null || _b === void 0 ? void 0 : _b.note) !== null && _c !== void 0 ? _c : '';
    if ((0, isEmpty_1.default)(currentUserPrivateNote)) {
        Navigation_1.default.navigate(ROUTES_1.default.PRIVATE_NOTES_EDIT.getRoute(report.reportID, session.accountID, backTo));
        return;
    }
    Navigation_1.default.navigate(ROUTES_1.default.PRIVATE_NOTES_LIST.getRoute(report.reportID, backTo));
}
/**
 * Get all held transactions of a iouReport
 */
function getAllHeldTransactions(iouReportID) {
    var transactions = getReportTransactions(iouReportID);
    return transactions.filter(function (transaction) { return (0, TransactionUtils_1.isOnHold)(transaction); });
}
/**
 * Check if Report has any held expenses
 */
function hasHeldExpenses(iouReportID, allReportTransactions) {
    var iouReportTransactions = getReportTransactions(iouReportID);
    var transactions = allReportTransactions !== null && allReportTransactions !== void 0 ? allReportTransactions : iouReportTransactions;
    return transactions.some(function (transaction) { return (0, TransactionUtils_1.isOnHold)(transaction); });
}
/**
 * Check if all expenses in the Report are on hold
 */
function hasOnlyHeldExpenses(iouReportID, allReportTransactions) {
    var transactionsByIouReportID = getReportTransactions(iouReportID);
    var reportTransactions = allReportTransactions !== null && allReportTransactions !== void 0 ? allReportTransactions : transactionsByIouReportID;
    return reportTransactions.length > 0 && !reportTransactions.some(function (transaction) { return !(0, TransactionUtils_1.isOnHold)(transaction); });
}
/**
 * Checks if thread replies should be displayed
 */
function shouldDisplayThreadReplies(reportAction, isThreadReportParentAction) {
    var _a;
    var hasReplies = ((_a = reportAction === null || reportAction === void 0 ? void 0 : reportAction.childVisibleActionCount) !== null && _a !== void 0 ? _a : 0) > 0;
    return hasReplies && !!(reportAction === null || reportAction === void 0 ? void 0 : reportAction.childCommenterCount) && !isThreadReportParentAction;
}
/**
 * Check if money report has any transactions updated optimistically
 */
function hasUpdatedTotal(report, policy) {
    var _a, _b;
    if (!report) {
        return true;
    }
    var allReportTransactions = getReportTransactions(report.reportID);
    var hasPendingTransaction = allReportTransactions.some(function (transaction) { return !!transaction.pendingAction; });
    var hasTransactionWithDifferentCurrency = allReportTransactions.some(function (transaction) { return transaction.currency !== report.currency; });
    var hasDifferentWorkspaceCurrency = ((_a = report.pendingFields) === null || _a === void 0 ? void 0 : _a.createChat) && isExpenseReport(report) && report.currency !== (policy === null || policy === void 0 ? void 0 : policy.outputCurrency);
    var hasOptimisticHeldExpense = hasHeldExpenses(report.reportID) && (report === null || report === void 0 ? void 0 : report.unheldTotal) === undefined;
    return !(hasPendingTransaction && (hasTransactionWithDifferentCurrency || hasDifferentWorkspaceCurrency)) && !hasOptimisticHeldExpense && !((_b = report.pendingFields) === null || _b === void 0 ? void 0 : _b.total);
}
/**
 * Return held and full amount formatted with used currency
 */
function getNonHeldAndFullAmount(iouReport, shouldExcludeNonReimbursables) {
    var _a, _b, _c, _d;
    // if the report is an expense report, the total amount should be negated
    var coefficient = isExpenseReport(iouReport) ? -1 : 1;
    var total = (_a = iouReport === null || iouReport === void 0 ? void 0 : iouReport.total) !== null && _a !== void 0 ? _a : 0;
    var unheldTotal = (_b = iouReport === null || iouReport === void 0 ? void 0 : iouReport.unheldTotal) !== null && _b !== void 0 ? _b : 0;
    if (shouldExcludeNonReimbursables) {
        total -= (_c = iouReport === null || iouReport === void 0 ? void 0 : iouReport.nonReimbursableTotal) !== null && _c !== void 0 ? _c : 0;
        unheldTotal -= (_d = iouReport === null || iouReport === void 0 ? void 0 : iouReport.unheldNonReimbursableTotal) !== null && _d !== void 0 ? _d : 0;
    }
    return {
        nonHeldAmount: (0, CurrencyUtils_1.convertToDisplayString)(unheldTotal * coefficient, iouReport === null || iouReport === void 0 ? void 0 : iouReport.currency),
        fullAmount: (0, CurrencyUtils_1.convertToDisplayString)(total * coefficient, iouReport === null || iouReport === void 0 ? void 0 : iouReport.currency),
        hasValidNonHeldAmount: unheldTotal * coefficient >= 0,
    };
}
/**
 * Disable reply in thread action if:
 *
 * - The action is listed in the thread-disabled list
 * - The action is a split expense action
 * - The action is deleted and is not threaded
 * - The report is archived and the action is not threaded
 * - The action is a whisper action and it's neither a report preview nor IOU action
 * - The action is the thread's first chat
 */
function shouldDisableThread(reportAction, reportID, isThreadReportParentAction, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    var isSplitBillAction = (0, ReportActionsUtils_1.isSplitBillAction)(reportAction);
    var isDeletedActionLocal = (0, ReportActionsUtils_1.isDeletedAction)(reportAction);
    var isReportPreviewActionLocal = (0, ReportActionsUtils_1.isReportPreviewAction)(reportAction);
    var isIOUAction = (0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction);
    var isWhisperActionLocal = (0, ReportActionsUtils_1.isWhisperAction)(reportAction) || (0, ReportActionsUtils_1.isActionableTrackExpense)(reportAction);
    var isActionDisabled = CONST_1.default.REPORT.ACTIONS.THREAD_DISABLED.some(function (action) { return action === (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName); });
    return (isActionDisabled ||
        isSplitBillAction ||
        (isDeletedActionLocal && !(reportAction === null || reportAction === void 0 ? void 0 : reportAction.childVisibleActionCount)) ||
        (isReportArchived && !(reportAction === null || reportAction === void 0 ? void 0 : reportAction.childVisibleActionCount)) ||
        (isWhisperActionLocal && !isReportPreviewActionLocal && !isIOUAction) ||
        isThreadReportParentAction);
}
function getAllAncestorReportActions(report, currentUpdatedReport) {
    if (!report) {
        return [];
    }
    var allAncestors = [];
    var parentReportID = report.parentReportID;
    var parentReportActionID = report.parentReportActionID;
    while (parentReportID) {
        var parentReport = currentUpdatedReport && currentUpdatedReport.reportID === parentReportID ? currentUpdatedReport : getReportOrDraftReport(parentReportID);
        var parentReportAction = (0, ReportActionsUtils_1.getReportAction)(parentReportID, parentReportActionID);
        if (!parentReport || !parentReportAction || ((0, ReportActionsUtils_1.isTransactionThread)(parentReportAction) && !(0, ReportActionsUtils_1.isSentMoneyReportAction)(parentReportAction)) || (0, ReportActionsUtils_1.isReportPreviewAction)(parentReportAction)) {
            break;
        }
        // For threads, we don't want to display trip summary
        if ((0, ReportActionsUtils_1.isTripPreview)(parentReportAction) && allAncestors.length > 0) {
            break;
        }
        var isParentReportActionUnread = (0, ReportActionsUtils_1.isCurrentActionUnread)(parentReport, parentReportAction);
        allAncestors.push({
            report: parentReport,
            reportAction: parentReportAction,
            shouldDisplayNewMarker: isParentReportActionUnread,
        });
        parentReportID = parentReport === null || parentReport === void 0 ? void 0 : parentReport.parentReportID;
        parentReportActionID = parentReport === null || parentReport === void 0 ? void 0 : parentReport.parentReportActionID;
    }
    return allAncestors.reverse();
}
function getAllAncestorReportActionIDs(report, includeTransactionThread) {
    if (includeTransactionThread === void 0) { includeTransactionThread = false; }
    if (!report) {
        return {
            reportIDs: [],
            reportActionsIDs: [],
        };
    }
    var allAncestorIDs = {
        reportIDs: [],
        reportActionsIDs: [],
    };
    var parentReportID = report.parentReportID;
    var parentReportActionID = report.parentReportActionID;
    while (parentReportID) {
        var parentReport = getReportOrDraftReport(parentReportID);
        var parentReportAction = (0, ReportActionsUtils_1.getReportAction)(parentReportID, parentReportActionID);
        if (!parentReportAction ||
            (!includeTransactionThread && (((0, ReportActionsUtils_1.isTransactionThread)(parentReportAction) && !(0, ReportActionsUtils_1.isSentMoneyReportAction)(parentReportAction)) || (0, ReportActionsUtils_1.isReportPreviewAction)(parentReportAction)))) {
            break;
        }
        allAncestorIDs.reportIDs.push(parentReportID);
        if (parentReportActionID) {
            allAncestorIDs.reportActionsIDs.push(parentReportActionID);
        }
        if (!parentReport) {
            break;
        }
        parentReportID = parentReport === null || parentReport === void 0 ? void 0 : parentReport.parentReportID;
        parentReportActionID = parentReport === null || parentReport === void 0 ? void 0 : parentReport.parentReportActionID;
    }
    return allAncestorIDs;
}
/**
 * Get optimistic data of parent report action
 * @param reportID The reportID of the report that is updated
 * @param lastVisibleActionCreated Last visible action created of the child report
 * @param type The type of action in the child report
 */
function getOptimisticDataForParentReportAction(reportID, lastVisibleActionCreated, type) {
    var report = getReportOrDraftReport(reportID);
    if (!report || (0, EmptyObject_1.isEmptyObject)(report)) {
        return [];
    }
    var ancestors = getAllAncestorReportActionIDs(report, true);
    var totalAncestor = ancestors.reportIDs.length;
    return Array.from(Array(totalAncestor), function (_, index) {
        var _a;
        var _b;
        var ancestorReport = getReportOrDraftReport(ancestors.reportIDs.at(index));
        if (!ancestorReport || (0, EmptyObject_1.isEmptyObject)(ancestorReport)) {
            return null;
        }
        var ancestorReportAction = (0, ReportActionsUtils_1.getReportAction)(ancestorReport.reportID, (_b = ancestors.reportActionsIDs.at(index)) !== null && _b !== void 0 ? _b : '');
        if (!(ancestorReportAction === null || ancestorReportAction === void 0 ? void 0 : ancestorReportAction.reportActionID) || (0, EmptyObject_1.isEmptyObject)(ancestorReportAction)) {
            return null;
        }
        return {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(ancestorReport.reportID),
            value: (_a = {},
                _a[ancestorReportAction.reportActionID] = updateOptimisticParentReportAction(ancestorReportAction, lastVisibleActionCreated, type),
                _a),
        };
    });
}
function getQuickActionDetails(quickActionReport, personalDetails, policyChatForActivePolicy, reportNameValuePairs) {
    var isValidQuickActionReport = !((0, EmptyObject_1.isEmptyObject)(quickActionReport) || isArchivedReport(reportNameValuePairs));
    var hideQABSubtitle = false;
    var quickActionAvatars = [];
    if (isValidQuickActionReport) {
        var avatars = getIcons(quickActionReport, personalDetails);
        quickActionAvatars = avatars.length <= 1 || isPolicyExpenseChat(quickActionReport) ? avatars : avatars.filter(function (avatar) { return avatar.id !== currentUserAccountID; });
    }
    else {
        hideQABSubtitle = true;
    }
    if (!(0, EmptyObject_1.isEmptyObject)(policyChatForActivePolicy)) {
        quickActionAvatars = getIcons(policyChatForActivePolicy, personalDetails);
    }
    return {
        quickActionAvatars: quickActionAvatars,
        hideQABSubtitle: hideQABSubtitle,
    };
}
function canBeAutoReimbursed(report, policy) {
    var _a, _b, _c;
    if ((0, EmptyObject_1.isEmptyObject)(policy)) {
        return false;
    }
    var reimbursableTotal = getMoneyRequestSpendBreakdown(report).totalDisplaySpend;
    var autoReimbursementLimit = (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.autoReimbursement) === null || _a === void 0 ? void 0 : _a.limit) !== null && _b !== void 0 ? _b : policy === null || policy === void 0 ? void 0 : policy.autoReimbursementLimit) !== null && _c !== void 0 ? _c : 0;
    var isAutoReimbursable = isReportInGroupPolicy(report) &&
        policy.reimbursementChoice === CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES &&
        autoReimbursementLimit >= reimbursableTotal &&
        reimbursableTotal > 0 &&
        CONST_1.default.DIRECT_REIMBURSEMENT_CURRENCIES.includes(report === null || report === void 0 ? void 0 : report.currency);
    return isAutoReimbursable;
}
/** Check if the current user is an owner of the report */
function isReportOwner(report) {
    return (report === null || report === void 0 ? void 0 : report.ownerAccountID) === (currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID);
}
function isAllowedToApproveExpenseReport(report, approverAccountID, reportPolicy) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = reportPolicy !== null && reportPolicy !== void 0 ? reportPolicy : getPolicy(report === null || report === void 0 ? void 0 : report.policyID);
    var isOwner = (approverAccountID !== null && approverAccountID !== void 0 ? approverAccountID : currentUserAccountID) === (report === null || report === void 0 ? void 0 : report.ownerAccountID);
    return !((policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval) && isOwner);
}
function isAllowedToSubmitDraftExpenseReport(report) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(report === null || report === void 0 ? void 0 : report.policyID);
    var submitToAccountID = (0, PolicyUtils_1.getSubmitToAccountID)(policy, report);
    return isAllowedToApproveExpenseReport(report, submitToAccountID);
}
/**
 * What missing payment method does this report action indicate, if any?
 */
function getIndicatedMissingPaymentMethod(userWallet, reportId, reportAction) {
    var _a;
    var isSubmitterOfUnsettledReport = isCurrentUserSubmitter(reportId) && !isSettled(reportId);
    if (!reportId || !isSubmitterOfUnsettledReport || !(0, ReportActionsUtils_1.isReimbursementQueuedAction)(reportAction)) {
        return undefined;
    }
    var paymentType = (_a = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction)) === null || _a === void 0 ? void 0 : _a.paymentType;
    if (paymentType === CONST_1.default.IOU.PAYMENT_TYPE.EXPENSIFY) {
        return (0, isEmpty_1.default)(userWallet) || userWallet.tierName === CONST_1.default.WALLET.TIER_NAME.SILVER ? 'wallet' : undefined;
    }
    return !(0, store_1.hasCreditBankAccount)() ? 'bankAccount' : undefined;
}
/**
 * Checks if report chat contains missing payment method
 */
function hasMissingPaymentMethod(userWallet, iouReportID) {
    var _a;
    var reportActions = (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(iouReportID)]) !== null && _a !== void 0 ? _a : {};
    return Object.values(reportActions)
        .filter(Boolean)
        .some(function (action) { return getIndicatedMissingPaymentMethod(userWallet, iouReportID, action) !== undefined; });
}
/**
 * Used from expense actions to decide if we need to build an optimistic expense report.
 * Create a new report if:
 * - we don't have an iouReport set in the chatReport
 * - we have one, but it's waiting on the payee adding a bank account
 * - we have one, but we can't add more transactions to it due to: report is approved or settled
 */
function shouldCreateNewMoneyRequestReport(existingIOUReport, chatReport, isScanRequest) {
    var isASAPSubmitBetaEnabled = Permissions_1.default.isBetaEnabled(CONST_1.default.BETAS.ASAP_SUBMIT, allBetas);
    return !existingIOUReport || hasIOUWaitingOnCurrentUserBankAccount(chatReport) || !canAddTransaction(existingIOUReport) || (isScanRequest && isASAPSubmitBetaEnabled);
}
function getTripIDFromTransactionParentReportID(transactionParentReportID) {
    var _a, _b;
    return (_b = (_a = getReportOrDraftReport(transactionParentReportID)) === null || _a === void 0 ? void 0 : _a.tripData) === null || _b === void 0 ? void 0 : _b.tripID;
}
/**
 * Checks if report contains actions with errors
 */
function hasActionsWithErrors(reportID) {
    var _a;
    if (!reportID) {
        return false;
    }
    var reportActions = (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID)]) !== null && _a !== void 0 ? _a : {};
    return Object.values(reportActions)
        .filter(Boolean)
        .some(function (action) { return !(0, EmptyObject_1.isEmptyObject)(action.errors); });
}
function isNonAdminOrOwnerOfPolicyExpenseChat(report, policy) {
    return isPolicyExpenseChat(report) && !((0, PolicyUtils_1.isPolicyAdmin)(policy) || (0, PolicyUtils_1.isPolicyOwner)(policy, currentUserAccountID) || isReportOwner(report));
}
function isAdminOwnerApproverOrReportOwner(report, policy) {
    var isApprover = isMoneyRequestReport(report) && (report === null || report === void 0 ? void 0 : report.managerID) !== null && (currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID) === (report === null || report === void 0 ? void 0 : report.managerID);
    return (0, PolicyUtils_1.isPolicyAdmin)(policy) || (0, PolicyUtils_1.isPolicyOwner)(policy, currentUserAccountID) || isReportOwner(report) || isApprover;
}
/**
 * Whether the user can join a report
 */
function canJoinChat(report, parentReportAction, policy, reportNameValuePairs) {
    // We disabled thread functions for whisper action
    // So we should not show join option for existing thread on whisper message that has already been left, or manually leave it
    if ((0, ReportActionsUtils_1.isWhisperAction)(parentReportAction)) {
        return false;
    }
    // If the notification preference of the chat is not hidden that means we have already joined the chat
    if (!isHiddenForCurrentUser(report)) {
        return false;
    }
    var isExpenseChat = isMoneyRequestReport(report) || isMoneyRequest(report) || isInvoiceReport(report) || isTrackExpenseReport(report);
    // Anyone viewing these chat types is already a participant and therefore cannot join
    if (isRootGroupChat(report) || isSelfDM(report) || isInvoiceRoom(report) || isSystemChat(report) || isExpenseChat) {
        return false;
    }
    // The user who is a member of the workspace has already joined the public announce room.
    if (isPublicAnnounceRoom(report) && !(0, EmptyObject_1.isEmptyObject)(policy)) {
        return false;
    }
    if (isArchivedReport(reportNameValuePairs)) {
        return false;
    }
    return isChatThread(report) || isUserCreatedPolicyRoom(report) || isNonAdminOrOwnerOfPolicyExpenseChat(report, policy);
}
/**
 * Whether the user can leave a report
 */
function canLeaveChat(report, policy) {
    if (isRootGroupChat(report)) {
        return true;
    }
    if (isPolicyExpenseChat(report) && !(report === null || report === void 0 ? void 0 : report.isOwnPolicyExpenseChat) && !(0, PolicyUtils_1.isPolicyAdmin)(policy)) {
        return true;
    }
    if (isPublicRoom(report) && (0, Session_1.isAnonymousUser)()) {
        return false;
    }
    if (isHiddenForCurrentUser(report)) {
        return false;
    }
    // Anyone viewing these chat types is already a participant and therefore cannot leave
    if (isSelfDM(report)) {
        return false;
    }
    // The user who is a member of the workspace cannot leave the public announce room.
    if (isPublicAnnounceRoom(report) && !(0, EmptyObject_1.isEmptyObject)(policy)) {
        return false;
    }
    if (isInvoiceRoom(report)) {
        return canLeaveInvoiceRoom(report);
    }
    return (isChatThread(report) && !!getReportNotificationPreference(report)) || isUserCreatedPolicyRoom(report) || isNonAdminOrOwnerOfPolicyExpenseChat(report, policy);
}
function getReportActionActorAccountID(reportAction, iouReport, report, delegatePersonalDetails) {
    var _a, _b, _c;
    switch (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) {
        case CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW: {
            var ownerAccountID = (_a = iouReport === null || iouReport === void 0 ? void 0 : iouReport.ownerAccountID) !== null && _a !== void 0 ? _a : reportAction === null || reportAction === void 0 ? void 0 : reportAction.childOwnerAccountID;
            var actorAccountID = (_b = iouReport === null || iouReport === void 0 ? void 0 : iouReport.managerID) !== null && _b !== void 0 ? _b : reportAction === null || reportAction === void 0 ? void 0 : reportAction.childManagerAccountID;
            if (isPolicyExpenseChat(report) || delegatePersonalDetails) {
                return ownerAccountID;
            }
            return actorAccountID;
        }
        case CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED:
            return (_c = reportAction === null || reportAction === void 0 ? void 0 : reportAction.adminAccountID) !== null && _c !== void 0 ? _c : reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID;
        default:
            return reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID;
    }
}
function createDraftWorkspaceAndNavigateToConfirmationScreen(transactionID, actionName) {
    var isCategorizing = actionName === CONST_1.default.IOU.ACTION.CATEGORIZE;
    var _a = (0, Policy_1.createDraftWorkspace)(currentUserEmail), expenseChatReportID = _a.expenseChatReportID, policyID = _a.policyID, policyName = _a.policyName;
    (0, IOU_1.setMoneyRequestParticipants)(transactionID, [
        {
            selected: true,
            accountID: 0,
            isPolicyExpenseChat: true,
            reportID: expenseChatReportID,
            policyID: policyID,
            searchText: policyName,
        },
    ]);
    if (isCategorizing) {
        Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CATEGORY.getRoute(actionName, CONST_1.default.IOU.TYPE.SUBMIT, transactionID, expenseChatReportID));
    }
    else {
        Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(actionName, CONST_1.default.IOU.TYPE.SUBMIT, transactionID, expenseChatReportID, undefined, true));
    }
}
function createDraftTransactionAndNavigateToParticipantSelector(transactionID, reportID, actionName, reportActionID) {
    var _a, _b, _c, _d, _e, _f;
    if (!transactionID || !reportID) {
        return;
    }
    var transaction = (_a = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)]) !== null && _a !== void 0 ? _a : {};
    var reportActions = (_b = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID)]) !== null && _b !== void 0 ? _b : [];
    if (!transaction || !reportActions) {
        return;
    }
    var linkedTrackedExpenseReportAction = Object.values(reportActions)
        .filter(Boolean)
        .find(function (action) { var _a; return (0, ReportActionsUtils_1.isMoneyRequestAction)(action) && ((_a = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _a === void 0 ? void 0 : _a.IOUTransactionID) === transactionID; });
    var _g = (_c = getTransactionDetails(transaction)) !== null && _c !== void 0 ? _c : {}, created = _g.created, amount = _g.amount, currency = _g.currency, merchant = _g.merchant, mccGroup = _g.mccGroup;
    var comment = getTransactionCommentObject(transaction);
    (0, IOU_1.createDraftTransaction)(__assign(__assign({}, transaction), { actionableWhisperReportActionID: reportActionID, linkedTrackedExpenseReportAction: linkedTrackedExpenseReportAction, linkedTrackedExpenseReportID: reportID, created: created, modifiedCreated: undefined, modifiedAmount: undefined, modifiedCurrency: undefined, amount: amount, currency: currency, comment: comment, merchant: merchant, modifiedMerchant: '', mccGroup: mccGroup }));
    var filteredPolicies = Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).filter(function (policy) { return (0, PolicyUtils_1.shouldShowPolicy)(policy, false, currentUserEmail); });
    if (actionName === CONST_1.default.IOU.ACTION.CATEGORIZE) {
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line deprecation/deprecation
        var activePolicy = getPolicy(activePolicyID);
        if (activePolicy && (0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(activePolicy.id)) {
            Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(activePolicy.id));
            return;
        }
        if ((0, PolicyUtils_1.shouldShowPolicy)(activePolicy, false, currentUserEmail)) {
            var policyExpenseReportID_1 = (_d = getPolicyExpenseChat(currentUserAccountID, activePolicyID)) === null || _d === void 0 ? void 0 : _d.reportID;
            (0, IOU_1.setMoneyRequestParticipants)(transactionID, [
                {
                    selected: true,
                    accountID: 0,
                    isPolicyExpenseChat: true,
                    reportID: policyExpenseReportID_1,
                    policyID: activePolicyID,
                    searchText: activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.name,
                },
            ]);
            if (policyExpenseReportID_1) {
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CATEGORY.getRoute(actionName, CONST_1.default.IOU.TYPE.SUBMIT, transactionID, policyExpenseReportID_1));
            }
            else {
                Log_1.default.warn('policyExpenseReportID is not valid during expense categorizing');
            }
            return;
        }
        if (filteredPolicies.length === 0 || filteredPolicies.length > 1) {
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_UPGRADE.getRoute(actionName, CONST_1.default.IOU.TYPE.SUBMIT, transactionID, reportID));
            return;
        }
        var policyID = (_e = filteredPolicies.at(0)) === null || _e === void 0 ? void 0 : _e.id;
        var policyExpenseReportID = (_f = getPolicyExpenseChat(currentUserAccountID, policyID)) === null || _f === void 0 ? void 0 : _f.reportID;
        (0, IOU_1.setMoneyRequestParticipants)(transactionID, [
            {
                selected: true,
                accountID: 0,
                isPolicyExpenseChat: true,
                reportID: policyExpenseReportID,
                policyID: policyID,
                searchText: activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.name,
            },
        ]);
        if (policyExpenseReportID) {
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CATEGORY.getRoute(actionName, CONST_1.default.IOU.TYPE.SUBMIT, transactionID, policyExpenseReportID));
        }
        else {
            Log_1.default.warn('policyExpenseReportID is not valid during expense categorizing');
        }
        return;
    }
    if (actionName === CONST_1.default.IOU.ACTION.SHARE) {
        Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_ACCOUNTANT.getRoute(actionName, CONST_1.default.IOU.TYPE.SUBMIT, transactionID, reportID, undefined));
        return;
    }
    if (actionName === CONST_1.default.IOU.ACTION.SUBMIT || (allPolicies && filteredPolicies.length > 0)) {
        Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST_1.default.IOU.TYPE.SUBMIT, transactionID, reportID, undefined, actionName));
        return;
    }
    return createDraftWorkspaceAndNavigateToConfirmationScreen(transactionID, actionName);
}
/**
 * Check if a report has any forwarded actions
 */
function hasForwardedAction(reportID) {
    var reportActions = (0, ReportActionsUtils_1.getAllReportActions)(reportID);
    return Object.values(reportActions).some(function (action) { return (action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.FORWARDED; });
}
function isReportOutstanding(iouReport, policyID, reportNameValuePairs) {
    if (reportNameValuePairs === void 0) { reportNameValuePairs = allReportNameValuePair; }
    if (!iouReport || (0, EmptyObject_1.isEmptyObject)(iouReport)) {
        return false;
    }
    var reportNameValuePair = reportNameValuePairs === null || reportNameValuePairs === void 0 ? void 0 : reportNameValuePairs["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(iouReport.reportID)];
    return (isExpenseReport(iouReport) &&
        (iouReport === null || iouReport === void 0 ? void 0 : iouReport.stateNum) !== undefined &&
        (iouReport === null || iouReport === void 0 ? void 0 : iouReport.statusNum) !== undefined &&
        (iouReport === null || iouReport === void 0 ? void 0 : iouReport.policyID) === policyID &&
        (iouReport === null || iouReport === void 0 ? void 0 : iouReport.stateNum) <= CONST_1.default.REPORT.STATE_NUM.SUBMITTED &&
        (iouReport === null || iouReport === void 0 ? void 0 : iouReport.statusNum) <= CONST_1.default.REPORT.STATUS_NUM.SUBMITTED &&
        !hasForwardedAction(iouReport.reportID) &&
        !isArchivedReport(reportNameValuePair));
}
/**
 * Get outstanding expense reports for a given policy ID
 * @param policyID - The policy ID to filter reports by
 * @param reportOwnerAccountID - The accountID of the report owner
 * @param reports - Collection of reports to filter
 * @returns Array of outstanding expense reports sorted by name
 */
function getOutstandingReportsForUser(policyID, reportOwnerAccountID, reports, reportNameValuePairs) {
    if (reports === void 0) { reports = allReports; }
    if (reportNameValuePairs === void 0) { reportNameValuePairs = allReportNameValuePair; }
    if (!reports) {
        return [];
    }
    return Object.values(reports)
        .filter(function (report) { return isReportOutstanding(report, policyID, reportNameValuePairs) && (report === null || report === void 0 ? void 0 : report.ownerAccountID) === reportOwnerAccountID; })
        .sort(function (a, b) { var _a, _b, _c, _d; return (_d = (_a = a === null || a === void 0 ? void 0 : a.reportName) === null || _a === void 0 ? void 0 : _a.localeCompare((_c = (_b = b === null || b === void 0 ? void 0 : b.reportName) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== null && _c !== void 0 ? _c : '')) !== null && _d !== void 0 ? _d : 0; });
}
/**
 * @returns the object to update `report.hasOutstandingChildRequest`
 */
function getOutstandingChildRequest(iouReport) {
    var _a;
    if (!iouReport || (0, EmptyObject_1.isEmptyObject)(iouReport)) {
        return {};
    }
    if (!isExpenseReport(iouReport)) {
        var reimbursableSpend = getMoneyRequestSpendBreakdown(iouReport).reimbursableSpend;
        return {
            hasOutstandingChildRequest: iouReport.managerID === currentUserAccountID && reimbursableSpend !== 0,
        };
    }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(iouReport.policyID);
    var shouldBeManuallySubmitted = (0, PolicyUtils_1.isPaidGroupPolicy)(policy) && !((_a = policy === null || policy === void 0 ? void 0 : policy.harvesting) === null || _a === void 0 ? void 0 : _a.enabled);
    if (shouldBeManuallySubmitted) {
        return {
            hasOutstandingChildRequest: true,
        };
    }
    // We don't need to update hasOutstandingChildRequest in this case
    return {};
}
function canReportBeMentionedWithinPolicy(report, policyID) {
    if (!policyID || (report === null || report === void 0 ? void 0 : report.policyID) !== policyID) {
        return false;
    }
    return isChatRoom(report) && !isInvoiceRoom(report) && !isThread(report);
}
function prepareOnboardingOnyxData(introSelected, engagementChoice, onboardingMessage, adminsChatReportID, onboardingPolicyID, userReportedIntegration, wasInvited, companySize) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var _k, _l, _m, _o, _p;
    if (engagementChoice === CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND) {
        // eslint-disable-next-line no-param-reassign
        onboardingMessage = (0, OnboardingFlow_1.getOnboardingMessages)().onboardingMessages[CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND];
    }
    if (engagementChoice === CONST_1.default.ONBOARDING_CHOICES.EMPLOYER || engagementChoice === CONST_1.default.ONBOARDING_CHOICES.SUBMIT) {
        // eslint-disable-next-line no-param-reassign
        onboardingMessage = (0, OnboardingFlow_1.getOnboardingMessages)().onboardingMessages[CONST_1.default.ONBOARDING_CHOICES.SUBMIT];
    }
    var shouldPostTasksInAdminsRoom = [CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM, CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE].includes(engagementChoice) &&
        !(currentUserEmail === null || currentUserEmail === void 0 ? void 0 : currentUserEmail.includes('+'));
    var adminsChatReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminsChatReportID)];
    var targetChatReport = shouldPostTasksInAdminsRoom
        ? (adminsChatReport !== null && adminsChatReport !== void 0 ? adminsChatReport : { reportID: adminsChatReportID, policyID: onboardingPolicyID })
        : getChatByParticipants([CONST_1.default.ACCOUNT_ID.CONCIERGE, currentUserAccountID !== null && currentUserAccountID !== void 0 ? currentUserAccountID : CONST_1.default.DEFAULT_NUMBER_ID], allReports, false, true);
    var _q = targetChatReport !== null && targetChatReport !== void 0 ? targetChatReport : {}, _r = _q.reportID, targetChatReportID = _r === void 0 ? '' : _r, _s = _q.policyID, targetChatPolicyID = _s === void 0 ? '' : _s;
    if (!targetChatReportID) {
        Log_1.default.warn('Missing reportID for onboarding optimistic data');
        return;
    }
    var integrationName = userReportedIntegration ? CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING[userReportedIntegration] : '';
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var assignedGuideEmail = (_m = (_l = (_k = getPolicy(targetChatPolicyID)) === null || _k === void 0 ? void 0 : _k.assignedGuide) === null || _l === void 0 ? void 0 : _l.email) !== null && _m !== void 0 ? _m : 'Setup Specialist';
    var assignedGuidePersonalDetail = Object.values(allPersonalDetails !== null && allPersonalDetails !== void 0 ? allPersonalDetails : {}).find(function (personalDetail) { return (personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) === assignedGuideEmail; });
    var assignedGuideAccountID;
    if (assignedGuidePersonalDetail && assignedGuidePersonalDetail.accountID) {
        assignedGuideAccountID = assignedGuidePersonalDetail.accountID;
    }
    else {
        assignedGuideAccountID = (0, UserUtils_1.generateAccountID)(assignedGuideEmail);
        // eslint-disable-next-line rulesdir/prefer-actions-set-data
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_a = {},
            _a[assignedGuideAccountID] = {
                isOptimisticPersonalDetail: assignedGuideEmail === CONST_1.default.SETUP_SPECIALIST_LOGIN,
                login: assignedGuideEmail,
                displayName: assignedGuideEmail,
            },
            _a));
    }
    var actorAccountID = shouldPostTasksInAdminsRoom ? assignedGuideAccountID : CONST_1.default.ACCOUNT_ID.CONCIERGE;
    var firstAdminPolicy = (0, PolicyUtils_1.getActivePolicies)(allPolicies, currentUserEmail).find(function (policy) { return policy.type !== CONST_1.default.POLICY.TYPE.PERSONAL && (0, PolicyUtils_1.getPolicyRole)(policy, currentUserEmail) === CONST_1.default.POLICY.ROLE.ADMIN; });
    var onboardingTaskParams = {
        integrationName: integrationName,
        onboardingCompanySize: companySize !== null && companySize !== void 0 ? companySize : onboardingCompanySize,
        workspaceSettingsLink: "".concat(environmentURL, "/").concat(ROUTES_1.default.WORKSPACE_INITIAL.getRoute(onboardingPolicyID !== null && onboardingPolicyID !== void 0 ? onboardingPolicyID : firstAdminPolicy === null || firstAdminPolicy === void 0 ? void 0 : firstAdminPolicy.id)),
        workspaceCategoriesLink: "".concat(environmentURL, "/").concat(ROUTES_1.default.WORKSPACE_CATEGORIES.getRoute(onboardingPolicyID)),
        workspaceMembersLink: "".concat(environmentURL, "/").concat(ROUTES_1.default.WORKSPACE_MEMBERS.getRoute(onboardingPolicyID)),
        workspaceMoreFeaturesLink: "".concat(environmentURL, "/").concat(ROUTES_1.default.WORKSPACE_MORE_FEATURES.getRoute(onboardingPolicyID)),
        workspaceConfirmationLink: "".concat(environmentURL, "/").concat(ROUTES_1.default.WORKSPACE_CONFIRMATION.getRoute(ROUTES_1.default.WORKSPACES_LIST.route)),
        navatticURL: (0, TourUtils_1.getNavatticURL)(environment, engagementChoice),
        testDriveURL: "".concat(environmentURL, "/").concat([CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM, CONST_1.default.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER, CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE].includes(engagementChoice)
            ? ROUTES_1.default.TEST_DRIVE_DEMO_ROOT
            : ROUTES_1.default.TEST_DRIVE_MODAL_ROOT.route),
        workspaceAccountingLink: "".concat(environmentURL, "/").concat(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(onboardingPolicyID)),
        corporateCardLink: "".concat(environmentURL, "/").concat(ROUTES_1.default.WORKSPACE_COMPANY_CARDS.getRoute(onboardingPolicyID)),
    };
    // Text message
    var message = typeof onboardingMessage.message === 'function' ? onboardingMessage.message(onboardingTaskParams) : onboardingMessage.message;
    var textComment = buildOptimisticAddCommentReportAction(message, undefined, actorAccountID, 1);
    var textCommentAction = textComment.reportAction;
    var textMessage = {
        reportID: targetChatReportID,
        reportActionID: textCommentAction.reportActionID,
        reportComment: textComment.commentText,
    };
    var createWorkspaceTaskReportID;
    var tasksData = onboardingMessage.tasks
        .filter(function (task) {
        if (['setupCategories', 'setupTags'].includes(task.type) && userReportedIntegration) {
            return false;
        }
        if (['addAccountingIntegration', 'setupCategoriesAndTags'].includes(task.type) && !userReportedIntegration) {
            return false;
        }
        if (task.type === 'viewTour' &&
            [
                CONST_1.default.ONBOARDING_CHOICES.EMPLOYER,
                CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND,
                CONST_1.default.ONBOARDING_CHOICES.SUBMIT,
                CONST_1.default.ONBOARDING_CHOICES.CHAT_SPLIT,
                CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM,
            ].includes(introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice) &&
            engagementChoice === CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM) {
            return false;
        }
        // Exclude createWorkspace and viewTour tasks from #admin room, for test drive receivers,
        // since these users already have them in concierge
        if ((introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice) === CONST_1.default.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER && ['createWorkspace', 'viewTour'].includes(task.type) && shouldPostTasksInAdminsRoom) {
            return false;
        }
        return true;
    })
        .map(function (task, index) {
        var _a, _b;
        var taskDescription = typeof task.description === 'function' ? task.description(onboardingTaskParams) : task.description;
        var taskTitle = typeof task.title === 'function' ? task.title(onboardingTaskParams) : task.title;
        var currentTask = buildOptimisticTaskReport(actorAccountID, targetChatReportID, currentUserAccountID, taskTitle, taskDescription, targetChatPolicyID, CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, task.mediaAttributes);
        var emailCreatingAction = engagementChoice === CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM ? ((_b = (_a = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[actorAccountID]) === null || _a === void 0 ? void 0 : _a.login) !== null && _b !== void 0 ? _b : CONST_1.default.EMAIL.CONCIERGE) : CONST_1.default.EMAIL.CONCIERGE;
        var taskCreatedAction = buildOptimisticCreatedReportAction(emailCreatingAction);
        var taskReportAction = buildOptimisticTaskCommentReportAction(currentTask.reportID, taskTitle, 0, "task for ".concat(taskTitle), targetChatReportID, actorAccountID, index + 3);
        currentTask.parentReportActionID = taskReportAction.reportAction.reportActionID;
        var completedTaskReportAction = task.autoCompleted
            ? buildOptimisticTaskReportAction(currentTask.reportID, CONST_1.default.REPORT.ACTIONS.TYPE.TASK_COMPLETED, 'marked as complete', actorAccountID, 2)
            : null;
        if (task.type === 'createWorkspace') {
            createWorkspaceTaskReportID = currentTask.reportID;
        }
        return {
            task: task,
            currentTask: currentTask,
            taskCreatedAction: taskCreatedAction,
            taskReportAction: taskReportAction,
            taskDescription: currentTask.description,
            completedTaskReportAction: completedTaskReportAction,
        };
    });
    // Sign-off welcome message
    var welcomeSignOffText = engagementChoice === CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM ? (0, Localize_1.translateLocal)('onboarding.welcomeSignOffTitleManageTeam') : (0, Localize_1.translateLocal)('onboarding.welcomeSignOffTitle');
    var welcomeSignOffComment = buildOptimisticAddCommentReportAction(welcomeSignOffText, undefined, actorAccountID, tasksData.length + 3);
    var welcomeSignOffCommentAction = welcomeSignOffComment.reportAction;
    var welcomeSignOffMessage = {
        reportID: targetChatReportID,
        reportActionID: welcomeSignOffCommentAction.reportActionID,
        reportComment: welcomeSignOffComment.commentText,
    };
    var tasksForParameters = tasksData.map(function (_a) {
        var _b;
        var task = _a.task, currentTask = _a.currentTask, taskCreatedAction = _a.taskCreatedAction, taskReportAction = _a.taskReportAction, taskDescription = _a.taskDescription, completedTaskReportAction = _a.completedTaskReportAction;
        return ({
            type: 'task',
            task: task.type,
            taskReportID: currentTask.reportID,
            parentReportID: currentTask.parentReportID,
            parentReportActionID: taskReportAction.reportAction.reportActionID,
            createdTaskReportActionID: taskCreatedAction.reportActionID,
            completedTaskReportActionID: completedTaskReportAction === null || completedTaskReportAction === void 0 ? void 0 : completedTaskReportAction.reportActionID,
            title: (_b = currentTask.reportName) !== null && _b !== void 0 ? _b : '',
            description: taskDescription !== null && taskDescription !== void 0 ? taskDescription : '',
        });
    });
    var hasOutstandingChildTask = tasksData.some(function (task) { return !task.completedTaskReportAction; });
    var tasksForOptimisticData = tasksData.reduce(function (acc, _a) {
        var _b, _c, _d;
        var currentTask = _a.currentTask, taskCreatedAction = _a.taskCreatedAction, taskReportAction = _a.taskReportAction, taskDescription = _a.taskDescription, completedTaskReportAction = _a.completedTaskReportAction;
        acc.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(targetChatReportID),
            value: (_b = {},
                _b[taskReportAction.reportAction.reportActionID] = taskReportAction.reportAction,
                _b),
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(currentTask.reportID),
            value: __assign(__assign({}, currentTask), { description: taskDescription, pendingFields: {
                    createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    reportName: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    description: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    managerID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                }, managerID: currentUserAccountID }),
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(currentTask.reportID),
            value: {
                isOptimisticReport: true,
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(currentTask.reportID),
            value: (_c = {},
                _c[taskCreatedAction.reportActionID] = taskCreatedAction,
                _c),
        });
        if (completedTaskReportAction) {
            acc.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(currentTask.reportID),
                value: (_d = {},
                    _d[completedTaskReportAction.reportActionID] = completedTaskReportAction,
                    _d),
            });
            acc.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(currentTask.reportID),
                value: {
                    stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST_1.default.REPORT.STATUS_NUM.APPROVED,
                    managerID: currentUserAccountID,
                },
            });
        }
        return acc;
    }, []);
    var tasksForFailureData = tasksData.reduce(function (acc, _a) {
        var _b;
        var currentTask = _a.currentTask, taskReportAction = _a.taskReportAction;
        acc.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(targetChatReportID),
            value: (_b = {},
                _b[taskReportAction.reportAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericAddCommentFailureMessage'),
                },
                _b),
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(currentTask.reportID),
            value: null,
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(currentTask.reportID),
            value: null,
        });
        return acc;
    }, []);
    var tasksForSuccessData = tasksData.reduce(function (acc, _a) {
        var _b, _c, _d;
        var currentTask = _a.currentTask, taskCreatedAction = _a.taskCreatedAction, taskReportAction = _a.taskReportAction, completedTaskReportAction = _a.completedTaskReportAction;
        acc.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(targetChatReportID),
            value: (_b = {},
                _b[taskReportAction.reportAction.reportActionID] = { pendingAction: null, isOptimisticAction: null },
                _b),
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(currentTask.reportID),
            value: {
                pendingFields: {
                    createChat: null,
                    reportName: null,
                    description: null,
                    managerID: null,
                },
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(currentTask.reportID),
            value: {
                isOptimisticReport: false,
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(currentTask.reportID),
            value: (_c = {},
                _c[taskCreatedAction.reportActionID] = { pendingAction: null },
                _c),
        });
        if (completedTaskReportAction) {
            acc.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(currentTask.reportID),
                value: (_d = {},
                    _d[completedTaskReportAction.reportActionID] = { pendingAction: null, isOptimisticAction: null },
                    _d),
            });
        }
        return acc;
    }, []);
    var optimisticData = __spreadArray([], tasksForOptimisticData, true);
    var lastVisibleActionCreated = welcomeSignOffCommentAction.created;
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(targetChatReportID),
        value: {
            hasOutstandingChildTask: hasOutstandingChildTask,
            lastVisibleActionCreated: lastVisibleActionCreated,
            lastActorAccountID: actorAccountID,
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: ONYXKEYS_1.default.NVP_INTRO_SELECTED,
        value: {
            choice: engagementChoice,
            createWorkspace: createWorkspaceTaskReportID,
        },
    });
    // If we post tasks in the #admins room and introSelected?.choice does not exist, it means that a guide is assigned and all messages except tasks are handled by the backend
    if (!shouldPostTasksInAdminsRoom || !!(introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice)) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(targetChatReportID),
            value: (_b = {},
                _b[textCommentAction.reportActionID] = textCommentAction,
                _b),
        });
    }
    if (!wasInvited) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_ONBOARDING,
            value: { hasCompletedGuidedSetupFlow: true },
        });
    }
    var successData = __spreadArray([], tasksForSuccessData, true);
    // If we post tasks in the #admins room and introSelected?.choice does not exist, it means that a guide is assigned and all messages except tasks are handled by the backend
    if (!shouldPostTasksInAdminsRoom || !!(introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice)) {
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(targetChatReportID),
            value: (_c = {},
                _c[textCommentAction.reportActionID] = { pendingAction: null, isOptimisticAction: null },
                _c),
        });
    }
    var failureReport = {
        lastMessageText: '',
        lastVisibleActionCreated: '',
        hasOutstandingChildTask: false,
    };
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(targetChatReportID)];
    var canUserPerformWriteAction1 = canUserPerformWriteAction(report);
    var _t = (0, ReportActionsUtils_1.getLastVisibleMessage)(targetChatReportID, canUserPerformWriteAction1).lastMessageText, lastMessageText = _t === void 0 ? '' : _t;
    if (lastMessageText) {
        var lastVisibleAction = (0, ReportActionsUtils_1.getLastVisibleAction)(targetChatReportID, canUserPerformWriteAction1);
        var prevLastVisibleActionCreated = lastVisibleAction === null || lastVisibleAction === void 0 ? void 0 : lastVisibleAction.created;
        var lastActorAccountID = lastVisibleAction === null || lastVisibleAction === void 0 ? void 0 : lastVisibleAction.actorAccountID;
        failureReport = {
            lastMessageText: lastMessageText,
            lastVisibleActionCreated: prevLastVisibleActionCreated,
            lastActorAccountID: lastActorAccountID,
        };
    }
    var failureData = __spreadArray([], tasksForFailureData, true);
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(targetChatReportID),
        value: failureReport,
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: ONYXKEYS_1.default.NVP_INTRO_SELECTED,
        value: {
            choice: null,
            createWorkspace: null,
        },
    });
    // If we post tasks in the #admins room and introSelected?.choice does not exist, it means that a guide is assigned and all messages except tasks are handled by the backend
    if (!shouldPostTasksInAdminsRoom || !!(introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice)) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(targetChatReportID),
            value: (_d = {},
                _d[textCommentAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericAddCommentFailureMessage'),
                },
                _d),
        });
    }
    if (!wasInvited) {
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_ONBOARDING,
            value: { hasCompletedGuidedSetupFlow: (_o = onboarding === null || onboarding === void 0 ? void 0 : onboarding.hasCompletedGuidedSetupFlow) !== null && _o !== void 0 ? _o : null },
        });
    }
    if (userReportedIntegration) {
        var requiresControlPlan = [CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE, CONST_1.default.POLICY.CONNECTIONS.NAME.QBD, CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT];
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(onboardingPolicyID),
            value: __assign(__assign({ areConnectionsEnabled: true }, (requiresControlPlan.includes(userReportedIntegration)
                ? {
                    type: CONST_1.default.POLICY.TYPE.CORPORATE,
                }
                : {})), { pendingFields: {
                    areConnectionsEnabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                } }),
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(onboardingPolicyID),
            value: {
                pendingFields: {
                    areConnectionsEnabled: null,
                },
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(onboardingPolicyID),
            value: {
                // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
                // eslint-disable-next-line deprecation/deprecation
                areConnectionsEnabled: (_p = getPolicy(onboardingPolicyID)) === null || _p === void 0 ? void 0 : _p.areConnectionsEnabled,
                pendingFields: {
                    areConnectionsEnabled: null,
                },
            },
        });
    }
    // If we post tasks in the #admins room and introSelected?.choice does not exist, it means that a guide is assigned and all messages except tasks are handled by the backend
    var guidedSetupData = [];
    if (!shouldPostTasksInAdminsRoom || !!(introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice)) {
        guidedSetupData.push(__assign({ type: 'message' }, textMessage));
    }
    var selfDMParameters = {};
    if (engagementChoice === CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND) {
        var selfDMReportID = findSelfDMReportID();
        var selfDMReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(selfDMReportID)];
        var createdAction = void 0;
        if (!selfDMReport) {
            var currentTime = DateUtils_1.default.getDBTime();
            selfDMReport = buildOptimisticSelfDMReport(currentTime);
            createdAction = buildOptimisticCreatedReportAction(currentUserEmail !== null && currentUserEmail !== void 0 ? currentUserEmail : '', currentTime);
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
                value: (_e = {},
                    _e[createdAction.reportActionID] = createdAction,
                    _e),
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
                value: (_f = {},
                    _f[createdAction.reportActionID] = {
                        pendingAction: null,
                    },
                    _f),
            });
        }
    }
    guidedSetupData.push.apply(guidedSetupData, tasksForParameters);
    if (!(introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice) || introSelected.choice === CONST_1.default.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(targetChatReportID),
            value: (_g = {},
                _g[welcomeSignOffCommentAction.reportActionID] = welcomeSignOffCommentAction,
                _g),
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(targetChatReportID),
            value: (_h = {},
                _h[welcomeSignOffCommentAction.reportActionID] = { pendingAction: null, isOptimisticAction: null },
                _h),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(targetChatReportID),
            value: (_j = {},
                _j[welcomeSignOffCommentAction.reportActionID] = {
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('report.genericAddCommentFailureMessage'),
                },
                _j),
        });
        guidedSetupData.push(__assign({ type: 'message' }, welcomeSignOffMessage));
    }
    return { optimisticData: optimisticData, successData: successData, failureData: failureData, guidedSetupData: guidedSetupData, actorAccountID: actorAccountID, selfDMParameters: selfDMParameters };
}
/**
 * Whether a given report is used for onboarding tasks. In the past, it could be either the Concierge chat or the system
 * DM, and we saved the report ID in the user's `onboarding` NVP. As a fallback for users who don't have the NVP, we now
 * only use the Concierge chat.
 */
function isChatUsedForOnboarding(optionOrReport, onboardingPurposeSelected) {
    var _a, _b;
    // onboarding can be an empty object for old accounts and accounts created from olddot
    if (onboarding && !(0, EmptyObject_1.isEmptyObject)(onboarding) && onboarding.chatReportID) {
        return onboarding.chatReportID === (optionOrReport === null || optionOrReport === void 0 ? void 0 : optionOrReport.reportID);
    }
    if ((0, EmptyObject_1.isEmptyObject)(onboarding)) {
        return (_a = optionOrReport === null || optionOrReport === void 0 ? void 0 : optionOrReport.isConciergeChat) !== null && _a !== void 0 ? _a : isConciergeChatReport(optionOrReport);
    }
    // Onboarding guides are assigned to signup with emails that do not contain a '+' and select the "Manage my team's expenses" intent.
    // Guides and onboarding tasks are posted to the #admins room to facilitate the onboarding process.
    return onboardingPurposeSelected === CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM && !(currentUserEmail === null || currentUserEmail === void 0 ? void 0 : currentUserEmail.includes('+'))
        ? isAdminRoom(optionOrReport)
        : ((_b = optionOrReport === null || optionOrReport === void 0 ? void 0 : optionOrReport.isConciergeChat) !== null && _b !== void 0 ? _b : isConciergeChatReport(optionOrReport));
}
/**
 * Get the report used for the user's onboarding process. For most users it is the Concierge chat, however in the past
 * we also used the system DM for A/B tests.
 */
function getChatUsedForOnboarding() {
    return Object.values(allReports !== null && allReports !== void 0 ? allReports : {}).find(function (report) { return isChatUsedForOnboarding(report); });
}
/**
 * Checks if given field has any violations and returns name of the first encountered one
 */
function getFieldViolation(violations, reportField) {
    if (!violations || !reportField) {
        return undefined;
    }
    return Object.values(CONST_1.default.REPORT_VIOLATIONS).find(function (violation) { return !!violations[violation] && violations[violation][reportField.fieldID]; });
}
/**
 * Returns translation for given field violation
 */
function getFieldViolationTranslation(reportField, violation) {
    if (!violation) {
        return '';
    }
    switch (violation) {
        case 'fieldRequired':
            return (0, Localize_1.translateLocal)('reportViolations.fieldRequired', { fieldName: reportField.name });
        default:
            return '';
    }
}
/**
 * Returns all violations for report
 */
function getReportViolations(reportID) {
    if (!allReportsViolations) {
        return undefined;
    }
    return allReportsViolations["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_VIOLATIONS).concat(reportID)];
}
function findPolicyExpenseChatByPolicyID(policyID) {
    return Object.values(allReports !== null && allReports !== void 0 ? allReports : {}).find(function (report) { return isPolicyExpenseChat(report) && (report === null || report === void 0 ? void 0 : report.policyID) === policyID; });
}
/**
 * A function to get the report last message. This is usually used to restore the report message preview in LHN after report actions change.
 * @param reportID
 * @param actionsToMerge
 * @param canUserPerformWriteActionInReport
 * @returns containing the calculated message preview data of the report
 */
function getReportLastMessage(reportID, actionsToMerge) {
    var result = {
        lastMessageText: '',
        lastVisibleActionCreated: '',
    };
    var _a = getLastVisibleMessage(reportID, actionsToMerge).lastMessageText, lastMessageText = _a === void 0 ? '' : _a;
    if (lastMessageText) {
        var report = getReport(reportID, allReports);
        var lastVisibleAction = (0, ReportActionsUtils_1.getLastVisibleAction)(reportID, canUserPerformWriteAction(report), actionsToMerge);
        var lastVisibleActionCreated = lastVisibleAction === null || lastVisibleAction === void 0 ? void 0 : lastVisibleAction.created;
        var lastActorAccountID = lastVisibleAction === null || lastVisibleAction === void 0 ? void 0 : lastVisibleAction.actorAccountID;
        result = {
            lastMessageText: lastMessageText,
            lastVisibleActionCreated: lastVisibleActionCreated,
            lastActorAccountID: lastActorAccountID,
        };
    }
    return result;
}
function getReportLastVisibleActionCreated(report, oneTransactionThreadReport) {
    var _a, _b;
    var reportLastVisibleActionCreated = (_a = report === null || report === void 0 ? void 0 : report.lastVisibleActionCreated) !== null && _a !== void 0 ? _a : '';
    var threadLastVisibleActionCreated = (_b = oneTransactionThreadReport === null || oneTransactionThreadReport === void 0 ? void 0 : oneTransactionThreadReport.lastVisibleActionCreated) !== null && _b !== void 0 ? _b : '';
    return reportLastVisibleActionCreated > threadLastVisibleActionCreated ? reportLastVisibleActionCreated : threadLastVisibleActionCreated;
}
function getSourceIDFromReportAction(reportAction) {
    var _a, _b, _c, _d, _e;
    var message = Array.isArray(reportAction === null || reportAction === void 0 ? void 0 : reportAction.message) ? ((_b = (_a = reportAction === null || reportAction === void 0 ? void 0 : reportAction.message) === null || _a === void 0 ? void 0 : _a.at(-1)) !== null && _b !== void 0 ? _b : null) : ((_c = reportAction === null || reportAction === void 0 ? void 0 : reportAction.message) !== null && _c !== void 0 ? _c : null);
    var html = (_d = message === null || message === void 0 ? void 0 : message.html) !== null && _d !== void 0 ? _d : '';
    var sourceURL = (0, getAttachmentDetails_1.default)(html).sourceURL;
    var sourceID = ((_e = sourceURL === null || sourceURL === void 0 ? void 0 : sourceURL.match(CONST_1.default.REGEX.ATTACHMENT_ID)) !== null && _e !== void 0 ? _e : [])[1];
    return sourceID;
}
function getIntegrationIcon(connectionName) {
    if (connectionName === CONST_1.default.POLICY.CONNECTIONS.NAME.XERO) {
        return Expensicons_1.XeroSquare;
    }
    if (connectionName === CONST_1.default.POLICY.CONNECTIONS.NAME.QBO) {
        return Expensicons_1.QBOSquare;
    }
    if (connectionName === CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE) {
        return Expensicons_1.NetSuiteSquare;
    }
    if (connectionName === CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT) {
        return Expensicons_1.IntacctSquare;
    }
    if (connectionName === CONST_1.default.POLICY.CONNECTIONS.NAME.QBD) {
        return Expensicons_1.QBDSquare;
    }
    return undefined;
}
function canBeExported(report) {
    if (!(report === null || report === void 0 ? void 0 : report.statusNum)) {
        return false;
    }
    var isCorrectState = [CONST_1.default.REPORT.STATUS_NUM.APPROVED, CONST_1.default.REPORT.STATUS_NUM.CLOSED, CONST_1.default.REPORT.STATUS_NUM.REIMBURSED].some(function (status) { return status === report.statusNum; });
    return isExpenseReport(report) && isCorrectState;
}
function getIntegrationNameFromExportMessage(reportActions) {
    var _a;
    if (!reportActions) {
        return '';
    }
    if (Array.isArray(reportActions)) {
        var exportIntegrationAction = reportActions.find(function (action) { return (0, ReportActionsUtils_1.isExportIntegrationAction)(action); });
        if (!exportIntegrationAction || !(0, ReportActionsUtils_1.isExportIntegrationAction)(exportIntegrationAction)) {
            return null;
        }
        var originalMessage = ((_a = (0, ReportActionsUtils_1.getOriginalMessage)(exportIntegrationAction)) !== null && _a !== void 0 ? _a : {});
        var label = originalMessage.label;
        return label !== null && label !== void 0 ? label : null;
    }
}
function isExported(reportActions) {
    var _a;
    if (!reportActions) {
        return false;
    }
    var exportIntegrationActionsCount = 0;
    var integrationMessageActionsCount = 0;
    var reportActionList = Array.isArray(reportActions) ? reportActions : Object.values(reportActions);
    for (var _i = 0, reportActionList_1 = reportActionList; _i < reportActionList_1.length; _i++) {
        var action = reportActionList_1[_i];
        if ((0, ReportActionsUtils_1.isExportIntegrationAction)(action)) {
            // We consider any reports marked manually as exported to be exported, so we shortcut here.
            if ((_a = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _a === void 0 ? void 0 : _a.markedManually) {
                return true;
            }
            exportIntegrationActionsCount++;
        }
        if ((0, ReportActionsUtils_1.isIntegrationMessageAction)(action)) {
            integrationMessageActionsCount++;
        }
    }
    // We need to make sure that there was at least one successful export to consider the report exported.
    // We add one EXPORT_INTEGRATION action to the report when we start exporting it (with pendingAction: 'add') and then another EXPORT_INTEGRATION when the export finishes successfully.
    // If the export fails, we add an INTEGRATIONS_MESSAGE action to the report, but the initial EXPORT_INTEGRATION action is still present, so we compare the counts of these two actions to determine if the report was exported successfully.
    return exportIntegrationActionsCount > integrationMessageActionsCount;
}
function hasExportError(reportActions) {
    if (!reportActions) {
        return false;
    }
    if (Array.isArray(reportActions)) {
        return reportActions.some(function (action) { return (0, ReportActionsUtils_1.isIntegrationMessageAction)(action); });
    }
    return Object.values(reportActions).some(function (action) { return (0, ReportActionsUtils_1.isIntegrationMessageAction)(action); });
}
function doesReportContainRequestsFromMultipleUsers(iouReport) {
    var transactions = getReportTransactions(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return isIOUReport(iouReport) && transactions.some(function (transaction) { return ((transaction === null || transaction === void 0 ? void 0 : transaction.modifiedAmount) || (transaction === null || transaction === void 0 ? void 0 : transaction.amount)) < 0; });
}
/**
 * Determines whether the report can be moved to the workspace.
 */
function isWorkspaceEligibleForReportChange(newPolicy, report, policies) {
    var _a, _b;
    var submitterEmail = (0, PersonalDetailsUtils_1.getLoginByAccountID)((_a = report === null || report === void 0 ? void 0 : report.ownerAccountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID);
    var managerLogin = (0, PersonalDetailsUtils_1.getLoginByAccountID)((_b = report === null || report === void 0 ? void 0 : report.managerID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID);
    // We can't move the iou report to the workspace if both users from the iou report create the expense
    if (doesReportContainRequestsFromMultipleUsers(report)) {
        return false;
    }
    if (!(newPolicy === null || newPolicy === void 0 ? void 0 : newPolicy.isPolicyExpenseChatEnabled)) {
        return false;
    }
    // We can only move the iou report to the workspace if the manager is the payer of the new policy
    if (isIOUReport(report)) {
        return (0, PolicyUtils_1.isPaidGroupPolicy)(newPolicy) && isWorkspacePayer(managerLogin !== null && managerLogin !== void 0 ? managerLogin : '', newPolicy);
    }
    return (0, PolicyUtils_1.isPaidGroupPolicy)(newPolicy) && ((0, PolicyUtils_1.isPolicyMember)(submitterEmail, newPolicy === null || newPolicy === void 0 ? void 0 : newPolicy.id) || isPolicyAdmin(newPolicy === null || newPolicy === void 0 ? void 0 : newPolicy.id, policies));
}
function getApprovalChain(policy, expenseReport) {
    var _a, _b, _c;
    var approvalChain = [];
    var fullApprovalChain = [];
    var reportTotal = (_a = expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.total) !== null && _a !== void 0 ? _a : 0;
    var submitterEmail = (_c = (0, PersonalDetailsUtils_1.getLoginsByAccountIDs)([(_b = expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.ownerAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID]).at(0)) !== null && _c !== void 0 ? _c : '';
    if ((0, PolicyUtils_1.isSubmitAndClose)(policy)) {
        return approvalChain;
    }
    // Get category/tag approver list
    var ruleApprovers = (0, PolicyUtils_1.getRuleApprovers)(policy, expenseReport);
    // Push rule approvers to approvalChain list before submitsTo/forwardsTo approvers
    ruleApprovers.forEach(function (ruleApprover) {
        // Don't push submitter to approve as a rule approver
        if (fullApprovalChain.includes(ruleApprover) || ruleApprover === submitterEmail) {
            return;
        }
        fullApprovalChain.push(ruleApprover);
    });
    var nextApproverEmail = (0, PolicyUtils_1.getManagerAccountEmail)(policy, expenseReport);
    while (nextApproverEmail && !approvalChain.includes(nextApproverEmail)) {
        approvalChain.push(nextApproverEmail);
        nextApproverEmail = (0, PolicyUtils_1.getForwardsToAccount)(policy, nextApproverEmail, reportTotal);
    }
    approvalChain.forEach(function (approver) {
        if (fullApprovalChain.includes(approver)) {
            return;
        }
        fullApprovalChain.push(approver);
    });
    if (fullApprovalChain.at(-1) === submitterEmail && (policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval)) {
        fullApprovalChain.pop();
    }
    return fullApprovalChain;
}
/**
 * Checks if the user has missing bank account for the invoice room.
 */
function hasMissingInvoiceBankAccount(iouReportID) {
    var _a, _b, _c;
    if (!iouReportID) {
        return false;
    }
    var invoiceReport = getReport(iouReportID, allReports);
    if (!isInvoiceReport(invoiceReport)) {
        return false;
    }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    return (invoiceReport === null || invoiceReport === void 0 ? void 0 : invoiceReport.ownerAccountID) === currentUserAccountID && !((_c = (_b = (_a = getPolicy(invoiceReport === null || invoiceReport === void 0 ? void 0 : invoiceReport.policyID)) === null || _a === void 0 ? void 0 : _a.invoice) === null || _b === void 0 ? void 0 : _b.bankAccount) === null || _c === void 0 ? void 0 : _c.transferBankAccountID) && isSettled(iouReportID);
}
function hasInvoiceReports() {
    var reports = Object.values(allReports !== null && allReports !== void 0 ? allReports : {});
    return reports.some(function (report) { return isInvoiceReport(report); });
}
function shouldUnmaskChat(participantsContext, report) {
    var _a;
    if (!(report === null || report === void 0 ? void 0 : report.participants)) {
        return true;
    }
    if (isThread(report) && (report === null || report === void 0 ? void 0 : report.chatType) && (report === null || report === void 0 ? void 0 : report.chatType) === CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT) {
        return true;
    }
    if (isThread(report) && (report === null || report === void 0 ? void 0 : report.type) === CONST_1.default.REPORT.TYPE.EXPENSE) {
        return true;
    }
    if (isAdminRoom(report)) {
        return true;
    }
    var participantAccountIDs = Object.keys(report.participants);
    if (participantAccountIDs.length > 2) {
        return false;
    }
    if (participantsContext) {
        var teamInChat = false;
        var userInChat = false;
        for (var _i = 0, participantAccountIDs_1 = participantAccountIDs; _i < participantAccountIDs_1.length; _i++) {
            var participantAccountID = participantAccountIDs_1[_i];
            var id = Number(participantAccountID);
            var contextAccountData = participantsContext[id];
            if (contextAccountData) {
                var login = (_a = contextAccountData.login) !== null && _a !== void 0 ? _a : '';
                if (login.endsWith(CONST_1.default.EMAIL.EXPENSIFY_EMAIL_DOMAIN) || login.endsWith(CONST_1.default.EMAIL.EXPENSIFY_TEAM_EMAIL_DOMAIN)) {
                    teamInChat = true;
                }
                else {
                    userInChat = true;
                }
            }
        }
        // exclude teamOnly chat
        if (teamInChat && userInChat) {
            return true;
        }
    }
    return false;
}
function getReportMetadata(reportID) {
    return reportID ? allReportMetadataKeyValue[reportID] : undefined;
}
/**
 * Helper method to check if participant email is Manager McTest
 */
function isSelectedManagerMcTest(email) {
    return email === CONST_1.default.EMAIL.MANAGER_MCTEST;
}
/**
 *  Helper method to check if the report is a test transaction report
 */
function isTestTransactionReport(report) {
    var _a;
    var managerID = (_a = report === null || report === void 0 ? void 0 : report.managerID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
    var personalDetails = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[managerID];
    return isSelectedManagerMcTest(personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.login);
}
function isWaitingForSubmissionFromCurrentUser(chatReport, policy) {
    var _a;
    return (chatReport === null || chatReport === void 0 ? void 0 : chatReport.isOwnPolicyExpenseChat) && !((_a = policy === null || policy === void 0 ? void 0 : policy.harvesting) === null || _a === void 0 ? void 0 : _a.enabled);
}
function getGroupChatDraft() {
    return newGroupChatDraft;
}
function getChatListItemReportName(action, report) {
    if (report && isInvoiceReport(report)) {
        var properInvoiceReport = report;
        properInvoiceReport.chatReportID = report.parentReportID;
        return getInvoiceReportName(properInvoiceReport);
    }
    if (action === null || action === void 0 ? void 0 : action.reportName) {
        return action.reportName;
    }
    if (report === null || report === void 0 ? void 0 : report.reportID) {
        return getReportName(getReport(report === null || report === void 0 ? void 0 : report.reportID, allReports));
    }
    return getReportName(report);
}
/**
 * Generates report attributes for a report
 * This function should be called only in reportAttributes.ts
 * DO NOT USE THIS FUNCTION ANYWHERE ELSE
 */
function generateReportAttributes(_a) {
    var _b;
    var report = _a.report, chatReport = _a.chatReport, reportActions = _a.reportActions, transactionViolations = _a.transactionViolations, reportNameValuePairs = _a.reportNameValuePairs;
    var reportActionsList = reportActions === null || reportActions === void 0 ? void 0 : reportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report === null || report === void 0 ? void 0 : report.reportID)];
    var parentReportActionsList = reportActions === null || reportActions === void 0 ? void 0 : reportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report === null || report === void 0 ? void 0 : report.parentReportID)];
    var isReportSettled = isSettled(report);
    var isCurrentUserReportOwner = isReportOwner(report);
    var doesReportHasViolations = hasReportViolations(report === null || report === void 0 ? void 0 : report.reportID);
    var hasViolationsToDisplayInLHN = shouldDisplayViolationsRBRInLHN(report, transactionViolations);
    var hasAnyViolations = hasViolationsToDisplayInLHN || (!isReportSettled && isCurrentUserReportOwner && doesReportHasViolations);
    var reportErrors = getAllReportErrors(report, reportActionsList);
    var hasErrors = Object.entries(reportErrors !== null && reportErrors !== void 0 ? reportErrors : {}).length > 0;
    var oneTransactionThreadReportID = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(report, chatReport, reportActionsList);
    var parentReportAction = (report === null || report === void 0 ? void 0 : report.parentReportActionID) ? parentReportActionsList === null || parentReportActionsList === void 0 ? void 0 : parentReportActionsList[report.parentReportActionID] : undefined;
    var isReportArchived = !!((_b = reportNameValuePairs === null || reportNameValuePairs === void 0 ? void 0 : reportNameValuePairs["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report === null || report === void 0 ? void 0 : report.reportID)]) === null || _b === void 0 ? void 0 : _b.private_isArchived);
    var requiresAttention = requiresAttentionFromCurrentUser(report, parentReportAction, isReportArchived);
    return {
        doesReportHasViolations: doesReportHasViolations,
        hasViolationsToDisplayInLHN: hasViolationsToDisplayInLHN,
        hasAnyViolations: hasAnyViolations,
        reportErrors: reportErrors,
        hasErrors: hasErrors,
        oneTransactionThreadReportID: oneTransactionThreadReportID,
        parentReportAction: parentReportAction,
        requiresAttention: requiresAttention,
        isReportArchived: isReportArchived,
    };
}
function getReportPersonalDetailsParticipants(report, personalDetailsParam, reportMetadata, isRoomMembersList) {
    if (isRoomMembersList === void 0) { isRoomMembersList = false; }
    var chatParticipants = getParticipantsList(report, personalDetailsParam, isRoomMembersList, reportMetadata);
    return {
        chatParticipants: chatParticipants,
        personalDetailsParticipants: chatParticipants.reduce(function (acc, accountID) {
            var details = personalDetailsParam === null || personalDetailsParam === void 0 ? void 0 : personalDetailsParam[accountID];
            if (details) {
                acc[accountID] = details;
            }
            return acc;
        }, {}),
    };
}
function findReportIDForAction(action) {
    var _a;
    if (!allReportActions || !(action === null || action === void 0 ? void 0 : action.reportActionID)) {
        return undefined;
    }
    return (_a = Object.keys(allReportActions)
        .find(function (reportActionsKey) {
        var reportActions = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions[reportActionsKey];
        return !!reportActions && !(0, EmptyObject_1.isEmptyObject)(reportActions[action.reportActionID]);
    })) === null || _a === void 0 ? void 0 : _a.replace("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS), '');
}
function hasReportBeenReopened(reportActions) {
    if (!reportActions) {
        return false;
    }
    var reportActionList = Array.isArray(reportActions) ? reportActions : Object.values(reportActions);
    return reportActionList.some(function (action) { return (0, ReportActionsUtils_1.isReopenedAction)(action); });
}
function getMoneyReportPreviewName(action, iouReport, isInvoice) {
    if (isInvoice && (0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW)) {
        var originalMessage = (0, ReportActionsUtils_1.getOriginalMessage)(action);
        return originalMessage && (0, Localize_1.translateLocal)('iou.invoiceReportName', originalMessage);
    }
    return getReportName(iouReport) || action.childReportName;
}
