import Onyx from 'react-native-onyx';
import type {DeferredUpdatesDictionary} from '@libs/actions/OnyxUpdateManager/types';
import Log from '@libs/Log';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer, Response} from '@src/types/onyx';
import {isValidOnyxUpdateFromServer} from '@src/types/onyx/OnyxUpdatesFromServer';
// eslint-disable-next-line import/no-cycle
import {validateAndApplyDeferredUpdates} from '.';

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

type GetDeferredOnyxUpdatesOptions = {
    minUpdateID?: number;
};

/**
 * Returns the deferred updates that are currently in the queue
 * @param minUpdateID An optional minimum update ID to filter the deferred updates by
 * @returns
 */
function getUpdates(options?: GetDeferredOnyxUpdatesOptions) {
    if (options?.minUpdateID == null) {
        return deferredUpdates;
    }

    return Object.entries(deferredUpdates).reduce<DeferredUpdatesDictionary>((acc, [lastUpdateID, update]) => {
        if (Number(lastUpdateID) > (options.minUpdateID ?? CONST.DEFAULT_NUMBER_ID)) {
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
        missingOnyxUpdatesQueryPromise.finally(() => validateAndApplyDeferredUpdates);
    }

    missingOnyxUpdatesQueryPromise = validateAndApplyDeferredUpdates();
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
        Log.info('[DeferredOnyxUpdates] Pausing SequentialQueue');
        SequentialQueue.pause();
    }

    // We check here if the "updates" param is a single update.
    // If so, we only need to insert one update into the deferred updates queue.
    if (isValidOnyxUpdateFromServer(updates)) {
        const lastUpdateID = Number(updates.lastUpdateID);
        // Prioritize HTTPS since it provides complete request information for updating in the correct logical order
        if (deferredUpdates[lastUpdateID] && updates.type !== CONST.ONYX_UPDATE_TYPES.HTTPS) {
            return;
        }
        deferredUpdates[lastUpdateID] = updates;
    } else {
        // If the "updates" param is an object, we need to insert multiple updates into the deferred updates queue.
        for (const [lastUpdateIDString, update] of Object.entries(updates)) {
            const lastUpdateID = Number(lastUpdateIDString);
            if (deferredUpdates[lastUpdateID]) {
                continue;
            }

            deferredUpdates[lastUpdateID] = update;
        }
    }
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

export {getMissingOnyxUpdatesQueryPromise, setMissingOnyxUpdatesQueryPromise, getUpdates, isEmpty, process, enqueue, clear};
