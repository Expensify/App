/**
 * Only the reportAttributes derived value may import this.
 * It lives outside ReportNameUtils because it uses ModifiedExpenseMessage, which imports ReportNameUtils.
 */
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, PolicyTagLists, Report, ReportAction, ReportActions, ReportAttributesDerivedValue, ReportNameValuePairs, Rule, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {Locale as DateFnsLocale} from 'date-fns';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {format} from 'date-fns';
import {Str} from 'expensify-common';

import {getAddAgentRuleMessage, getDeleteAgentRuleMessage, getUpdateAgentRuleMessage} from './AgentRuleChangeLogUtils';
import {getForReportAction, getMovedReportID} from './ModifiedExpenseMessage';
import createDynamicRoute from './Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {getCurrentUserEmail} from './Network/NetworkStore';
import Parser from './Parser';
import {getPersonalDetailsByID, temporaryGetDisplayNameOrDefault} from './PersonalDetailsUtils';
import {getPolicyReimburserAccountID, wasPaidWithPolicyBankAccount} from './PolicyPaymentUtils';
import {getCleanedTagName} from './PolicyUtils';
import {
    getActionableCard3DSTransactionApprovalMessage,
    getActionableCardFraudAlertResolutionMessage,
    getAddedCardFeedMessage,
    getAddedOfficeLocationMessage,
    getAgentPromptUpdatedMessage,
    getApprovalLimitUpdateMessage,
    getAssignedCompanyCardMessage,
    getAutoCategorizeNewExpensesMessage,
    getAutoPayApprovedReportsEnabledMessage,
    getAutoReimbursementMessage,
    getCardConnectionBrokenMessage,
    getCardIssuedMessage,
    getCategoryTaxRateMessage,
    getChangedApproverActionMessage,
    getCompanyAddressUpdateMessage,
    getCompanyCardConnectionBroken30DaysMessage,
    getCompanyCardConnectionBrokenMessage,
    getConciergeAutoSelectDistanceRateMessage,
    getCreatedReportForUnapprovedTransactionsMessage,
    getCrossBorderReimbursedMessage,
    getCurrencyConversionFeeMessage,
    getCurrencyDefaultTaxUpdateMessage,
    getCustomTaxNameUpdateMessage,
    getDefaultApproverUpdateMessage,
    getDelegateSubmitMessage,
    getDeletedOfficeLocationMessage,
    getDismissedViolationMessageText,
    getDynamicExternalWorkflowApproveFailedActionMessage,
    getDynamicExternalWorkflowSubmitFailedActionMessage,
    getElsewherePaymentReportActionMessage,
    getExportIntegrationLastMessageText,
    getForeignCurrencyDefaultTaxUpdateMessage,
    getForwardedReportActionMessage,
    getForwardsToUpdateMessage,
    getIntegrationSyncFailedMessage,
    getInvoiceCompanyNameUpdateMessage,
    getInvoiceCompanyWebsiteUpdateMessage,
    getJoinRequestMessage,
    getLinkedTransactionID,
    getMarkedReimbursedMessage,
    getMccGroupCategoryMessage,
    getMessageOfOldDotReportAction,
    getOriginalMessage,
    getOverLimitForwardsToUpdateMessage,
    getPlaidBalanceFailureMessage,
    getPolicyChangeLogDefaultBillableMessage,
    getPolicyChangeLogDefaultReimbursableMessage,
    getPolicyChangeLogDefaultTitleEnforcedMessage,
    getPolicyChangeLogDefaultTitleMessage,
    getPolicyChangeLogMaxExpenseAgeMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getPolicyChangeLogMaxExpenseAmountNoItemizedReceiptMessage,
    getPolicyChangeLogMaxExpenseAmountNoReceiptMessage,
    getPolicyWorkArrangementMessage,
    getReimburserUpdateMessage,
    getRemovedCardFeedMessage,
    getRenamedAction,
    getRenamedCardFeedMessage,
    getReportAction,
    getReportActionMessage,
    getReportActionText,
    getRequireCompanyCardsEnabledMessage,
    getRequiresCategoryMessage,
    getRequiresTagMessage,
    getSettlementAccountLockedMessage,
    getSubmitsToUpdateMessage,
    getTravelUpdateMessage,
    getUnassignedCompanyCardMessage,
    getUpdateACHAccountMessage,
    getUpdatedAutoHarvestingMessage,
    getUpdatedCardFeedLiabilityMessage,
    getUpdatedCardFeedStatementPeriodMessage,
    getUpdatedEmployeeOfficeLocationMessage,
    getUpdatedMemberWorkArrangementMessage,
    getUpdatedOfficeLocationMessage,
    getUpdatedProhibitedExpensesMessage,
    getWorkspaceAttendeeTrackingUpdateMessage,
    getWorkspaceCategoryUpdateMessage,
    getWorkspaceCurrencyUpdateMessage,
    getWorkspaceCustomUnitRateAddedMessage,
    getWorkspaceCustomUnitRateDeletedMessage,
    getWorkspaceCustomUnitRateUpdatedMessage,
    getWorkspaceFeatureEnabledMessage,
    getWorkspaceFrequencyUpdateMessage,
    getWorkspaceReimbursementUpdateMessage,
    getWorkspaceReportFieldAddMessage,
    getWorkspaceReportFieldDeleteMessage,
    getWorkspaceReportFieldUpdateMessage,
    getWorkspaceTagUpdateMessage,
    getWorkspaceTaxUpdateMessage,
    getWorkspaceUpdateFieldMessage,
    isActionableJoinRequest,
    isActionOfType,
    isCardIssuedAction,
    isCategoryModificationAction,
    isDynamicExternalWorkflowApproveFailedAction,
    isDynamicExternalWorkflowSubmitFailedAction,
    isMarkAsClosedAction,
    isModifiedExpenseAction,
    isMoneyRequestAction,
    isMovedAction,
    isOldDotReportAction,
    isOriginalReportDeleted,
    isPolicyCopyReportAction,
    isReimbursementDeQueuedOrCanceledAction,
    isReimbursementQueuedAction,
    isRejectedAction,
    isRenamedAction,
    isReportActionAttachment,
    isTagModificationAction,
    isTransactionThread,
    isUnapprovedAction,
    wasActionTakenByCurrentUser,
} from './ReportActionsUtils';
import {buildReportNameFromParticipantNames, getGroupChatName, getInvoiceReportName, getInvoicesChatName, getMoneyRequestReportName, getPolicyExpenseChatName} from './ReportNameUtils';
import {
    formatReportLastMessageText,
    getDisplayNameForParticipant,
    getMovedActionMessage,
    getMovedTransactionMessage,
    getPolicyChangeLogCopyMessage,
    getPolicyChangeMessage,
    getReimbursementDeQueuedOrCanceledActionMessage,
    getReimbursementQueuedActionMessage,
    getTransactionReportName,
    getUnreportedTransactionMessage,
    getWorkspaceNameUpdatedMessage,
    isAdminRoom,
    isArchivedNonExpenseReport,
    isCanceledTaskReport,
    isChatRoom,
    isChatThread,
    isClosedExpenseReportWithNoExpenses,
    isConciergeChatReport,
    isExpenseReport,
    isGroupChat,
    isInvoiceReport,
    isInvoiceRoom,
    isMoneyRequestReport,
    isPolicyExpenseChat,
    isSelfDM,
    isSupportTicket,
    isTaskReport,
    isThread,
    isTripRoom,
    isUserCreatedPolicyRoom,
    parseMovedTransactionReportIDs,
    shouldShowMarkAsDone,
} from './ReportUtils';
import {getAddExpensifyCardRuleMessage, getRemoveExpensifyCardRuleMessage, getUpdateExpensifyCardRuleMessage} from './SpendRuleChangeLogUtils';

