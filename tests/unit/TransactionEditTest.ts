import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ID = 1;
const currentUserPersonalDetails = {
    accountID: CURRENT_USER_ID,
    login: 'test@example.com',
    displayName: 'Test User',
} as PersonalDetails;

describe('buildOptimisticTransactionAndCreateDraft', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    it('carries isFromNativeShortcut onto the created draft when the initial transaction has it', async () => {
        const newTransaction = buildOptimisticTransactionAndCreateDraft({
            initialTransaction: {isFromNativeShortcut: true, isFromGlobalCreate: true},
            currentUserPersonalDetails,
            reportID: 'report-1',
        });
        await waitForBatchedUpdates();

        const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${newTransaction.transactionID}`);
        expect(draft?.isFromNativeShortcut).toBe(true);
    });

    it('leaves isFromNativeShortcut undefined on the created draft when the initial transaction lacks it', async () => {
        const newTransaction = buildOptimisticTransactionAndCreateDraft({
            initialTransaction: {isFromGlobalCreate: true},
            currentUserPersonalDetails,
            reportID: 'report-1',
        });
        await waitForBatchedUpdates();

        const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${newTransaction.transactionID}`);
        expect(draft?.isFromNativeShortcut).toBeUndefined();
    });
});
