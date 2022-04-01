import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import HttpUtils from '../HttpUtils';
import * as ActiveClientManager from '../ActiveClientManager';
import CONST from '../../CONST';
import * as PersistedRequests from '../actions/PersistedRequests';
import * as NetworkStore from './NetworkStore';
import * as NetworkEvents from './NetworkEvents';
import * as SyncQueue from './SyncQueue';
import * as MainQueue from './MainQueue';

// We must wait until the ActiveClientManager is ready so that we ensure only the "leader" tab processes any persisted requests
ActiveClientManager.isReady().then(() => {
    SyncQueue.flush();

    // Start main queue and process once every n ms delay
    setInterval(MainQueue.process, CONST.NETWORK.PROCESS_REQUEST_DELAY_MS);
});

/**
 * Perform a queued post request
 *
 * @param {String} command
 * @param {*} [data]
 * @param {String} [type]
 * @param {Boolean} [shouldUseSecure] - Whether we should use the secure API
 * @returns {Promise}
 */
function post(command, data = {}, type = CONST.NETWORK.METHOD.POST, shouldUseSecure = false) {
    return new Promise((resolve, reject) => {
        const request = {
            command,
            data,
            type,
            shouldUseSecure,
        };

        // By default, request are retry-able and cancellable
        // (e.g. any requests currently happening when the user logs out are cancelled)
        request.data = {
            ...data,
            canCancel: lodashGet(data, 'canCancel', true),
        };

        const persist = lodashGet(data, 'persist', false);

        // All requests that should be persisted must be saved immediately whether they are run now or when we are back from offline.
        // If the user closes their browser or the app crashes before a response is recieved then the request will be saved and retried later.
        if (persist) {
            const requestToPersist = _.clone(request);
            requestToPersist.id = Str.guid();
            PersistedRequests.save(requestToPersist);
        }

        // We're offline. If this request cannot be persisted then we won't make the request at all.
        if (!persist && NetworkStore.getIsOffline()) {
            NetworkEvents.getLogger().info('Skipping non-persistable request because we are offline', false, {});
            return;
        }

        request.resolve = resolve;
        request.reject = reject;

        // Add the request to the main queue
        MainQueue.push(request);

        // This check is mainly used to prevent API commands from triggering calls to MainQueue.process() from inside the context of a previous
        // call to MainQueue.process() e.g. calling a Log command without this would cause the requests in mainQueue to double process
        // since we call Log inside MainQueue.process().
        const shouldProcessImmediately = lodashGet(request, 'data.shouldProcessImmediately', true);
        if (!shouldProcessImmediately) {
            return;
        }

        // Try to fire off the request as soon as it's queued so we don't add a delay to every queued command
        MainQueue.process();
    });
}

/**
 * Clear the queue and cancels all pending requests
 * Non-cancellable requests like Log would not be cleared
 */
function clearRequestQueue() {
    MainQueue.clear();
    HttpUtils.cancelPendingRequests();
}

export {
    post,
    clearRequestQueue,
};
