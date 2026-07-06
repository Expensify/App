import type {CurrencyListActionsContextType} from '@components/CurrencyListContextProvider';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {CommuterExclusionData} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LastSelectedDistanceRates, OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import type DefaultP2PMileageRate from '@src/types/onyx/DefaultP2PMileageRate';
import type {Unit} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getDistanceUnitLabel, getFormattedDistanceInUnits} from './DistanceDisplayUtils';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {format, parseISO} from 'date-fns';
import Onyx from 'react-native-onyx';

import DateUtils from './DateUtils';
import getStoredDefaultP2PMileageRate from './getStoredDefaultP2PMileageRate';
import {getDistanceRateCustomUnit, getDistanceRateCustomUnitRate, getUnitRateValue} from './PolicyUtils';
import replaceAllDigits from './replaceAllDigits';
import {getCurrency, getRateID, isCustomUnitRateIDForP2P, isExpenseUnreported} from './TransactionUtils';

type MileageRate = {
    customUnitRateID?: string;
    rate?: number;
    currency?: string;
    unit: Unit;
    name?: string;
    enabled?: boolean;
    index?: number;
    startDate?: string | null;
    endDate?: string | null;
};

/** @private Only for getRate function */
let allPolicies: OnyxCollection<Policy>;

Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

const METERS_TO_KM = 0.001; // 1 kilometer is 1000 meters
const METERS_TO_MILES = 0.000621371; // There are approximately 0.000621371 miles in a meter
const DEFAULT_P2P_RATE_CENTS_PER_MILE = 67;

function getMileageRates(policy: OnyxInputOrEntry<Policy>, includeDisabledRates = false, selectedRateID?: string): Record<string, MileageRate> {
    const mileageRates: Record<string, MileageRate> = {};

    if (!policy?.customUnits) {
        return mileageRates;
    }

    const distanceUnit = getDistanceRateCustomUnit(policy);
    if (!distanceUnit?.rates) {
        return mileageRates;
    }

    for (const [rateID, rate] of Object.entries(distanceUnit.rates)) {
        if (!includeDisabledRates && rate.enabled === false && (!selectedRateID || rateID !== selectedRateID)) {
            continue;
        }

        if (!distanceUnit.attributes) {
            continue;
        }

        mileageRates[rateID] = {
            rate: rate.rate,
            currency: rate.currency,
            unit: distanceUnit.attributes.unit,
            name: rate.name,
            customUnitRateID: rate.customUnitRateID,
            enabled: rate.enabled,
            index: rate.index,
            startDate: rate.startDate,
            endDate: rate.endDate,
        };
    }

    return mileageRates;
}

/**
 * Retrieves the default mileage rate based on a given policy.
 * Default rate is the first created rate when you create the policy.
 * It's NOT always the rate whose name is "Default rate" because rate name is now changeable.
 *
 * @param policy - The policy from which to extract the default mileage rate.
 *
 * @returns An object containing the rate and unit for the default mileage or null if not found.
 * @returns [rate] - The default rate for the mileage.
 * @returns [currency] - The currency associated with the rate.
 * @returns [unit] - The unit of measurement for the distance.
 */
function getDefaultMileageRate(policy: OnyxInputOrEntry<Policy>): MileageRate | undefined {
    if (isEmptyObject(policy) || !policy?.customUnits) {
        return undefined;
    }

    const distanceUnit = getDistanceRateCustomUnit(policy);
    if (!distanceUnit?.rates || !distanceUnit.attributes) {
        return;
    }
    const mileageRates = Object.values(getMileageRates(policy)).sort((a, b) => {
        const aIndex = a.index ?? CONST.DEFAULT_NUMBER_ID;
        const bIndex = b.index ?? CONST.DEFAULT_NUMBER_ID;
        return aIndex - bIndex;
    });

    const distanceRate = mileageRates.at(0) ?? ({} as MileageRate);

    return {
        customUnitRateID: distanceRate.customUnitRateID,
        rate: distanceRate.rate,
        currency: distanceRate.currency,
        unit: distanceUnit.attributes.unit,
        name: distanceRate.name,
        index: distanceRate.index,
    };
}

