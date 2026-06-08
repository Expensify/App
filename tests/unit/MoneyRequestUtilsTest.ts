import {isValidPerDiemExpenseAmount} from '@libs/actions/IOU/PerDiem';
import {handleNegativeAmountFlipping, isValidMerchant, isValidMoneyRequestAmount, validateAmount, validatePercentage} from '@libs/MoneyRequestUtils';
import CONST from '@src/CONST';
import type Report from '@src/types/onyx/Report';
import type Transaction from '@src/types/onyx/Transaction';
import type {TransactionCustomUnit} from '@src/types/onyx/Transaction';

describe('ReportActionsUtils', () => {
    describe('validateAmount', () => {
        it('should pass the validation when amount is within the max digit and decimal', () => {
            expect(validateAmount('1234567890', 2, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(true);
            expect(validateAmount('1234567890', 0, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(true);
            expect(validateAmount('1234567890.12', 2, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(true);
            expect(validateAmount('123456789.1', 2, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(true);
            expect(validateAmount('1234567890.123', 3, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(true);
            expect(validateAmount('1234.1234', 4, 4)).toBe(true);
        });

        it("shouldn't pass the validation when amount is bigger than the max digit and decimal", () => {
            expect(validateAmount('1234567890.123', 2, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(false);
            expect(validateAmount('1234567890.1', 0, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(false);
            expect(validateAmount('12345678901.12', 2, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(false);
            expect(validateAmount('12345678901.1234', 3, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(false);
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

        it('should not strip minus sign without toggleNegative function', () => {
            const result = handleNegativeAmountFlipping('-123.45', true);

            expect(result).toBe('-123.45');
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

            expect(isValidPerDiemExpenseAmount(customUnit, 2)).toBe(true);
        });

        it('should return false when when per diem amount exceeds AMOUNT_MAX_LENGTH', () => {
            const customUnit: TransactionCustomUnit = {
                subRates: [
                    {id: 'rate1', name: 'Breakfast', quantity: 100000, rate: 12345678}, // 100000 * $123,456.78 = $12,345,678,000.00
                ],
            };

            expect(isValidPerDiemExpenseAmount(customUnit, 2)).toBe(false);
        });

        it('should return true when per diem expense has negative rate', () => {
            const customUnit: TransactionCustomUnit = {
                subRates: [{id: 'rate1', name: 'Breakfast', quantity: 1, rate: -1500}],
            };

            expect(isValidPerDiemExpenseAmount(customUnit, 2)).toBe(true);
        });
    });

    describe('isValidMoneyRequestAmount', () => {
        describe('invalid inputs', () => {
            it('should return false for nullish and NaN values', () => {
                expect(isValidMoneyRequestAmount(undefined, CONST.IOU.TYPE.SUBMIT)).toBe(false);
                expect(isValidMoneyRequestAmount(null as unknown as number, CONST.IOU.TYPE.SUBMIT)).toBe(false);
                expect(isValidMoneyRequestAmount(NaN, CONST.IOU.TYPE.SUBMIT)).toBe(false);
            });
        });

        describe('negative amounts', () => {
            it('should respect the allowNegative flag', () => {
                expect(isValidMoneyRequestAmount(-100, CONST.IOU.TYPE.SUBMIT, false)).toBe(false);
                expect(isValidMoneyRequestAmount(-100, CONST.IOU.TYPE.SUBMIT, true)).toBe(true);
                expect(isValidMoneyRequestAmount(100, CONST.IOU.TYPE.SUBMIT, false)).toBe(true);
            });
        });

        describe('P2P (peer-to-peer) transactions', () => {
            const allowNegative = true;
            const isP2P = true;

            it('should return false for zero or sub-cent amounts', () => {
                expect(isValidMoneyRequestAmount(0, CONST.IOU.TYPE.REQUEST, allowNegative, isP2P)).toBe(false);
                expect(isValidMoneyRequestAmount(0, CONST.IOU.TYPE.SUBMIT, allowNegative, isP2P)).toBe(false);
            });

            it('should return true for amounts >= 1 cent', () => {
                expect(isValidMoneyRequestAmount(1, CONST.IOU.TYPE.REQUEST, allowNegative, isP2P)).toBe(true);
                expect(isValidMoneyRequestAmount(100, CONST.IOU.TYPE.REQUEST, allowNegative, isP2P)).toBe(true);
                expect(isValidMoneyRequestAmount(1, CONST.IOU.TYPE.SUBMIT, allowNegative, isP2P)).toBe(true);
            });
        });

        describe('non-zero IOU types (PAY, INVOICE, SPLIT)', () => {
            it('should return false for zero amount', () => {
                expect(isValidMoneyRequestAmount(0, CONST.IOU.TYPE.PAY)).toBe(false);
                expect(isValidMoneyRequestAmount(0, CONST.IOU.TYPE.INVOICE)).toBe(false);
                expect(isValidMoneyRequestAmount(0, CONST.IOU.TYPE.SPLIT)).toBe(false);
            });

            it('should return true for amounts >= 1 cent', () => {
                expect(isValidMoneyRequestAmount(1, CONST.IOU.TYPE.PAY)).toBe(true);
                expect(isValidMoneyRequestAmount(1, CONST.IOU.TYPE.INVOICE)).toBe(true);
                expect(isValidMoneyRequestAmount(1, CONST.IOU.TYPE.SPLIT)).toBe(true);
            });
        });

        describe('SUBMIT and REQUEST types (non-P2P)', () => {
            it('should allow zero, positive, and negative amounts', () => {
                const allowNegative = true;
                const isP2P = false;
                expect(isValidMoneyRequestAmount(0, CONST.IOU.TYPE.SUBMIT, allowNegative, isP2P)).toBe(true);
                expect(isValidMoneyRequestAmount(100, CONST.IOU.TYPE.SUBMIT, allowNegative, isP2P)).toBe(true);
                expect(isValidMoneyRequestAmount(-100, CONST.IOU.TYPE.SUBMIT, allowNegative, isP2P)).toBe(true);
                expect(isValidMoneyRequestAmount(0, CONST.IOU.TYPE.REQUEST, allowNegative, isP2P)).toBe(true);
                expect(isValidMoneyRequestAmount(100, CONST.IOU.TYPE.REQUEST, allowNegative, isP2P)).toBe(true);
            });
        });
    });

    describe('isValidMerchant', () => {
        const iouReport = {
            reportID: '1',
            type: CONST.REPORT.TYPE.IOU,
        } as Report;

        const expenseReport = {
            reportID: '123',
            type: CONST.REPORT.TYPE.EXPENSE,
        } as Report;

        const unreportedTransaction = {
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            amount: 0,
        } as Transaction;

        const reportedTransaction = {
            reportID: '123',
            amount: 0,
        } as Transaction;

        describe('empty merchants', () => {
            it('should return true for empty/undefined merchant when transaction is unreported or IOU', () => {
                expect(isValidMerchant('', unreportedTransaction)).toBe(true);
                expect(isValidMerchant('   ', unreportedTransaction)).toBe(true);
                expect(isValidMerchant(undefined, unreportedTransaction)).toBe(true);

                expect(isValidMerchant('', reportedTransaction, iouReport)).toBe(true);
                expect(isValidMerchant('   ', reportedTransaction, iouReport)).toBe(true);
                expect(isValidMerchant(undefined, reportedTransaction, iouReport)).toBe(true);
            });

            it('should return false for empty/undefined merchant when transaction is reported or missing', () => {
                expect(isValidMerchant('', reportedTransaction)).toBe(false);
                expect(isValidMerchant('', reportedTransaction, expenseReport)).toBe(false);
                expect(isValidMerchant('   ', reportedTransaction, expenseReport)).toBe(false);
                expect(isValidMerchant(undefined, reportedTransaction, expenseReport)).toBe(false);
                expect(isValidMerchant('')).toBe(false);
            });
        });

        describe('invalid merchant constants', () => {
            it('should return false for invalid merchant constants regardless of transaction', () => {
                expect(isValidMerchant(CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT)).toBe(false);
                expect(isValidMerchant(CONST.TRANSACTION.DEFAULT_MERCHANT)).toBe(false);
                expect(isValidMerchant(CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, unreportedTransaction)).toBe(false);
            });
        });

        describe('byte length validation', () => {
            it('should respect the 255 byte limit', () => {
                expect(isValidMerchant('Valid Merchant Name')).toBe(true);
                expect(isValidMerchant('a'.repeat(CONST.MERCHANT_NAME_MAX_BYTES))).toBe(true);
                expect(isValidMerchant('a'.repeat(CONST.MERCHANT_NAME_MAX_BYTES + 1))).toBe(false);
            });
        });

        it('should trim whitespace before validation', () => {
            expect(isValidMerchant('  Valid Merchant  ')).toBe(true);
        });
    });
});