type ComputeReportName = {
    dateFnsLocale: DateFnsLocale | undefined;
    report?: Report;
    reports?: OnyxCollection<Report>;
    policies?: OnyxCollection<Policy>;
    transactions: OnyxCollection<Transaction>;
    allReportNameValuePairs?: OnyxCollection<ReportNameValuePairs>;
    allPolicyTags?: OnyxCollection<PolicyTagLists>;
    personalDetailsList?: PersonalDetailsList;
    reportActions?: OnyxCollection<ReportActions>;
    currentUserAccountID?: number;
    currentUserLogin: string;
    translate: LocalizedTranslate;
    conciergeReportID: string | undefined;
    reportAttributes?: ReportAttributesDerivedValue['reports'];
    reportTransactions: Record<string, Transaction[]>;
    isTrackIntentUser: boolean | undefined;
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    convertToDisplayStringWithoutCurrency: CurrencyListActionsContextType['convertToDisplayStringWithoutCurrency'];
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'];
    pendingDeleteMemberAccountIDs?: string[];
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
    rules: OnyxCollection<Rule>;
};

function getLocalizedSupportTicketReportName(
    report: Report,
    personalDetailsList: PersonalDetailsList | undefined,
    dateFnsLocale: DateFnsLocale | undefined,
    translate: LocalizedTranslate,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
): string {
    const customer = temporaryGetDisplayNameOrDefault({
        passedPersonalDetails: report.ownerAccountID ? personalDetailsList?.[report.ownerAccountID] : undefined,
        defaultValue: '',
        shouldFallbackToHidden: false,
        translate,
        formatPhoneNumber,
    });
    const supportRep = temporaryGetDisplayNameOrDefault({
        passedPersonalDetails: report.managerID ? personalDetailsList?.[report.managerID] : undefined,
        defaultValue: '',
        shouldFallbackToHidden: false,
        translate,
        formatPhoneNumber,
    });

    if (!report.created || !customer || !supportRep) {
        return report.reportName ?? translate('supportTicket.fallbackTitle');
    }

    return translate('supportTicket.title', {date: format(new Date(report.created), CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT, {locale: dateFnsLocale}), customer, supportRep});
}

