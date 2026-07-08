import {getCurrencySymbol} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {calculateAmount as calculateIOUAmount} from '@libs/IOUUtils';
import {toLocaleDigit} from '@libs/LocaleDigitUtils';
import {translate} from '@libs/Localize';
import {rand64} from '@libs/NumberUtils';
import {getDistanceRateCustomUnitRate} from '@libs/PolicyUtils';
import {getTransactionDetails, isSelfDM} from '@libs/ReportUtils';
import {buildOptimisticTransaction, getAmount, getCurrency, isDistanceRequest as isDistanceRequestTransactionUtils} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import DistanceRequestUtils from '@src/libs/DistanceRequestUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, SplitExpense} from '@src/types/onyx/IOU';
import type {Unit} from '@src/types/onyx/Policy';
import type {TransactionCustomUnit} from '@src/types/onyx/Transaction';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {eachDayOfInterval, format, parse} from 'date-fns';
import Onyx from 'react-native-onyx';

import {getAllTransactions} from './index';

/**
 * Calculate merchant for distance transactions based on distance and rate
 */
function getDistanceMerchantFromDistance(distanceInUnits: number, unit: Unit | undefined, rate: number | undefined, currency: string): string {
    if (!rate || rate <= 0 || !unit) {
        return '';
    }

    const distanceInMeters = DistanceRequestUtils.convertToDistanceInMeters(distanceInUnits, unit);
    const currencyForMerchant = currency;
    const currentLocale = IntlStore.getCurrentLocale();
    return DistanceRequestUtils.getDistanceMerchant(
        true,
        distanceInMeters,
        unit,
        rate,
        currencyForMerchant,
        (phrase, ...parameters) => translate(currentLocale, phrase, ...parameters),
        (digit) => toLocaleDigit(currentLocale, digit),
        getCurrencySymbol,
        true,
    );
}

/**
 * Update split expense distance and merchant based on amount and rate
 * Calculates distance from amount (distance = amount / rate) and updates customUnit quantity and merchant
 */
function updateSplitExpenseDistanceFromAmount(
    amount: number,
    rate: number,
    unit: Unit | undefined,
    existingCustomUnit: TransactionCustomUnit | undefined,
    mileageRate: {currency?: string},
    transactionCurrency?: string,
): {customUnit: TransactionCustomUnit | undefined; merchant: string} {
    if (!rate || rate <= 0 || !unit || !existingCustomUnit) {
        return {customUnit: existingCustomUnit, merchant: ''};
    }

    // Calculate distance from amount: distance = amount / rate
    // Both amount and rate are in cents, so the result is in distance units
    const distanceInUnits = Math.abs(amount) / rate;
    const quantity = Number(distanceInUnits.toFixed(CONST.DISTANCE_DECIMAL_PLACES));

    const customUnit: TransactionCustomUnit = {
        ...existingCustomUnit,
        quantity,
    };

    const merchant = getDistanceMerchantFromDistance(distanceInUnits, unit, rate, transactionCurrency ?? mileageRate?.currency ?? CONST.CURRENCY.USD);

    return {customUnit, merchant};
}

/**
 * Resolve the effective mileage rate to use across the split flow.
 *
 * For selfDM splits whose original workspace rate was deleted (`enabled: false` or pending DELETE),
 * `DistanceRequestUtils.getRate` still returns the disabled rate (it's kept in policy data),
 * which makes downstream merchant/distance calculations produce stale "X mi @ deletedRate" labels.
 * We substitute the workspace's default mileage rate so every split surface (initial 2-way split,
 * "+ Add split", date split, even split, amount edit, split edit) renders against the same rate.
 *
 * Keep this in sync with the matching branch in `initSplitExpense` — drift here causes the
 * initial splits to be built with one rate and subsequent mutations to use another.
 */
