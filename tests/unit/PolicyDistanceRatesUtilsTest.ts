import {isGovernmentRateUnmodified, validateTaxClaimableValue} from '@libs/PolicyDistanceRatesUtils';

import type {GovernmentRateSnapshot, Rate} from '@src/types/onyx/Policy';

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
    });
});
