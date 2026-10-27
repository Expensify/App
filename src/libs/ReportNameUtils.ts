/**
 * This file contains utility functions for managing report names
 */
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import CONST from '@src/CONST';
import type {PersonalDetails, PersonalDetailsList, Policy, Report, Transaction} from '@src/types/onyx';
import type {SelectedParticipant} from '@src/types/onyx/NewGroupChatDraft';

import type {OnyxEntry} from 'react-native-onyx';

import getCollator from './CollatorUtils';
import {temporaryGetDisplayNameOrDefault} from './PersonalDetailsUtils';
import {isPolicyAdmin, isPolicyFieldListEmpty} from './PolicyUtils';
// eslint-disable-next-line import/no-cycle
import {
    getDisplayNameForParticipant,
    getInvoiceReceiverPersonalDetail,
    getMoneyRequestSpendBreakdown,
    getParentReport,
    getPolicyName,
    getReportOrDraftReport,
    isExpenseReport,
    isInvoiceReport,
    isNewDotInvoice,
    isOpenExpenseReport,
    isOpenInvoiceReport,
    isProcessingReport,
    isReportApproved,
    isSettled,
} from './ReportUtils';
import {hasNonReimbursableTransactions} from './TransactionUtils';

/**
 * Generates a report title using the names of participants, excluding the current user.
 * This function is useful in contexts such as 1:1 direct messages (DMs) or other group chats.
 * It limits to a maximum of 5 participants for the title and uses short names unless there is only one participant.
 */
