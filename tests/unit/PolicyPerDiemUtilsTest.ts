import {getPerDiemAmountError, getPerDiemNameError} from '@libs/PolicyPerDiemUtils';

import CONST from '@src/CONST';

describe('PolicyPerDiemUtils', () => {
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
