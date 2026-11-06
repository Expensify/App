import RemoveSearchRowFieldsFromTransactions from '@libs/migrations/RemoveSearchRowFieldsFromTransactions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const baseTransaction: Transaction = {
    transactionID: '1',
    reportID: '100',
    amount: -1000,
    currency: CONST.CURRENCY.USD,
    merchant: 'Original merchant',
    modifiedMerchant: 'Edited merchant',
    created: '2026-01-01',
};

describe('RemoveSearchRowFieldsFromTransactions', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    it('removes Search row display fields leaked into a cached transaction', async () => {
        // Given a transaction cached after it was moved from Search, which saved the row's display fields on it
        const leakedTransaction = {
            ...baseTransaction,
            formattedMerchant: 'Original merchant',
            formattedFrom: 'Rory',
            formattedTo: 'Carlos',
            formattedTotal: 1000,
            date: '2026-01-01',
            keyForList: '1',
            action: CONST.SEARCH.ACTION_TYPES.VIEW,
            from: {accountID: 1},
            to: {accountID: 2},
        } as Transaction;
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, leakedTransaction);

        // When the migration runs at startup
        await RemoveSearchRowFieldsFromTransactions();
        await waitForBatchedUpdates();

        // Then the display fields are gone, so the edited merchant is shown again, and the real fields are untouched
        const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}1`);
        expect(transaction).toEqual(baseTransaction);
    });

    it('cleans a cached transaction by its Onyx key even when it has no transactionID', async () => {
        // Given a partial cached entry that holds leaked Search row fields but no transactionID
        const partialEntry = {formattedMerchant: 'Original merchant', modifiedMerchant: 'Edited merchant'};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}2`, partialEntry);

        // When the migration runs
        await RemoveSearchRowFieldsFromTransactions();
        await waitForBatchedUpdates();

        // Then the leaked field is removed through the entry's key and the real field is kept
        const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}2`);
        expect(transaction).not.toHaveProperty('formattedMerchant');
        expect(transaction?.modifiedMerchant).toBe('Edited merchant');
    });

    it('still resolves when the cleanup write fails, so startup is never blocked', async () => {
        // Given a transaction with leaked Search row fields and a storage write that fails
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, {...baseTransaction, formattedMerchant: 'Original merchant'} as Transaction);
        const mergeCollectionSpy = jest.spyOn(Onyx, 'mergeCollection').mockRejectedValueOnce(new Error('Storage failure'));

        // When the migration runs at startup
        // Then it resolves anyway, since the app only continues loading once every migration settles
        await expect(RemoveSearchRowFieldsFromTransactions()).resolves.toBeUndefined();
        expect(mergeCollectionSpy).toHaveBeenCalledTimes(1);
        mergeCollectionSpy.mockRestore();
    });

    it('leaves clean transactions alone', async () => {
        // Given a transaction without any Search row fields
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, baseTransaction);

        // When the migration runs
        await RemoveSearchRowFieldsFromTransactions();
        await waitForBatchedUpdates();

        // Then the transaction is unchanged
        const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}1`);
        expect(transaction).toEqual(baseTransaction);
    });
});
