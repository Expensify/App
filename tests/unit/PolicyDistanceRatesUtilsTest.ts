import {
    getDistanceExpenseTypeForPolicy,
    getExpectedUnitForCurrency,
    getGovernmentRateCountryForCurrency,
    getGovernmentRateCountryPhraseTranslationKey,
    isCurrencySupportedForAutoUpdate,
    isGovernmentRateUnmodified,
    isMapOrGPSRequired,
    validateTaxClaimableValue,
} from '@libs/PolicyDistanceRatesUtils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {GovernmentRateSnapshot, Rate} from '@src/types/onyx/Policy';

import createRandomPolicy from '../utils/collections/policies';
import {translateLocal} from '../utils/TestHelper';

describe('PolicyDistanceRatesUtils', () => {
    describe('validateTaxClaimableValue', () => {
        it('should return an error when taxClaimableValue is equal to tax rate', () => {
            // Given a tax claimable value inserted for a distance rate

            // When the taxClaimableValue is equal to the tax rate
            const validate = validateTaxClaimableValue({taxClaimableValue: '0.70'}, {rate: 70, customUnitRateID: ''}, translateLocal);
            // Then validateTaxClaimableValue will return an error.
            expect(validate.taxClaimableValue).toBeDefined();

            // When the taxClaimableValue is greater than the tax rate
            const validate2 = validateTaxClaimableValue({taxClaimableValue: '0.72'}, {rate: 70, customUnitRateID: ''}, translateLocal);
            // Then validateTaxClaimableValue will return an error.
            expect(validate2.taxClaimableValue).toBeDefined();

            // When the taxClaimableValue is less than the tax rate
            const validate3 = validateTaxClaimableValue({taxClaimableValue: '0.65'}, {rate: 70, customUnitRateID: ''}, translateLocal);
            // Then validateTaxClaimableValue will not return an error.
            expect(validate3.taxClaimableValue).toBeUndefined();
        });
    });

    describe('isGovernmentRateUnmodified', () => {
        const baseGovernmentRate = {
            sourceRateID: 'US_2026-01-01',
            rate: 72.5,
            startDate: '2026-01-01',
            endDate: '2026-12-31',
        };

        function buildRate(overrides: Partial<Rate> = {}, governmentRate: GovernmentRateSnapshot = baseGovernmentRate): Rate {
            return {
                customUnitRateID: 'rate1',
                rate: 72.5,
                startDate: '2026-01-01',
                endDate: '2026-12-31',
                attributes: {governmentRate},
                ...overrides,
            };
        }

        it('should return false when the rate has no government rate snapshot', () => {
            expect(isGovernmentRateUnmodified({customUnitRateID: 'rate1', rate: 72.5})).toBe(false);
            expect(isGovernmentRateUnmodified({customUnitRateID: 'rate1', rate: 72.5, attributes: {}})).toBe(false);
        });

        it('should return true when the rate amount, start date, and end date all match the snapshot', () => {
            expect(isGovernmentRateUnmodified(buildRate())).toBe(true);
        });

        it('should return false when the rate amount does not match the snapshot', () => {
            expect(isGovernmentRateUnmodified(buildRate({rate: 70}))).toBe(false);
        });

        it('should return false when the start date does not match the snapshot', () => {
            expect(isGovernmentRateUnmodified(buildRate({startDate: '2026-02-01'}))).toBe(false);
        });

        it('should return false when the end date does not match the snapshot', () => {
            expect(isGovernmentRateUnmodified(buildRate({endDate: '2026-11-30'}))).toBe(false);
        });

        it('should return true when the end date is omitted on both the rate and the snapshot', () => {
            const governmentRate = {sourceRateID: 'GB_2011-04-06', rate: 45, startDate: '2011-04-06'};
            expect(isGovernmentRateUnmodified(buildRate({rate: 45, startDate: '2011-04-06', endDate: undefined}, governmentRate))).toBe(true);
            expect(isGovernmentRateUnmodified(buildRate({rate: 45, startDate: '2011-04-06', endDate: null}, governmentRate))).toBe(true);
        });

        it('should return false when the end date is omitted on only one side', () => {
            // Snapshot has no end date but the rate does
            const openEndedGovernmentRate = {sourceRateID: 'GB_2011-04-06', rate: 45, startDate: '2011-04-06'};
            expect(isGovernmentRateUnmodified(buildRate({rate: 45, startDate: '2011-04-06', endDate: '2026-12-31'}, openEndedGovernmentRate))).toBe(false);

            // Snapshot has an end date but the rate does not
            expect(isGovernmentRateUnmodified(buildRate({endDate: null}))).toBe(false);
            expect(isGovernmentRateUnmodified(buildRate({endDate: undefined}))).toBe(false);
        });

        it('should return true when edited values are restored to match the snapshot', () => {
            const editedRate = buildRate({rate: 99});
            expect(isGovernmentRateUnmodified(editedRate)).toBe(false);
            expect(isGovernmentRateUnmodified({...editedRate, rate: baseGovernmentRate.rate})).toBe(true);
        });

        it('should return true when the restored amount differs only by floating-point noise from the cents conversion', () => {
            // Restoring 0.29 through the submit path stores `Number('0.29') * 100`, which yields 28.999999999999996 rather than 29.
            const governmentRate = {sourceRateID: 'US_2026-01-01', rate: 29, startDate: '2026-01-01', endDate: '2026-12-31'};
            expect(isGovernmentRateUnmodified(buildRate({rate: Number('0.29') * 100}, governmentRate))).toBe(true);
        });

        it('should return false when the snapshot is malformed and has no rate amount', () => {
            // A snapshot missing its rate amount alongside an unset rate must not be reported as unmodified.
            expect(isGovernmentRateUnmodified(buildRate({rate: undefined}, {sourceRateID: 'US_2026-01-01', startDate: '2026-01-01', endDate: '2026-12-31'}))).toBe(false);
        });
    });

    describe('getGovernmentRateCountryForCurrency', () => {
        it('should map each supported currency to the country that publishes its rates', () => {
            expect(getGovernmentRateCountryForCurrency('USD')).toBe('US');
            expect(getGovernmentRateCountryForCurrency('CAD')).toBe('CA');
            expect(getGovernmentRateCountryForCurrency('GBP')).toBe('GB');
            expect(getGovernmentRateCountryForCurrency('AUD')).toBe('AU');
        });

        it('should return undefined for an unsupported or missing currency', () => {
            expect(getGovernmentRateCountryForCurrency('NZD')).toBeUndefined();
            expect(getGovernmentRateCountryForCurrency('')).toBeUndefined();
            expect(getGovernmentRateCountryForCurrency(undefined)).toBeUndefined();
        });
    });

    describe('isCurrencySupportedForAutoUpdate', () => {
        it('should return true only for the supported currencies', () => {
            expect(isCurrencySupportedForAutoUpdate('USD')).toBe(true);
            expect(isCurrencySupportedForAutoUpdate('CAD')).toBe(true);
            expect(isCurrencySupportedForAutoUpdate('GBP')).toBe(true);
            expect(isCurrencySupportedForAutoUpdate('AUD')).toBe(true);
            expect(isCurrencySupportedForAutoUpdate('NZD')).toBe(false);
            expect(isCurrencySupportedForAutoUpdate(undefined)).toBe(false);
        });
    });

    describe('getExpectedUnitForCurrency', () => {
        it('should return the unit each government publishes its rates in', () => {
            expect(getExpectedUnitForCurrency('USD')).toBe('mi');
            expect(getExpectedUnitForCurrency('GBP')).toBe('mi');
            expect(getExpectedUnitForCurrency('CAD')).toBe('km');
            expect(getExpectedUnitForCurrency('AUD')).toBe('km');
        });

        it('should return undefined for an unsupported currency', () => {
            expect(getExpectedUnitForCurrency('NZD')).toBeUndefined();
        });
    });

    describe('getGovernmentRateCountryPhraseTranslationKey', () => {
        it('should return the country phrase key for a supported currency', () => {
            expect(getGovernmentRateCountryPhraseTranslationKey('USD')).toBe('workspace.distanceRates.governmentRateCountries.US');
            expect(getGovernmentRateCountryPhraseTranslationKey('GBP')).toBe('workspace.distanceRates.governmentRateCountries.GB');
        });

        it('should return undefined for an unsupported currency', () => {
            expect(getGovernmentRateCountryPhraseTranslationKey('NZD')).toBeUndefined();
        });
    });

    describe('isMapOrGPSRequired', () => {
        const buildPolicy = (policy: Partial<Policy>): Policy => ({...createRandomPolicy(0), ...policy});

        it('should return true when the workspace has the setting enabled', () => {
            expect(isMapOrGPSRequired(buildPolicy({requireMapOrGPS: true}))).toBe(true);
        });

        it('should return true when the workspace excludes commutes, even with the setting off', () => {
            const policy = buildPolicy({
                requireMapOrGPS: false,
                commuterExclusions: {method: 'fixedDistance', fixedDistance: 10, fixedDistanceUnit: 'mi'},
            });

            expect(isMapOrGPSRequired(policy)).toBe(true);
        });

        it('should return false when neither the setting nor commuter exclusions are set', () => {
            expect(isMapOrGPSRequired(buildPolicy({}))).toBe(false);
        });

        it('should return false without a policy', () => {
            expect(isMapOrGPSRequired(undefined)).toBe(false);
        });
    });

    describe('getDistanceExpenseTypeForPolicy', () => {
        const buildPolicy = (policy: Partial<Policy>): Policy => ({...createRandomPolicy(0), ...policy});

        it('should keep the remembered type when the workspace does not require GPS or map entry', () => {
            const policy = buildPolicy({requireMapOrGPS: false});

            expect(getDistanceExpenseTypeForPolicy(policy, CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL)).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL);
            expect(getDistanceExpenseTypeForPolicy(policy, CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER)).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER);
        });

        it('should fall back to map when the workspace starts requiring GPS or map entry', () => {
            const policy = buildPolicy({requireMapOrGPS: true});

            expect(getDistanceExpenseTypeForPolicy(policy, CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL)).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_MAP);
            expect(getDistanceExpenseTypeForPolicy(policy, CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER)).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_MAP);
        });

        it('should fall back to map when commuter exclusions require it', () => {
            const policy = buildPolicy({commuterExclusions: {method: 'fixedDistance', fixedDistance: 10, fixedDistanceUnit: 'mi'}});

            expect(getDistanceExpenseTypeForPolicy(policy, CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL)).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_MAP);
        });

        it('should leave map and GPS types untouched', () => {
            const policy = buildPolicy({requireMapOrGPS: true});

            expect(getDistanceExpenseTypeForPolicy(policy, CONST.IOU.REQUEST_TYPE.DISTANCE_MAP)).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_MAP);
            expect(getDistanceExpenseTypeForPolicy(policy, CONST.IOU.REQUEST_TYPE.DISTANCE_GPS)).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_GPS);
        });

        it('should pass through an unset preference', () => {
            expect(getDistanceExpenseTypeForPolicy(buildPolicy({requireMapOrGPS: true}), undefined)).toBeUndefined();
        });
    });
});
