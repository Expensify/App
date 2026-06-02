import type {SpanAttributes} from '@sentry/core';
import type {ValueOf} from 'type-fest';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import navigationRef from '@navigation/navigationRef';
import CONST from '@src/CONST';
import {cancelSpan, endSpan, endSpanWithAttributes, getSpan, startSpan} from './activeSpans';

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
    // Only the first paint records scenario/query. This runs from several paint sites: in a cold start the
    // skeleton paint ends FirstPaint (scenario COLD), then the later content paint calls this again (WARM_FIRST).
    // The guard makes that second call bail (FirstPaint is already ended), so ContentLoad keeps its COLD tag.
    if (!getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT)) {
        return;
    }
    const attributes: SpanAttributes = {
        [CONST.TELEMETRY.ATTRIBUTE_SCENARIO]: scenario,
        ...readSearchQueryAttributes(),
    };
    // Scenario and the query descriptors are properties of the navigation, not of one span. ContentLoad ends
    // later (at the real content paint) and cannot tell cold from warm itself, so stamp them onto its span
    // instance now instead of carrying them in module state shared across navigations.
    getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD)?.setAttributes(attributes);
    endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT, attributes);
}

function endNavigateToReportsContentLoad() {
    // Scenario and query were stamped onto this span instance when FirstPaint ended.
    endSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD);
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
