import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {RateAndUnit} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LastSelectedDistanceRates, Report, Transaction} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import * as CurrencyUtils from './CurrencyUtils';
import * as PolicyUtils from './PolicyUtils';
import * as ReportUtils from './ReportUtils';
import * as TransactionUtils from './TransactionUtils';

type MileageRate = {
    customUnitRateID?: string;
    rate?: number;
    currency?: string;
    unit: Unit;
    name?: string;
};

let lastSelectedDistanceRates: OnyxEntry<LastSelectedDistanceRates> = {};
Onyx.connect({
    key: ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES,
    callback: (value) => {
        lastSelectedDistanceRates = value;
    },
});

let allReports: OnyxCollection<Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

const METERS_TO_KM = 0.001; // 1 kilometer is 1000 meters
const METERS_TO_MILES = 0.000621371; // There are approximately 0.000621371 miles in a meter

/**
 * Retrieves the default mileage rate based on a given policy.
 *
 * @param policy - The policy from which to extract the default mileage rate.
 *
 * @returns An object containing the rate and unit for the default mileage or null if not found.
 * @returns [rate] - The default rate for the mileage.
 * @returns [currency] - The currency associated with the rate.
 * @returns [unit] - The unit of measurement for the distance.
 */
function getDefaultMileageRate(policy: OnyxEntry<Policy> | EmptyObject): MileageRate | null {
    if (!policy?.customUnits) {
        return null;
    }

    const distanceUnit = PolicyUtils.getCustomUnit(policy);
    if (!distanceUnit?.rates) {
        return null;
    }

    const distanceRate = Object.values(distanceUnit.rates).find((rate) => rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE) ?? Object.values(distanceUnit.rates)[0];

    return {
        customUnitRateID: distanceRate.customUnitRateID,
        rate: distanceRate.rate,
        currency: distanceRate.currency,
        unit: distanceUnit.attributes.unit,
        name: distanceRate.name,
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
    return convertedDistance.toFixed(2);
}

/**
 * @param unit Unit that should be used to display the distance
 * @param rate Expensable amount allowed per unit
 * @param currency The currency associated with the rate
 * @param translate Translate function
 * @param toLocaleDigit Function to convert to localized digit
 * @returns A string that displays the rate used for expense calculation
 */
function getRateForDisplay(
    unit: Unit | undefined,
    rate: number | undefined,
    currency: string | undefined,
    translate: LocaleContextProps['translate'],
    toLocaleDigit: LocaleContextProps['toLocaleDigit'],
    isOffline?: boolean,
): string {
    if (isOffline && !rate) {
        return translate('iou.defaultRate');
    }
    if (!rate || !currency || !unit) {
        return translate('iou.fieldPending');
    }

    const singularDistanceUnit = unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.mile') : translate('common.kilometer');
    const formattedRate = PolicyUtils.getUnitRateValue(toLocaleDigit, {rate});
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const currencySymbol = CurrencyUtils.getCurrencySymbol(currency) || `${currency} `;

    return `${currencySymbol}${formattedRate} / ${singularDistanceUnit}`;
}

/**
 * @param hasRoute Whether the route exists for the distance expense
 * @param distanceInMeters Distance traveled
 * @param unit Unit that should be used to display the distance
 * @param rate Expensable amount allowed per unit
 * @param translate Translate function
 * @returns A string that describes the distance traveled
 */
function getDistanceForDisplay(hasRoute: boolean, distanceInMeters: number, unit: Unit | undefined, rate: number | undefined, translate: LocaleContextProps['translate']): string {
    if (!hasRoute || !rate || !unit || !distanceInMeters) {
        return translate('iou.fieldPending');
    }

    const distanceInUnits = getRoundedDistanceInUnits(distanceInMeters, unit);
    const distanceUnit = unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.miles') : translate('common.kilometers');
    const singularDistanceUnit = unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.mile') : translate('common.kilometer');
    const unitString = distanceInUnits === '1' ? singularDistanceUnit : distanceUnit;

    return `${distanceInUnits} ${unitString}`;
}

/**
 * @param hasRoute Whether the route exists for the distance expense
 * @param distanceInMeters Distance traveled
 * @param unit Unit that should be used to display the distance
 * @param rate Expensable amount allowed per unit
 * @param currency The currency associated with the rate
 * @param translate Translate function
 * @param toLocaleDigit Function to convert to localized digit
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
): string {
    if (!hasRoute || !rate) {
        return translate('iou.fieldPending');
    }

    const distanceInUnits = getDistanceForDisplay(hasRoute, distanceInMeters, unit, rate, translate);
    const ratePerUnit = getRateForDisplay(unit, rate, currency, translate, toLocaleDigit);

    return `${distanceInUnits} @ ${ratePerUnit}`;
}

/**
 * Retrieves the mileage rates for given policy.
 *
 * @param policy - The policy from which to extract the mileage rates.
 *
 * @returns An array of mileage rates or an empty array if not found.
 */
function getMileageRates(policy: OnyxEntry<Policy>): Record<string, MileageRate> {
    const mileageRates: Record<string, MileageRate> = {};

    if (!policy || !policy?.customUnits) {
        return mileageRates;
    }

    const distanceUnit = PolicyUtils.getCustomUnit(policy);
    if (!distanceUnit?.rates) {
        return mileageRates;
    }

    Object.entries(distanceUnit.rates).forEach(([rateID, rate]) => {
        mileageRates[rateID] = {
            rate: rate.rate,
            currency: rate.currency,
            unit: distanceUnit.attributes.unit,
            name: rate.name,
            customUnitRateID: rate.customUnitRateID,
        };
    });

    return mileageRates;
}

/**
 * Retrieves the rate and unit for a P2P distance expense for a given currency.
 *
 * @param currency
 * @returns The rate and unit in RateAndUnit object.
 */
function getRateForP2P(currency: string): RateAndUnit {
    return CONST.CURRENCY_TO_DEFAULT_MILEAGE_RATE[currency] ?? CONST.CURRENCY_TO_DEFAULT_MILEAGE_RATE.USD;
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
    const convertedDistance = convertDistanceUnit(distance, unit);
    const roundedDistance = parseFloat(convertedDistance.toFixed(2));
    return Math.round(roundedDistance * rate);
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
 * Returns custom unit rate ID for the distance transaction
 */
function getCustomUnitRateID(reportID: string) {
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ?? null;
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`] ?? null;
    const policy = PolicyUtils.getPolicy(report?.policyID ?? parentReport?.policyID ?? '');

    let customUnitRateID: string = CONST.CUSTOM_UNITS.FAKE_P2P_ID;

    if (ReportUtils.isPolicyExpenseChat(report) || ReportUtils.isPolicyExpenseChat(parentReport)) {
        customUnitRateID = lastSelectedDistanceRates?.[policy?.id ?? ''] ?? getDefaultMileageRate(policy)?.customUnitRateID ?? '';
    }

    return customUnitRateID;
}

function calculateTaxAmount(policy: OnyxEntry<Policy>, transaction: OnyxEntry<Transaction>, customUnitRateID: string) {
    const distanceUnit = PolicyUtils.getCustomUnit(policy);
    const customUnitID = distanceUnit?.customUnitID;
    if (!policy?.customUnits || !customUnitID) {
        return 0;
    }
    const policyCustomUnitRate = policy?.customUnits[customUnitID].rates[customUnitRateID];
    const unit = policy?.customUnits[customUnitID]?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    const rate = policyCustomUnitRate?.rate ?? 0;
    const distance = TransactionUtils.getDistance(transaction);
    const amount = getDistanceRequestAmount(distance, unit, rate);
    const taxClaimablePercentage = policyCustomUnitRate.attributes?.taxClaimablePercentage ?? 0;
    const taxRateExternalID = policyCustomUnitRate.attributes?.taxRateExternalID ?? '';
    const taxableAmount = amount * taxClaimablePercentage;
    const taxPercentage = TransactionUtils.getTaxValue(policy, transaction, taxRateExternalID) ?? '';
    return TransactionUtils.calculateTaxAmount(taxPercentage, taxableAmount);
}

export default {
    getDefaultMileageRate,
    getDistanceMerchant,
    getDistanceRequestAmount,
    getRateForDisplay,
    getMileageRates,
    getDistanceForDisplay,
    getRateForP2P,
    getCustomUnitRateID,
    convertToDistanceInMeters,
    calculateTaxAmount,
};

export type {MileageRate};
