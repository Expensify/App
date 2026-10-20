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
