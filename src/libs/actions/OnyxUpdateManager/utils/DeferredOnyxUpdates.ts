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

type GetDeferredOnyxUpdatesOptiosn = {
    minUpdateID?: number;
};

/**
 * Returns the deferred updates that are currently in the queue
 * @param minUpdateID An optional minimum update ID to filter the deferred updates by
 * @returns
 */
function getUpdates(options?: GetDeferredOnyxUpdatesOptiosn) {
    if (options?.minUpdateID == null) {
        return deferredUpdates;
    }

    return Object.entries(deferredUpdates).reduce<DeferredUpdatesDictionary>((acc, [lastUpdateID, update]) => {
        if (Number(lastUpdateID) > (options.minUpdateID)) {
            acc[Number(lastUpdateID)] = update;
        }
        return acc;
    }, {});
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
    shouldPauseSequentialQueue?: boolean;
};

/**
 * Allows adding onyx updates to the deferred updates queue manually.
 * @param updates The updates that should be applied (e.g. updates from push notifications)
 * @param options additional flags to change the behaviour of this function
 */
function enqueue(updates: OnyxUpdatesFromServer | DeferredUpdatesDictionary, options?: EnqueueDeferredOnyxUpdatesOptions) {
    if (options?.shouldPauseSequentialQueue ?? true) {
        SequentialQueue.pause();
    }

    // We check here if the "updates" param is a single update.
    // If so, we only need to insert one update into the deferred updates queue.
    if (isValidOnyxUpdateFromServer(updates)) {
        const lastUpdateID = Number(updates.lastUpdateID);
        deferredUpdates[lastUpdateID] = updates;
    } else {
        // If the "updates" param is an object, we need to insert multiple updates into the deferred updates queue.
        Object.entries(updates).forEach(([lastUpdateIDString, update]) => {
            const lastUpdateID = Number(lastUpdateIDString);
            if (deferredUpdates[lastUpdateID]) {
                return;
            }

            deferredUpdates[lastUpdateID] = update;
        });
    }
}

/**
 * Adds updates to the deferred updates queue and processes them immediately
 * @param updates The updates that should be applied (e.g. updates from push notifications)
 */
function enqueueAndProcess(updates: OnyxUpdatesFromServer | DeferredUpdatesDictionary, options?: EnqueueDeferredOnyxUpdatesOptions) {
    enqueue(updates, options);
    process();
}

type ClearDeferredOnyxUpdatesOptions = {
    shouldResetGetMissingOnyxUpdatesPromise?: boolean;
    shouldUnpauseSequentialQueue?: boolean;
};

/**
 * Clears the deferred updates queue and unpauses the SequentialQueue
 * @param options additional flags to change the behaviour of this function
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

export {getMissingOnyxUpdatesQueryPromise, setMissingOnyxUpdatesQueryPromise, getUpdates, isEmpty, process, enqueue, enqueueAndProcess, clear};
