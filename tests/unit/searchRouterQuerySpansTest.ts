import Log from '@libs/Log';
import {parse as parseSearchQuery} from '@libs/SearchParser/searchParser';
import {cancelAllSpans, getSpan} from '@libs/telemetry/activeSpans';
import {
    beginSearchRouterQuerySession,
    cancelSearchRouterQuerySpan,
    endSearchRouterQuerySession,
    getSearchRouterQueryChangedAt,
    getSearchRouterQueryLengthBucket,
    markSearchRouterQueryCommitted,
    startSearchRouterQuerySpan,
} from '@libs/telemetry/searchRouterQuerySpans';

import CONST from '@src/CONST';

import {AppState} from 'react-native';

type FakeSpan = {
    op?: string;
    parentSpan?: FakeSpan;
    startTime?: number;
    attributes: Record<string, unknown>;
    setAttribute: (key: string, value: unknown) => void;
    setAttributes: (attrs: Record<string, unknown>) => void;
    setStatus: () => void;
    end: () => void;
};

const mockStarted: FakeSpan[] = [];
const mockEnded: FakeSpan[] = [];

// Sentry caches its clock on first use, which breaks once Jest swaps `performance` for each test's fake timers.
jest.mock('@sentry/core', () => ({
    ...jest.requireActual<Record<string, unknown>>('@sentry/core'),
    timestampInSeconds: () => performance.now() / 1000,
}));

jest.mock('@sentry/react-native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@sentry/react-native'),
    startInactiveSpan: (options: {op?: string; parentSpan?: FakeSpan; startTime?: number; attributes?: Record<string, unknown>}): FakeSpan => {
        const span: FakeSpan = {
            op: options.op,
            parentSpan: options.parentSpan,
            startTime: options.startTime,
            attributes: {...options.attributes},
            setAttribute(key: string, value: unknown) {
                this.attributes[key] = value;
            },
            setAttributes(attrs: Record<string, unknown>) {
                Object.assign(this.attributes, attrs);
            },
            setStatus() {},
            end() {
                mockEnded.push(this);
            },
        };
        mockStarted.push(span);
        return span;
    },
    spanToJSON: (span: FakeSpan) => ({data: span.attributes}),
}));

jest.mock('@libs/Log');

const ROOT = CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY;
const CANCEL_REASON = CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON;

function getLastRootStartTime() {
    return mockStarted.findLast((span) => span.op === ROOT)?.startTime;
}

function getRootAttributes() {
    const root = mockEnded.find((span) => span.op === ROOT);
    return root?.attributes;
}

