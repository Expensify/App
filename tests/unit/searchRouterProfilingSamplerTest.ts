import searchRouterProfileSampleRate from '@libs/telemetry/integrations/searchRouterProfileSampleRate';
import defaultSearchRouterProfileSampleRate from '@libs/telemetry/integrations/searchRouterProfileSampleRate/index';
import androidSearchRouterProfileSampleRate from '@libs/telemetry/integrations/searchRouterProfileSampleRate/index.android';
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

function mockActiveSpans(spans: Record<string, FakeSpan>) {
    mockGetSpan.mockImplementation((spanId) => spans[spanId]);
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
        // Given open Search Router and page-visible spans and a winning sample roll
        const openSpan = createSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER);
        const pageVisibleSpan = createSpan(CONST.TELEMETRY.SPAN_SEARCH_PAGE_VISIBLE);
        mockActiveSpans({[CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER]: openSpan, [CONST.TELEMETRY.SPAN_SEARCH_PAGE_VISIBLE]: pageVisibleSpan});
        jest.spyOn(Math, 'random').mockReturnValue(0);
        const {options, startSpan} = setUpSampler();

        // When the router's navigation span starts
        startSpan(createSpan('navigation'));

        // Then the Hermes profiler samples it, and both spans of the open are marked as profiled, since each is a
        // separate root the profiler runs inside, so overhead can be split out of both metrics
        expect(options.profilesSampleRate).toBe(1);
        expect(openSpan.setAttribute).toHaveBeenCalledWith(CONST.TELEMETRY.ATTRIBUTE_PROFILED, true);
        expect(pageVisibleSpan.setAttribute).toHaveBeenCalledWith(CONST.TELEMETRY.ATTRIBUTE_PROFILED, true);
    });

    it('marks the open as not profiled when the sample roll loses', () => {
        // Given open Search Router and page-visible spans and a losing sample roll
        const openSpan = createSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER);
        const pageVisibleSpan = createSpan(CONST.TELEMETRY.SPAN_SEARCH_PAGE_VISIBLE);
        mockActiveSpans({[CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER]: openSpan, [CONST.TELEMETRY.SPAN_SEARCH_PAGE_VISIBLE]: pageVisibleSpan});
        jest.spyOn(Math, 'random').mockReturnValue(0.999);
        const {options, startSpan} = setUpSampler();

        // When the router's navigation span starts
        startSpan(createSpan('navigation'));

        // Then nothing is profiled, but both spans still carry the attribute, so they land in the control group
        expect(options.profilesSampleRate).toBe(0);
        expect(openSpan.setAttribute).toHaveBeenCalledWith(CONST.TELEMETRY.ATTRIBUTE_PROFILED, false);
        expect(pageVisibleSpan.setAttribute).toHaveBeenCalledWith(CONST.TELEMETRY.ATTRIBUTE_PROFILED, false);
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
        mockActiveSpans({[CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER]: openSpan});
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

    it('does not mark the next root span once the SDK has stopped the profile on its 30 s limit', () => {
        // Given a profiled navigation span for the open that is still running 30 s later
        mockGetSpan.mockReturnValue(createSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER));
        jest.spyOn(Math, 'random').mockReturnValue(0);
        const now = jest.spyOn(Date, 'now').mockReturnValue(1_000);
        const {startSpan} = setUpSampler();
        startSpan(createSpan('navigation'));
        now.mockReturnValue(31_000);

        // When a query span starts
        const querySpan = createSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_QUERY);
        startSpan(querySpan);

        // Then it is not marked, since the SDK's own timeout already stopped the profile and no stop runs inside it
        expect(querySpan.setAttribute).not.toHaveBeenCalled();
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

    it('profiles an open only when its roll falls under the platform sample rate', () => {
        // Given an open Search Router span and a roll just under the sample rate of the platform the tests run on
        const openSpan = createSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER);
        mockActiveSpans({[CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER]: openSpan});
        const random = jest.spyOn(Math, 'random').mockReturnValue(searchRouterProfileSampleRate - 0.001);
        const {options, startSpan} = setUpSampler();

        // When the router's navigation span starts
        startSpan(createSpan('navigation'));

        // Then the open is profiled
        expect(options.profilesSampleRate).toBe(1);

        // When the next open rolls exactly the sample rate
        const nextOpenSpan = createSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER);
        mockActiveSpans({[CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER]: nextOpenSpan});
        random.mockReturnValue(searchRouterProfileSampleRate);
        startSpan(createSpan('navigation'));

        // Then it is not profiled, so the share of profiled opens matches the rate
        expect(options.profilesSampleRate).toBe(0);
        expect(nextOpenSpan.setAttribute).toHaveBeenCalledWith(CONST.TELEMETRY.ATTRIBUTE_PROFILED, false);
    });

    it('samples Android opens at 20% and other native platforms at 5%', () => {
        // Given the per-platform sample rate files, where Android carries the metric's tail and so gets the higher rate
        // When they are read
        // Then each keeps its rate, so a change to either one is a deliberate change to the profile quota
        expect(androidSearchRouterProfileSampleRate).toBe(0.2);
        expect(defaultSearchRouterProfileSampleRate).toBe(0.05);
    });
});
