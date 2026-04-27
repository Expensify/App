import {CONST} from 'expensify-common';
import type {OnyxKey} from 'react-native-onyx';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import {WRITE_COMMANDS} from './API/types';
import HttpUtils from './HttpUtils';
import type Middleware from './Middleware/types';
import enhanceParameters from './Network/enhanceParameters';
import {hasReadRequiredDataFromStorage} from './Network/NetworkStore';

let middlewares: Middleware[] = [];

function makeXHR<TKey extends OnyxKey>(request: Request<TKey>): Promise<Response<TKey> | void> {
    const finalParameters = enhanceParameters(request.command, request?.data ?? {});
    return hasReadRequiredDataFromStorage().then((): Promise<Response<TKey> | void> => {
        return HttpUtils.xhr(request.command, finalParameters, request.headers, request.type, request.shouldUseSecure, request.initiatedOffline);
    });
}

function processWithMiddleware<TKey extends OnyxKey>(request: Request<TKey>, isFromSequentialQueue = false): Promise<Response<TKey> | void> {
    const isPrefetchQuery = request.command === WRITE_COMMANDS.OPEN_APP || request.command === WRITE_COMMANDS.RECONNECT_APP;
    const prefetchKey = isPrefetchQuery ? request.command : undefined;

    const finalRequest = prefetchKey ? {...request, headers: prefetchKey ? {prefetchKey} : undefined} : request;

    return middlewares.reduce((last, middleware) => middleware(last, finalRequest, isFromSequentialQueue), makeXHR(finalRequest));
}

function addMiddleware(middleware: Middleware) {
    middlewares.push(middleware);
}

function clearMiddlewares() {
    middlewares = [];
}

export {clearMiddlewares, processWithMiddleware, addMiddleware};
export type {Middleware};