/**
 * Converts a given distance in meters to the specified unit (kilometers or miles).
 *
 * @param distanceInMeters - The distance in meters to be converted.
 * @param unit - The desired unit of conversion, either 'km' for kilometers or 'mi' for miles.
 *
 * @returns The converted distance in the specified unit.
 */
function convertDistanceUnit(distanceInMeters: number, unit: Unit): number {
    switch (unit) {
        case CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS:
            return distanceInMeters * METERS_TO_KM;
        case CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES:
            return distanceInMeters * METERS_TO_MILES;
        default:
            throw new Error('Unsupported unit. Supported units are "mi" or "km".');
    }
}

/**
 * @param distanceInMeters Distance traveled
 * @param unit Unit that should be used to display the distance
 * @returns The distance in requested units, rounded to 2 decimals
 */
function getRoundedDistanceInUnits(distanceInMeters: number, unit: Unit): string {
    const convertedDistance = convertDistanceUnit(distanceInMeters, unit);
    return convertedDistance.toFixed(CONST.DISTANCE_DECIMAL_PLACES);
}

/**
 * @param unit Unit that should be used to display the distance
 * @param rate Expensable amount allowed per unit
 * @param currency The currency associated with the rate
 * @param translate Translate function
 * @param toLocaleDigit Function to convert to localized digit
 * @param useShortFormUnit If true, the unit will be returned in short form (e.g., "mi", "km").
 * @returns A string that displays the rate used for expense calculation
 */
function getFormattedRateValue(
    unit: Unit | undefined,
    rate: number | undefined,
    currency: string | undefined,
    translate: LocaleContextProps['translate'],
    toLocaleDigit: LocaleContextProps['toLocaleDigit'],
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'],
    isOffline?: boolean,
    useShortFormUnit?: boolean,
): string {
    if (isOffline && !rate) {
        return translate('iou.defaultRate');
    }
    if (!rate || !currency || !unit) {
        return translate('iou.fieldPending');
    }

    const singularDistanceUnit = unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.mile') : translate('common.kilometer');
    const formattedRate = getUnitRateValue(toLocaleDigit, {rate}, useShortFormUnit);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const currencySymbol = getCurrencySymbol(currency) || `${currency} `;

    return `${currencySymbol}${formattedRate} / ${useShortFormUnit ? unit : singularDistanceUnit}`;
}

/**
 * Get the rate title to display on the expense page.
 * If the rate is out of policy, displays "Rate out of policy".
 * For workspace expenses, shows the rate name (e.g., "Default Rate") so that updating a rate's
 * value on the workspace does not retroactively change the displayed rate on historical expenses.
 * For P2P expenses (no rate name), shows the formatted rate value (e.g., "$0.67 / mi").
 */
function getRateForExpenseDisplay(
    rateName: string | undefined,
    isCustomUnitOutOfPolicy: boolean,
    unit: Unit | undefined,
    rate: number | undefined,
    currency: string | undefined,
    translate: LocaleContextProps['translate'],
    toLocaleDigit: LocaleContextProps['toLocaleDigit'],
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'],
    isOffline?: boolean,
): string {
    if (isCustomUnitOutOfPolicy) {
        return translate('common.rateOutOfPolicy');
    }
    if (rateName) {
        return rateName;
    }
    return getFormattedRateValue(unit, rate, currency, translate, toLocaleDigit, getCurrencySymbol, isOffline);
}

/**
 * @param hasRoute Whether the route exists for the distance expense
 * @param distanceInMeters Distance traveled
 * @param unit Unit that should be used to display the distance
 * @param rate Expensable amount allowed per unit
 * @param translate Translate function
 * @param useShortFormUnit If true, the unit will be returned in short form (e.g., "mi", "km").
 * @param isZeroDistanceAllowed If true, a zero distance is formatted instead of returning an empty string.
 * @param commuterExclusionData When provided, the reimbursable distance (after the commuter exclusion) is displayed instead of the full route distance.
 * @returns A string that describes the distance traveled
 */
