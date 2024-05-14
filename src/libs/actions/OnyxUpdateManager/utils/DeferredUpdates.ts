import Onyx from 'react-native-onyx';
import type {DeferredUpdatesDictionary} from '@libs/actions/OnyxUpdateManager/types';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer, Response} from '@src/types/onyx';
import {isValidOnyxUpdateFromServer} from '@src/types/onyx/OnyxUpdatesFromServer';
// eslint-disable-next-line import/no-cycle
import * as OnyxUpdateManagerUtils from '.';

let fetchMissingOnyxUpdatesPromise: Promise<Response | Response[] | void> | undefined;
let deferredUpdates: DeferredUpdatesDictionary = {};

/**
 * Returns the promise that fetches the missing onyx updates
 * @returns the promise
 */
function getFetchMissingOnyxUpdatesPromise() {
    return fetchMissingOnyxUpdatesPromise;
}

/**
 * Sets the promise in which the missing onyx updates are being fetched
 */
function setFetchMissingOnyxUpdatesPromise(promise: Promise<Response | Response[] | void>) {
    fetchMissingOnyxUpdatesPromise = promise;
}

/**
 * Returns the deferred updates that are currently in the queue
 * @param minUpdateID An optional minimum update ID to filter the deferred updates by
 * @returns
 */
function getUpdates(minUpdateID?: number) {
    if (minUpdateID == null) {
        return deferredUpdates;
    }

    return Object.entries(deferredUpdates).reduce<DeferredUpdatesDictionary>(
        (accUpdates, [lastUpdateID, update]) => ({
            ...accUpdates,
            ...(Number(lastUpdateID) > minUpdateID ? {[Number(lastUpdateID)]: update} : {}),
        }),
        {},
    );
}

/**
 * Get the number of deferred updates before adding the new one
 * @returns the count of deferred updates in the queue
 */
function getCount() {
    return Object.keys(deferredUpdates).length;
}

/**
 * Manually processes and applies the updates from the deferred updates queue. (used e.g. for push notifications)
 */
function process() {
    if (fetchMissingOnyxUpdatesPromise) {
        fetchMissingOnyxUpdatesPromise.finally(() => OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates);
    }

    fetchMissingOnyxUpdatesPromise = OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates();
}

type EnqueueDeferredUpdatesOptions = {
    shouldProcessUpdates?: boolean;
    shouldPauseSequentialQueue?: boolean;
};

/**
 * Allows adding onyx updates to the deferred updates queue manually.
 * By default, this will automatically process the updates. Setting "shouldProcessUpdates" to false will prevent this.
 * @param updates The updates that should be applied (e.g. updates from push notifications)
 * @param shouldProcessUpdates Whether the updates should be processed immediately
 * @returns
 */
function enqueue(updates: OnyxUpdatesFromServer | DeferredUpdatesDictionary, options?: EnqueueDeferredUpdatesOptions) {
    if (options?.shouldPauseSequentialQueue ?? true) {
        SequentialQueue.pause();
    }

    if (isValidOnyxUpdateFromServer(updates)) {
        const lastUpdateID = Number(updates.lastUpdateID);
        deferredUpdates[lastUpdateID] = updates;
    } else {
        Object.entries(updates).forEach(([lastUpdateIDString, update]) => {
            const lastUpdateID = Number(lastUpdateIDString);
            if (deferredUpdates[lastUpdateID]) {
                return;
            }

            deferredUpdates[lastUpdateID] = update;
        });
    }

    if (options?.shouldProcessUpdates ?? true) {
        process();
    }
}

type ClearDeferredUpdatesOptions = {
    shouldResetGetMissingOnyxUpdatesPromise?: boolean;
    shouldUnpauseSequentialQueue?: boolean;
};

/**
 * Clears the deferred updates queue and unpauses the SequentialQueue
 * @param shouldUnpauseSequentialQueue Whether the SequentialQueue should be unpaused after clearing the deferred updates
 */
function clear(options?: ClearDeferredUpdatesOptions) {
    deferredUpdates = {};

    if (options?.shouldResetGetMissingOnyxUpdatesPromise ?? true) {
        fetchMissingOnyxUpdatesPromise = undefined;
    }

    if (options?.shouldUnpauseSequentialQueue ?? true) {
        Onyx.set(ONYXKEYS.ONYX_UPDATES_FROM_SERVER, null);
        SequentialQueue.unpause();
    }
}

const DeferredUpdates = {getFetchMissingOnyxUpdatesPromise, setFetchMissingOnyxUpdatesPromise, getUpdates, getCount, enqueue, clear, process};

export default DeferredUpdates;
