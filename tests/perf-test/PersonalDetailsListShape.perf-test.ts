import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';

import Onyx from 'react-native-onyx';
import {measureAsyncFunction} from 'reassure';

import createPersonalDetails from '../utils/collections/personalDetails';

/**
 * A/B for the two shapes `personalDetailsList` could have, on identical data:
 *   - single key    — one object at `personalDetailsList` holding every member (today)
 *   - collection    — one Onyx key per member under `personalDetailsShadow_`
 *
 * Jest resolves Onyx storage to `MemoryOnlyProvider`, so these numbers are the JS-side cost only:
 * `mergeChanges` allocating a full copy, `cache.hasValueChanged` deep-equalling the result, and the
 * subscriber broadcast. IndexedDB/SQLite write cost is not included — see
 * `src/libs/telemetry/instrumentPersonalDetailsMerge.ts` for real-device numbers.
 */

const COLLECTION_KEY = ONYXKEYS.COLLECTION.PERSONAL_DETAILS_SHADOW;

/** Member counts to seed before appending, spanning a small account up to a large domain */
const SIZES = [1000, 5000, 20000];

/**
 * Both shapes carry this many subscribers, and every one of them watches the member being written, so
 * both broadcast to the same 50 callbacks. That is deliberately conservative: it throws away the
 * collection's real advantage — a member change wakes only that member's watchers, where the single key
 * wakes all ~300 of its subscribers — so whatever gap remains is merge/deep-equal/storage cost alone.
 */
const SUBSCRIBER_COUNT = 50;

/** The member every write targets, and every subscriber watches. Must exist before subscribing. */
const TARGET_ACCOUNT_ID = 0;

/** Non-nullable values, so the same data can seed both a `merge` and a `mergeCollection` without a cast */
function buildMembers(size: number): Record<number, PersonalDetails> {
    const members: Record<number, PersonalDetails> = {};
    for (let i = 0; i < size; i++) {
        members[i] = createPersonalDetails(i);
    }
    return members;
}

function toCollection(members: Record<number, PersonalDetails>): Record<`${typeof COLLECTION_KEY}${number}`, PersonalDetails> {
    const collection: Record<`${typeof COLLECTION_KEY}${number}`, PersonalDetails> = {};
    for (const [accountID, member] of Object.entries(members)) {
        collection[`${COLLECTION_KEY}${Number(accountID)}`] = member;
    }
    return collection;
}

/**
 * `reuseConnection: false` matters: identical key + config would otherwise be deduped into one shared
 * connection by OnyxConnectionManager, collapsing the fleet to a single subscriber.
 */
function subscribeAll(key: typeof ONYXKEYS.PERSONAL_DETAILS_LIST | `${typeof COLLECTION_KEY}${number}`): () => void {
    const connections = Array.from({length: SUBSCRIBER_COUNT}, () =>
        Onyx.connectWithoutView({
            key,
            reuseConnection: false,
            callback: (value) => value,
        }),
    );

    return () => {
        for (const connection of connections) {
            Onyx.disconnect(connection);
        }
    };
}

/**
 * Each iteration has to write a value that differs from the last one, otherwise `hasValueChanged`
 * short-circuits and both the storage write and the broadcast are skipped — measuring nothing.
 */
function makeWrite(accountID: number): (iteration: number) => Partial<PersonalDetails> {
    return (iteration) => ({accountID, displayName: `written-${iteration}`});
}

describe('personalDetailsList shape', () => {
    afterEach(() => Onyx.clear());

    describe.each(SIZES)('%i existing members', (size) => {
        test('single key: write one member', async () => {
            const members = buildMembers(size);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, members);
            const unsubscribe = subscribeAll(ONYXKEYS.PERSONAL_DETAILS_LIST);

            const write = makeWrite(TARGET_ACCOUNT_ID);
            let iteration = 0;

            await measureAsyncFunction(() => Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[TARGET_ACCOUNT_ID]: write(iteration++)}));

            unsubscribe();
        });

        test('collection: write one member', async () => {
            const members = buildMembers(size);
            await Onyx.mergeCollection(COLLECTION_KEY, toCollection(members));
            const unsubscribe = subscribeAll(`${COLLECTION_KEY}${TARGET_ACCOUNT_ID}`);

            const write = makeWrite(TARGET_ACCOUNT_ID);
            let iteration = 0;

            await measureAsyncFunction(() => Onyx.merge(`${COLLECTION_KEY}${TARGET_ACCOUNT_ID}`, write(iteration++)));

            unsubscribe();
        });
    });
});
