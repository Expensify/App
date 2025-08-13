import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import HttpUtils from './HttpUtils';
import Log from './Log';
import type Middleware from './Middleware/types';
import enhanceParameters from './Network/enhanceParameters';
import {hasReadRequiredDataFromStorage, isSupportAuthToken, isSupportRequest} from './Network/NetworkStore';

let middlewares: Middleware[] = [];

function makeXHR(request: Request): Promise<Response | void> {
    const finalParameters = enhanceParameters(request.command, request?.data ?? {});
    return hasReadRequiredDataFromStorage().then((): Promise<Response | void> => {
        // If we're using the Supportal token and this is not a Supportal request
        // let's just return a promise that will resolve itself.
        if (isSupportAuthToken() && !isSupportRequest(request.command)) {
            Log.info(`[API] The ${request.command} API call is skipped because user is using support token.`);
            return new Promise<void>((resolve) => {
                resolve();
            });
        }

        return HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure, request.initiatedOffline);
    });
}

function processWithMiddleware(request: Request, isFromSequentialQueue = false): Promise<Response | void> {
    return middlewares.reduce((last, middleware) => middleware(last, request, isFromSequentialQueue), makeXHR(request));
}

function use(middleware: Middleware) {
    middlewares.push(middleware);
}

function clearMiddlewares() {
    middlewares = [];
}

export {clearMiddlewares, processWithMiddleware, use};
export type {Middleware};
