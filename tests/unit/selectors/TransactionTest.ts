import type {Transaction} from '@src/types/onyx';

import {originalTransactionIDSelector} from '@selectors/Transaction';

import createRandomTransaction from '../../utils/collections/transaction';

describe('originalTransactionIDSelector', () => {
    it('returns the originalTransactionID of a split child', () => {
        const transaction: Transaction = {...createRandomTransaction(0), comment: {originalTransactionID: '789'}};
        expect(originalTransactionIDSelector(transaction)).toBe('789');
    });

    it('returns undefined when there is no originalTransactionID', () => {
        const transaction: Transaction = {...createRandomTransaction(0), comment: {}};
        expect(originalTransactionIDSelector(transaction)).toBeUndefined();
    });

    it('returns undefined when there is no comment', () => {
        const transaction: Transaction = {...createRandomTransaction(0), comment: undefined};
        expect(originalTransactionIDSelector(transaction)).toBeUndefined();
    });

    it('returns undefined when the transaction is undefined', () => {
        expect(originalTransactionIDSelector(undefined)).toBeUndefined();
    });
});
