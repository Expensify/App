import Onyx from 'react-native-onyx';
import type {DeferredUpdatesDictionary} from '@libs/actions/OnyxUpdateManager/types';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer, Response} from '@src/types/onyx';
import {isValidOnyxUpdateFromServer} from '@src/types/onyx/OnyxUpdatesFromServer';
// eslint-disable-next-line import/no-cycle
import * as OnyxUpdateManagerUtils from '.';

let missingOnyxUpdatesQueryPromise: Promise<Response | Response[] | void> | undefined;
let deferredUpdates: DeferredUpdatesDictionary = {};

/**
 * Returns the promise that fetches the missing onyx updates
 * @returns the promise
 */
function getMissingOnyxUpdatesQueryPromise() {
    return missingOnyxUpdatesQueryPromise;
}

/**
 * Sets the promise that fetches the missing onyx updates
 */
function setMissingOnyxUpdatesQueryPromise(promise: Promise<Response | Response[] | void>) {
    missingOnyxUpdatesQueryPromise = promise;
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
 * Returns a boolean indicating whether the deferred updates queue is empty
 * @returns a boolean indicating whether the deferred updates queue is empty
 */
function isEmpty() {
    return Object.keys(deferredUpdates).length === 0;
}

/**
 * Manually processes and applies the updates from the deferred updates queue. (used e.g. for push notifications)
 */
function process() {
    if (missingOnyxUpdatesQueryPromise) {
        missingOnyxUpdatesQueryPromise.finally(() => OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates);
    }

    missingOnyxUpdatesQueryPromise = OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates();
}

type EnqueueDeferredOnyxUpdatesOptions = {
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
function enqueue(updates: OnyxUpdatesFromServer | DeferredUpdatesDictionary, options?: EnqueueDeferredOnyxUpdatesOptions) {
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

type ClearDeferredOnyxUpdatesOptions = {
    shouldResetGetMissingOnyxUpdatesPromise?: boolean;
    shouldUnpauseSequentialQueue?: boolean;
};

/**
 * Clears the deferred updates queue and unpauses the SequentialQueue
 * @param shouldUnpauseSequentialQueue Whether the SequentialQueue should be unpaused after clearing the deferred updates
 */
function clear(options?: ClearDeferredOnyxUpdatesOptions) {
    deferredUpdates = {};

    if (options?.shouldResetGetMissingOnyxUpdatesPromise ?? true) {
        missingOnyxUpdatesQueryPromise = undefined;
    }

    if (options?.shouldUnpauseSequentialQueue ?? true) {
        Onyx.set(ONYXKEYS.ONYX_UPDATES_FROM_SERVER, null);
        SequentialQueue.unpause();
    }
}

const DeferredOnyxUpdates = {getMissingOnyxUpdatesQueryPromise, setMissingOnyxUpdatesQueryPromise, getUpdates, isEmpty, enqueue, clear, process};

export default DeferredOnyxUpdates;
