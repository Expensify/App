import CONST from '@src/CONST';

import type {SpanAttributeValue} from '@sentry/core';

import {startSpan} from './activeSpans';

/** Reauthentication and throttle backoff both re-send the same command, so each attempt needs its own span id or the retry cancels the attempt before it. */
function getRequestPhaseSpanId(spanName: string, attempt: number) {
    return `${spanName}_${attempt}`;
}

/** Starts one phase of a measured request's data load as its own transaction. */
function startRequestPhaseSpan(spanName: string, attempt: number, command: string, extraAttributes?: Record<string, SpanAttributeValue | undefined>) {
    return startSpan(getRequestPhaseSpanId(spanName, attempt), {
        name: spanName,
        op: spanName,
        forceTransaction: true,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_COMMAND]: command,
            [CONST.TELEMETRY.ATTRIBUTE_ATTEMPT]: attempt,
            ...extraAttributes,
        },
    });
}

export default startRequestPhaseSpan;
export {getRequestPhaseSpanId};
