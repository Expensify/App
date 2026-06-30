import {originalTransactionIDSelector} from '@selectors/Transaction';
import type {OnyxEntry} from 'react-native-onyx';
import type {Transaction} from '@src/types/onyx';

describe('originalTransactionIDSelector', () => {
    it('returns the originalTransactionID of a split child', () => {
        const transaction = {comment: {originalTransactionID: '789'}} as OnyxEntry<Transaction>;
        expect(originalTransactionIDSelector(transaction)).toBe('789');
    });

    it('returns undefined when there is no originalTransactionID', () => {
        const transaction = {comment: {}} as OnyxEntry<Transaction>;
        expect(originalTransactionIDSelector(transaction)).toBeUndefined();
    });

    it('returns undefined when there is no comment', () => {
        const transaction = {} as OnyxEntry<Transaction>;
        expect(originalTransactionIDSelector(transaction)).toBeUndefined();
    });

    it('returns undefined when the transaction is undefined', () => {
        expect(originalTransactionIDSelector(undefined)).toBeUndefined();
    });
});
