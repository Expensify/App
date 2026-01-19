/**
 * This file contains utility functions for managing and computing report names
 */
import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    PersonalDetails,
    PersonalDetailsList,
    Policy,
    Report,
    ReportAction,
    ReportActions,
    ReportAttributesDerivedValue,
    ReportMetadata,
    ReportNameValuePairs,
    Transaction,
} from '@src/types/onyx';
import type {SelectedParticipant} from '@src/types/onyx/NewGroupChatDraft';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {convertToDisplayString} from './CurrencyUtils';
import {formatPhoneNumber as formatPhoneNumberPhoneUtils} from './LocalePhoneNumber';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from './Localize';
// eslint-disable-next-line import/no-cycle
import {getForReportAction, getMovedReportID} from './ModifiedExpenseMessage';
import Parser from './Parser';
import {getDisplayNameOrDefault} from './PersonalDetailsUtils';
import {getCleanedTagName, getPolicy, isPolicyAdmin} from './PolicyUtils';
import {
    getActionableCardFraudAlertResolutionMessage,
    getCardIssuedMessage,
    getChangedApproverActionMessage,
    getCompanyCardConnectionBrokenMessage,
    getIntegrationSyncFailedMessage,
    getJoinRequestMessage,
    getMarkedReimbursedMessage,
    getMessageOfOldDotReportAction,
    getOriginalMessage,
    getPolicyChangeLogDefaultBillableMessage,
    getPolicyChangeLogDefaultReimbursableMessage,
    getPolicyChangeLogDefaultTitleEnforcedMessage,
    getPolicyChangeLogDefaultTitleMessage,
    getPolicyChangeLogMaxExpenseAgeMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getPolicyChangeLogMaxExpenseAmountNoReceiptMessage,
    getRenamedAction,
    getReportActionMessage as getReportActionMessageFromActionsUtils,
    getReportActionText,
    getTravelUpdateMessage,
    getWorkspaceCurrencyUpdateMessage,
    getWorkspaceCustomUnitRateAddedMessage,
    getWorkspaceCustomUnitRateDeletedMessage,
    getWorkspaceCustomUnitRateUpdatedMessage,
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
// eslint-disable-next-line import/no-cycle
import {
    formatReportLastMessageText,
    getDisplayNameForParticipant,
    getDowngradeWorkspaceMessage,
    getMoneyRequestSpendBreakdown,
    getMovedActionMessage,
    getParentReport,
    getPolicyChangeMessage,
    getPolicyName,
    getRejectedReportMessage,
    getReportMetadata,
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

let allPersonalDetails: OnyxEntry<PersonalDetailsList>;

Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        allPersonalDetails = value;
    },
});

function generateArchivedReportName(reportName: string): string {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return `${reportName} (${translateLocal('common.archived')}) `;
}

/**
 * Generates a report title using the names of participants, excluding the current user.
 * This function is useful in contexts such as 1:1 direct messages (DMs) or other group chats.
 * It limits to a maximum of 5 participants for the title and uses short names unless there is only one participant.
 */
const buildReportNameFromParticipantNames = ({
    report,
    personalDetailsList: personalDetailsData,
    currentUserAccountID,
}: {
    report: OnyxEntry<Report>;
    personalDetailsList?: Partial<PersonalDetailsList>;
    currentUserAccountID?: number;
}) =>
    Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((id) => id !== currentUserAccountID)
        .slice(0, 5)
        .map((accountID) => ({
            accountID,
            name: getDisplayNameForParticipant({
                accountID,
                shouldUseShortForm: true,
                personalDetailsData,
                formatPhoneNumber: formatPhoneNumberPhoneUtils,
            }),
        }))
        .filter((participant) => participant.name)
        .reduce((formattedNames, {name, accountID}, _, array) => {
            // If there is only one participant (if it is 0 or less the function will return empty string), return their full name
            if (array.length < 2) {
                return getDisplayNameForParticipant({
                    accountID,
                    personalDetailsData,
                    formatPhoneNumber: formatPhoneNumberPhoneUtils,
                });
            }
            return formattedNames ? `${formattedNames}, ${name}` : name;
        }, '');

/**
 * @private
 * This is a custom collator only for getGroupChatName function.
 * The reason for this is that the computation of default group name should not depend on the locale.
 * This is used to ensure that group name stays consistent across locales.
 */
const customCollator = new Intl.Collator('en', {usage: 'sort', sensitivity: 'variant', numeric: true, caseFirst: 'upper'});

/**
 * Returns the report name if the report is a group chat
 */
