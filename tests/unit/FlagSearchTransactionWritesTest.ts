import {WRITE_COMMANDS} from '@libs/API/types';
import flagSearchTransactionWrites from '@libs/Middleware/FlagSearchTransactionWrites';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Request from '@src/types/onyx/Request';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const transactionUpdate = (transactionID: string, reportID?: string): OnyxUpdate<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`> => ({
    onyxMethod: Onyx.METHOD.MERGE,
    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
    value: reportID ? {reportID} : {},
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
        expect(Object.keys(signal?.transactionIDs ?? {})).toEqual(['1']);
    });

    it('flags the report a moved transaction left', async () => {
        // Given a successful move whose rollback puts the transaction back in report 5
        // When it passes through the middleware
        const signal = await runMiddleware({failureData: [transactionUpdate('1', '5')]});

        // Then Search is told report 5 changed too, because it just lost an expense it may not show as a row
        expect(Object.keys(signal?.reportIDs ?? {})).toEqual(['5']);
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

    it('keeps earlier writes when a later one changes other transactions', async () => {
        // Given two successful edits of different transactions before Search renders, as when its tab is frozen
        // When both pass through the middleware
        const first = await runMiddleware({failureData: [transactionUpdate('1')]});
        const second = await runMiddleware({failureData: [transactionUpdate('2')]});

        // Then both transactions are still flagged, each with the write that changed it, so Search can check every one
        expect(second?.transactionIDs).toEqual(
            Object.fromEntries([
                ['1', first?.writeID],
                ['2', second?.writeID],
            ]),
        );
    });
});
