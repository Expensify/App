import Onyx from 'react-native-onyx';
import type {DeferredUpdatesDictionary} from '@libs/actions/OnyxUpdateManager/types';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import createProxyForObject from '@src/utils/createProxyForObject';
// eslint-disable-next-line import/no-cycle
import * as OnyxUpdateManagerUtils from '.';
import GetMissingOnyxUpdatesPromiseProxy from './GetMissingOnyxUpdatesPromise';

let deferredUpdates: DeferredUpdatesDictionary = {};

/**
 * Manually processes and applies the updates from the deferred updates queue. (used e.g. for push notifications)
 */
function processDeferredUpdates() {
    if (GetMissingOnyxUpdatesPromiseProxy.GetMissingOnyxUpdatesPromise) {
        GetMissingOnyxUpdatesPromiseProxy.GetMissingOnyxUpdatesPromise.finally(() => OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates);
    }

    GetMissingOnyxUpdatesPromiseProxy.GetMissingOnyxUpdatesPromise = OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates();
}

/**
 * Allows adding onyx updates to the deferred updates queue manually.
 * By default, this will automatically process the updates. Setting "shouldProcessUpdates" to false will prevent this.
 * @param updates The updates that should be applied (e.g. updates from push notifications)
 * @param shouldProcessUpdates Whether the updates should be processed immediately
 * @returns
 */
function enqueueDeferredUpdates(updates: OnyxUpdatesFromServer[], shouldProcessUpdates = true) {
    SequentialQueue.pause();

    updates.forEach((update) => {
        const lastUpdateID = Number(update.lastUpdateID);
        if (deferredUpdates[lastUpdateID]) {
            return;
        }

        deferredUpdates[lastUpdateID] = update;
    });

    if (!shouldProcessUpdates) {
        return;
    }

    processDeferredUpdates();
}

/**
 * Clears the deferred updates queue and unpauses the SequentialQueue
 * @param shouldUnpauseSequentialQueue Whether the SequentialQueue should be unpaused after clearing the deferred updates
 */
function clearDeferredUpdates(shouldUnpauseSequentialQueue = true) {
    GetMissingOnyxUpdatesPromiseProxy.GetMissingOnyxUpdatesPromise = undefined;
    deferredUpdates = {};

    if (!shouldUnpauseSequentialQueue) {
        return;
    }

    Onyx.set(ONYXKEYS.ONYX_UPDATES_FROM_SERVER, null);
    SequentialQueue.unpause();
}

const DeferredUpdates = {deferredUpdates, enqueueDeferredUpdates, clearDeferredUpdates, processDeferredUpdates};

export default createProxyForObject(DeferredUpdates);
