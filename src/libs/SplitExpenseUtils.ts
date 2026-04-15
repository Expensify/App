import CONST from '@src/CONST';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import type {SplitExpense} from '@src/types/onyx/IOU';
import {convertToDisplayString} from './CurrencyUtils';

type TranslateFunction = <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>) => string;

type SplitWarningParams = {
    splitExpenses: SplitExpense[];
    transactionDetailsAmount: number;
    currency: string;
    translate: TranslateFunction;
};

type SplitSaveErrorParams = {
    splitExpenses: SplitExpense[];
    transactionDetailsAmount: number;
    currency: string;
    isDistance: boolean;
    isPerDiem: boolean;
    isCard: boolean;
    translate: TranslateFunction;
};

/**
 * Determines whether any split has the same sign as the total and exceeds it in magnitude.
 */
function findInvalidSplit(splitExpenses: SplitExpense[], transactionDetailsAmount: number): SplitExpense | undefined {
    return splitExpenses.find((split) => {
        const sameSign = (split.amount >= 0 && transactionDetailsAmount >= 0) || (split.amount < 0 && transactionDetailsAmount < 0);
        return sameSign && Math.abs(split.amount) > Math.abs(transactionDetailsAmount);
    });
}

/**
 * Computes the inline warning message shown while editing splits (before saving).
 * Returns an empty string when there is nothing to warn about.
 */
function computeSplitWarningMessage({splitExpenses, transactionDetailsAmount, currency, translate}: SplitWarningParams): string {
    const sumOfSplitExpenses = splitExpenses.reduce((acc, item) => acc + (item.amount ?? 0), 0);
    const invalidSplit = findInvalidSplit(splitExpenses, transactionDetailsAmount);
    const difference = sumOfSplitExpenses - transactionDetailsAmount;
    const hasMixedSignSplits = splitExpenses.some((split) => (split.amount ?? 0) < 0 !== transactionDetailsAmount < 0);

    if (invalidSplit && sumOfSplitExpenses !== transactionDetailsAmount) {
        if (hasMixedSignSplits ? difference > 0 : sumOfSplitExpenses > transactionDetailsAmount) {
            return translate('iou.totalAmountGreaterThanOriginal', convertToDisplayString(Math.abs(difference), currency));
        }
        return translate('iou.totalAmountLessThanOriginal', convertToDisplayString(Math.abs(difference), currency));
    }

    if (hasMixedSignSplits ? difference < 0 : sumOfSplitExpenses < transactionDetailsAmount) {
        return translate('iou.totalAmountLessThanOriginal', convertToDisplayString(Math.abs(difference), currency));
    }

    if (hasMixedSignSplits ? difference > 0 : sumOfSplitExpenses > transactionDetailsAmount) {
        return translate('iou.totalAmountGreaterThanOriginal', convertToDisplayString(Math.abs(difference), currency));
    }

    return '';
}

/**
 * Computes the error message shown when the user taps Save, based on the amounts.
 * This covers: splits limit exceeded, per-split/total amount mismatches, and zero-amount splits.
 *
 * Note: navigation-short-circuit cases (one-split identical to original, deep equality with
 * child transactions) are intentionally excluded — those produce no message and are handled
 * by the caller via Navigation.dismissToPreviousRHP().
 *
 * Returns an empty string when there is no amount-based error.
 */
function computeSplitSaveErrorMessage({splitExpenses, transactionDetailsAmount, currency, isDistance, isPerDiem, isCard, translate}: SplitSaveErrorParams): string {
    if (splitExpenses.length > CONST.IOU.SPLITS_LIMIT) {
        return translate('iou.error.manySplitsProvided');
    }

    const sumOfSplitExpenses = splitExpenses.reduce((acc, item) => acc + (item.amount ?? 0), 0);
    const invalidSplit = findInvalidSplit(splitExpenses, transactionDetailsAmount);
    const difference = sumOfSplitExpenses - transactionDetailsAmount;
    const hasMixedSignSplits = splitExpenses.some((split) => (split.amount ?? 0) < 0 !== transactionDetailsAmount < 0);

    if (invalidSplit && sumOfSplitExpenses !== transactionDetailsAmount && !isDistance) {
        if (hasMixedSignSplits ? difference > 0 : sumOfSplitExpenses > transactionDetailsAmount) {
            return translate('iou.totalAmountGreaterThanOriginal', convertToDisplayString(Math.abs(difference), currency));
        }
        return translate('iou.totalAmountLessThanOriginal', convertToDisplayString(Math.abs(difference), currency));
    }

    const sumExceedsTotal = hasMixedSignSplits ? sumOfSplitExpenses > transactionDetailsAmount : Math.abs(sumOfSplitExpenses) > Math.abs(transactionDetailsAmount);
    const sumBelowTotal = hasMixedSignSplits ? sumOfSplitExpenses < transactionDetailsAmount : Math.abs(sumOfSplitExpenses) < Math.abs(transactionDetailsAmount);

    if (sumExceedsTotal && !isDistance) {
        // For mixed-sign splits the arithmetic comparison (sum > total) is already the correct
        // semantic direction, so always use 'Greater'. The sign-based inversion only applies
        // when all splits share the same sign as a negative total.
        const errorKey = !hasMixedSignSplits && transactionDetailsAmount < 0 ? 'iou.totalAmountLessThanOriginal' : 'iou.totalAmountGreaterThanOriginal';
        const greaterThanDifference = sumOfSplitExpenses - transactionDetailsAmount;
        return translate(errorKey, convertToDisplayString(Math.abs(greaterThanDifference), currency));
    }

    if (sumBelowTotal && (isPerDiem || isCard) && !isDistance) {
        const lessThanDifference = transactionDetailsAmount - sumOfSplitExpenses;
        const errorKey = !hasMixedSignSplits && transactionDetailsAmount < 0 ? 'iou.totalAmountGreaterThanOriginal' : 'iou.totalAmountLessThanOriginal';
        return translate(errorKey, convertToDisplayString(Math.abs(lessThanDifference), currency));
    }

    if (splitExpenses.find((item) => item.amount === 0)) {
        return translate('iou.splitExpenseZeroAmount');
    }

    return '';
}

export {computeSplitWarningMessage, computeSplitSaveErrorMessage};
export type {SplitWarningParams, SplitSaveErrorParams};
