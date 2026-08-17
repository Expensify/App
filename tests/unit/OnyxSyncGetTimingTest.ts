import initOnyxDerivedValues from '@userActions/OnyxDerived';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import Storage from 'react-native-onyx/dist/storage';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/**
 * When a synchronous read sees a value that did not come from the reading tick: before `Onyx.init()`
 * resolves, from another browser tab, and from a derived key.
 *
 * The pre-init block must run before anything else in this file. `Onyx.init()` resolves once per module
 * lifetime and cannot be undone, so that window is only observable on the very first init.
 */

/* eslint-disable rulesdir/no-unsafe-onyx-read -- reading in the same tick as a write is the behaviour under test here, so the cases below have to do the exact thing the rule bans everywhere else. */

const TRANSACTION_A = `${ONYXKEYS.COLLECTION.TRANSACTION}A` as const;
const REPORT_A = `${ONYXKEYS.COLLECTION.REPORT}A` as const;

describe('reads before Onyx.init has resolved', () => {
    it('returns undefined for a key whose initial state has not been applied yet', async () => {
        // `Onyx.get` has no init guard: every write path goes through `OnyxUtils.afterInit`, but the
        // read is a bare cache lookup. So a read that runs before init resolves sees nothing, even for
        // a key with a declared initial state.
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {[ONYXKEYS.ACCOUNT]: {primaryLogin: 'seeded@example.com'}},
        });

        expect(OnyxUtils.get(ONYXKEYS.ACCOUNT)).toBeUndefined();

        await waitForBatchedUpdates();

        expect(OnyxUtils.get(ONYXKEYS.ACCOUNT)?.primaryLogin).toBe('seeded@example.com');
    });
});

describe('a write made by another browser tab', () => {
    it('reaches the cache in the same statement that notifies subscribers', async () => {
        // On web, `Onyx.init` registers a callback with `storage.keepInstancesSync`. Another tab's
        // write arrives through a localStorage `storage` event as a batch of pairs, and the callback
        // does `cache.set(key, value)` for every pair before it notifies anyone. So the cache is
        // current no later than the moment `useOnyx` subscribers are told, and an event-time read is
        // never behind a subscription. That is the whole cross-tab question for this proposal.
        const registerSync = jest.mocked(Storage.keepInstancesSync);
        const onStorageKeysChanged = registerSync?.mock.calls.at(0)?.at(0);
        expect(onStorageKeysChanged).toBeDefined();

        const receivedTotals: Array<number | undefined> = [];
        const connection = Onyx.connectWithoutView({
            key: REPORT_A,
            callback: (report) => {
                receivedTotals.push(report?.total);
            },
        });
        await waitForBatchedUpdates();

        onStorageKeysChanged?.([[REPORT_A, {reportID: 'A', total: 7}]]);

        // Same tick as the incoming event, before any awaiting.
        expect(OnyxUtils.get(REPORT_A)?.total).toBe(7);

        await waitForBatchedUpdates();
        Onyx.disconnect(connection);

        expect(receivedTotals).toContain(7);
    });
});

describe('reads of derived keys', () => {
    beforeAll(async () => {
        initOnyxDerivedValues();
        await waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    const derivedAmount = () => OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS)?.rA?.transactions?.[TRANSACTION_A]?.amount;

    it('is current once the source write resolves, with no extra wait', async () => {
        const transaction: Transaction = {...createRandomTransaction(1), transactionID: 'A', reportID: 'rA', amount: 100};

        await Onyx.merge(TRANSACTION_A, transaction);

        // Awaiting the source merge is enough. The derived recompute and its own write land inside the
        // source merge's promise chain, so there is no extra revision lag.
        //
        // This comment used to add that it holds *because* the read is synchronous, and that an unpatched
        // build would lag here. Both halves were checked against unpatched Onyx on 2026-08-17 and neither
        // is true: with the read awaited, the unpatched build is current at this point too. So this case
        // pins Onyx's own scheduling rather than anything the patch does, and the ~890 ms
        // `visibleReportActions` figure from the production trace has no unit-level support.
        // Re-check this case if Onyx changes how it schedules derivations.
        expect(OnyxUtils.get(TRANSACTION_A)?.amount).toBe(100);
        expect(derivedAmount()).toBe(100);
    });

    it('is stale in the same tick as a merge that has not resolved', async () => {
        const transaction: Transaction = {...createRandomTransaction(1), transactionID: 'A', reportID: 'rA', amount: 100};
        await Onyx.merge(TRANSACTION_A, transaction);

        const promise = Onyx.merge(TRANSACTION_A, {amount: 999});

        // Same rule as any other key: an unresolved merge is invisible, so both the source and
        // anything derived from it still read the previous revision.
        expect(OnyxUtils.get(TRANSACTION_A)?.amount).toBe(100);
        expect(derivedAmount()).toBe(100);

        await promise;
        expect(derivedAmount()).toBe(999);
    });

    it('is stale in the same tick as a set, even though the source key is already current', async () => {
        const transaction: Transaction = {...createRandomTransaction(1), transactionID: 'A', reportID: 'rA', amount: 100};
        await Onyx.merge(TRANSACTION_A, transaction);

        const promise = Onyx.set(TRANSACTION_A, {...transaction, amount: 555});

        // The sharp edge for event-time reads: `set` writes the cache synchronously, so the source
        // reads as 555 immediately, while the derived value is still 100 because the derivation's own
        // write is queued as a merge. Reading a source key and a derived key in the same handler can
        // therefore see two different revisions.
        expect(OnyxUtils.get(TRANSACTION_A)?.amount).toBe(555);
        expect(derivedAmount()).toBe(100);

        await promise;
        await waitForBatchedUpdates();
        expect(derivedAmount()).toBe(555);
    });
});
