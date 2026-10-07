import {parseForAutocomplete} from '@libs/SearchAutocompleteUtils';

import CONST from '@src/CONST';

import type {SpanAttributeValue} from '@sentry/core';
import type {ValueOf} from 'type-fest';

import {cancelSpan, endSpan, getSpan, startSpan} from './activeSpans';

type SearchRouterQueryPhase = ValueOf<typeof CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY_PHASE>;
type SearchRouterQueryCancelReason = ValueOf<typeof CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON>;
type SearchRouterQueryLengthBucket = ValueOf<typeof CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET>;
type SearchRouterQueryFilterSource = ValueOf<typeof CONST.TELEMETRY.SEARCH_ROUTER_QUERY_FILTER_SOURCE>;
type SearchRouterSearchPath = ValueOf<typeof CONST.TELEMETRY.SEARCH_ROUTER_SEARCH_PATH>;

type SearchRouterQueryCommitAttributes = {
    resultCount?: number;
    searchPath?: SearchRouterSearchPath;
};

type SearchRouterQueryPhaseAttributes = {
    filterSource?: SearchRouterQueryFilterSource;
};

const SHORT_QUERY_MAX_LENGTH = 2;
const MEDIUM_QUERY_MAX_LENGTH = 5;
const LONG_QUERY_MAX_LENGTH = 12;
const WHITESPACE_REGEX = /\s/;

let activeQuery: string | undefined;
let measuredCount = 0;
let didRebuildOptionList = false;
let timeoutID: ReturnType<typeof setTimeout> | undefined;

function getSearchRouterQueryLengthBucket(length: number): SearchRouterQueryLengthBucket {
    const buckets = CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET;
    if (length <= 0) {
        return buckets.EMPTY;
    }
    if (length <= SHORT_QUERY_MAX_LENGTH) {
        return buckets.SHORT;
    }
    if (length <= MEDIUM_QUERY_MAX_LENGTH) {
        return buckets.MEDIUM;
    }
    return length <= LONG_QUERY_MAX_LENGTH ? buckets.LONG : buckets.VERY_LONG;
}

/**
 * Returns `query` without its filter tokens, so only the free text is left. The parser's ranges cover filter values
 * only, so each one is widened back to the start of its token to also drop the key and operator in front of it
 * (`-amount>=10`, `from:a,b`). Text that only looks like a filter, such as `10:30`, stays free text.
 */
function getSearchRouterQueryFreeText(query: string, filterRanges: Array<{start: number; length: number}>): string {
    const isFilterCharacter = new Array<boolean>(query.length).fill(false);
    for (const range of filterRanges) {
        let tokenStart = range.start;
        while (tokenStart > 0 && !WHITESPACE_REGEX.test(query.charAt(tokenStart - 1))) {
            tokenStart -= 1;
        }
        isFilterCharacter.fill(true, tokenStart, range.start + range.length);
    }
    return query
        .split('')
        .filter((_, index) => !isFilterCharacter.at(index))
        .join('');
}

function clearActiveQuery() {
    clearTimeout(timeoutID);
    timeoutID = undefined;
    activeQuery = undefined;
    didRebuildOptionList = false;
}

function beginSearchRouterQuerySession() {
    cancelSearchRouterQuerySpan(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.SUPERSEDED);
    measuredCount = 0;
}

function endSearchRouterQuerySession() {
    cancelSearchRouterQuerySpan(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.UNMOUNTED);
}

function cancelSearchRouterQuerySpan(reason: SearchRouterQueryCancelReason) {
    const rootSpan = getSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY);
    clearActiveQuery();
    if (!rootSpan) {
        return;
    }
    rootSpan.setAttribute(CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON, reason);
    cancelSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY);
}

