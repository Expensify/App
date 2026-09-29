import {setWorkspaceDistanceAutoUpdate} from '@libs/actions/Policy/DistanceRate';
import {write} from '@libs/API';

import type {GovernmentMileageRate} from '@src/types/onyx';
import type {CustomUnit, Policy, Rate} from '@src/types/onyx/Policy';

import type {OnyxUpdate} from 'react-native-onyx';

jest.mock('@libs/API');
jest.mock('@libs/Log', () => ({warn: jest.fn(), alert: jest.fn(), hmmm: jest.fn()}));

const mockWrite = jest.mocked(write);

const policyID = 'policy123';
const customUnitID = 'unit1';

type OptimisticPolicyValue = Partial<Policy> & {customUnits?: Record<string, Partial<CustomUnit>>};

function getOnyxDataAt(index: number): {params: Record<string, unknown>; optimisticData: OnyxUpdate[]; successData: OnyxUpdate[]; failureData: OnyxUpdate[]} {
    const [command, params, onyxData] = mockWrite.mock.calls.at(index) ?? [];
    expect(command).toBeDefined();
    return {params: params as Record<string, unknown>, ...onyxData};
}

function getOptimisticPolicy(onyxData: {optimisticData?: OnyxUpdate[]}): OptimisticPolicyValue {
    return onyxData.optimisticData?.at(0)?.value as OptimisticPolicyValue;
}

function createGovernmentRate(sourceRateID: string, currency: string, rate = '0.30'): GovernmentMileageRate {
    return {
        sourceRateID,
        currency,
        rate,
        name: 'Government rate',
        enabled: true,
        startDate: '2026-01-01',
    };
}

function createCustomUnit(unit = 'mi'): CustomUnit {
    return {
        customUnitID,
        name: 'Distance',
        attributes: {unit},
        rates: {},
    };
}

describe('setWorkspaceDistanceAutoUpdate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('copies matching currency rates and corrects the unit when turning on for a non-shared currency', () => {
        const governmentMileageRates = [createGovernmentRate('US_2026', 'USD'), createGovernmentRate('GB_2026', 'GBP')];

        // The workspace was on km, while the US publishes its rates in miles
        setWorkspaceDistanceAutoUpdate(policyID, createCustomUnit('km'), true, governmentMileageRates, 'USD');

        const {params, optimisticData} = getOnyxDataAt(0);

        // No country is passed for a currency that maps to a single country
        expect(params.countryCode).toBeUndefined();

        const optimisticPolicy = getOptimisticPolicy({optimisticData});
        expect(optimisticPolicy.shouldAutoUpdateGovernmentDistanceRates).toBe(true);
        expect(optimisticPolicy.autoUpdateGovernmentRateCountry).toBeUndefined();

        const optimisticUnit = optimisticPolicy.customUnits?.[customUnitID];
        const copiedRates = Object.values(optimisticUnit?.rates ?? {});
        expect(copiedRates).toHaveLength(1);
        expect(copiedRates.at(0)?.attributes?.governmentRate?.sourceRateID).toBe('US_2026');
        expect(optimisticUnit?.attributes?.unit).toBe('mi');
    });

    it('only copies rates of the selected country when the currency is shared', () => {
        const governmentMileageRates = [createGovernmentRate('DE_2026', 'EUR'), createGovernmentRate('FR_2026', 'EUR'), createGovernmentRate('US_2026', 'USD')];

        setWorkspaceDistanceAutoUpdate(policyID, createCustomUnit(), true, governmentMileageRates, 'EUR', 'DE');

        const {params, optimisticData} = getOnyxDataAt(0);
        expect(params.countryCode).toBe('DE');

        const optimisticPolicy = getOptimisticPolicy({optimisticData});
        expect(optimisticPolicy.autoUpdateGovernmentRateCountry).toBe('DE');

        // EUR has no single country, so the unit comes from the passed country
        const optimisticUnit = optimisticPolicy.customUnits?.[customUnitID];
        const copiedRates = Object.values(optimisticUnit?.rates ?? {});
        expect(copiedRates).toHaveLength(1);
        expect(copiedRates.at(0)?.attributes?.governmentRate?.sourceRateID).toBe('DE_2026');
        expect(optimisticUnit?.attributes?.unit).toBe('km');
    });

    it('skips rates the policy already copied', () => {
        const existingRate: Rate = {
            customUnitRateID: 'rate1',
            name: 'Government rate',
            rate: '0.30',
            currency: 'EUR',
            enabled: true,
            attributes: {governmentRate: {sourceRateID: 'DE_2026'}},
        };
        const customUnit = createCustomUnit('mi');
        customUnit.rates = {rate1: existingRate};

        setWorkspaceDistanceAutoUpdate(policyID, customUnit, true, [createGovernmentRate('DE_2026', 'EUR')], 'EUR', 'DE');

        const {optimisticData} = getOnyxDataAt(0);
        const optimisticPolicy = getOptimisticPolicy({optimisticData});
        expect(Object.values(optimisticPolicy.customUnits?.[customUnitID]?.rates ?? {})).toHaveLength(0);
    });

    it('does not copy rates or correct the unit when turning the auto-update off', () => {
        setWorkspaceDistanceAutoUpdate(policyID, createCustomUnit(), false, [createGovernmentRate('US_2026', 'USD')], 'USD');

        const {params, optimisticData} = getOnyxDataAt(0);
        expect(params.shouldAutoUpdateGovernmentDistanceRates).toBe(false);

        const optimisticPolicy = getOptimisticPolicy({optimisticData});
        expect(optimisticPolicy.shouldAutoUpdateGovernmentDistanceRates).toBeNull();
        expect(optimisticPolicy.customUnits).toBeUndefined();
    });

    it('still writes the flag and country when the custom unit is not loaded yet', () => {
        setWorkspaceDistanceAutoUpdate(policyID, undefined, true, [createGovernmentRate('DE_2026', 'EUR')], 'EUR', 'DE');

        const {optimisticData} = getOnyxDataAt(0);
        const optimisticPolicy = getOptimisticPolicy({optimisticData});
        expect(optimisticPolicy.shouldAutoUpdateGovernmentDistanceRates).toBe(true);
        expect(optimisticPolicy.autoUpdateGovernmentRateCountry).toBe('DE');
        expect(optimisticPolicy.customUnits).toBeUndefined();
    });

    it('restores the previous country and keeps the flag on in the failure data of a country change', () => {
        setWorkspaceDistanceAutoUpdate(policyID, createCustomUnit(), true, [createGovernmentRate('DE_2026', 'EUR')], 'EUR', 'NL', 'DE');

        const {failureData} = getOnyxDataAt(0);
        const failurePolicy = failureData?.at(0)?.value as OptimisticPolicyValue;
        expect(failurePolicy.shouldAutoUpdateGovernmentDistanceRates).toBe(true);
        expect(failurePolicy.autoUpdateGovernmentRateCountry).toBe('DE');
    });

    it('clears the country in the failure data when turning on without a previous country', () => {
        setWorkspaceDistanceAutoUpdate(policyID, createCustomUnit(), true, [createGovernmentRate('DE_2026', 'EUR')], 'EUR', 'DE');

        const {failureData} = getOnyxDataAt(0);
        const failurePolicy = failureData?.at(0)?.value as OptimisticPolicyValue;
        expect(failurePolicy.autoUpdateGovernmentRateCountry).toBeNull();
    });
});
