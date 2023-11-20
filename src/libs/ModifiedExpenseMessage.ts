import {format} from 'date-fns';
import lodashGet from 'lodash/get';
import * as Localize from './Localize';
import * as PolicyUtils from './PolicyUtils';
import CONST from '@src/CONST';
import * as ReportUtils from './ReportUtils';
import * as CurrencyUtils from './CurrencyUtils';
import _ from 'underscore';


/**
 * Get the proper message schema for a modified field on the expense.
 *
 * @param newValue
 * @param oldValue
 * @param valueName
 * @param valueInQuotes
 * @param shouldConvertToLowercase
 */

function getProperSchemaForModifiedExpenseMessage(newValue: string, oldValue: string, valueName: string, valueInQuotes: boolean, shouldConvertToLowercase = true) {
    const newValueToDisplay = valueInQuotes ? `"${newValue}"` : newValue;
    const oldValueToDisplay = valueInQuotes ? `"${oldValue}"` : oldValue;
    const displayValueName = shouldConvertToLowercase ? valueName.toLowerCase() : valueName;

    if (!oldValue) {
        return Localize.translateLocal('iou.setTheRequest', {valueName: displayValueName, newValueToDisplay});
    }
    if (!newValue) {
        return Localize.translateLocal('iou.removedTheRequest', {valueName: displayValueName, oldValueToDisplay});
    }
    return Localize.translateLocal('iou.updatedTheRequest', {valueName: displayValueName, newValueToDisplay, oldValueToDisplay});
}

/**
 * Get the proper message line for a modified expense.
 *
 * @param {String} newValue
 * @param {String} oldValue
 * @param {String} valueName
 * @param {Boolean} valueInQuotes
 * @returns {String}
 */

