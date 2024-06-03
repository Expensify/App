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
});
