/**
 * This file contains utility functions for managing and computing report names
 */
import {Str} from 'expensify-common';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList, Policy, Report, ReportAction, ReportActions, ReportAttributesDerivedValue, ReportNameValuePairs, Transaction} from '@src/types/onyx';
import type {ReportNameValuePairsCollectionDataSet} from '@src/types/onyx/ReportNameValuePairs';
import type {SearchPolicy} from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {convertToDisplayString} from './CurrencyUtils';
import {formatPhoneNumber} from './LocalePhoneNumber';
import {translateLocal} from './Localize';
import {getForReportAction, getMovedReportID} from './ModifiedExpenseMessage';
import Parser from './Parser';
import {getDisplayNameOrDefault} from './PersonalDetailsUtils';
import {getCleanedTagName} from './PolicyUtils';
import {
    getActionableCardFraudAlertResolutionMessage,
    getCardIssuedMessage,
    getChangedApproverActionMessage,
    getIntegrationSyncFailedMessage,
    getJoinRequestMessage,
    getMessageOfOldDotReportAction,
    getOriginalMessage,
    getPolicyChangeLogDefaultBillableMessage,
    getPolicyChangeLogDefaultReimbursableMessage,
    getPolicyChangeLogDefaultTitleEnforcedMessage,
    getPolicyChangeLogMaxExpenseAmountNoReceiptMessage,
    getRenamedAction,
    getReopenedMessage,
    getReportActionMessage as getReportActionMessageFromActionsUtils,
    getReportActionText,
    getRetractedMessage,
    getTravelUpdateMessage,
    getWorkspaceCurrencyUpdateMessage,
    getWorkspaceFrequencyUpdateMessage,
    getWorkspaceReportFieldAddMessage,
    getWorkspaceReportFieldDeleteMessage,
    getWorkspaceReportFieldUpdateMessage,
    getWorkspaceTagUpdateMessage,
    getWorkspaceUpdateFieldMessage,
    isActionableJoinRequest,
    isActionOfType,
    isCardIssuedAction,
    isMarkAsClosedAction,
    isModifiedExpenseAction,
    isMoneyRequestAction,
    isMovedAction,
    isOldDotReportAction,
    isRenamedAction,
    isReportActionAttachment,
    isTagModificationAction,
    isTransactionThread,
    isUnapprovedAction,
} from './ReportActionsUtils';
import {
    formatReportLastMessageText,
    getDisplayNameForParticipant,
    getDowngradeWorkspaceMessage,
    getGroupChatName,
    getInvoicesChatName,
    getMoneyRequestSpendBreakdown,
    getMovedActionMessage,
    getParentReport,
    getPolicyChangeMessage,
    getPolicyExpenseChatName,
    getPolicyName,
    getRejectedReportMessage,
    getReportOrDraftReport,
    getTransactionReportName,
    getUnreportedTransactionMessage,
    getUpgradeWorkspaceMessage,
    getWorkspaceNameUpdatedMessage,
    hasNonReimbursableTransactions,
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
    isNewDotInvoice,
    isOpenExpenseReport,
    isOpenInvoiceReport,
    isPolicyExpenseChat,
    isProcessingReport,
    isReportApproved,
    isSelfDM,
    isSettled,
    isTaskReport,
    isThread,
    isTripRoom,
    isUserCreatedPolicyRoom,
} from './ReportUtils';

function generateArchivedReportName(reportName: string): string {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return `${reportName} (${translateLocal('common.archived')}) `;
}

/**
 * Generates a report title using the names of participants, excluding the current user.
 * This function is useful in contexts such as 1:1 direct messages (DMs) or other group chats.
 * It limits to a maximum of 5 participants for the title and uses short names unless there is only one participant.
 */