function getDistanceForDisplay(
    hasRoute: boolean,
    distanceInMeters: number,
    unit: Unit | undefined,
    rate: number | undefined,
    translate: LocaleContextProps['translate'],
    useShortFormUnit?: boolean,
    isZeroDistanceAllowed?: boolean,
    commuterExclusionData?: CommuterExclusionData,
): string {
    const displayUnit = unit ?? commuterExclusionData?.distanceUnit;
    if (!hasRoute || !displayUnit) {
        return translate('iou.fieldPending');
    }

    const distanceToDisplayInMeters = commuterExclusionData ? convertToDistanceInMeters(commuterExclusionData.reimbursableDistance, displayUnit) : distanceInMeters;
    if (!distanceToDisplayInMeters && !isZeroDistanceAllowed && !commuterExclusionData) {
        return '';
    }

    return getFormattedDistanceInUnits(convertDistanceUnit(distanceToDisplayInMeters, displayUnit), displayUnit, translate, useShortFormUnit);
}

function getDistanceForDisplayLabel(distanceInMeters: number, unit: Unit): string {
    const distanceInUnits = getRoundedDistanceInUnits(distanceInMeters, unit);
    return `${distanceInUnits} ${unit}`;
}

/**
 * @param hasRoute Whether the route exists for the distance expense
 * @param distanceInMeters Distance traveled
 * @param unit Unit that should be used to display the distance
 * @param rate Expensable amount allowed per unit
 * @param currency The currency associated with the rate
 * @param translate Translate function
 * @param toLocaleDigit Function to convert to localized digit
 * @param commuterExclusionData When provided, the reimbursable distance (after the commuter exclusion) is shown instead of the full route distance.
 * @returns A string that describes the distance traveled and the rate used for expense calculation
 */
function getDistanceMerchant(
    hasRoute: boolean,
    distanceInMeters: number,
    unit: Unit | undefined,
    rate: number | undefined,
    currency: string,
    translate: LocaleContextProps['translate'],
    toLocaleDigit: LocaleContextProps['toLocaleDigit'],
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'],
    isZeroDistanceAllowed?: boolean,
    commuterExclusionData?: CommuterExclusionData,
): string {
    if (!hasRoute || !rate) {
        return translate('iou.fieldPending');
    }

    if (!distanceInMeters && !isZeroDistanceAllowed && !commuterExclusionData) {
        return '';
    }

    const distanceInUnits = getDistanceForDisplay(hasRoute, distanceInMeters, unit, rate, translate, true, isZeroDistanceAllowed, commuterExclusionData);
    const ratePerUnit = getFormattedRateValue(unit, rate, currency, translate, toLocaleDigit, getCurrencySymbol, undefined, true);

    return `${distanceInUnits} ${CONST.DISTANCE_MERCHANT_SEPARATOR} ${ratePerUnit}`;
}

/**
 * Retrieves the rate and unit for a P2P distance expense for a given currency.
 *
 * Let's ensure this logic is consistent with the logic in the backend (Auth), since we're using the same method to calculate the rate value in distance requests created via Concierge.
 *
 * @param currency
 * @returns The rate and unit in MileageRate object.
 */
function getRateForP2P(currency: string, transaction: OnyxEntry<Transaction>): MileageRate {
    const defaultRate = getStoredDefaultP2PMileageRate();
    const p2pRate: DefaultP2PMileageRate = defaultRate ?? {rate: DEFAULT_P2P_RATE_CENTS_PER_MILE, unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES};
    const rate = transaction && getCurrency(transaction) === currency ? (transaction.comment?.customUnit?.defaultP2PRate ?? p2pRate.rate) : p2pRate.rate;

    // If a distance expense is being edited, the defaultP2PRate may not have been loaded yet, so use data from the existing transaction.
    const fallbackUnit = transaction?.comment?.customUnit?.distanceUnit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    return {
        rate,
        unit: defaultRate ? p2pRate.unit : fallbackUnit,
        currency: defaultRate ? currency : getCurrency(transaction),
    };
}

