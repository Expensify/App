// analyze-report-utils.ts
import { Project } from "ts-morph";
import path from "path";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const targetFilePath = path.resolve("src/libs/ReportUtils.ts");

const sourceFile = project.getSourceFile(targetFilePath);
if (!sourceFile) {
  console.error("❌ Could not find file:", targetFilePath);
  process.exit(1);
}

const functions = sourceFile.getFunctions().filter(fn => fn.isExported());
const usageMap = new Map<string, number>();

functions.forEach((fn) => {
  const name = fn.getName();
  if (!name) return;

  const references = fn.findReferences();
  let totalRefs = 0;

  references.forEach((ref) => {
    totalRefs += ref.getReferences().length;
  });

  // Subtract 1 to ignore the export reference itself
  const externalRefs = Math.max(totalRefs - 1, 0);
  usageMap.set(name, externalRefs);
});

console.log(`\n🔍 Function usage report for ${targetFilePath}:\n`);

usageMap.forEach((count, fnName) => {
  if (count === 1) {
    console.log(`⚠️  "${fnName}" is used only once`);
  } else {
    console.log(`✅ "${fnName}" is used ${count} times`);
  }
});

/*
andrew ➜ (andrew-utils) App npx ts-node analyze-report-utils.ts

🔍 Function usage report for /Users/andrew/Expensidev/App/src/libs/ReportUtils.ts:

✅ "getReportOrDraftReport" is used 58 times
✅ "reportTransactionsSelector" is used 7 times
✅ "getReportTransactions" is used 32 times
✅ "isDraftReport" is used 7 times
✅ "getReportNameValuePairs" is used 34 times
✅ "getRootParentReport" is used 7 times
✅ "getPolicyType" is used 5 times
✅ "getPolicyName" is used 41 times
✅ "getReportParticipantsTitle" is used 5 times
✅ "isChatReport" is used 12 times
✅ "isInvoiceReport" is used 77 times
✅ "isNewDotInvoice" is used 2 times
✅ "isReportIDApproved" is used 6 times
✅ "isExpenseReport" is used 98 times
✅ "isIOUReport" is used 37 times
✅ "isIOUReportUsingReport" is used 5 times
✅ "isTaskReport" is used 54 times
✅ "isCanceledTaskReport" is used 18 times
✅ "isOpenTaskReport" is used 15 times
✅ "isCompletedTaskReport" is used 11 times
✅ "isReportManager" is used 9 times
✅ "isReportApproved" is used 47 times
✅ "isReportManuallyReimbursed" is used 5 times
✅ "isOpenExpenseReport" is used 12 times
✅ "isSettled" is used 60 times
✅ "isCurrentUserSubmitter" is used 21 times
✅ "isAdminRoom" is used 22 times
✅ "isAdminsOnlyPostingRoom" is used 4 times
✅ "isAnnounceRoom" is used 10 times
✅ "isDefaultRoom" is used 12 times
✅ "isDomainRoom" is used 5 times
✅ "isUserCreatedPolicyRoom" is used 11 times
✅ "isPolicyExpenseChat" is used 118 times
✅ "isInvoiceRoom" is used 50 times
✅ "isInvoiceRoomWithID" is used 3 times
✅ "isTripRoom" is used 15 times
✅ "isIndividualInvoiceRoom" is used 10 times
✅ "isCurrentUserInvoiceReceiver" is used 3 times
⚠️  "isControlPolicyExpenseChat" is used only once
✅ "isGroupPolicy" is used 5 times
✅ "isReportInGroupPolicy" is used 14 times
✅ "isPaidGroupPolicy" is used 15 times
⚠️  "isPaidGroupPolicyExpenseChat" is used only once
⚠️  "isControlPolicyExpenseReport" is used only once
✅ "isPaidGroupPolicyExpenseReport" is used 12 times
✅ "isOpenInvoiceReport" is used 5 times
✅ "isChatRoom" is used 36 times
✅ "isPublicRoom" is used 12 times
✅ "isPublicAnnounceRoom" is used 4 times
✅ "getBankAccountRoute" is used 11 times
✅ "isOptimisticPersonalDetail" is used 8 times
✅ "isThread" is used 35 times
✅ "isChatThread" is used 55 times
✅ "isDM" is used 9 times
✅ "isSelfDM" is used 57 times
✅ "isGroupChat" is used 43 times
✅ "isSystemChat" is used 25 times
✅ "getDefaultNotificationPreferenceForReport" is used 6 times
✅ "getReportNotificationPreference" is used 19 times
✅ "isConciergeChatReport" is used 28 times
✅ "findSelfDMReportID" is used 11 times
✅ "isPolicyRelatedReport" is used 3 times
✅ "doesReportBelongToWorkspace" is used 10 times
✅ "isProcessingReport" is used 24 times
✅ "isOpenReport" is used 11 times
✅ "isAwaitingFirstLevelApproval" is used 2 times
✅ "shouldDisableDetailPage" is used 7 times
✅ "isExpensifyOnlyParticipantInReport" is used 5 times
✅ "canCreateTaskInReport" is used 7 times
✅ "isHiddenForCurrentUser" is used 33 times
✅ "hasExpensifyGuidesEmails" is used 3 times
✅ "getMostRecentlyVisitedReport" is used 4 times
✅ "findLastAccessedReport" is used 14 times
✅ "isClosedExpenseReportWithNoExpenses" is used 7 times
✅ "isArchivedNonExpenseReport" is used 50 times
✅ "isArchivedReport" is used 37 times
✅ "isArchivedNonExpenseReportWithID" is used 6 times
✅ "isArchivedReportWithID" is used 19 times
✅ "isClosedReport" is used 21 times
✅ "isJoinRequestInAdminRoom" is used 4 times
✅ "isAuditor" is used 3 times
✅ "canWriteInReport" is used 12 times
✅ "isAllowedToComment" is used 5 times
⚠️  "isPolicyExpenseChatAdmin" is used only once
✅ "isPolicyAdmin" is used 8 times
✅ "hasOnlyTransactionsWithPendingRoutes" is used 7 times
⚠️  "isChildReport" is used only once
✅ "isExpenseRequest" is used 13 times
✅ "isTrackExpenseReport" is used 25 times
✅ "isMoneyRequest" is used 16 times
✅ "isMoneyRequestReport" is used 61 times
✅ "getHelpPaneReportType" is used 3 times
✅ "hasOnlyNonReimbursableTransactions" is used 2 times
✅ "isPayAtEndExpenseReport" is used 7 times
✅ "isOneTransactionThread" is used 12 times
✅ "getDisplayedReportID" is used 4 times
✅ "isOneOnOneChat" is used 17 times
✅ "isPayer" is used 15 times
✅ "isActionCreator" is used 3 times
✅ "getChildReportNotificationPreference" is used 7 times
✅ "canAddTransaction" is used 3 times
✅ "canDeleteTransaction" is used 7 times
✅ "canDeleteCardTransactionByLiabilityType" is used 6 times
✅ "canDeleteReportAction" is used 6 times
✅ "chatIncludesConcierge" is used 5 times
✅ "hasAutomatedExpensifyAccountIDs" is used 3 times
✅ "getReportRecipientAccountIDs" is used 5 times
✅ "canShowReportRecipientLocalTime" is used 6 times
✅ "formatReportLastMessageText" is used 28 times
✅ "getDefaultWorkspaceAvatar" is used 42 times
✅ "getDefaultWorkspaceAvatarTestID" is used 3 times
✅ "getDefaultGroupAvatar" is used 5 times
✅ "getIconsForParticipants" is used 13 times
✅ "getWorkspaceIcon" is used 18 times
✅ "getPersonalDetailsForAccountID" is used 8 times
✅ "getDisplayNameForParticipant" is used 59 times
✅ "getParticipantsAccountIDsForDisplay" is used 28 times
✅ "getParticipantsList" is used 7 times
✅ "buildParticipantsFromAccountIDs" is used 9 times
✅ "getGroupChatName" is used 20 times
⚠️  "getParticipants" is used only once
✅ "getIcons" is used 24 times
✅ "getDisplayNamesWithTooltips" is used 23 times
✅ "getUserDetailTooltipText" is used 5 times
✅ "getDeletedParentActionMessageForChatReport" is used 4 times
✅ "getReimbursementQueuedActionMessage" is used 6 times
✅ "getReimbursementDeQueuedOrCanceledActionMessage" is used 7 times
✅ "buildOptimisticChangeFieldAction" is used 3 times
✅ "buildOptimisticCancelPaymentReportAction" is used 3 times
✅ "getLastVisibleMessage" is used 6 times
✅ "isWaitingForAssigneeToCompleteAction" is used 2 times
✅ "isUnreadWithMention" is used 10 times
✅ "getReasonAndReportActionThatRequiresAttention" is used 4 times
✅ "requiresAttentionFromCurrentUser" is used 21 times
✅ "hasNonReimbursableTransactions" is used 12 times
✅ "getMoneyRequestSpendBreakdown" is used 24 times
✅ "getPolicyExpenseChatName" is used 4 times
✅ "getArchiveReason" is used 5 times
✅ "isReportFieldOfTypeTitle" is used 10 times
✅ "isHoldCreator" is used 4 times
✅ "isReportFieldDisabled" is used 8 times
✅ "getTitleReportField" is used 3 times
✅ "getReportFieldKey" is used 37 times
✅ "getReportFieldsByPolicyID" is used 4 times
✅ "getAvailableReportFields" is used 5 times
✅ "getTransactionDetails" is used 33 times
✅ "canEditMoneyRequest" is used 17 times
✅ "canEditFieldOfMoneyRequest" is used 13 times
✅ "canEditReportAction" is used 7 times
✅ "canHoldUnholdReportAction" is used 7 times
✅ "getTransactionsWithReceipts" is used 10 times
✅ "areAllRequestsBeingSmartScanned" is used 7 times
✅ "hasMissingSmartscanFields" is used 7 times
✅ "getReportActionWithMissingSmartscanFields" is used 3 times
✅ "shouldShowRBRForMissingSmartscanFields" is used 3 times
✅ "getTransactionReportName" is used 4 times
✅ "getReportPreviewMessage" is used 12 times
✅ "getInvoicePayerName" is used 7 times
✅ "parseReportActionHtmlToText" is used 2 times
✅ "getInvoicesChatName" is used 2 times
✅ "buildReportNameFromParticipantNames" is used 4 times
✅ "generateReportName" is used 4 times
✅ "getReportName" is used 74 times
✅ "getSearchReportName" is used 3 times
✅ "getInvoiceReportName" is used 3 times
✅ "getPayeeName" is used 6 times
✅ "getReportSubtitlePrefix" is used 6 times
✅ "getChatRoomSubtitle" is used 14 times
✅ "getPendingChatMembers" is used 9 times
✅ "getParentNavigationSubtitle" is used 9 times
✅ "navigateToDetailsPage" is used 7 times
✅ "goBackToDetailsPage" is used 7 times
✅ "navigateBackOnDeleteTransaction" is used 5 times
✅ "goBackFromPrivateNotes" is used 3 times
✅ "generateReportID" is used 37 times
✅ "hasReportNameError" is used 3 times
✅ "addDomainToShortMention" is used 4 times
✅ "completeShortMention" is used 4 times
✅ "getParsedComment" is used 30 times
✅ "getReportDescription" is used 9 times
✅ "getPolicyDescriptionText" is used 3 times
✅ "buildOptimisticAddCommentReportAction" is used 7 times
✅ "updateOptimisticParentReportAction" is used 2 times
✅ "buildOptimisticTaskCommentReportAction" is used 4 times
✅ "buildOptimisticSelfDMReport" is used 2 times
✅ "buildOptimisticIOUReport" is used 18 times
✅ "populateOptimisticReportFormula" is used 5 times
✅ "buildOptimisticInvoiceReport" is used 3 times
✅ "getExpenseReportStateAndStatus" is used 3 times
✅ "buildOptimisticExpenseReport" is used 18 times
✅ "buildOptimisticEmptyReport" is used 5 times
✅ "getReportAutomaticallySubmittedMessage" is used 8 times
✅ "getIOUSubmittedMessage" is used 8 times
✅ "getReportAutomaticallyApprovedMessage" is used 8 times
✅ "getIOUUnapprovedMessage" is used 8 times
✅ "getIOUApprovedMessage" is used 8 times
✅ "getReportAutomaticallyForwardedMessage" is used 8 times
✅ "getIOUForwardedMessage" is used 8 times
✅ "getRejectedReportMessage" is used 8 times
✅ "getUpgradeWorkspaceMessage" is used 8 times
✅ "getDowngradeWorkspaceMessage" is used 8 times
✅ "getWorkspaceNameUpdatedMessage" is used 10 times
✅ "getDeletedTransactionMessage" is used 5 times
✅ "getMovedTransactionMessage" is used 3 times
✅ "getUnreportedTransactionMessage" is used 3 times
✅ "getPolicyChangeMessage" is used 3 times
✅ "getIOUReportActionMessage" is used 5 times
✅ "buildOptimisticIOUReportAction" is used 25 times
✅ "buildOptimisticApprovedReportAction" is used 3 times
✅ "buildOptimisticUnapprovedReportAction" is used 3 times
✅ "buildOptimisticMovedReportAction" is used 2 times
✅ "buildOptimisticChangePolicyReportAction" is used 5 times
✅ "buildOptimisticMovedTransactionAction" is used 3 times
✅ "buildOptimisticUnreportedTransactionAction" is used 3 times
✅ "buildOptimisticSubmittedReportAction" is used 3 times
✅ "buildOptimisticReportPreview" is used 12 times
✅ "buildOptimisticActionableTrackExpenseWhisper" is used 3 times
✅ "buildOptimisticModifiedExpenseReportAction" is used 4 times
✅ "buildOptimisticDetachReceipt" is used 3 times
✅ "buildOptimisticMovedTrackedExpenseModifiedReportAction" is used 3 times
✅ "updateReportPreview" is used 8 times
✅ "buildOptimisticTaskReportAction" is used 5 times
✅ "buildOptimisticChatReport" is used 29 times
✅ "buildOptimisticGroupChatReport" is used 3 times
✅ "buildOptimisticCreatedReportAction" is used 25 times
✅ "buildOptimisticRenamedRoomReportAction" is used 3 times
✅ "buildOptimisticRoomDescriptionUpdatedReportAction" is used 3 times
✅ "buildOptimisticHoldReportAction" is used 4 times
✅ "buildOptimisticHoldReportActionComment" is used 3 times
✅ "buildOptimisticUnHoldReportAction" is used 3 times
✅ "buildOptimisticEditedTaskFieldReportAction" is used 2 times
✅ "buildOptimisticCardAssignedReportAction" is used 2 times
✅ "buildOptimisticChangedTaskAssigneeReportAction" is used 2 times
✅ "buildOptimisticClosedReportAction" is used 3 times
✅ "buildOptimisticDismissedViolationReportAction" is used 6 times
✅ "buildOptimisticResolvedDuplicatesReportAction" is used 3 times
✅ "buildOptimisticAnnounceChat" is used 2 times
✅ "buildOptimisticWorkspaceChats" is used 4 times
✅ "buildOptimisticTaskReport" is used 3 times
✅ "buildOptimisticExportIntegrationAction" is used 4 times
✅ "buildTransactionThread" is used 17 times
✅ "buildOptimisticMoneyRequestEntities" is used 9 times
✅ "isEmptyReport" is used 4 times
✅ "isUnread" is used 23 times
✅ "isIOUOwnedByCurrentUser" is used 5 times
✅ "canSeeDefaultRoom" is used 2 times
✅ "canAccessReport" is used 7 times
✅ "isReportNotFound" is used 2 times
✅ "shouldDisplayViolationsRBRInLHN" is used 15 times
✅ "hasViolations" is used 11 times
✅ "hasWarningTypeViolations" is used 6 times
✅ "hasReceiptError" is used 10 times
⚠️  "hasReceiptErrors" is used only once
✅ "hasNoticeTypeViolations" is used 6 times
✅ "hasReportViolations" is used 10 times
✅ "getAllReportActionsErrorsAndReportActionThatRequiresAttention" is used 4 times
✅ "getAllReportErrors" is used 10 times
✅ "hasReportErrorsOtherThanFailedReceipt" is used 3 times
✅ "reasonForReportToBeInOptionList" is used 4 times
✅ "shouldReportBeInOptionList" is used 25 times
✅ "getChatByParticipants" is used 19 times
✅ "getInvoiceChatByParticipants" is used 6 times
✅ "getPolicyExpenseChat" is used 26 times
✅ "getAllPolicyReports" is used 12 times
✅ "chatIncludesChronos" is used 5 times
✅ "chatIncludesChronosWithID" is used 9 times
✅ "canFlagReportAction" is used 6 times
✅ "shouldShowFlagComment" is used 3 times
✅ "getCommentLength" is used 16 times
✅ "getRouteFromLink" is used 4 times
✅ "parseReportRouteParams" is used 7 times
✅ "getReportIDFromLink" is used 17 times
✅ "hasIOUWaitingOnCurrentUserBankAccount" is used 5 times
✅ "canRequestMoney" is used 2 times
✅ "isGroupChatAdmin" is used 4 times
✅ "getMoneyRequestOptions" is used 3 times
✅ "temporary_getMoneyRequestOptions" is used 29 times
⚠️  "canLeaveRoom" is used only once
✅ "isCurrentUserTheOnlyParticipant" is used 4 times
✅ "getWhisperDisplayNames" is used 3 times
✅ "shouldReportShowSubscript" is used 9 times
⚠️  "isReportDataReady" is used only once
✅ "isValidReportIDFromPath" is used 11 times
✅ "getCreationReportErrors" is used 5 times
✅ "isMoneyRequestReportPendingDeletion" is used 6 times
✅ "navigateToLinkedReportAction" is used 5 times
✅ "canUserPerformWriteAction" is used 66 times
✅ "getOriginalReportID" is used 20 times
✅ "getReportOfflinePendingActionAndErrors" is used 7 times
✅ "canCreateRequest" is used 5 times
✅ "getWorkspaceChats" is used 5 times
✅ "getAllWorkspaceReports" is used 2 times
✅ "shouldDisableRename" is used 6 times
✅ "canEditWriteCapability" is used 5 times
✅ "canEditRoomVisibility" is used 2 times
✅ "getTaskAssigneeChatOnyxData" is used 3 times
✅ "getIOUReportActionDisplayMessage" is used 7 times
✅ "isDeprecatedGroupDM" is used 7 times
✅ "isRootGroupChat" is used 6 times
✅ "isValidReport" is used 6 times
✅ "isReportParticipant" is used 6 times
✅ "canCurrentUserOpenReport" is used 4 times
✅ "shouldUseFullTitleToDisplay" is used 4 times
✅ "getRoom" is used 10 times
✅ "canEditReportDescription" is used 6 times
⚠️  "canEditPolicyDescription" is used only once
✅ "getReportActionWithSmartscanError" is used 3 times
✅ "hasSmartscanError" is used 2 times
✅ "shouldAutoFocusOnKeyPress" is used 4 times
✅ "navigateToPrivateNotes" is used 5 times
✅ "getAllHeldTransactions" is used 4 times
✅ "hasHeldExpenses" is used 21 times
✅ "hasOnlyHeldExpenses" is used 12 times
✅ "shouldDisplayThreadReplies" is used 7 times
✅ "hasUpdatedTotal" is used 9 times
✅ "getNonHeldAndFullAmount" is used 7 times
✅ "shouldDisableThread" is used 12 times
✅ "getAllAncestorReportActions" is used 6 times
✅ "getAllAncestorReportActionIDs" is used 4 times
✅ "getOptimisticDataForParentReportAction" is used 8 times
✅ "getQuickActionDetails" is used 3 times
✅ "canBeAutoReimbursed" is used 3 times
✅ "isReportOwner" is used 17 times
✅ "isAllowedToApproveExpenseReport" is used 16 times
✅ "isAllowedToSubmitDraftExpenseReport" is used 7 times
✅ "getIndicatedMissingPaymentMethod" is used 4 times
✅ "hasMissingPaymentMethod" is used 3 times
✅ "shouldCreateNewMoneyRequestReport" is used 8 times
✅ "getTripIDFromTransactionParentReportID" is used 5 times
✅ "hasActionsWithErrors" is used 5 times
✅ "isNonAdminOrOwnerOfPolicyExpenseChat" is used 3 times
✅ "isAdminOwnerApproverOrReportOwner" is used 3 times
✅ "canJoinChat" is used 5 times
✅ "canLeaveChat" is used 3 times
✅ "getReportActionActorAccountID" is used 4 times
✅ "createDraftWorkspaceAndNavigateToConfirmationScreen" is used 4 times
✅ "createDraftTransactionAndNavigateToParticipantSelector" is used 9 times
✅ "isReportOutsanding" is used 4 times
✅ "getOutstandingReports" is used 5 times
✅ "getOutstandingChildRequest" is used 6 times
✅ "canReportBeMentionedWithinPolicy" is used 3 times
✅ "prepareOnboardingOnyxData" is used 6 times
✅ "isChatUsedForOnboarding" is used 14 times
✅ "getChatUsedForOnboarding" is used 2 times
✅ "getFieldViolation" is used 5 times
✅ "getFieldViolationTranslation" is used 3 times
✅ "getReportViolations" is used 3 times
✅ "findPolicyExpenseChatByPolicyID" is used 2 times
✅ "getReportLastMessage" is used 7 times
✅ "getReportLastVisibleActionCreated" is used 8 times
✅ "getSourceIDFromReportAction" is used 3 times
✅ "getIntegrationIcon" is used 4 times
✅ "canBeExported" is used 11 times
✅ "isExported" is used 11 times
✅ "getApprovalChain" is used 11 times
✅ "hasMissingInvoiceBankAccount" is used 8 times
✅ "hasInvoiceReports" is used 3 times
✅ "shouldUnmaskChat" is used 5 times
✅ "getReportMetadata" is used 13 times
✅ "isSelectedManagerMcTest" is used 12 times
✅ "isTestTransactionReport" is used 4 times
✅ "isWaitingForSubmissionFromCurrentUser" is used 10 times
✅ "getGroupChatDraft" is used 3 times
✅ "getChatListItemReportName" is used 3 times
 */