function getGroupChatName(
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    participants?: SelectedParticipant[],
    shouldApplyLimit = false,
    report?: OnyxEntry<Report>,
    reportMetadataParam?: OnyxEntry<ReportMetadata>,
): string | undefined {
    // If we have a report always try to get the name from the report.
    if (report?.reportName) {
        return report.reportName;
    }

    const reportMetadata = reportMetadataParam ?? getReportMetadata(report?.reportID);

    const pendingMemberAccountIDs = new Set(
        reportMetadata?.pendingChatMembers?.filter((member) => member.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).map((member) => member.accountID),
    );
    let participantAccountIDs =
        participants?.map((participant) => participant.accountID) ??
        Object.keys(report?.participants ?? {})
            .map(Number)
            .filter((accountID) => !pendingMemberAccountIDs.has(accountID.toString()));
    const shouldAddEllipsis = participantAccountIDs.length > CONST.DISPLAY_PARTICIPANTS_LIMIT && shouldApplyLimit;
    if (shouldApplyLimit) {
        participantAccountIDs = participantAccountIDs.slice(0, CONST.DISPLAY_PARTICIPANTS_LIMIT);
    }
    const isMultipleParticipantReport = participantAccountIDs.length > 1;

    if (isMultipleParticipantReport) {
        return participantAccountIDs
            .map(
                (participantAccountID, index) =>
                    getDisplayNameForParticipant({accountID: participantAccountID, shouldUseShortForm: isMultipleParticipantReport, formatPhoneNumber}) ||
                    formatPhoneNumber(participants?.[index]?.login ?? ''),
            )
            .sort((first, second) => customCollator.compare(first ?? '', second ?? ''))
            .filter(Boolean)
            .join(', ')
            .slice(0, CONST.REPORT_NAME_LIMIT)
            .concat(shouldAddEllipsis ? '...' : '');
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('groupChat.defaultReportName', {displayName: getDisplayNameForParticipant({accountID: participantAccountIDs.at(0), formatPhoneNumber})});
}

/**
 * Get the title for a policy expense chat
 */
function getPolicyExpenseChatName({report, personalDetailsList}: {report: OnyxEntry<Report>; personalDetailsList?: Partial<PersonalDetailsList>}): string | undefined {
    const ownerAccountID = report?.ownerAccountID;
    const personalDetails = ownerAccountID ? personalDetailsList?.[ownerAccountID] : undefined;
    const login = personalDetails ? personalDetails.login : null;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const reportOwnerDisplayName = getDisplayNameForParticipant({accountID: ownerAccountID, shouldRemoveDomain: true, formatPhoneNumber: formatPhoneNumberPhoneUtils}) || login;

    if (reportOwnerDisplayName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspace.common.policyExpenseChatName', {displayName: reportOwnerDisplayName});
    }

    return report?.reportName;
}

/**
 * Get the title for an invoice room.
 */
function getInvoicesChatName({
    report,
    receiverPolicy,
    personalDetails,
    policies,
    currentUserAccountID,
}: {
    report: OnyxEntry<Report>;
    receiverPolicy: OnyxEntry<Policy>;
    personalDetails?: Partial<PersonalDetailsList>;
    policies?: Policy[];
    currentUserAccountID?: number;
}): string {
    const invoiceReceiver = report?.invoiceReceiver;
    const isIndividual = invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;
    const invoiceReceiverAccountID = isIndividual ? invoiceReceiver.accountID : CONST.DEFAULT_NUMBER_ID;
    const invoiceReceiverPolicyID = isIndividual ? undefined : invoiceReceiver?.policyID;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const receiverPolicyResolved = receiverPolicy ?? getPolicy(invoiceReceiverPolicyID);
    const isCurrentUserReceiver = (isIndividual && invoiceReceiverAccountID === currentUserAccountID) || (!isIndividual && isPolicyAdmin(receiverPolicyResolved));

    if (isCurrentUserReceiver) {
        return getPolicyName({report, policies});
    }

    if (isIndividual) {
        return formatPhoneNumberPhoneUtils(getDisplayNameOrDefault((personalDetails ?? allPersonalDetails)?.[invoiceReceiverAccountID]));
    }

    return getPolicyName({report, policy: receiverPolicyResolved, policies});
}

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
function getInvoicePayerName(report: OnyxEntry<Report>, invoiceReceiverPolicy?: OnyxEntry<Policy>, invoiceReceiverPersonalDetail?: PersonalDetails | null): string {
    const invoiceReceiver = report?.invoiceReceiver;
    const isIndividual = invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;

    if (isIndividual) {
        const personalDetail = invoiceReceiverPersonalDetail ?? allPersonalDetails?.[invoiceReceiver.accountID];
        return formatPhoneNumberPhoneUtils(getDisplayNameOrDefault(personalDetail ?? undefined));
    }

    return getPolicyName({report, policy: invoiceReceiverPolicy});
}

/**
 * Get the title for an IOU or expense chat which will be showing the payer and the amount
 */
function getMoneyRequestReportName({report, policy, invoiceReceiverPolicy}: {report: OnyxEntry<Report>; policy?: OnyxEntry<Policy>; invoiceReceiverPolicy?: OnyxEntry<Policy>}): string {
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
        payerOrApproverName = getDisplayNameForParticipant({accountID: report?.managerID, formatPhoneNumber: formatPhoneNumberPhoneUtils}) ?? '';
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const payerPaidAmountMessage = translateLocal('iou.payerPaidAmount', formattedAmount, payerOrApproverName);

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
        payerOrApproverName = getDisplayNameForParticipant({accountID: report?.ownerAccountID, formatPhoneNumber: formatPhoneNumberPhoneUtils}) ?? '';
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.payerSpentAmount', formattedAmount, payerOrApproverName);
    }

    if (isProcessingReport(report) || isOpenExpenseReport(report) || isOpenInvoiceReport(report) || moneyRequestTotal === 0) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.payerOwesAmount', formattedAmount, payerOrApproverName);
    }

    return payerPaidAmountMessage;
}

