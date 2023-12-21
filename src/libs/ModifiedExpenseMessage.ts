import {format} from 'date-fns';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {PolicyTags, ReportAction} from '@src/types/onyx';
import * as CurrencyUtils from './CurrencyUtils';
import * as Localize from './Localize';
import * as PolicyUtils from './PolicyUtils';
import * as ReportUtils from './ReportUtils';
import {ExpenseOriginalMessage} from './ReportUtils';

let allPolicyTags: Record<string, PolicyTags | null> = {};
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
 */
function getMessageLine(prefix: string, messageFragments: string[]): string {
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

function getForDistanceRequest(newDistance: string, oldDistance: string, newAmount: string, oldAmount: string): string {
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
 */
function getForReportAction(reportAction: ReportAction): string {
    if (reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE) {
        return '';
    }
    const reportActionOriginalMessage = reportAction.originalMessage as ExpenseOriginalMessage | undefined;
    const policyID = ReportUtils.getReportPolicyID(reportAction.reportID) ?? '';
    const policyTags = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {};
    const policyTagListName = PolicyUtils.getTagListName(policyTags) || Localize.translateLocal('common.tag');

    const removalFragments: string[] = [];
    const setFragments: string[] = [];
    const changeFragments: string[] = [];

    const hasModifiedAmount =
        reportActionOriginalMessage &&
        'oldAmount' in reportActionOriginalMessage &&
        'oldCurrency' in reportActionOriginalMessage &&
        'amount' in reportActionOriginalMessage &&
        'currency' in reportActionOriginalMessage;

    const hasModifiedMerchant = reportActionOriginalMessage && 'oldMerchant' in reportActionOriginalMessage && 'merchant' in reportActionOriginalMessage;
    if (hasModifiedAmount) {
        const oldCurrency = reportActionOriginalMessage?.oldCurrency ?? '';
        const oldAmount = CurrencyUtils.convertToDisplayString(reportActionOriginalMessage?.oldAmount ?? 0, oldCurrency);

        const currency = reportActionOriginalMessage?.currency ?? '';
        const amount = CurrencyUtils.convertToDisplayString(reportActionOriginalMessage?.amount ?? 0, currency);

        // Only Distance edits should modify amount and merchant (which stores distance) in a single transaction.
        // We check the merchant is in distance format (includes @) as a sanity check
        if (hasModifiedMerchant && (reportActionOriginalMessage?.merchant ?? '').includes('@')) {
            return getForDistanceRequest(reportActionOriginalMessage?.merchant ?? '', reportActionOriginalMessage?.oldMerchant ?? '', amount, oldAmount);
        }

        buildMessageFragmentForValue(amount, oldAmount, Localize.translateLocal('iou.amount'), false, setFragments, removalFragments, changeFragments);
    }

    const hasModifiedComment = reportActionOriginalMessage && 'oldComment' in reportActionOriginalMessage && 'newComment' in reportActionOriginalMessage;
    if (hasModifiedComment) {
        buildMessageFragmentForValue(
            reportActionOriginalMessage?.newComment ?? '',
            reportActionOriginalMessage?.oldComment ?? '',
            Localize.translateLocal('common.description'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }

    const hasModifiedCreated = reportActionOriginalMessage && 'oldCreated' in reportActionOriginalMessage && 'created' in reportActionOriginalMessage;
    if (hasModifiedCreated) {
        // Take only the YYYY-MM-DD value as the original date includes timestamp
        let formattedOldCreated: Date | string = new Date(reportActionOriginalMessage?.oldCreated ? reportActionOriginalMessage.oldCreated : 0);
        formattedOldCreated = format(formattedOldCreated, CONST.DATE.FNS_FORMAT_STRING);
        buildMessageFragmentForValue(
            reportActionOriginalMessage?.created ?? '',
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
            reportActionOriginalMessage?.merchant ?? '',
            reportActionOriginalMessage?.oldMerchant ?? '',
            Localize.translateLocal('common.merchant'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }

    const hasModifiedCategory = reportActionOriginalMessage && 'oldCategory' in reportActionOriginalMessage && 'category' in reportActionOriginalMessage;
    if (hasModifiedCategory) {
        buildMessageFragmentForValue(
            reportActionOriginalMessage?.category ?? '',
            reportActionOriginalMessage?.oldCategory ?? '',
            Localize.translateLocal('common.category'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }

    const hasModifiedTag = reportActionOriginalMessage && 'oldTag' in reportActionOriginalMessage && 'tag' in reportActionOriginalMessage;
    if (hasModifiedTag) {
        buildMessageFragmentForValue(
            reportActionOriginalMessage?.tag ?? '',
            reportActionOriginalMessage?.oldTag ?? '',
            policyTagListName,
            true,
            setFragments,
            removalFragments,
            changeFragments,
            policyTagListName === Localize.translateLocal('common.tag'),
        );
    }

    const hasModifiedBillable = reportActionOriginalMessage && 'oldBillable' in reportActionOriginalMessage && 'billable' in reportActionOriginalMessage;
    if (hasModifiedBillable) {
        buildMessageFragmentForValue(
            reportActionOriginalMessage?.billable ?? '',
            reportActionOriginalMessage?.oldBillable ?? '',
            Localize.translateLocal('iou.request'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }

    const message =
        getMessageLine(`\n${Localize.translateLocal('iou.changed')}`, changeFragments) +
        getMessageLine(`\n${Localize.translateLocal('iou.set')}`, setFragments) +
        getMessageLine(`\n${Localize.translateLocal('iou.removed')}`, removalFragments);
    if (message === '') {
        return Localize.translateLocal('iou.changedTheRequest');
    }
    return `${message.substring(1, message.length)}`;
}

export default {
    getForReportAction,
};