function resolveSplitMileageRate({
    transaction,
    policy,
    isSelfDMSplit,
    personalPolicyOutputCurrency,
}: {
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    policy: OnyxEntry<OnyxTypes.Policy>;
    isSelfDMSplit?: boolean;
    personalPolicyOutputCurrency: string | undefined;
}): ReturnType<typeof DistanceRequestUtils.getRate> {
    const customUnitRateID = transaction?.comment?.customUnit?.customUnitRateID;
    const isP2PRate = customUnitRateID === CONST.CUSTOM_UNITS.FAKE_P2P_ID;
    const rawPolicyRate = isSelfDMSplit && !isP2PRate && customUnitRateID && policy ? getDistanceRateCustomUnitRate(policy, customUnitRateID) : undefined;
    const isOriginalRateDeleted =
        !!isSelfDMSplit &&
        !isP2PRate &&
        !!customUnitRateID &&
        !!policy &&
        (!rawPolicyRate || rawPolicyRate.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || rawPolicyRate.enabled === false);

    const baseMileageRate = DistanceRequestUtils.getRate({transaction, policy: policy ?? undefined, personalPolicyOutputCurrency});
    if (baseMileageRate.rate && !isOriginalRateDeleted) {
        return baseMileageRate;
    }
    // Policy is present but the originally-stored rate was deleted/disabled — pick the policy's
    // current default mileage rate so split surfaces use a real (enabled) rate.
    if (policy) {
        const fallbackMileageRate = DistanceRequestUtils.getDefaultMileageRate(policy);
        if (fallbackMileageRate?.rate) {
            return fallbackMileageRate;
        }
    }
    // No policy resolved (e.g. source workspace deleted and no other paid workspace either) AND the
    // policy-driven lookup above produced nothing useful: reconstruct a rate from the transaction
    // itself (amount / quantity) so distance splits render an accurate "X mi @ rate" merchant
    // string instead of falling back to the original-merchant string.
    if (!baseMileageRate.rate && !isP2PRate) {
        const quantity = transaction?.comment?.customUnit?.quantity;
        const transactionAmount = transaction?.amount;
        if (typeof quantity === 'number' && quantity > 0 && typeof transactionAmount === 'number' && transactionAmount !== 0) {
            const derivedRate = Math.abs(transactionAmount) / quantity;
            return {
                ...baseMileageRate,
                customUnitRateID: baseMileageRate.customUnitRateID ?? customUnitRateID,
                rate: derivedRate,
                currency: baseMileageRate.currency ?? transaction?.currency ?? CONST.CURRENCY.USD,
            };
        }
    }
    return baseMileageRate;
}

