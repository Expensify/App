import CONST from '@src/CONST';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './Middleware/types';

import {getCurrentFlushPromise} from './actions/QueuedOnyxUpdates';
import APP_STARTUP_NETWORK_REQUEST from './AppStartupNetworkRequest';
import HttpUtils from './HttpUtils';
import Log from './Log';
import enhanceParameters from './Network/enhanceParameters';
import {hasReadRequiredDataFromStorage} from './Network/NetworkStore';
import {cancelSpan, endSpan, startSpan} from './telemetry/activeSpans';
import trackStartupDataRender from './telemetry/trackStartupDataRender';

let middlewares: Middleware[] = [];

let responseApplyAttempt = 0;

/** Reauthentication retries the same request object from inside the still-pending original call, so only its newest attempt may record the phase. */
const latestApplyAttemptByRequest = new WeakMap<WeakKey, number>();

function makeXHR<TKey extends OnyxKey>(request: Request<TKey>): Promise<Response<TKey> | void> {
    const finalParameters = enhanceParameters(request.command, request?.data ?? {});
    return hasReadRequiredDataFromStorage().then((): Promise<Response<TKey> | void> => {
        return HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure, request.initiatedOffline);
    });
}

function processWithMiddleware<TKey extends OnyxKey>(request: Request<TKey>, isFromSequentialQueue = false): Promise<Response<TKey> | void> {
    let result = makeXHR(request);

    // The splash-based startup spans measure nothing for flows that never show a splash (magic code, copilot, supportal).
    const shouldMeasureResponseApply = APP_STARTUP_NETWORK_REQUEST.has(request.command);
    // Reauthentication re-enters this function for the same request, so the span id has to be per-attempt or the retry cancels the attempt before it.
    const attempt = shouldMeasureResponseApply ? (responseApplyAttempt += 1) : 0;
    const applySpanId = `${CONST.TELEMETRY.SPAN_STARTUP_DATA.APPLY}_${attempt}`;
    if (shouldMeasureResponseApply) {
        latestApplyAttemptByRequest.set(request, attempt);
        result = result.then((response) => {
            // The Reauthentication middleware below is about to retry this request, and that attempt measures the apply.
            if (response?.jsonCode === CONST.JSON_CODE.NOT_AUTHENTICATED) {
                return response;
            }

            startSpan(applySpanId, {
                name: CONST.TELEMETRY.SPAN_STARTUP_DATA.APPLY,
                op: CONST.TELEMETRY.SPAN_STARTUP_DATA.APPLY,
                forceTransaction: true,
                attributes: {[CONST.TELEMETRY.ATTRIBUTE_COMMAND]: request.command, [CONST.TELEMETRY.ATTRIBUTE_ATTEMPT]: attempt},
            });
            return response;
        });
    }

    for (const middleware of middlewares) {
        result = middleware(result, request, isFromSequentialQueue);
    }

    if (shouldMeasureResponseApply) {
        result = result.then(
            (response) => {
                // A reauthenticated retry already measured this request, and this attempt only waited for it.
                if (latestApplyAttemptByRequest.get(request) !== attempt) {
                    cancelSpan(applySpanId);
                    return response;
                }

                // WRITE responses are staged by queueOnyxUpdates and reach Onyx only once SequentialQueue flushes them
                // after this promise settles, so the phase has to be closed from the flush rather than awaited here.
                getCurrentFlushPromise().then(() => {
                    endSpan(applySpanId);
                    trackStartupDataRender(request.command, attempt);
                });
                return response;
            },
            (error: unknown) => {
                // A failed request applies nothing, so ending this span would record a phase that never ran.
                cancelSpan(applySpanId);
                throw error;
            },
        );
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