function getProperLineForModifiedExpenseMessage(prefix: string, messageFragments: Array<string>) {
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
 * Get the proper message schema for modified distance message.
 *
 * @param {String} newDistance
 * @param {String} oldDistance
 * @param {String} newAmount
 * @param {String} oldAmount
 * @returns {String}
 */

function getProperSchemaForModifiedDistanceMessage(newDistance: string, oldDistance: string, newAmount: string, oldAmount: string) {
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
 * @param {Object} reportAction
 * @returns {String}
 */
function getModifiedExpenseMessage(reportAction: Object): string {
    const reportActionOriginalMessage: any = lodashGet(reportAction, 'originalMessage', {});
    if (_.isEmpty(reportActionOriginalMessage)) {
        return Localize.translateLocal('iou.changedTheRequest');
    }
    const reportID = lodashGet(reportAction, 'reportID', '');
    const policyID = lodashGet(ReportUtils.getReport(reportID), 'policyID', '');
    const policyTags = PolicyUtils.getPolicyTags(policyID);
    const policyTag = PolicyUtils.getTag(policyTags);
    const policyTagListName = lodashGet(policyTag, 'name', Localize.translateLocal('common.tag'));

    const removalFragments = [];
    const setFragments = [];
    const changeFragments = [];

    const hasModifiedAmount =
        _.has(reportActionOriginalMessage, 'oldAmount') &&
        _.has(reportActionOriginalMessage, 'oldCurrency') &&
        _.has(reportActionOriginalMessage, 'amount') &&
        _.has(reportActionOriginalMessage, 'currency');

    const hasModifiedMerchant = _.has(reportActionOriginalMessage, 'oldMerchant') && _.has(reportActionOriginalMessage, 'merchant');
    if (hasModifiedAmount) {
        const oldCurrency = reportActionOriginalMessage.oldCurrency;
        const oldAmount = CurrencyUtils.convertToDisplayString(reportActionOriginalMessage.oldAmount, oldCurrency);

        const currency = reportActionOriginalMessage.currency;
        const amount = CurrencyUtils.convertToDisplayString(reportActionOriginalMessage.amount, currency);

        // Only Distance edits should modify amount and merchant (which stores distance) in a single transaction.
        // We check the merchant is in distance format (includes @) as a sanity check
        if (hasModifiedMerchant && reportActionOriginalMessage.merchant.includes('@')) {
            return getProperSchemaForModifiedDistanceMessage(reportActionOriginalMessage.merchant, reportActionOriginalMessage.oldMerchant, amount, oldAmount);
        }

        const fragment = getProperSchemaForModifiedExpenseMessage(amount, oldAmount, Localize.translateLocal('iou.amount'), false);
        if (!oldAmount) {
            setFragments.push(fragment);
        } else if (!amount) {
            removalFragments.push(fragment);
        } else {
            changeFragments.push(fragment);
        }
    }

    const hasModifiedComment = _.has(reportActionOriginalMessage, 'oldComment') && _.has(reportActionOriginalMessage, 'newComment');
    if (hasModifiedComment) {
        const fragment = getProperSchemaForModifiedExpenseMessage(
            reportActionOriginalMessage.newComment,
            reportActionOriginalMessage.oldComment,
            Localize.translateLocal('common.description'),
            true,
        );
        if (!reportActionOriginalMessage.oldComment) {
            setFragments.push(fragment);
        } else if (!reportActionOriginalMessage.newComment) {
            removalFragments.push(fragment);
        } else {
            changeFragments.push(fragment);
        }
    }

    const hasModifiedCreated = _.has(reportActionOriginalMessage, 'oldCreated') && _.has(reportActionOriginalMessage, 'created');
    if (hasModifiedCreated) {
        // Take only the YYYY-MM-DD value as the original date includes timestamp
        let formattedOldCreated = format(new Date(reportActionOriginalMessage.oldCreated), CONST.DATE.FNS_FORMAT_STRING);
        const fragment = getProperSchemaForModifiedExpenseMessage(reportActionOriginalMessage.created, formattedOldCreated, Localize.translateLocal('common.date'), false);
        if (!formattedOldCreated) {
            setFragments.push(fragment);
        } else if (!reportActionOriginalMessage.created) {
            removalFragments.push(fragment);
        } else {
            changeFragments.push(fragment);
        }
    }

    if (hasModifiedMerchant) {
        const fragment = getProperSchemaForModifiedExpenseMessage(
            reportActionOriginalMessage.merchant,
            reportActionOriginalMessage.oldMerchant,
            Localize.translateLocal('common.merchant'),
            true,
        );
        if (!reportActionOriginalMessage.oldMerchant) {
            setFragments.push(fragment);
        } else if (!reportActionOriginalMessage.merchant) {
            removalFragments.push(fragment);
        } else {
            changeFragments.push(fragment);
        }
    }

    const hasModifiedCategory = _.has(reportActionOriginalMessage, 'oldCategory') && _.has(reportActionOriginalMessage, 'category');
    if (hasModifiedCategory) {
        const fragment = getProperSchemaForModifiedExpenseMessage(
            reportActionOriginalMessage.category,
            reportActionOriginalMessage.oldCategory,
            Localize.translateLocal('common.category'),
            true,
        );
        if (!reportActionOriginalMessage.oldCategory) {
            setFragments.push(fragment);
        } else if (!reportActionOriginalMessage.category) {
            removalFragments.push(fragment);
        } else {
            changeFragments.push(fragment);
        }
    }

    const hasModifiedTag = _.has(reportActionOriginalMessage, 'oldTag') && _.has(reportActionOriginalMessage, 'tag');
    if (hasModifiedTag) {
        const fragment = getProperSchemaForModifiedExpenseMessage(
            reportActionOriginalMessage.tag,
            reportActionOriginalMessage.oldTag,
            policyTagListName,
            true,
            policyTagListName === Localize.translateLocal('common.tag'),
        );
        if (!reportActionOriginalMessage.oldTag) {
            setFragments.push(fragment);
        } else if (!reportActionOriginalMessage.tag) {
            removalFragments.push(fragment);
        } else {
            changeFragments.push(fragment);
        }
    }

    const hasModifiedBillable = _.has(reportActionOriginalMessage, 'oldBillable') && _.has(reportActionOriginalMessage, 'billable');
    if (hasModifiedBillable) {
        const fragment = getProperSchemaForModifiedExpenseMessage(
            reportActionOriginalMessage.billable,
            reportActionOriginalMessage.oldBillable,
            Localize.translateLocal('iou.request'),
            true,
        );
        if (!reportActionOriginalMessage.oldBillable) {
            setFragments.push(fragment);
        } else if (!reportActionOriginalMessage.billable) {
            removalFragments.push(fragment);
        } else {
            changeFragments.push(fragment);
        }
    }

    let message =
        getProperLineForModifiedExpenseMessage(`\n${Localize.translateLocal('iou.changed')}`, changeFragments) +
        getProperLineForModifiedExpenseMessage(`\n${Localize.translateLocal('iou.set')}`, setFragments) +
        getProperLineForModifiedExpenseMessage(`\n${Localize.translateLocal('iou.removed')}`, removalFragments);
    if (message === '') {
        return message;
    }
    message = `${message.substring(1, message.length)}`;
    return message;
}

export default {
    getModifiedExpenseMessage,
};