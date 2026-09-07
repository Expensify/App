import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    Card,
    PersonalDetails,
    PersonalDetailsList,
    Policy,
    PolicyTagLists,
    Report,
    ReportAction,
    ReportActions,
    ReportAttributesDerivedValue,
    ReportMetadata,
    Transaction,
    VisibleReportActionsDerivedValue,
} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {Locale as DateFnsLocale} from 'date-fns';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';

import {getAddAgentRuleMessage, getDeleteAgentRuleMessage, getUpdateAgentRuleMessage} from './AgentRuleChangeLogUtils';
import {convertToDisplayString as convertToDisplayStringUtil} from './CurrencyUtils';
import {isReportMessageAttachment} from './isReportMessageAttachment';
import {formatPhoneNumber as formatPhoneNumberPhoneUtils} from './LocalePhoneNumber';
import {formatList} from './Localize';
import {getForReportAction} from './ModifiedExpenseMessage';
import createDynamicRoute from './Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {getIsOffline} from './NetworkState';
import Parser from './Parser';
import {getLoginByAccountID, getPersonalDetailsByID, getPersonalDetailsForAccountIDs, getPersonalDetailsListByIDs, temporaryGetDisplayNameOrDefault} from './PersonalDetailsUtils';
import {getCleanedTagName, hasDynamicExternalWorkflow} from './PolicyUtils';
import {
    getActionableCard3DSTransactionApprovalMessage,
    getActionableCardFraudAlertResolutionMessage,
    getActionableMentionWhisperMessage,
    getAddedApprovalRuleMessage,
    getAddedBudgetMessage,
    getAddedCardFeedMessage,
    getAddedConnectionMessage,
    getAssignedCompanyCardMessage,
    getAutoPayApprovedReportsEnabledMessage,
    getAutoReimbursementMessage,
    getCardIssuedMessage,
    getCategoryTaxRateMessage,
    getChangedApproverActionMessage,
    getCombinedReportActions,
    getCompanyAddressUpdateMessage,
    getCompanyCardConnectionBrokenMessage,
    getCurrencyConversionFeeMessage,
    getCurrencyDefaultTaxUpdateMessage,
    getCustomTaxNameUpdateMessage,
    getDefaultApproverUpdateMessage,
    getDelegateSubmitMessage,
    getDeletedApprovalRuleMessage,
    getDeletedBudgetMessage,
    getDynamicExternalWorkflowRoutedMessage,
    getExportIntegrationLastMessageText,
    getForeignCurrencyDefaultTaxUpdateMessage,
    getForwardedReportActionMessage,
    getForwardsToUpdateMessage,
    getIOUReportIDFromReportActionPreview,
    getIntegrationSyncFailedMessage,
    getInvoiceCompanyNameUpdateMessage,
    getInvoiceCompanyWebsiteUpdateMessage,
    getJoinRequestMessage,
    getLastVisibleAction,
    getLastVisibleActionIncludingTransactionThread,
    getLastVisibleMessage,
    getMarkedReimbursedMessage,
    getMccGroupCategoryMessage,
    getMessageOfOldDotReportAction,
    getOneTransactionThreadReportID,
    getOriginalMessage,
    getPlaidBalanceFailureMessage,
    getPolicyChangeLogAddEmployeeMessage,
    getPolicyChangeLogDefaultBillableMessage,
    getPolicyChangeLogDefaultReimbursableMessage,
    getPolicyChangeLogDefaultTitleEnforcedMessage,
    getPolicyChangeLogDeleteMemberMessage,
    getPolicyChangeLogEmployeeLeftMessage,
    getPolicyChangeLogMaxExpenseAgeMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getPolicyChangeLogMaxExpenseAmountNoItemizedReceiptMessage,
    getPolicyChangeLogMaxExpenseAmountNoReceiptMessage,
    getPolicyChangeLogUpdateEmployee,
    getReimbursedMessage,
    getReimburserUpdateMessage,
    getRemovedCardFeedMessage,
    getRemovedConnectionMessage,
    getRenamedAction,
    getRenamedCardFeedMessage,
    getReportAction,
    getReportActionActorAccountID,
    getReportActionMessageText,
    getRequireCompanyCardsEnabledMessage,
    getRequiresCategoryMessage,
    getRequiresTagMessage,
    getRoomAvatarUpdatedMessage,
    getRoomChangeLogMessage,
    getSetAutoJoinMessage,
    getSettlementAccountLockedMessage,
    getSortedReportActions,
    getSubmitsToUpdateMessage,
    getTagListNameUpdatedMessage,
    getTagListUpdatedMessage,
    getTagListUpdatedRequiredMessage,
    getTravelUpdateMessage,
    getUnassignedCompanyCardMessage,
    getUpdateACHAccountMessage,
    getUpdateRoomDescriptionMessage,
    getUpdatedApprovalRuleMessage,
    getUpdatedAuditRateMessage,
    getUpdatedAutoHarvestingMessage,
    getUpdatedBudgetMessage,
    getUpdatedCardFeedLiabilityMessage,
    getUpdatedCardFeedStatementPeriodMessage,
    getUpdatedDefaultTitleMessage,
    getUpdatedIndividualBudgetNotificationMessage,
    getUpdatedManualApprovalThresholdMessage,
    getUpdatedOwnershipMessage,
    getUpdatedProhibitedExpensesMessage,
    getUpdatedReimbursementChoiceMessage,
    getUpdatedSharedBudgetNotificationMessage,
    getUpdatedTimeEnabledMessage,
    getUpdatedTimeRateMessage,
    getWorkspaceAttendeeTrackingUpdateMessage,
    getWorkspaceCategoriesUpdatedMessage,
    getWorkspaceCategoryUpdateMessage,
    getWorkspaceCurrencyUpdateMessage,
    getWorkspaceCustomUnitRateAddedMessage,
    getWorkspaceCustomUnitRateDeletedMessage,
    getWorkspaceCustomUnitRateImportedMessage,
    getWorkspaceCustomUnitRateUpdatedMessage,
    getWorkspaceCustomUnitSubRateDeletedMessage,
    getWorkspaceCustomUnitSubRateUpdatedMessage,
    getWorkspaceCustomUnitUpdatedMessage,
    getWorkspaceDescriptionUpdatedMessage,
    getWorkspaceFeatureEnabledMessage,
    getWorkspaceFrequencyUpdateMessage,
    getWorkspaceReimbursementUpdateMessage,
    getWorkspaceReportFieldAddMessage,
    getWorkspaceReportFieldDeleteMessage,
    getWorkspaceReportFieldUpdateMessage,
    getWorkspaceTagUpdateMessage,
    getWorkspaceTaxUpdateMessage,
    getWorkspaceUpdateFieldMessage,
    hasPendingDEWApprove,
    hasPendingDEWSubmit,
    isActionOfType,
    isActionableAddPaymentCard,
    isActionableJoinRequest,
    isActionableMentionWhisper,
    isAddCommentAction,
    isCardIssuedAction,
    isCategoryModificationAction,
    isClosedAction,
    isCreatedAction,
    isCreatedTaskReportAction,
    isDeletedParentAction,
    isDynamicExternalWorkflowApproveFailedAction,
    isDynamicExternalWorkflowSubmitFailedAction,
    isInviteOrRemovedAction,
    isLeavePolicyAction,
    isMarkAsClosedAction,
    isModifiedExpenseAction,
    isMoneyRequestAction,
    isMovedAction,
    isMovedTransactionAction,
    isOldDotReportAction,
    isPendingRemove,
    isPolicyCopyReportAction,
    isReimbursementDeQueuedOrCanceledAction,
    isReimbursementQueuedAction,
    isRenamedAction,
    isReportActionVisible,
    isReportPreviewAction,
    isTagModificationAction,
    isTaskAction,
    isThreadParentMessage,
    isUnapprovedAction,
    wasActionTakenByCurrentUser,
    withDEWRoutedActionsArray,
} from './ReportActionsUtils';
import {deprecatedGetReportName, getReportName} from './ReportNameUtils';
import {
    canUserPerformWriteAction,
    excludeParticipantsForDisplay,
    formatReportLastMessageText,
    getDeletedParentActionMessageForChatReport,
    getDeletedTransactionMessage,
    getDisplayNameForParticipant,
    getDisplayNamesWithTooltips,
    getMovedActionMessage,
    getMovedTransactionMessage,
    parseMovedTransactionReportIDs,
    getParticipantsAccountIDsForDisplay,
    getPolicyChangeLogCopyMessage,
    getPolicyChangeMessage,
    getPolicyName,
    getReimbursementDeQueuedOrCanceledActionMessage,
    getReimbursementQueuedActionMessage,
    getReportDescription,
    getReportLastMessage,
    getReportMetadata,
    getReportOrDraftReport,
    getReportPreviewMessage,
    getReportSubtitlePrefix,
    getReportTransactions,
    getUnreportedTransactionMessage,
    getWorkspaceNameUpdatedMessage,
    isAdminRoom,
    isAnnounceRoom,
    isArchivedNonExpenseReport,
    isChatReport as reportUtilsIsChatReport,
    isChatRoom,
    isChatThread,
    isConciergeChatReport,
    isDM,
    isDeprecatedGroupDM,
    isDomainRoom,
    isExpenseReport,
    isGroupChat as isGroupChatUtil,
    isInvoiceRoom,
    isMoneyRequestReport as reportUtilsIsMoneyRequestReport,
    isPolicyExpenseChat,
    isPolicyExpenseChat as reportUtilsIsPolicyExpenseChat,
    isSelfDM,
    isSelfDM as reportUtilsIsSelfDM,
    isSystemChat as isSystemChatUtil,
    isTaskReport,
    isThread,
    shouldShowMarkAsDone,
} from './ReportUtils';
import {getAddExpensifyCardRuleMessage, getRemoveExpensifyCardRuleMessage, getUpdateExpensifyCardRuleMessage} from './SpendRuleChangeLogUtils';
import StringUtils from './StringUtils';
import {getTaskCreatedMessage, getTaskReportActionMessage} from './TaskUtils';
import {getAmount as getTransactionAmount, getCurrency as getTransactionCurrency, getDescription, isScanning} from './TransactionUtils';

