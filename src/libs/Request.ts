import type {OnyxKey} from 'react-native-onyx';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import HttpUtils from './HttpUtils';
import type Middleware from './Middleware/types';
import enhanceParameters from './Network/enhanceParameters';
import {hasReadRequiredDataFromStorage} from './Network/NetworkStore';
import {withPrefetchHeadersWhenStartupHandshake} from './telemetry/startupNetworkInstrumentation';

let middlewares: Middleware[] = [];

function makeXHR<TKey extends OnyxKey>(request: Request<TKey>): Promise<Response<TKey> | void> {
    const finalParameters = enhanceParameters(request.command, request?.data ?? {});
    return hasReadRequiredDataFromStorage().then((): Promise<Response<TKey> | void> => {
        return HttpUtils.xhr(request.command, finalParameters, request.headers, request.type, request.shouldUseSecure, request.initiatedOffline);
    });
}

function processWithMiddleware<TKey extends OnyxKey>(request: Request<TKey>, isFromSequentialQueue = false): Promise<Response<TKey> | void> {
    const requestWithStartupPrefetchWhenApplicable = withPrefetchHeadersWhenStartupHandshake(request);

    return middlewares.reduce((last, middleware) => middleware(last, requestWithStartupPrefetchWhenApplicable, isFromSequentialQueue), makeXHR(requestWithStartupPrefetchWhenApplicable));
}

function addMiddleware(middleware: Middleware) {
    middlewares.push(middleware);
}

function clearMiddlewares() {
    middlewares = [];
}

export {clearMiddlewares, processWithMiddleware, addMiddleware};
export type {Middleware};
