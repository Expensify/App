import CONST from '@src/CONST';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import HttpUtils from './HttpUtils';
import type Middleware from './Middleware/types';
import enhanceParameters from './Network/enhanceParameters';
import * as NetworkStore from './Network/NetworkStore';
import Onyx from 'react-native-onyx';

let middlewares: Middleware[] = [];

let addCommentRequestCount = 0;

let failedAuthenticate;
Onyx.connect({
    key: 'failedAuthenticate',
    callback: (val) => (failedAuthenticate = val),
});

function makeXHR(request: Request): Promise<Response | void> {
    const finalParameters = enhanceParameters(request.command, request?.data ?? {});
    return NetworkStore.hasReadRequiredDataFromStorage().then((): Promise<Response | void> => {
        // If we're using the Supportal token and this is not a Supportal request
        // let's just return a promise that will resolve itself.
        if (NetworkStore.isSupportAuthToken() && !NetworkStore.isSupportRequest(request.command)) {
            return new Promise<void>((resolve) => {
                resolve();
            });
        }

        if (request.command === 'AddComment') {
            addCommentRequestCount++;
        }

        return HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure).then((response) => {
            // Early return if we're not forcing a not authenticated response
            // Force it in these scenarios:
            // If it's not an Authenticate request itself. Making that fail is done separately
            // Every other add comment request for easy testing
            // If we have already failed to re-authenticate, keep failing for realism
            if (request.command === 'Authenticate' || (addCommentRequestCount % 2 === 0 && !failedAuthenticate)) {
                return response;
            }
            console.log('Ndebug forcing return not authenticated');
            response.jsonCode = CONST.JSON_CODE.NOT_AUTHENTICATED;
            return response;
        });
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
