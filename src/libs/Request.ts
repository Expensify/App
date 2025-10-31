import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import HttpUtils from './HttpUtils';
import type Middleware from './Middleware/types';
import enhanceParameters from './Network/enhanceParameters';
import {hasReadRequiredDataFromStorage} from './Network/NetworkStore';
import * as Sentry from '@sentry/react-native';

let middlewares: Middleware[] = [];

function makeXHR(request: Request): Promise<Response | void> {
    const finalParameters = enhanceParameters(request.command, request?.data ?? {});
    return hasReadRequiredDataFromStorage().then((): Promise<Response | void> => {
        return HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure, request.initiatedOffline);
    });
}

function processWithMiddleware(request: Request, isFromSequentialQueue = false): Promise<Response | void> {
    return middlewares.reduce((last, middleware) => middleware(last, request, isFromSequentialQueue), makeXHR(request)).then(response => {
        Sentry.getActiveSpan()?.setAttribute('requestId', response?.requestID ?? 'unknown');
        return response
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
