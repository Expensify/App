import CONST from '@src/CONST';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './Middleware/types';

import {getCurrentFlushPromise} from './actions/QueuedOnyxUpdates';
import isStartupNetworkRequest from './AppStartupNetworkRequest';
import HttpUtils from './HttpUtils';
import Log from './Log';
import enhanceParameters from './Network/enhanceParameters';
import {hasReadRequiredDataFromStorage} from './Network/NetworkStore';
import {cancelSpan, endSpanWithAttributes} from './telemetry/activeSpans';
import getRequestPhaseSpanNames, {getNextRequestPhaseAttempt} from './telemetry/measuredRequestPhaseCommands';
import startRequestPhaseSpan, {getRequestPhaseSpanId} from './telemetry/startRequestPhaseSpan';
import trackStartupDataRender from './telemetry/trackStartupDataRender';

let middlewares: Middleware[] = [];

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

    // The splash-based startup spans measure nothing for flows that never show a splash (magic code, copilot, supportal), and nothing at all for Search.
    const phaseSpanNames = getRequestPhaseSpanNames(request.command);
    const attempt = phaseSpanNames ? getNextRequestPhaseAttempt(phaseSpanNames.APPLY) : 0;
    const applySpanId = phaseSpanNames ? getRequestPhaseSpanId(phaseSpanNames.APPLY, attempt) : '';
    if (phaseSpanNames) {
        latestApplyAttemptByRequest.set(request, attempt);
        result = result.then((response) => {
            // The Reauthentication middleware below is about to retry this request, and that attempt measures the apply.
            if (response?.jsonCode === CONST.JSON_CODE.NOT_AUTHENTICATED) {
                return response;
            }

            startRequestPhaseSpan(phaseSpanNames.APPLY, attempt, request.command);
            return response;
        });
    }

    for (const middleware of middlewares) {
        result = middleware(result, request, isFromSequentialQueue);
    }

    if (phaseSpanNames) {
        result = result.then(
            (response) => {
                // The reauthentication retry already measured this request, and this attempt only waited for it.
                if (latestApplyAttemptByRequest.get(request) !== attempt) {
                    cancelSpan(applySpanId);
                    return response;
                }

                const endApplyPhase = () => {
                    endSpanWithAttributes(applySpanId, {[CONST.TELEMETRY.ATTRIBUTE_REQUEST_ID]: response?.requestID});
                    // Startup only: the probe ends on frame health, which attributes the busy window to this response only while nothing else runs on the thread.
                    if (!isStartupNetworkRequest(request.command)) {
                        return;
                    }
                    trackStartupDataRender(request.command, attempt);
                };

                // Only WRITE responses are staged by queueOnyxUpdates (see OnyxUpdates.applyHTTPSOnyxUpdates), reaching Onyx once SequentialQueue
                // flushes them after this promise settles. Everything else already applied inline, and the flush promise is shared, so awaiting it
                // here would fold an unrelated write's flush into the phase.
                if (request.data?.apiRequestType !== CONST.API_REQUEST_TYPE.WRITE) {
                    endApplyPhase();
                    return response;
                }

                getCurrentFlushPromise().then(endApplyPhase);
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