const buildReportNameFromParticipantNames = ({report, personalDetailsList: personalDetailsData}: {report: OnyxEntry<Report>; personalDetailsList?: Partial<PersonalDetailsList>}) =>
    Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((id) => id !== report?.ownerAccountID)
        .slice(0, 5)
        .map((accountID) => ({
            accountID,
            name: getDisplayNameForParticipant({
                accountID,
                shouldUseShortForm: true,
                personalDetailsData,
            }),
        }))
        .filter((participant) => participant.name)
        .reduce((formattedNames, {name, accountID}, _, array) => {
            // If there is only one participant (if it is 0 or less the function will return empty string), return their full name
            if (array.length < 2) {
                return getDisplayNameForParticipant({
                    accountID,
                    personalDetailsData,
                });
            }
            return formattedNames ? `${formattedNames}, ${name}` : name;
        }, '');

function getInvoiceReportName(report: OnyxEntry<Report>, policy?: OnyxEntry<Policy>, invoiceReceiverPolicy?: OnyxEntry<Policy>): string {
    const moneyRequestReportName = getMoneyRequestReportName({report, policy, invoiceReceiverPolicy});
    const oldDotInvoiceName = report?.reportName ?? moneyRequestReportName;
    return isNewDotInvoice(report?.chatReportID) ? moneyRequestReportName : oldDotInvoiceName;
}

/**
 * Get the invoice payer name based on its type:
 * - Individual - a receiver display name.
 * - Policy - a receiver policy name.
 */
function getInvoicePayerName(report: OnyxEntry<Report>, invoiceReceiverPolicy?: OnyxEntry<Policy> | SearchPolicy, invoiceReceiverPersonalDetail?: PersonalDetails | null): string {
    const invoiceReceiver = report?.invoiceReceiver;
    const isIndividual = invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;

    if (isIndividual) {
        return formatPhoneNumber(getDisplayNameOrDefault(invoiceReceiverPersonalDetail ?? undefined));
    }

    return getPolicyName({report, policy: invoiceReceiverPolicy});
}

/**
 * Get the title for an IOU or expense chat which will be showing the payer and the amount
 */
function getMoneyRequestReportName({
    report,
    policy,
    invoiceReceiverPolicy,
}: {
    report: OnyxEntry<Report>;
    policy?: OnyxEntry<Policy> | SearchPolicy;
    invoiceReceiverPolicy?: OnyxEntry<Policy> | SearchPolicy;
}): string {
    if (report?.reportName && isExpenseReport(report)) {
        return report.reportName;
    }

    const moneyRequestTotal = getMoneyRequestSpendBreakdown(report).totalDisplaySpend;
    const formattedAmount = convertToDisplayString(moneyRequestTotal, report?.currency);

    let payerOrApproverName;
    if (isExpenseReport(report)) {
        const parentReport = getParentReport(report);
        payerOrApproverName = getPolicyName({report: parentReport ?? report, policy});
    } else if (isInvoiceReport(report)) {
        const chatReport = getReportOrDraftReport(report?.chatReportID);
        payerOrApproverName = getInvoicePayerName(chatReport, invoiceReceiverPolicy);
    } else {
        payerOrApproverName = getDisplayNameForParticipant({accountID: report?.managerID}) ?? '';
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const payerPaidAmountMessage = translateLocal('iou.payerPaidAmount', {
        payer: payerOrApproverName,
        amount: formattedAmount,
    });

    if (isReportApproved({report})) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.managerApprovedAmount', {
            manager: payerOrApproverName,
            amount: formattedAmount,
        });
    }

    if (report?.isWaitingOnBankAccount) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return `${payerPaidAmountMessage} ${CONST.DOT_SEPARATOR} ${translateLocal('iou.pending')}`;
    }

    if (!isSettled(report?.reportID) && hasNonReimbursableTransactions(report?.reportID)) {
        payerOrApproverName = getDisplayNameForParticipant({accountID: report?.ownerAccountID}) ?? '';
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.payerSpentAmount', {payer: payerOrApproverName, amount: formattedAmount});
    }

    if (isProcessingReport(report) || isOpenExpenseReport(report) || isOpenInvoiceReport(report) || moneyRequestTotal === 0) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.payerOwesAmount', {payer: payerOrApproverName, amount: formattedAmount});
    }

    return payerPaidAmountMessage;
}

