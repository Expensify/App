import shouldShowTransactionPostedYear from '@libs/TransactionUtils/shouldShowTransactionPostedYear';

import createRandomTransaction from '../utils/collections/transaction';

const currentYear = new Date().getFullYear();
const transactionWithPosted = (posted?: string) => ({...createRandomTransaction(0), posted});

describe('shouldShowTransactionPostedYear', () => {
    it('returns true when the raw YYYYMMDD posted date is in a past year', () => {
        expect(shouldShowTransactionPostedYear(transactionWithPosted(`${currentYear - 1}0701`))).toBe(true);
    });

    it('returns false when the raw YYYYMMDD posted date is in the current year', () => {
        expect(shouldShowTransactionPostedYear(transactionWithPosted(`${currentYear}0701`))).toBe(false);
    });

    it('returns false when there is no posted date', () => {
        expect(shouldShowTransactionPostedYear(transactionWithPosted(undefined))).toBe(false);
        expect(shouldShowTransactionPostedYear(transactionWithPosted(''))).toBe(false);
    });

    it('returns false for a nullish transaction', () => {
        expect(shouldShowTransactionPostedYear(undefined)).toBe(false);
        expect(shouldShowTransactionPostedYear(null)).toBe(false);
    });
});
