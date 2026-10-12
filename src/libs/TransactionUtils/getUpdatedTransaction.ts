/**
 * Applies an expense edit (amount, merchant, distance, tax, etc.) to a Transaction and returns the updated copy,
 * plus helpers for the cleared pending fields and the recalculated distance merchant.
 * Extracted from TransactionUtils/index.ts to keep that file smaller.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {CommuterExclusionData} from '@libs/DistanceRequestUtils';
import {toLocaleDigit} from '@libs/LocaleDigitUtils';
import {translateLocal} from '@libs/Localize';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {Policy, Transaction} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
import type {TransactionChanges} from '@src/types/onyx/Transaction';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {deepEqual} from 'fast-equals';
import lodashDeepClone from 'lodash/cloneDeep';
import lodashSet from 'lodash/set';

import {isFailedScanAmountPlaceholder} from './amountUtils';
import getDistanceInMeters from './getDistanceInMeters';
// This cycle import is safe because this file was extracted from TransactionUtils/index.ts, which re-exports it.
// The functions imported here are pure helpers that aren't called at initialization time.
// eslint-disable-next-line import/no-cycle
import {
    getCategoryTaxDetails,
    getCurrency,
    hasAppliedCommuterExclusion,
    hasLocallyKnownDistance,
    isDistanceRequest,
    isFetchingWaypointsFromServer,
    isManualDistanceRequest,
    isOdometerDistanceRequest,
    isScanRequest,
} from './index';

function getClearedPendingFields(transactionChanges: TransactionChanges) {
    return {
        ...Object.fromEntries(Object.keys(transactionChanges).map((key) => [key, null])),
        ...(Object.hasOwn(transactionChanges, 'comment') && {comment: null}),
        ...(Object.hasOwn(transactionChanges, 'created') && {created: null}),
        ...(Object.hasOwn(transactionChanges, 'amount') && {amount: null}),
        ...(Object.hasOwn(transactionChanges, 'currency') && {currency: null}),
        ...(Object.hasOwn(transactionChanges, 'merchant') && {merchant: null}),
        ...(Object.hasOwn(transactionChanges, 'waypoints') && {waypoints: null}),
        ...(Object.hasOwn(transactionChanges, 'reimbursable') && {reimbursable: null}),
        ...(Object.hasOwn(transactionChanges, 'billable') && {billable: null}),
        ...(Object.hasOwn(transactionChanges, 'category') && {category: null}),
        ...(Object.hasOwn(transactionChanges, 'tag') && {tag: null}),
        ...(Object.hasOwn(transactionChanges, 'taxAmount') && {taxAmount: null}),
        ...(Object.hasOwn(transactionChanges, 'taxCode') && {taxCode: null}),
        ...(Object.hasOwn(transactionChanges, 'attendees') && {attendees: null}),
        ...(Object.hasOwn(transactionChanges, 'distance') && {
            quantity: null,
            amount: null,
            merchant: null,
        }),
    };
}

function getDistanceMerchantForTransaction({
    transaction,
    distanceInMeters,
    unit,
    rate,
    currency,
    translate,
    getCurrencySymbol,
    commuterExclusionData,
}: {
    transaction: OnyxEntry<Transaction>;
    distanceInMeters: number;
    unit: Unit | undefined;
    rate: number | undefined;
    currency: string;
    translate: LocaleContextProps['translate'];
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'];
    commuterExclusionData?: CommuterExclusionData | null;
}): string {
    return DistanceRequestUtils.getDistanceMerchant(
        true,
        distanceInMeters,
        unit,
        rate,
        currency,
        translate,
        (digit) => toLocaleDigit(IntlStore.getCurrentLocale(), digit),
        getCurrencySymbol,
        isManualDistanceRequest(transaction),
        commuterExclusionData,
    );
}

/**
 * Build the distance merchant string (e.g. "5.00 mi @ $0.70 / mi") for a recalculated distance, using the
 * imperative locale accessors the optimistic update paths below have to rely on.
 */