function generateArchivedReportName(reportName: string, translate: LocalizedTranslate): string {
    return `${reportName} (${translate('common.archived')}) `;
}

function computeReportNameBasedOnReportAction({
    translate,
    dateFnsLocale,
    formatPhoneNumber,
    parentReportAction,
    report,
    reportPolicy,
    parentReport,
    personalDetailsList,
    reportAttributes,
    isTrackIntentUser,
    currentUserAccountID,
    convertToDisplayString,
    convertToDisplayStringWithoutCurrency,
    rules,
}: {
    translate: LocalizedTranslate;
    dateFnsLocale: DateFnsLocale | undefined;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
    parentReportAction: ReportAction | undefined;
    report: Report | undefined;
    reportPolicy: Policy | undefined;
    parentReport: Report | undefined;
    personalDetailsList: OnyxEntry<PersonalDetailsList>;
    reportAttributes: ReportAttributesDerivedValue['reports'] | undefined;
    isTrackIntentUser: boolean | undefined;
    currentUserAccountID: number;
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    convertToDisplayStringWithoutCurrency: CurrencyListActionsContextType['convertToDisplayStringWithoutCurrency'];
    rules: OnyxCollection<Rule>;
}): string | undefined {
    if (!parentReportAction) {
        return undefined;
    }
    if (
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED) ||
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED) ||
        isMarkAsClosedAction(parentReportAction)
    ) {
        const harvesting = !isMarkAsClosedAction(parentReportAction) ? (getOriginalMessage(parentReportAction)?.harvesting ?? false) : false;
        if (harvesting) {
            return Parser.htmlToText(translate('iou.automaticallySubmitted'));
        }
        if (
            shouldShowMarkAsDone({
                isTrackIntentUser,
                policy: reportPolicy,
                report: parentReport,
                rules,
            })
        ) {
            return translate('iou.markedAsDone', getOriginalMessage(parentReportAction)?.message);
        }
        return translate('iou.submitted', getOriginalMessage(parentReportAction)?.message);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.FORWARDED)) {
        const {automaticAction} = getOriginalMessage(parentReportAction) ?? {};
        if (automaticAction) {
            return Parser.htmlToText(translate('iou.automaticallyForwarded'));
        }
        return getForwardedReportActionMessage(parentReportAction, translate);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD) {
        return translate('iou.heldExpense');
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION)) {
        const integrationName = getOriginalMessage(parentReportAction)?.label;
        return getExportIntegrationLastMessageText(translate, parentReportAction, integrationName);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.UNHOLD) {
        return translate('iou.unheldExpense');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTEDTRANSACTION_THREAD) {
        return translate('iou.reject.reportActions.rejectedExpense');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED_TRANSACTION_MARKASRESOLVED) {
        return translate('iou.reject.reportActions.markedAsResolved');
    }
    if (isReimbursementQueuedAction(parentReportAction)) {
        return getReimbursementQueuedActionMessage({
            reportAction: parentReportAction,
            report: parentReport,
            translate,
            formatPhoneNumber,
            shouldUseShortDisplayName: false,
            personalDetails: personalDetailsList,
        });
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED)) {
        // RECEIPT_SCAN_FAILED is submitted by Concierge, so use the IOU action to determine edit permission
        let iouAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
        if (!isActionOfType(iouAction, CONST.REPORT.ACTIONS.TYPE.IOU)) {
            iouAction = getReportAction(parentReport?.parentReportID, parentReport?.parentReportActionID);
        }
        const missingFields = getOriginalMessage(parentReportAction)?.missingFields;
        return translate('violations.smartscanFailed', {canEdit: wasActionTakenByCurrentUser(iouAction, currentUserAccountID), missingFields});
    }

    if (isReimbursementDeQueuedOrCanceledAction(parentReportAction)) {
        return getReimbursementDeQueuedOrCanceledActionMessage(translate, formatPhoneNumber, parentReportAction, parentReport?.ownerAccountID, convertToDisplayString);
    }
    if (isRejectedAction(parentReportAction)) {
        return translate('iou.rejectedThisReport');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RETRACTED) {
        return translate('iou.retracted');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REOPENED) {
        return translate('iou.reopened');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ARCHIVE_POLICY) {
        return translate('workspaceActions.archivedWorkspace');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UNARCHIVE_POLICY) {
        return translate('workspaceActions.unarchivedWorkspace');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
        return translate('workspaceActions.upgradedWorkspace');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
        return translate('workspaceActions.downgradedWorkspace');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_RULE) {
        return translate('workspaceActions.addedRule');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_RULE) {
        return translate('workspaceActions.updatedRule');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_RULE) {
        return translate('workspaceActions.removedRule');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE) {
        return Parser.htmlToText(translate('workspaceActions.forcedCorporateUpgrade'));
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY) {
        return getWorkspaceCurrencyUpdateMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD) {
        return getWorkspaceUpdateFieldMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FEATURE_ENABLED) {
        return getWorkspaceFeatureEnabledMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT) {
        return getUpdateACHAccountMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION) {
        return translate('systemMessage.mergedWithCashTransaction');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME) {
        return Str.htmlDecode(getWorkspaceNameUpdatedMessage(translate, parentReportAction));
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY) {
        return getWorkspaceFrequencyUpdateMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_HARVESTING) {
        return getUpdatedAutoHarvestingMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_POLICY_WORK_ARRANGEMENT) {
        return getPolicyWorkArrangementMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MEMBER_WORK_ARRANGEMENT) {
        return getUpdatedMemberWorkArrangementMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_OFFICE_LOCATION) {
        return getAddedOfficeLocationMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_OFFICE_LOCATION) {
        return getUpdatedOfficeLocationMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_OFFICE_LOCATION) {
        return getDeletedOfficeLocationMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE_OFFICE_LOCATION) {
        return getUpdatedEmployeeOfficeLocationMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD) {
        return getWorkspaceReportFieldAddMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD) {
        return getWorkspaceReportFieldUpdateMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD) {
        return getWorkspaceReportFieldDeleteMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION)) {
        const {fromReportID} = parseMovedTransactionReportIDs(parentReportAction);
        const reportName = fromReportID ? reportAttributes?.[fromReportID]?.reportName : undefined;
        return Parser.htmlToText(getUnreportedTransactionMessage({translate, fromReportID, derivedReportName: reportName}));
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION)) {
        const {fromReportID, toReportID, displayReportID} = parseMovedTransactionReportIDs(parentReportAction);
        return Parser.htmlToText(
            getMovedTransactionMessage({translate, fromReportID, toReportID, derivedReportName: displayReportID ? reportAttributes?.[displayReportID]?.reportName : undefined}),
        );
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT)) {
        return getPolicyChangeLogMaxExpenseAmountMessage(translate, parentReportAction, convertToDisplayString);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE)) {
        return getPolicyChangeLogMaxExpenseAgeMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT)) {
        return getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(translate, parentReportAction, convertToDisplayString);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_ITEMIZED_RECEIPT)) {
        return getPolicyChangeLogMaxExpenseAmountNoItemizedReceiptMessage(translate, parentReportAction, convertToDisplayString);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED)) {
        return getWorkspaceReimbursementUpdateMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE)) {
        return getPolicyChangeLogDefaultBillableMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE)) {
        return getPolicyChangeLogDefaultReimbursableMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_PROHIBITED_EXPENSES)) {
        return getUpdatedProhibitedExpensesMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED)) {
        return getPolicyChangeLogDefaultTitleEnforcedMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE)) {
        return getPolicyChangeLogDefaultTitleMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_IS_ATTENDEE_TRACKING_ENABLED)) {
        return getWorkspaceAttendeeTrackingUpdateMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_PAY_APPROVED_REPORTS_ENABLED)) {
        return getAutoPayApprovedReportsEnabledMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REIMBURSEMENT)) {
        return getAutoReimbursementMessage(translate, parentReportAction, convertToDisplayString);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY_TAX_RATE)) {
        return getCategoryTaxRateMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MCC_GROUP_CATEGORY)) {
        return getMccGroupCategoryMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_APPROVER)) {
        return getDefaultApproverUpdateMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_SUBMITS_TO)) {
        return getSubmitsToUpdateMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FORWARDS_TO)) {
        return getForwardsToUpdateMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_OVER_LIMIT_FORWARDS_TO)) {
        // Non-React call path: pass the standalone util until this file's own convertToDisplayString threading PR.
        return getOverLimitForwardsToUpdateMessage(translate, parentReportAction, convertToDisplayString);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVAL_LIMIT)) {
        // Non-React call path: pass the standalone util until this file's own convertToDisplayString threading PR.
        return getApprovalLimitUpdateMessage(translate, parentReportAction, convertToDisplayString);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME)) {
        return getInvoiceCompanyNameUpdateMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE)) {
        return getInvoiceCompanyWebsiteUpdateMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSER)) {
        return getReimburserUpdateMessage(translate, parentReportAction);
    }

    if (parentReportAction?.actionName && isCategoryModificationAction(parentReportAction.actionName)) {
        return getWorkspaceCategoryUpdateMessage(translate, parentReportAction, reportPolicy);
    }

    if (
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX) ||
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX) ||
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX)
    ) {
        return getWorkspaceTaxUpdateMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_TAX_NAME)) {
        return getCustomTaxNameUpdateMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY_DEFAULT_TAX)) {
        return getCurrencyDefaultTaxUpdateMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX)) {
        return getForeignCurrencyDefaultTaxUpdateMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT) && getOriginalMessage(parentReportAction)?.resolution) {
        return getActionableCardFraudAlertResolutionMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_3DS_TRANSACTION_APPROVAL)) {
        return getActionableCard3DSTransactionApprovalMessage(translate, parentReportAction, convertToDisplayString, convertToDisplayStringWithoutCurrency);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ADDRESS)) {
        return getCompanyAddressUpdateMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED)) {
        return getMarkedReimbursedMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.AGENT_PROMPT_UPDATED)) {
        return getAgentPromptUpdatedMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY)) {
        return getPolicyChangeMessage(translate, parentReportAction);
    }

    if (
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) ||
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.REROUTE) ||
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.REASSIGN_APPROVER)
    ) {
        return Parser.htmlToText(getChangedApproverActionMessage(translate, parentReportAction));
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.ACTION_DELEGATE_SUBMIT)) {
        const delegateSubmitMessage = getDelegateSubmitMessage(translate, parentReportAction, getCurrentUserEmail() ?? undefined);
        if (delegateSubmitMessage) {
            return Parser.htmlToText(delegateSubmitMessage);
        }
    }

    if (parentReportAction?.actionName && isTagModificationAction(parentReportAction?.actionName)) {
        return getCleanedTagName(getWorkspaceTagUpdateMessage(translate, parentReportAction) ?? '');
    }

    if (isMovedAction(parentReportAction)) {
        return Parser.htmlToText(getMovedActionMessage(translate, parentReportAction, parentReport));
    }

    if (
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX) ||
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX) ||
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX)
    ) {
        return getWorkspaceTaxUpdateMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION)) {
        return getDismissedViolationMessageText(translate, getOriginalMessage(parentReportAction));
    }

    if (isMoneyRequestAction(parentReportAction)) {
        const originalMessage = getOriginalMessage(parentReportAction);

        // Prefer the account stored on the action: the payer is not always the workspace payer, so the policy's
        // ACH account can belong to a different bank account than the one the report was actually paid with, and
        // attributing it to a non-payer admin's payment shows a different account to every other viewer.
        const policyAccountNumber = wasPaidWithPolicyBankAccount(reportPolicy, parentReportAction?.actorAccountID, getPolicyReimburserAccountID(reportPolicy, personalDetailsList))
            ? reportPolicy?.achAccount?.accountNumber
            : undefined;
        const last4Digits = (originalMessage?.accountNumber ?? policyAccountNumber)?.slice(-4) ?? '';

        if (originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY) {
            if (originalMessage.paymentType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                return getElsewherePaymentReportActionMessage(translate, originalMessage);
            }
            if (originalMessage.paymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
                const crossBorderMessage = getCrossBorderReimbursedMessage(translate, originalMessage, convertToDisplayString, last4Digits);
                if (crossBorderMessage) {
                    return crossBorderMessage;
                }
                if (originalMessage.automaticAction) {
                    return Parser.htmlToText(translate('iou.automaticallyPaidWithBusinessBankAccount', undefined, last4Digits));
                }
                return translate('iou.businessBankAccount', undefined, last4Digits);
            }
            if (originalMessage.paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                if (originalMessage.automaticAction) {
                    return Parser.htmlToText(translate('iou.automaticallyPaidWithExpensify'));
                }
                return translate('iou.paidWithExpensify');
            }
        }
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.APPROVED)) {
        const {automaticAction} = getOriginalMessage(parentReportAction) ?? {};
        if (automaticAction) {
            return Parser.htmlToText(translate('iou.automaticallyApproved'));
        }
        return translate('iou.approvedMessage');
    }

    if (isUnapprovedAction(parentReportAction)) {
        return translate('iou.unapproved');
    }

    if (isActionableJoinRequest(parentReportAction)) {
        return getJoinRequestMessage(translate, reportPolicy?.name ?? '', parentReportAction, getPersonalDetailsByID(getOriginalMessage(parentReportAction)?.accountID, personalDetailsList));
    }

    if (isTaskReport(report) && isCanceledTaskReport(report, parentReportAction)) {
        return translate('parentReportAction.deletedTask');
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
        return Parser.htmlToText(getIntegrationSyncFailedMessage(translate, parentReportAction, report?.policyID));
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN)) {
        return Parser.htmlToText(getCompanyCardConnectionBrokenMessage(translate, parentReportAction));
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN_30_DAYS)) {
        return Parser.htmlToText(getCompanyCardConnectionBroken30DaysMessage(translate, parentReportAction));
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.PERSONAL_CARD_CONNECTION_BROKEN)) {
        return Parser.htmlToText(getCardConnectionBrokenMessage(undefined, getOriginalMessage(parentReportAction)?.cardName, translate, false));
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.PERSONAL_CARD_CONNECTION_BROKEN_30_DAYS)) {
        return Parser.htmlToText(getCardConnectionBrokenMessage(undefined, getOriginalMessage(parentReportAction)?.cardName, translate, true));
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.PLAID_BALANCE_FAILURE)) {
        return Parser.htmlToText(getPlaidBalanceFailureMessage(translate, parentReportAction));
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
        return getTravelUpdateMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.CONCIERGE_AUTO_SELECT_DISTANCE_RATE)) {
        return getConciergeAutoSelectDistanceRateMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE)) {
        return getWorkspaceCustomUnitRateAddedMessage(translate, dateFnsLocale, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE)) {
        return getWorkspaceCustomUnitRateUpdatedMessage(translate, dateFnsLocale, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE)) {
        return getWorkspaceCustomUnitRateDeletedMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.SETTLEMENT_ACCOUNT_LOCKED)) {
        return Parser.htmlToText(getSettlementAccountLockedMessage(translate, parentReportAction));
    }

    if (isOldDotReportAction(parentReportAction)) {
        return getMessageOfOldDotReportAction(translate, parentReportAction);
    }

    if (isRenamedAction(parentReportAction)) {
        return getRenamedAction(translate, parentReportAction, isExpenseReport(parentReport));
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES)) {
        return translate('violations.resolvedDuplicates');
    }

    if (isCardIssuedAction(parentReportAction)) {
        return getCardIssuedMessage({reportAction: parentReportAction, translate, currentUserAccountID, buildDynamicRoute: createDynamicRoute});
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CARD_FEED)) {
        return getAddedCardFeedMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CARD_FEED)) {
        return getRemovedCardFeedMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.RENAME_CARD_FEED)) {
        return getRenamedCardFeedMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ASSIGN_COMPANY_CARD)) {
        return getAssignedCompanyCardMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UNASSIGN_COMPANY_CARD)) {
        return getUnassignedCompanyCardMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_LIABILITY)) {
        return getUpdatedCardFeedLiabilityMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_STATEMENT_PERIOD)) {
        return getUpdatedCardFeedStatementPeriodMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRE_COMPANY_CARDS_ENABLED)) {
        return getRequireCompanyCardsEnabledMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_CATEGORIZE_NEW_EXPENSES)) {
        return getAutoCategorizeNewExpensesMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_CATEGORY)) {
        return getRequiresCategoryMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_TAG)) {
        return getRequiresTagMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_GLOBAL_REIMBURSEMENTS_FX_PREFERENCE)) {
        return getCurrencyConversionFeeMessage(translate, parentReportAction);
    }

    if (isDynamicExternalWorkflowSubmitFailedAction(parentReportAction)) {
        return getDynamicExternalWorkflowSubmitFailedActionMessage(translate, parentReportAction);
    }
    if (isDynamicExternalWorkflowApproveFailedAction(parentReportAction)) {
        return getDynamicExternalWorkflowApproveFailedActionMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EXPENSIFY_CARD_RULE)) {
        return getAddExpensifyCardRuleMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE)) {
        return getUpdateExpensifyCardRuleMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_EXPENSIFY_CARD_RULE)) {
        return getRemoveExpensifyCardRuleMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_AGENT_RULE)) {
        return getAddAgentRuleMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AGENT_RULE)) {
        return getUpdateAgentRuleMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_AGENT_RULE)) {
        return getDeleteAgentRuleMessage(translate, parentReportAction);
    }
    if (isPolicyCopyReportAction(parentReportAction)) {
        return Parser.htmlToText(getPolicyChangeLogCopyMessage(translate, parentReportAction));
    }

    return undefined;
}

