import {INBOX_TAB_SPAN_IDS, REPORTS_TAB_SPAN_IDS} from '@libs/telemetry/cancelTabNavigationSpans';

import CONST from '@src/CONST';

import type {TelemetryBeforeSend} from './index';

// Tab-navigation spans are canceled when the user abandons the navigation (switching tabs mid-flight,
// backgrounding the app). Their duration reflects the arbitrary moment of the abort rather than a finished
// navigation, so sending them would skew the tab-navigation percentiles in both directions. Drop them.
const TAB_NAVIGATION_OPS = new Set<string>([...REPORTS_TAB_SPAN_IDS, ...INBOX_TAB_SPAN_IDS]);

// The attribute is set as a boolean, but attribute values can arrive stringified depending on the SDK layer.
function isCanceled(value: unknown): boolean {
    return value === true || value === 'true';
}

const canceledTabNavigationFilter: TelemetryBeforeSend = (event) => {
    const op = event.contexts?.trace?.op;
    if (op && TAB_NAVIGATION_OPS.has(op) && isCanceled(event.contexts?.trace?.data?.[CONST.TELEMETRY.ATTRIBUTE_CANCELED])) {
        return null;
    }

    // Tab-navigation spans are usually root transactions, but without forceTransaction they can be adopted
    // as child spans of an active transaction, so filter those the same way (mirrors minDurationFilter).
    if (!event.spans) {
        return event;
    }
    const spans = event.spans.filter((span) => !(span.op && TAB_NAVIGATION_OPS.has(span.op) && isCanceled(span.data?.[CONST.TELEMETRY.ATTRIBUTE_CANCELED])));

    return {...event, spans};
};

export default canceledTabNavigationFilter;
