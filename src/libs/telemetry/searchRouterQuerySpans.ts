/**
 * Lifecycle for the `ManualSearchRouterQuery` telemetry span: starts a span when a debounced Search Router query is applied,
 * backdated to the input change that produced that query so the debounce delay is included, ends it on the autocomplete
 * list's commit, and cancels it on supersede, clear, close, unmount, or timeout. Records only privacy-preserving attributes,
 * never the raw query text.
 */
import {parseForAutocomplete} from '@libs/SearchAutocompleteUtils';
import {parse as parseSearchQuery} from '@libs/SearchParser/searchParser';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import {timestampInSeconds} from '@sentry/core';

import {cancelSpan, endSpan, getSpan, startSpan} from './activeSpans';

type SearchRouterQueryCancelReason = ValueOf<typeof CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON>;
type SearchRouterQueryLengthBucket = ValueOf<typeof CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET>;

type SearchRouterQueryCommitAttributes = {
    localResultCount?: number;
    areOptionsRebuilt?: boolean;
};

/** The part of a search parser filter that the span attributes are derived from */
type ParsedQueryFilter = {
    key: string;
    value: string | string[];
};

const SHORT_QUERY_MAX_LENGTH = 2;
const MEDIUM_QUERY_MAX_LENGTH = 5;
const LONG_QUERY_MAX_LENGTH = 12;
const WHITESPACE_REGEX = /\s/;
// Same pattern the search parser uses to unquote keywords
const QUOTED_KEYWORD_REGEX = /^(['"])(.*)\1$/g;

let activeQuery: string | undefined;
let activeQueryDebouncedAt: number | undefined;
let activeQueryDeadline: number | undefined;
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

type AutocompleteRange = NonNullable<ReturnType<typeof parseForAutocomplete>>['autocomplete'];

/**
 * Returns `query` without a trailing filter that has no value yet (`taxi from:`). The router already treats it as a
 * filter, while the search parser reads a key without a value as free text.
 */
function getQueryWithoutEmptyAutocompleteFilter(query: string, autocomplete: AutocompleteRange | undefined): string {
    if (!autocomplete || autocomplete.value) {
        return query;
    }
    let tokenStart = autocomplete.start;
    while (tokenStart > 0 && WHITESPACE_REGEX.test(query.charAt(tokenStart - 1))) {
        tokenStart -= 1;
    }
    while (tokenStart > 0 && !WHITESPACE_REGEX.test(query.charAt(tokenStart - 1))) {
        tokenStart -= 1;
    }
    return query.slice(0, tokenStart);
}

function isParsedQueryFilter(filter: unknown): filter is ParsedQueryFilter {
    if (typeof filter !== 'object' || filter === null || !('key' in filter) || !('value' in filter)) {
        return false;
    }
    const {key, value} = filter;
    return typeof key === 'string' && (typeof value === 'string' || (Array.isArray(value) && value.every((item) => typeof item === 'string')));
}

/**
 * Returns the filters the search parser reads from `query`, or `undefined` when it rejects the query. Parses directly
 * rather than through `getRawFilterListFromQuery`, whose failure log carries the raw query and is uploaded to the server.
 */
function getParsedQueryFilters(query: string): ParsedQueryFilter[] | undefined {
    let parsedQuery: unknown;
    try {
        parsedQuery = parseSearchQuery(query);
    } catch {
        return undefined;
    }
    if (typeof parsedQuery !== 'object' || parsedQuery === null || !('rawFilterList' in parsedQuery) || !Array.isArray(parsedQuery.rawFilterList)) {
        return undefined;
    }
    return parsedQuery.rawFilterList.filter(isParsedQueryFilter);
}

function clearActiveQuery() {
    clearTimeout(timeoutID);
    timeoutID = undefined;
    activeQuery = undefined;
    activeQueryDebouncedAt = undefined;
    activeQueryDeadline = undefined;
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
        return CONST.TELEMETRY.SEARCH_ROUTER_QUERY_AUTOCOMPLETE_KEY.NONE;
    }
    if (key.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)) {
        return CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD;
    }
    return key;
}

/**
 * Returns when the query changed. The input event's timestamp is captured before the event waits for the JS thread, so it
 * includes that wait, unlike `now`. It shares `performance.now()`'s clock, but RN falls back to `Date.now()` when the
 * event has no timestamp, so a value in the future or older than the query max duration is not a usable `performance.now()` reading.
 */
