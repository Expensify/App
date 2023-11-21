import {format} from 'date-fns';
import lodashGet from 'lodash/get';
import CONST from '@src/CONST';
import {ReportAction} from '@src/types/onyx';
import * as CurrencyUtils from './CurrencyUtils';
import * as Localize from './Localize';
import * as PolicyUtils from './PolicyUtils';
import * as ReportUtils from './ReportUtils';

/**
 * Builds the partial message fragment for a modified field on the expense.
 *
 * @param newValue
 * @param oldValue
 * @param valueName
 * @param valueInQuotes
 * @param shouldConvertToLowercase
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

    if (!oldValue) {
        const fragment = Localize.translateLocal('iou.setTheRequest', {valueName: displayValueName, newValueToDisplay});
        setFragments.push(fragment);
    } else if (!newValue) {
        const fragment = Localize.translateLocal('iou.removedTheRequest', {valueName: displayValueName, oldValueToDisplay});
        removalFragments.push(fragment);
    } else {
        const fragment = Localize.translateLocal('iou.updatedTheRequest', {valueName: displayValueName, newValueToDisplay, oldValueToDisplay});
        changeFragments.push(fragment);
    }
}

/**
 * Get the message line for a modified expense.
 *
 * @param newValue
 * @param oldValue
 * @param valueName
 * @param valueInQuotes
 */

function getMessageLine(prefix: string, messageFragments: string[]) {
    if (messageFragments.length === 0) {
        return '';
    }
    return messageFragments.reduce((acc, value, index) => {
        if (index === messageFragments.length - 1) {
            if (messageFragments.length === 1) {
                return `${acc} ${value}.`;
            }
            if (messageFragments.length === 2) {
                return `${acc} ${Localize.translateLocal('common.and')} ${value}.`;
            }
            return `${acc}, ${Localize.translateLocal('common.and')} ${value}.`;
        }
        if (index === 0) {
            return `${acc} ${value}`;
        }
        return `${acc}, ${value}`;
    }, prefix);
}

/**
 * Get the message for a modified distance request.
 *
 * @param newDistance
 * @param oldDistance
 * @param newAmount
 * @param oldAmount
 * @returns {String}
 */

function getForDistanceRequest(newDistance: string, oldDistance: string, newAmount: string, oldAmount: string) {
    if (!oldDistance) {
        return Localize.translateLocal('iou.setTheDistance', {newDistanceToDisplay: newDistance, newAmountToDisplay: newAmount});
    }
    return Localize.translateLocal('iou.updatedTheDistance', {
        newDistanceToDisplay: newDistance,
        oldDistanceToDisplay: oldDistance,
        newAmountToDisplay: newAmount,
        oldAmountToDisplay: oldAmount,
    });
}

/**
 * Get the report action message when expense has been modified.
 *
 * ModifiedExpense::getNewDotComment in Web-Expensify should match this.
 * If we change this function be sure to update the backend as well.
 *
 * @param reportAction
 */
function getForReportAction(reportAction: ReportAction) {
    if (reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE) {
        return '';
    }
    const reportActionOriginalMessage = reportAction.originalMessage;
    const reportID = lodashGet(reportAction, 'reportID', '');
    const policyID = lodashGet(ReportUtils.getReport(reportID), 'policyID', '');
    const policyTags = PolicyUtils.getPolicyTags(policyID);
    const policyTagListName = PolicyUtils.getTagListName(policyTags) || Localize.translateLocal('common.tag');

    const removalFragments: string[] = [];
    const setFragments: string[] = [];
    const changeFragments: string[] = [];

    const hasModifiedAmount = reportActionOriginalMessage.oldAmount && reportActionOriginalMessage.oldCurrency && reportActionOriginalMessage.amount && reportActionOriginalMessage.currency;

    const hasModifiedMerchant = reportActionOriginalMessage.oldMerchant && reportActionOriginalMessage.merchant;
    if (hasModifiedAmount) {
        const oldCurrency = reportActionOriginalMessage.oldCurrency ?? '';
        const oldAmount = CurrencyUtils.convertToDisplayString(reportActionOriginalMessage.oldAmount ?? 0, oldCurrency);

        const currency = reportActionOriginalMessage.currency ?? '';
        const amount = CurrencyUtils.convertToDisplayString(reportActionOriginalMessage.amount ?? 0, currency);

        // Only Distance edits should modify amount and merchant (which stores distance) in a single transaction.
        // We check the merchant is in distance format (includes @) as a sanity check
        if (hasModifiedMerchant && (reportActionOriginalMessage.merchant ?? '').includes('@')) {
            return getForDistanceRequest(reportActionOriginalMessage.merchant ?? '', reportActionOriginalMessage.oldMerchant ?? '', amount, oldAmount);
        }

        buildMessageFragmentForValue(amount, oldAmount, Localize.translateLocal('iou.amount'), false, setFragments, removalFragments, changeFragments);
    }

    const hasModifiedComment = reportActionOriginalMessage.oldComment && reportActionOriginalMessage.newComment;
    if (hasModifiedComment) {
        buildMessageFragmentForValue(
            reportActionOriginalMessage.newComment ?? '',
            reportActionOriginalMessage.oldComment ?? '',
            Localize.translateLocal('common.description'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }

    const hasModifiedCreated = reportActionOriginalMessage.oldCreated && reportActionOriginalMessage.created;
    if (hasModifiedCreated) {
        // Take only the YYYY-MM-DD value as the original date includes timestamp
        const formattedOldCreated = format(new Date(reportActionOriginalMessage.oldCreated ?? ''), CONST.DATE.FNS_FORMAT_STRING);
        buildMessageFragmentForValue(
            reportActionOriginalMessage.created ?? '',
            formattedOldCreated,
            Localize.translateLocal('common.date'),
            false,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }

    if (hasModifiedMerchant) {
        buildMessageFragmentForValue(
            reportActionOriginalMessage.merchant ?? '',
            reportActionOriginalMessage.oldMerchant ?? '',
            Localize.translateLocal('common.merchant'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }

    const hasModifiedCategory = reportActionOriginalMessage.oldCategory && reportActionOriginalMessage.category;
    if (hasModifiedCategory) {
        buildMessageFragmentForValue(
            reportActionOriginalMessage.category ?? '',
            reportActionOriginalMessage.oldCategory ?? '',
            Localize.translateLocal('common.category'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }

    const hasModifiedTag = reportActionOriginalMessage.oldTag && reportActionOriginalMessage.tag;
    if (hasModifiedTag) {
        buildMessageFragmentForValue(
            reportActionOriginalMessage.tag ?? '',
            reportActionOriginalMessage.oldTag ?? '',
            policyTagListName,
            true,
            setFragments,
            removalFragments,
            changeFragments,
            policyTagListName === Localize.translateLocal('common.tag'),
        );
    }

    const hasModifiedBillable = reportActionOriginalMessage.oldBillable && reportActionOriginalMessage.billable;
    if (hasModifiedBillable) {
        buildMessageFragmentForValue(
            reportActionOriginalMessage.billable ?? '',
            reportActionOriginalMessage.oldBillable ?? '',
            Localize.translateLocal('iou.request'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }

    let message =
        getMessageLine(`\n${Localize.translateLocal('iou.changed')}`, changeFragments) +
        getMessageLine(`\n${Localize.translateLocal('iou.set')}`, setFragments) +
        getMessageLine(`\n${Localize.translateLocal('iou.removed')}`, removalFragments);
    if (message === '') {
        return Localize.translateLocal('iou.changedTheRequest');
    }
    message = `${message.substring(1, message.length)}`;
    return message;
}

export default {
    getForReportAction,
};