function computeReportNameBasedOnReportAction(
    translate: LocalizedTranslate,
    parentReportAction?: ReportAction,
    report?: Report,
    reportPolicy?: Policy,
    parentReport?: Report,
): string | undefined {
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
            return translate('iou.automaticallySubmitted');
        }
        return translate('iou.submitted', {memo: getOriginalMessage(parentReportAction)?.message});
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.FORWARDED)) {
        const {automaticAction} = getOriginalMessage(parentReportAction) ?? {};
        if (automaticAction) {
            return translate('iou.automaticallyForwarded');
        }
        return translate('iou.forwarded');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED) {
        return getRejectedReportMessage();
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RETRACTED) {
        return translate('iou.retracted');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REOPENED) {
        return translate('iou.reopened');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
        return getUpgradeWorkspaceMessage();
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
        return getDowngradeWorkspaceMessage();
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY) {
        return getWorkspaceCurrencyUpdateMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD) {
        return getWorkspaceUpdateFieldMessage(translate, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION) {
        return translate('systemMessage.mergedWithCashTransaction');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME) {
        return Str.htmlDecode(getWorkspaceNameUpdatedMessage(parentReportAction));
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY) {
        return getWorkspaceFrequencyUpdateMessage(translate, parentReportAction);
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
        return getUnreportedTransactionMessage(parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT)) {
        return getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE)) {
        return getPolicyChangeLogDefaultBillableMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE)) {
        return getPolicyChangeLogDefaultReimbursableMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getPolicyChangeLogMaxExpenseAmountMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getPolicyChangeLogMaxExpenseAgeMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED)) {
        return getPolicyChangeLogDefaultTitleEnforcedMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE)) {
        return getPolicyChangeLogDefaultTitleMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT) && getOriginalMessage(parentReportAction)?.resolution) {
        return getActionableCardFraudAlertResolutionMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED)) {
        return getMarkedReimbursedMessage(parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY)) {
        return getPolicyChangeMessage(parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) || isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.REROUTE)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getChangedApproverActionMessage(translateLocal, parentReportAction);
    }

    if (parentReportAction?.actionName && isTagModificationAction(parentReportAction?.actionName)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getCleanedTagName(getWorkspaceTagUpdateMessage(translateLocal, parentReportAction) ?? '');
    }

    if (isMovedAction(parentReportAction)) {
        return getMovedActionMessage(parentReportAction, parentReport);
    }

    if (isMoneyRequestAction(parentReportAction)) {
        const originalMessage = getOriginalMessage(parentReportAction);
        const last4Digits = reportPolicy?.achAccount?.accountNumber?.slice(-4) ?? '';

        if (originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY) {
            if (originalMessage.paymentType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                return translate('iou.paidElsewhere');
            }
            if (originalMessage.paymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
                if (originalMessage.automaticAction) {
                    return translate('iou.automaticallyPaidWithBusinessBankAccount', undefined, last4Digits);
                }
                return translate('iou.businessBankAccount', undefined, last4Digits);
            }
            if (originalMessage.paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                if (originalMessage.automaticAction) {
                    return translate('iou.automaticallyPaidWithExpensify');
                }
                return translate('iou.paidWithExpensify');
            }
        }
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.APPROVED)) {
        const {automaticAction} = getOriginalMessage(parentReportAction) ?? {};
        if (automaticAction) {
            return translate('iou.automaticallyApproved');
        }
        return translate('iou.approvedMessage');
    }

    if (isUnapprovedAction(parentReportAction)) {
        return translate('iou.unapproved');
    }

    if (isActionableJoinRequest(parentReportAction)) {
        return getJoinRequestMessage(translate, parentReportAction);
    }

    if (isTaskReport(report) && isCanceledTaskReport(report, parentReportAction)) {
        return translate('parentReportAction.deletedTask');
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
        return getIntegrationSyncFailedMessage(translate, parentReportAction, report?.policyID);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN)) {
        return getCompanyCardConnectionBrokenMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
        return getTravelUpdateMessage(translate, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE)) {
        return getWorkspaceCustomUnitRateAddedMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE)) {
        return getWorkspaceCustomUnitRateUpdatedMessage(translate, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE)) {
        return getWorkspaceCustomUnitRateDeletedMessage(translate, parentReportAction);
    }

    return undefined;
}

