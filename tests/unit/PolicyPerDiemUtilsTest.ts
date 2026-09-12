import {getPerDiemAmountError, getPerDiemNameError} from '@libs/PolicyPerDiemUtils';

import CONST from '@src/CONST';

describe('PolicyPerDiemUtils', () => {
    describe('getPerDiemNameError', () => {
        it('should return required when the name is empty or only whitespace', () => {
            expect(getPerDiemNameError('')).toBe('required');
            expect(getPerDiemNameError('   ')).toBe('required');
        });

        it('should return tooLong when the name exceeds the character limit', () => {
            const tooLongName = 'a'.repeat(CONST.MAX_LENGTH_256 + 1);
            expect(getPerDiemNameError(tooLongName)).toBe('tooLong');
        });

        it('should accept a name within the character limit', () => {
            expect(getPerDiemNameError('Paris')).toBeUndefined();
        });
    });

    describe('getPerDiemAmountError', () => {
        it('should return required when the amount is empty or a lone minus sign', () => {
            expect(getPerDiemAmountError('')).toBe('required');
            expect(getPerDiemAmountError('   ')).toBe('required');
            expect(getPerDiemAmountError('-')).toBe('required');
        });

        it('should return required when the amount is zero or not a number', () => {
            expect(getPerDiemAmountError('0')).toBe('required');
            expect(getPerDiemAmountError('0.00')).toBe('required');
            expect(getPerDiemAmountError('abc')).toBe('required');
        });

        it('should accept a positive or negative non-zero amount', () => {
            expect(getPerDiemAmountError('50')).toBeUndefined();
            expect(getPerDiemAmountError('50.00')).toBeUndefined();
            expect(getPerDiemAmountError('-10.50')).toBeUndefined();
        });
    });
});