function computeChatThreadReportName({
    translate,
    formatPhoneNumber,
    convertToDisplayString,
    getCurrencySymbol,
    isArchived,
    report,
    reports,
    parentReport,
    currentUserAccountID,
    currentUserLogin,
    transactions,
    conciergeReportID,
    parentReportAction,
    policyTags,
    policy,
}: {
    translate: LocalizedTranslate;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'];
    isArchived: boolean;
    report: Report;
    reports: OnyxCollection<Report>;
    parentReport: OnyxEntry<Report>;
    currentUserAccountID: number | undefined;
    currentUserLogin: string;
    transactions: OnyxCollection<Transaction>;
    conciergeReportID: string | undefined;
    parentReportAction?: ReportAction;
    policyTags?: OnyxEntry<PolicyTagLists>;
    policy?: OnyxEntry<Policy>;
}): string | undefined {
    if (!isChatThread(report)) {
        return undefined;
    }
    if (!parentReportAction) {
        return undefined;
    }

    const parentReportActionMessage = getReportActionMessage(parentReportAction);
    const isArchivedNonExpense = isArchivedNonExpenseReport(report, isArchived);

    if (!isEmptyObject(parentReportAction) && isTransactionThread(parentReportAction)) {
        const linkedTransactionID = getLinkedTransactionID(parentReportAction);
        const linkedTransaction = linkedTransactionID ? transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${linkedTransactionID}`] : undefined;
        const linkedTransactionReport = linkedTransaction?.reportID ? reports?.[`${ONYXKEYS.COLLECTION.REPORT}${linkedTransaction.reportID}`] : undefined;
        let formattedName = getTransactionReportName({
            translate,
            convertToDisplayString,
            getCurrencySymbol,
            reportAction: parentReportAction,
            linkedTransaction,
            report: linkedTransactionReport,
        });

        if (isArchivedNonExpense) {
            formattedName = generateArchivedReportName(formattedName, translate);
        }
        return formatReportLastMessageText(formattedName);
    }

    if (parentReportActionMessage?.isDeletedParentAction) {
        return translate('parentReportAction.deletedMessage');
    }

    const parentReportActionText = getReportActionText(parentReportAction);

    // Concierge titles each of its threads with a summary of the question, so prefer that over the question itself.
    // A thread opened by hand is named after the parent message, and that copy isn't localized (an attachment is stored
    // as the literal "[Attachment]"), so keep computing the name until Concierge replaces it with a generated title.
    if (
        report.reportName &&
        report.reportName !== CONST.REPORT.DEFAULT_REPORT_NAME &&
        report.reportName !== parentReportActionText &&
        isConciergeChatReport(parentReport, conciergeReportID)
    ) {
        return report.reportName;
    }

    const isAttachment = isReportActionAttachment(!isEmptyObject(parentReportAction) ? parentReportAction : undefined);
    const reportActionMessage = parentReportActionText.replaceAll(/(\n+|\r\n|\n|\r)/gm, ' ');
    if (isAttachment && reportActionMessage) {
        return `[${translate('common.attachment')}]`;
    }
    if (
        parentReportActionMessage?.moderationDecision?.decision === CONST.MODERATION.MODERATOR_DECISION_PENDING_HIDE ||
        parentReportActionMessage?.moderationDecision?.decision === CONST.MODERATION.MODERATOR_DECISION_HIDDEN ||
        parentReportActionMessage?.moderationDecision?.decision === CONST.MODERATION.MODERATOR_DECISION_PENDING_REMOVE
    ) {
        return translate('parentReportAction.hiddenMessage');
    }
    if (isAdminRoom(report) || isUserCreatedPolicyRoom(report)) {
        return reportActionMessage;
    }

    if (reportActionMessage && isArchivedNonExpense) {
        return generateArchivedReportName(reportActionMessage, translate);
    }
    if (!isEmptyObject(parentReportAction) && isModifiedExpenseAction(parentReportAction)) {
        const movedFromReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(parentReportAction, CONST.REPORT.MOVE_TYPE.FROM)}`];
        const movedToReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(parentReportAction, CONST.REPORT.MOVE_TYPE.TO)}`];
        const modifiedMessageWithHTML = getForReportAction({
            translate,
            formatPhoneNumber,
            convertToDisplayString,
            reportAction: parentReportAction,
            movedFromReport,
            movedToReport,
            policyTags,
            policy,
            currentUserAccountID,
            currentUserLogin,
            movedFromReportName: undefined,
        });
        // Strip HTML tags for plain text display in report previews
        const modifiedMessage = Parser.htmlToText(modifiedMessageWithHTML);
        return formatReportLastMessageText(modifiedMessage);
    }
    if (isTripRoom(report) && report?.reportName !== CONST.REPORT.DEFAULT_REPORT_NAME) {
        return report?.reportName ?? '';
    }
    return reportActionMessage;
}

/**
 * @internal Use this only for computation in derived report attributes
 * In all other cases you should use `getReportName`
 */
function computeReportName({
    dateFnsLocale,
    report,
    reports,
    policies,
    transactions,
    allReportNameValuePairs,
    personalDetailsList,
    reportActions,
    currentUserAccountID,
    currentUserLogin,
    translate,
    allPolicyTags,
    conciergeReportID,
    reportAttributes,
    reportTransactions,
    isTrackIntentUser,
    convertToDisplayString,
    convertToDisplayStringWithoutCurrency,
    getCurrencySymbol,
    pendingDeleteMemberAccountIDs,
    formatPhoneNumber,
    rules,
}: ComputeReportName): string {
    if (!report?.reportID) {
        return '';
    }

    const reportPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
    const parentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];
    const parentReportAction = isThread(report) ? reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`]?.[report.parentReportActionID] : undefined;

    const parentReportActionBasedName = computeReportNameBasedOnReportAction({
        translate,
        dateFnsLocale,
        formatPhoneNumber,
        parentReportAction,
        report,
        reportPolicy,
        parentReport,
        personalDetailsList,
        reportAttributes,
        isTrackIntentUser,
        currentUserAccountID: currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID,
        convertToDisplayString,
        convertToDisplayStringWithoutCurrency,
        rules,
    });

    if (parentReportActionBasedName) {
        return parentReportActionBasedName;
    }

    if (report?.reportName && report.type === CONST.REPORT.TYPE.EXPENSE) {
        return report?.reportName;
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS)) {
        const {originalID} = getOriginalMessage(parentReportAction) ?? {};
        const originalReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${originalID}`];
        const reportName = computeReportName({
            dateFnsLocale,
            report: originalReport,
            reports,
            policies,
            transactions,
            allReportNameValuePairs,
            personalDetailsList,
            reportActions,
            currentUserAccountID,
            currentUserLogin,
            translate,
            conciergeReportID,
            reportAttributes,
            reportTransactions,
            isTrackIntentUser,
            convertToDisplayString,
            convertToDisplayStringWithoutCurrency,
            getCurrencySymbol,
            // Not forwarded: these belong to `report`, and `originalReport` is an expense report, never a group chat.
            pendingDeleteMemberAccountIDs: undefined,
            formatPhoneNumber,
            rules,
        });
        return getCreatedReportForUnapprovedTransactionsMessage(originalID, reportName, isOriginalReportDeleted(parentReportAction, originalReport), translate);
    }

    if (isTaskReport(report)) {
        const taskName = report?.reportName ?? '';

        return Parser.isHTML(taskName) ? Parser.htmlToText(taskName).trim() : taskName.trim();
    }

    if (isSupportTicket(report)) {
        return getLocalizedSupportTicketReportName(report, personalDetailsList, dateFnsLocale, translate, formatPhoneNumber);
    }

    const privateIsArchivedValue = !!allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]?.private_isArchived;

    const policyTags = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report.policyID}`];
    const chatThreadReportName = computeChatThreadReportName({
        translate,
        convertToDisplayString,
        getCurrencySymbol,
        isArchived: privateIsArchivedValue,
        report,
        reports: reports ?? {},
        parentReport,
        currentUserAccountID,
        currentUserLogin: currentUserLogin ?? '',
        transactions,
        conciergeReportID,
        parentReportAction,
        policyTags,
        policy: reportPolicy,
        formatPhoneNumber,
    });
    if (chatThreadReportName) {
        return chatThreadReportName;
    }

    if (isClosedExpenseReportWithNoExpenses(report, (reportTransactions[report.reportID]?.length ?? 0) > 0)) {
        return translate('parentReportAction.deletedReport');
    }

    if (isGroupChat(report)) {
        return getGroupChatName(formatPhoneNumber, translate, undefined, true, report, pendingDeleteMemberAccountIDs) ?? '';
    }

    let formattedName: string | undefined;

    if (isChatRoom(report)) {
        formattedName = report?.reportName;
    }

    if (isPolicyExpenseChat(report)) {
        formattedName = getPolicyExpenseChatName({report, personalDetailsList, translate, formatPhoneNumber});
    }

    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
    if (isMoneyRequestReport(report)) {
        formattedName = getMoneyRequestReportName({
            report,
            policy,
            linkedTransactions: reportTransactions[report.reportID] ?? [],
            personalDetailsList,
            translate,
            formatPhoneNumber,
            convertToDisplayString,
        });
    }

    if (isInvoiceReport(report)) {
        const chatReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
        let chatReceiverPolicyID: string | undefined;
        const chatReceiver = chatReport?.invoiceReceiver as unknown;
        if (chatReceiver && typeof chatReceiver === 'object' && 'policyID' in chatReceiver) {
            chatReceiverPolicyID = (chatReceiver as {policyID: string}).policyID;
        }
        const invoiceReceiverPolicy = chatReceiverPolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${chatReceiverPolicyID}`] : undefined;
        formattedName = getInvoiceReportName(
            report,
            reportTransactions[report.reportID] ?? [],
            translate,
            formatPhoneNumber,
            convertToDisplayString,
            personalDetailsList,
            policy,
            invoiceReceiverPolicy,
        );
    }

    if (isInvoiceRoom(report)) {
        let receiverPolicyID: string | undefined;
        const receiver = report?.invoiceReceiver as unknown;
        if (receiver && typeof receiver === 'object' && 'policyID' in receiver) {
            receiverPolicyID = (receiver as {policyID: string}).policyID;
        }
        const invoiceReceiverPolicy = receiverPolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${receiverPolicyID}`] : undefined;
        formattedName = getInvoicesChatName({
            report,
            receiverPolicy: invoiceReceiverPolicy,
            personalDetails: personalDetailsList,
            currentUserAccountID,
            policy,
            translate,
            formatPhoneNumber,
        });
    }

    if (isSelfDM(report)) {
        formattedName = getDisplayNameForParticipant({
            accountID: report?.ownerAccountID,
            shouldAddCurrentUserPostfix: true,
            personalDetailsData: personalDetailsList,
            formatPhoneNumber,
            hiddenTranslation: translate('common.hidden'),
            youTranslation: translate('common.you').toLowerCase(),
        });
    }

    if (isConciergeChatReport(report, conciergeReportID)) {
        formattedName = CONST.CONCIERGE_DISPLAY_NAME;
    }

    const isArchivedNonExpense = isArchivedNonExpenseReport(report, privateIsArchivedValue);

    if (formattedName) {
        return formatReportLastMessageText(isArchivedNonExpense ? generateArchivedReportName(formattedName, translate) : formattedName);
    }

    // Not a room or PolicyExpenseChat, generate title from first 5 other participants
    formattedName = buildReportNameFromParticipantNames({report, personalDetailsList, currentUserAccountID, translate, formatPhoneNumber});

    const finalName = formattedName ?? report?.reportName ?? '';

    return isArchivedNonExpense ? generateArchivedReportName(finalName, translate) : finalName;
}

export default computeReportName;
