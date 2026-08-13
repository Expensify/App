import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/**
 * Validation steps A1 to A3 of ONYX-GET-VALIDATION-PLAN.md.
 *
 * Documents what a synchronous `OnyxUtils.get()` returns when it runs in the same tick as a write.
 * These are observation tests, not aspiration: they encode the behaviour authors have to code against
 * once event-time reads are allowed, so a change in Onyx's write timing shows up here rather than as a
 * silent stale read inside an event handler.
 *
 * Run against `react-native-onyx@3.0.94` plus `patches/react-native-onyx/react-native-onyx+3.0.94.patch`,
 * which is the Onyx #773 change applied locally. Unpatched, `get` returns a Promise and the same-tick
 * cases fail.
 */

const KEY = ONYXKEYS.ACCOUNT;
const REPORT_A = `${ONYXKEYS.COLLECTION.REPORT}A` as const;
const REPORT_B = `${ONYXKEYS.COLLECTION.REPORT}B` as const;

beforeAll(async () => {
    Onyx.init({keys: ONYXKEYS});
    await waitForBatchedUpdates();
});

beforeEach(async () => {
    await Onyx.clear();
    await waitForBatchedUpdates();
});

describe('A1: synchronous read in the same tick as a write', () => {
    // Guards the premise of every case below. Unpatched, `get` returns a Promise, so this fails first
    // and names the reason instead of leaving a wall of "expected undefined, received {}".
    it('returns a value rather than a promise', async () => {
        await Onyx.merge(KEY, {primaryLogin: 'first@example.com'});

        const account = OnyxUtils.get(KEY);

        expect(account).not.toBeInstanceOf(Promise);
        expect(account?.primaryLogin).toBe('first@example.com');
    });

    describe('merge', () => {
        it('does not apply to the cache in the same tick', () => {
            const promise = Onyx.merge(KEY, {primaryLogin: 'first@example.com'});

            expect(OnyxUtils.get(KEY)).toBeUndefined();

            return promise;
        });

        it('is visible once the merge promise resolves', async () => {
            await Onyx.merge(KEY, {primaryLogin: 'first@example.com'});

            expect(OnyxUtils.get(KEY)?.primaryLogin).toBe('first@example.com');
        });

        it('returns the pre-merge value, not a partially merged one', async () => {
            await Onyx.merge(KEY, {primaryLogin: 'first@example.com'});

            const promise = Onyx.merge(KEY, {primaryLogin: 'second@example.com'});

            expect(OnyxUtils.get(KEY)?.primaryLogin).toBe('first@example.com');

            await promise;
            expect(OnyxUtils.get(KEY)?.primaryLogin).toBe('second@example.com');
        });

        it('batches two merges in one tick, and neither is visible until they resolve', async () => {
            const promises = [Onyx.merge(KEY, {primaryLogin: 'first@example.com'}), Onyx.merge(KEY, {isFromPublicDomain: true})];

            expect(OnyxUtils.get(KEY)).toBeUndefined();

            await Promise.all(promises);
            expect(OnyxUtils.get(KEY)?.primaryLogin).toBe('first@example.com');
            expect(OnyxUtils.get(KEY)?.isFromPublicDomain).toBe(true);
        });
    });

    describe('set', () => {
        it('applies to the cache in the same tick', () => {
            const promise = Onyx.set(KEY, {primaryLogin: 'first@example.com'});

            expect(OnyxUtils.get(KEY)?.primaryLogin).toBe('first@example.com');

            return promise;
        });

        it('discards a merge queued earlier in the same tick', async () => {
            const merged = Onyx.merge(KEY, {primaryLogin: 'first@example.com'});
            const wasSet = Onyx.set(KEY, {isFromPublicDomain: true});

            expect(OnyxUtils.get(KEY)?.primaryLogin).toBeUndefined();
            expect(OnyxUtils.get(KEY)?.isFromPublicDomain).toBe(true);

            await Promise.all([merged, wasSet]);
            expect(OnyxUtils.get(KEY)?.primaryLogin).toBeUndefined();
            expect(OnyxUtils.get(KEY)?.isFromPublicDomain).toBe(true);
        });
    });

    describe('mergeCollection', () => {
        it('applies to the cache in the same tick', () => {
            const promise = Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
                [REPORT_A]: {reportID: 'A'},
                [REPORT_B]: {reportID: 'B'},
            });

            expect(OnyxUtils.get(REPORT_A)?.reportID).toBe('A');
            expect(OnyxUtils.get(REPORT_B)?.reportID).toBe('B');

            return promise;
        });
    });

    describe('update', () => {
        // `update()` returns `clearPromise.then(() => Promise.all(...))`, and `clearPromise` is an
        // already-resolved promise unless the batch contains a CLEAR. That `.then` always costs a
        // microtask, so no operation inside an `update()` reaches the cache in the calling tick,
        // not even a SET. This is the case that matters most in practice: optimistic data in E/App
        // is written with `Onyx.update`.
        it('makes nothing visible in the same tick, not even a set', () => {
            const promise = Onyx.update([
                {onyxMethod: Onyx.METHOD.SET, key: REPORT_A, value: {reportID: 'A'}},
                {onyxMethod: Onyx.METHOD.MERGE, key: REPORT_B, value: {reportID: 'B'}},
            ]);

            expect(OnyxUtils.get(REPORT_A)).toBeUndefined();
            expect(OnyxUtils.get(REPORT_B)).toBeUndefined();

            return promise;
        });

        // Isolates the cause: a single non-collection SET takes the plain `set()` path, which writes
        // the cache synchronously on its own, and is still invisible here. So the deferral comes from
        // `update()`'s promise chain rather than from collection batching.
        it('defers a lone set on a non-collection key too', () => {
            const promise = Onyx.update([{onyxMethod: Onyx.METHOD.SET, key: KEY, value: {primaryLogin: 'first@example.com'}}]);

            expect(OnyxUtils.get(KEY)).toBeUndefined();

            return promise;
        });

        it('is fully visible once the update promise resolves', async () => {
            await Onyx.update([
                {onyxMethod: Onyx.METHOD.SET, key: REPORT_A, value: {reportID: 'A'}},
                {onyxMethod: Onyx.METHOD.MERGE, key: REPORT_B, value: {reportID: 'B'}},
            ]);

            expect(OnyxUtils.get(REPORT_A)?.reportID).toBe('A');
            expect(OnyxUtils.get(REPORT_B)?.reportID).toBe('B');
        });
    });

    describe('read-before-write is always safe', () => {
        it('sees the value written by a previous, awaited tick', async () => {
            await Onyx.merge(REPORT_A, {reportID: 'A', total: 100});

            // The shape a converted action creator should follow: read, then write. The read is
            // evaluated before the merge is queued, so it sees the previous tick's value.
            await Onyx.merge(REPORT_A, {total: (OnyxUtils.get(REPORT_A)?.total ?? 0) + 1});

            expect(OnyxUtils.get(REPORT_A)?.total).toBe(101);
        });
    });
});

