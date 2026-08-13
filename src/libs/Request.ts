import CONST from '@src/CONST';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './Middleware/types';

import HttpUtils from './HttpUtils';
import Log from './Log';
import enhanceParameters from './Network/enhanceParameters';
import {hasReadRequiredDataFromStorage} from './Network/NetworkStore';
import {cancelSpan, endSpanWithAttributes, startSpan} from './telemetry/activeSpans';
import MEASURED_REQUEST_PHASE_COMMANDS, {getNextRequestPhaseAttempt, getRequestPhaseSpanNames} from './telemetry/measuredRequestPhaseCommands';
import trackRequestPhaseRender from './telemetry/trackRequestPhaseRender';

let middlewares: Middleware[] = [];

function makeXHR<TKey extends OnyxKey>(request: Request<TKey>): Promise<Response<TKey> | void> {
    const finalParameters = enhanceParameters(request.command, request?.data ?? {});
    return hasReadRequiredDataFromStorage().then((): Promise<Response<TKey> | void> => {
        return HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure, request.initiatedOffline);
    });
}

function processWithMiddleware<TKey extends OnyxKey>(request: Request<TKey>, isFromSequentialQueue = false): Promise<Response<TKey> | void> {
    let result = makeXHR(request);

    // The splash-based startup spans measure nothing for flows that never show a splash (magic code, copilot, supportal), and nothing at all for Search.
    const shouldMeasureResponseApply = MEASURED_REQUEST_PHASE_COMMANDS.has(request.command);
    const {APPLY: applySpanName, RENDER: renderSpanName} = getRequestPhaseSpanNames(request.command);
    const attempt = shouldMeasureResponseApply ? getNextRequestPhaseAttempt(applySpanName) : 0;
    const applySpanId = `${applySpanName}_${attempt}`;
    if (shouldMeasureResponseApply) {
        result = result.then((response) => {
            startSpan(applySpanId, {
                name: applySpanName,
                op: applySpanName,
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
                endSpanWithAttributes(applySpanId, {[CONST.TELEMETRY.ATTRIBUTE_REQUEST_ID]: response?.requestID});
                // ManualNavigateToReportsContentLoad only covers the Reports tab tap, so it cannot stand in for this on the
                // paths that re-run the whole list render without a tab navigation: pagination, in-page re-search, view switches.
                trackRequestPhaseRender(renderSpanName, request.command, attempt, response?.requestID);
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