function getSearchRouterQueryChangedAt(eventTimeStamp: number | undefined, now: number): number {
    if (eventTimeStamp === undefined || !Number.isFinite(eventTimeStamp) || eventTimeStamp > now || now - eventTimeStamp > CONST.TELEMETRY.SEARCH_ROUTER_QUERY_MAX_DURATION_MS) {
        return now;
    }
    return eventTimeStamp;
}

/**
 * Starts the span for a query the autocomplete list is about to evaluate. `isTypedInput` is false for a query set without
 * typing, such as a picked suggestion: that is not a keystroke, so it supersedes the pending span without being measured
 * or counting toward the per-open cap.
 */
function startSearchRouterQuerySpan(debouncedQuery: string, changedAt?: number, isTypedInput = true) {
    if (!debouncedQuery.trim()) {
        cancelSearchRouterQuerySpan(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.CLEARED);
        return;
    }
    if (!isTypedInput || measuredCount >= CONST.TELEMETRY.SEARCH_ROUTER_MAX_MEASURED_QUERIES_PER_OPEN) {
        cancelSearchRouterQuerySpan(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.SUPERSEDED);
        return;
    }

    const autocomplete = parseForAutocomplete(debouncedQuery)?.autocomplete;
    const parsableQuery = getQueryWithoutEmptyAutocompleteFilter(debouncedQuery, autocomplete);
    // Unlike the autocomplete parser, the search parser knows every supported key, including the ones the router
    // doesn't autocomplete (`keyword`, `sortBy`, `sortOrder`, `compare`). It returns free text as `keyword` filters,
    // which also covers `keyword:taxi`, the same search as `taxi`. A query it rejects counts as free text in full.
    // Its raw filters keep the quotes around a quoted keyword (`"a"`), which the list searches for without them.
    const parsedFilters = getParsedQueryFilters(parsableQuery);
    const freeText = parsedFilters
        ? parsedFilters
              .filter((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD)
              .flatMap((filter) => filter.value)
              .map((keyword) => keyword.replaceAll(QUOTED_KEYWORD_REGEX, '$2'))
              .join(' ')
        : parsableQuery;

    cancelSearchRouterQuerySpan(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.SUPERSEDED);
    const queryOrdinal = measuredCount + 1;
    const elapsedMs = changedAt !== undefined ? Math.max(0, performance.now() - changedAt) : 0;
    startSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY, {
        name: CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY,
        op: CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY,
        // Sentry's own clock, so the backdated start lines up with the span's end time.
        startTime: timestampInSeconds() - elapsedMs / 1000,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_QUERY_LENGTH_BUCKET]: getSearchRouterQueryLengthBucket([...freeText.trim()].length),
            [CONST.TELEMETRY.ATTRIBUTE_HAS_FILTER]: !!autocomplete || !!parsedFilters?.some((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD),
            [CONST.TELEMETRY.ATTRIBUTE_AUTOCOMPLETE_KEY]: getAutocompleteKey(autocomplete?.key),
            [CONST.TELEMETRY.ATTRIBUTE_QUERY_ORDINAL]: queryOrdinal,
        },
    });
    if (!getSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY)) {
        // startSpan skips while the app is backgrounded, so this query uses no slot of the per-open cap.
        return;
    }
    measuredCount = queryOrdinal;
    activeQuery = debouncedQuery;
    activeQueryDebouncedAt = performance.now();
    activeQueryDeadline = activeQueryDebouncedAt + CONST.TELEMETRY.SEARCH_ROUTER_QUERY_MAX_DURATION_MS - elapsedMs;
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
    if (activeQueryDeadline !== undefined && performance.now() > activeQueryDeadline) {
        cancelSearchRouterQuerySpan(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON.TIMED_OUT);
        return;
    }
    const rootSpan = getSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY);
    if (attributes?.localResultCount !== undefined) {
        rootSpan?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_LOCAL_RESULT_COUNT, attributes.localResultCount);
    }
    if (attributes?.areOptionsRebuilt !== undefined) {
        rootSpan?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_OPTIONS_REBUILT, attributes.areOptionsRebuilt);
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
    getSearchRouterQueryChangedAt,
};