/**
 * Validation step A2. The patch moves the `partialSetCollection` thunk ahead of the
 * `mergeCollectionWithPatches` thunk inside `update()`, so a set's cache write is in place when the
 * merge reads previous values synchronously. `Promise.all(promises.map((p) => p()))` invokes the
 * thunks in array order, so array order is execution order.
 */
describe('A5: get() on the public Onyx export', () => {
    // The five existing call sites reach in through `react-native-onyx/dist/OnyxUtils`, which is not part of
    // the package's public surface. These two guard the patch hunk that puts `get` on the exported object,
    // so a regenerated patch that drops it fails here rather than in whichever conversion imported it.
    it('exposes get as a function', () => {
        expect(typeof Onyx.get).toBe('function');
    });

    it('returns the same value as the deep import it replaces', async () => {
        await Onyx.merge(KEY, {primaryLogin: 'public@example.com'});

        expect(Onyx.get(KEY)).toEqual(OnyxUtils.get(KEY));
        expect(Onyx.get(KEY)?.primaryLogin).toBe('public@example.com');
    });
});

describe('A2: update() operation ordering', () => {
    it('applies a merge on top of a set on the same key in one batch', async () => {
        await Onyx.update([
            {onyxMethod: Onyx.METHOD.SET, key: REPORT_A, value: {reportID: 'A', total: 100}},
            {onyxMethod: Onyx.METHOD.MERGE, key: REPORT_A, value: {total: 200}},
        ]);

        expect(OnyxUtils.get(REPORT_A)?.reportID).toBe('A');
        expect(OnyxUtils.get(REPORT_A)?.total).toBe(200);
    });

    it('lets a set discard a merge queued earlier in the same batch', async () => {
        await Onyx.merge(REPORT_A, {reportID: 'A', total: 100});

        await Onyx.update([
            {onyxMethod: Onyx.METHOD.MERGE, key: REPORT_A, value: {total: 200}},
            {onyxMethod: Onyx.METHOD.SET, key: REPORT_A, value: {reportID: 'A'}},
        ]);

        expect(OnyxUtils.get(REPORT_A)?.reportID).toBe('A');
        expect(OnyxUtils.get(REPORT_A)?.total).toBeUndefined();
    });

    it('keeps both members correct when one is set and another merged in the same collection', async () => {
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
            [REPORT_A]: {reportID: 'A', total: 1},
            [REPORT_B]: {reportID: 'B', total: 2},
        });

        await Onyx.update([
            {onyxMethod: Onyx.METHOD.SET, key: REPORT_A, value: {reportID: 'A', total: 10}},
            {onyxMethod: Onyx.METHOD.MERGE, key: REPORT_B, value: {total: 20}},
        ]);

        // The set replaces A wholesale; the merge keeps B's untouched fields.
        expect(OnyxUtils.get(REPORT_A)).toEqual({reportID: 'A', total: 10});
        expect(OnyxUtils.get(REPORT_B)?.reportID).toBe('B');
        expect(OnyxUtils.get(REPORT_B)?.total).toBe(20);
    });

    it('exposes the set before the merge to a whole-collection subscriber', async () => {
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
            [REPORT_A]: {reportID: 'A', total: 1},
            [REPORT_B]: {reportID: 'B', total: 2},
        });

        const snapshots: Array<Record<string, Report | undefined>> = [];
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.COLLECTION.REPORT,
            callback: (collection) => {
                snapshots.push({...collection});
            },
        });
        await waitForBatchedUpdates();
        snapshots.length = 0;

        await Onyx.update([
            {onyxMethod: Onyx.METHOD.SET, key: REPORT_A, value: {reportID: 'A', total: 10}},
            {onyxMethod: Onyx.METHOD.MERGE, key: REPORT_B, value: {total: 20}},
        ]);
        await waitForBatchedUpdates();

        Onyx.disconnect(connection);

        // Recorded as an observation: the set lands in its own notification first, so by the time the
        // merge notifies, A's new value is already in the collection the subscriber sees.
        expect(snapshots.length).toBeGreaterThan(0);
        expect(snapshots.at(0)?.[REPORT_A]?.total).toBe(10);
        expect(snapshots.at(-1)?.[REPORT_A]?.total).toBe(10);
        expect(snapshots.at(-1)?.[REPORT_B]?.total).toBe(20);
    });
});

