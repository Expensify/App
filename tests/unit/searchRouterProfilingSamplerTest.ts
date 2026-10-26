import searchRouterProfilingSampler from '@libs/telemetry/integrations/searchRouterProfilingSampler';

import CONST from '@src/CONST';

import type {Client} from '@sentry/core';

type FakeSpan = {
    op: string;
    isRoot: boolean;
    setAttribute: jest.Mock;
};

const mockGetSpan = jest.fn<FakeSpan | undefined, [string]>();

jest.mock('@libs/telemetry/activeSpans', () => ({
    getSpan: (spanId: string) => mockGetSpan(spanId),
}));
jest.mock('@sentry/core', () => ({
    getRootSpan: (span: FakeSpan) => (span.isRoot ? span : undefined),
    spanToJSON: (span: FakeSpan) => ({op: span.op}),
}));

function createSpan(op: string, isRoot = true): FakeSpan {
    return {op, isRoot, setAttribute: jest.fn()};
}

function setUpSampler() {
    const options: {profilesSampleRate?: number} = {};
    const listeners: Record<string, (span: FakeSpan) => void> = {};
    const client = {
        getOptions: () => options,
        on: (hook: string, callback: (span: FakeSpan) => void) => {
            listeners[hook] = callback;
        },
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: the sampler touches just `on` and `getOptions`
    searchRouterProfilingSampler().setup?.(client as unknown as Client);
    return {options, startSpan: (span: FakeSpan) => listeners.spanStart?.(span), endSpan: (span: FakeSpan) => listeners.spanEnd?.(span)};
}

describe('searchRouterProfilingSampler', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        mockGetSpan.mockReset();
    });

    it('profiles the navigation span started while the Search Router open span is active', () => {
        // Given an open Search Router span and a winning sample roll
        const openSpan = createSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER);
        mockGetSpan.mockImplementation((spanId) => (spanId === CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER ? openSpan : undefined));
        jest.spyOn(Math, 'random').mockReturnValue(0);
        const {options, startSpan} = setUpSampler();

        // When the router's navigation span starts
        startSpan(createSpan('navigation'));

        // Then the Hermes profiler samples it, and the open is marked as profiled so overhead can be split out
        expect(options.profilesSampleRate).toBe(1);
        expect(openSpan.setAttribute).toHaveBeenCalledWith(CONST.TELEMETRY.ATTRIBUTE_PROFILED, true);
    });

    it('marks the open as not profiled when the sample roll loses', () => {
        // Given an open Search Router span and a losing sample roll
        const openSpan = createSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER);
        mockGetSpan.mockReturnValue(openSpan);
        jest.spyOn(Math, 'random').mockReturnValue(0.999);
        const {options, startSpan} = setUpSampler();

        // When the router's navigation span starts
        startSpan(createSpan('navigation'));

        // Then nothing is profiled, but the open still carries the attribute, so it lands in the control group
        expect(options.profilesSampleRate).toBe(0);
        expect(openSpan.setAttribute).toHaveBeenCalledWith(CONST.TELEMETRY.ATTRIBUTE_PROFILED, false);
    });

    it('does not profile navigations outside a Search Router open', () => {
        // Given no Search Router open span
        mockGetSpan.mockReturnValue(undefined);
        jest.spyOn(Math, 'random').mockReturnValue(0);
        const {options, startSpan} = setUpSampler();

        // When an unrelated navigation span starts
        startSpan(createSpan('navigation'));

        // Then the profiler stays off, so other screens never pay for it
        expect(options.profilesSampleRate).toBe(0);
    });

    it('resets the rate on the next root span so a profiled navigation does not leak into later spans', () => {
        // Given a profiled navigation span for the open
        mockGetSpan.mockReturnValue(createSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER));
        jest.spyOn(Math, 'random').mockReturnValue(0);
        const {options, startSpan} = setUpSampler();
        startSpan(createSpan('navigation'));

        // When any other root span starts afterwards
        startSpan(createSpan(CONST.TELEMETRY.SPAN_OPEN_REPORT));

        // Then the profiler does not sample it
        expect(options.profilesSampleRate).toBe(0);
    });

    it('rolls only once per open, so a second navigation during the same open is not profiled', () => {
        // Given an open that already had its navigation sampled
        const openSpan = createSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER);
        mockGetSpan.mockReturnValue(openSpan);
        jest.spyOn(Math, 'random').mockReturnValue(0);
        const {options, startSpan} = setUpSampler();
        startSpan(createSpan('navigation'));

        // When another navigation starts before the open ends
        startSpan(createSpan('navigation'));

        // Then it is not profiled and the open keeps a single attribute value
        expect(options.profilesSampleRate).toBe(0);
        expect(openSpan.setAttribute).toHaveBeenCalledTimes(1);
    });

    it('marks the next root span as profiled when it starts while the profile still runs', () => {
        // Given a profiled navigation span for the open that has not ended yet
        mockGetSpan.mockReturnValue(createSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER));
        jest.spyOn(Math, 'random').mockReturnValue(0);
        const {startSpan} = setUpSampler();
        startSpan(createSpan('navigation'));

        // When the first query span starts, as it does when the user types right after the open
        const querySpan = createSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY);
        startSpan(querySpan);

        // Then it is marked as profiled, because the profiler stops synchronously inside it
        expect(querySpan.setAttribute).toHaveBeenCalledWith(CONST.TELEMETRY.ATTRIBUTE_PROFILED, true);

        // And only that root pays the stop, so the one after it stays unmarked
        const laterSpan = createSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY);
        startSpan(laterSpan);
        expect(laterSpan.setAttribute).not.toHaveBeenCalled();
    });

    it('does not mark root spans that start after the profiled span ended', () => {
        // Given a profiled navigation span for the open that has already ended, which stops the profile
        mockGetSpan.mockReturnValue(createSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER));
        jest.spyOn(Math, 'random').mockReturnValue(0);
        const {startSpan, endSpan} = setUpSampler();
        const navigationSpan = createSpan('navigation');
        startSpan(navigationSpan);
        endSpan(navigationSpan);

        // When a query span starts afterwards
        const querySpan = createSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY);
        startSpan(querySpan);

        // Then it is not marked, since no profiler work happens inside it
        expect(querySpan.setAttribute).not.toHaveBeenCalled();
    });

    it('does not mark the next root span when the open was not profiled', () => {
        // Given a navigation span for the open with a losing sample roll
        mockGetSpan.mockReturnValue(createSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER));
        jest.spyOn(Math, 'random').mockReturnValue(0.999);
        const {startSpan} = setUpSampler();
        startSpan(createSpan('navigation'));

        // When a query span starts while that navigation span is still open
        const querySpan = createSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY);
        startSpan(querySpan);

        // Then it is not marked, since no profile is running
        expect(querySpan.setAttribute).not.toHaveBeenCalled();
    });

    it('ignores child spans, which the profiler never samples', () => {
        // Given a profiled navigation span for the open
        mockGetSpan.mockReturnValue(createSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER));
        jest.spyOn(Math, 'random').mockReturnValue(0);
        const {options, startSpan} = setUpSampler();
        startSpan(createSpan('navigation'));

        // When a child span starts inside it
        startSpan(createSpan('ui.load.initial_display', false));

        // Then the rate is left alone, since only root starts reach the profiler's decision
        expect(options.profilesSampleRate).toBe(1);
    });
});
