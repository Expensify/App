import {act, renderHook} from '@testing-library/react-native';

import useHasHeldExpense from '@hooks/useHasHeldExpense';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 1;
const REPORT_ID = '123';
const TRANSACTION_ID = '456';

describe('useHasHeldExpense', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID});
        await waitForBatchedUpdates();
    });

    it.each([
        {ownerAccountID: CURRENT_USER_ACCOUNT_ID, hold: '789', expected: true},
        {ownerAccountID: 2, hold: '789', expected: false},
        {ownerAccountID: CURRENT_USER_ACCOUNT_ID, hold: undefined, expected: false},
    ])('detects a held expense only for its owner: $ownerAccountID / $hold', async ({ownerAccountID, hold, expected}) => {
        // Given a reported expense, which may be held or belong to someone the user approves
        const report: Report = {...createRandomReport(1), reportID: REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE, ownerAccountID};
        const transaction: Transaction = {...createRandomTransaction(1), transactionID: TRANSACTION_ID, reportID: REPORT_ID, comment: {hold}};
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);

        // When visibility detection runs
        const {result} = renderHook(() => useHasHeldExpense());
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Then another user's held expenses never trigger the current user's suggestion
        expect(result.current).toBe(expected);
    });

    it('updates when a hold is removed', async () => {
        // Given the current user's held expense
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
            ...createRandomReport(1),
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, {
            ...createRandomTransaction(1),
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            comment: {hold: '789'},
        });
        const {result} = renderHook(() => useHasHeldExpense());
        await act(async () => {
            await waitForBatchedUpdates();
        });
        expect(result.current).toBe(true);

        // When the hold is released
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, {comment: {hold: null}});
            await waitForBatchedUpdates();
        });

        // Then detection stops even though the separately persisted suggestion remains visible
        expect(result.current).toBe(false);
    });
});
