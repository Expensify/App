import {cancelAllSpans, getSpan} from '@libs/telemetry/activeSpans';
import {
    beginSearchRouterQuerySession,
    cancelSearchRouterQuerySpan,
    endSearchRouterQuerySession,
    getSearchRouterQueryLengthBucket,
    markSearchRouterQueryCommitted,
    measureSearchRouterQueryPhase,
    startSearchRouterQuerySpan,
} from '@libs/telemetry/searchRouterQuerySpans';

import CONST from '@src/CONST';

type FakeSpan = {
    op?: string;
    parentSpan?: FakeSpan;
    attributes: Record<string, unknown>;
    setAttribute: (key: string, value: unknown) => void;
    setAttributes: (attrs: Record<string, unknown>) => void;
    setStatus: () => void;
    end: () => void;
};

const mockEnded: FakeSpan[] = [];

jest.mock('@sentry/react-native', () => ({
    startInactiveSpan: (options: {op?: string; parentSpan?: FakeSpan; attributes?: Record<string, unknown>}): FakeSpan => ({
        op: options.op,
        parentSpan: options.parentSpan,
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
    }),
    spanToJSON: (span: FakeSpan) => ({data: span.attributes}),
}));

const ROOT = CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY;
const {OPTION_LIST, FILTER} = CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY_PHASE;
const CANCEL_REASON = CONST.TELEMETRY.SEARCH_ROUTER_QUERY_CANCEL_REASON;

function getRootAttributes() {
    const root = mockEnded.find((span) => span.op === ROOT);
    return root?.attributes;
}

describe('searchRouterQuerySpans', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockEnded.length = 0;
        beginSearchRouterQuerySession();
    });

    afterEach(() => {
        endSearchRouterQuerySession();
        cancelAllSpans();
        jest.useRealTimers();
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
        markSearchRouterQueryCommitted('abc', {resultCount: 7});

        // Then the span ends with the result count and the default legacy path
        expect(getSpan(ROOT)).toBeUndefined();
        const attributes = getRootAttributes();
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_RESULT_COUNT]).toBe(7);
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_SEARCH_PATH]).toBe(CONST.TELEMETRY.SEARCH_ROUTER_SEARCH_PATH.LEGACY);
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_OPTION_LIST_REBUILT]).toBe(false);
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_QUERY_ORDINAL]).toBe(1);
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

    it('cancels a span that outlives the max duration as timed_out', () => {
        // Given an active span that never commits
        startSearchRouterQuerySpan('abc');

        // When the max duration passes
        jest.advanceTimersByTime(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_MAX_DURATION_MS);

        // Then it is cancelled as timed_out
        expect(getSpan(ROOT)).toBeUndefined();
        expect(mockEnded.at(0)?.attributes[CONST.TELEMETRY.ATTRIBUTE_CANCEL_REASON]).toBe(CANCEL_REASON.TIMED_OUT);
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

    it('only runs the callback for a child phase without an active root span', () => {
        // Given no active root span
        const run = jest.fn(() => 'result');

        // When a phase is measured
        const result = measureSearchRouterQueryPhase(FILTER, undefined, run);

        // Then the callback runs and no span is created, so Sentry cannot attach it to an unrelated active span
        expect(result).toBe('result');
        expect(run).toHaveBeenCalledTimes(1);
        expect(mockEnded).toHaveLength(0);
    });

    it('ends child spans before the root and records the rebuild flag', () => {
        // Given an active root span
        startSearchRouterQuerySpan('abc');

        // When both phases run and the query commits
        measureSearchRouterQueryPhase(OPTION_LIST, undefined, () => undefined);
        measureSearchRouterQueryPhase(FILTER, {filterSource: CONST.TELEMETRY.SEARCH_ROUTER_QUERY_FILTER_SOURCE.LOCAL}, () => undefined);
        markSearchRouterQueryCommitted('abc');

        // Then children end first, with the root as parent, and the root records the rebuild
        expect(mockEnded.map((span) => span.op)).toEqual([OPTION_LIST, FILTER, ROOT]);
        expect(mockEnded.at(1)?.attributes[CONST.TELEMETRY.ATTRIBUTE_FILTER_SOURCE]).toBe(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_FILTER_SOURCE.LOCAL);
        expect(mockEnded.at(0)?.parentSpan).toBe(mockEnded.at(2));
        expect(mockEnded.at(2)?.attributes[CONST.TELEMETRY.ATTRIBUTE_OPTION_LIST_REBUILT]).toBe(true);
    });

    it('ends the child span even when the callback throws', () => {
        // Given an active root span
        startSearchRouterQuerySpan('abc');

        // When the measured callback throws
        expect(() =>
            measureSearchRouterQueryPhase(FILTER, undefined, () => {
                throw new Error('boom');
            }),
        ).toThrow('boom');

        // Then the child span was still ended
        expect(mockEnded.map((span) => span.op)).toEqual([FILTER]);
    });

    it('derives filter attributes from the parsed query', () => {
        // Given a query with a filter being autocompleted
        startSearchRouterQuerySpan('to:jo');
        markSearchRouterQueryCommitted('to:jo');

        // Then the shape is recorded and the free-text part is empty
        const attributes = getRootAttributes();
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_HAS_FILTER]).toBe(true);
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_AUTOCOMPLETE_KEY]).toBe(CONST.SEARCH.SYNTAX_FILTER_KEYS.TO);
        expect(attributes?.[CONST.TELEMETRY.ATTRIBUTE_QUERY_LENGTH_BUCKET]).toBe(CONST.TELEMETRY.SEARCH_ROUTER_QUERY_LENGTH_BUCKET.EMPTY);
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

    it('never puts the query text in any serialized attribute', () => {
        // Given distinctive free text next to a filter value
        const secretFreeText = 'pineapple';
        const secretFilterValue = 'hidden.person@example.com';
        const query = `${secretFreeText} to:${secretFilterValue}`;

        // When the whole lifecycle runs
        startSearchRouterQuerySpan(query);
        measureSearchRouterQueryPhase(FILTER, {filterSource: CONST.TELEMETRY.SEARCH_ROUTER_QUERY_FILTER_SOURCE.AUTOCOMPLETE}, () => undefined);
        markSearchRouterQueryCommitted(query, {resultCount: 3});

        // Then no ended span exposes either piece of the query
        const serialized = JSON.stringify(mockEnded.map((span) => span.attributes)).toLowerCase();
        expect(serialized).not.toContain(secretFreeText);
        expect(serialized).not.toContain('hidden');
        expect(serialized).not.toContain('example.com');
    });
});
