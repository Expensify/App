import {computePerDiemExpenseAmount} from '@libs/actions/IOU';
import {convertToFrontendAmountAsString, getCurrencyDecimals} from '@libs/CurrencyUtils';
import {handleNegativeAmountFlipping, validateAmount} from '@libs/MoneyRequestUtils';
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

    describe('Per Diem Amount Validation', () => {
        it('should validate per diem amount correctly when amount is within limits', () => {
            const customUnit: TransactionCustomUnit = {
                subRates: [
                    {id: 'rate1', name: 'Breakfast', quantity: 2, rate: 5000}, // 2 * $50.00 = $100.00
                    {id: 'rate2', name: 'Lunch', quantity: 1, rate: 2500}, // 1 * $25.00 = $25.00
                ],
            };

            const iouCurrencyCode = CONST.CURRENCY.USD;
            const decimals = getCurrencyDecimals(iouCurrencyCode);

            const perDiemAmountInCents = computePerDiemExpenseAmount(customUnit);
            const perDiemAmountString = convertToFrontendAmountAsString(perDiemAmountInCents, iouCurrencyCode);

            expect(perDiemAmountInCents).toBe(12500); // $125.00 in cents
            expect(perDiemAmountString).toBe('125.00');
            expect(validateAmount(perDiemAmountString, decimals)).toBe(true);
        });

        it('should reject per diem amount when it exceeds AMOUNT_MAX_LENGTH', () => {
            const customUnit: TransactionCustomUnit = {
                subRates: [
                    {id: 'rate1', name: 'Breakfast', quantity: 1000, rate: 12345678}, // 1000 * $123,456.78 = $123,456,780.00
                ],
            };

            const iouCurrencyCode = CONST.CURRENCY.USD;
            const decimals = getCurrencyDecimals(iouCurrencyCode);

            const perDiemAmountInCents = computePerDiemExpenseAmount(customUnit);
            const perDiemAmountString = convertToFrontendAmountAsString(perDiemAmountInCents, iouCurrencyCode);

            expect(perDiemAmountInCents).toBe(12345678000); // $123,456,780.00 in cents
            expect(perDiemAmountString).toBe('123456780.00'); // 9 digits (exceeds AMOUNT_MAX_LENGTH of 8)
            expect(validateAmount(perDiemAmountString, decimals)).toBe(false);
        });
    });
});