/**
 * Validation step A3. The patch flushes pending merge queues in `clear()`. `clear()` runs on sign-out
 * and on cache reset, so a merge in flight must not survive it.
 * Related: https://github.com/callstack-internal/expensify-issues/issues/2813
 */
describe('A3: clear() and pending merges', () => {
    it('does not let a merge started before clear() resurrect the key', async () => {
        await Onyx.merge(REPORT_A, {reportID: 'A', total: 1});

        const merged = Onyx.merge(REPORT_A, {total: 2});
        const cleared = Onyx.clear();
        await Promise.all([merged, cleared]);
        await waitForBatchedUpdates();

        expect(OnyxUtils.get(REPORT_A)).toBeUndefined();
    });

    it('keeps a merge issued after clear() in the same tick', async () => {
        await Onyx.merge(REPORT_A, {reportID: 'A', total: 1});

        const cleared = Onyx.clear();
        const merged = Onyx.merge(REPORT_A, {reportID: 'A', total: 3});
        await Promise.all([cleared, merged]);
        await waitForBatchedUpdates();

        expect(OnyxUtils.get(REPORT_A)?.total).toBe(3);
    });

    it('does not resurrect a key that a concurrent update() deleted', async () => {
        await Onyx.merge(REPORT_A, {reportID: 'A', total: 1});

        // The shape reported in callstack-internal/expensify-issues#2813.
        const deleted = Onyx.update([{onyxMethod: Onyx.METHOD.MERGE, key: REPORT_A, value: null}]);
        const merged = Onyx.merge(REPORT_A, {total: 2});
        await Promise.all([deleted, merged]);
        await waitForBatchedUpdates();

        expect(OnyxUtils.get(REPORT_A)).toBeUndefined();
    });
});