let allReports: OnyxCollection<Report>;
// connectWithoutView is justified: this is module-level, non-render preview computation shared by LHN and Search;
// the caches were moved verbatim from OptionsListUtils. Migration to the derived value is tracked in issue #66381.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (value) => {
        allReports = value;
    },
});

/** @deprecated Use sortedReportActionsData from ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS instead. Will be removed once all flows are migrated. */
const deprecatedLastReportActions: ReportActions = {};
/** @deprecated Use sortedReportActionsData from ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS instead. Will be removed once all flows are migrated. */
const deprecatedAllSortedReportActions: Record<string, ReportAction[]> = {};
/** @deprecated Use sortedReportActionsData from ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS instead. Will be removed once all flows are migrated. */
const deprecatedCachedOneTransactionThreadReportIDs: Record<string, string | undefined> = {};
/** @deprecated Use sortedReportActionsData from ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS instead. Will be removed once all flows are migrated. */
let deprecatedAllReportActions: OnyxCollection<ReportActions>;

// connectWithoutView is justified: this is module-level, non-render preview computation shared by LHN and Search;
// the caches were moved verbatim from OptionsListUtils. Migration to the derived value is tracked in issue #66381.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions) => {
        if (!actions) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        deprecatedAllReportActions = actions ?? {};

        // Iterate over the report actions to build the sorted report actions objects
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        for (const reportActions of Object.entries(deprecatedAllReportActions)) {
            const reportID = reportActions[0].split('_').at(1);
            if (!reportID) {
                continue;
            }

            const reportActionsArray = Object.values(reportActions[1] ?? {});
            let sortedReportActions = getSortedReportActions(withDEWRoutedActionsArray(reportActionsArray), true);
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            deprecatedAllSortedReportActions[reportID] = sortedReportActions;
            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];

            // If the report is a one-transaction report, we need to return the combined reportActions so that the LHN can display modifications
            // to the transaction thread or the report itself.
            // Cache the result for O(1) lookup in renderItem.
            const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, actions[reportActions[0]], getIsOffline());
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            deprecatedCachedOneTransactionThreadReportIDs[reportID] = transactionThreadReportID;

            if (transactionThreadReportID) {
                const transactionThreadReportActionsArray = Object.values(actions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`] ?? {});
                const isSelfDMReport = report?.chatType === CONST.REPORT.CHAT_TYPE.SELF_DM;
                sortedReportActions = getCombinedReportActions(sortedReportActions, transactionThreadReportID, transactionThreadReportActionsArray, isSelfDMReport);
            }

            const firstReportAction = sortedReportActions.at(0);
            if (!firstReportAction) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                delete deprecatedLastReportActions[reportID];
            } else {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                deprecatedLastReportActions[reportID] = firstReportAction;
            }
        }
    },
});

function getLastActorDisplayName(lastActorDetails: Partial<PersonalDetails> | null, currentUserAccountID: number, translate: LocalizedTranslate) {
    if (!lastActorDetails) {
        return '';
    }

    if (lastActorDetails.accountID === CONST.ACCOUNT_ID.CONCIERGE) {
        return CONST.CONCIERGE_DISPLAY_NAME;
    }

    return lastActorDetails.accountID !== currentUserAccountID
        ? // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          lastActorDetails.firstName || temporaryGetDisplayNameOrDefault({passedPersonalDetails: lastActorDetails, translate, formatPhoneNumber: formatPhoneNumberPhoneUtils})
        : translate('common.you');
}

function shouldShowLastActorDisplayName(
    report: OnyxEntry<Report>,
    lastActorDetails: Partial<PersonalDetails> | null,
    lastAction: OnyxEntry<ReportAction>,
    currentUserAccountIDParam: number,
    translate: LocalizedTranslate,
) {
    // Use lastAction directly instead of getLastVisibleReportAction to avoid using stale cache data
    const lastReportAction = lastAction;

    // Use report.lastActionType as fallback when report actions aren't loaded yet (e.g., on cold start)
    const lastActionName = lastReportAction?.actionName ?? report?.lastActionType;

    if (
        !lastActionName ||
        !lastActorDetails ||
        reportUtilsIsSelfDM(report) ||
        (isDM(report) && lastActorDetails.accountID !== currentUserAccountIDParam) ||
        lastActionName === CONST.REPORT.ACTIONS.TYPE.IOU
    ) {
        return false;
    }

    const lastActorDisplayName = getLastActorDisplayName(lastActorDetails, currentUserAccountIDParam, translate);

    if (!lastActorDisplayName) {
        return false;
    }

    return true;
}

function getLatestVisibleMoneyRequestAction(
    reportID: string,
    canUserPerformWrite: boolean | undefined,
    sortedReportActions: ReportAction[] = [],
    visibleReportActionsData?: VisibleReportActionsDerivedValue,
): OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> {
    return sortedReportActions.find(
        (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
            isMoneyRequestAction(reportAction) &&
            reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
            isReportActionVisible(reportAction, reportID, canUserPerformWrite, visibleReportActionsData),
    );
}

function getExpenseReportPreviewText(
    report: OnyxEntry<Report>,
    moneyRequestAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>,
    translate: LocalizedTranslate,
    transactions: Transaction[],
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'],
): string {
    const originalMessage = moneyRequestAction ? getOriginalMessage(moneyRequestAction) : undefined;
    const linkedTransaction = transactions.find((transaction) => transaction.transactionID === originalMessage?.IOUTransactionID);
    const amount = linkedTransaction ? getTransactionAmount(linkedTransaction, true) : originalMessage?.amount;
    const currency = linkedTransaction ? getTransactionCurrency(linkedTransaction) : (originalMessage?.currency ?? report?.currency);

    if (typeof amount !== 'number' || !currency) {
        return '';
    }

    const formattedAmount = convertToDisplayString(amount, currency);
    const description = linkedTransaction ? getDescription(linkedTransaction) : '';
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const comment = Parser.htmlToText(description || originalMessage?.comment || '').trim();

    return formatReportLastMessageText(translate('iou.expenseAmount', formattedAmount, comment || undefined));
}

function getLastActorDisplayNameFromLastVisibleActions(
    report: OnyxEntry<Report>,
    lastActorDetails: Partial<PersonalDetails> | null,
    currentUserAccountIDParam: number,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    privateIsArchived: boolean | undefined,
    translate: LocalizedTranslate,
    visibleReportActionsData?: VisibleReportActionsDerivedValue,
    lastAction?: OnyxEntry<ReportAction>,
): string {
    const reportID = report?.reportID;
    const canUserPerformWrite = canUserPerformWriteAction(report, privateIsArchived);
    const lastReportAction = lastAction ?? getLastVisibleAction(reportID, canUserPerformWrite, {}, undefined, visibleReportActionsData);

    if (lastReportAction) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const lastActorAccountID = getReportActionActorAccountID(lastReportAction, undefined, undefined) || report?.lastActorAccountID;
        let actorDetails: Partial<PersonalDetails> | null = lastActorAccountID ? (personalDetails?.[lastActorAccountID] ?? null) : null;

        if (!actorDetails && lastReportAction.person?.at(0)?.text) {
            actorDetails = {
                displayName: lastReportAction.person?.at(0)?.text,
                accountID: lastActorAccountID,
            };
        }

        if (actorDetails) {
            return getLastActorDisplayName(actorDetails, currentUserAccountIDParam, translate);
        }
    }

    return getLastActorDisplayName(lastActorDetails, currentUserAccountIDParam, translate);
}

/**
 * Get the last message text from the report directly or from other sources for special cases.
 */
function getLastMessageTextForReport({
    translate,
    dateFnsLocale,
    report,
    personalDetails,
    lastActorDetails,
    movedFromReport,
    movedToReport,
    policy,
    isReportArchived = false,
    reportMetadata,
    visibleReportActionsDataParam,
    lastAction,
    reportAttributesDerived,
    policyTags,
    currentUserLogin,
    isTrackIntentUser = false,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    sortedActions = deprecatedAllSortedReportActions,
    currentUserAccountID,
}: {
    translate: LocalizedTranslate;
    dateFnsLocale: DateFnsLocale | undefined;
    report: OnyxEntry<Report>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    lastActorDetails: Partial<PersonalDetails> | null;
    movedFromReport?: OnyxEntry<Report>;
    movedToReport?: OnyxEntry<Report>;
    policy?: OnyxEntry<Policy>;
    isReportArchived?: boolean;
    policyForMovingExpensesID?: string;
    reportMetadata?: OnyxEntry<ReportMetadata>;
    visibleReportActionsDataParam?: VisibleReportActionsDerivedValue;
    lastAction?: OnyxEntry<ReportAction>;
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'];
    policyTags?: OnyxEntry<PolicyTagLists>;
    currentUserLogin?: string;
    conciergeReportID: string | undefined;
    isTrackIntentUser?: boolean;
    // TODO: Remove optional (?) once all callers pass sortedActions. Refactor issue: https://github.com/Expensify/App/issues/66381
    sortedActions?: Record<string, ReportAction[]>;
    // TODO: Remove optional (?) once all callers pass currentUserAccountID. Refactor issue: https://github.com/Expensify/App/issues/66408
    currentUserAccountID?: number;
}): string {
    const reportID = report?.reportID;
    const canUserPerformWrite = canUserPerformWriteAction(report, isReportArchived);
    let lastReportAction = lastAction ?? getLastVisibleAction(reportID, canUserPerformWrite, {}, undefined, visibleReportActionsDataParam);

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const transactionThreadReportID = reportID ? deprecatedCachedOneTransactionThreadReportIDs[reportID] : undefined;

    if (reportID && !lastAction && transactionThreadReportID) {
        lastReportAction =
            getLastVisibleActionIncludingTransactionThread(reportID, canUserPerformWrite, undefined, visibleReportActionsDataParam, transactionThreadReportID) ?? lastReportAction;
    }

    // Compute lastVisibleMessage before IOU filter — it needs IOU CREATE/TRACK for text extraction.
    const lastVisibleMessage = getLastVisibleMessage(report?.reportID, undefined, {}, lastReportAction, visibleReportActionsDataParam);

    // For one-transaction reports, filter IOU CREATE/TRACK and fall back to the parent's action (e.g. REPORT_PREVIEW).
    if (transactionThreadReportID && lastReportAction && isMoneyRequestAction(lastReportAction)) {
        const actionType = getOriginalMessage(lastReportAction)?.type ?? '';
        const isSelfDMReport = reportUtilsIsSelfDM(report);
        if (actionType === CONST.IOU.REPORT_ACTION_TYPE.CREATE || (!isSelfDMReport && actionType === CONST.IOU.REPORT_ACTION_TYPE.TRACK)) {
            const parentLastAction = getLastVisibleAction(reportID, canUserPerformWrite, {}, undefined, visibleReportActionsDataParam);
            if (parentLastAction && isMoneyRequestAction(parentLastAction)) {
                const parentActionType = getOriginalMessage(parentLastAction)?.type ?? '';
                if (parentActionType === CONST.IOU.REPORT_ACTION_TYPE.CREATE || (!isSelfDMReport && parentActionType === CONST.IOU.REPORT_ACTION_TYPE.TRACK)) {
                    lastReportAction = undefined;
                } else {
                    lastReportAction = parentLastAction;
                }
            } else {
                lastReportAction = parentLastAction;
            }
        }
    }

    // some types of actions are filtered out for lastReportAction, in some cases we need to check the actual last action
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const lastOriginalReportAction = reportID ? deprecatedLastReportActions[reportID] : undefined;
    let lastMessageTextFromReport = '';

    if (isArchivedNonExpenseReport(report, isReportArchived)) {
        const archiveReason =
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            (isClosedAction(lastOriginalReportAction) && getOriginalMessage(lastOriginalReportAction)?.reason) || CONST.REPORT.ARCHIVE_REASON.DEFAULT;
        switch (archiveReason) {
            case CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED:
            case CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY:
            case CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED: {
                lastMessageTextFromReport = translate(`reportArchiveReasons.${archiveReason}`, {
                    displayName: temporaryGetDisplayNameOrDefault({passedPersonalDetails: lastActorDetails, translate, formatPhoneNumber: formatPhoneNumberPhoneUtils}),
                    policyName: getPolicyName({report, policy, unavailableTranslation: translate('workspace.common.unavailable')}),
                });
                break;
            }
            case CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED: {
                lastMessageTextFromReport = translate(`reportArchiveReasons.${archiveReason}`);
                break;
            }
            default: {
                lastMessageTextFromReport = translate(`reportArchiveReasons.default`);
            }
        }
    } else if (isMoneyRequestAction(lastReportAction)) {
        // Non-React call path: pass the standalone util until this file's own convertToDisplayString threading PR.
        const properSchemaForMoneyRequestMessage = getReportPreviewMessage(translate, convertToDisplayStringUtil, {
            reportOrID: report,
            iouReportAction: lastReportAction,
            shouldConsiderScanningReceiptOrPendingRoute: true,
            policy,
            isForListPreview: true,
        });
        lastMessageTextFromReport = formatReportLastMessageText(Parser.htmlToText(properSchemaForMoneyRequestMessage));
    } else if (isReportPreviewAction(lastReportAction)) {
        const iouReport = getReportOrDraftReport(getIOUReportIDFromReportActionPreview(lastReportAction));
        const iouReportID = iouReport?.reportID;
        const reportCache = iouReportID ? visibleReportActionsDataParam?.[iouReportID] : undefined;
        const visibleReportActionsForIOUReport = reportCache && Object.keys(reportCache).length > 0 ? visibleReportActionsDataParam : undefined;
        const iouReportActions = iouReportID ? sortedActions?.[iouReportID] : undefined;
        const canPerformWrite = canUserPerformWriteAction(report, isReportArchived);
        const lastIOUMoneyReportAction =
            iouReportID && iouReportActions ? getLatestVisibleMoneyRequestAction(iouReportID, canPerformWrite, iouReportActions, visibleReportActionsForIOUReport) : undefined;

        // For workspace chats, use the report title
        if (reportUtilsIsPolicyExpenseChat(report) && !isEmptyObject(iouReport)) {
            const reportName = reportAttributesDerived?.[iouReport.reportID]?.reportName ?? '';
            lastMessageTextFromReport = formatReportLastMessageText(reportName);
        } else {
            // Non-React call path: pass the standalone util until this file's own convertToDisplayString threading PR.
            const reportPreviewMessage = getReportPreviewMessage(translate, convertToDisplayStringUtil, {
                reportOrID: !isEmptyObject(iouReport) ? iouReport : null,
                iouReportAction: lastIOUMoneyReportAction ?? lastReportAction,
                shouldConsiderScanningReceiptOrPendingRoute: true,
                isPreviewMessageForParentChatReport: reportUtilsIsChatReport(report),
                // `policy` is the containing report's policy. A group-policy expense report renders its preview in the
                // policy expense chat, which is handled by the branch above, so every report that reaches here shares
                // its policy with `report` (DM/group personal reports have none; invoice rooms share the room's policy).
                policy,
                isForListPreview: true,
                originalReportAction: lastReportAction,
            });
            lastMessageTextFromReport = formatReportLastMessageText(Parser.htmlToText(reportPreviewMessage));
        }
    } else if (isReimbursementQueuedAction(lastReportAction)) {
        lastMessageTextFromReport = getReimbursementQueuedActionMessage({reportAction: lastReportAction, translate, formatPhoneNumber: formatPhoneNumberPhoneUtils, report});
    } else if (isReimbursementDeQueuedOrCanceledAction(lastReportAction)) {
        // Non-React call path: pass the standalone util until this file's own convertToDisplayString threading PR.
        lastMessageTextFromReport = getReimbursementDeQueuedOrCanceledActionMessage(translate, lastReportAction, report?.ownerAccountID, convertToDisplayStringUtil);
    } else if (isDeletedParentAction(lastReportAction) && reportUtilsIsChatReport(report)) {
        lastMessageTextFromReport = getDeletedParentActionMessageForChatReport(lastReportAction);
    } else if (isPendingRemove(lastReportAction) && report?.reportID && isThreadParentMessage(lastReportAction, report.reportID)) {
        lastMessageTextFromReport = translate('parentReportAction.hiddenMessage');
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED)) {
        lastMessageTextFromReport = getMarkedReimbursedMessage(translate, lastReportAction);
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.REIMBURSED)) {
        lastMessageTextFromReport = getReimbursedMessage(
            translate,
            dateFnsLocale,
            lastReportAction,
            report?.ownerAccountID,
            getLoginByAccountID(report?.ownerAccountID, personalDetails),
            getLoginByAccountID(lastReportAction.actorAccountID, personalDetails),
            // Non-React call path: pass the standalone util until this file's own convertToDisplayString threading PR.
            convertToDisplayStringUtil,
            currentUserAccountID,
        );
    } else if (isReportMessageAttachment({text: report?.lastMessageText ?? '', html: report?.lastMessageHtml, type: ''})) {
        lastMessageTextFromReport = `[${translate('common.attachment')}]`;
    } else if (isModifiedExpenseAction(lastReportAction)) {
        const properSchemaForModifiedExpenseMessageWithHTML = getForReportAction({
            translate,
            // Non-React call path: pass the standalone util until this file's own convertToDisplayString threading PR.
            convertToDisplayString: convertToDisplayStringUtil,
            reportAction: lastReportAction,
            policy,
            movedFromReport,
            movedToReport,
            policyTags,
            currentUserLogin: currentUserLogin ?? '',
        });
        // Strip HTML tags for plain text display in options list
        const properSchemaForModifiedExpenseMessage = Parser.htmlToText(properSchemaForModifiedExpenseMessageWithHTML);
        lastMessageTextFromReport = formatReportLastMessageText(properSchemaForModifiedExpenseMessage, true);
    } else if (isMovedTransactionAction(lastReportAction)) {
        const {fromReportID, toReportID, displayReportID} = parseMovedTransactionReportIDs(lastReportAction);
        lastMessageTextFromReport = Parser.htmlToText(
            getMovedTransactionMessage({
                translate,
                fromReportID,
                toReportID,
                derivedReportName: displayReportID ? reportAttributesDerived?.[displayReportID]?.reportName : undefined,
            }),
        );
    } else if (isTaskAction(lastReportAction)) {
        lastMessageTextFromReport = formatReportLastMessageText(getTaskReportActionMessage(translate, lastReportAction).text);
    } else if (isCreatedTaskReportAction(lastReportAction)) {
        lastMessageTextFromReport = getTaskCreatedMessage(translate, lastReportAction, getReportOrDraftReport(lastReportAction?.childReportID));
    } else if (
        isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED) ||
        isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED) ||
        isMarkAsClosedAction(lastReportAction)
    ) {
        const wasSubmittedViaHarvesting = !isMarkAsClosedAction(lastReportAction) ? (getOriginalMessage(lastReportAction)?.harvesting ?? false) : false;
        const isDEWPolicy = hasDynamicExternalWorkflow(policy);
        const isPendingAdd = lastReportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;

        if (wasSubmittedViaHarvesting) {
            lastMessageTextFromReport = Parser.htmlToText(translate('iou.automaticallySubmitted'));
        } else if (hasPendingDEWSubmit(reportMetadata, isDEWPolicy) && isPendingAdd) {
            lastMessageTextFromReport = translate('iou.queuedToSubmitViaDEW');
        } else {
            lastMessageTextFromReport = shouldShowMarkAsDone({
                report,
                isTrackIntentUser,
                policy,
            })
                ? translate('iou.markedAsDone', getOriginalMessage(lastReportAction)?.message)
                : translate('iou.submitted', getOriginalMessage(lastReportAction)?.message);
        }
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.APPROVED)) {
        const {automaticAction} = getOriginalMessage(lastReportAction) ?? {};
        const isDEWPolicy = hasDynamicExternalWorkflow(policy);
        const isPendingAdd = lastReportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;

        if (automaticAction) {
            lastMessageTextFromReport = Parser.htmlToText(translate('iou.automaticallyApproved'));
        } else if (hasPendingDEWApprove(reportMetadata, isDEWPolicy) && isPendingAdd) {
            lastMessageTextFromReport = translate('iou.queuedToApproveViaDEW');
        } else {
            lastMessageTextFromReport = translate('iou.approvedMessage');
        }
    } else if (isDynamicExternalWorkflowSubmitFailedAction(lastReportAction) || isDynamicExternalWorkflowApproveFailedAction(lastReportAction)) {
        lastMessageTextFromReport = getOriginalMessage(lastReportAction)?.message ?? translate('iou.error.genericCreateFailureMessage');
    } else if (isUnapprovedAction(lastReportAction)) {
        lastMessageTextFromReport = translate('iou.unapproved');
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.FORWARDED)) {
        const {automaticAction} = getOriginalMessage(lastReportAction) ?? {};
        if (automaticAction) {
            lastMessageTextFromReport = Parser.htmlToText(translate('iou.automaticallyForwarded'));
        } else {
            lastMessageTextFromReport = getForwardedReportActionMessage(lastReportAction, translate);
        }
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED) {
        lastMessageTextFromReport = translate('iou.rejectedThisReport');
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
        lastMessageTextFromReport = translate('workspaceActions.upgradedWorkspace');
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE) {
        lastMessageTextFromReport = Parser.htmlToText(translate('workspaceActions.forcedCorporateUpgrade'));
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
        lastMessageTextFromReport = translate('workspaceActions.downgradedWorkspace');
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_RULE) {
        lastMessageTextFromReport = translate('workspaceActions.addedRule');
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_RULE) {
        lastMessageTextFromReport = translate('workspaceActions.updatedRule');
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_RULE) {
        lastMessageTextFromReport = translate('workspaceActions.removedRule');
    } else if (isActionableAddPaymentCard(lastReportAction)) {
        lastMessageTextFromReport = getReportActionMessageText(lastReportAction);
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION)) {
        const integrationName = getOriginalMessage(lastReportAction)?.label;
        lastMessageTextFromReport = getExportIntegrationLastMessageText(translate, lastReportAction, integrationName);
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED)) {
        // RECEIPT_SCAN_FAILED is submitted by Concierge, so use the IOU action to determine edit permission
        const iouAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
        const missingFields = getOriginalMessage(lastReportAction)?.missingFields;
        lastMessageTextFromReport = translate('violations.smartscanFailed', {canEdit: wasActionTakenByCurrentUser(iouAction), missingFields});
    } else if (lastReportAction?.actionName && isOldDotReportAction(lastReportAction)) {
        lastMessageTextFromReport = getMessageOfOldDotReportAction(translate, lastReportAction, false);
    } else if (isActionableJoinRequest(lastReportAction)) {
        lastMessageTextFromReport = getJoinRequestMessage(translate, policy, lastReportAction);
    } else if (
        lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.LEAVE_ROOM ||
        lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM
    ) {
        lastMessageTextFromReport = translate('report.actions.type.leftTheChat');
    } else if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES) {
        lastMessageTextFromReport = translate('violations.resolvedDuplicates');
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION)) {
        lastMessageTextFromReport = Parser.htmlToText(getUpdateRoomDescriptionMessage(translate, lastReportAction));
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_AVATAR)) {
        lastMessageTextFromReport = getRoomAvatarUpdatedMessage(translate, lastReportAction);
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.RETRACTED)) {
        lastMessageTextFromReport = translate('iou.retracted');
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.REOPENED)) {
        lastMessageTextFromReport = translate('iou.reopened');
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY)) {
        lastMessageTextFromReport = getPolicyChangeMessage(translate, lastReportAction);
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
        lastMessageTextFromReport = getTravelUpdateMessage(translate, lastReportAction);
    } else if (isInviteOrRemovedAction(lastReportAction)) {
        lastMessageTextFromReport = getRoomChangeLogMessage(translate, lastReportAction);
    } else if (isRenamedAction(lastReportAction)) {
        lastMessageTextFromReport = getRenamedAction(translate, lastReportAction, isExpenseReport(report));
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION)) {
        // Non-React call path: pass the standalone util until this file's own convertToDisplayString threading PR.
        lastMessageTextFromReport = getDeletedTransactionMessage(translate, lastReportAction, convertToDisplayStringUtil);
    } else if (
        isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) ||
        isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.REROUTE) ||
        isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.REASSIGN_APPROVER)
    ) {
        lastMessageTextFromReport = Parser.htmlToText(getChangedApproverActionMessage(translate, lastReportAction));
    } else if (isMovedAction(lastReportAction)) {
        lastMessageTextFromReport = Parser.htmlToText(getMovedActionMessage(translate, lastReportAction, report));
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION)) {
        const {fromReportID} = parseMovedTransactionReportIDs(lastReportAction);
        lastMessageTextFromReport = Parser.htmlToText(
            getUnreportedTransactionMessage({
                translate,
                fromReportID,
                derivedReportName: fromReportID ? reportAttributesDerived?.[fromReportID]?.reportName : undefined,
            }),
        );
    } else if (isActionableMentionWhisper(lastReportAction)) {
        const targetAccountIDs = getOriginalMessage(lastReportAction)?.inviteeAccountIDs;
        lastMessageTextFromReport = Parser.htmlToText(getActionableMentionWhisperMessage(translate, lastReportAction, getPersonalDetailsListByIDs(targetAccountIDs, personalDetails)));
    } else if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED)) {
        lastMessageTextFromReport = getDynamicExternalWorkflowRoutedMessage(lastReportAction, translate);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT)) {
        // Non-React call path: pass the standalone util until this file's own convertToDisplayString threading PR.
        lastMessageTextFromReport = getPolicyChangeLogMaxExpenseAmountMessage(translate, lastReportAction, convertToDisplayStringUtil);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE)) {
        lastMessageTextFromReport = getPolicyChangeLogMaxExpenseAgeMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT)) {
        lastMessageTextFromReport = getUpdateACHAccountMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME)) {
        lastMessageTextFromReport = getInvoiceCompanyNameUpdateMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE)) {
        lastMessageTextFromReport = getInvoiceCompanyWebsiteUpdateMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_PAY_APPROVED_REPORTS_ENABLED)) {
        lastMessageTextFromReport = getAutoPayApprovedReportsEnabledMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRE_COMPANY_CARDS_ENABLED)) {
        lastMessageTextFromReport = getRequireCompanyCardsEnabledMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_CATEGORY)) {
        lastMessageTextFromReport = getRequiresCategoryMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_TAG)) {
        lastMessageTextFromReport = getRequiresTagMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_GLOBAL_REIMBURSEMENTS_FX_PREFERENCE)) {
        lastMessageTextFromReport = getCurrencyConversionFeeMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_HARVESTING)) {
        lastMessageTextFromReport = getUpdatedAutoHarvestingMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REIMBURSEMENT)) {
        // Non-React call path: pass the standalone util until this file's own convertToDisplayString threading PR.
        lastMessageTextFromReport = getAutoReimbursementMessage(translate, lastReportAction, convertToDisplayStringUtil);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY_TAX_RATE)) {
        lastMessageTextFromReport = getCategoryTaxRateMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MCC_GROUP_CATEGORY)) {
        lastMessageTextFromReport = getMccGroupCategoryMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE)) {
        lastMessageTextFromReport = getWorkspaceCustomUnitRateUpdatedMessage(translate, dateFnsLocale, lastReportAction);
    }
    if (lastReportAction?.actionName && isCategoryModificationAction(lastReportAction.actionName)) {
        lastMessageTextFromReport = getWorkspaceCategoryUpdateMessage(translate, lastReportAction, policy);
    }
    if (
        isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX) ||
        isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX) ||
        isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX)
    ) {
        lastMessageTextFromReport = getWorkspaceTaxUpdateMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_TAX_NAME)) {
        lastMessageTextFromReport = getCustomTaxNameUpdateMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY_DEFAULT_TAX)) {
        lastMessageTextFromReport = getCurrencyDefaultTaxUpdateMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX)) {
        lastMessageTextFromReport = getForeignCurrencyDefaultTaxUpdateMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CARD_FEED)) {
        lastMessageTextFromReport = getAddedCardFeedMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CARD_FEED)) {
        lastMessageTextFromReport = getRemovedCardFeedMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.RENAME_CARD_FEED)) {
        lastMessageTextFromReport = getRenamedCardFeedMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ASSIGN_COMPANY_CARD)) {
        lastMessageTextFromReport = getAssignedCompanyCardMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UNASSIGN_COMPANY_CARD)) {
        lastMessageTextFromReport = getUnassignedCompanyCardMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_LIABILITY)) {
        lastMessageTextFromReport = getUpdatedCardFeedLiabilityMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_STATEMENT_PERIOD)) {
        lastMessageTextFromReport = getUpdatedCardFeedStatementPeriodMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FEATURE_ENABLED)) {
        lastMessageTextFromReport = getWorkspaceFeatureEnabledMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_AGENT_RULE)) {
        lastMessageTextFromReport = getAddAgentRuleMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AGENT_RULE)) {
        lastMessageTextFromReport = getUpdateAgentRuleMessage(translate, lastReportAction);
    }
    if (isActionOfType(lastReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_AGENT_RULE)) {
        lastMessageTextFromReport = getDeleteAgentRuleMessage(translate, lastReportAction);
    }
    if (isPolicyCopyReportAction(lastReportAction)) {
        lastMessageTextFromReport = Parser.htmlToText(getPolicyChangeLogCopyMessage(translate, lastReportAction));
    }

    // we do not want to show report closed in LHN for non archived report so use getReportLastMessage as fallback instead of lastMessageText from report
    if (reportID && !isReportArchived && report.lastActionType === CONST.REPORT.ACTIONS.TYPE.CLOSED) {
        return lastMessageTextFromReport || (getReportLastMessage(reportID, isReportArchived, undefined).lastMessageText ?? '');
    }

    // If the last report action is a pending moderation action, get the last message text from the last visible report action
    if (reportID && !lastMessageTextFromReport && isPendingRemove(lastOriginalReportAction)) {
        lastMessageTextFromReport = getReportActionMessageText(lastReportAction);
    }

    // If the report is a one-transaction report, get the last message text from combined report actions so the LHN can display modifications to the transaction thread or the report itself
    if (reportID && !lastMessageTextFromReport && lastReportAction && transactionThreadReportID) {
        lastMessageTextFromReport = getReportActionMessageText(lastReportAction);
    }

    // If the last action is AddComment and no last message text was determined yet, use getLastVisibleMessage to get the preview text
    if (reportID && !lastMessageTextFromReport && isAddCommentAction(lastReportAction)) {
        lastMessageTextFromReport = lastVisibleMessage?.lastMessageText;
    }

    if (reportID && !lastMessageTextFromReport && reportUtilsIsMoneyRequestReport(report)) {
        const transactions = getReportTransactions(reportID);
        const scanningTransactions = transactions.filter((transaction) => isScanning(transaction));

        if (scanningTransactions.length > 0) {
            lastMessageTextFromReport = translate('iou.receiptScanning', {count: scanningTransactions.length});
        } else if (report?.transactionCount && report?.transactionCount > 0 && report?.currency) {
            const latestVisibleMoneyRequestAction = getLatestVisibleMoneyRequestAction(reportID, canUserPerformWrite, sortedActions?.[reportID], visibleReportActionsDataParam);
            if (isExpenseReport(report) && latestVisibleMoneyRequestAction) {
                // Non-React call path: pass the standalone util until this file's own convertToDisplayString threading PR.
                lastMessageTextFromReport = getExpenseReportPreviewText(report, latestVisibleMoneyRequestAction, translate, transactions, convertToDisplayStringUtil);
            } else if (!isExpenseReport(report)) {
                lastMessageTextFromReport = lastVisibleMessage?.lastMessageText;
            } else if (!isCreatedAction(lastReportAction)) {
                lastMessageTextFromReport =
                    formatReportLastMessageText(
                        Parser.htmlToText(
                            // Non-React call path: pass the standalone util until this file's own convertToDisplayString threading PR.
                            getReportPreviewMessage(translate, convertToDisplayStringUtil, {
                                reportOrID: report,
                                iouReportAction: lastReportAction,
                                shouldConsiderScanningReceiptOrPendingRoute: true,
                                policy,
                                isForListPreview: true,
                            }),
                        ),
                    ) || lastVisibleMessage?.lastMessageText;
            }
        } else if (report?.transactionCount === 0) {
            lastMessageTextFromReport = translate('report.noActivityYet');
        }
    }

    // If the last action differs from last original action, it means there's a hidden action (like a whisper), then use getLastVisibleMessage to get the preview text
    if (!lastMessageTextFromReport && !lastReportAction && !!lastOriginalReportAction) {
        return lastVisibleMessage?.lastMessageText ?? '';
    }

    // When CREATED is the only visible action left (e.g. after cross-device expense
    // deletion), return empty string so the LHN shows the welcome message instead of
    // stale report.lastMessageText.
    if (!lastMessageTextFromReport && isCreatedAction(lastReportAction)) {
        return '';
    }

    // Fallback: use the action's own message text if not handled above.
    if (!lastMessageTextFromReport && lastReportAction) {
        lastMessageTextFromReport = lastVisibleMessage?.lastMessageText ?? '';
    }

    return lastMessageTextFromReport || (report?.lastMessageText ?? '');
}

type WelcomeMessage = {phrase1?: string; messageText?: string; messageHtml?: string};

type WelcomeMessageParams = {
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    invoiceReceiverPolicy: OnyxEntry<Policy>;
    participantPersonalDetailList: PersonalDetails[];
    translate: LocalizedTranslate;
    localeCompare: LocaleContextProps['localeCompare'];
    conciergeReportID: string | undefined;
    derivedReportName?: string;
    isReportArchived?: boolean;
    reportDetailsLink?: string;
    shouldShowUsePlusButtonText?: boolean;
    additionalText?: string;
    isTrackIntentUser?: boolean;
    currentUserAccountID?: number;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
};

function getWelcomeMessage(params: WelcomeMessageParams): WelcomeMessage {
    const {
        report,
        policy,
        invoiceReceiverPolicy,
        participantPersonalDetailList,
        translate,
        localeCompare,
        conciergeReportID,
        derivedReportName,
        isReportArchived = false,
        reportDetailsLink = '',
        shouldShowUsePlusButtonText = false,
        additionalText = '',
        isTrackIntentUser = false,
        currentUserAccountID,
        formatPhoneNumber,
    } = params;

    const welcomeMessage: WelcomeMessage = {};
    if (isChatThread(report) || isTaskReport(report)) {
        return welcomeMessage;
    }

    if (isChatRoom(report)) {
        return getRoomWelcomeMessage({translate, report, invoiceReceiverPolicy, derivedReportName, isReportArchived, reportDetailsLink, formatPhoneNumber});
    }

    if (isPolicyExpenseChat(report)) {
        if (policy?.description) {
            welcomeMessage.messageHtml = policy.description;
            welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);
        } else if (isTrackIntentUser && report?.ownerAccountID === currentUserAccountID) {
            welcomeMessage.messageHtml = translate('reportActionsView.beginningOfChatHistoryPolicyExpenseChatTrack');
            welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);
        } else {
            welcomeMessage.messageHtml = translate(
                'reportActionsView.beginningOfChatHistoryPolicyExpenseChat',
                getPolicyName({report, policy, unavailableTranslation: translate('workspace.common.unavailable')}),
                getDisplayNameForParticipant({accountID: report?.ownerAccountID, formatPhoneNumber, translate}),
            );
            welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);
        }
        return welcomeMessage;
    }

    if (isSelfDM(report)) {
        welcomeMessage.messageText = translate('reportActionsView.beginningOfChatHistorySelfDM');
        return welcomeMessage;
    }

    if (isSystemChatUtil(report)) {
        welcomeMessage.messageText = translate('reportActionsView.beginningOfChatHistorySystemDM');
        return welcomeMessage;
    }
    const isMultipleParticipant = participantPersonalDetailList.length > 1;
    const displayNamesWithTooltips = getDisplayNamesWithTooltips(participantPersonalDetailList, isMultipleParticipant, localeCompare, formatPhoneNumber, translate);

    if (!displayNamesWithTooltips.length) {
        return welcomeMessage;
    }

    const userTags = displayNamesWithTooltips.map(({displayName, accountID}) => `<user-details accountid="${accountID}">${displayName ?? ''}</user-details>`);
    const usersHtml = formatList(userTags);

    let messageHtml = translate('reportActionsView.beginningOfChatHistory', usersHtml);

    // Append additional text for plus button or Concierge
    if (shouldShowUsePlusButtonText) {
        messageHtml += translate('reportActionsView.usePlusButton', additionalText);
    }
    if (isConciergeChatReport(report, conciergeReportID)) {
        messageHtml = translate('reportActionsView.askConcierge');
    }

    welcomeMessage.messageHtml = messageHtml;
    welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);
    return welcomeMessage;
}

/**
 * Get welcome message based on room type
 */
type GetRoomWelcomeMessageParams = {
    translate: LocalizedTranslate;
    report: OnyxEntry<Report>;
    invoiceReceiverPolicy: OnyxEntry<Policy>;
    derivedReportName: string | undefined;
    isReportArchived?: boolean;
    reportDetailsLink?: string;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
};

function getRoomWelcomeMessage({
    translate,
    report,
    invoiceReceiverPolicy,
    derivedReportName,
    isReportArchived = false,
    reportDetailsLink = '',
    formatPhoneNumber,
}: GetRoomWelcomeMessageParams): WelcomeMessage {
    const welcomeMessage: WelcomeMessage = {};
    const workspaceName = getPolicyName({report, unavailableTranslation: translate('workspace.common.unavailable')});
    const reportName = getReportName(report ?? undefined, derivedReportName);

    if (report?.description) {
        welcomeMessage.messageHtml = getReportDescription(report);
        welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);
        return welcomeMessage;
    }

    if (isReportArchived) {
        welcomeMessage.messageHtml = translate('reportActionsView.beginningOfArchivedRoom', reportName, reportDetailsLink);
    } else if (isDomainRoom(report)) {
        welcomeMessage.messageHtml = translate('reportActionsView.beginningOfChatHistoryDomainRoom', report?.reportName ?? '');
    } else if (isAdminRoom(report)) {
        welcomeMessage.messageHtml = translate('reportActionsView.beginningOfChatHistoryAdminRoom', workspaceName);
    } else if (isAnnounceRoom(report)) {
        welcomeMessage.messageHtml = translate('reportActionsView.beginningOfChatHistoryAnnounceRoom', workspaceName);
    } else if (isInvoiceRoom(report)) {
        const payer =
            report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL
                ? getDisplayNameForParticipant({accountID: report?.invoiceReceiver?.accountID, formatPhoneNumber, translate})
                : invoiceReceiverPolicy?.name;
        const receiver = getPolicyName({report, unavailableTranslation: translate('workspace.common.unavailable')});
        welcomeMessage.messageHtml = translate('reportActionsView.beginningOfChatHistoryInvoiceRoom', payer ?? '', receiver);
    } else {
        // Message for user created rooms or other room types.
        welcomeMessage.messageHtml = translate('reportActionsView.beginningOfChatHistoryUserRoom', reportName, reportDetailsLink);
    }
    welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);

    return welcomeMessage;
}

type GetReportAlternateTextParams = {
    report: Report;
    lastAction: ReportAction | undefined;
    lastActionReport: OnyxEntry<Report>;
    movedFromReport?: OnyxEntry<Report>;
    movedToReport?: OnyxEntry<Report>;
    card: Card | undefined;
    lastMessageTextFromReport?: string;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    policy: OnyxEntry<Policy>;
    invoiceReceiverPolicy: OnyxEntry<Policy>;
    policyTags?: OnyxEntry<PolicyTagLists>;
    isReportArchived: boolean | undefined;
    privateIsArchived: boolean;
    conciergeReportID: string | undefined;
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'];
    visibleReportActionsData?: VisibleReportActionsDerivedValue;
    currentUserAccountID: number;
    currentUserLogin: string;
    isTrackIntentUser?: boolean;
    translate: LocalizedTranslate;
    localeCompare: LocaleContextProps['localeCompare'];
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
    dateFnsLocale: DateFnsLocale | undefined;
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
};

/**
 * Computes the alternate text (chat preview line) for a report row. Extracted verbatim from
 * SidebarUtils.getOptionData so LHN and Search share a single implementation.
 */
function getReportAlternateText({
    report,
    lastAction,
    lastActionReport,
    movedFromReport,
    movedToReport,
    card,
    lastMessageTextFromReport: lastMessageTextFromReportProp,
    personalDetails,
    policy,
    invoiceReceiverPolicy,
    policyTags,
    isReportArchived,
    privateIsArchived,
    conciergeReportID,
    reportAttributesDerived,
    visibleReportActionsData,
    currentUserAccountID,
    currentUserLogin,
    isTrackIntentUser,
    translate,
    localeCompare,
    formatPhoneNumber,
    dateFnsLocale,
    convertToDisplayString,
}: GetReportAlternateTextParams): string | undefined {
    let alternateText: string | undefined;
    const isChatRoomReport = isChatRoom(report);
    const isPolicyExpenseChatReport = isPolicyExpenseChat(report);
    const isThreadReport = isChatThread(report);
    const isTaskReportFlag = isTaskReport(report);
    const isAllowedToComment = canUserPerformWriteAction(report, isReportArchived);
    const isExpense = isExpenseReport(report);
    const reportMetadata = getReportMetadata(report.reportID);
    const getParticipantPersonalDetailListExcludeCurrentUser = () => {
        const participantAccountIDs = getParticipantsAccountIDsForDisplay(report);
        const participantAccountIDsExcludeCurrentUser = excludeParticipantsForDisplay(participantAccountIDs, report.participants ?? {}, reportMetadata, {shouldExcludeCurrentUser: true});
        return Object.values(getPersonalDetailsForAccountIDs(participantAccountIDsExcludeCurrentUser, personalDetails));
    };

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const lastActorAccountID = getReportActionActorAccountID(lastAction, undefined, undefined) || report.lastActorAccountID;
    // If the last actor's details are not currently saved in Onyx Collection,
    // then try to get that from the last report action if that action is valid
    // to get data from.
    let lastActorDetails: Partial<PersonalDetails> | null = lastActorAccountID ? (personalDetails?.[lastActorAccountID] ?? null) : null;
    if (!lastActorDetails && lastAction) {
        const lastActorDisplayName = lastAction?.person?.[0]?.text;
        lastActorDetails = lastActorDisplayName
            ? {
                  displayName: lastActorDisplayName,
                  accountID: report.lastActorAccountID,
              }
            : null;
    }

    const lastActorDisplayName = getLastActorDisplayName(lastActorDetails, currentUserAccountID, translate);
    let lastMessageTextFromReport = lastMessageTextFromReportProp;
    if (!lastMessageTextFromReport) {
        lastMessageTextFromReport = getLastMessageTextForReport({
            translate,
            dateFnsLocale,
            report,
            personalDetails,
            lastActorDetails,
            conciergeReportID,
            movedFromReport,
            movedToReport,
            policy,
            isReportArchived,
            reportMetadata,
            reportAttributesDerived,
            policyTags,
            currentUserLogin,
            lastAction,
            isTrackIntentUser,
            currentUserAccountID,
        });
    }

    // We need to remove sms domain in case the last message text has a phone number mention with sms domain.
    let lastMessageText = Str.removeSMSDomain(lastMessageTextFromReport);

    // Specifically for concierge chats and expense reports, which don't meet any of the conditions in the if statement below
    if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_3DS_TRANSACTION_APPROVAL)) {
        lastMessageText = getActionableCard3DSTransactionApprovalMessage(translate, lastAction) ?? lastMessageText;
    } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.ACTION_DELEGATE_SUBMIT) && !!getDelegateSubmitMessage(translate, lastAction, currentUserLogin)) {
        lastMessageText = Parser.htmlToText(getDelegateSubmitMessage(translate, lastAction, currentUserLogin));
    }

    const isGroupChat = isGroupChatUtil(report) || isDeprecatedGroupDM(report, isReportArchived);

    const isThreadMessage = isThread(report) && lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT && lastAction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    if ((isChatRoomReport || isPolicyExpenseChatReport || isThreadReport || isTaskReportFlag || isThreadMessage || isGroupChat) && !isReportArchived) {
        const lastActionName = lastAction?.actionName ?? report.lastActionType;
        const prefix = getReportSubtitlePrefix(report);

        if (isRenamedAction(lastAction)) {
            alternateText = getRenamedAction(translate, lastAction, isExpense, lastActorDisplayName);
        } else if (isTaskAction(lastAction)) {
            alternateText = formatReportLastMessageText(getTaskReportActionMessage(translate, lastAction).text);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM) {
            const actionMessage = getReportActionMessageText(lastAction);
            alternateText = actionMessage ? `${lastActorDisplayName}: ${actionMessage}` : '';
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.LEAVE_ROOM) {
            alternateText = translate('report.actions.type.leftTheChatWithName', lastActorDisplayName);
        } else if (isInviteOrRemovedAction(lastAction)) {
            let actorDetails;
            if (lastAction.actorAccountID) {
                actorDetails = personalDetails?.[lastAction?.actorAccountID];
            }
            let actorDisplayName = lastAction?.person?.[0]?.text;
            if (!actorDetails && actorDisplayName && lastAction.actorAccountID) {
                actorDetails = {
                    displayName: actorDisplayName,
                    accountID: lastAction.actorAccountID,
                };
            }
            actorDisplayName = actorDetails ? getLastActorDisplayName(actorDetails, currentUserAccountID, translate) : undefined;
            const lastActionOriginalMessage = lastAction?.actionName ? getOriginalMessage(lastAction) : null;
            const targetAccountIDs = lastActionOriginalMessage?.targetAccountIDs ?? [];
            const targetAccountIDsLength = targetAccountIDs.length !== 0 ? targetAccountIDs.length : (report.lastMessageHtml?.match(/<mention-user[^>]*><\/mention-user>/g)?.length ?? 0);
            const verb =
                lastActionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM || lastActionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM
                    ? translate('workspace.invite.invited')
                    : translate('workspace.invite.removed');
            const users = translate(targetAccountIDsLength > 1 ? 'common.members' : 'common.member')?.toLocaleLowerCase();
            alternateText = formatReportLastMessageText(`${actorDisplayName ?? lastActorDisplayName}: ${verb} ${targetAccountIDsLength} ${users}`);
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const roomName = deprecatedGetReportName(lastActionReport ?? undefined, reportAttributesDerived) || lastActionOriginalMessage?.roomName;
            if (roomName) {
                const preposition =
                    lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM || lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM
                        ? ` ${translate('workspace.invite.to')}`
                        : ` ${translate('workspace.invite.from')}`;
                alternateText += `${preposition} ${roomName}`;
            }
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME)) {
            alternateText = getWorkspaceNameUpdatedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT) && getOriginalMessage(lastAction)?.resolution) {
            alternateText = getActionableCardFraudAlertResolutionMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION)) {
            alternateText = StringUtils.lineBreaksToSpaces(Parser.htmlToText(getWorkspaceDescriptionUpdatedMessage(translate, lastAction)));
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY)) {
            alternateText = getWorkspaceCurrencyUpdateMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY)) {
            alternateText = getWorkspaceFrequencyUpdateMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE)) {
            alternateText = translate('workspaceActions.upgradedWorkspace');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE)) {
            alternateText = Parser.htmlToText(translate('workspaceActions.forcedCorporateUpgrade'));
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE)) {
            alternateText = translate('workspaceActions.downgradedWorkspace');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
            alternateText = Parser.htmlToText(getIntegrationSyncFailedMessage(translate, lastAction, report?.policyID));
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN)) {
            alternateText = Parser.htmlToText(getCompanyCardConnectionBrokenMessage(translate, lastAction));
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.PLAID_BALANCE_FAILURE)) {
            alternateText = Parser.htmlToText(getPlaidBalanceFailureMessage(translate, lastAction));
        } else if (lastAction?.actionName && isCategoryModificationAction(lastAction.actionName)) {
            alternateText = getWorkspaceCategoryUpdateMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORIES)) {
            alternateText = getWorkspaceCategoriesUpdatedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.IMPORT_TAGS)) {
            alternateText = translate('workspaceActions.importTags');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_ALL_TAGS)) {
            alternateText = translate('workspaceActions.deletedAllTags');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_RULE)) {
            alternateText = translate('workspaceActions.addedRule');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_RULE)) {
            alternateText = translate('workspaceActions.updatedRule');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_RULE)) {
            alternateText = translate('workspaceActions.removedRule');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST)) {
            alternateText = getTagListUpdatedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_REQUIRED)) {
            alternateText = getTagListUpdatedRequiredMessage(translate, lastAction);
        } else if (
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX)
        ) {
            alternateText = getWorkspaceTaxUpdateMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_TAX_NAME)) {
            alternateText = getCustomTaxNameUpdateMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY_DEFAULT_TAX)) {
            alternateText = getCurrencyDefaultTaxUpdateMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX)) {
            alternateText = getForeignCurrencyDefaultTaxUpdateMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME)) {
            alternateText = getCleanedTagName(getTagListNameUpdatedMessage(translate, lastAction) ?? '');
        } else if (isTagModificationAction(lastAction?.actionName ?? '')) {
            alternateText = getCleanedTagName(getWorkspaceTagUpdateMessage(translate, lastAction) ?? '');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT)) {
            alternateText = getWorkspaceCustomUnitUpdatedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.IMPORT_CUSTOM_UNIT_RATES)) {
            alternateText = getWorkspaceCustomUnitRateImportedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE)) {
            alternateText = getWorkspaceCustomUnitRateAddedMessage(translate, dateFnsLocale, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE)) {
            alternateText = getWorkspaceCustomUnitRateUpdatedMessage(translate, dateFnsLocale, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE)) {
            alternateText = getWorkspaceCustomUnitRateDeletedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_SUB_RATE)) {
            alternateText = getWorkspaceCustomUnitSubRateUpdatedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_SUB_RATE)) {
            alternateText = getWorkspaceCustomUnitSubRateDeletedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD)) {
            alternateText = getWorkspaceReportFieldAddMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD)) {
            alternateText = getWorkspaceReportFieldUpdateMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD)) {
            alternateText = getWorkspaceReportFieldDeleteMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD) {
            alternateText = getWorkspaceUpdateFieldMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FEATURE_ENABLED) {
            alternateText = getWorkspaceFeatureEnabledMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_IS_ATTENDEE_TRACKING_ENABLED) {
            alternateText = getWorkspaceAttendeeTrackingUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRE_COMPANY_CARDS_ENABLED) {
            alternateText = getRequireCompanyCardsEnabledMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_CATEGORY) {
            alternateText = getRequiresCategoryMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_TAG) {
            alternateText = getRequiresTagMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_GLOBAL_REIMBURSEMENTS_FX_PREFERENCE) {
            alternateText = getCurrencyConversionFeeMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_PAY_APPROVED_REPORTS_ENABLED) {
            alternateText = getAutoPayApprovedReportsEnabledMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REIMBURSEMENT) {
            alternateText = getAutoReimbursementMessage(translate, lastAction, convertToDisplayString);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY_TAX_RATE) {
            alternateText = getCategoryTaxRateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MCC_GROUP_CATEGORY) {
            alternateText = getMccGroupCategoryMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_APPROVER) {
            alternateText = getDefaultApproverUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_SUBMITS_TO) {
            alternateText = getSubmitsToUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FORWARDS_TO) {
            alternateText = getForwardsToUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME) {
            alternateText = getInvoiceCompanyNameUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE) {
            alternateText = getInvoiceCompanyWebsiteUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSER) {
            alternateText = getReimburserUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED) {
            alternateText = getWorkspaceReimbursementUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT) {
            alternateText = getUpdateACHAccountMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ADDRESS) {
            alternateText = getCompanyAddressUpdateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT) {
            alternateText = getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(translate, lastAction, convertToDisplayString);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_ITEMIZED_RECEIPT) {
            alternateText = getPolicyChangeLogMaxExpenseAmountNoItemizedReceiptMessage(translate, lastAction, convertToDisplayString);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT) {
            alternateText = getPolicyChangeLogMaxExpenseAmountMessage(translate, lastAction, convertToDisplayString);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE) {
            alternateText = getPolicyChangeLogMaxExpenseAgeMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE) {
            alternateText = getPolicyChangeLogDefaultBillableMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE) {
            alternateText = getPolicyChangeLogDefaultReimbursableMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED) {
            alternateText = getPolicyChangeLogDefaultTitleEnforcedMessage(translate, lastAction);
        } else if (isLeavePolicyAction(lastAction)) {
            alternateText = getPolicyChangeLogEmployeeLeftMessage(translate, lastAction, getPersonalDetailsByID(lastAction.actorAccountID, personalDetails), true);
        } else if (isCardIssuedAction(lastAction)) {
            alternateText = getCardIssuedMessage({reportAction: lastAction, expensifyCard: card, translate, currentUserAccountID, buildDynamicRoute: createDynamicRoute});
        } else if (lastAction && isOldDotReportAction(lastAction)) {
            alternateText = getMessageOfOldDotReportAction(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION) {
            alternateText = StringUtils.lineBreaksToSpaces(Parser.htmlToText(getUpdateRoomDescriptionMessage(translate, lastAction)));
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_AVATAR) {
            alternateText = getRoomAvatarUpdatedMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE) {
            alternateText = getPolicyChangeLogAddEmployeeMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE) {
            alternateText = getPolicyChangeLogUpdateEmployee(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE) {
            alternateText = getPolicyChangeLogDeleteMemberMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION)) {
            const {fromReportID} = parseMovedTransactionReportIDs(lastAction);
            alternateText = Parser.htmlToText(
                getUnreportedTransactionMessage({
                    translate,
                    fromReportID,
                    derivedReportName: fromReportID ? reportAttributesDerived?.[fromReportID]?.reportName : undefined,
                }),
            );
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE) {
            alternateText = getReportActionMessageText(lastAction) ?? '';
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION) {
            alternateText = getAddedConnectionMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION) {
            alternateText = getRemovedConnectionMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CARD_FEED)) {
            alternateText = getAddedCardFeedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CARD_FEED)) {
            alternateText = getRemovedCardFeedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.RENAME_CARD_FEED)) {
            alternateText = getRenamedCardFeedMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ASSIGN_COMPANY_CARD)) {
            alternateText = getAssignedCompanyCardMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UNASSIGN_COMPANY_CARD)) {
            alternateText = getUnassignedCompanyCardMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_LIABILITY)) {
            alternateText = getUpdatedCardFeedLiabilityMessage(translate, lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_STATEMENT_PERIOD)) {
            alternateText = getUpdatedCardFeedStatementPeriodMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE) {
            alternateText = getUpdatedAuditRateMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE) {
            alternateText = getAddedApprovalRuleMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE) {
            alternateText = getDeletedApprovalRuleMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE) {
            alternateText = getUpdatedApprovalRuleMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EXPENSIFY_CARD_RULE) {
            alternateText = getAddExpensifyCardRuleMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE) {
            alternateText = getUpdateExpensifyCardRuleMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_EXPENSIFY_CARD_RULE) {
            alternateText = getRemoveExpensifyCardRuleMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_AGENT_RULE) {
            alternateText = StringUtils.lineBreaksToSpaces(getAddAgentRuleMessage(translate, lastAction));
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AGENT_RULE) {
            alternateText = StringUtils.lineBreaksToSpaces(getUpdateAgentRuleMessage(translate, lastAction));
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_AGENT_RULE) {
            alternateText = StringUtils.lineBreaksToSpaces(getDeleteAgentRuleMessage(translate, lastAction));
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD) {
            alternateText = getUpdatedManualApprovalThresholdMessage(translate, lastAction, convertToDisplayString);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_BUDGET) {
            alternateText = getAddedBudgetMessage(translate, lastAction, policy);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_BUDGET) {
            alternateText = getUpdatedBudgetMessage(translate, lastAction, policy);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_BUDGET) {
            alternateText = getDeletedBudgetMessage(translate, lastAction, policy);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TIME_ENABLED) {
            alternateText = getUpdatedTimeEnabledMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TIME_RATE) {
            alternateText = getUpdatedTimeRateMessage(translate, lastAction, convertToDisplayString);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_PROHIBITED_EXPENSES) {
            alternateText = getUpdatedProhibitedExpensesMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_CHOICE) {
            alternateText = getUpdatedReimbursementChoiceMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_AUTO_JOIN) {
            alternateText = getSetAutoJoinMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE) {
            alternateText = getUpdatedDefaultTitleMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_HARVESTING) {
            alternateText = getUpdatedAutoHarvestingMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INDIVIDUAL_BUDGET_NOTIFICATION) {
            alternateText = getUpdatedIndividualBudgetNotificationMessage(translate, lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SHARED_BUDGET_NOTIFICATION) {
            alternateText = getUpdatedSharedBudgetNotificationMessage(translate, lastAction);
        } else if (isPolicyCopyReportAction(lastAction)) {
            alternateText = Parser.htmlToText(getPolicyChangeLogCopyMessage(translate, lastAction));
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RETRACTED) {
            alternateText = translate('iou.retracted');
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REOPENED) {
            alternateText = translate('iou.reopened');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
            alternateText = getTravelUpdateMessage(translate, lastAction);
        } else if (
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.REROUTE) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.REASSIGN_APPROVER)
        ) {
            alternateText = Parser.htmlToText(getChangedApproverActionMessage(translate, lastAction));
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_OWNERSHIP) {
            alternateText = Parser.htmlToText(getUpdatedOwnershipMessage(translate, lastAction, policy));
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION)) {
            const {fromReportID, toReportID, displayReportID} = parseMovedTransactionReportIDs(lastAction);
            alternateText = Parser.htmlToText(
                getMovedTransactionMessage({
                    translate,
                    fromReportID,
                    toReportID,
                    derivedReportName: displayReportID ? reportAttributesDerived?.[displayReportID]?.reportName : undefined,
                }),
            );
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.SETTLEMENT_ACCOUNT_LOCKED)) {
            alternateText = Parser.htmlToText(getSettlementAccountLockedMessage(translate, lastAction));
        } else if (lastAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && lastActorDisplayName && lastMessageTextFromReport) {
            const displayName =
                (lastMessageTextFromReport.length > 0 &&
                    getLastActorDisplayNameFromLastVisibleActions(
                        report,
                        lastActorDetails,
                        currentUserAccountID,
                        personalDetails,
                        privateIsArchived,
                        translate,
                        visibleReportActionsData,
                        lastAction,
                    )) ||
                lastActorDisplayName;
            alternateText = formatReportLastMessageText(`${displayName}: ${lastMessageText}`);
        } else {
            alternateText =
                lastMessageTextFromReport.length > 0
                    ? formatReportLastMessageText(Parser.htmlToText(lastMessageText))
                    : getLastVisibleMessage(report.reportID, isAllowedToComment, {}, lastAction, visibleReportActionsData, currentUserAccountID)?.lastMessageText;

            if (!alternateText) {
                alternateText = formatReportLastMessageText(
                    getWelcomeMessage({
                        report,
                        policy,
                        invoiceReceiverPolicy,
                        participantPersonalDetailList: getParticipantPersonalDetailListExcludeCurrentUser(),
                        translate,
                        localeCompare,
                        conciergeReportID,
                        derivedReportName: reportAttributesDerived?.[report.reportID]?.reportName,
                        isReportArchived,
                        isTrackIntentUser,
                        currentUserAccountID,
                        formatPhoneNumber,
                    }).messageText ?? translate('report.noActivityYet'),
                );
            }
        }
        alternateText = prefix + alternateText;
    } else {
        if (!lastMessageText) {
            lastMessageText = formatReportLastMessageText(
                getWelcomeMessage({
                    report,
                    policy,
                    invoiceReceiverPolicy,
                    participantPersonalDetailList: getParticipantPersonalDetailListExcludeCurrentUser(),
                    translate,
                    localeCompare,
                    conciergeReportID,
                    derivedReportName: reportAttributesDerived?.[report.reportID]?.reportName,
                    isReportArchived,
                    formatPhoneNumber,
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                }).messageText || translate('report.noActivityYet'),
            );
        }
        if (shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID, translate) && !isReportArchived) {
            const displayName =
                (lastMessageTextFromReport.length > 0 &&
                    getLastActorDisplayNameFromLastVisibleActions(
                        report,
                        lastActorDetails,
                        currentUserAccountID,
                        personalDetails,
                        privateIsArchived,
                        translate,
                        visibleReportActionsData,
                        lastAction,
                    )) ||
                lastActorDisplayName;
            alternateText = `${displayName}: ${formatReportLastMessageText(lastMessageText)}`;
        } else {
            alternateText = formatReportLastMessageText(lastMessageText);
        }
    }

    return alternateText;
}

export {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    deprecatedCachedOneTransactionThreadReportIDs,
    getLastActorDisplayName,
    getLastActorDisplayNameFromLastVisibleActions,
    getLastMessageTextForReport,
    getReportAlternateText,
    getWelcomeMessage,
    shouldShowLastActorDisplayName,
};
