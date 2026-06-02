import type {SpanAttributeValue} from '@sentry/core';
import type {ValueOf} from 'type-fest';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import navigationRef from '@navigation/navigationRef';
import CONST from '@src/CONST';
import {cancelSpan, endSpanWithAttributes, getSpan, startSpan} from './activeSpans';

type NavigateToReportsScenario = ValueOf<typeof CONST.TELEMETRY.NAVIGATE_TO_REPORTS_SCENARIO>;

type SpanAttributes = Record<string, SpanAttributeValue | undefined>;

const SPAN_IDS = [CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT, CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD] as const;

// Scenario and the query descriptors are properties of the navigation, not of one span, so they are captured
// once at the first paint and shared with ContentLoad, which ends later at the real content paint and cannot
// tell cold from warm_first on its own. The query descriptors are read from the active route here (rather than
// passed in by callers) so no call site has to thread query data into the span helpers.
let activeScenario: NavigateToReportsScenario | undefined;
let activeQueryAttributes: SpanAttributes = {};

/** Reads type/view/groupBy from the active search route so the spans can be tagged without callers passing them in. */
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
    activeScenario = undefined;
    activeQueryAttributes = {};
    for (const spanId of SPAN_IDS) {
        startSpan(spanId, {name: spanId, op: spanId, forceTransaction: true});
    }
}

function endNavigateToReportsFirstPaint(scenario: NavigateToReportsScenario) {
    // Only the genuine first paint may capture scenario/query attributes. Later no-op end calls (e.g. a
    // content layout firing after a cold skeleton already ended FirstPaint) must not overwrite them.
    if (!getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT)) {
        return;
    }
    activeScenario = scenario;
    activeQueryAttributes = readSearchQueryAttributes();
    endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT, {
        [CONST.TELEMETRY.ATTRIBUTE_SCENARIO]: scenario,
        ...activeQueryAttributes,
    });
}

function endNavigateToReportsContentLoad() {
    endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD, {
        [CONST.TELEMETRY.ATTRIBUTE_SCENARIO]: activeScenario,
        ...activeQueryAttributes,
    });
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