function getRecalculatedDistanceMerchant(
    transaction: OnyxEntry<Transaction>,
    distanceInMeters: number,
    unit: Unit | undefined,
    rate: number | undefined,
    currency: string,
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'],
    commuterExclusionData?: CommuterExclusionData | null,
): string {
    return getDistanceMerchantForTransaction({
        transaction,
        distanceInMeters,
        unit,
        rate,
        currency,
        translate: translateLocal,
        getCurrencySymbol,
        commuterExclusionData,
    });
}

/**
 * Given the edit made to the expense, return an updated transaction object.
 */
function getUpdatedTransaction({
    transaction,
    transactionChanges,
    isFromExpenseReport,
    shouldUpdateReceiptState = true,
    policy = undefined,
    policies = undefined,
    isSplitTransaction = false,
    personalPolicyOutputCurrency,
    getCurrencyDecimals,
    getCurrencySymbol,
}: {
    transaction: Transaction;
    transactionChanges: TransactionChanges;
    isFromExpenseReport: boolean;
    shouldUpdateReceiptState?: boolean;
    policy?: OnyxEntry<Policy>;
    policies?: OnyxCollection<Policy>;
    isSplitTransaction?: boolean;
    personalPolicyOutputCurrency: string | undefined;
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'];
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'];
}): Transaction {
    const isUnReportedExpense = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

    // Only changing the first level fields so no need for deep clone now
    const updatedTransaction = lodashDeepClone(transaction);
    const shouldPreserveConfirmedScanZeroAmount =
        isScanRequest(transaction) &&
        transaction.receipt?.state === CONST.IOU.RECEIPT_STATE.OPEN &&
        transaction.amount === 0 &&
        !Object.hasOwn(transactionChanges, 'amount') &&
        !isFailedScanAmountPlaceholder(transaction);
    if (shouldPreserveConfirmedScanZeroAmount) {
        updatedTransaction.isAmountSet = true;
    }
    let shouldStopSmartscan = false;

    // The comment property does not have its modifiedComment counterpart
    if (Object.hasOwn(transactionChanges, 'comment')) {
        updatedTransaction.comment = {
            ...updatedTransaction.comment,
            comment: transactionChanges.comment,
        };
    }
    if (Object.hasOwn(transactionChanges, 'created')) {
        updatedTransaction.modifiedCreated = transactionChanges.created;
        shouldStopSmartscan = true;
    }
    if (Object.hasOwn(transactionChanges, 'amount') && typeof transactionChanges.amount === 'number') {
        updatedTransaction.modifiedAmount = isFromExpenseReport || isUnReportedExpense ? -transactionChanges.amount : transactionChanges.amount;
        shouldStopSmartscan = true;
    }
    if (Object.hasOwn(transactionChanges, 'currency')) {
        updatedTransaction.modifiedCurrency = transactionChanges.currency;
        shouldStopSmartscan = true;
    }

    if (Object.hasOwn(transactionChanges, 'merchant')) {
        updatedTransaction.modifiedMerchant = transactionChanges.merchant;
        shouldStopSmartscan = true;
    }

    if (Object.hasOwn(transactionChanges, 'waypoints')) {
        updatedTransaction.modifiedWaypoints = transactionChanges.waypoints;
        // For draft split transactions, we don't want to set isLoading to true as all the split transactions are in draft state
        if (!isSplitTransaction) {
            updatedTransaction.isLoading = true;
        }
        shouldStopSmartscan = true;

        // A manual-distance edit re-sends unchanged waypoints; when they truly didn't change, leave
        // `amount`/`modifiedAmount` to the sibling `distance` branch instead of zeroing them here.
        const waypointsActuallyChanged = !deepEqual(transactionChanges.waypoints, transaction?.comment?.waypoints);

        if (waypointsActuallyChanged && !transactionChanges.routes?.route0?.geometry?.coordinates) {
            // The waypoints were changed, but there is no route – it is pending from the BE and we should mark the fields as pending
            updatedTransaction.amount = CONST.IOU.DEFAULT_AMOUNT;
            updatedTransaction.modifiedAmount = CONST.IOU.DEFAULT_AMOUNT;
            updatedTransaction.modifiedMerchant = translateLocal('iou.fieldPending');
        } else if (transactionChanges.routes?.route0?.geometry?.coordinates) {
            const mileageRate = DistanceRequestUtils.getRate({transaction: updatedTransaction, policy, personalPolicyOutputCurrency});
            const {unit, rate} = mileageRate;

            // Use route distance directly since waypoints changed and the route was recalculated.
            // getDistanceInMeters prefers quantity which may hold a stale manually-edited value.
            const selectedRouteKey = transactionChanges.selectedRouteKey ?? transaction?.comment?.selectedRouteKey;
            const distanceInMeters =
                (selectedRouteKey ? transactionChanges.routes?.[selectedRouteKey]?.distance : undefined) ??
                transactionChanges.routes?.route0?.distance ??
                getDistanceInMeters(transaction, unit);
            // Sync customUnit.quantity + routeDistanceMeters to the recalculated route BEFORE computing the
            // commuter exclusion below. Without the quantity sync the prior manually-edited value would linger
            // and drive getDistanceInMeters (which prefers quantity over routes). getTransactionCommuterExclusionData
            // also reads routeDistanceMeters off the transaction and re-emits it, so it must be set first — the
            // whole customUnit is then replaced by that function's return value.
            if (unit) {
                lodashSet(updatedTransaction, 'comment.customUnit.quantity', roundToTwoDecimalPlaces(DistanceRequestUtils.convertDistanceUnit(distanceInMeters, unit)));
                lodashSet(updatedTransaction, 'comment.customUnit.routeDistanceMeters', distanceInMeters);
            }

            const commuterExclusionTransactionData = hasAppliedCommuterExclusion(updatedTransaction)
                ? DistanceRequestUtils.getTransactionCommuterExclusionData({
                      transaction: updatedTransaction,
                      policy,
                      storedCustomUnit: transaction?.comment?.customUnit,
                      personalPolicyOutputCurrency,
                      hasTripChanged: waypointsActuallyChanged,
                  })
                : undefined;

            if (commuterExclusionTransactionData) {
                lodashSet(updatedTransaction, 'comment.customUnit', commuterExclusionTransactionData.customUnit);
            } else if (waypointsActuallyChanged) {
                // The exclusion described the trip being replaced, so it goes with it rather than showing a deduction that no longer applies.
                lodashSet(updatedTransaction, 'comment.customUnit.commuterExclusion', null);
                lodashSet(updatedTransaction, 'comment.customUnit.reimbursableDistance', null);
                lodashSet(updatedTransaction, 'comment.customUnit.commuterExclusionMethod', null);
            }

            const amount = commuterExclusionTransactionData?.modifiedAmount ?? DistanceRequestUtils.getDistanceRequestAmount(distanceInMeters, unit, rate ?? 0);
            const updatedAmount = isFromExpenseReport || isUnReportedExpense ? -amount : amount;
            // Use the rate's resolved currency (which may come from personalPolicyOutputCurrency for a P2P expense),
            // not transaction.currency, so the merchant symbol/rate and the recalculated amount stay in the same currency.
            const updatedCurrency = mileageRate.currency ?? transaction.currency ?? CONST.CURRENCY.USD;
            const updatedMerchant = getRecalculatedDistanceMerchant(
                transaction,
                distanceInMeters,
                unit,
                rate,
                updatedCurrency,
                getCurrencySymbol,
                DistanceRequestUtils.getCommuterExclusionDisplayData(commuterExclusionTransactionData?.customUnit, unit),
            );

            updatedTransaction.amount = updatedAmount;
            updatedTransaction.modifiedAmount = updatedAmount;
            updatedTransaction.modifiedMerchant = updatedMerchant;
            if (getCurrency(updatedTransaction) !== updatedCurrency) {
                updatedTransaction.modifiedCurrency = updatedCurrency;
            }
        }
    }

    if (Object.hasOwn(transactionChanges, 'reportID') && typeof transactionChanges.reportID === 'string') {
        updatedTransaction.reportID = transactionChanges.reportID;
    }

    if (Object.hasOwn(transactionChanges, 'routes')) {
        updatedTransaction.routes = transactionChanges.routes;
    }

    if (Object.hasOwn(transactionChanges, 'customUnitRateID')) {
        lodashSet(updatedTransaction, 'comment.customUnit.customUnitRateID', transactionChanges.customUnitRateID);
        lodashSet(updatedTransaction, 'comment.customUnit.defaultP2PRate', null);
        shouldStopSmartscan = true;

        const existingDistanceUnit = transaction?.comment?.customUnit?.distanceUnit;
        const routeDistanceMeters = transaction?.comment?.customUnit?.routeDistanceMeters;
        const quantity = transaction?.comment?.customUnit?.quantity;
        const hasCommuterExclusion = hasAppliedCommuterExclusion(transaction);
        // For transactions with an applied commuter exclusion, `quantity` is the route distance rounded
        // to 2dp, so it differs from the exact conversion by at most 0.005. A gap larger than this rounding
        // tolerance means the user manually edited the distance, so we must convert their quantity instead.
        const ROUNDING_TOLERANCE = 0.01;
        const isDistanceManuallyEdited =
            hasCommuterExclusion &&
            typeof routeDistanceMeters === 'number' &&
            typeof quantity === 'number' &&
            !!existingDistanceUnit &&
            Math.abs(quantity - DistanceRequestUtils.convertDistanceUnit(routeDistanceMeters, existingDistanceUnit)) > ROUNDING_TOLERANCE;
        const shouldUseExactRouteDistance = hasCommuterExclusion && typeof routeDistanceMeters === 'number' && !isDistanceManuallyEdited;

        // Get the new distance unit from the rate's unit
        const newDistanceUnit = DistanceRequestUtils.getUpdatedDistanceUnit({transaction: updatedTransaction, policy});
        lodashSet(updatedTransaction, 'comment.customUnit.distanceUnit', newDistanceUnit);

        // If the distanceUnit is set and the rate is changed to one that has a different unit, convert the distance to the new unit.
        // Skip conversion for odometer transactions — odometer readings are physical car readings and should be retained as-is.
        if (existingDistanceUnit && newDistanceUnit !== existingDistanceUnit && !isOdometerDistanceRequest(transaction)) {
            const conversionFactor = existingDistanceUnit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? CONST.CUSTOM_UNITS.MILES_TO_KILOMETERS : CONST.CUSTOM_UNITS.KILOMETERS_TO_MILES;
            const distance = roundToTwoDecimalPlaces(
                shouldUseExactRouteDistance ? DistanceRequestUtils.convertDistanceUnit(routeDistanceMeters, newDistanceUnit) : (quantity ?? 0) * conversionFactor,
            );
            lodashSet(updatedTransaction, 'comment.customUnit.quantity', distance);
        }

        if (!isFetchingWaypointsFromServer(transaction) || hasLocallyKnownDistance(transaction)) {
            // When the waypoints are being fetched from the server and we have no local distance, we cannot
            // recalculate the updated amount. Otherwise, recalculate the fields based on the new rate.
            let updatedMileageRate = DistanceRequestUtils.getRate({transaction: updatedTransaction, policy, useTransactionDistanceUnit: false, personalPolicyOutputCurrency});

            // The provided `policy` may not own the new rate, leaving the amount at 0. Fall back to
            // resolving the rate across every policy the user belongs to.
            if (!updatedMileageRate.rate && transactionChanges.customUnitRateID) {
                const rateFromAnyPolicy = DistanceRequestUtils.getEnabledRateByCustomUnitRateIDFromAnyPolicy(transactionChanges.customUnitRateID, policies);
                if (rateFromAnyPolicy?.rate) {
                    updatedMileageRate = rateFromAnyPolicy;

                    // The fallback rate wasn't known when the distance unit/quantity were set above from the
                    // (rate-less) provided policy, so redo that conversion against the fallback rate's actual unit.
                    if (rateFromAnyPolicy.unit && rateFromAnyPolicy.unit !== newDistanceUnit && !isOdometerDistanceRequest(transaction)) {
                        lodashSet(updatedTransaction, 'comment.customUnit.distanceUnit', rateFromAnyPolicy.unit);
                        const fallbackConversionFactor =
                            newDistanceUnit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? CONST.CUSTOM_UNITS.MILES_TO_KILOMETERS : CONST.CUSTOM_UNITS.KILOMETERS_TO_MILES;
                        const currentQuantity = updatedTransaction?.comment?.customUnit?.quantity ?? 0;
                        const distance = shouldUseExactRouteDistance
                            ? DistanceRequestUtils.convertDistanceUnit(routeDistanceMeters, rateFromAnyPolicy.unit)
                            : currentQuantity * fallbackConversionFactor;
                        lodashSet(updatedTransaction, 'comment.customUnit.quantity', roundToTwoDecimalPlaces(distance));
                    }
                }
            }
            const {unit, rate} = updatedMileageRate;

            const distanceInMeters = getDistanceInMeters(updatedTransaction, unit);

            // The commuter exclusion is expressed in distance units, so it has to be re-derived against the new
            // rate's unit and the converted quantity. The amount and merchant then describe the reimbursable
            // distance, matching what the backend stores for modifiedAmount/modifiedMerchant.
            const commuterExclusionTransactionData = hasAppliedCommuterExclusion(updatedTransaction)
                ? DistanceRequestUtils.getTransactionCommuterExclusionData({
                      transaction: updatedTransaction,
                      policy,
                      storedCustomUnit: transaction?.comment?.customUnit,
                      personalPolicyOutputCurrency,
                  })
                : undefined;

            if (commuterExclusionTransactionData) {
                lodashSet(updatedTransaction, 'comment.customUnit', commuterExclusionTransactionData.customUnit);
            }

            const amount = commuterExclusionTransactionData?.modifiedAmount ?? DistanceRequestUtils.getDistanceRequestAmount(distanceInMeters, unit, rate ?? 0);
            const updatedAmount = isFromExpenseReport || isUnReportedExpense ? -amount : amount;
            const updatedCurrency = updatedMileageRate.currency ?? CONST.CURRENCY.USD;
            const updatedMerchant = getRecalculatedDistanceMerchant(
                transaction,
                distanceInMeters,
                unit,
                rate,
                updatedCurrency,
                getCurrencySymbol,
                DistanceRequestUtils.getCommuterExclusionDisplayData(commuterExclusionTransactionData?.customUnit, unit),
            );

            updatedTransaction.amount = updatedAmount;
            updatedTransaction.modifiedAmount = updatedAmount;
            updatedTransaction.modifiedMerchant = updatedMerchant;
            updatedTransaction.modifiedCurrency = updatedCurrency;
        }
    }

    if (Object.hasOwn(transactionChanges, 'taxAmount') && typeof transactionChanges.taxAmount === 'number') {
        updatedTransaction.taxAmount = isFromExpenseReport || isUnReportedExpense ? -transactionChanges.taxAmount : transactionChanges.taxAmount;
    }

    if (Object.hasOwn(transactionChanges, 'taxCode') && typeof transactionChanges.taxCode === 'string') {
        updatedTransaction.taxCode = transactionChanges.taxCode;
    }

    if (Object.hasOwn(transactionChanges, 'taxValue') && typeof transactionChanges.taxCode === 'string') {
        updatedTransaction.taxValue = transactionChanges.taxValue;
    }

    if (Object.hasOwn(transactionChanges, 'reimbursable') && typeof transactionChanges.reimbursable === 'boolean') {
        updatedTransaction.reimbursable = transactionChanges.reimbursable;
    }

    if (Object.hasOwn(transactionChanges, 'billable') && typeof transactionChanges.billable === 'boolean') {
        updatedTransaction.billable = transactionChanges.billable;
    }

    if (Object.hasOwn(transactionChanges, 'category') && typeof transactionChanges.category === 'string') {
        updatedTransaction.category = transactionChanges.category;

        // On a server backed edit, clearing the category leaves the stored tax rate untouched, so predicting a
        // change here only writes a rate that the response immediately overwrites. Split drafts have no such
        // response and send whatever tax the draft holds, so they keep recalculating.
        if (transactionChanges.category || isSplitTransaction) {
            const {categoryTaxCode, categoryTaxAmount, categoryTaxValue} = getCategoryTaxDetails(transactionChanges.category, transaction, policy, getCurrencyDecimals);
            if (categoryTaxCode && categoryTaxAmount !== undefined && categoryTaxValue) {
                updatedTransaction.taxCode = categoryTaxCode;
                updatedTransaction.taxAmount = categoryTaxAmount;
                updatedTransaction.taxValue = categoryTaxValue;
            }
        }
    }

    if (Object.hasOwn(transactionChanges, 'tag') && typeof transactionChanges.tag === 'string') {
        updatedTransaction.tag = transactionChanges.tag;
    }

    if (Object.hasOwn(transactionChanges, 'attendees')) {
        updatedTransaction.comment = {
            ...updatedTransaction.comment,
            attendees: transactionChanges.attendees,
        };
        updatedTransaction.modifiedAttendees = transactionChanges?.attendees;
    }

    if (
        shouldUpdateReceiptState &&
        shouldStopSmartscan &&
        transaction?.receipt &&
        Object.keys(transaction.receipt).length > 0 &&
        transaction?.receipt?.state !== CONST.IOU.RECEIPT_STATE.OPEN &&
        updatedTransaction.receipt
    ) {
        updatedTransaction.receipt.state = CONST.IOU.RECEIPT_STATE.OPEN;
    }

    if (Object.hasOwn(transactionChanges, 'distance') && typeof transactionChanges.distance === 'number') {
        const distance = roundToTwoDecimalPlaces(transactionChanges.distance ?? 0);
        // Capture before mutating quantity below; needed by the fallback amount computation.
        const previousDistanceInMeters = getDistanceInMeters(transaction, transaction?.comment?.customUnit?.distanceUnit);

        lodashSet(updatedTransaction, 'comment.customUnit.quantity', distance);
        shouldStopSmartscan = true;

        const updatedMileageRate = DistanceRequestUtils.getRate({transaction: updatedTransaction, policy, useTransactionDistanceUnit: false, personalPolicyOutputCurrency});
        const {unit, rate} = updatedMileageRate;

        // Sync the stored distanceUnit to the policy's current unit. The user's input on the Manual
        // tab is already in this unit; without writing it back, the optimistic state carries a stale
        // unit (e.g. "miles" when the workspace switched to km) and the display stays wrong until the
        // BE response — which never lands offline.
        if (unit) {
            lodashSet(updatedTransaction, 'comment.customUnit.distanceUnit', unit);
        }

        const distanceInMeters = getDistanceInMeters(updatedTransaction, unit);
        const commuterExclusionTransactionData = hasAppliedCommuterExclusion(updatedTransaction)
            ? DistanceRequestUtils.getTransactionCommuterExclusionData({
                  transaction: updatedTransaction,
                  policy,
                  storedCustomUnit: transaction?.comment?.customUnit,
                  personalPolicyOutputCurrency,
              })
            : undefined;

        if (commuterExclusionTransactionData) {
            lodashSet(updatedTransaction, 'comment.customUnit', commuterExclusionTransactionData.customUnit);
        }

        let amount = commuterExclusionTransactionData?.modifiedAmount ?? DistanceRequestUtils.getDistanceRequestAmount(distanceInMeters, unit, rate ?? 0);
        amount = isFromExpenseReport || isUnReportedExpense ? -amount : amount;
        const updatedCurrency = updatedMileageRate.currency ?? CONST.CURRENCY.USD;
        const updatedMerchant = getRecalculatedDistanceMerchant(
            transaction,
            distanceInMeters,
            unit,
            rate,
            updatedCurrency,
            getCurrencySymbol,
            DistanceRequestUtils.getCommuterExclusionDisplayData(commuterExclusionTransactionData?.customUnit, unit),
        );

        // No locally resolvable rate (e.g. track expense without policy loaded) → scale the previous
        // amount by the distance ratio so the optimistic value isn't 0. `modifiedAmount` is `""` for
        // unedited transactions, so coerce via Number() and fall through to `amount`.
        const previousAmount = Number(transaction?.modifiedAmount) || transaction?.amount || 0;
        const useFallback = !rate && !!previousDistanceInMeters && !!previousAmount && !!distanceInMeters;
        if (useFallback) {
            updatedTransaction.modifiedAmount = Math.round(previousAmount * (distanceInMeters / previousDistanceInMeters));
            updatedTransaction.modifiedMerchant = updatedMerchant;
            // Leave currency alone — without a resolvable rate we don't know the target currency.
        } else {
            updatedTransaction.modifiedAmount = amount;
            updatedTransaction.modifiedMerchant = updatedMerchant;
            updatedTransaction.modifiedCurrency = updatedCurrency;
        }
    }

    // The user picked a different map route without touching the waypoints, so the routes are unchanged and only the
    // distance the expense reads from them changes. Like the `distance` branch above this keeps `routes` intact, so
    // the alternate routes the user can still switch between survive the edit.
    // A manually typed distance always wins over the route distance, so skip this when both are being changed.
    if (Object.hasOwn(transactionChanges, 'selectedRouteKey') && typeof transactionChanges.selectedRouteKey === 'string' && !Object.hasOwn(transactionChanges, 'distance')) {
        const selectedRouteDistanceInMeters = updatedTransaction?.routes?.[transactionChanges.selectedRouteKey]?.distance;
        lodashSet(updatedTransaction, 'comment.selectedRouteKey', transactionChanges.selectedRouteKey);
        shouldStopSmartscan = true;

        if (selectedRouteDistanceInMeters) {
            const mileageRate = DistanceRequestUtils.getRate({transaction: updatedTransaction, policy, personalPolicyOutputCurrency});
            const {unit, rate} = mileageRate;

            // `getDistanceInMeters` prefers `customUnit.quantity`, so it has to follow the new route or the displayed
            // distance would keep showing the previously selected route. This is done before the commuter exclusion is
            // re-derived below, because that reads the quantity as the route distance to subtract the commute from.
            if (unit) {
                lodashSet(updatedTransaction, 'comment.customUnit.quantity', roundToTwoDecimalPlaces(DistanceRequestUtils.convertDistanceUnit(selectedRouteDistanceInMeters, unit)));
                lodashSet(updatedTransaction, 'comment.customUnit.routeDistanceMeters', selectedRouteDistanceInMeters);
            }

            // The commute is excluded from the new route's distance the same way the distance/rate edits above do it,
            // so the optimistic amount and the modified expense message charge only the reimbursable distance instead
            // of the whole route. The stored `commuterExclusion`/`reimbursableDistance` also have to be recomputed or
            // the distance field would keep describing the previously selected route's breakdown.
            const commuterExclusionTransactionData = hasAppliedCommuterExclusion(updatedTransaction)
                ? DistanceRequestUtils.getTransactionCommuterExclusionData({
                      transaction: updatedTransaction,
                      policy,
                      personalPolicyOutputCurrency,
                  })
                : undefined;

            if (commuterExclusionTransactionData) {
                lodashSet(updatedTransaction, 'comment.customUnit', commuterExclusionTransactionData.customUnit);
            }

            const amount = commuterExclusionTransactionData?.modifiedAmount ?? DistanceRequestUtils.getDistanceRequestAmount(selectedRouteDistanceInMeters, unit, rate ?? 0);
            const updatedAmount = isFromExpenseReport || isUnReportedExpense ? -amount : amount;
            const updatedCurrency = mileageRate.currency ?? transaction.currency ?? CONST.CURRENCY.USD;

            updatedTransaction.modifiedAmount = updatedAmount;
            updatedTransaction.modifiedMerchant = getRecalculatedDistanceMerchant(
                transaction,
                selectedRouteDistanceInMeters,
                unit,
                rate,
                updatedCurrency,
                getCurrencySymbol,
                DistanceRequestUtils.getCommuterExclusionDisplayData(commuterExclusionTransactionData?.customUnit, unit),
            );

            if (getCurrency(updatedTransaction) !== updatedCurrency) {
                updatedTransaction.modifiedCurrency = updatedCurrency;
            }
        }
    }

    if (Object.hasOwn(transactionChanges, 'odometerStart') && typeof transactionChanges.odometerStart === 'number') {
        lodashSet(updatedTransaction, 'comment.odometerStart', transactionChanges.odometerStart);
    }

    if (Object.hasOwn(transactionChanges, 'odometerEnd') && typeof transactionChanges.odometerEnd === 'number') {
        lodashSet(updatedTransaction, 'comment.odometerEnd', transactionChanges.odometerEnd);
    }

    if (Object.hasOwn(transactionChanges, 'reportID')) {
        updatedTransaction.reportID = transactionChanges.reportID;
    }

    // For distance split requests, if the amount is changed, we need to update the amount and merchant based on the new distance which we calculate before and save in transactionChanges
    if (isSplitTransaction && isDistanceRequest(transaction) && transactionChanges.amount) {
        const amount = transactionChanges.amount ?? Number(transaction.modifiedAmount) ?? transaction.amount ?? 0;
        const updatedAmount = (isFromExpenseReport || isUnReportedExpense) && transactionChanges.amount ? -amount : amount;
        updatedTransaction.amount = updatedAmount;
        updatedTransaction.modifiedAmount = updatedAmount;
        updatedTransaction.modifiedMerchant = transactionChanges.merchant;
        lodashSet(updatedTransaction, 'comment.customUnit.quantity', transactionChanges.quantity ?? updatedTransaction?.comment?.customUnit?.quantity);
        lodashSet(updatedTransaction, 'comment.customUnit.customUnitRateID', transactionChanges.customUnitRateID ?? updatedTransaction?.comment?.customUnit?.customUnitRateID);
    }

    updatedTransaction.pendingFields = {
        ...(updatedTransaction?.pendingFields ?? {}),
        ...(Object.hasOwn(transactionChanges, 'comment') && {comment: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'created') && {created: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'amount') && {amount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'currency') && {currency: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'merchant') && {merchant: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'waypoints') && {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'reimbursable') && {reimbursable: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'billable') && {billable: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'category') && {category: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'tag') && {tag: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'taxAmount') && {taxAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'taxCode') && {taxCode: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'attendees') && {attendees: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'distance') && {
            quantity: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            amount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            merchant: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        }),
        ...(Object.hasOwn(transactionChanges, 'odometerStart') && {odometerStart: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'odometerEnd') && {odometerEnd: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
    };

    return updatedTransaction;
}

export {getClearedPendingFields, getDistanceMerchantForTransaction, getUpdatedTransaction};
