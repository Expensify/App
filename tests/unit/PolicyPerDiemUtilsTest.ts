import {getAvailablePerDiemRate, getPerDiemAmountError, getPerDiemNameError} from '@libs/PolicyPerDiemUtils';

import CONST from '@src/CONST';
import type {Rate} from '@src/types/onyx/Policy';

describe('PolicyPerDiemUtils', () => {
    describe('getAvailablePerDiemRate', () => {
        const rate: Rate = {
            customUnitRateID: 'london',
            name: 'London',
            currency: 'GBP',
            subRates: [
                {id: 'breakfast', name: 'Breakfast', rate: 1000, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                {id: 'lunch', name: 'Lunch', rate: 2000, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            ],
        };

        it('excludes pending deletions from selectable and editable subrates without modifying Onyx data', () => {
            // Given Breakfast is retained for offline deletion feedback alongside an available sibling
            // When expense pickers or workspace edit pages look up the available rate
            const availableRate = getAvailablePerDiemRate(rate);

            // Then Breakfast cannot be found or counted, while Lunch remains available and the stored rate is unchanged
            expect(availableRate?.subRates).toEqual([rate.subRates?.[1]]);
            expect(availableRate?.subRates?.find(({id}) => id === 'breakfast')).toBeUndefined();
            expect(rate.subRates).toHaveLength(2);
            expect(getAvailablePerDiemRate(rate, true)).toBe(rate);
        });

        it('excludes an entire pending destination even when a child has its own pending edit', () => {
            // Given the whole destination is now queued for deletion
            const deletedRate = {...rate, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};

            // When expense or edit flows read it
            const availableRate = getAvailablePerDiemRate(deletedRate);

            // Then neither the destination nor any child is available, but the offline workspace can still display it
            expect(availableRate).toBeUndefined();
            expect(getAvailablePerDiemRate(deletedRate, true)).toBe(deletedRate);
            expect(getAvailablePerDiemRate(undefined)).toBeUndefined();
        });
    });

    describe('getPerDiemNameError', () => {
        it('should return required when the name is empty or only whitespace', () => {
            expect(getPerDiemNameError('')).toBe(CONST.INPUT_VALIDATION_ERRORS.REQUIRED);
            expect(getPerDiemNameError('   ')).toBe(CONST.INPUT_VALIDATION_ERRORS.REQUIRED);
            expect(getPerDiemNameError('\u200B')).toBe(CONST.INPUT_VALIDATION_ERRORS.REQUIRED);
        });

        it('should return tooLong when the name exceeds the character limit', () => {
            const tooLongName = 'a'.repeat(CONST.MAX_LENGTH_256 + 1);
            expect(getPerDiemNameError(tooLongName)).toBe(CONST.INPUT_VALIDATION_ERRORS.TOO_LONG);
        });

        it('should accept a name within the character limit', () => {
            expect(getPerDiemNameError('Paris')).toBeUndefined();
        });

        it('flags an HTML-like name the Name page already rejects', () => {
            // Given a destination or subrate the admin is renaming from the table
            // When the new name is an HTML-like token such as </>
            // Then the name is invalid, because the Name page blocks it and the table must not save it
            expect(getPerDiemNameError('</>')).toBe(CONST.INPUT_VALIDATION_ERRORS.INVALID);
        });

        it('allows a whitelisted angle-bracket token', () => {
            // Given a destination or subrate the admin is renaming
            // When the new name is a harmless token the Name page already allows, such as <>
            // Then the name is valid, so the table and the Name page stay in agreement
            expect(getPerDiemNameError('<>')).toBeUndefined();
        });
    });

    describe('getPerDiemAmountError', () => {
        it('should return required when the amount is empty or a lone minus sign', () => {
            expect(getPerDiemAmountError('')).toBe(CONST.INPUT_VALIDATION_ERRORS.REQUIRED);
            expect(getPerDiemAmountError('   ')).toBe(CONST.INPUT_VALIDATION_ERRORS.REQUIRED);
            expect(getPerDiemAmountError('-')).toBe(CONST.INPUT_VALIDATION_ERRORS.REQUIRED);
        });

        it('should return required when the amount is zero or not a number', () => {
            expect(getPerDiemAmountError('0')).toBe(CONST.INPUT_VALIDATION_ERRORS.REQUIRED);
            expect(getPerDiemAmountError('0.00')).toBe(CONST.INPUT_VALIDATION_ERRORS.REQUIRED);
            expect(getPerDiemAmountError('abc')).toBe(CONST.INPUT_VALIDATION_ERRORS.REQUIRED);
        });

        it('should accept a positive or negative non-zero amount', () => {
            expect(getPerDiemAmountError('50')).toBeUndefined();
            expect(getPerDiemAmountError('50.00')).toBeUndefined();
            expect(getPerDiemAmountError('-10.50')).toBeUndefined();
        });
    });
});
