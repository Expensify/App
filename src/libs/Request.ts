import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './Middleware/types';

import HttpUtils from './HttpUtils';
import Log from './Log';
import enhanceParameters from './Network/enhanceParameters';
import {hasReadRequiredDataFromStorage} from './Network/NetworkStore';

let middlewares: Middleware[] = [];

function makeXHR<TKey extends OnyxKey>(request: Request<TKey>): Promise<Response<TKey> | void> {
    const finalParameters = enhanceParameters(request.command, request?.data ?? {});
    return hasReadRequiredDataFromStorage().then((): Promise<Response<TKey> | void> => {
        return HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure, request.initiatedOffline);
    });
}

function processWithMiddleware<TKey extends OnyxKey>(request: Request<TKey>, isFromSequentialQueue = false): Promise<Response<TKey> | void> {
    let result = makeXHR(request);

    for (const middleware of middlewares) {
        result = middleware(result, request, isFromSequentialQueue);
    }

    return result.catch((reason: unknown) => {
        // Real Errors are already normalized/classified by the Logging middleware; pass them through untouched.
        if (reason instanceof Error) {
            throw reason;
        }
        // A non-Error rejection (e.g. a bare `null` bubbling up from an outer data middleware above
        // Logging) would otherwise surface as a stack-less, context-free onunhandledrejection (APP-5J).
        // Wrap it so the next occurrence on any command carries command context and a stack.
        const normalizedError = new Error(`[API] ${request.command} rejected: ${String(reason)}`);
        Log.alert('[API] non-Error rejection surfaced from the request pipeline', {command: request.command, reason: String(reason)});
        throw normalizedError;
    });
}

function addMiddleware(middleware: Middleware) {
    middlewares.push(middleware);
}

function clearMiddlewares() {
    middlewares = [];
}

export {clearMiddlewares, processWithMiddleware, addMiddleware};
export type {Middleware};