function startSearchRouterQuerySpan(debouncedQuery: string) {
    if (!debouncedQuery.trim()) {
        cancelSearchRouterQuerySpan(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.CLEARED);
        return;
    }
    if (measuredCount >= CONST.TELEMETRY.SEARCH_ROUTER_MAX_MEASURED_QUERIES_PER_OPEN) {
        cancelSearchRouterQuerySpan(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.SUPERSEDED);
        return;
    }

    const parsedQuery = parseForAutocomplete(debouncedQuery);
    // `ranges` covers the filter values only. It includes the value being autocompleted once that value is non-empty,
    // so a bare `from:` is only reported through `autocomplete`.
    const filterRanges = parsedQuery?.ranges ?? [];
    const freeText = getSearchRouterQueryFreeText(debouncedQuery, parsedQuery?.autocomplete ? [...filterRanges, parsedQuery.autocomplete] : filterRanges);

    cancelSearchRouterQuerySpan(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.SUPERSEDED);
    measuredCount += 1;
    startSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY, {
        name: CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY,
        op: CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_QUERY_LENGTH_BUCKET]: getSearchRouterQueryLengthBucket([...freeText.trim()].length),
            [CONST.TELEMETRY.ATTRIBUTE_HAS_FILTER]: filterRanges.length > 0 || !!parsedQuery?.autocomplete,
            [CONST.TELEMETRY.ATTRIBUTE_AUTOCOMPLETE_KEY]: parsedQuery?.autocomplete?.key ?? 'none',
            [CONST.TELEMETRY.ATTRIBUTE_QUERY_ORDINAL]: measuredCount,
        },
    });
    if (!getSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY)) {
        // startSpan skips while the app is backgrounded.
        return;
    }
    activeQuery = debouncedQuery;
    timeoutID = setTimeout(() => cancelSearchRouterQuerySpan(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.TIMED_OUT), CONST.TELEMETRY.SEARCH_ROUTER_QUERY_MAX_DURATION_MS);
}

function markSearchRouterQueryCommitted(query: string, attributes?: SearchRouterQueryCommitAttributes, isMountCommit = false) {
    if (activeQuery === undefined || query !== activeQuery) {
        return;
    }
    if (isMountCommit) {
        cancelSearchRouterQuerySpan(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.LIST_MOUNT);
        return;
    }
    const rootSpan = getSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY);
    rootSpan?.setAttributes({
        [CONST.TELEMETRY.ATTRIBUTE_OPTION_LIST_REBUILT]: didRebuildOptionList,
        [CONST.TELEMETRY.ATTRIBUTE_SEARCH_PATH]: attributes?.searchPath ?? CONST.TELEMETRY.SEARCH_ROUTER_SEARCH_PATH.LEGACY,
        ...(attributes?.resultCount === undefined ? {} : {[CONST.TELEMETRY.ATTRIBUTE_RESULT_COUNT]: attributes.resultCount}),
    });
    clearActiveQuery();
    endSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY);
}

/**
 * Runs `run` and times it as a child of the active query span. Without an active root span it only runs `run`, because
 * Sentry would otherwise attach the child to whatever span is active on the scope (other useFilteredOptions users stay silent).
 */
function measureSearchRouterQueryPhase<T>(phase: SearchRouterQueryPhase, attributes: SearchRouterQueryPhaseAttributes | undefined, run: () => T): T {
    const parentSpan = getSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY);
    if (!parentSpan) {
        return run();
    }
    if (phase === CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY_PHASE.OPTION_LIST) {
        didRebuildOptionList = true;
    }
    const spanAttributes: Record<string, SpanAttributeValue> = {};
    if (attributes?.filterSource) {
        spanAttributes[CONST.TELEMETRY.ATTRIBUTE_FILTER_SOURCE] = attributes.filterSource;
    }
    startSpan(phase, {
        name: phase,
        op: phase,
        parentSpan,
        attributes: spanAttributes,
    });
    try {
        return run();
    } finally {
        // Must end before the root, because Sentry drops descendants that have not ended when the root does.
        endSpan(phase);
    }
}

export {
    beginSearchRouterQuerySession,
    endSearchRouterQuerySession,
    startSearchRouterQuerySpan,
    markSearchRouterQueryCommitted,
    cancelSearchRouterQuerySpan,
    measureSearchRouterQueryPhase,
    getSearchRouterQueryLengthBucket,
};
