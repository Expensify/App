import isEmpty from 'lodash/isEmpty';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists, Report, ReportAction} from '@src/types/onyx';
import {convertToDisplayString} from './CurrencyUtils';
import DateUtils from './DateUtils';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from './Localize';
import Log from './Log';
import Parser from './Parser';
import {getCleanedTagName, getSortedTagKeys} from './PolicyUtils';
import {getOriginalMessage, isModifiedExpenseAction} from './ReportActionsUtils';
// eslint-disable-next-line import/no-cycle
import {buildReportNameFromParticipantNames, getPolicyExpenseChatName, getPolicyName, getReportName, getRootParentReport, isPolicyExpenseChat, isSelfDM} from './ReportUtils';
import {getFormattedAttendees, getTagArrayFromName} from './TransactionUtils';

let allPolicyTags: OnyxCollection<PolicyTagLists> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_TAGS,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            allPolicyTags = {};
            return;
        }
        allPolicyTags = value;
    },
});

/**
 * Builds the partial message fragment for a modified field on the expense.
 */
function buildMessageFragmentForValue(
    newValue: string,
    oldValue: string,
    valueName: string,
    valueInQuotes: boolean,
    setFragments: string[],
    removalFragments: string[],
    changeFragments: string[],
    shouldConvertToLowercase = true,
) {
    const newValueToDisplay = valueInQuotes ? `"${newValue}"` : newValue;
    const oldValueToDisplay = valueInQuotes ? `"${oldValue}"` : oldValue;
    const displayValueName = shouldConvertToLowercase ? valueName.toLowerCase() : valueName;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const isOldValuePartialMerchant = valueName === translateLocal('common.merchant') && oldValue === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;

    // In case of a partial merchant value, we want to avoid user seeing the "(none)" value in the message.
    if (!oldValue || isOldValuePartialMerchant) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const fragment = translateLocal('iou.setTheRequest', {valueName: displayValueName, newValueToDisplay});
        setFragments.push(fragment);
    } else if (!newValue || newValue === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const fragment = translateLocal('iou.removedTheRequest', {valueName: displayValueName, oldValueToDisplay});
        removalFragments.push(fragment);
    } else {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const fragment = translateLocal('iou.updatedTheRequest', {valueName: displayValueName, newValueToDisplay, oldValueToDisplay});
        changeFragments.push(fragment);
    }
}

/**
 * Get the absolute value for a tax amount.
 */
function getTaxAmountAbsValue(taxAmount: number): number {
    // IOU requests cannot have negative values but they can be stored as negative values, let's return absolute value
    return Math.abs(taxAmount ?? 0);
}

/**
 * Get the message line for a modified expense.
 */
function getMessageLine(prefix: string, messageFragments: string[]): string {
    if (messageFragments.length === 0) {
        return '';
    }
    return messageFragments.reduce((acc, value, index) => {
        if (index === messageFragments.length - 1) {
            if (messageFragments.length === 1) {
                return `${acc} ${value}`;
            }
            if (messageFragments.length === 2) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return `${acc} ${translateLocal('common.and')} ${value}`;
            }
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return `${acc}, ${translateLocal('common.and')} ${value}`;
        }
        if (index === 0) {
            return `${acc} ${value}`;
        }
        return `${acc}, ${value}`;
    }, prefix);
}

