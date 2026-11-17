import {WRITE_COMMANDS} from '@libs/API/types';
import flagSearchTransactionWrites from '@libs/Middleware/FlagSearchTransactionWrites';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Request from '@src/types/onyx/Request';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const transactionUpdate = (transactionID: string): OnyxUpdate<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`> => ({
    onyxMethod: Onyx.METHOD.MERGE,
    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
    value: {},
});

async function runMiddleware(request: Partial<Request<OnyxKey>>, jsonCode: number = CONST.JSON_CODE.SUCCESS) {
    await flagSearchTransactionWrites(Promise.resolve({jsonCode}), {command: WRITE_COMMANDS.HOLD_MONEY_REQUEST, data: {}, ...request}, true);
    await waitForBatchedUpdates();
    return getOnyxValue(ONYXKEYS.RAM_ONLY_SEARCH_TRANSACTION_WRITES);
}

describe('FlagSearchTransactionWrites', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(() => Onyx.set(ONYXKEYS.RAM_ONLY_SEARCH_TRANSACTION_WRITES, null));

    it('flags only the transactions a successful write rolls back on failure', async () => {
        // Given a successful write that rolls back a transaction, its violations and a report
        // When it passes through the middleware
        const signal = await runMiddleware({
            failureData: [
                transactionUpdate('1'),
                {onyxMethod: Onyx.METHOD.MERGE, key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}1`, value: null},
                {onyxMethod: Onyx.METHOD.MERGE, key: `${ONYXKEYS.COLLECTION.REPORT}2`, value: {}},
            ],
        });

        // Then Search is told only that transaction changed
        expect(signal?.transactionIDs).toEqual(['1']);
    });

    it('does not flag a read that writes transactions without rolling them back', async () => {
        // Given an OpenReport that seeds a transaction optimistically but has nothing to roll back
        // When it passes through the middleware
        const signal = await runMiddleware({command: WRITE_COMMANDS.OPEN_REPORT, optimisticData: [transactionUpdate('1')], failureData: []});

        // Then Search is not told anything changed, because reading a report is not an edit
        expect(signal).toBeUndefined();
    });

    it('does not flag a write the server rejected', async () => {
        // Given a write the server answers with an error
        // When it passes through the middleware
        const signal = await runMiddleware({failureData: [transactionUpdate('1')]}, 666);

        // Then Search is not told to refetch, because failureData restores what it already shows
        expect(signal).toBeUndefined();
    });

    it('flags a repeated write to the same transaction again', async () => {
        // Given two successful edits of the same transaction
        const failureData = [transactionUpdate('1')];

        // When both pass through the middleware
        const first = await runMiddleware({failureData});
        const second = await runMiddleware({failureData});

        // Then the second one raises a new signal, because Onyx would skip a set with an unchanged value
        expect(second?.writeID).not.toBe(first?.writeID);
    });
});
