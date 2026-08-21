// The Onyx write methods are wrapped for timing here, this module never writes data of its own.
/* eslint-disable rulesdir/prefer-actions-set-data */
import Log from '@libs/Log';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {OnyxMergeCollectionInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {notePersonalDetailsWrite} from './renderTimings';

/**
 * Times every Onyx write that appends to `personalDetailsList` so we can correlate the merge duration
 * with how many keys the object already holds. Patches Onyx at startup instead of touching every
 * call site, so both local merges and server-driven updates are covered.
 *
 * Every write is then mirrored into the `personalDetailsShadow_` collection and timed the same way, so
 * the single-key and collection shapes can be compared on identical data. Nothing in the app reads the
 * mirror, so it cannot affect app behaviour.
 *
 * REQUIRES A COLD START when measuring writes: clear site data (or at least every `personalDetailsShadow_`
 * key) before each run. For the write experiment the mirror must *not* be pre-seeded from the existing
 * list — it accumulates only from the writes it observes, so both shapes see the identical write sequence
 * starting from empty. If stale mirror data survives from a previous run, every mirror write finds the
 * member already byte-identical, `hasValueChanged` short-circuits it, and the collection posts near-zero
 * durations against real single-key writes. That is a silent failure, so every collection sample logs
 * `changedMembers`: pair a single-key line with a collection line only when their changed counts match.
 *
 * The READ experiment needs the opposite: components reading `personalDetailsShadow_` need real data, and
 * an unseeded mirror would hand them `undefined` forever — which reads as a huge render-count win purely
 * because nothing ever changes. `SHOULD_SEED_MIRROR_FOR_READS` seeds it once from the live list for that
 * case. A seeded run's write samples are meaningless, so every line carries `wasSeeded`: only trust a
 * write duration when it is `false`.
 *
 * A synthetic subscriber fleet is attached to the mirror because the comparison is otherwise rigged:
 * the single key broadcasts every write to its ~300 real subscribers, and a mirror with none would
 * win on that alone. Each synthetic subscriber watches one member key, which is what the migration
 * would produce. `shadowSubscribers` is logged on every line so a run is self-describing; set it to 0
 * to measure the write path in isolation.
 */

const SHADOW_KEY = ONYXKEYS.COLLECTION.PERSONAL_DETAILS_SHADOW;

/** Set to `false` to go back to measuring write cost, which requires an unseeded mirror. See the note above. */
const SHOULD_SEED_MIRROR_FOR_READS = true;

/**
 * Kept in the same order of magnitude as the real `personalDetailsList` subscriber count. Grep
 * `ONYXKEYS.PERSONAL_DETAILS_LIST` under src/ to re-check it before trusting a run.
 */
const SHADOW_SUBSCRIBER_COUNT = 300;

let existingKeyCount = 0;

/**
 * Account ID -> serialised value last written to the mirror. A Set of IDs was not enough: knowing an ID
 * was mirrored before says nothing about whether the incoming value differs, and Onyx short-circuits on
 * value equality, not key presence. Keeping the value lets each sample report how many members were
 * genuinely written (`changedMembers`) versus how many the collection path skipped for free.
 */
const mirroredMembers = new Map<string, string>();

const shadowConnections: Array<ReturnType<typeof Onyx.connectWithoutView>> = [];

function countKeys(value: unknown): number {
    return typeof value === 'object' && value !== null ? Object.keys(value).length : 0;
}

/** Onyx writes are loosely typed at the patch boundary, so narrow to the shape we can mirror */
function isPersonalDetailsChanges(value: unknown): value is PersonalDetailsList {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Measured writes currently in flight. Anything above zero means this sample is sharing the JS thread
 * and the IndexedDB write queue with another sample — and if the other one is a merge to the same key,
 * Onyx's `mergeQueue` hands both callers the *same* promise, so both "durations" end at one instant and
 * neither is the cost of its own write.
 */
let inFlightWrites = 0;

/** True once the mirror was bulk-copied from the live list, which voids write durations for the rest of the run. */
let hasSeededMirror = false;

// Flushed immediately (`sendNow`) so samples are greppable in VictoriaLogs mid-run instead of waiting for
// the 10-minute flush. The flush costs a serialise + request per sample, which lands after the write it
// times but before later ones — read `comparable`/`concurrentWrites` before trusting a duration.
function measure<T>(source: string, existingKeys: number, incomingKeys: number, extraParams: Record<string, unknown>, promise: Promise<T>): Promise<T> {
    const startTime = performance.now();
    const concurrentWrites = inFlightWrites;
    inFlightWrites++;

    // Only the single-key write can re-render a component reading `personalDetailsList`. Counting the mirror
    // write too would double the denominator and halve every `updatesPerWrite`.
    if (source === 'single-key') {
        notePersonalDetailsWrite();
    }

    return promise.finally(() => {
        inFlightWrites--;
        Log.info('[PersonalDetailsListPerf] write', true, {
            source,
            existingKeys,
            incomingKeys,
            durationMs: Math.round((performance.now() - startTime) * 100) / 100,
            // Filter on this. `false` means the sample overlapped another measured write, so its duration
            // is contention plus possible `mergeQueue` promise-sharing, not the cost of the write it names.
            // It does NOT judge whether the paired write did equivalent work — compare `changedMembers`
            // between the two sources for that.
            comparable: concurrentWrites === 0,
            concurrentWrites,
            // A seeded mirror short-circuits unchanged members, so a `true` here voids this sample's duration.
            wasSeeded: hasSeededMirror,
            ...extraParams,
        });
    });
}

function mergeShadowCollection(source: string, changes: PersonalDetailsList, extraParams: Record<string, unknown>): Promise<unknown> {
    const accountIDs = Object.keys(changes);

    if (accountIDs.length === 0) {
        return Promise.resolve();
    }

    // Read before mutating, so it matches how the single-key path reports `existingKeys`
    const existingKeys = mirroredMembers.size;

    // `mergeCollection` cannot carry a null member, so removals go out as individual member merges.
    // They are applied for mirror correctness but left untimed — appends are what's being measured.
    const collection: OnyxMergeCollectionInput<typeof SHADOW_KEY> = {};
    let upsertCount = 0;
    let changedMembers = 0;
    for (const accountID of accountIDs) {
        const member = changes[accountID];

        if (member === null) {
            mirroredMembers.delete(accountID);
            Onyx.merge(`${SHADOW_KEY}${accountID}`, null);
            continue;
        }

        // Onyx short-circuits a member whose value is unchanged, so only differing members cost anything.
        // This is what makes a collection sample comparable to the single-key one: the single key does real
        // work whenever *any* member differs, so the two are only equivalent if the changed counts match.
        const serialised = JSON.stringify(member);
        if (mirroredMembers.get(accountID) !== serialised) {
            changedMembers++;
        }
        mirroredMembers.set(accountID, serialised);

        collection[`${SHADOW_KEY}${accountID}`] = member;
        upsertCount++;
    }

    if (upsertCount === 0) {
        return Promise.resolve();
    }

    return measure(source, existingKeys, upsertCount, {...extraParams, shadowSubscribers: shadowConnections.length, changedMembers}, Onyx.mergeCollection(SHADOW_KEY, collection));
}

/**
 * Attached once the mirror first holds members, spread across the members written so far, so later
 * writes land on a subscribed key as often as they would after a migration.
 */
function attachShadowSubscribers() {
    const mirroredAccountIDs = [...mirroredMembers.keys()];

    if (mirroredAccountIDs.length === 0 || shadowConnections.length > 0) {
        return;
    }

    for (let i = 0; i < SHADOW_SUBSCRIBER_COUNT; i++) {
        const accountID = mirroredAccountIDs.at(i % mirroredAccountIDs.length);
        shadowConnections.push(
            Onyx.connectWithoutView({
                key: `${SHADOW_KEY}${accountID}` as const,
                // reuseConnection: false, or identical key+config would collapse the fleet into one connection
                reuseConnection: false,
                // Reading the value is the point: it's what a real per-member subscriber costs
                callback: (member) => member?.accountID,
            }),
        );
    }
}

/**
 * Every mirror write runs through this one chain. Two single-key merges to the same key inside one tick
 * share a `mergeQueue` promise, so both `.finally` callbacks fire at the same instant — without the chain
 * their mirrors would run concurrently and each would time the other's contention.
 */
let mirrorChain: Promise<unknown> = Promise.resolve();

/**
 * Mirrors a write after the single-key write settles. Running them concurrently would make the two
 * shapes fight over the same JS thread and storage, so neither measurement would mean anything.
 */
function mirrorAfter<T>(promise: Promise<T>, changes: PersonalDetailsList, extraParams: Record<string, unknown>): Promise<T> {
    return promise.finally(() => {
        mirrorChain = mirrorChain
            .then(() => mergeShadowCollection('collection', changes, extraParams))
            .then(attachShadowSubscribers)
            .catch(() => undefined);
    });
}

/**
 * Copies the live list into the mirror once, so components reading the collection get real data instead of
 * `undefined`. Untimed on purpose: it is setup for the read experiment, not a sample of it.
 */
function seedMirror(value: PersonalDetailsList | undefined) {
    if (!SHOULD_SEED_MIRROR_FOR_READS || hasSeededMirror || !value || Object.keys(value).length === 0) {
        return;
    }
    hasSeededMirror = true;

    const collection: OnyxMergeCollectionInput<typeof SHADOW_KEY> = {};
    for (const [accountID, member] of Object.entries(value)) {
        if (!member) {
            continue;
        }
        mirroredMembers.set(accountID, JSON.stringify(member));
        collection[`${SHADOW_KEY}${accountID}`] = member;
    }

    Log.info('[PersonalDetailsListPerf] mirror seeded for read comparison', true, {members: mirroredMembers.size});
    Onyx.mergeCollection(SHADOW_KEY, collection).then(attachShadowSubscribers);
}

// Tracks how many members the single key already holds, so each sample can be correlated with N.
Onyx.connectWithoutView({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        existingKeyCount = value ? Object.keys(value).length : 0;
        seedMirror(value);
    },
});

let isInstrumented = false;

export default function instrumentPersonalDetailsMerge() {
    // Fast Refresh can re-run setup, and wrapping twice would log every write twice
    if (isInstrumented) {
        return;
    }
    isInstrumented = true;
    Log.info('[PersonalDetailsListPerf] instrumentation installed', true);

    const originalMerge = Onyx.merge;
    const originalUpdate = Onyx.update;

    Onyx.merge = ((key, changes) => {
        const promise = originalMerge(key, changes);

        if (key !== ONYXKEYS.PERSONAL_DETAILS_LIST) {
            return promise;
        }

        const existingKeys = existingKeyCount;
        const measuredPromise = measure('single-key', existingKeys, countKeys(changes), {}, promise);

        return isPersonalDetailsChanges(changes) ? mirrorAfter(measuredPromise, changes, {}) : measuredPromise;
    }) as typeof Onyx.merge;

    Onyx.update = ((updates) => {
        const promise = originalUpdate(updates);
        const personalDetailsUpdates = updates.filter((update) => update.key === ONYXKEYS.PERSONAL_DETAILS_LIST);

        if (personalDetailsUpdates.length === 0) {
            return promise;
        }

        // An Onyx.update batch resolves as a whole, so durationMs covers the sibling keys too.
        // `updatesInBatch` is logged to spot the noisy samples; measure inside Onyx if that is not enough.
        const extraParams = {updatesInBatch: updates.length};
        const changes: PersonalDetailsList = {};
        for (const update of personalDetailsUpdates) {
            if (isPersonalDetailsChanges(update.value)) {
                Object.assign(changes, update.value);
            }
        }
        const existingKeys = existingKeyCount;
        const measuredPromise = measure('single-key', existingKeys, countKeys(changes), extraParams, promise);

        return mirrorAfter(measuredPromise, changes, extraParams);
    }) as typeof Onyx.update;
}