function computeReportNameBasedOnReportAction(parentReportAction?: ReportAction, report?: Report, reportPolicy?: Policy, parentReport?: Report): string | undefined {
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('iou.automaticallySubmitted');
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.submitted', {memo: getOriginalMessage(parentReportAction)?.message});
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.FORWARDED)) {
        const {automaticAction} = getOriginalMessage(parentReportAction) ?? {};
        if (automaticAction) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('iou.automaticallyForwarded');
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.forwarded');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED) {
        return getRejectedReportMessage();
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RETRACTED) {
        return getRetractedMessage();
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REOPENED) {
        return getReopenedMessage();
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
        return getUpgradeWorkspaceMessage();
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
        return getDowngradeWorkspaceMessage();
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY) {
        return getWorkspaceCurrencyUpdateMessage(parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD) {
        return getWorkspaceUpdateFieldMessage(parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('systemMessage.mergedWithCashTransaction');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME) {
        return Str.htmlDecode(getWorkspaceNameUpdatedMessage(parentReportAction));
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY) {
        return getWorkspaceFrequencyUpdateMessage(parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD) {
        return getWorkspaceReportFieldAddMessage(parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD) {
        return getWorkspaceReportFieldUpdateMessage(parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD) {
        return getWorkspaceReportFieldDeleteMessage(parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION)) {
        return getUnreportedTransactionMessage();
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT)) {
        return getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE)) {
        return getPolicyChangeLogDefaultBillableMessage(parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE)) {
        return getPolicyChangeLogDefaultReimbursableMessage(parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED)) {
        return getPolicyChangeLogDefaultTitleEnforcedMessage(parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT) && getOriginalMessage(parentReportAction)?.resolution) {
        return getActionableCardFraudAlertResolutionMessage(parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.paidElsewhere');
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY)) {
        return getPolicyChangeMessage(parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) || isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.REROUTE)) {
        return getChangedApproverActionMessage(parentReportAction);
    }

    if (parentReportAction?.actionName && isTagModificationAction(parentReportAction?.actionName)) {
        return getCleanedTagName(getWorkspaceTagUpdateMessage(parentReportAction) ?? '');
    }

    if (isMovedAction(parentReportAction)) {
        return getMovedActionMessage(parentReportAction, parentReport);
    }

    if (isMoneyRequestAction(parentReportAction)) {
        const originalMessage = getOriginalMessage(parentReportAction);
        const last4Digits = reportPolicy?.achAccount?.accountNumber?.slice(-4) ?? '';

        if (originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY) {
            if (originalMessage.paymentType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('iou.paidElsewhere');
            }
            if (originalMessage.paymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
                if (originalMessage.automaticAction) {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    return translateLocal('iou.automaticallyPaidWithBusinessBankAccount', {last4Digits});
                }
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('iou.businessBankAccount', {last4Digits});
            }
            if (originalMessage.paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                if (originalMessage.automaticAction) {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    return translateLocal('iou.automaticallyPaidWithExpensify');
                }
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('iou.paidWithExpensify');
            }
        }
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.APPROVED)) {
        const {automaticAction} = getOriginalMessage(parentReportAction) ?? {};
        if (automaticAction) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('iou.automaticallyApproved');
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.approvedMessage');
    }

    if (isUnapprovedAction(parentReportAction)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.unapproved');
    }

    if (isActionableJoinRequest(parentReportAction)) {
        return getJoinRequestMessage(parentReportAction);
    }

    if (isTaskReport(report) && isCanceledTaskReport(report, parentReportAction)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('parentReportAction.deletedTask');
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
        return getIntegrationSyncFailedMessage(parentReportAction, report?.policyID);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
        return getTravelUpdateMessage(parentReportAction);
    }

    return undefined;
}