/**
 * Rounds a distance (already in the target unit) to 2 decimal places,
 * multiplies by the rate, and rounds to the nearest integer (cents).
 */
function roundDistanceAmount(distanceInUnits: number, rate: number): number {
    const roundedDistance = parseFloat(distanceInUnits.toFixed(2));
    return Math.round(roundedDistance * rate);
}

/**
 * Calculates the expense amount based on distance, unit, and rate.
 *
 * @param distance - The distance traveled in meters
 * @param unit - The unit of measurement for the distance
 * @param rate - Rate used for calculating the expense amount
 * @returns The computed expense amount (rounded) in "cents".
 */
function getDistanceRequestAmount(distance: number, unit: Unit, rate: number): number {
    return roundDistanceAmount(convertDistanceUnit(distance, unit), rate);
}

/**
 * Computes the commuter exclusion breakdown (in display units) for a distance request.
 *
 * Prefers values already stored on the transaction (set optimistically or by the backend),
 * otherwise previews the exclusion from the policy's commuter exclusion configuration.
 *
 * @param transaction - The distance transaction being confirmed/edited
 * @param policy - The policy the expense belongs to
 * @param distanceInMeters - The full route distance in meters
 * @param distanceUnit - The display unit (mi/km) the breakdown is expressed in
 * @returns The commuter exclusion and reimbursable distance, or null when no exclusion applies
 */
function getCommuterExclusionData(
    transaction: OnyxEntry<Transaction>,
    policy: OnyxEntry<Policy>,
    distanceInMeters: number,
    distanceUnit: Unit,
): {commuterExclusion: number; reimbursableDistance: number; distanceUnit: Unit} | null {
    const customUnit = transaction?.comment?.customUnit;

    // Prefer the stored quantity; fall back to converting the route distance for route-based
    // requests whose quantity hasn't resolved yet.
    let quantityInUnit = customUnit?.quantity ?? 0;
    if (quantityInUnit <= 0 && distanceInMeters > 0) {
        quantityInUnit = convertDistanceUnit(distanceInMeters, distanceUnit);
    }

    let commuterExclusion = customUnit?.commuterExclusion;
    let reimbursableDistance = customUnit?.reimbursableDistance;

    if (!commuterExclusion && policy?.commuterExclusions) {
        const exclusionConfig = policy.commuterExclusions;
        if (exclusionConfig.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE && quantityInUnit > 0) {
            const fixedDistanceUnit: Unit =
                exclusionConfig.fixedDistanceUnit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS ? CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS : CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
            const fixedDistance = convertDistanceUnit(convertToDistanceInMeters(exclusionConfig.fixedDistance ?? 0, fixedDistanceUnit), distanceUnit);
            if (fixedDistance > 0) {
                commuterExclusion = Math.min(fixedDistance, quantityInUnit);
                reimbursableDistance = Math.max(0, quantityInUnit - commuterExclusion);
            }
        }
    }

    if (!commuterExclusion || commuterExclusion <= 0) {
        return null;
    }

    return {
        commuterExclusion,
        reimbursableDistance: reimbursableDistance ?? Math.max(0, quantityInUnit - commuterExclusion),
        distanceUnit,
    };
}

/**
 * Converts the distance from kilometers or miles to meters.
 *
 * @param distance - The distance to be converted.
 * @param unit - The unit of measurement for the distance.
 * @returns The distance in meters.
 */
function convertToDistanceInMeters(distance: number, unit: Unit): number {
    if (unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS) {
        return distance / METERS_TO_KM;
    }
    return distance / METERS_TO_MILES;
}

/**
 * Returns whether the distance custom unit rate ID is unset or represents a non-workspace rate (P2P or placeholder).
 */