function resolveSplitItemReportID({
    childTransaction,
    allReports,
    selfDMContextReportID,
    selfDMReportIDFallback,
}: {
    childTransaction: OnyxEntry<OnyxTypes.Transaction>;
    allReports: OnyxCollection<OnyxTypes.Report> | undefined;
    selfDMContextReportID: string | undefined;
    selfDMReportIDFallback: string | undefined;
}): string | undefined {
    if (selfDMContextReportID) {
        const childReport =
            childTransaction?.reportID && childTransaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID
                ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${childTransaction.reportID}`]
                : undefined;
        if (childReport && !isSelfDM(childReport)) {
            return childTransaction?.reportID;
        }
        return selfDMContextReportID;
    }
    if (childTransaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
        return selfDMReportIDFallback;
    }
    return undefined;
}

function initSplitExpenseItemData(
    transaction: OnyxEntry<OnyxTypes.Transaction>,
    transactionReport: OnyxEntry<OnyxTypes.Report>,
    {
        amount,
        transactionID,
        reportID,
        created,
        merchant,
        customUnit,
        isManuallyEdited,
    }: {amount?: number; transactionID?: string; reportID?: string; created?: string; merchant?: string; customUnit?: TransactionCustomUnit; isManuallyEdited?: boolean} = {},
): SplitExpense {
    const transactionDetails = getTransactionDetails(transaction);

    return {
        transactionID: transactionID ?? transactionDetails?.transactionID ?? String(CONST.DEFAULT_NUMBER_ID),
        amount: amount ?? transactionDetails?.amount ?? 0,
        description: transactionDetails?.comment,
        category: transactionDetails?.category,
        tags: transaction?.tag ? [transaction?.tag] : [],
        created: created ?? transactionDetails?.created ?? DateUtils.formatWithUTCTimeZone(DateUtils.getDBTime(), CONST.DATE.FNS_FORMAT_STRING),
        merchant: merchant ?? transactionDetails?.merchant,
        statusNum: transactionReport?.statusNum ?? 0,
        reportID: reportID ?? transaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID),
        reimbursable: transactionDetails?.reimbursable,
        billable: transactionDetails?.billable,
        taxCode: transactionDetails?.taxCode,
        taxAmount: transactionDetails?.taxAmount,
        taxValue: transactionDetails?.taxValue,
        customUnit: customUnit ?? transaction?.comment?.customUnit ?? undefined,
        waypoints: transaction?.comment?.waypoints ?? undefined,
        odometerStart: transaction?.comment?.odometerStart ?? undefined,
        odometerEnd: transaction?.comment?.odometerEnd ?? undefined,
        isManuallyEdited: isManuallyEdited ?? false,
    };
}

/**
 * Create a draft transaction to set up split expense details for edit split details
 */
function initDraftSplitExpenseDataForEdit(draftTransaction: OnyxEntry<OnyxTypes.Transaction>, splitExpenseTransactionID: string, reportID: string, transactionID?: string) {
    if (!draftTransaction || !splitExpenseTransactionID) {
        return;
    }
    const originalTransactionID = draftTransaction?.comment?.originalTransactionID;
    const originalTransaction = getAllTransactions()?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`];
    const splitTransactionData = draftTransaction?.comment?.splitExpenses?.find((item) => item.transactionID === splitExpenseTransactionID);

    const transactionDetails = getTransactionDetails(originalTransaction);

    const editTransactionID = transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID;

    const editDraftTransaction = buildOptimisticTransaction({
        existingTransactionID: editTransactionID,
        originalTransactionID,
        existingTransaction: originalTransaction,
        transactionParams: {
            amount: Number(splitTransactionData?.amount),
            currency: transactionDetails?.currency ?? CONST.CURRENCY.USD,
            comment: splitTransactionData?.description,
            tag: splitTransactionData?.tags?.at(0),
            merchant: splitTransactionData?.merchant,
            participants: draftTransaction?.participants,
            attendees: transactionDetails?.attendees as Attendee[],
            reportID,
            created: splitTransactionData?.created ?? '',
            category: splitTransactionData?.category ?? '',
            reimbursable: splitTransactionData?.reimbursable,
            billable: splitTransactionData?.billable,
            taxCode: splitTransactionData?.taxCode,
            taxAmount: splitTransactionData?.taxAmount,
            taxValue: splitTransactionData?.taxValue,
            customUnit: splitTransactionData?.customUnit,
            waypoints: splitTransactionData?.waypoints ?? undefined,
            odometerStart: splitTransactionData?.odometerStart ?? undefined,
            odometerEnd: splitTransactionData?.odometerEnd ?? undefined,
            routes: splitTransactionData?.routes ?? undefined,
            commentType: originalTransaction?.comment?.type,
        },
    });

    Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${editTransactionID}`, editDraftTransaction);
}

/**
 * Redistribute split expense amounts among unedited splits.
 * Manually edited splits are preserved, and remaining amount is distributed among unedited splits.
 *
 * @param splitExpenses - Array of split expenses to redistribute
 * @param total - Total amount to distribute
 * @param currency - Currency for amount calculation
 * @returns Array of split expenses with redistributed amounts
 */
function redistributeSplitExpenseAmounts(splitExpenses: SplitExpense[], total: number, currency: string): SplitExpense[] {
    // Calculate sum of manually edited splits
    const editedSum = splitExpenses.filter((split) => split.isManuallyEdited).reduce((sum, split) => sum + split.amount, 0);

    // Find all unedited splits
    const uneditedSplits = splitExpenses.filter((split) => !split.isManuallyEdited);
    const uneditedCount = uneditedSplits.length;

    // If no unedited splits, return as-is
    if (uneditedCount === 0) {
        return splitExpenses;
    }

    // Redistribute remaining amount among unedited splits
    const remaining = total - editedSum;
    const lastUneditedIndex = uneditedCount - 1;
    let uneditedIndex = 0;

    return splitExpenses.map((split) => {
        if (split.isManuallyEdited) {
            return split;
        }
        const isLast = uneditedIndex === lastUneditedIndex;
        const newAmount = calculateIOUAmount(lastUneditedIndex, remaining, currency, isLast, true);
        uneditedIndex += 1;
        return {...split, amount: newAmount};
    });
}

/**
 * Append a new split expense entry to the draft transaction's splitExpenses array
 * and auto-redistribute amounts among all unedited splits.
 */
function addSplitExpenseField(
    transaction: OnyxEntry<OnyxTypes.Transaction>,
    draftTransaction: OnyxEntry<OnyxTypes.Transaction>,
    transactionReport: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    isSelfDMSplit: boolean,
    personalPolicyOutputCurrency: string | undefined,
) {
    if (!transaction || !draftTransaction) {
        return;
    }

    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    let merchant: string | undefined;
    let customUnit: TransactionCustomUnit | undefined;

    // Calculate merchant and customUnit for distance transactions
    if (isDistanceRequest) {
        // For new split expense with amount = 0, distance will also be 0
        // But we still need to set up customUnit structure
        customUnit = transaction?.comment?.customUnit
            ? {
                  ...transaction.comment.customUnit,
                  quantity: 0,
              }
            : undefined;

        const mileageRate = resolveSplitMileageRate({transaction, policy, isSelfDMSplit, personalPolicyOutputCurrency});
        const {unit, rate} = mileageRate;

        if (rate && rate > 0 && customUnit) {
            // For amount = 0, distance = 0, but we still calculate merchant format
            const {merchant: calculatedMerchant} = updateSplitExpenseDistanceFromAmount(0, rate, unit, customUnit, mileageRate, transaction.currency);
            merchant = calculatedMerchant;
        }
    }

    const newSplitExpense = initSplitExpenseItemData(transaction, transactionReport, {
        amount: 0,
        transactionID: rand64(),
        reportID: draftTransaction?.reportID,
        customUnit,
        merchant,
        isManuallyEdited: false,
    });

    const existingSplits = draftTransaction.comment?.splitExpenses ?? [];
    const updatedSplitExpenses = [...existingSplits, newSplitExpense];

    // Get total amount and currency for redistribution
    const total = getAmount(draftTransaction, undefined, undefined, true, true);
    const currency = getCurrency(draftTransaction);
    const originalTransactionID = draftTransaction.comment?.originalTransactionID ?? transaction.transactionID;

    // Check if existing splits already sum to the total
    const existingSum = existingSplits.reduce((sum, split) => sum + split.amount, 0);
    const hasManuallyEditedSplits = existingSplits.some((split) => split.isManuallyEdited);
    const splitsAlreadyMatchTotal = Math.abs(existingSum) === Math.abs(total);

    let redistributedSplitExpenses = updatedSplitExpenses;

    // Skip redistribution only when manual edits exist AND splits sum to total
    const shouldRedistribute = !splitsAlreadyMatchTotal || !hasManuallyEditedSplits;
    if (!isDistanceRequest && shouldRedistribute) {
        redistributedSplitExpenses = redistributeSplitExpenseAmounts(updatedSplitExpenses, total, currency);
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, {
        comment: {
            splitExpenses: redistributedSplitExpenses,
            splitsStartDate: null,
            splitsEndDate: null,
        },
    });
}

/**
 * Evenly distribute the draft split expense amounts across all split items.
 * Remainders are added to the first or last item to ensure the total matches the original amount.
 *
 * Notes:
 * - Works entirely on the provided `draftTransaction` to avoid direct Onyx reads.
 * - Uses `calculateAmount` utility to handle currency subunits and rounding consistently with existing logic.
 */
function evenlyDistributeSplitExpenseAmounts(
    draftTransaction: OnyxEntry<OnyxTypes.Transaction>,
    transaction: OnyxEntry<OnyxTypes.Transaction>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    isSelfDMSplit: boolean,
    personalPolicyOutputCurrency: string | undefined,
) {
    if (!draftTransaction) {
        return;
    }

    const originalTransactionID = draftTransaction?.comment?.originalTransactionID;
    const splitExpenses = draftTransaction?.comment?.splitExpenses ?? [];
    const currency = getCurrency(draftTransaction);

    // Use allowNegative=true and disableOppositeConversion=true to preserve original amount sign
    const total = getAmount(draftTransaction, undefined, undefined, true, true);

    // Guard clause for missing data
    if (!originalTransactionID || splitExpenses.length === 0) {
        return;
    }

    const isDistanceRequest = transaction && isDistanceRequestTransactionUtils(transaction);

    // Floor-allocation with full remainder added to the last split so the last is always the largest
    const splitCount = splitExpenses.length;
    const lastIndex = splitCount - 1;

    const mileageRate = resolveSplitMileageRate({transaction, policy, isSelfDMSplit, personalPolicyOutputCurrency});
    const {unit, rate} = mileageRate;

    const updatedSplitExpenses = splitExpenses.map((splitExpense, index) => {
        const amount = calculateIOUAmount(splitCount - 1, total, currency, index === lastIndex, true);
        let updatedSplitExpense: SplitExpense = {
            ...splitExpense,
            amount,
            // Reset isManuallyEdited since user explicitly requested even distribution
            isManuallyEdited: false,
        };

        // Update distance for distance transactions based on new amount and rate
        if (isDistanceRequest && transaction && splitExpense.customUnit && amount !== 0) {
            if (rate && rate > 0) {
                const {customUnit: updatedCustomUnit, merchant} = updateSplitExpenseDistanceFromAmount(amount, rate, unit, splitExpense.customUnit, mileageRate, transaction.currency);

                updatedSplitExpense = {
                    ...updatedSplitExpense,
                    customUnit: updatedCustomUnit,
                    merchant,
                };
            }
        }

        return updatedSplitExpense;
    });

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, {
        comment: {
            splitExpenses: updatedSplitExpenses,
        },
    });
}

/**
 * Reset all split expenses and create new ones based on the date range.
 * The original amount is distributed proportionally across all dates.
 *
 * @param transaction - The transaction containing split expenses
 * @param draftTransaction - The split draft holding the resolved reportID (self-DM/workspace)
 * @param startDate - Start date in format 'YYYY-MM-DD'
 * @param endDate - End date in format 'YYYY-MM-DD'
 * @param policy - The policy (for distance transactions)
 */
function resetSplitExpensesByDateRange(
    transaction: OnyxEntry<OnyxTypes.Transaction>,
    draftTransaction: OnyxEntry<OnyxTypes.Transaction>,
    transactionReport: OnyxEntry<OnyxTypes.Report>,
    startDate: string,
    endDate: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    isSelfDMSplit: boolean,
    personalPolicyOutputCurrency: string | undefined,
) {
    if (!transaction || !draftTransaction || !startDate || !endDate) {
        return;
    }

    // Generate all dates in the range
    const dates = eachDayOfInterval({
        start: parse(startDate, CONST.DATE.FNS_FORMAT_STRING, new Date()),
        end: parse(endDate, CONST.DATE.FNS_FORMAT_STRING, new Date()),
    });

    const transactionDetails = getTransactionDetails(transaction);
    const total = transactionDetails?.amount ?? 0;
    const currency = transactionDetails?.currency ?? CONST.CURRENCY.USD;

    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);

    const mileageRate = resolveSplitMileageRate({transaction, policy, isSelfDMSplit, personalPolicyOutputCurrency});
    const {unit, rate} = mileageRate;

    // Create split expenses for each date with proportional amounts
    const lastIndex = dates.length - 1;
    const newSplitExpenses: SplitExpense[] = dates.map((date, index) => {
        const amount = calculateIOUAmount(lastIndex, total, currency, index === lastIndex, true);
        let splitExpense = initSplitExpenseItemData(transaction, transactionReport, {
            amount,
            transactionID: rand64(),
            reportID: draftTransaction?.reportID,
            created: format(date, CONST.DATE.FNS_FORMAT_STRING),
        });

        // Update distance for distance transactions based on new amount and rate
        if (isDistanceRequest && splitExpense.customUnit && amount !== 0) {
            if (rate && rate > 0) {
                const {customUnit: updatedCustomUnit, merchant} = updateSplitExpenseDistanceFromAmount(amount, rate, unit, splitExpense.customUnit, mileageRate, transaction.currency);

                splitExpense = {
                    ...splitExpense,
                    customUnit: updatedCustomUnit,
                    merchant,
                };
            }
        }

        return splitExpense;
    });

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transaction.transactionID}`, {
        comment: {
            splitExpenses: newSplitExpenses,
            splitsStartDate: startDate,
            splitsEndDate: endDate,
        },
    });
}

