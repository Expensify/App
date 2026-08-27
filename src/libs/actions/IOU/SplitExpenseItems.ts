import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import {convertToBackendAmount} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {calculateAmount as calculateIOUAmount} from '@libs/IOUUtils';
import {toLocaleDigit} from '@libs/LocaleDigitUtils';
import {translate} from '@libs/Localize';
import {rand64, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getDistanceRateCustomUnitRate, getTaxByID, resolveCurrentTaxCode} from '@libs/PolicyUtils';
import {getTransactionDetails, isSelfDM} from '@libs/ReportUtils';
import {
    buildOptimisticTransaction,
    getAmount,
    getCurrency,
    getDefaultTaxCode,
    getSelectedRouteKey,
    getTaxValue,
    hasManualDistanceOverride,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    calculateTaxAmount,
} from '@libs/TransactionUtils';

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
function getDistanceMerchantFromDistance(
    distanceInUnits: number,
    unit: Unit | undefined,
    rate: number | undefined,
    currency: string,
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'],
): string {
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
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'],
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
        distanceUnit: unit,
    };

    const merchant = getDistanceMerchantFromDistance(distanceInUnits, unit, rate, transactionCurrency ?? mileageRate?.currency ?? CONST.CURRENCY.USD, getCurrencySymbol);

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

/**
 * Resolve the rate and unit a split item is calculated with: its own selected rate when that rate still
 * resolves (it can live on another workspace), and the rate of the expense being split otherwise.
 *
 * The unit stays the one the expense is stored with — a workspace switching between miles and kilometers
 * doesn't re-express expenses that already exist, so the splits follow the same unit as their expense.
 */