function isUnsetDistanceCustomUnitRateID(customUnitRateID: string | undefined): boolean {
    if (!customUnitRateID) {
        return true;
    }

    return customUnitRateID === CONST.CUSTOM_UNITS.FAKE_P2P_ID || customUnitRateID === CONST.CUSTOM_UNITS.UNSET_DISTANCE_RATE_ID;
}

/**
 * Checks if a mileage rate is eligible for a given expense date.
 * A rate is eligible if the date falls within its startDate/endDate bounds (inclusive).
 * Missing bounds mean unbounded in that direction.
 */
function isRateEligibleForDate(rate: MileageRate, expenseDate: string): boolean {
    const normalizedExpenseDate = DateUtils.formatWithUTCTimeZone(expenseDate, CONST.DATE.FNS_FORMAT_STRING);
    if (!normalizedExpenseDate) {
        return true;
    }

    if (rate.startDate && normalizedExpenseDate < rate.startDate) {
        return false;
    }
    if (rate.endDate && normalizedExpenseDate > rate.endDate) {
        return false;
    }
    return true;
}

/**
 * Returns a boundedness score: 2 = fully bounded (both dates), 1 = partially bounded (one date), 0 = unbounded.
 */
function getBoundednessScore(rate: MileageRate): number {
    if (rate.startDate && rate.endDate) {
        return 2;
    }
    if (rate.startDate || rate.endDate) {
        return 1;
    }
    return 0;
}

function getFullyBoundedDateRangeMs(rate: MileageRate): number | undefined {
    if (!rate.startDate || !rate.endDate) {
        return undefined;
    }

    return new Date(rate.endDate).getTime() - new Date(rate.startDate).getTime();
}

/**
 * Finds the best eligible rate for a given expense date from a set of mileage rates.
 * Selection order per design doc:
 * 1. Most specific date range (fully bounded > partially bounded > unbounded)
 * 2. Narrower date range for two fully bounded ranges
 * 3. Latest start date
 * 4. Lowest index (creation order)
 */
function getBestEligibleRate(mileageRates: Record<string, MileageRate>, expenseDate: string): MileageRate | undefined {
    const eligibleRates = Object.values(mileageRates).filter((rate) => rate.enabled !== false && isRateEligibleForDate(rate, expenseDate));

    if (eligibleRates.length === 0) {
        return undefined;
    }

    eligibleRates.sort((a, b) => {
        const aScore = getBoundednessScore(a);
        const bScore = getBoundednessScore(b);
        if (aScore !== bScore) {
            return bScore - aScore;
        }

        if (aScore === 2 && bScore === 2) {
            const aRange = getFullyBoundedDateRangeMs(a);
            const bRange = getFullyBoundedDateRangeMs(b);
            if (aRange !== undefined && bRange !== undefined && aRange !== bRange) {
                return aRange - bRange;
            }
        }

        const aStart = a.startDate ?? '';
        const bStart = b.startDate ?? '';
        if (aStart !== bStart) {
            return aStart < bStart ? 1 : -1;
        }

        const aIndex = a.index ?? CONST.DEFAULT_NUMBER_ID;
        const bIndex = b.index ?? CONST.DEFAULT_NUMBER_ID;
        return aIndex - bIndex;
    });

    return eligibleRates.at(0);
}

function getBestEligibleRateOrPolicyDefault(mileageRates: Record<string, MileageRate>, expenseDate: string, policy: OnyxEntry<Policy>): MileageRate | undefined {
    const bestRate = getBestEligibleRate(mileageRates, expenseDate);
    if (bestRate) {
        return bestRate;
    }

    return getDefaultMileageRate(policy);
}

/**
 * Returns custom unit rate ID for the distance transaction.
 * When an expenseDate is provided, uses date-aware rate selection:
 * 1. Last selected rate, if enabled and valid for the expense date
 * 2. Best eligible rate for the expense date
 * 3. Default rate fallback
 */
