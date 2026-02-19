import Onyx from 'react-native-onyx';
import {computeTimeAmount, formatTimeMerchant, isValidTimeExpenseAmount} from '@libs/TimeTrackingUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import currencyList from './currencyList.json';

describe('TimeTrackingUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.CURRENCY_LIST]: currencyList,
            },
        });
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    describe('computeTimeAmount', () => {
        it('should compute correct amount for whole hours', () => {
            const rateInCents = 5000; // $50.00
            const hours = 8;
            const expected = 40000; // $400.00

            expect(computeTimeAmount(rateInCents, hours)).toBe(expected);
        });

        it('should compute correct amount for decimal hours', () => {
            const rateInCents = 5000; // $50.00
            const hours = 2.5;
            const expected = 12500; // $125.00

            expect(computeTimeAmount(rateInCents, hours)).toBe(expected);
        });

        it('should round to nearest cent for fractional results', () => {
            const rateInCents = 3333; // $33.33
            const hours = 1.5;
            const expected = 5000; // 4999.5 -> 5000

            expect(computeTimeAmount(rateInCents, hours)).toBe(expected);
        });

        it('should handle small decimal hours', () => {
            const rateInCents = 5000; // $50.00
            const hours = 0.25; // 15 minutes
            const expected = 1250; // $12.50

            expect(computeTimeAmount(rateInCents, hours)).toBe(expected);
        });

        it('should handle large hour values', () => {
            const rateInCents = 10000; // $100.00
            const hours = 100;
            const expected = 1000000; // $10,000.00

            expect(computeTimeAmount(rateInCents, hours)).toBe(expected);
        });

        it('should handle high precision decimal hours', () => {
            const rateInCents = 2500; // $25.00
            const hours = 3.75; // 3 hours 45 minutes
            const expected = 9375; // $93.75

            expect(computeTimeAmount(rateInCents, hours)).toBe(expected);
        });
    });

    describe('formatTimeMerchant', () => {
        it('should format whole hours with USD currency', () => {
            const hours = 8;
            const rate = 5000; // $50.00 in cents
            const currency = CONST.CURRENCY.USD;

            const result = formatTimeMerchant(hours, rate, currency, translateLocal);

            expect(result).toContain('8 hours');
            expect(result).toContain('$50.00');
        });

        it('should format decimal hours', () => {
            const hours = 2.5;
            const rate = 5000;
            const currency = CONST.CURRENCY.USD;

            const result = formatTimeMerchant(hours, rate, currency, translateLocal);

            expect(result).toContain('2.5 hours');
        });

        it('should put "hour" instead of "hours" when count is 1', () => {
            const hours = 1;
            const rate = 5000;
            const currency = CONST.CURRENCY.USD;

            const result = formatTimeMerchant(hours, rate, currency, translateLocal);

            expect(result).toContain('1 hour');
        });

        it('should format with different currencies', () => {
            const hours = 5;
            const rate = 3000;
            const currency = CONST.CURRENCY.EUR;

            const result = formatTimeMerchant(hours, rate, currency, translateLocal);

            expect(result).toContain('€');
        });

        it('should handle currencies with no subunits', () => {
            const hours = 1.11;
            const rate = 100;
            const currency = 'VND';

            const result = formatTimeMerchant(hours, rate, currency, translateLocal);

            expect(result).toContain('₫1 ');
            expect(result).not.toContain('₫1.00');
        });
    });

    describe('isValidTimeExpenseAmount', () => {
        it('should validate normal time expense amount', () => {
            const amount = 40000; // $400.00
            const currency = CONST.CURRENCY.USD;
            const decimals = 2;

            expect(isValidTimeExpenseAmount(amount, currency, decimals)).toBe(true);
        });

        it('should validate large but reasonable amounts', () => {
            const amount = 1000000; // $10,000.00
            const currency = CONST.CURRENCY.USD;
            const decimals = 2;

            expect(isValidTimeExpenseAmount(amount, currency, decimals)).toBe(true);
        });

        it('should reject too large amounts with decimals', () => {
            const amount = 10_000_000_000_00; // $10,000,000,000.00
            const currency = CONST.CURRENCY.USD;
            const decimals = 2;

            expect(isValidTimeExpenseAmount(amount, currency, decimals)).toBe(false);
        });

        it('should reject too large amounts without decimals', () => {
            const amount = 10_000_000_000_00; // ₫10,000,000,000
            const currency = 'VND';
            const decimals = 0;

            expect(isValidTimeExpenseAmount(amount, currency, decimals)).toBe(false);
        });
    });
});
