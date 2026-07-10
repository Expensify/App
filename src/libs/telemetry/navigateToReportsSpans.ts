import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import navigationRef from '@navigation/navigationRef';

import CONST from '@src/CONST';

import type {SpanAttributes} from '@sentry/core';
import type {ValueOf} from 'type-fest';

import {spanToJSON} from '@sentry/core';

import {cancelSpan, endSpanWithAttributes, getSpan, startSpan} from './activeSpans';

type NavigateToReportsStartType = ValueOf<typeof CONST.TELEMETRY.NAVIGATE_TO_REPORTS_START_TYPE>;

const SPAN_IDS = [CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT, CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD] as const;

/**
 * Reads the search query fields (type/view/groupBy) from the active route to tag the spans. Read at first
 * paint, not at span start: at start the navigation has not happened yet, so the route still points at the
 * previous page; by first paint it is the resolved search route.
 */
function readSearchQueryAttributes(): SpanAttributes {
    const params = navigationRef.getCurrentRoute()?.params;
    if (!params || typeof params !== 'object' || !('q' in params) || typeof params.q !== 'string') {
        return {};
    }
    const queryJSON = buildSearchQueryJSON(params.q);
    if (!queryJSON) {
        return {};
    }
    return {
        [CONST.TELEMETRY.ATTRIBUTE_SEARCH_TYPE]: queryJSON.type,
        [CONST.TELEMETRY.ATTRIBUTE_SEARCH_VIEW]: queryJSON.view,
        [CONST.TELEMETRY.ATTRIBUTE_SEARCH_GROUP_BY]: queryJSON.groupBy,
    };
}

/**
 * Splits the legacy ManualNavigateToReports metric into two spans that run alongside the untouched legacy span:
 * - FirstPaint ends at the first visible paint (skeleton on a cold start, content on a warm start).
 * - ContentLoad ends only at the real content paint, so it keeps running through skeletons.
 *
 * Both start at the tab tap and share the same scenario. Each can be ended from several places; the first
 * end wins, because ending an already-ended span does nothing.
 */
function startNavigateToReportsSpans() {
    for (const spanId of SPAN_IDS) {
        startSpan(spanId, {name: spanId, op: spanId, forceTransaction: true});
    }
}

function endNavigateToReportsFirstPaint(startType: NavigateToReportsStartType) {
    // If FirstPaint already ended (e.g. the content painted after the skeleton), bail so ContentLoad keeps its COLD start type.
    if (!getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT)) {
        return;
    }
    // ContentLoad ends later and cannot tell cold from warm itself, so tag it with the start type now.
    getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_START_TYPE, startType);
    endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT, {
        [CONST.TELEMETRY.ATTRIBUTE_START_TYPE]: startType,
        ...readSearchQueryAttributes(),
    });
}

function endNavigateToReportsContentLoad() {
    const span = getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD);
    if (!span) {
        return;
    }
    // FirstPaint should set the start type on this span. UNKNOWN is a fallback: if we see it, FirstPaint did not run and there is a bug.
    if (spanToJSON(span).data?.[CONST.TELEMETRY.ATTRIBUTE_START_TYPE] === undefined) {
        span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_START_TYPE, CONST.TELEMETRY.NAVIGATE_TO_REPORTS_START_TYPE.UNKNOWN);
    }
    endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD, readSearchQueryAttributes());
}

function cancelNavigateToReportsSpans() {
    for (const spanId of SPAN_IDS) {
        cancelSpan(spanId);
    }
}

/** Snapshot of the active span instances, captured on mount for the identity-guarded unmount cancel. */
function getNavigateToReportsSpans() {
    return {
        firstPaint: getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT),
        contentLoad: getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD),
    };
}

/**
 * Cancels each span only if it is still the same instance captured on mount. This stops an unmount from
 * canceling spans that a newer navigation already restarted, and skips spans that already ended.
 */
function cancelNavigateToReportsSpansIfSame(captured: ReturnType<typeof getNavigateToReportsSpans>) {
    if (captured.firstPaint && getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT) === captured.firstPaint) {
        cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT);
    }
    if (captured.contentLoad && getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD) === captured.contentLoad) {
        cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD);
    }
}

export {
    startNavigateToReportsSpans,
    endNavigateToReportsFirstPaint,
    endNavigateToReportsContentLoad,
    cancelNavigateToReportsSpans,
    getNavigateToReportsSpans,
    cancelNavigateToReportsSpansIfSame,
};
