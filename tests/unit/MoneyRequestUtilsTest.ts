import {isValidPerDiemExpenseAmount} from '@libs/actions/IOU';
import {handleNegativeAmountFlipping, validateAmount, validatePercentage} from '@libs/MoneyRequestUtils';
import CONST from '@src/CONST';
import type {TransactionCustomUnit} from '@src/types/onyx/Transaction';

describe('ReportActionsUtils', () => {
    describe('validateAmount', () => {
        it('should pass the validation when amount is within the max digit and decimal', () => {
            expect(validateAmount('12345678', 2, 8)).toBe(true);
            expect(validateAmount('12345678', 0, 8)).toBe(true);
            expect(validateAmount('12345678.12', 2, 8)).toBe(true);
            expect(validateAmount('1234567.1', 2, 8)).toBe(true);
            expect(validateAmount('12345678.123', 3, 8)).toBe(true);
            expect(validateAmount('1234.1234', 4, 4)).toBe(true);
        });

        it("shouldn't pass the validation when amount is bigger than the max digit and decimal", () => {
            expect(validateAmount('12345678.123', 2, 8)).toBe(false);
            expect(validateAmount('12345678.1', 0, 8)).toBe(false);
            expect(validateAmount('123456789.12', 2, 8)).toBe(false);
            expect(validateAmount('123456789.1234', 3, 8)).toBe(false);
            expect(validateAmount('1234.12345', 4, 4)).toBe(false);
        });
    });

    describe('validatePercentage', () => {
        it('defaults to allowing whole numbers between 0 and 100', () => {
            expect(validatePercentage('')).toBe(true);
            expect(validatePercentage('0')).toBe(true);
            expect(validatePercentage('10')).toBe(true);
            expect(validatePercentage('99')).toBe(true);
            expect(validatePercentage('100')).toBe(true);

            expect(validatePercentage('150')).toBe(false);
            expect(validatePercentage('101')).toBe(false);
        });

        it('allows digit-only values above 100 when allowExceedingHundred is true', () => {
            expect(validatePercentage('', true)).toBe(true);
            expect(validatePercentage('0', true)).toBe(true);
            expect(validatePercentage('100', true)).toBe(true);
            expect(validatePercentage('150', true)).toBe(true);
        });

        it('rejects non-numeric characters even when allowExceedingHundred is true', () => {
            expect(validatePercentage('1.5', true)).toBe(false);
            expect(validatePercentage('abc', true)).toBe(false);
            expect(validatePercentage('10%', true)).toBe(false);
            expect(validatePercentage('-10', true)).toBe(false);
        });

        it('allows one decimal place when allowDecimal is true', () => {
            // Valid decimal percentages
            expect(validatePercentage('7.5', false, true)).toBe(true);
            expect(validatePercentage('0.1', false, true)).toBe(true);
            expect(validatePercentage('99.9', false, true)).toBe(true);
            expect(validatePercentage('100.0', false, true)).toBe(true);
            expect(validatePercentage('50', false, true)).toBe(true);
            expect(validatePercentage('', false, true)).toBe(true);

            // Invalid: more than one decimal place
            expect(validatePercentage('7.55', false, true)).toBe(false);
            expect(validatePercentage('100.01', false, true)).toBe(false);

            // Invalid: over 100
            expect(validatePercentage('100.1', false, true)).toBe(false);
            expect(validatePercentage('150', false, true)).toBe(false);
        });

        it('allows decimals and exceeding 100 when both flags are true', () => {
            expect(validatePercentage('150.5', true, true)).toBe(true);
            expect(validatePercentage('7.5', true, true)).toBe(true);
            expect(validatePercentage('200', true, true)).toBe(true);
            expect(validatePercentage('.5', true, true)).toBe(true);

            // Invalid: more than one decimal place
            expect(validatePercentage('7.55', true, true)).toBe(false);
            expect(validatePercentage('abc', true, true)).toBe(false);
        });

        it('accepts comma as decimal separator for locale support (e.g., Spanish)', () => {
            // With allowDecimal=true and comma separator
            expect(validatePercentage('7,5', false, true)).toBe(true);
            expect(validatePercentage('0,1', false, true)).toBe(true);
            expect(validatePercentage('99,9', false, true)).toBe(true);
            expect(validatePercentage('100,0', false, true)).toBe(true);

            // With allowExceedingHundred=true and allowDecimal=true
            expect(validatePercentage('150,5', true, true)).toBe(true);
            expect(validatePercentage('7,5', true, true)).toBe(true);
            expect(validatePercentage(',5', true, true)).toBe(true);

            // Invalid: more than one decimal place with comma
            expect(validatePercentage('7,55', true, true)).toBe(false);
            expect(validatePercentage('100,01', false, true)).toBe(false);

            // Invalid: mixed comma and period (should not accept both)
            expect(validatePercentage('7,5.5', true, true)).toBe(false);
            expect(validatePercentage('7.5,5', true, true)).toBe(false);
            expect(validatePercentage('1,234.56', true, true)).toBe(false);
            expect(validatePercentage('1.234,56', true, true)).toBe(false);
            expect(validatePercentage('10,5.0', false, true)).toBe(false);
        });
    });

    describe('handleNegativeAmountFlipping', () => {
        it('should toggle negative and remove dash when allowFlippingAmount is true and amount starts with -', () => {
            const mockToggleNegative = jest.fn();
            const result = handleNegativeAmountFlipping('-123.45', true, mockToggleNegative);

            expect(mockToggleNegative).toHaveBeenCalledTimes(1);
            expect(result).toBe('123.45');
        });

        it('should not toggle negative when allowFlippingAmount is false', () => {
            const mockToggleNegative = jest.fn();
            const result = handleNegativeAmountFlipping('-123.45', false, mockToggleNegative);

            expect(mockToggleNegative).not.toHaveBeenCalled();
            expect(result).toBe('-123.45');
        });

        it('should not toggle negative when amount does not start with -', () => {
            const mockToggleNegative = jest.fn();
            const result = handleNegativeAmountFlipping('123.45', true, mockToggleNegative);

            expect(mockToggleNegative).not.toHaveBeenCalled();
            expect(result).toBe('123.45');
        });

        it('should work without toggleNegative function', () => {
            const result = handleNegativeAmountFlipping('-123.45', true);

            expect(result).toBe('123.45');
        });

        it('should return original amount when allowFlippingAmount is false and no dash', () => {
            const mockToggleNegative = jest.fn();
            const result = handleNegativeAmountFlipping('123.45', false, mockToggleNegative);

            expect(mockToggleNegative).not.toHaveBeenCalled();
            expect(result).toBe('123.45');
        });

        it('should handle empty string', () => {
            const mockToggleNegative = jest.fn();
            const result = handleNegativeAmountFlipping('', true, mockToggleNegative);

            expect(mockToggleNegative).not.toHaveBeenCalled();
            expect(result).toBe('');
        });

        it('should handle string with only dash', () => {
            const mockToggleNegative = jest.fn();
            const result = handleNegativeAmountFlipping('-', true, mockToggleNegative);

            expect(mockToggleNegative).toHaveBeenCalledTimes(1);
            expect(result).toBe('');
        });
    });

    describe('isValidPerDiemExpenseAmount', () => {
        it('should return true when per diem amount is within AMOUNT_MAX_LENGTH', () => {
            const customUnit: TransactionCustomUnit = {
                subRates: [
                    {id: 'rate1', name: 'Breakfast', quantity: 2, rate: 1500}, // 2 * $15.00 = $30.00
                ],
            };

            expect(isValidPerDiemExpenseAmount(customUnit, CONST.CURRENCY.USD, 2)).toBe(true);
        });

        it('should return false when when per diem amount exceeds AMOUNT_MAX_LENGTH', () => {
            const customUnit: TransactionCustomUnit = {
                subRates: [
                    {id: 'rate1', name: 'Breakfast', quantity: 1000, rate: 12345678}, // 1000 * $123,456.78 = $123,456,780.00
                ],
            };

            expect(isValidPerDiemExpenseAmount(customUnit, CONST.CURRENCY.USD, 2)).toBe(false);
        });

        it('should return true when per diem expense has negative rate', () => {
            const customUnit: TransactionCustomUnit = {
                subRates: [{id: 'rate1', name: 'Breakfast', quantity: 1, rate: -1500}],
            };

            expect(isValidPerDiemExpenseAmount(customUnit, CONST.CURRENCY.USD, 2)).toBe(true);
        });
    });
});