function removeSplitExpenseField(draftTransaction: OnyxEntry<OnyxTypes.Transaction>, splitExpenseTransactionID: string) {
    if (!draftTransaction || !splitExpenseTransactionID) {
        return;
    }

    const originalTransactionID = draftTransaction?.comment?.originalTransactionID;

    const splitExpenses = draftTransaction.comment?.splitExpenses?.filter((item) => item.transactionID !== splitExpenseTransactionID) ?? [];
    const total = getAmount(draftTransaction, undefined, undefined, true, true);
    const currency = getCurrency(draftTransaction);

    const originalTransaction = getAllTransactions()?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`];
    const isDistanceRequest = originalTransaction && isDistanceRequestTransactionUtils(originalTransaction);

    let redistributedSplitExpenses = splitExpenses;

    // Auto-redistribute amounts for all splits if this is not a distance request
    if (!isDistanceRequest) {
        const hasAnyUneditedSplit = splitExpenses.some((item) => !item.isManuallyEdited);
        // If every remaining split is locked, temporarily unlock them so removing one split
        // still redistributes to a valid, saveable total in the split edit flow.
        const splitExpensesToRedistribute = hasAnyUneditedSplit ? splitExpenses : splitExpenses.map((item) => ({...item, isManuallyEdited: false}));
        redistributedSplitExpenses = redistributeSplitExpenseAmounts(splitExpensesToRedistribute, total, currency);
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, {
        comment: {
            splitExpenses: redistributedSplitExpenses,
            splitsStartDate: null,
            splitsEndDate: null,
        },
    });
}

function updateSplitExpenseField(
    splitExpenseDraftTransaction: OnyxEntry<OnyxTypes.Transaction>,
    originalTransactionDraft: OnyxEntry<OnyxTypes.Transaction>,
    splitExpenseTransactionID: string,
    originalTransaction: OnyxEntry<OnyxTypes.Transaction>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    isSelfDMSplit: boolean,
    personalPolicyOutputCurrency: string | undefined,
) {
    if (!splitExpenseDraftTransaction || !splitExpenseTransactionID || !originalTransactionDraft) {
        return;
    }

    const originalTransactionID = splitExpenseDraftTransaction?.comment?.originalTransactionID;
    const isDistanceRequest = originalTransaction && isDistanceRequestTransactionUtils(originalTransaction);
    const transactionDetails = getTransactionDetails(splitExpenseDraftTransaction);
    let shouldResetDateRange = false;

    const splitExpenses = originalTransactionDraft?.comment?.splitExpenses?.map((item) => {
        if (item.transactionID === splitExpenseTransactionID) {
            if (transactionDetails?.created !== item.created) {
                shouldResetDateRange = true;
            }
            let quantity: number | undefined;
            if (splitExpenseDraftTransaction?.routes?.route0?.distance && splitExpenseDraftTransaction?.comment?.customUnit?.distanceUnit) {
                quantity = DistanceRequestUtils.convertDistanceUnit(splitExpenseDraftTransaction?.routes?.route0?.distance, splitExpenseDraftTransaction?.comment?.customUnit?.distanceUnit);
            } else {
                quantity = splitExpenseDraftTransaction?.comment?.customUnit?.quantity ?? 0;
            }

            const updatedItem: SplitExpense = {
                ...item,
                description: transactionDetails?.comment,
                category: transactionDetails?.category,
                tags: splitExpenseDraftTransaction?.tag ? [splitExpenseDraftTransaction?.tag] : [],
                created: transactionDetails?.created ?? DateUtils.formatWithUTCTimeZone(DateUtils.getDBTime(), CONST.DATE.FNS_FORMAT_STRING),
                waypoints: splitExpenseDraftTransaction?.modifiedWaypoints ?? splitExpenseDraftTransaction?.comment?.waypoints ?? undefined,
                customUnit: {
                    ...(splitExpenseDraftTransaction?.comment?.customUnit ?? undefined),
                    quantity,
                },
                odometerStart: splitExpenseDraftTransaction?.comment?.odometerStart ?? undefined,
                odometerEnd: splitExpenseDraftTransaction?.comment?.odometerEnd ?? undefined,
                amount: splitExpenseDraftTransaction?.amount ?? 0,
                reimbursable: transactionDetails?.reimbursable,
                billable: transactionDetails?.billable,
                taxCode: transactionDetails?.taxCode,
                taxAmount: transactionDetails?.taxAmount,
                taxValue: transactionDetails?.taxValue,
                routes: splitExpenseDraftTransaction?.routes ?? undefined,
                merchant: splitExpenseDraftTransaction?.modifiedMerchant ? splitExpenseDraftTransaction.modifiedMerchant : (splitExpenseDraftTransaction?.merchant ?? ''),
            };

            // Recalculate amount for distance transactions when rate or distance changes
            if (isDistanceRequest && originalTransaction) {
                const mileageRate = resolveSplitMileageRate({transaction: splitExpenseDraftTransaction, policy, isSelfDMSplit, personalPolicyOutputCurrency});
                const {unit, rate} = mileageRate;

                if (rate && rate > 0) {
                    // Get distance from routes or customUnit.quantity (same logic as in initSplitExpense)
                    let distanceInUnits: number | undefined;
                    if (splitExpenseDraftTransaction?.routes?.route0?.distance && splitExpenseDraftTransaction?.comment?.customUnit?.distanceUnit) {
                        distanceInUnits = DistanceRequestUtils.convertDistanceUnit(
                            splitExpenseDraftTransaction.routes.route0.distance,
                            splitExpenseDraftTransaction.comment.customUnit.distanceUnit,
                        );
                    } else {
                        distanceInUnits = splitExpenseDraftTransaction?.comment?.customUnit?.quantity ?? 0;
                    }

                    if (distanceInUnits !== undefined) {
                        // Calculate amount from distance and rate: amount = distance * rate
                        // Both amount and rate are in cents, distance is in units
                        const sign = item.amount < 0 ? -1 : 1;
                        const calculatedAmount = distanceInUnits > 0 ? Math.round(distanceInUnits * rate) * sign : 0;
                        updatedItem.amount = calculatedAmount;

                        // Update merchant for distance transactions
                        const currency = originalTransaction.currency ?? mileageRate?.currency ?? CONST.CURRENCY.USD;
                        updatedItem.merchant = getDistanceMerchantFromDistance(distanceInUnits, unit, rate, currency);
                    }
                }
            }

            return updatedItem;
        }
        return item;
    });

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, {
        comment: {
            splitExpenses,
            // Reset date range if the created date was modified
            splitsStartDate: shouldResetDateRange ? null : originalTransactionDraft?.comment?.splitsStartDate,
            splitsEndDate: shouldResetDateRange ? null : originalTransactionDraft?.comment?.splitsEndDate,
        },
    });
}

function updateSplitExpenseAmountField(
    draftTransaction: OnyxEntry<OnyxTypes.Transaction>,
    currentItemTransactionID: string,
    amount: number,
    policy: OnyxEntry<OnyxTypes.Policy>,
    isSelfDMSplit: boolean,
    personalPolicyOutputCurrency: string | undefined,
) {
    if (!draftTransaction?.transactionID || !currentItemTransactionID || Number.isNaN(amount)) {
        return;
    }

    const originalTransactionID = draftTransaction?.comment?.originalTransactionID;
    const originalTransaction = getAllTransactions()?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`];
    const isDistanceRequest = originalTransaction && isDistanceRequestTransactionUtils(originalTransaction);
    const splitExpenses = draftTransaction.comment?.splitExpenses ?? [];
    const total = getAmount(draftTransaction, undefined, undefined, true, true);
    const currency = getCurrency(draftTransaction);

    // Mark the edited split and update its amount
    const splitWithUpdatedAmount = splitExpenses.map((splitExpense) => {
        if (splitExpense.transactionID === currentItemTransactionID) {
            let updatedSplitExpense: SplitExpense = {
                ...splitExpense,
                amount,
                isManuallyEdited: true,
            };

            // Update distance for distance transactions based on new amount and rate
            if (isDistanceRequest && originalTransaction && splitExpense.customUnit) {
                const mileageRate = resolveSplitMileageRate({transaction: originalTransaction, policy, isSelfDMSplit, personalPolicyOutputCurrency});
                const {rate: currentRate = 0} =
                    DistanceRequestUtils.getRateByCustomUnitRateID({policy, customUnitRateID: splitExpense.customUnit?.customUnitRateID ?? String(CONST.DEFAULT_NUMBER_ID)}) ?? {};
                const {unit, rate: mileageRateValue} = mileageRate;
                const preferredRate = isSelfDMSplit ? mileageRateValue : currentRate;
                const secondaryRate = isSelfDMSplit ? currentRate : mileageRateValue;
                const rate = preferredRate && preferredRate > 0 ? preferredRate : secondaryRate;

                if (rate && rate > 0) {
                    const {customUnit: updatedCustomUnit, merchant} = updateSplitExpenseDistanceFromAmount(
                        amount,
                        rate,
                        unit,
                        splitExpense.customUnit,
                        mileageRate,
                        originalTransaction.currency,
                    );

                    updatedSplitExpense = {
                        ...updatedSplitExpense,
                        customUnit: updatedCustomUnit,
                        merchant,
                    };
                }
            }

            return updatedSplitExpense;
        }
        return splitExpense;
    });

    let redistributedSplitExpenses = splitWithUpdatedAmount;

    // Auto-redistribute amounts for all splits if this is not a distance request
    if (!isDistanceRequest) {
        redistributedSplitExpenses = redistributeSplitExpenseAmounts(splitWithUpdatedAmount, total, currency);
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, {
        comment: {
            splitExpenses: redistributedSplitExpenses,
        },
    });
}

/**
 * Clear errors from split transaction draft
 */
function clearSplitTransactionDraftErrors(transactionID: string | undefined) {
    if (!transactionID) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {
        errors: null,
    });
}

function updateSplitExpenseDraftField(fields: Partial<OnyxTypes.Transaction>) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, fields);
}

export {
    updateSplitExpenseDistanceFromAmount,
    initSplitExpenseItemData,
    resolveSplitItemReportID,
    resolveSplitMileageRate,
    initDraftSplitExpenseDataForEdit,
    addSplitExpenseField,
    evenlyDistributeSplitExpenseAmounts,
    resetSplitExpensesByDateRange,
    removeSplitExpenseField,
    updateSplitExpenseField,
    updateSplitExpenseAmountField,
    clearSplitTransactionDraftErrors,
    updateSplitExpenseDraftField,
};
