/* eslint-disable no-console */
// The Onyx write methods are wrapped for timing here, this module never writes data of its own.
/* eslint-disable rulesdir/prefer-actions-set-data */
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {OnyxMergeCollectionInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Times every Onyx write that appends to `personalDetailsList` so we can correlate the merge duration
 * with how many keys the object already holds. Patches Onyx at startup instead of touching every
 * call site, so both local merges and server-driven updates are covered.
 *
 * Every append is then mirrored into the `personalDetailsShadow_` collection and timed the same way,
 * so the single-key and collection shapes can be compared on identical data. The mirror is
 * write-only — nothing subscribes to it, so it cannot affect app behaviour.
 */

const SHADOW_KEY = ONYXKEYS.COLLECTION.PERSONAL_DETAILS_SHADOW;

let existingKeyCount = 0;

/** Account IDs written to the shadow collection, so we can report its size without subscribing to it */
const shadowAccountIDs = new Set<string>();

let hasSeededShadowCollection = false;

function countKeys(value: unknown): number {
    return typeof value === 'object' && value !== null ? Object.keys(value).length : 0;
}

/** Onyx writes are loosely typed at the patch boundary, so narrow to the shape we can mirror */
function isPersonalDetailsChanges(value: unknown): value is PersonalDetailsList {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// console.log instead of Log.info: Log's client callback uses console.debug, which is hidden
// behind the Verbose level in Chrome DevTools.
function measure<T>(source: string, existingKeys: number, incomingKeys: number, extraParams: Record<string, unknown>, promise: Promise<T>): Promise<T> {
    const startTime = performance.now();

    return promise.finally(() => {
        console.log('[PersonalDetailsListPerf] append', {
            source,
            existingKeys,
            incomingKeys,
            durationMs: Math.round((performance.now() - startTime) * 100) / 100,
            ...extraParams,
        });
    });
}

function mergeShadowCollection(source: string, changes: PersonalDetailsList, extraParams: Record<string, unknown>) {
    const accountIDs = Object.keys(changes);

    if (accountIDs.length === 0) {
        return;
    }

    // Read before mutating, so it matches how the single-key path reports `existingKeys`
    const existingKeys = shadowAccountIDs.size;

    const collection: OnyxMergeCollectionInput<typeof SHADOW_KEY> = {};
    for (const accountID of accountIDs) {
        collection[`${SHADOW_KEY}${accountID}`] = changes[accountID];

        if (changes[accountID] === null) {
            shadowAccountIDs.delete(accountID);
        } else {
            shadowAccountIDs.add(accountID);
        }
    }

    measure(source, existingKeys, accountIDs.length, extraParams, Onyx.mergeCollection(SHADOW_KEY, collection));
}

/**
 * Mirrors an append after the single-key write settles. Running them concurrently would make the two
 * shapes fight over the same JS thread and storage, so neither measurement would mean anything.
 */
function mirrorAfter<T>(promise: Promise<T>, changes: PersonalDetailsList, extraParams: Record<string, unknown>): Promise<T> {
    return promise.finally(() => {
        mergeShadowCollection('collection', changes, extraParams);
    });
}

Onyx.connectWithoutView({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        existingKeyCount = value ? Object.keys(value).length : 0;

        // The shadow collection has to start from the same data as the single key, otherwise every
        // measurement would compare an append to N keys against an append to an almost empty collection.
        if (hasSeededShadowCollection || !value || existingKeyCount === 0) {
            return;
        }
        hasSeededShadowCollection = true;
        mergeShadowCollection('collection-seed', value, {});
    },
});

let isInstrumented = false;

export default function instrumentPersonalDetailsMerge() {
    // Fast Refresh can re-run setup, and wrapping twice would log every write twice
    if (isInstrumented) {
        return;
    }
    isInstrumented = true;
    console.log('[PersonalDetailsListPerf] instrumentation installed');

    const originalMerge = Onyx.merge;
    const originalUpdate = Onyx.update;

    Onyx.merge = ((key, changes) => {
        const promise = originalMerge(key, changes);

        if (key !== ONYXKEYS.PERSONAL_DETAILS_LIST) {
            return promise;
        }

        const measuredPromise = measure('single-key', existingKeyCount, countKeys(changes), {}, promise);

        return isPersonalDetailsChanges(changes) ? mirrorAfter(measuredPromise, changes, {}) : measuredPromise;
    }) as typeof Onyx.merge;

    Onyx.update = ((updates) => {
        const promise = originalUpdate(updates);
        const personalDetailsUpdates = updates.filter((update) => update.key === ONYXKEYS.PERSONAL_DETAILS_LIST);

        if (personalDetailsUpdates.length === 0) {
            return promise;
        }

        // ponytail: an Onyx.update batch resolves as a whole, so durationMs covers the sibling keys too.
        // `updatesInBatch` is logged to spot the noisy samples; measure the isolated cost inside Onyx if that is not enough.
        const extraParams = {updatesInBatch: updates.length};
        const changes: PersonalDetailsList = {};
        for (const update of personalDetailsUpdates) {
            if (isPersonalDetailsChanges(update.value)) {
                Object.assign(changes, update.value);
            }
        }
        const measuredPromise = measure('single-key', existingKeyCount, countKeys(changes), extraParams, promise);

        return mirrorAfter(measuredPromise, changes, extraParams);
    }) as typeof Onyx.update;
}
