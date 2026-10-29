/**
 * Tax tracking, tax-rate lookup, and renamed tax codes.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import CONST from '@src/CONST';
import type {Policy, TaxRate} from '@src/types/onyx';
import type {TaxRates} from '@src/types/onyx/Policy';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {getDistanceRateCustomUnit} from './customUnits';

type PolicyWithTaxRates = {
    taxRates?: {
        taxes?: TaxRates;
    };
};

function isTaxTrackingEnabled(
    isPolicyExpenseChatOrUnreportedExpense: boolean,
    policy: OnyxEntry<Policy>,
    isDistanceRequest: boolean,
    isPerDiemRequest = false,
    isTimeRequest = false,
): boolean {
    if (isPerDiemRequest || isTimeRequest) {
        return false;
    }
    const distanceUnit = getDistanceRateCustomUnit(policy);
    const customUnitID = distanceUnit?.customUnitID ?? CONST.DEFAULT_NUMBER_ID;
    const isPolicyTaxTrackingEnabled = isPolicyExpenseChatOrUnreportedExpense && policy?.tax?.trackingEnabled;
    const isTaxEnabledForDistance = isPolicyTaxTrackingEnabled && !!customUnitID && policy?.customUnits?.[customUnitID]?.attributes?.taxEnabled;

    return !!(isDistanceRequest ? isTaxEnabledForDistance : isPolicyTaxTrackingEnabled);
}

/** Get a tax with given ID from policy */
function getTaxByID(policy: OnyxEntry<Policy>, taxID: string): TaxRate | undefined {
    return policy?.taxRates?.taxes?.[taxID];
}

/** Get a tax rate object built like Record<TaxRateName, RelatedTaxRateKeys>.
 * We want to allow user to choose over TaxRateName and there might be a situation when one TaxRateName has two possible keys in different policies */
function getAllTaxRatesNamesAndKeys(policies: OnyxCollection<Pick<Policy, 'taxRates'>>): Record<string, string[]> {
    const allTaxRates: Record<string, string[]> = {};
    const seenKeys: Record<string, Set<string>> = {};

    for (const policy of Object.values(policies ?? {})) {
        if (!policy?.taxRates?.taxes) {
            continue;
        }

        for (const [taxRateKey, taxRate] of Object.entries(policy?.taxRates?.taxes ?? {})) {
            if (!allTaxRates[taxRate.name]) {
                allTaxRates[taxRate.name] = [taxRateKey];
                seenKeys[taxRate.name] = new Set([taxRateKey]);
                continue;
            }
            if (seenKeys[taxRate.name].has(taxRateKey)) {
                continue;
            }
            seenKeys[taxRate.name].add(taxRateKey);
            allTaxRates[taxRate.name].push(taxRateKey);
        }
    }

    return allTaxRates;
}

/** Get a tax rate object built like Record<TaxID, TaxRate> */
function getAllTaxRatesNamesAndValues(policies: OnyxCollection<Policy>): Record<string, TaxRate> {
    const allTaxRates: Record<string, TaxRate> = {};

    for (const policy of Object.values(policies ?? {})) {
        if (!policy?.taxRates?.taxes) {
            continue;
        }

        for (const [taxRateKey, taxRate] of Object.entries(policy?.taxRates?.taxes ?? {})) {
            if (!allTaxRates[taxRateKey]) {
                allTaxRates[taxRateKey] = taxRate;
            }
        }
    }

    return allTaxRates;
}

/**
 * Whether the tax rate can be deleted and disabled
 */
function canDisableOrDeleteTaxRate(policy: Policy, taxID: string): boolean {
    return policy.taxRates?.defaultExternalID !== taxID && policy.taxRates?.foreignTaxDefault !== taxID;
}

function getCurrentTaxID(policy: OnyxEntry<PolicyWithTaxRates>, taxID: string): string | undefined {
    const taxes = policy?.taxRates?.taxes;

    // A rate that currently owns the code always wins. This is what keeps a code that was renamed away and later
    // reused by a brand new rate resolving to that new rate instead of to the rate it was renamed into.
    if (taxes?.[taxID]) {
        return taxID;
    }

    return Object.keys(taxes ?? {}).find((taxIDKey) => {
        const taxRate = taxes?.[taxIDKey];
        return (
            // Set only while a rename is in flight, so renamed codes still resolve offline before the API responds.
            taxRate?.optimisticPreviousTaxCode === taxID ||
            // The rename history the back-end persists. previousTaxCode holds only the most recent old code, so it is
            // checked as well to cover rates renamed before the back-end started returning the full chain.
            taxRate?.previousTaxCode === taxID ||
            !!taxRate?.previousTaxCodes?.includes(taxID)
        );
    });
}

/**
 * Resolves a renamed tax code to the current policy tax key.
 */
function resolveCurrentTaxCode(policy: OnyxEntry<PolicyWithTaxRates>, taxCode: string): string {
    return getCurrentTaxID(policy, taxCode) ?? taxCode;
}

/**
 * Whether a tax code still points to a rate the user can pick. A disabled or pending-delete rate still resolves, but
 * it is no longer an option, so it counts the same as a removed rate.
 */
function isSelectableTaxCode(policy: OnyxEntry<Policy>, taxCode: string | undefined): boolean {
    if (!taxCode) {
        return false;
    }
    const taxRate = getTaxByID(policy, resolveCurrentTaxCode(policy, taxCode));
    return !!taxRate && !taxRate.isDisabled && taxRate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

function isPolicyTaxEnabled(policy: OnyxEntry<Policy>): boolean {
    const isSyncTaxEnabled =
        !!policy?.connections?.quickbooksOnline?.config?.syncTax ||
        !!policy?.connections?.xero?.config?.importTaxRates ||
        !!policy?.connections?.netsuite?.options?.config?.syncOptions?.syncTax;

    return (policy?.tax?.trackingEnabled ?? false) || isSyncTaxEnabled;
}

/**
 * Determines whether the tax code was explicitly defined by the user.
 * Returns `true` only when the `previousTaxCode` field contains a value
 */
function isTaxCodeCustomized(taxCode: string | undefined, policy: OnyxEntry<Policy>) {
    if (!taxCode || !policy) {
        return false;
    }

    const currentTaxRate = policy?.taxRates?.taxes?.[taxCode];
    return !!currentTaxRate && !!currentTaxRate.previousTaxCode;
}

export {
    isTaxTrackingEnabled,
    getTaxByID,
    getAllTaxRatesNamesAndValues,
    canDisableOrDeleteTaxRate,
    getCurrentTaxID,
    resolveCurrentTaxCode,
    isSelectableTaxCode,
    isPolicyTaxEnabled,
    isTaxCodeCustomized,
};
export {getAllTaxRatesNamesAndKeys as getAllTaxRates};
