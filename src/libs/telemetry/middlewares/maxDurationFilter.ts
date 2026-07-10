import {TAB_NAVIGATION_SPAN_IDS} from '@libs/telemetry/cancelTabNavigationSpans';

import CONST from '@src/CONST';

import type {TelemetryBeforeSend} from './index';

const MAX_SPAN_DURATION_MS = 60_000;

// Ops whose spans measure a user-visible flow that completes within seconds (tab-navigation p99 is ~1.5s).
// Span duration is wall-clock, so a machine sleep, frozen browser tab, or suspended mobile app between the
// span start and the end signal inflates it to minutes or hours. Such durations measure the idle gap rather
// than the flow, so drop them instead of skewing the metric's tail.
const MAX_DURATION_OPS: ReadonlySet<string> = new Set([CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE, ...TAB_NAVIGATION_SPAN_IDS]);

function isOverMaxDuration(startTimestamp: number | undefined, endTimestamp: number | undefined): boolean {
    if (!startTimestamp || !endTimestamp) {
        return false;
    }
    return (endTimestamp - startTimestamp) * 1000 > MAX_SPAN_DURATION_MS;
}

const maxDurationFilter: TelemetryBeforeSend = (event) => {
    const op = event.contexts?.trace?.op;
    if (op && MAX_DURATION_OPS.has(op) && isOverMaxDuration(event.start_timestamp, event.timestamp)) {
        return null;
    }

    // These spans are usually root transactions, but without forceTransaction they can be adopted
    // as child spans of an active transaction, so filter those the same way (mirrors minDurationFilter).
    if (!event.spans) {
        return event;
    }
    const spans = event.spans.filter((span) => !(span.op && MAX_DURATION_OPS.has(span.op) && isOverMaxDuration(span.start_timestamp, span.timestamp)));

    return {...event, spans};
};

export default maxDurationFilter;
