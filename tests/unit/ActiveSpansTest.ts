import {endSpan, getSpan, getSpanByPrefix, startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import type {Span, StartSpanOptions} from '@sentry/core';

type MockInactiveSpan = {
    setAttribute: jest.Mock<void, Parameters<Span['setAttribute']>>;
    setStatus: jest.Mock<void, Parameters<Span['setStatus']>>;
    end: jest.Mock<void, Parameters<Span['end']>>;
};

const mockStartInactiveSpan = jest.fn<MockInactiveSpan, [StartSpanOptions]>(() => ({
    setAttribute: jest.fn<void, Parameters<Span['setAttribute']>>(),
    setStatus: jest.fn<void, Parameters<Span['setStatus']>>(),
    end: jest.fn<void, Parameters<Span['end']>>(),
}));

jest.mock('@libs/telemetry/logBenchmarkSpanEnd', () => ({
    __esModule: true,
    default: jest.fn(),
    isBenchmarkSpanEnabled: () => false,
}));
jest.mock('@sentry/react-native', () => ({
    startInactiveSpan: (options: StartSpanOptions) => mockStartInactiveSpan(options),
    spanToJSON: () => ({data: {}}),
}));

afterEach(() => {
    jest.restoreAllMocks();
    mockStartInactiveSpan.mockClear();
});

describe('activeSpans', () => {
    it('calculates the duration from an epoch start time using the monotonic clock', () => {
        const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_786_362_201_500);
        const performanceNowSpy = jest.spyOn(performance, 'now').mockReturnValue(10_000);
        const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});

        startSpan(CONST.TELEMETRY.SPAN_APP_STARTUP_NETWORK_REQUEST, {
            name: CONST.TELEMETRY.SPAN_APP_STARTUP_NETWORK_REQUEST,
            startTime: 1_786_362_201_000,
        });

        dateNowSpy.mockReturnValue(1_786_362_201_750);
        performanceNowSpy.mockReturnValue(10_250);
        endSpan(CONST.TELEMETRY.SPAN_APP_STARTUP_NETWORK_REQUEST);

        expect(consoleDebugSpy).toHaveBeenLastCalledWith(expect.stringContaining('Ending span (750ms)'), expect.objectContaining({durationMs: 750, timestamp: 1_786_362_201_750}));
    });
    describe('span parenting', () => {
        beforeEach(() => {
            jest.spyOn(console, 'debug').mockImplementation(() => {});
        });

        it('forces a span with no declared parent into its own transaction', () => {
            // Given options from a caller that names no parent, which is how almost every span in the app is started
            const options = {name: 'RootedSpan'};

            // When the span is started
            startSpan('RootedSpan', options);

            // Then it is forced into its own transaction, because a child can be ended by whatever span sits on the scope
            expect(mockStartInactiveSpan).toHaveBeenCalledWith(expect.objectContaining({name: 'RootedSpan', forceTransaction: true}));

            endSpan('RootedSpan');
        });

        it('keeps a parent the caller declared', () => {
            // Given another tracked span used as a parent, the way the send-message phases nest under the visible span
            startSpan('ParentSpan', {name: 'ParentSpan'});
            const parentSpan = getSpan('ParentSpan');

            // When the span is started
            startSpan('NestedSpan', {name: 'NestedSpan', parentSpan});

            // Then it stays a child of that parent, so deliberate nesting is not broken
            expect(mockStartInactiveSpan).toHaveBeenCalledWith(expect.objectContaining({name: 'NestedSpan', parentSpan, forceTransaction: false}));

            endSpan('NestedSpan');
            endSpan('ParentSpan');
        });

        it('keeps a caller that opts back into the span on the scope', () => {
            // Given a caller that passes forceTransaction: false, as the Onyx derived recomputes do because they are short and want whatever transaction is open
            const options = {name: 'InheritingSpan', forceTransaction: false};

            // When the span is started
            startSpan('InheritingSpan', options);

            // Then the caller's choice wins over the no-parent default, so the span is left as a child
            expect(mockStartInactiveSpan).toHaveBeenCalledWith({name: 'InheritingSpan', forceTransaction: false});

            endSpan('InheritingSpan');
        });
    });
    describe('getSpanByPrefix', () => {
        const prefix = CONST.TELEMETRY.SPAN_STARTUP_DATA.APPLY;

        beforeEach(() => {
            jest.spyOn(console, 'debug').mockImplementation(() => {});
        });

        it('returns nothing when no span id matches', () => {
            const span = startSpan('SomethingElse', {name: 'SomethingElse'});

            expect(getSpanByPrefix(prefix)).toBeUndefined();

            endSpan('SomethingElse');
            expect(span).toBeDefined();
        });

        it('finds a span stored under a suffixed id', () => {
            const span = startSpan(`${prefix}_1`, {name: prefix});

            expect(getSpanByPrefix(prefix)).toBe(span);

            endSpan(`${prefix}_1`);
            expect(getSpanByPrefix(prefix)).toBeUndefined();
        });

        it('returns the earliest attempt when several are active', () => {
            const firstAttempt = startSpan(`${prefix}_1`, {name: prefix});
            startSpan(`${prefix}_2`, {name: prefix});

            expect(getSpanByPrefix(prefix)).toBe(firstAttempt);

            endSpan(`${prefix}_1`);
            endSpan(`${prefix}_2`);
        });
    });
});
