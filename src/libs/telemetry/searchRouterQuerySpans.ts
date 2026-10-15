/**
 * Lifecycle for the `ManualSearchRouterQuery` telemetry span: starts a span when a debounced Search Router query is applied,
 * backdated to the input change that produced that query so the debounce delay is included, ends it on the autocomplete
 * list's commit, and cancels it on supersede/clear/close/unmount/timeout. Records only privacy-preserving attributes,
 * never the raw query text.
 */
import {parseForAutocomplete} from '@libs/SearchAutocompleteUtils';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import {timestampInSeconds} from '@sentry/core';

import {cancelSpan, endSpan, getSpan, startSpan} from './activeSpans';

type SearchRouterQueryCancelReason = ValueOf<typeof CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON>;
type SearchRouterQueryLengthBucket = ValueOf<typeof CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET>;

type SearchRouterQueryCommitAttributes = {
    localResultCount?: number;
};

const SHORT_QUERY_MAX_LENGTH = 2;
const MEDIUM_QUERY_MAX_LENGTH = 5;
const LONG_QUERY_MAX_LENGTH = 12;
const WHITESPACE_REGEX = /\s/;

let activeQuery: string | undefined;
let activeQueryDebouncedAt: number | undefined;
let measuredCount = 0;
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
    activeQueryDebouncedAt = undefined;
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

function getAutocompleteKey(key: string | undefined): string {
    if (!key) {
        return 'none';
    }
    if (key.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)) {
        return CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD;
    }
    return key;
}

function startSearchRouterQuerySpan(debouncedQuery: string, changedAt?: number) {
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
    const elapsedMs = changedAt !== undefined ? Math.max(0, performance.now() - changedAt) : 0;
    startSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY, {
        name: CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY,
        op: CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY,
        // Sentry's own clock, so the backdated start lines up with the span's end time.
        startTime: timestampInSeconds() - elapsedMs / 1000,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_QUERY_LENGTH_BUCKET]: getSearchRouterQueryLengthBucket([...freeText.trim()].length),
            [CONST.TELEMETRY.ATTRIBUTE_HAS_FILTER]: filterRanges.length > 0 || !!parsedQuery?.autocomplete,
            [CONST.TELEMETRY.ATTRIBUTE_AUTOCOMPLETE_KEY]: getAutocompleteKey(parsedQuery?.autocomplete?.key),
            [CONST.TELEMETRY.ATTRIBUTE_QUERY_ORDINAL]: measuredCount,
        },
    });
    if (!getSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY)) {
        // startSpan skips while the app is backgrounded.
        return;
    }
    activeQuery = debouncedQuery;
    activeQueryDebouncedAt = performance.now();
    timeoutID = setTimeout(
        () => cancelSearchRouterQuerySpan(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.TIMED_OUT),
        Math.max(0, CONST.TELEMETRY.SEARCH_ROUTER_QUERY_MAX_DURATION_MS - elapsedMs),
    );
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
    if (attributes?.localResultCount !== undefined) {
        rootSpan?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_LOCAL_RESULT_COUNT, attributes.localResultCount);
    }
    if (activeQueryDebouncedAt !== undefined) {
        const renderDurationMs = Math.round(performance.now() - activeQueryDebouncedAt);
        rootSpan?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_RENDER_DURATION_MS, renderDurationMs);
    }
    clearActiveQuery();
    endSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY);
}

export {
    beginSearchRouterQuerySession,
    endSearchRouterQuerySession,
    startSearchRouterQuerySpan,
    markSearchRouterQueryCommitted,
    cancelSearchRouterQuerySpan,
    getSearchRouterQueryLengthBucket,
};
