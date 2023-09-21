import HttpUtils from './HttpUtils';
import enhanceParameters from './Network/enhanceParameters';
import * as NetworkStore from './Network/NetworkStore';
import Request from '../types/onyx/Request';

type Middleware = (response: unknown, request: Request, isFromSequentialQueue: boolean) => Promise<unknown>;

let middlewares: Middleware[] = [];

function makeXHR(request: Request): Promise<unknown> {
    const finalParameters = enhanceParameters(request.command, request?.data ?? {});
    return NetworkStore.hasReadRequiredDataFromStorage().then(() => {
        // If we're using the Supportal token and this is not a Supportal request
        // let's just return a promise that will resolve itself.
        if (NetworkStore.getSupportAuthToken() && !NetworkStore.isSupportRequest(request.command)) {
            return new Promise<void>((resolve) => resolve());
        }
        return HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure);
    });
}

function processWithMiddleware(request: Request, isFromSequentialQueue = false): Promise<unknown> {
    return middlewares.reduce((last, middleware) => middleware(last, request, isFromSequentialQueue), makeXHR(request));
}

function use(middleware: Middleware) {
    middlewares.push(middleware);
}

function clearMiddlewares() {
    middlewares = [];
}

export {clearMiddlewares, processWithMiddleware, use};
