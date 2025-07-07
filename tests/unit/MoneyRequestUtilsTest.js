"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MoneyRequestUtils = require("@libs/MoneyRequestUtils");
describe('ReportActionsUtils', function () {
    describe('validateAmount', function () {
        it('should pass the validation when amount is within the max digit and decimal', function () {
            expect(MoneyRequestUtils.validateAmount('12345678', 2, 8)).toBe(true);
            expect(MoneyRequestUtils.validateAmount('12345678', 0, 8)).toBe(true);
            expect(MoneyRequestUtils.validateAmount('12345678.12', 2, 8)).toBe(true);
            expect(MoneyRequestUtils.validateAmount('1234567.1', 2, 8)).toBe(true);
            expect(MoneyRequestUtils.validateAmount('12345678.123', 3, 8)).toBe(true);
            expect(MoneyRequestUtils.validateAmount('1234.1234', 4, 4)).toBe(true);
        });
        it("shouldn't pass the validation when amount is bigger than the max digit and decimal", function () {
            expect(MoneyRequestUtils.validateAmount('12345678.123', 2, 8)).toBe(false);
            expect(MoneyRequestUtils.validateAmount('12345678.1', 0, 8)).toBe(false);
            expect(MoneyRequestUtils.validateAmount('123456789.12', 2, 8)).toBe(false);
            expect(MoneyRequestUtils.validateAmount('123456789.1234', 3, 8)).toBe(false);
            expect(MoneyRequestUtils.validateAmount('1234.12345', 4, 4)).toBe(false);
        });
    });
});
