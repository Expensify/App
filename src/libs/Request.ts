import type {Span} from '@sentry/core';
import * as Sentry from '@sentry/react-native';
import type {OnyxKey} from 'react-native-onyx';
import CONST from '@src/CONST';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import HttpUtils from './HttpUtils';
import type Middleware from './Middleware/types';
import enhanceParameters from './Network/enhanceParameters';
import {hasReadRequiredDataFromStorage} from './Network/NetworkStore';
import {getProcessSpan} from './Network/SequentialQueue';

type NamedMiddleware = {
    middleware: Middleware;
    name: string;
};

let middlewares: NamedMiddleware[] = [];

async function makeXHR<TKey extends OnyxKey>(request: Request<TKey>, parentSpan: Span | undefined): Promise<Response<TKey> | void> {
    const span = Sentry.startInactiveSpan({
        name: CONST.TELEMETRY.SPAN_HTTP_XHR,
        op: CONST.TELEMETRY.SPAN_HTTP_XHR,
        parentSpan,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_COMMAND]: request.command,
        },
    });

    const finalParameters = enhanceParameters(request.command, request?.data ?? {});
    try {
        await hasReadRequiredDataFromStorage();
        const response = await HttpUtils.xhr<TKey>(request.command, finalParameters, request.type, request.shouldUseSecure, request.initiatedOffline);
        span.setStatus({code: 1});
        span.end();
        return response;
    } catch (error: unknown) {
        span.setStatus({code: 2, message: error instanceof Error ? error.message : undefined});
        span.end();
        throw error;
    }
}

async function processWithMiddleware<TKey extends OnyxKey>(request: Request<TKey>, isFromSequentialQueue = false): Promise<Response<TKey> | void> {
    const parentSpan = isFromSequentialQueue ? getProcessSpan() : undefined;
    const outerSpan = Sentry.startInactiveSpan({
        name: CONST.TELEMETRY.SPAN_PROCESS_WITH_MIDDLEWARE,
        op: CONST.TELEMETRY.SPAN_PROCESS_WITH_MIDDLEWARE,
        parentSpan,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_COMMAND]: request.command,
            [CONST.TELEMETRY.ATTRIBUTE_IS_FROM_SEQUENTIAL_QUEUE]: isFromSequentialQueue,
        },
    });

    const middlewaresSpan = Sentry.startInactiveSpan({
        name: CONST.TELEMETRY.SPAN_PROCESS_MIDDLEWARES,
        op: CONST.TELEMETRY.SPAN_PROCESS_MIDDLEWARES,
        parentSpan: outerSpan,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_COMMAND]: request.command,
        },
    });

    let currentResponsePromise: Promise<Response<TKey> | void> = makeXHR(request, outerSpan);

    for (const {middleware, name} of middlewares) {
        let mwSpan: Span | undefined;
        const startMwSpan = () => {
            mwSpan = Sentry.startInactiveSpan({
                name,
                op: `middleware.${name}`,
                parentSpan: middlewaresSpan,
                attributes: {
                    [CONST.TELEMETRY.ATTRIBUTE_COMMAND]: request.command,
                },
            });
        };

        // Tap into the previous promise to start the span when this middleware's work actually begins,
        // while preserving both resolved and rejected states for the middleware to handle.
        const instrumentedMiddlewareInput = currentResponsePromise.then(
            (data) => {
                startMwSpan();
                return data;
            },
            (error: unknown) => {
                startMwSpan();
                throw error;
            },
        );

        const result = middleware(instrumentedMiddlewareInput, request, isFromSequentialQueue) ?? instrumentedMiddlewareInput;
        currentResponsePromise = result
            .then((data) => {
                if (!mwSpan) {
                    startMwSpan();
                }
                mwSpan?.setStatus({code: 1});
                mwSpan?.end();
                return data;
            })
            .catch((error: unknown) => {
                if (!mwSpan) {
                    startMwSpan();
                }
                mwSpan?.setStatus({code: 2, message: error instanceof Error ? error.message : undefined});
                mwSpan?.end();
                throw error;
            });
    }

    try {
        const response = await currentResponsePromise;
        middlewaresSpan.setStatus({code: 1});
        middlewaresSpan.end();
        outerSpan.setStatus({code: 1});
        outerSpan.end();
        return response;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : undefined;
        middlewaresSpan.setStatus({code: 2, message: errorMessage});
        middlewaresSpan.end();
        outerSpan.setStatus({code: 2, message: errorMessage});
        outerSpan.end();
        throw error;
    }
}

function addMiddleware(middleware: Middleware, name: string) {
    middlewares.push({middleware, name});
}

function clearMiddlewares() {
    middlewares = [];
}

export {clearMiddlewares, processWithMiddleware, addMiddleware};
export type {Middleware};