const buildReportNameFromParticipantNames = ({
    report,
    personalDetailsList: personalDetailsData,
    currentUserAccountID,
    translate,
    formatPhoneNumber,
}: {
    report: OnyxEntry<Report>;
    personalDetailsList?: Partial<PersonalDetailsList>;
    currentUserAccountID?: number;
    translate: LocalizedTranslate;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
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
                formatPhoneNumber,
                hiddenTranslation: translate('common.hidden'),
            }),
        }))
        .filter((participant) => participant.name)
        .reduce((formattedNames, {name, accountID}, _, array) => {
            // If there is only one participant (if it is 0 or less the function will return empty string), return their full name
            if (array.length < 2) {
                return getDisplayNameForParticipant({
                    accountID,
                    personalDetailsData,
                    formatPhoneNumber,
                    hiddenTranslation: translate('common.hidden'),
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
const customCollator = getCollator(CONST.LOCALES.EN);

/**
 * Returns the report name if the report is a group chat
 *
 * Callers that pass a `report` must pass `pendingDeleteMemberAccountIDs` too (see pendingDeleteMemberAccountIDsSelector),
 * otherwise members pending removal are still listed. Callers that pass `participants` instead don't need it.
 */
function getGroupChatName(
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    translate: LocalizedTranslate,
    participants?: SelectedParticipant[],
    shouldApplyLimit = false,
    report?: OnyxEntry<Report>,
    pendingDeleteMemberAccountIDs?: string[],
    personalDetailsData?: Partial<PersonalDetailsList>,
): string | undefined {
    // If we have a report always try to get the name from the report.
    if (report?.reportName) {
        return report.reportName;
    }

    const pendingMemberAccountIDs = new Set(pendingDeleteMemberAccountIDs);
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
        // Resolve the translation once, not per participant.
        const hiddenText = translate('common.hidden');
        return participantAccountIDs
            .map(
                (participantAccountID, index) =>
                    getDisplayNameForParticipant({
                        accountID: participantAccountID,
                        shouldUseShortForm: isMultipleParticipantReport,
                        personalDetailsData,
                        formatPhoneNumber,
                        hiddenTranslation: hiddenText,
                    }) || formatPhoneNumber(participants?.[index]?.login ?? ''),
            )
            .sort((first, second) => customCollator.compare(first ?? '', second ?? ''))
            .filter(Boolean)
            .join(', ')
            .slice(0, CONST.REPORT_NAME_LIMIT)
            .concat(shouldAddEllipsis ? '...' : '');
    }
    return translate(
        'groupChat.defaultReportName',
        getDisplayNameForParticipant({accountID: participantAccountIDs.at(0), personalDetailsData, formatPhoneNumber, hiddenTranslation: translate('common.hidden')}),
    );
}

/**
 * Get the title for a policy expense chat
 */
function getPolicyExpenseChatName({
    report,
    personalDetailsList,
    translate,
    formatPhoneNumber,
}: {
    report: OnyxEntry<Report>;
    personalDetailsList?: Partial<PersonalDetailsList>;
    translate: LocalizedTranslate;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
}): string | undefined {
    const ownerAccountID = report?.ownerAccountID;
    const personalDetails = ownerAccountID ? personalDetailsList?.[ownerAccountID] : undefined;
    const login = personalDetails ? personalDetails.login : null;

    const reportOwnerDisplayName =
        getDisplayNameForParticipant({accountID: ownerAccountID, shouldRemoveDomain: true, formatPhoneNumber, hiddenTranslation: translate('common.hidden')}) || login;

    if (reportOwnerDisplayName) {
        return translate('workspace.common.policyExpenseChatName', reportOwnerDisplayName);
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
    policy,
    currentUserAccountID,
    translate,
    formatPhoneNumber,
}: {
    report: OnyxEntry<Report>;
    receiverPolicy: OnyxEntry<Policy>;
    personalDetails: Partial<PersonalDetailsList> | undefined;
    policy: OnyxEntry<Policy>;
    currentUserAccountID?: number;
    translate: LocalizedTranslate;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
}): string {
    const invoiceReceiver = report?.invoiceReceiver;
    const isIndividual = invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;
    const invoiceReceiverAccountID = isIndividual ? invoiceReceiver.accountID : CONST.DEFAULT_NUMBER_ID;
    const isCurrentUserReceiver = (isIndividual && invoiceReceiverAccountID === currentUserAccountID) || (!isIndividual && isPolicyAdmin(receiverPolicy));

    if (isCurrentUserReceiver) {
        return getPolicyName({report, policy, unavailableTranslation: translate('workspace.common.unavailable')});
    }

    if (isIndividual) {
        return temporaryGetDisplayNameOrDefault({
            passedPersonalDetails: personalDetails?.[invoiceReceiverAccountID],
            translate,
            formatPhoneNumber,
        });
    }

    return getPolicyName({report, policy: receiverPolicy, unavailableTranslation: translate('workspace.common.unavailable')});
}

function getInvoiceReportName(
    report: OnyxEntry<Report>,
    linkedTransactions: Transaction[],
    translate: LocalizedTranslate,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'],
    personalDetailsList: OnyxEntry<PersonalDetailsList>,
    policy?: OnyxEntry<Policy>,
    invoiceReceiverPolicy?: OnyxEntry<Policy>,
): string {
    const moneyRequestReportName = getMoneyRequestReportName({
        report,
        policy,
        invoiceReceiverPolicy,
        linkedTransactions,
        personalDetailsList,
        translate,
        formatPhoneNumber,
        convertToDisplayString,
    });
    const oldDotInvoiceName = report?.reportName ?? moneyRequestReportName;
    return isNewDotInvoice(report?.chatReportID) ? moneyRequestReportName : oldDotInvoiceName;
}

/**
 * Get the invoice payer name based on its type:
 * - Individual - a receiver display name.
 * - Policy - a receiver policy name.
 */
function getInvoicePayerName(
    report: OnyxEntry<Report>,
    translate: LocalizedTranslate,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    invoiceReceiverPersonalDetail: OnyxEntry<PersonalDetails> | null,
    invoiceReceiverPolicy?: OnyxEntry<Policy>,
): string {
    const invoiceReceiver = report?.invoiceReceiver;
    const isIndividual = invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;

    if (isIndividual) {
        return temporaryGetDisplayNameOrDefault({passedPersonalDetails: invoiceReceiverPersonalDetail ?? undefined, translate, formatPhoneNumber});
    }

    return getPolicyName({report, policy: invoiceReceiverPolicy, unavailableTranslation: translate('workspace.common.unavailable')});
}

/**
 * Get the title for an IOU or expense chat which will be showing the payer and the amount
 */
function getMoneyRequestReportName({
    report,
    policy,
    invoiceReceiverPolicy,
    linkedTransactions,
    personalDetailsList,
    translate,
    formatPhoneNumber,
    convertToDisplayString,
}: {
    report: OnyxEntry<Report>;
    policy?: OnyxEntry<Policy>;
    invoiceReceiverPolicy?: OnyxEntry<Policy>;
    linkedTransactions: Transaction[];
    personalDetailsList: OnyxEntry<PersonalDetailsList>;
    translate: LocalizedTranslate;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
}): string {
    // For expense reports with empty fieldList and empty reportName, return "New Report" (matches OldDot behavior)
    if (isExpenseReport(report)) {
        if (report?.reportName === '' && isPolicyFieldListEmpty(policy)) {
            return CONST.REPORT.DEFAULT_EXPENSE_REPORT_NAME;
        }
    }

    if (report?.reportName && isExpenseReport(report)) {
        return report.reportName;
    }

    const moneyRequestTotal = getMoneyRequestSpendBreakdown(report).totalDisplaySpend;
    const formattedAmount = convertToDisplayString(moneyRequestTotal, report?.currency);

    let payerOrApproverName;
    if (isExpenseReport(report)) {
        const parentReport = getParentReport(report);
        payerOrApproverName = getPolicyName({report: parentReport ?? report, policy, unavailableTranslation: translate('workspace.common.unavailable')});
    } else if (isInvoiceReport(report)) {
        const chatReport = getReportOrDraftReport(report?.chatReportID);
        const invoiceReceiverPersonalDetail = getInvoiceReceiverPersonalDetail(chatReport, personalDetailsList);
        payerOrApproverName = getInvoicePayerName(chatReport, translate, formatPhoneNumber, invoiceReceiverPersonalDetail, invoiceReceiverPolicy);
    } else {
        payerOrApproverName = getDisplayNameForParticipant({accountID: report?.managerID, formatPhoneNumber, hiddenTranslation: translate('common.hidden')}) ?? '';
    }
    const payerPaidAmountMessage = translate('iou.payerPaidAmount', formattedAmount, payerOrApproverName);

    if (isReportApproved({report})) {
        return translate('iou.managerApprovedAmount', payerOrApproverName, formattedAmount);
    }

    if (report?.isWaitingOnBankAccount) {
        return `${payerPaidAmountMessage} ${CONST.DOT_SEPARATOR} ${translate('iou.pending')}`;
    }

    if (!isSettled(report?.reportID) && hasNonReimbursableTransactions(linkedTransactions)) {
        payerOrApproverName = getDisplayNameForParticipant({accountID: report?.ownerAccountID, formatPhoneNumber, hiddenTranslation: translate('common.hidden')}) ?? '';
        return translate('iou.payerSpentAmount', formattedAmount, payerOrApproverName);
    }

    if (isProcessingReport(report) || isOpenExpenseReport(report) || isOpenInvoiceReport(report) || moneyRequestTotal === 0) {
        return translate('iou.payerOwesAmount', formattedAmount, payerOrApproverName);
    }

    return payerPaidAmountMessage;
}

/**
 * Returns the report name from OnyxDerived `reportAttributes` when available, falling back to the raw report object.
 *
 * **Always prefer passing `derivedReportName`**, sourced from the derived Onyx key (`ONYXKEYS.DERIVED.REPORT_ATTRIBUTES`)
 * i.e. `reportAttributes?.[reportID]?.reportName`. Prefer the O(1) selectors (`useDerivedReportNameByReportID`) over
 * subscribing to the whole attributes Record just to read one name.
 * The fallback to `report.reportName` exists only for edge-cases where the derived value is not yet populated.
 * Do NOT compute any part of the name here. Adjust `computeReportName` (internal, in `src/libs/computeReportName.ts`) if any change to report name are required.
 *
 * @param derivedReportName the cached name for this report from `ONYXKEYS.DERIVED.REPORT_ATTRIBUTES`.
 */
function getReportName(report?: Report, derivedReportName?: string): string {
    if (!report?.reportID) {
        return '';
    }
    return derivedReportName ?? report.reportName ?? '';
}

export {
    getReportName,
    getInvoiceReportName,
    getMoneyRequestReportName,
    buildReportNameFromParticipantNames,
    getInvoicePayerName,
    getGroupChatName,
    getPolicyExpenseChatName,
    getInvoicesChatName,
};
