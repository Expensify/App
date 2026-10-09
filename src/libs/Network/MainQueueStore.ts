import CONST from '@src/CONST';
import type {Request} from '@src/types/onyx';
import type OnyxRequest from '@src/types/onyx/Request';
import type {AnyRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import pkg from '../../../package.json';

// Queue for network requests so we don't lose actions done by the user while offline
let networkRequestQueue: AnyRequest[] = [];

function push<TKey extends OnyxKey>(request: OnyxRequest<TKey>) {
    networkRequestQueue.push(request as AnyRequest);
}

/**
 * Clear the queue and cancels all pending requests
 * Non-cancellable requests like Log would not be cleared
 */
function clear() {
    networkRequestQueue = networkRequestQueue.filter((request) => !request.data?.canCancel);
}

function getAll(): AnyRequest[] {
    return networkRequestQueue;
}

function replaceAll(requests: AnyRequest[]) {
    networkRequestQueue = requests;
}

function enqueue<TKey extends OnyxKey>(command: string, data: Record<string, unknown> = {}, type = CONST.NETWORK.METHOD.POST, shouldUseSecure = false): Promise<Response<TKey>> {
    return new Promise((resolve, reject) => {
        const request: Request<never> = {
            command,
            data,
            type,
            shouldUseSecure,
        };

        // By default, request are retry-able and cancellable
        // (e.g. any requests currently happening when the user logs out are cancelled)
        request.data = {
            ...data,
            shouldRetry: data?.shouldRetry ?? true,
            canCancel: data?.canCancel ?? true,
            appversion: pkg.version,
        };

        // Add promise handlers to any request that we are not persisting
        request.resolve = resolve;
        request.reject = reject;

        // Add the request to a queue of actions to perform
        push(request);
    });
}

const MainQueueStore = {clear, push, getAll, replaceAll, enqueue};

export default MainQueueStore;
