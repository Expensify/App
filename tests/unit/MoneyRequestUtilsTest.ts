import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';

describe('ReportActionsUtils', () => {
    describe('validateAmount', () => {
        it('should pass the validation when amount is within the max digit and decimal', () => {
            expect(MoneyRequestUtils.validateAmount('12345678', 2, 8)).toBe(true);
            expect(MoneyRequestUtils.validateAmount('12345678', 0, 8)).toBe(true);
            expect(MoneyRequestUtils.validateAmount('12345678.12', 2, 8)).toBe(true);
            expect(MoneyRequestUtils.validateAmount('1234567.1', 2, 8)).toBe(true);
            expect(MoneyRequestUtils.validateAmount('12345678.123', 3, 8)).toBe(true);
            expect(MoneyRequestUtils.validateAmount('1234.1234', 4, 4)).toBe(true);
        });

        it("shouldn't pass the validation when amount is bigger than the max digit and decimal", () => {
            expect(MoneyRequestUtils.validateAmount('12345678.123', 2, 8)).toBe(false);
            expect(MoneyRequestUtils.validateAmount('12345678.1', 0, 8)).toBe(false);
            expect(MoneyRequestUtils.validateAmount('123456789.12', 2, 8)).toBe(false);
            expect(MoneyRequestUtils.validateAmount('123456789.1234', 3, 8)).toBe(false);
            expect(MoneyRequestUtils.validateAmount('1234.12345', 4, 4)).toBe(false);
        });
    });

    describe('handleNegativeAmountFlipping', () => {
        it('should toggle negative and remove dash when allowFlippingAmount is true and amount starts with -', () => {
            const mockToggleNegative = jest.fn();
            const result = MoneyRequestUtils.handleNegativeAmountFlipping('-123.45', true, mockToggleNegative);
            
            expect(mockToggleNegative).toHaveBeenCalledTimes(1);
            expect(result).toBe('123.45');
        });

        it('should not toggle negative when allowFlippingAmount is false', () => {
            const mockToggleNegative = jest.fn();
            const result = MoneyRequestUtils.handleNegativeAmountFlipping('-123.45', false, mockToggleNegative);
            
            expect(mockToggleNegative).not.toHaveBeenCalled();
            expect(result).toBe('-123.45');
        });

        it('should not toggle negative when amount does not start with -', () => {
            const mockToggleNegative = jest.fn();
            const result = MoneyRequestUtils.handleNegativeAmountFlipping('123.45', true, mockToggleNegative);
            
            expect(mockToggleNegative).not.toHaveBeenCalled();
            expect(result).toBe('123.45');
        });

        it('should work without toggleNegative function', () => {
            const result = MoneyRequestUtils.handleNegativeAmountFlipping('-123.45', true);
            
            expect(result).toBe('123.45');
        });

        it('should return original amount when allowFlippingAmount is false and no dash', () => {
            const mockToggleNegative = jest.fn();
            const result = MoneyRequestUtils.handleNegativeAmountFlipping('123.45', false, mockToggleNegative);
            
            expect(mockToggleNegative).not.toHaveBeenCalled();
            expect(result).toBe('123.45');
        });

        it('should handle empty string', () => {
            const mockToggleNegative = jest.fn();
            const result = MoneyRequestUtils.handleNegativeAmountFlipping('', true, mockToggleNegative);
            
            expect(mockToggleNegative).not.toHaveBeenCalled();
            expect(result).toBe('');
        });

        it('should handle string with only dash', () => {
            const mockToggleNegative = jest.fn();
            const result = MoneyRequestUtils.handleNegativeAmountFlipping('-', true, mockToggleNegative);
            
            expect(mockToggleNegative).toHaveBeenCalledTimes(1);
            expect(result).toBe('');
        });
    });
});
