import Log from '@libs/Log';
import {isRecord} from '@libs/ObjectUtils';

import CONFIG from '@src/CONFIG';
import type {OnyxCollectionKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';
import onyxValueUtils from 'react-native-onyx/dist/utils';

// In this file we manage a queue of Onyx updates while the SequentialQueue is processing. There are functions to get the updates and clear the queue after saving the updates in Onyx.

let queuedOnyxUpdates: AnyOnyxUpdate[] = [];
let currentAccountID: number | undefined;

// Queued WRITE updates only land in Onyx when flushQueue() runs, so we track a promise that settles with that
// flush. OnyxUpdates.apply uses it to hold the lastUpdateID watermark back until the data is actually applied.
let flushPromise: Promise<void> | null = null;
let resolveFlushPromise: (() => void) | undefined;
let rejectFlushPromise: ((error: unknown) => void) | undefined;

// We use `connectWithoutView` because it is not connected to any UI component.
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        currentAccountID = session?.accountID;
    },
});

/**
 * @param updates Onyx updates to queue for later
 */
function queueOnyxUpdates<TKey extends OnyxKey>(updates: Array<OnyxUpdate<TKey>>): Promise<void> {
    queuedOnyxUpdates = queuedOnyxUpdates.concat(updates);

    if (!flushPromise) {
        flushPromise = new Promise<void>((resolve, reject) => {
            resolveFlushPromise = resolve;
            rejectFlushPromise = reject;
        });
        // Not every queued batch has a watermark waiting on it, so keep a no-op handler to avoid unhandled rejections.
        flushPromise.catch(() => {});
    }

    return Promise.resolve();
}

/**
 * Returns a promise that settles when the currently queued updates are flushed to Onyx, or an already-resolved
 * promise when nothing is queued.
 */
function getCurrentFlushPromise(): Promise<void> {
    return flushPromise ?? Promise.resolve();
}

function flushQueue(): Promise<void> {
    let copyUpdates = [...queuedOnyxUpdates];
    const resolveCurrentFlush = resolveFlushPromise;
    const rejectCurrentFlush = rejectFlushPromise;

    // Clear queue immediately to prevent race conditions with new updates during Onyx processing
    queuedOnyxUpdates = [];
    flushPromise = null;
    resolveFlushPromise = undefined;
    rejectFlushPromise = undefined;

    if (!currentAccountID && !CONFIG.IS_TEST_ENV) {
        const preservedKeys = new Set<OnyxKey>([
            ONYXKEYS.NVP_TRY_NEW_DOT,
            ONYXKEYS.NVP_TRY_FOCUS_MODE,
            ONYXKEYS.PREFERRED_THEME,
            ONYXKEYS.NVP_PREFERRED_LOCALE,
            ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING,
            ONYXKEYS.SESSION,
            ONYXKEYS.IS_LOADING_APP,
            ONYXKEYS.HAS_LOADED_APP,
            ONYXKEYS.CREDENTIALS,
            ONYXKEYS.RAM_ONLY_IS_SIDEBAR_LOADED,
            ONYXKEYS.ACCOUNT,
            ONYXKEYS.RAM_ONLY_IS_CHECKING_PUBLIC_ROOM,
            ONYXKEYS.MODAL,
            ONYXKEYS.NETWORK,
            ONYXKEYS.PRESERVED_USER_SESSION,
        ]);

        copyUpdates = copyUpdates.filter((update) => preservedKeys.has(update.key as OnyxKey));
    }
    // WRITE requests gate their lastUpdateID watermark advance on this flush (see OnyxUpdates.apply), so a
    // failure here keeps the watermark back and the next reconnect can refetch and reapply the missed updates.
    return Onyx.update(copyUpdates)
        .then(() => resolveCurrentFlush?.())
        .catch((error: unknown) => {
            Log.alert('[OnyxUpdateManagerError] Deferred WRITE Onyx update failed to apply, not advancing lastUpdateID so the client can recover on the next reconnect', {
                error: error instanceof Error ? error.message : String(error),
            });
            rejectCurrentFlush?.(error);
            throw error;
        });
}

/** Read a buffered pagination value. A deletion returns undefined. A whole-collection replacement makes the result indeterminate (null). */
function getQueuedCollectionMember<T extends Record<string, unknown> | unknown[]>(
    collectionKey: OnyxCollectionKey,
    id: string,
    cached: T,
    isValue: (value: unknown) => value is T,
): T | null | undefined {
    if (!queuedOnyxUpdates.length) {
        return cached;
    }

    const key = `${collectionKey}${id}`;
    let current: T | undefined = queuedOnyxUpdates.some((update) => update.onyxMethod === Onyx.METHOD.CLEAR) ? undefined : cached;
    for (const update of queuedOnyxUpdates) {
        // Onyx batches writes differently for one member and several. A whole-collection replacement can win over a later member set.
        if (update.onyxMethod === Onyx.METHOD.SET_COLLECTION && update.key === collectionKey) {
            return null;
        }
        const isMultiSet = update.onyxMethod === Onyx.METHOD.MULTI_SET;
        const isCollectionMerge = update.onyxMethod === Onyx.METHOD.MERGE_COLLECTION && update.key === collectionKey;
        let value: unknown = update.value;
        if (isMultiSet || isCollectionMerge) {
            value = isRecord(value) ? value[key] : undefined;
        } else if (update.key !== key || (update.onyxMethod !== Onyx.METHOD.MERGE && update.onyxMethod !== Onyx.METHOD.SET)) {
            continue;
        }
        if (value === null) {
            current = undefined;
        } else if (isValue(value)) {
            const shouldMerge = isCollectionMerge || update.onyxMethod === Onyx.METHOD.MERGE;
            current = onyxValueUtils.fastMerge<T | undefined>(shouldMerge ? current : undefined, value, {shouldRemoveNestedNulls: true, objectRemovalMode: 'replace'}).result;
        } else if (value !== undefined) {
            Log.hmmm('[Pagination] Ignoring a buffered value with an unexpected shape', {collectionKey, method: update.onyxMethod});
        }
    }
    return current;
}

function isEmpty() {
    return queuedOnyxUpdates.length === 0;
}

export {queueOnyxUpdates, flushQueue, getCurrentFlushPromise, getQueuedCollectionMember, isEmpty};
