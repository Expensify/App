import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import HttpUtils from './HttpUtils';
import Log from './Log';
import type Middleware from './Middleware/types';
import enhanceParameters from './Network/enhanceParameters';
import {hasReadRequiredDataFromStorage, isSupportAuthToken} from './Network/NetworkStore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

let middlewares: Middleware[] = [];

function makeXHR(request: Request): Promise<Response | void> {
    const finalParameters = enhanceParameters(request.command, request?.data ?? {});
    return hasReadRequiredDataFromStorage().then((): Promise<Response | void> => {
        return HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure, request.initiatedOffline).then((response) => {
            const unsupportedSupportalCommand =
                isSupportAuthToken() &&
                Number(response?.jsonCode) === 666 &&
                typeof response?.message === 'string' &&
                response.message.includes('You do not have the permission to do the requested action.');

            if (unsupportedSupportalCommand) {
                // Prevent retries for this request
                if (request?.data) {
                    request.data.shouldRetry = false;
                }
                Log.info('411 insufficient permissions; suppressing retry', false, {command: request.command});

                // Trigger a global modal via Onyx so it shows regardless of current UI location
                Onyx.set(ONYXKEYS.SUPPORTAL_PERMISSION_DENIED, {
                    command: request.command,
                    message: typeof response?.message === 'string' ? response.message : undefined,
                    timestamp: Date.now(),
                });
            }

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
