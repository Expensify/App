/** Reprices distance expenses for flows that change their workspace, without using rates from unrelated policies. */
import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {Policy, Rule, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import DistanceRequestUtils from './DistanceRequestUtils';
import {toLocaleDigit} from './LocaleDigitUtils';
import {translateLocal} from './Localize';
import {roundToTwoDecimalPlaces} from './NumberUtils';
import {isTaxTrackingEnabled} from './PolicyUtils/tax';
import {
    getAmount,
    getCurrency,
    getDistanceInMeters,
    getDistanceRateTaxUpdates,
    getMerchant,
    isDistanceRequest,
    isFetchingWaypointsFromServer,
    isManualDistanceRequest,
    isOdometerDistanceRequest,
} from './TransactionUtils';

type DistancePolicyChangeParams = {
    transaction: Transaction;
    policy: Policy;
    sourcePolicy: OnyxEntry<Policy>;
    policies: OnyxCollection<Policy>;
    rules: OnyxCollection<Rule>;
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'];
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'];
    isExpenseReport: boolean;
};

function getDistanceTransactionForPolicyChange({transaction, policy, sourcePolicy, policies, rules, getCurrencyDecimals, getCurrencySymbol, isExpenseReport}: DistancePolicyChangeParams) {
    if (!isDistanceRequest(transaction)) {
        return {updatedTransaction: transaction, isFallback: false, repricedTransaction: undefined};
    }
    const currentRateID = transaction.comment?.customUnit?.customUnitRateID;
    const currentRate =
        currentRateID && currentRateID !== CONST.CUSTOM_UNITS.FAKE_P2P_ID
            ? DistanceRequestUtils.getRateByCustomUnitRateIDAcrossPolicies({customUnitRateID: currentRateID, policy: sourcePolicy, policies})
            : undefined;
    const selection = DistanceRequestUtils.getRateForPolicyChange({transaction, policy, currentRate});
    const selectedRate = selection?.rate;
    if (!selectedRate?.customUnitRateID || selectedRate.customUnitRateID === currentRateID) {
        return {updatedTransaction: transaction, isFallback: false, repricedTransaction: undefined};
    }
    const updatedTransaction: Transaction = {
        ...transaction,
        comment: {...transaction.comment, customUnit: {...transaction.comment?.customUnit, customUnitRateID: selectedRate.customUnitRateID, defaultP2PRate: undefined}},
    };
    // Legacy expenses without a stored unit must not have their quantity converted from an assumed unit.
    const existingDistanceUnit = transaction.comment?.customUnit?.distanceUnit;
    const newDistanceUnit = DistanceRequestUtils.getUpdatedDistanceUnit({transaction: updatedTransaction, policy});
    if (updatedTransaction.comment?.customUnit) {
        updatedTransaction.comment.customUnit.distanceUnit = newDistanceUnit;
        if (existingDistanceUnit && newDistanceUnit !== existingDistanceUnit && !isOdometerDistanceRequest(transaction)) {
            const conversionFactor = existingDistanceUnit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? CONST.CUSTOM_UNITS.MILES_TO_KILOMETERS : CONST.CUSTOM_UNITS.KILOMETERS_TO_MILES;
            updatedTransaction.comment.customUnit.quantity = roundToTwoDecimalPlaces((transaction.comment?.customUnit?.quantity ?? 0) * conversionFactor);
        }
    }
    const isFallback = !selection?.isMatchingRate;
    // Select the destination rate while waypoints load, but wait for their distance before calculating a price.
    if (isFallback && !isFetchingWaypointsFromServer(transaction)) {
        const {unit, rate} = selectedRate;
        const distanceInMeters = getDistanceInMeters(updatedTransaction, unit);
        const calculatedAmount = DistanceRequestUtils.getDistanceRequestAmount(distanceInMeters, unit, rate ?? 0);
        const updatedAmount = isExpenseReport ? -calculatedAmount : calculatedAmount;
        const updatedCurrency = selectedRate.currency ?? CONST.CURRENCY.USD;
        const updatedMerchant = DistanceRequestUtils.getDistanceMerchant(
            true,
            distanceInMeters,
            unit,
            rate,
            updatedCurrency,
            // eslint-disable-next-line @typescript-eslint/no-deprecated -- Action utilities lack React locale context, matching the ported F3 calculation.
            translateLocal,
            (digit) => toLocaleDigit(IntlStore.getCurrentLocale(), digit),
            getCurrencySymbol,
            isManualDistanceRequest(transaction),
        );
        updatedTransaction.amount = updatedAmount;
        updatedTransaction.modifiedAmount = updatedAmount;
        updatedTransaction.modifiedCurrency = updatedCurrency;
        updatedTransaction.modifiedMerchant = updatedMerchant;
        if (isTaxTrackingEnabled(true, policy, true)) {
            const {taxCode, taxValue, taxAmount} = getDistanceRateTaxUpdates(policy, updatedTransaction, selectedRate.customUnitRateID, rules, getCurrencyDecimals);
            updatedTransaction.taxCode = taxCode;
            updatedTransaction.taxValue = taxValue;
            updatedTransaction.taxAmount = isExpenseReport ? -taxAmount : taxAmount;
        }
    }
    // A fallback with unchanged effective values gets a report message, but Auth posts no expense message.
    const repricedTransaction =
        isFallback &&
        (getAmount(updatedTransaction, true) !== getAmount(transaction, true) ||
            getMerchant(updatedTransaction) !== getMerchant(transaction) ||
            getCurrency(updatedTransaction) !== getCurrency(transaction))
            ? updatedTransaction
            : undefined;
    return {updatedTransaction, isFallback, repricedTransaction};
}

export default getDistanceTransactionForPolicyChange;