function getForDistanceRequest(newMerchant: string, oldMerchant: string, newAmount: string, oldAmount: string): string {
    let changedField: 'distance' | 'rate' = 'distance';

    if (CONST.REGEX.DISTANCE_MERCHANT.test(newMerchant) && CONST.REGEX.DISTANCE_MERCHANT.test(oldMerchant)) {
        const oldValues = oldMerchant.split('@');
        const oldDistance = oldValues.at(0)?.trim() ?? '';
        const oldRate = oldValues.at(1)?.trim() ?? '';
        const newValues = newMerchant.split('@');
        const newDistance = newValues.at(0)?.trim() ?? '';
        const newRate = newValues.at(1)?.trim() ?? '';

        if (oldDistance === newDistance && oldRate !== newRate) {
            changedField = 'rate';
        }
    } else {
        Log.hmmm("Distance request merchant doesn't match NewDot format. Defaulting to showing as distance changed.", {newMerchant, oldMerchant});
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const translatedChangedField = translateLocal(`common.${changedField}`).toLowerCase();
    if (!oldMerchant.length) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.setTheDistanceMerchant', {translatedChangedField, newMerchant, newAmountToDisplay: newAmount});
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('iou.updatedTheDistanceMerchant', {
        translatedChangedField,
        newMerchant,
        oldMerchant,
        newAmountToDisplay: newAmount,
        oldAmountToDisplay: oldAmount,
    });
}

function getForExpenseMovedFromSelfDM(destinationReport: OnyxEntry<Report>) {
    const rootParentReport = getRootParentReport({report: destinationReport});
    // In OldDot, expenses could be moved to a self-DM. Return the corresponding message for this case.
    if (isSelfDM(rootParentReport)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.movedToPersonalSpace');
    }
    // In NewDot, the "Move report" flow only supports moving expenses from self-DM to:
    // - A policy expense chat
    // - A 1:1 DM
    const reportName = isPolicyExpenseChat(rootParentReport) ? getPolicyExpenseChatName({report: rootParentReport}) : buildReportNameFromParticipantNames({report: rootParentReport});
    const policyName = getPolicyName({report: rootParentReport, returnEmptyIfNotFound: true});
    // If we can't determine either the report name or policy name, return the default message
    if (isEmpty(policyName) && !reportName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.changedTheExpense');
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('iou.movedFromPersonalSpace', {
        reportName,
        workspaceName: !isEmpty(policyName) ? policyName : undefined,
    });
}

function getMovedReportID(reportAction: OnyxEntry<ReportAction>, type: ValueOf<typeof CONST.REPORT.MOVE_TYPE>): string | undefined {
    if (!isModifiedExpenseAction(reportAction)) {
        return undefined;
    }
    const reportActionOriginalMessage = getOriginalMessage(reportAction);

    return type === CONST.REPORT.MOVE_TYPE.TO ? reportActionOriginalMessage?.movedToReportID : reportActionOriginalMessage?.movedFromReport;
}

function getMovedFromOrToReportMessage(movedFromReport: OnyxEntry<Report> | undefined, movedToReport: OnyxEntry<Report> | undefined): string | undefined {
    if (movedToReport) {
        return getForExpenseMovedFromSelfDM(movedToReport);
    }

    if (movedFromReport) {
        const originReportName = getReportName(movedFromReport);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.movedFromReport', {reportName: originReportName ?? ''});
    }
}

/**
 * Get the report action message when expense has been modified.
 *
 * ModifiedExpense::getNewDotComment in Web-Expensify should match this.
 * If we change this function be sure to update the backend as well.
 */
function getForReportAction({
    reportAction,
    policyID,
    movedFromReport,
    movedToReport,
}: {
    reportAction: OnyxEntry<ReportAction>;
    policyID: string | undefined;
    movedFromReport?: OnyxEntry<Report>;
    movedToReport?: OnyxEntry<Report>;
}): string {
    if (!isModifiedExpenseAction(reportAction)) {
        return '';
    }

    const movedFromOrToReportMessage = getMovedFromOrToReportMessage(movedFromReport, movedToReport);
    if (movedFromOrToReportMessage) {
        return movedFromOrToReportMessage;
    }

    const reportActionOriginalMessage = getOriginalMessage(reportAction);

    const removalFragments: string[] = [];
    const setFragments: string[] = [];
    const changeFragments: string[] = [];

    const isReportActionOriginalMessageAnObject = reportActionOriginalMessage && typeof reportActionOriginalMessage === 'object';
    const hasModifiedAmount =
        isReportActionOriginalMessageAnObject &&
        'oldAmount' in reportActionOriginalMessage &&
        'oldCurrency' in reportActionOriginalMessage &&
        'amount' in reportActionOriginalMessage &&
        'currency' in reportActionOriginalMessage;

    const hasModifiedMerchant = isReportActionOriginalMessageAnObject && 'oldMerchant' in reportActionOriginalMessage && 'merchant' in reportActionOriginalMessage;

    if (hasModifiedAmount) {
        const oldCurrency = reportActionOriginalMessage?.oldCurrency;
        const oldAmountValue = reportActionOriginalMessage?.oldAmount ?? 0;
        const oldAmount = oldAmountValue ? convertToDisplayString(reportActionOriginalMessage?.oldAmount ?? 0, oldCurrency) : '';

        const currency = reportActionOriginalMessage?.currency;
        const amount = convertToDisplayString(reportActionOriginalMessage?.amount ?? 0, currency);

        // Only Distance edits should modify amount and merchant (which stores distance) in a single transaction.
        // We check the merchant is in distance format (includes @) as a sanity check
        if (hasModifiedMerchant && (reportActionOriginalMessage?.merchant ?? '').includes('@')) {
            return getForDistanceRequest(reportActionOriginalMessage?.merchant ?? '', reportActionOriginalMessage?.oldMerchant ?? '', amount, oldAmount);
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        buildMessageFragmentForValue(amount, oldAmount, translateLocal('iou.amount'), false, setFragments, removalFragments, changeFragments);
    }

    const hasModifiedComment = isReportActionOriginalMessageAnObject && 'oldComment' in reportActionOriginalMessage && 'newComment' in reportActionOriginalMessage;
    if (hasModifiedComment) {
        buildMessageFragmentForValue(
            Parser.htmlToMarkdown(reportActionOriginalMessage?.newComment ?? ''),
            Parser.htmlToMarkdown(reportActionOriginalMessage?.oldComment ?? ''),
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translateLocal('common.description'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }

    if (reportActionOriginalMessage?.oldCreated && reportActionOriginalMessage?.created) {
        const formattedOldCreated = DateUtils.formatWithUTCTimeZone(reportActionOriginalMessage.oldCreated, CONST.DATE.FNS_FORMAT_STRING);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        buildMessageFragmentForValue(reportActionOriginalMessage.created, formattedOldCreated, translateLocal('common.date'), false, setFragments, removalFragments, changeFragments);
    }

    if (hasModifiedMerchant) {
        buildMessageFragmentForValue(
            reportActionOriginalMessage?.merchant ?? '',
            reportActionOriginalMessage?.oldMerchant ?? '',
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translateLocal('common.merchant'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }

    const hasModifiedCategory = isReportActionOriginalMessageAnObject && 'oldCategory' in reportActionOriginalMessage && 'category' in reportActionOriginalMessage;
    if (hasModifiedCategory) {
        buildMessageFragmentForValue(
            reportActionOriginalMessage?.category ?? '',
            reportActionOriginalMessage?.oldCategory ?? '',
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translateLocal('common.category'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }

    const hasModifiedTag = isReportActionOriginalMessageAnObject && 'oldTag' in reportActionOriginalMessage && 'tag' in reportActionOriginalMessage;
    if (hasModifiedTag) {
        const policyTags = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {};
        const transactionTag = reportActionOriginalMessage?.tag ?? '';
        const oldTransactionTag = reportActionOriginalMessage?.oldTag ?? '';
        const splittedTag = getTagArrayFromName(transactionTag);
        const splittedOldTag = getTagArrayFromName(oldTransactionTag);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const localizedTagListName = translateLocal('common.tag');
        const sortedTagKeys = getSortedTagKeys(policyTags);

        sortedTagKeys.forEach((policyTagKey, index) => {
            const policyTagListName = policyTags[policyTagKey].name || localizedTagListName;

            const newTag = splittedTag.at(index) ?? '';
            const oldTag = splittedOldTag.at(index) ?? '';

            if (newTag !== oldTag) {
                buildMessageFragmentForValue(
                    getCleanedTagName(newTag),
                    getCleanedTagName(oldTag),
                    policyTagListName,
                    true,
                    setFragments,
                    removalFragments,
                    changeFragments,
                    policyTagListName === localizedTagListName,
                );
            }
        });
    }

    const hasModifiedTaxAmount = isReportActionOriginalMessageAnObject && 'oldTaxAmount' in reportActionOriginalMessage && 'taxAmount' in reportActionOriginalMessage;
    if (hasModifiedTaxAmount) {
        const currency = reportActionOriginalMessage?.currency;

        const taxAmount = convertToDisplayString(getTaxAmountAbsValue(reportActionOriginalMessage?.taxAmount ?? 0), currency);
        const oldTaxAmountValue = getTaxAmountAbsValue(reportActionOriginalMessage?.oldTaxAmount ?? 0);
        const oldTaxAmount = oldTaxAmountValue > 0 ? convertToDisplayString(oldTaxAmountValue, currency) : '';
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        buildMessageFragmentForValue(taxAmount, oldTaxAmount, translateLocal('iou.taxAmount'), false, setFragments, removalFragments, changeFragments);
    }

    const hasModifiedTaxRate = isReportActionOriginalMessageAnObject && 'oldTaxRate' in reportActionOriginalMessage && 'taxRate' in reportActionOriginalMessage;
    if (hasModifiedTaxRate) {
        buildMessageFragmentForValue(
            reportActionOriginalMessage?.taxRate ?? '',
            reportActionOriginalMessage?.oldTaxRate ?? '',
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translateLocal('iou.taxRate'),
            false,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }

    const hasModifiedBillable = isReportActionOriginalMessageAnObject && 'oldBillable' in reportActionOriginalMessage && 'billable' in reportActionOriginalMessage;
    if (hasModifiedBillable) {
        buildMessageFragmentForValue(
            reportActionOriginalMessage?.billable ?? '',
            reportActionOriginalMessage?.oldBillable ?? '',
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translateLocal('iou.expense'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }

    const hasModifiedReimbursable = isReportActionOriginalMessageAnObject && 'oldReimbursable' in reportActionOriginalMessage && 'reimbursable' in reportActionOriginalMessage;
    if (hasModifiedReimbursable) {
        buildMessageFragmentForValue(
            reportActionOriginalMessage?.reimbursable ?? '',
            reportActionOriginalMessage?.oldReimbursable ?? '',
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translateLocal('iou.expense'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }

    const hasModifiedAttendees = isReportActionOriginalMessageAnObject && 'oldAttendees' in reportActionOriginalMessage && 'newAttendees' in reportActionOriginalMessage;
    if (hasModifiedAttendees) {
        const [oldAttendees, attendees] = getFormattedAttendees(reportActionOriginalMessage.newAttendees, reportActionOriginalMessage.oldAttendees);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        buildMessageFragmentForValue(oldAttendees, attendees, translateLocal('iou.attendees'), false, setFragments, removalFragments, changeFragments);
    }

    const message =
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        getMessageLine(`\n${translateLocal('iou.changed')}`, changeFragments) +
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        getMessageLine(`\n${translateLocal('iou.set')}`, setFragments) +
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        getMessageLine(`\n${translateLocal('iou.removed')}`, removalFragments);
    if (message === '') {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.changedTheExpense');
    }
    return `${message.substring(1, message.length)}`;
}

export {getForReportAction, getMovedReportID, getMovedFromOrToReportMessage};