function getCustomUnitRateID({
    reportID,
    isPolicyExpenseChat,
    policy,
    isTrackDistanceExpense = false,
    lastSelectedDistanceRates,
    expenseDate,
}: {
    reportID: string | undefined;
    isPolicyExpenseChat: boolean;
    policy: OnyxEntry<Policy> | undefined;
    lastSelectedDistanceRates?: OnyxEntry<LastSelectedDistanceRates>;
    isTrackDistanceExpense?: boolean;
    expenseDate?: string;
}): string {
    const customUnitRateID: string = CONST.CUSTOM_UNITS.FAKE_P2P_ID;

    if (!reportID) {
        return customUnitRateID;
    }

    if (isEmptyObject(policy)) {
        return customUnitRateID;
    }

    // For TrackDistanceExpense we will return the default or last selected rate of the policyForMovingExpenses.
    if (isPolicyExpenseChat || isTrackDistanceExpense) {
        const distanceUnit = Object.values(policy.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
        const lastSelectedDistanceRateID = lastSelectedDistanceRates?.[policy.id];
        const lastSelectedDistanceRate = lastSelectedDistanceRateID ? distanceUnit?.rates[lastSelectedDistanceRateID] : undefined;

        if (!expenseDate) {
            if (lastSelectedDistanceRate?.enabled && lastSelectedDistanceRateID) {
                return lastSelectedDistanceRateID;
            }

            const defaultMileageRate = getDefaultMileageRate(policy);
            if (defaultMileageRate?.customUnitRateID) {
                return defaultMileageRate.customUnitRateID;
            }

            return customUnitRateID;
        }

        const mileageRates = getMileageRates(policy);
        if (lastSelectedDistanceRate?.enabled && lastSelectedDistanceRateID) {
            const lastSelectedMileageRate = mileageRates[lastSelectedDistanceRateID];
            // mileageRates may be empty when the distance unit has no attributes. Guard against undefined before calling isRateEligibleForDate, and preserve the user's last selected ID when rate metadata is unavailable.
            if (!lastSelectedMileageRate || isRateEligibleForDate(lastSelectedMileageRate, expenseDate)) {
                return lastSelectedDistanceRateID;
            }
        }

        const bestRate = getBestEligibleRateOrPolicyDefault(mileageRates, expenseDate, policy);
        if (bestRate?.customUnitRateID) {
            return bestRate.customUnitRateID;
        }
    }

    return customUnitRateID;
}

/**
 * Get taxable amount from a specific distance rate, taking into consideration the tax claimable amount configured for the distance rate
 */
function getTaxableAmount(policy: OnyxEntry<Policy>, customUnitRateID: string, distance: number) {
    const distanceUnit = getDistanceRateCustomUnit(policy);
    const customUnitRate = getDistanceRateCustomUnitRate(policy, customUnitRateID);
    if (!distanceUnit?.customUnitID || !customUnitRate) {
        return 0;
    }
    const unit = distanceUnit?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    const rate = customUnitRate?.rate ?? CONST.DEFAULT_NUMBER_ID;
    const amount = getDistanceRequestAmount(distance, unit, rate);
    const taxClaimablePercentage = customUnitRate.attributes?.taxClaimablePercentage ?? CONST.DEFAULT_NUMBER_ID;
    return amount * taxClaimablePercentage;
}

function getDistanceUnit(transaction: OnyxEntry<Transaction>, mileageRate: OnyxEntry<MileageRate>): Unit {
    return transaction?.comment?.customUnit?.distanceUnit ?? mileageRate?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
}

/** @private This is only for internal use for getRate function */
function getPersonalPolicy() {
    return Object.values(allPolicies ?? {}).find((policy) => policy?.type === CONST.POLICY.TYPE.PERSONAL);
}

/**
 * Get the selected rate for a transaction, from the policy or P2P default rate.
 * Use the distanceUnit stored on the transaction by default to prevent policy changes modifying existing transactions. Otherwise, get the unit from the rate.
 *
 * Let's ensure this logic is consistent with the logic in the backend (Auth), since we're using the same method to calculate the rate value in distance requests created via Concierge.
 */
function getRate({
    transaction,
    policy,
    policyDraft,
    useTransactionDistanceUnit = true,
    policyForMovingExpenses,
    isFakeP2PRate,
    isMovingTransactionFromTrackExpense,
    personalPolicyOutputCurrency,
}: {
    transaction: OnyxEntry<Transaction>;
    policy: OnyxEntry<Policy>;
    policyDraft?: OnyxEntry<Policy>;
    policyForMovingExpenses?: OnyxEntry<Policy>;
    useTransactionDistanceUnit?: boolean;
    isFakeP2PRate?: boolean;
    isMovingTransactionFromTrackExpense?: boolean;
    personalPolicyOutputCurrency?: string;
}): MileageRate {
    let mileageRates = getMileageRates(policy, true, transaction?.comment?.customUnit?.customUnitRateID);
    if (isEmptyObject(mileageRates) && policyDraft) {
        mileageRates = getMileageRates(policyDraft, true, transaction?.comment?.customUnit?.customUnitRateID);
    }
    const mileageRatesForMovingExpenses = getMileageRates(policyForMovingExpenses, true, transaction?.comment?.customUnit?.customUnitRateID);
    const policyCurrency = policy?.outputCurrency ?? personalPolicyOutputCurrency ?? getPersonalPolicy()?.outputCurrency ?? CONST.CURRENCY.USD;
    const isUnreportedExpense = isExpenseUnreported(transaction);
    const defaultMileageRate = getDefaultMileageRate(policy);
    const customUnitRateID = getRateID(transaction);
    const customMileageRate =
        (customUnitRateID && (mileageRates?.[customUnitRateID] ?? mileageRatesForMovingExpenses?.[customUnitRateID])) ||
        (isUnreportedExpense || isMovingTransactionFromTrackExpense ? undefined : defaultMileageRate);
    const mileageRate = isCustomUnitRateIDForP2P(transaction) || isFakeP2PRate ? getRateForP2P(policyCurrency, transaction) : customMileageRate;
    const unit = getDistanceUnit(useTransactionDistanceUnit ? transaction : undefined, mileageRate);
    return {
        ...mileageRate,
        unit,
        currency: mileageRate?.currency ?? policyCurrency,
    };
}

/**
 * Get the updated distance unit from the selected rate instead of the distanceUnit stored on the transaction.
 * Useful for updating the transaction distance unit when the distance or rate changes.
 *
 * For example, if an expense is '10 mi @ $1.00 / mi' and the rate is updated to '$1.00 / km',
 * then the updated distance unit should be 'km' from the updated rate, not 'mi' from the currently stored transaction distance unit.
 */
function getUpdatedDistanceUnit({
    transaction,
    policy,
    policyDraft,
    personalPolicyOutputCurrency,
}: {
    transaction: OnyxEntry<Transaction>;
    policy: OnyxEntry<Policy>;
    policyDraft?: OnyxEntry<Policy>;
    personalPolicyOutputCurrency?: string;
}) {
    return getRate({transaction, policy, policyDraft, useTransactionDistanceUnit: false, personalPolicyOutputCurrency}).unit;
}

/**
 * Get the mileage rate by its ID in the form it's configured for the policy.
 * If not found, return undefined.
 */
function getRateByCustomUnitRateID({customUnitRateID, policy}: {customUnitRateID: string; policy: OnyxEntry<Policy>}): MileageRate | undefined {
    return getMileageRates(policy, true, customUnitRateID)[customUnitRateID];
}

/**
 * Returns whether the selected custom unit rate is out of its valid date range for the given expense date.
 */
function isCustomUnitRateOutOfDateRange({
    customUnitRateID,
    policy,
    expenseDate,
}: {
    customUnitRateID: string | undefined;
    policy: OnyxEntry<Policy>;
    expenseDate: string | undefined;
}): boolean {
    if (!expenseDate || isUnsetDistanceCustomUnitRateID(customUnitRateID) || !policy?.customUnits || !customUnitRateID) {
        return false;
    }

    const mileageRate = getRateByCustomUnitRateID({customUnitRateID, policy});
    if (!mileageRate || mileageRate.enabled === false) {
        return false;
    }

    return !isRateEligibleForDate(mileageRate, expenseDate);
}

/**
 * Returns whether the calculated distance expense amount (distance * rate) is within the backend's safe limit.
 * The backend WAF rejects amounts exceeding 12 digits (999,999,999,999 cents).
 *
 * @param distance - The distance in the unit specified (km or mi), NOT meters
 * @param rate - The rate in cents per unit
 * @returns true if the amount is within limits, false if it would exceed the backend limit
 */
function isDistanceAmountWithinLimit(distance: number, rate: number): boolean {
    return Math.abs(roundDistanceAmount(distance, rate)) <= CONST.IOU.MAX_SAFE_AMOUNT;
}

/**
 * Normalize odometer text by standardizing locale digits and stripping all
 * non-numeric characters except the decimal point. fromLocaleDigit converts
 * each locale character to its standard equivalent (e.g. German ',' → '.'
 * for decimal, German '.' → ',' for group separator), so after conversion
 * dots are always decimals and commas are always group separators.
 * We then strip everything except digits and the standard decimal point.
 */
function normalizeOdometerText(text: string, fromLocaleDigit: (char: string) => string): string {
    const standardized = replaceAllDigits(text, fromLocaleDigit);
    const stripped = standardized.replaceAll(/[^0-9.]/g, '');
    // Remove redundant leading zeroes (e.g. "007" → "7", "000" → "0") but
    // keep a single zero before a decimal point (e.g. "0.5" stays "0.5").
    return stripped.replace(/^0+(?=\d)/, '');
}

/**
 * Prepare odometer input text for display by removing non-numeric characters
 * (except the decimal point, comma, and space — which serve as group or
 * decimal separators depending on locale) and stripping redundant leading zeroes.
 */
function prepareTextForDisplay(text: string): string {
    return text.replaceAll(/[^0-9., ]/g, '').replace(/^0+(?=\d)/, '');
}

function getRateDateLabel(rate: MileageRate, translate: LocaleContextProps['translate']): string {
    const dateFormat = CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT;

    try {
        if (rate.startDate && rate.endDate) {
            return translate('iou.rateValidDateRange', {
                startDate: format(parseISO(rate.startDate), dateFormat),
                endDate: format(parseISO(rate.endDate), dateFormat),
            });
        }
        if (rate.startDate) {
            return translate('iou.rateValidFrom', {startDate: format(parseISO(rate.startDate), dateFormat)});
        }
        if (rate.endDate) {
            return translate('iou.rateValidUntil', {endDate: format(parseISO(rate.endDate), dateFormat)});
        }
    } catch {
        return '';
    }

    return '';
}

export default {
    getDefaultMileageRate,
    getDistanceMerchant,
    getDistanceRequestAmount,
    getCommuterExclusionData,
    getFormattedRateValue,
    getMileageRates,
    getDistanceForDisplay,
    getFormattedDistanceInUnits,
    getRoundedDistanceInUnits,
    getRateForP2P,
    getCustomUnitRateID,
    convertToDistanceInMeters,
    getTaxableAmount,
    getDistanceUnit,
    getDistanceUnitLabel,
    getUpdatedDistanceUnit,
    getRate,
    getRateByCustomUnitRateID,
    getDistanceForDisplayLabel,
    convertDistanceUnit,
    getRateForExpenseDisplay,
    isDistanceAmountWithinLimit,
    normalizeOdometerText,
    prepareTextForDisplay,
    isCustomUnitRateOutOfDateRange,
    isRateEligibleForDate,
    isUnsetDistanceCustomUnitRateID,
    getBestEligibleRate,
    getRateDateLabel,
};

export type {MileageRate};
