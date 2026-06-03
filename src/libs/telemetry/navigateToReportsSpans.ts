import {spanToJSON} from '@sentry/core';
import type {SpanAttributes} from '@sentry/core';
import type {ValueOf} from 'type-fest';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import navigationRef from '@navigation/navigationRef';
import CONST from '@src/CONST';
import {cancelSpan, endSpanWithAttributes, getSpan, startSpan} from './activeSpans';

type NavigateToReportsScenario = ValueOf<typeof CONST.TELEMETRY.NAVIGATE_TO_REPORTS_SCENARIO>;

const SPAN_IDS = [CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT, CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD] as const;

/**
 * Reads type/view/groupBy from the active search route so the spans can be tagged without callers passing
 * them in. Read at first paint rather than at span start: the start fires before `Navigation.navigate`, so
 * the route still points at the previous page; by the first paint it is the resolved search route.
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
 * The two spans split the legacy ManualNavigateToReports metric, while it is kept running alongside untouched:
 * - FirstPaint: ends at the first visible paint (skeleton in a cold start, content in a warm start).
 * - ContentLoad: ends only at the real content paint, so it keeps ticking through skeletons.
 *
 * Both share the tab-tap start time and the same `scenario`. Each ends at several call sites; the first
 * end-call wins because `activeSpans` keeps one span per id and a later end on an already-ended span is a no-op.
 */
function startNavigateToReportsSpans() {
    for (const spanId of SPAN_IDS) {
        startSpan(spanId, {name: spanId, op: spanId, forceTransaction: true});
    }
}

function endNavigateToReportsFirstPaint(scenario: NavigateToReportsScenario) {
    // The guard bails when FirstPaint already ended (e.g. a later content paint after the skeleton), so ContentLoad keeps its COLD tag.
    if (!getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT)) {
        return;
    }
    // Since ContentLoad ends later and cannot determine the start type (cold/warm), tag its span with the scenario now.
    getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_SCENARIO, scenario);
    endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT, {
        [CONST.TELEMETRY.ATTRIBUTE_SCENARIO]: scenario,
        ...readSearchQueryAttributes(),
    });
}

function endNavigateToReportsContentLoad() {
    const span = getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD);
    if (!span) {
        return;
    }
    // FirstPaint should set the scenario on this span. UNKNOWN is a fallback: if we see it, FirstPaint did not run and there is a bug.
    if (spanToJSON(span).data?.[CONST.TELEMETRY.ATTRIBUTE_SCENARIO] === undefined) {
        span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_SCENARIO, CONST.TELEMETRY.NAVIGATE_TO_REPORTS_SCENARIO.UNKNOWN);
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
 * Cancels each new span only if the still-active instance is the same one captured on mount, so an
 * unmount can't cancel a span that a newer navigation already restarted. A span that already ended
 * (e.g. FirstPaint after a skeleton paint) is skipped because its captured instance no longer matches.
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