describe('searchRouterQuerySpans', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockStarted.length = 0;
        mockEnded.length = 0;
        beginSearchRouterQuerySession();
    });

    afterEach(() => {
        endSearchRouterQuerySession();
        cancelAllSpans();
        jest.useRealTimers();
    });

    it('uses a valid input event timestamp as the query change time', () => {
        // Given an event timestamp recently before now, on the same clock as `performance.now()`
        // When the change time is resolved
        // Then the event timestamp wins, so the time the event waited for the JS thread is included
        expect(getSearchRouterQueryChangedAt(900, 1000)).toBe(900);
    });

    it('falls back to now when the input event timestamp is missing', () => {
        // Given an input change that carries no timestamp
        // When the change time is resolved
        // Then it falls back to the current time because no event timestamp was provided
        expect(getSearchRouterQueryChangedAt(undefined, 1000)).toBe(1000);
        expect(getSearchRouterQueryChangedAt(Number.NaN, 1000)).toBe(1000);
    });

    it('falls back to now when the input event timestamp is an epoch value', () => {
        // Given RN's `Date.now()` fallback for events without a timestamp, which is far ahead of `performance.now()`
        // When the change time is resolved
        // Then it falls back to the current time because epoch timestamps cannot be compared with performance.now()
        expect(getSearchRouterQueryChangedAt(Date.now(), 1000)).toBe(1000);
    });

    it('falls back to now when the input event timestamp is older than the query max duration', () => {
        // Given a timestamp older than the query max duration, which cannot be part of a valid query span
        const now = 20_000;
        const tooOld = now - CONST.TELEMETRY.SEARCH_ROUTER_QUERY_MAX_DURATION_MS - 1;

        // When the change time is resolved
        // Then it falls back to the current time because stale event timestamps do not reflect this edit, while a timestamp at the max duration boundary is accepted
        expect(getSearchRouterQueryChangedAt(tooOld, now)).toBe(now);
        expect(getSearchRouterQueryChangedAt(tooOld + 1, now)).toBe(tooOld + 1);
    });

    it('buckets the free-text length in size order', () => {
        // Given lengths on both sides of every bucket border
        // When they are bucketed
        // Then each lands in its bucket, and the numeric prefixes sort in size order
        const buckets = CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET;
        expect([0, 1, 2, 3, 5, 6, 12, 13].map(getSearchRouterQueryLengthBucket)).toEqual([
            buckets.EMPTY,
            buckets.SHORT,
            buckets.SHORT,
            buckets.MEDIUM,
            buckets.MEDIUM,
            buckets.LONG,
            buckets.LONG,
            buckets.VERY_LONG,
        ]);
        expect(Object.values(buckets)).toEqual([...Object.values(buckets)].sort());
    });

    it('does not start a span for an empty query and cancels the pending one as cleared', () => {
        // Given an active query span
        startSearchRouterQuerySpan('abc');
        expect(getSpan(ROOT)).toBeDefined();

        // When the debounced query becomes blank
        startSearchRouterQuerySpan('   ');

        // Then the span is cancelled as cleared and nothing new starts
        expect(getSpan(ROOT)).toBeUndefined();
        expect(getRootAttributes()?.[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CANCEL_REASON.CLEARED);
        expect(getRootAttributes()?.[CONST.TELEMETRY.ATTRIBUTE_CANCELED]).toBe(true);
    });

    it('ends the span with commit attributes when the matching query commits', () => {
        // Given an active span for "abc"
        startSearchRouterQuerySpan('abc');

        // When that query commits
        markSearchRouterQueryCommitted('abc', {localResultCount: 7});

        // Then the span ends with the result count
        expect(getSpan(ROOT)).toBeUndefined();
        const attributes = getRootAttributes();
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_LOCAL_RESULT_COUNT]).toBe(7);
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_QUERY_ORDINAL]).toBe(1);
    });

    it('records whether the options were rebuilt as the options_rebuilt attribute', () => {
        // Given an active span for "abc"
        startSearchRouterQuerySpan('abc');

        // When that query commits after the option list was rebuilt
        markSearchRouterQueryCommitted('abc', {areOptionsRebuilt: true});

        // Then the span ends with options_rebuilt set so samples can be split by it
        expect(getRootAttributes()?.[CONST.TELEMETRY.ATTRIBUTE_OPTIONS_REBUILT]).toBe(true);
    });

    it('ignores a commit for a different query', () => {
        // Given an active span for "abc"
        startSearchRouterQuerySpan('abc');

        // When a commit arrives for the previous query
        markSearchRouterQueryCommitted('ab');

        // Then the span stays open
        expect(getSpan(ROOT)).toBeDefined();
        expect(mockEnded).toHaveLength(0);
    });

    it('cancels the previous span as superseded when a new query starts', () => {
        // Given an active span for "abc"
        startSearchRouterQuerySpan('abc');

        // When the next debounced value fires before the first committed
        startSearchRouterQuerySpan('abcd');

        // Then the first is cancelled as superseded and the second is active with ordinal 2
        expect(mockEnded).toHaveLength(1);
        expect(mockEnded.at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CANCEL_REASON.SUPERSEDED);
        markSearchRouterQueryCommitted('abcd');
        expect(getRootAttributes()).toBeDefined();
        expect(mockEnded.at(1)?.attributes[CONST.TELEMETRY.ATTRIBUTE_QUERY_ORDINAL]).toBe(2);
    });

    it('cancels instead of finishing for the mount commit', () => {
        // Given an active span
        startSearchRouterQuerySpan('abc');

        // When the commit is the list's first layout
        markSearchRouterQueryCommitted('abc', undefined, true);

        // Then it is cancelled as list_mount, since that layout belongs to the open span
        expect(mockEnded.at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CANCEL_REASON.LIST_MOUNT);
    });

    it('stops measuring after the per-open cap and resets on a new session', () => {
        // Given the cap is reached by committed queries
        for (let i = 0; i < CONST.TELEMETRY.SEARCH_ROUTER_MAX_MEASURED_QUERIES_PER_OPEN; i++) {
            startSearchRouterQuerySpan(`query${i}`);
            markSearchRouterQueryCommitted(`query${i}`);
        }
        mockEnded.length = 0;

        // When another query starts
        startSearchRouterQuerySpan('over cap');

        // Then no span starts
        expect(getSpan(ROOT)).toBeUndefined();

        // When the router is reopened
        beginSearchRouterQuerySession();
        startSearchRouterQuerySpan('fresh');

        // Then measuring resumes
        expect(getSpan(ROOT)).toBeDefined();
    });

    it('does not measure a query set without typing, nor count it toward the cap', () => {
        // Given a typed query whose list commit is still pending
        startSearchRouterQuerySpan('ab');

        // When the query changes without typing, as when the user picks a suggestion
        startSearchRouterQuerySpan('type:chat in:General ', undefined, false);

        // Then the pending span is cancelled as superseded, since the list will never commit its query, and no span starts for the pick
        expect(getSpan(ROOT)).toBeUndefined();
        expect(getRootAttributes()?.[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CANCEL_REASON.SUPERSEDED);

        // When the user types again
        startSearchRouterQuerySpan('abc');

        // Then the pick used no slot of the per-open cap, so the next typed query is the second attempt
        expect(getSpan(ROOT)).toBeDefined();
        expect(mockStarted.findLast((span) => span.op === ROOT)?.attributes[CONST.TELEMETRY.ATTRIBUTE_QUERY_ORDINAL]).toBe(2);
    });

    it('does not count a query that started while the app was backgrounded toward the cap', () => {
        // Given the app is in the background, where startSpan skips starting spans
        const appStateSpy = jest.spyOn(AppState, 'currentState', 'get').mockReturnValue(CONST.APP_STATE.BACKGROUND);

        // When a typed query settles
        startSearchRouterQuerySpan('ab');

        // Then no span starts
        expect(getSpan(ROOT)).toBeUndefined();

        // When the app returns to the foreground and the user types again
        appStateSpy.mockRestore();
        startSearchRouterQuerySpan('abc');

        // Then the skipped query used no slot of the per-open cap, so this one is the first attempt
        expect(getSpan(ROOT)).toBeDefined();
        expect(mockStarted.findLast((span) => span.op === ROOT)?.attributes[CONST.TELEMETRY.ATTRIBUTE_QUERY_ORDINAL]).toBe(1);
    });

    it('cancels a span that outlives the max duration as timed_out', () => {
        // Given an active span that never commits
        startSearchRouterQuerySpan('abc');

        // When the max duration passes
        jest.advanceTimersByTime(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_MAX_DURATION_MS);

        // Then it is cancelled as timed_out
        expect(getSpan(ROOT)).toBeUndefined();
        expect(mockEnded.at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CANCEL_REASON.TIMED_OUT);
    });

    it('cancels a span as timed_out when its query starts after the max duration and commits before the timeout fires', () => {
        // Given a debounced query whose input change is already older than the max duration, as after a long JS thread freeze
        const changedAt = performance.now() - CONST.TELEMETRY.SEARCH_ROUTER_QUERY_MAX_DURATION_MS - 1000;
        startSearchRouterQuerySpan('abc', changedAt);

        // When the list commits the query before the zero-delay timeout runs
        markSearchRouterQueryCommitted('abc');

        // Then the span is cancelled as timed_out instead of ending as a successful sample longer than the max duration
        expect(getSpan(ROOT)).toBeUndefined();
        expect(mockEnded.at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCELED]).toBe(true);
        expect(mockEnded.at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CANCEL_REASON.TIMED_OUT);
    });

    it('cancels a span as timed_out when the render that commits its query runs past the max duration', () => {
        // Given an active span close to its max duration
        const changedAt = performance.now();
        jest.advanceTimersByTime(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_MAX_DURATION_MS - 100);
        startSearchRouterQuerySpan('abc', changedAt);

        // When a render that blocks the JS thread, so the timeout can't run, commits the query past the max duration
        const performanceNowSpy = jest.spyOn(performance, 'now').mockReturnValue(changedAt + CONST.TELEMETRY.SEARCH_ROUTER_QUERY_MAX_DURATION_MS + 1000);
        markSearchRouterQueryCommitted('abc');
        performanceNowSpy.mockRestore();

        // Then the span is cancelled as timed_out instead of ending as a successful sample longer than the max duration
        expect(getSpan(ROOT)).toBeUndefined();
        expect(mockEnded.at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CANCEL_REASON.TIMED_OUT);
    });

    it('backdates the span start to the input change that produced the query', () => {
        // Given the input changed and the debounce delay then passed
        const changedAt = performance.now();
        jest.advanceTimersByTime(CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);

        // When the debounced query starts its span
        startSearchRouterQuerySpan('abc', changedAt);

        // Then the span starts at the input change, so the debounce delay is part of the measured latency
        expect(getLastRootStartTime()).toBeCloseTo((performance.now() - CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME) / 1000, 3);
    });

    it('starts the span now when the input change time is unknown', () => {
        // Given a query change where the input change time was not provided
        // When the debounced query starts its span
        startSearchRouterQuerySpan('abc');

        // Then the span starts at the current time because no prior input timestamp is available
        expect(getLastRootStartTime()).toBeCloseTo(performance.now() / 1000, 3);
    });

    it('counts the max duration from the backdated start', () => {
        // Given a span backdated to an input change one debounce delay ago
        const changedAt = performance.now();
        jest.advanceTimersByTime(CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);
        startSearchRouterQuerySpan('abc', changedAt);

        // When the max duration since the input change passes
        jest.advanceTimersByTime(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_MAX_DURATION_MS - CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);

        // Then it is cancelled as timed_out, since the span's duration is measured from that input change
        expect(getSpan(ROOT)).toBeUndefined();
        expect(mockEnded.at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CANCEL_REASON.TIMED_OUT);
    });

    it('records render_duration_ms measuring the post-debounce commit latency', () => {
        // Given an active query span
        const changedAt = performance.now();
        jest.advanceTimersByTime(CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);
        startSearchRouterQuerySpan('abc', changedAt);

        // When the query commits after some rendering time
        const renderTimeMs = 35;
        jest.advanceTimersByTime(renderTimeMs);
        markSearchRouterQueryCommitted('abc');

        // Then render_duration_ms is recorded on the ended span
        const attributes = getRootAttributes();
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_RENDER_DURATION_MS]).toBe(renderTimeMs);
    });

    it('cancels with the given reason on close and on session end', () => {
        // Given an active span
        startSearchRouterQuerySpan('abc');

        // When the router closes
        cancelSearchRouterQuerySpan(CANCEL_REASON.CLOSED);

        // Then the reason is recorded
        expect(mockEnded.at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CANCEL_REASON.CLOSED);

        // When the session ends with another active span
        startSearchRouterQuerySpan('abcd');
        endSearchRouterQuerySession();

        // Then it is cancelled as unmounted
        expect(mockEnded.at(1)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CANCEL_REASON.UNMOUNTED);
    });

    it('derives filter attributes from the parsed query', () => {
        // Given a query with a filter being autocompleted
        startSearchRouterQuerySpan('to:jo');

        // When that query commits
        markSearchRouterQueryCommitted('to:jo');

        // Then the shape is recorded and the free-text part is empty
        const attributes = getRootAttributes();
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_HAS_FILTER]).toBe(true);
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_AUTOCOMPLETE_KEY]).toBe(CONST.SEARCH.SYNTAX_FILTER_KEYS.TO);
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_QUERY_LENGTH_BUCKET]).toBe(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.EMPTY);
    });

    it('normalizes dynamic report field keys to reportField in telemetry', () => {
        // Given a query autocompleting a custom report field with sensitive workspace data
        const sensitiveFieldName = 'secret-client-deal';
        const query = `report-field-${sensitiveFieldName}:acme`;
        startSearchRouterQuerySpan(query);

        // When that query commits
        markSearchRouterQueryCommitted(query);

        // Then the key is normalized to prevent user data leaks and tag cardinality explosion
        const attributes = getRootAttributes();
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_AUTOCOMPLETE_KEY]).toBe(CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD);
        const serialized = JSON.stringify(mockEnded.map((span) => span.attributes)).toLowerCase();
        expect(serialized).not.toContain(sensitiveFieldName);
        expect(serialized).not.toContain('acme');
    });

    it.each([
        ['an operator filter', 'amount>100 taxi', CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.MEDIUM],
        ['a negated filter', '-date<2024-01-01 x', CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.SHORT],
        ['a multi-value filter', 'from:a,b lunch', CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.MEDIUM],
        ['a quoted filter value', 'from:"john smith" taxi', CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.MEDIUM],
        ['an empty filter being autocompleted', 'taxi from:', CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.MEDIUM],
        ['colon-separated free text', 'at 10:30', CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.LONG],
    ])('buckets only the free text of a query with %s', (_, query, expectedBucket) => {
        // Given a query whose filter tokens must not count toward the free-text length, while look-alike text must
        startSearchRouterQuerySpan(query);

        // When it commits
        markSearchRouterQueryCommitted(query);

        // Then the bucket reflects the free text alone
        expect(getRootAttributes()?.[CONST.TELEMETRY.ATTRIBUTE_QUERY_LENGTH_BUCKET]).toBe(expectedBucket);
    });

    it.each([
        ['an explicit keyword filter', 'keyword:taxi', false, CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.MEDIUM],
        ['a sortBy key', 'sortBy:date taxi', true, CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.MEDIUM],
        ['a sortOrder key', 'sortOrder:asc', true, CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.EMPTY],
        ['a compare key', 'compare:average', true, CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.EMPTY],
    ])('classifies a query with %s, which the router does not autocomplete', (_, query, expectedHasFilter, expectedBucket) => {
        // Given a query using search syntax that the autocomplete parser doesn't model, but the search parser accepts
        startSearchRouterQuerySpan(query);

        // When it commits
        markSearchRouterQueryCommitted(query);

        // Then the syntax token is not counted as free text, and only keys that narrow or reshape the search count as a filter,
        // since `keyword:taxi` is the same search as `taxi`
        const attributes = getRootAttributes();
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_HAS_FILTER]).toBe(expectedHasFilter);
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_QUERY_LENGTH_BUCKET]).toBe(expectedBucket);
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_AUTOCOMPLETE_KEY]).toBe(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_AUTOCOMPLETE_KEY.NONE);
    });

    it.each([
        ['double quotes', '"a"', CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.SHORT],
        ['single quotes on an explicit keyword', "keyword:'a'", CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.SHORT],
        ['a quoted phrase', '"ab cd"', CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.MEDIUM],
    ])('does not count the quotes of free text in %s toward its length', (_, query, expectedBucket) => {
        // Given quoted free text, which the search parser keeps quoted in its raw filters while the list searches for it unquoted
        startSearchRouterQuerySpan(query);

        // When it commits
        markSearchRouterQueryCommitted(query);

        // Then the length bucket reflects the text the list searches for, so quoting a term does not move it to a longer bucket
        expect(getRootAttributes()?.[CONST.TELEMETRY.ATTRIBUTE_QUERY_LENGTH_BUCKET]).toBe(expectedBucket);
    });

    it('treats a trailing filter key without a value as a filter, not free text', () => {
        // Given free text followed by a filter key the user hasn't typed a value for yet, which the search parser alone reads as free text
        const query = 'taxi from: ';
        startSearchRouterQuerySpan(query);

        // When it commits
        markSearchRouterQueryCommitted(query);

        // Then only the text before the key counts as free text and the pending filter is reported
        const attributes = getRootAttributes();
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_HAS_FILTER]).toBe(true);
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_AUTOCOMPLETE_KEY]).toBe(CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_QUERY_LENGTH_BUCKET]).toBe(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.MEDIUM);
    });

    it('measures a query the search parser rejects without logging it', () => {
        // Given a query the search parser throws on, because the `keyword` value is a list, with private free text next to it
        const query = 'keyword:a,b secret.person@example.com';
        // If the parser starts accepting this query, pick another one it rejects, or this test no longer covers the failure path
        expect(() => {
            parseSearchQuery(query);
        }).toThrow();
        const logSpies = [jest.spyOn(Log, 'info'), jest.spyOn(Log, 'alert'), jest.spyOn(Log, 'warn'), jest.spyOn(Log, 'hmmm')];

        // When the whole lifecycle runs
        startSearchRouterQuerySpan(query);
        markSearchRouterQueryCommitted(query);

        // Then the query counts as free text in full, and nothing is logged, since server logs would carry the query off the device
        expect(getRootAttributes()?.[CONST.TELEMETRY.ATTRIBUTE_QUERY_LENGTH_BUCKET]).toBe(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.VERY_LONG);
        for (const spy of logSpies) {
            expect(spy).not.toHaveBeenCalled();
            spy.mockRestore();
        }
    });

    it('never puts the query text in any serialized attribute', () => {
        // Given distinctive free text next to a filter value
        const secretFreeText = 'pineapple';
        const secretFilterValue = 'hidden.person@example.com';
        const query = `${secretFreeText} to:${secretFilterValue}`;

        // When the whole lifecycle runs
        startSearchRouterQuerySpan(query);
        markSearchRouterQueryCommitted(query, {localResultCount: 3});

        // Then no ended span exposes either piece of the query
        const serialized = JSON.stringify(mockEnded.map((span) => span.attributes)).toLowerCase();
        expect(serialized).not.toContain(secretFreeText);
        expect(serialized).not.toContain('hidden');
        expect(serialized).not.toContain('example.com');
    });
});