function computeChatThreadReportName(
    translate: LocalizedTranslate,
    report: Report,
    reportNameValuePairs: ReportNameValuePairs,
    reports: OnyxCollection<Report>,
    parentReportAction?: ReportAction,
): string | undefined {
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
        return getMessageOfOldDotReportAction(translate, parentReportAction);
    }

    if (isRenamedAction(parentReportAction)) {
        const parent = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];
        return getRenamedAction(translate, parentReportAction, isExpenseReport(parent));
    }

    if (parentReportActionMessage?.isDeletedParentAction) {
        return translate('parentReportAction.deletedMessage');
    }

    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES) {
        return translate('violations.resolvedDuplicates');
    }

    const isAttachment = isReportActionAttachment(!isEmptyObject(parentReportAction) ? parentReportAction : undefined);
    const reportActionMessage = getReportActionText(parentReportAction).replaceAll(/(\n+|\r\n|\n|\r)/gm, ' ');
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
        return getCardIssuedMessage({reportAction: parentReportAction, translate});
    }
    return reportActionMessage;
}

function computeReportName(
    report?: Report,
    reports?: OnyxCollection<Report>,
    policies?: OnyxCollection<Policy>,
    transactions?: OnyxCollection<Transaction>,
    allReportNameValuePairs?: OnyxCollection<ReportNameValuePairs>,
    personalDetailsList?: PersonalDetailsList,
    reportActions?: OnyxCollection<ReportActions>,
    currentUserAccountID?: number,
): string {
    if (!report || !report.reportID) {
        return '';
    }

    const reportNameValuePairs = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`];
    const reportPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];

    const isArchivedNonExpense = isArchivedNonExpenseReport(report, !!reportNameValuePairs?.private_isArchived);

    const parentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];
    const parentReportAction = isThread(report) ? reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`]?.[report.parentReportActionID] : undefined;

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const parentReportActionBasedName = computeReportNameBasedOnReportAction(translateLocal, parentReportAction, report, reportPolicy, parentReport);

    if (parentReportActionBasedName) {
        return parentReportActionBasedName;
    }

    if (isTaskReport(report)) {
        return Parser.htmlToText(report?.reportName ?? '').trim();
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const chatThreadReportName = computeChatThreadReportName(translateLocal, report, reportNameValuePairs ?? {}, reports ?? {}, parentReportAction);
    if (chatThreadReportName) {
        return chatThreadReportName;
    }

    const transactionsArray = transactions ? (Object.values(transactions).filter(Boolean) as Array<OnyxEntry<Transaction>>) : undefined;
    if (isClosedExpenseReportWithNoExpenses(report, transactionsArray)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('parentReportAction.deletedReport');
    }

    if (isGroupChat(report)) {
        return getGroupChatName(formatPhoneNumberPhoneUtils, undefined, true, report) ?? '';
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
        formattedName = getInvoicesChatName({report, receiverPolicy: invoiceReceiverPolicy, personalDetails: personalDetailsList, currentUserAccountID});
    }

    if (isSelfDM(report)) {
        formattedName = getDisplayNameForParticipant({
            accountID: report?.ownerAccountID,
            shouldAddCurrentUserPostfix: true,
            personalDetailsData: personalDetailsList,
            formatPhoneNumber: formatPhoneNumberPhoneUtils,
        });
    }

    if (isConciergeChatReport(report)) {
        formattedName = CONST.CONCIERGE_DISPLAY_NAME;
    }

    if (formattedName) {
        return formatReportLastMessageText(isArchivedNonExpense ? generateArchivedReportName(formattedName) : formattedName);
    }

    // Not a room or PolicyExpenseChat, generate title from first 5 other participants
    formattedName = buildReportNameFromParticipantNames({report, personalDetailsList, currentUserAccountID});

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

export {
    computeReportName,
    getReportName,
    generateArchivedReportName,
    getInvoiceReportName,
    getMoneyRequestReportName,
    buildReportNameFromParticipantNames,
    getInvoicePayerName,
    getGroupChatName,
    getPolicyExpenseChatName,
    getInvoicesChatName,
};
