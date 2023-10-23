import HttpUtils from './HttpUtils';
import enhanceParameters from './Network/enhanceParameters';
import * as NetworkStore from './Network/NetworkStore';
import Request from '../types/onyx/Request';
import Response from '../types/onyx/Response';
import Middleware from './Middleware/types';

let middlewares: Middleware[] = [];

function makeXHR(request: Request): Promise<Response | void> {
    const finalParameters = enhanceParameters(request.command, request?.data ?? {});
    return NetworkStore.hasReadRequiredDataFromStorage().then((): Promise<Response | void> => {
        // If we're using the Supportal token and this is not a Supportal request
        // let's just return a promise that will resolve itself.
        if (NetworkStore.getSupportAuthToken() && !NetworkStore.isSupportRequest(request.command)) {
            return new Promise<void>((resolve) => resolve());
        }

        return HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure) as Promise<Response>;
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
