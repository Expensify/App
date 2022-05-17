import lodashGet from 'lodash/get';
import * as ActiveClientManager from '../ActiveClientManager';
import CONST from '../../CONST';
import * as MainQueue from './MainQueue';
import * as SequentialQueue from './SequentialQueue';
import {version} from '../../../package.json';
import * as NetworkStore from './NetworkStore';

// We must wait until the ActiveClientManager is ready so that we ensure only the "leader" tab processes any persisted requests
ActiveClientManager.isReady().then(() => {
    SequentialQueue.flush();

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
            shouldRetry: lodashGet(data, 'shouldRetry', true),
            canCancel: lodashGet(data, 'canCancel', true),
            appversion: version,
        };

        const shouldPersist = lodashGet(request, 'data.persist', false);
        if (shouldPersist) {
            SequentialQueue.push(request);
            return;
        }

        // Add promise handlers to any request that we are not persisting
        request.resolve = resolve;
        request.reject = reject;

        // Add the request to a queue of actions to perform
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

export {
    // eslint-disable-next-line import/prefer-default-export
    post,
};