function resolveSplitItemRate({
    customUnit,
    fallbackMileageRate,
    policy,
    policies,
}: {
    customUnit: TransactionCustomUnit | undefined;
    fallbackMileageRate: ReturnType<typeof DistanceRequestUtils.getRate>;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policies?: OnyxCollection<OnyxTypes.Policy>;
}): {rate: number | undefined; unit: Unit | undefined} {
    const unit = customUnit?.distanceUnit ?? fallbackMileageRate.unit;
    const customUnitRateID = customUnit?.customUnitRateID;
    if (!customUnitRateID || customUnitRateID === CONST.CUSTOM_UNITS.FAKE_P2P_ID) {
        return {rate: fallbackMileageRate.rate, unit};
    }

    const selectedRate =
        DistanceRequestUtils.getRateByCustomUnitRateID({policy, customUnitRateID}) ?? DistanceRequestUtils.getEnabledRateByCustomUnitRateIDFromAnyPolicy(customUnitRateID, policies);
    if (!selectedRate?.rate || selectedRate.rate <= 0 || selectedRate.enabled === false) {
        return {rate: fallbackMileageRate.rate, unit};
    }

    return {rate: selectedRate.rate, unit};
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
        taxAmount,
        policy,
        getCurrencyDecimals,
    }: {
        amount?: number;
        transactionID?: string;
        reportID?: string;
        created?: string;
        merchant?: string;
        customUnit?: TransactionCustomUnit;
        isManuallyEdited?: boolean;
        taxAmount?: number;
        policy?: OnyxEntry<OnyxTypes.Policy>;
        getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'];
    },
): SplitExpense {
    const transactionDetails = getTransactionDetails(transaction);
    const sourceCustomUnit = customUnit ?? transaction?.comment?.customUnit;
    const splitCustomUnit = sourceCustomUnit ? {...sourceCustomUnit} : undefined;
    if (splitCustomUnit) {
        delete splitCustomUnit.commuterExclusion;
        delete splitCustomUnit.reimbursableDistance;
        delete splitCustomUnit.commuterExclusionMethod;
    }

    // Resolve a tax code to its live value, but only when the rate is still selectable. A disabled or pending-delete
    // rate still resolves to a value, yet the user can no longer pick it, so treat it the same as a removed rate.
    const getSelectableTaxValue = (code: string | undefined) => {
        const value = code ? getTaxValue(policy, transaction, code) : undefined;
        const taxRate = code ? getTaxByID(policy, resolveCurrentTaxCode(policy, code)) : undefined;
        const isSelectable = !!taxRate && !taxRate.isDisabled && taxRate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        return value !== undefined && isSelectable ? value : undefined;
    };

    // The stored tax is out of date when the stored taxCode and taxValue no longer match a currently-selectable rate,
    // i.e. the rate's value was edited, or the rate was deleted or disabled after the expense was created. When that
    // happens the tax is resolved fresh below so all three tax fields stay consistent, rather than persisting stale
    // values. Only gate when a policy is available to compare against.
    const isStoredTaxValueStale = !!policy && !!transaction?.taxValue && getSelectableTaxValue(transaction?.taxCode) !== transaction.taxValue;

    let resolvedTaxCode = transactionDetails?.taxCode;
    let resolvedTaxValue = transactionDetails?.taxValue;
    let resolvedTaxAmount = taxAmount ?? transactionDetails?.taxAmount;
    if (isStoredTaxValueStale) {
        let liveTaxCode = transactionDetails?.taxCode;
        let liveTaxValue = getSelectableTaxValue(liveTaxCode);
        // The stored taxCode no longer points to a selectable rate (deleted or disabled), so fall back to the policy default.
        if (liveTaxValue === undefined) {
            liveTaxCode = getDefaultTaxCode(policy, transaction);
            liveTaxValue = getSelectableTaxValue(liveTaxCode);
            if (liveTaxValue === undefined) {
                liveTaxCode = undefined;
            }
        }
        // Only refresh when a live rate resolves. If none does, keep the parent's stored trio, which is internally
        // consistent, instead of pairing an undefined code and value with a recomputed amount. The tax is computed
        // from the whole split amount, matching every other split tax recalculation in this file.
        if (liveTaxValue !== undefined) {
            const splitAmount = Math.abs(amount ?? transactionDetails?.amount ?? 0);
            const splitCurrency = transactionDetails?.currency ?? CONST.CURRENCY.USD;
            resolvedTaxCode = liveTaxCode;
            resolvedTaxValue = liveTaxValue;
            resolvedTaxAmount = convertToBackendAmount(calculateTaxAmount(liveTaxValue, splitAmount, getCurrencyDecimals(splitCurrency)));
        }
    }

    return {
        transactionID: transactionID ?? transactionDetails?.transactionID ?? String(CONST.DEFAULT_NUMBER_ID),
        amount: amount ?? transactionDetails?.amount ?? 0,
        description: transactionDetails?.comment,
        category: transactionDetails?.category,
        tags: transaction?.tag ? [transaction?.tag] : [],
        created: created ?? transactionDetails?.created ?? DateUtils.formatMachineDateWithUTCTimeZone(DateUtils.getDBTime(), CONST.DATE.FNS_FORMAT_STRING),
        merchant: merchant ?? transactionDetails?.merchant,
        statusNum: transactionReport?.statusNum ?? 0,
        reportID: reportID ?? transaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID),
        reimbursable: transactionDetails?.reimbursable,
        billable: transactionDetails?.billable,
        taxCode: resolvedTaxCode,
        taxAmount: resolvedTaxAmount,
        taxValue: resolvedTaxValue,
        customUnit: splitCustomUnit,
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
function redistributeSplitExpenseAmounts(
    splitExpenses: SplitExpense[],
    total: number,
    currency: string,
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'],
): SplitExpense[] {
    // Calculate sum of manually edited splits
    const editedSum = splitExpenses.filter((split) => split.isManuallyEdited).reduce((sum, split) => sum + split.amount, 0);

    const uneditedSplits = splitExpenses.filter((split) => !split.isManuallyEdited);
    const uneditedCount = uneditedSplits.length;

    if (uneditedCount === 0) {
        return splitExpenses;
    }

    const remaining = total - editedSum;
    const lastUneditedIndex = uneditedCount - 1;
    let uneditedIndex = 0;
    return splitExpenses.map((split) => {
        if (split.isManuallyEdited) {
            return split;
        }
        const isLast = uneditedIndex === lastUneditedIndex;
        const newAmount = calculateIOUAmount(lastUneditedIndex, remaining, currency, isLast, true, getCurrencyDecimals);
        // Not the initial split state: recalculate tax from the split's own rate applied to its new amount.
        const newTaxAmount = convertToBackendAmount(calculateTaxAmount(split.taxValue, newAmount, getCurrencyDecimals(currency)));

        uneditedIndex += 1;
        return {...split, amount: newAmount, taxAmount: newTaxAmount};
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
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'],
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'],
    policies?: OnyxCollection<OnyxTypes.Policy>,
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
        const {unit, rate} = resolveSplitItemRate({customUnit, fallbackMileageRate: mileageRate, policy, policies});

        if (rate && rate > 0 && customUnit) {
            // For amount = 0, distance = 0, but we still calculate merchant format
            const {customUnit: updatedCustomUnit, merchant: calculatedMerchant} = updateSplitExpenseDistanceFromAmount(
                0,
                rate,
                unit,
                customUnit,
                mileageRate,
                getCurrencySymbol,
                transaction.currency,
            );
            customUnit = updatedCustomUnit;
            merchant = calculatedMerchant;
        }
    }

    const newSplitExpense = initSplitExpenseItemData(transaction, transactionReport, {
        amount: 0,
        taxAmount: 0,
        transactionID: rand64(),
        reportID: draftTransaction?.reportID,
        customUnit,
        merchant,
        isManuallyEdited: false,
        policy,
        getCurrencyDecimals,
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
        redistributedSplitExpenses = redistributeSplitExpenseAmounts(updatedSplitExpenses, total, currency, getCurrencyDecimals);
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
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'],
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'],
    policies?: OnyxCollection<OnyxTypes.Policy>,
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

    // Floor-allocation with the full remainder added to the first split, the way the amounts are allocated when
    // the splits are created, so distributing them evenly doesn't move the remainder from one split to another
    const splitCount = splitExpenses.length;

    const mileageRate = resolveSplitMileageRate({transaction, policy, isSelfDMSplit, personalPolicyOutputCurrency});

    const updatedSplitExpenses = splitExpenses.map((splitExpense, index) => {
        const amount = calculateIOUAmount(splitCount - 1, total, currency, index === 0, true, getCurrencyDecimals);
        // "Make splits even" is a user action on splits that already have their own tax rate, not the initial
        // split state, so recalculate each split's tax from its own rate rather than splitting the original tax amount.
        const splitTaxAmount = convertToBackendAmount(calculateTaxAmount(splitExpense.taxValue, amount, getCurrencyDecimals(currency)));

        let updatedSplitExpense: SplitExpense = {
            ...splitExpense,
            amount,
            taxAmount: splitTaxAmount,
            // Reset isManuallyEdited since user explicitly requested even distribution
            isManuallyEdited: false,
        };

        // Update distance for distance transactions based on new amount and rate
        if (isDistanceRequest && transaction && splitExpense.customUnit && amount !== 0) {
            const {unit, rate} = resolveSplitItemRate({customUnit: splitExpense.customUnit, fallbackMileageRate: mileageRate, policy, policies});
            if (rate && rate > 0) {
                const {customUnit: updatedCustomUnit, merchant} = updateSplitExpenseDistanceFromAmount(
                    amount,
                    rate,
                    unit,
                    splitExpense.customUnit,
                    mileageRate,
                    getCurrencySymbol,
                    transaction.currency,
                );

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

type ResetSplitExpensesByDateRangeParams = {
    /** The transaction containing split expenses */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** The split draft holding the resolved reportID (self-DM/workspace) */
    draftTransaction: OnyxEntry<OnyxTypes.Transaction>;

    /** The report the transaction belongs to */
    transactionReport: OnyxEntry<OnyxTypes.Report>;

    /** Start date in format 'YYYY-MM-DD' */
    startDate: string;

    /** End date in format 'YYYY-MM-DD' */
    endDate: string;

    /** The policy (for distance transactions) */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether the split is created in a self-DM */
    isSelfDMSplit: boolean;

    /** The output currency of the personal policy */
    personalPolicyOutputCurrency: string | undefined;

    /** Resolves the symbol of a currency */
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'];

    /** Resolves the number of decimals of a currency */
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'];

    /** All policies, used to resolve a rate that the transaction policy doesn't hold */
    policies?: OnyxCollection<OnyxTypes.Policy>;
};

/**
 * Reset all split expenses and create new ones based on the date range.
 * The original amount is distributed proportionally across all dates.
 */
function resetSplitExpensesByDateRange({
    transaction,
    draftTransaction,
    transactionReport,
    startDate,
    endDate,
    policy,
    isSelfDMSplit,
    personalPolicyOutputCurrency,
    getCurrencySymbol,
    getCurrencyDecimals,
    policies,
}: ResetSplitExpensesByDateRangeParams) {
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

    // Create split expenses for each date with proportional amounts, the remainder going to the first one
    const newSplitExpenses: SplitExpense[] = dates.map((date, index) => {
        const amount = calculateIOUAmount(dates.length - 1, total, currency, index === 0, true, getCurrencyDecimals);
        // Not the initial split state: recalculate tax from the (inherited) tax rate applied to the new amount.
        const splitTaxAmount = convertToBackendAmount(calculateTaxAmount(transactionDetails?.taxValue, amount, getCurrencyDecimals(currency)));

        let splitExpense = initSplitExpenseItemData(transaction, transactionReport, {
            amount,
            taxAmount: splitTaxAmount,
            transactionID: rand64(),
            reportID: draftTransaction?.reportID,
            created: format(date, CONST.DATE.FNS_FORMAT_STRING),
            policy,
            getCurrencyDecimals,
        });

        // Update distance for distance transactions based on new amount and rate
        if (isDistanceRequest && splitExpense.customUnit && amount !== 0) {
            const {unit, rate} = resolveSplitItemRate({customUnit: splitExpense.customUnit, fallbackMileageRate: mileageRate, policy, policies});
            if (rate && rate > 0) {
                const {customUnit: updatedCustomUnit, merchant} = updateSplitExpenseDistanceFromAmount(
                    amount,
                    rate,
                    unit,
                    splitExpense.customUnit,
                    mileageRate,
                    getCurrencySymbol,
                    transaction.currency,
                );

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

function removeSplitExpenseField(
    draftTransaction: OnyxEntry<OnyxTypes.Transaction>,
    splitExpenseTransactionID: string,
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'],
) {
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
        redistributedSplitExpenses = redistributeSplitExpenseAmounts(splitExpensesToRedistribute, total, currency, getCurrencyDecimals);
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
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'],
    policies?: OnyxCollection<OnyxTypes.Policy>,
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
            const splitSelectedRouteKey = getSelectedRouteKey(splitExpenseDraftTransaction);
            const splitDistanceUnit = splitExpenseDraftTransaction?.comment?.customUnit?.distanceUnit;
            const splitSelectedRouteDistanceInMeters = splitExpenseDraftTransaction?.routes?.[splitSelectedRouteKey]?.distance;
            // A distance the user typed on the Manual tab outranks the distance of the route it sits on top of, the same
            // precedence `getDistanceInMeters` applies. The routes stay populated through a manual distance edit, so
            // reading them first here would silently replace the override when any other field of the split is saved.
            const quantity =
                splitSelectedRouteDistanceInMeters && splitDistanceUnit && !hasManualDistanceOverride(splitExpenseDraftTransaction)
                    ? roundToTwoDecimalPlaces(DistanceRequestUtils.convertDistanceUnit(splitSelectedRouteDistanceInMeters, splitDistanceUnit))
                    : (splitExpenseDraftTransaction?.comment?.customUnit?.quantity ?? 0);

            const updatedItem: SplitExpense = {
                ...item,
                description: transactionDetails?.comment,
                category: transactionDetails?.category,
                tags: splitExpenseDraftTransaction?.tag ? [splitExpenseDraftTransaction?.tag] : [],
                created: transactionDetails?.created ?? DateUtils.formatMachineDateWithUTCTimeZone(DateUtils.getDBTime(), CONST.DATE.FNS_FORMAT_STRING),
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
                taxAmount: Math.abs(transactionDetails?.taxAmount ?? 0),
                taxValue: transactionDetails?.taxValue,
                routes: splitExpenseDraftTransaction?.routes ?? undefined,
                merchant: splitExpenseDraftTransaction?.modifiedMerchant ? splitExpenseDraftTransaction.modifiedMerchant : (splitExpenseDraftTransaction?.merchant ?? ''),
            };

            // Recalculate amount for distance transactions when rate or distance changes
            if (isDistanceRequest && originalTransaction) {
                const mileageRate = resolveSplitMileageRate({transaction: splitExpenseDraftTransaction, policy, isSelfDMSplit, personalPolicyOutputCurrency});
                const {unit, rate} = resolveSplitItemRate({customUnit: splitExpenseDraftTransaction?.comment?.customUnit, fallbackMileageRate: mileageRate, policy, policies});

                if (rate && rate > 0) {
                    // Calculate amount from the same distance `quantity` resolved to, so the amount and merchant can't
                    // drift from the stored distance: amount = distance * rate.
                    // Both amount and rate are in cents, distance is in units
                    const sign = item.amount < 0 ? -1 : 1;
                    updatedItem.amount = quantity > 0 ? Math.round(quantity * rate) * sign : 0;

                    // Update merchant for distance transactions
                    const currency = originalTransaction.currency ?? mileageRate?.currency ?? CONST.CURRENCY.USD;
                    updatedItem.merchant = getDistanceMerchantFromDistance(quantity, unit, rate, currency, getCurrencySymbol);
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
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'],
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'],
    policies?: OnyxCollection<OnyxTypes.Policy>,
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
                // Editing a split's amount is a user action on a split that already has its own tax rate, so
                // recalculate its tax from that rate applied to the new amount rather than the original tax amount.
                taxAmount: convertToBackendAmount(calculateTaxAmount(splitExpense.taxValue, amount, getCurrencyDecimals(currency))),
                isManuallyEdited: true,
            };

            // Update distance for distance transactions based on new amount and rate
            if (isDistanceRequest && originalTransaction && splitExpense.customUnit) {
                const mileageRate = resolveSplitMileageRate({transaction: originalTransaction, policy, isSelfDMSplit, personalPolicyOutputCurrency});
                const {unit, rate} = resolveSplitItemRate({customUnit: splitExpense.customUnit, fallbackMileageRate: mileageRate, policy, policies});

                if (rate && rate > 0) {
                    const {customUnit: updatedCustomUnit, merchant} = updateSplitExpenseDistanceFromAmount(
                        amount,
                        rate,
                        unit,
                        splitExpense.customUnit,
                        mileageRate,
                        getCurrencySymbol,
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
        redistributedSplitExpenses = redistributeSplitExpenseAmounts(splitWithUpdatedAmount, total, currency, getCurrencyDecimals);
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
