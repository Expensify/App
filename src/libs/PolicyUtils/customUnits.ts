/**
 * Distance and per diem custom units, rate display, and the units copied when a workspace is duplicated.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import CONST from '@src/CONST';
import type {Policy, Transaction} from '@src/types/onyx';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {isControlPolicy} from './policyType';

function getNumericValue(value: number | string, toLocaleDigit: (arg: string) => string): number | string {
    const numValue = parseFloat(value.toString().replace(toLocaleDigit('.'), '.'));
    if (Number.isNaN(numValue)) {
        return NaN;
    }
    // Rounding to 4 decimal places
    return parseFloat(numValue.toFixed(CONST.MAX_TAX_RATE_DECIMAL_PLACES));
}

/**
 * Retrieves the distance custom unit object for the given policy
 */
function getDistanceRateCustomUnit(policy: OnyxEntry<Policy>): CustomUnit | undefined {
    return Object.values(policy?.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
}

/**
 * Retrieves the per diem custom unit object for the given policy
 */
function getPerDiemCustomUnit(policy: OnyxEntry<Policy>): CustomUnit | undefined {
    return Object.values(policy?.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL);
}

/**
 * Whether Per Diem is enabled for the policy. Respects an explicit `arePerDiemRatesEnabled` toggle
 * (true/false) and only falls back to the configured Per Diem custom unit when the flag was never
 * provided (e.g. for migrated members), mirroring `canSubmitPerDiemExpenseFromWorkspace`.
 */
function isPerDiemEnabled(policy: OnyxEntry<Policy>): boolean {
    return policy?.arePerDiemRatesEnabled ?? !!getPerDiemCustomUnit(policy)?.enabled;
}

// Per Diem is Control-only, so both checks travel together - keep one definition or counts and pickers drift
function isPerDiemEligiblePolicy(policy: OnyxEntry<Policy>): boolean {
    return isControlPolicy(policy) && isPerDiemEnabled(policy);
}

/**
 * Finds a policy that contains the customUnitID from the transaction
 */
function getPolicyByCustomUnitID(transaction: OnyxEntry<Transaction>, policies: OnyxCollection<Policy>): OnyxEntry<Policy> {
    const customUnitID = transaction?.comment?.customUnit?.customUnitID;

    if (!customUnitID || !policies) {
        return undefined;
    }

    return Object.values(policies).find((policy) => {
        if (!policy?.customUnits || !isPerDiemEnabled(policy)) {
            return false;
        }
        return customUnitID in policy.customUnits;
    });
}

/**
 * Retrieves custom unit rate object from the given customUnitRateID
 */
function getDistanceRateCustomUnitRate(policy: OnyxEntry<Policy>, customUnitRateID: string): Rate | undefined {
    const distanceUnit = getDistanceRateCustomUnit(policy);
    return distanceUnit?.rates[customUnitRateID];
}

/**
 * Finds the policy that owns the given distance customUnitRateID.
 */
function getPolicyForDistanceRateID(customUnitRateID: string | undefined, policies: OnyxCollection<Policy>): OnyxEntry<Policy> {
    if (!customUnitRateID || !policies) {
        return undefined;
    }

    return Object.values(policies).find((policy) => {
        const distanceUnit = getDistanceRateCustomUnit(policy);
        return !!distanceUnit?.rates && customUnitRateID in distanceUnit.rates;
    });
}

/** Gives the unit and each of its rates the new IDs the duplicate uses. A rate missing from the map keeps its ID. */
function cloneCustomUnitWithNewIDs(unit: CustomUnit, newCustomUnitID: string, newRateIDsBySourceRateID: Record<string, string>): CustomUnit {
    const rates: Record<string, Rate> = {};
    for (const rate of Object.values(unit.rates)) {
        const newRateID = newRateIDsBySourceRateID[rate.customUnitRateID] ?? rate.customUnitRateID;
        rates[newRateID] = {...rate, customUnitRateID: newRateID};
    }
    return {
        ...unit,
        customUnitID: newCustomUnitID,
        rates,
    };
}

function getCustomUnitsForDuplication(
    policy: Policy,
    isDistanceRatesOptionSelected: boolean,
    isPerDiemOptionSelected: boolean,
    customUnitIDs: {
        distanceCustomUnitID: string;
        perDiemCustomUnitID: string;
        rateIDsBySourceRateID: Record<string, string>;
    },
): Record<string, CustomUnit> | undefined {
    const customUnits = policy?.customUnits;
    const {distanceCustomUnitID, perDiemCustomUnitID, rateIDsBySourceRateID} = customUnitIDs ?? {};

    if ((!isDistanceRatesOptionSelected && !isPerDiemOptionSelected) || !customUnits || Object.keys(customUnits).length === 0) {
        return undefined;
    }

    const getUnitWithoutPendingDeleteRates = (customUnit: CustomUnit | undefined, customUnitID: string) => {
        if (!customUnit) {
            return undefined;
        }
        return {
            ...customUnit,
            customUnitID,
            rates: Object.fromEntries(Object.entries(customUnit.rates).filter(([, rate]) => rate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)),
        };
    };

    const distanceCustomUnit = getUnitWithoutPendingDeleteRates(
        Object.values(customUnits).find((customUnit) => customUnit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE),
        distanceCustomUnitID,
    );
    const perDiemUnit = getUnitWithoutPendingDeleteRates(
        Object.values(customUnits).find((customUnit) => customUnit.name === CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL),
        perDiemCustomUnitID,
    );

    if (isDistanceRatesOptionSelected && isPerDiemOptionSelected) {
        if (!perDiemUnit || !distanceCustomUnit || !perDiemCustomUnitID || !distanceCustomUnitID) {
            return undefined;
        }

        return {
            [distanceCustomUnitID]: cloneCustomUnitWithNewIDs(distanceCustomUnit, distanceCustomUnitID, rateIDsBySourceRateID),
            [perDiemCustomUnitID]: cloneCustomUnitWithNewIDs(perDiemUnit, perDiemCustomUnitID, rateIDsBySourceRateID),
        };
    }

    if (isDistanceRatesOptionSelected && distanceCustomUnitID) {
        if (!distanceCustomUnit) {
            return undefined;
        }
        return {
            [distanceCustomUnitID]: cloneCustomUnitWithNewIDs(distanceCustomUnit, distanceCustomUnitID, rateIDsBySourceRateID),
        };
    }

    if (!perDiemUnit || !perDiemCustomUnitID) {
        return undefined;
    }
    return {
        [perDiemCustomUnitID]: cloneCustomUnitWithNewIDs(perDiemUnit, perDiemCustomUnitID, rateIDsBySourceRateID),
    };
}

/**
 * Retrieves custom unit rate object from the given customUnitRateID
 */
function getPerDiemRateCustomUnitRate(policy: OnyxEntry<Policy>, customUnitRateID: string): Rate | undefined {
    const perDiemUnit = getPerDiemCustomUnit(policy);
    return perDiemUnit?.rates[customUnitRateID];
}

function getRateDisplayValue(value: number, toLocaleDigit: (arg: string) => string, withDecimals?: boolean): string {
    const numValue = getNumericValue(value, toLocaleDigit);
    if (Number.isNaN(numValue)) {
        return '';
    }

    if (withDecimals) {
        const decimalPart = numValue.toString().split('.').at(1) ?? '';
        // Set the fraction digits to be between 2 and 4 (OD Behavior)
        const fractionDigits = Math.min(Math.max(decimalPart.length, CONST.MIN_TAX_RATE_DECIMAL_PLACES), CONST.MAX_TAX_RATE_DECIMAL_PLACES);
        return Number(numValue).toFixed(fractionDigits).toString().replace('.', toLocaleDigit('.'));
    }

    return numValue.toString().replace('.', toLocaleDigit('.')).substring(0, value.toString().length);
}

function getUnitRateValue(toLocaleDigit: (arg: string) => string, customUnitRate?: Partial<Rate>, withDecimals?: boolean) {
    return getRateDisplayValue((customUnitRate?.rate ?? 0) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET, toLocaleDigit, withDecimals);
}

/**
 * Takes removes pendingFields and errorFields from a customUnit
 */
function removePendingFieldsFromCustomUnit(customUnit: CustomUnit): CustomUnit {
    const cleanedCustomUnit = {...customUnit};

    delete cleanedCustomUnit.pendingFields;
    delete cleanedCustomUnit.errorFields;

    return cleanedCustomUnit;
}

export {
    getDistanceRateCustomUnit,
    getPerDiemCustomUnit,
    isPerDiemEnabled,
    isPerDiemEligiblePolicy,
    getPolicyByCustomUnitID,
    getDistanceRateCustomUnitRate,
    getPolicyForDistanceRateID,
    getCustomUnitsForDuplication,
    getPerDiemRateCustomUnitRate,
    getRateDisplayValue,
    getUnitRateValue,
    removePendingFieldsFromCustomUnit,
};