function computeChatThreadReportName(report: Report, reportNameValuePairs: ReportNameValuePairs, reports: OnyxCollection<Report>, parentReportAction?: ReportAction): string | undefined {
    if (!isChatThread(report)) {
        return undefined;
    }
    if (!parentReportAction) {
        return undefined;
    }

    const parentReportActionMessage = getReportActionMessageFromActionsUtils(parentReportAction);
    const isArchivedNonExpense = isArchivedNonExpenseReport(report, !!reportNameValuePairs?.private_isArchived);

    if (!isEmptyObject(parentReportAction) && isTransactionThread(parentReportAction)) {
        let formattedName = getTransactionReportName({reportAction: parentReportAction});

        if (isArchivedNonExpense) {
            formattedName = generateArchivedReportName(formattedName);
        }
        return formatReportLastMessageText(formattedName);
    }

    if (!isEmptyObject(parentReportAction) && isOldDotReportAction(parentReportAction)) {
        return getMessageOfOldDotReportAction(parentReportAction);
    }

    if (isRenamedAction(parentReportAction)) {
        const parent = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];
        return getRenamedAction(parentReportAction, isExpenseReport(parent));
    }

    if (parentReportActionMessage?.isDeletedParentAction) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('parentReportAction.deletedMessage');
    }

    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('violations.resolvedDuplicates');
    }

    const isAttachment = isReportActionAttachment(!isEmptyObject(parentReportAction) ? parentReportAction : undefined);
    const reportActionMessage = getReportActionText(parentReportAction).replace(/(\n+|\r\n|\n|\r)/gm, ' ');
    if (isAttachment && reportActionMessage) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return `[${translateLocal('common.attachment')}]`;
    }
    if (
        parentReportActionMessage?.moderationDecision?.decision === CONST.MODERATION.MODERATOR_DECISION_PENDING_HIDE ||
        parentReportActionMessage?.moderationDecision?.decision === CONST.MODERATION.MODERATOR_DECISION_HIDDEN ||
        parentReportActionMessage?.moderationDecision?.decision === CONST.MODERATION.MODERATOR_DECISION_PENDING_REMOVE
    ) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('parentReportAction.hiddenMessage');
    }
    if (isAdminRoom(report) || isUserCreatedPolicyRoom(report)) {
        return reportActionMessage;
    }

    if (reportActionMessage && isArchivedNonExpense) {
        return generateArchivedReportName(reportActionMessage);
    }
    if (!isEmptyObject(parentReportAction) && isModifiedExpenseAction(parentReportAction)) {
        const policyID = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`]?.policyID;

        const movedFromReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(parentReportAction, CONST.REPORT.MOVE_TYPE.FROM)}`];
        const movedToReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(parentReportAction, CONST.REPORT.MOVE_TYPE.TO)}`];
        const modifiedMessage = getForReportAction({
            reportAction: parentReportAction,
            policyID,
            movedFromReport,
            movedToReport,
        });
        return formatReportLastMessageText(modifiedMessage);
    }
    if (isTripRoom(report) && report?.reportName !== CONST.REPORT.DEFAULT_REPORT_NAME) {
        return report?.reportName ?? '';
    }
    if (isCardIssuedAction(parentReportAction)) {
        return getCardIssuedMessage({reportAction: parentReportAction});
    }
    return reportActionMessage;
}

function computeReportName(
    report?: Report,
    reports?: OnyxCollection<Report>,
    policies?: OnyxCollection<Policy>,
    transactions?: OnyxCollection<Transaction>,
    reportNameValuePairsList?: OnyxCollection<ReportNameValuePairs>,
    personalDetailsList?: PersonalDetailsList,
    reportActions?: OnyxCollection<ReportActions>,
): string {
    if (!report || !report.reportID) {
        return '';
    }

    const reportNameValuePairs = reportNameValuePairsList?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`];
    const reportPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];

    const isArchivedNonExpense = isArchivedNonExpenseReport(report, !!reportNameValuePairs?.private_isArchived);

    const parentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];
    const parentReportAction = isThread(report) ? reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`]?.[report.parentReportActionID] : undefined;

    const parentReportActionBasedName = computeReportNameBasedOnReportAction(parentReportAction, report, reportPolicy, parentReport);

    if (parentReportActionBasedName) {
        return parentReportActionBasedName;
    }

    if (isTaskReport(report)) {
        return Parser.htmlToText(report?.reportName ?? '').trim();
    }

    const chatThreadReportName = computeChatThreadReportName(report, reportNameValuePairs ?? {}, reports ?? {}, parentReportAction);
    if (chatThreadReportName) {
        return chatThreadReportName;
    }

    const transactionsArray = transactions ? (Object.values(transactions).filter(Boolean) as Array<OnyxEntry<Transaction>>) : undefined;
    if (isClosedExpenseReportWithNoExpenses(report, transactionsArray)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('parentReportAction.deletedReport');
    }

    if (isGroupChat(report)) {
        return getGroupChatName(undefined, true, report) ?? '';
    }

    let formattedName: string | undefined;

    if (isChatRoom(report)) {
        formattedName = report?.reportName;
    }

    if (isPolicyExpenseChat(report)) {
        formattedName = getPolicyExpenseChatName({report, personalDetailsList});
    }

    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
    if (isMoneyRequestReport(report)) {
        formattedName = getMoneyRequestReportName({report, policy});
    }

    if (isInvoiceReport(report)) {
        const chatReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
        let chatReceiverPolicyID: string | undefined;
        const chatReceiver = chatReport?.invoiceReceiver as unknown;
        if (chatReceiver && typeof chatReceiver === 'object' && 'policyID' in chatReceiver) {
            chatReceiverPolicyID = (chatReceiver as {policyID: string}).policyID;
        }
        const invoiceReceiverPolicy = chatReceiverPolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${chatReceiverPolicyID}`] : undefined;
        formattedName = getInvoiceReportName(report, policy, invoiceReceiverPolicy);
    }

    if (isInvoiceRoom(report)) {
        let receiverPolicyID: string | undefined;
        const receiver = report?.invoiceReceiver as unknown;
        if (receiver && typeof receiver === 'object' && 'policyID' in receiver) {
            receiverPolicyID = (receiver as {policyID: string}).policyID;
        }
        const invoiceReceiverPolicy = receiverPolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${receiverPolicyID}`] : undefined;
        formattedName = getInvoicesChatName({report, receiverPolicy: invoiceReceiverPolicy, personalDetails: personalDetailsList});
    }

    if (isSelfDM(report)) {
        formattedName = getDisplayNameForParticipant({accountID: report?.ownerAccountID, shouldAddCurrentUserPostfix: true, personalDetailsData: personalDetailsList});
    }

    if (isConciergeChatReport(report)) {
        formattedName = CONST.CONCIERGE_DISPLAY_NAME;
    }

    if (formattedName) {
        return formatReportLastMessageText(isArchivedNonExpense ? generateArchivedReportName(formattedName) : formattedName);
    }

    // Not a room or PolicyExpenseChat, generate title from first 5 other participants
    formattedName = buildReportNameFromParticipantNames({report, personalDetailsList});

    const finalName = formattedName ?? report?.reportName ?? '';

    return isArchivedNonExpense ? generateArchivedReportName(finalName) : finalName;
}

/**
 * Check for existence of report name in derived values first, then fall back to the report object
 *
 * @param report
 * @param reportAttributesDerivedValue
 */
function getReportName(report?: Report, reportAttributesDerivedValue?: ReportAttributesDerivedValue['reports']): string {
    if (!report || !report.reportID) {
        return '';
    }

    return reportAttributesDerivedValue?.[report.reportID]?.reportName ?? report.reportName ?? '';
}

export {computeReportName, getReportName};
