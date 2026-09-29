import fetchFramesDelay from '@libs/telemetry/frameDrops/fetchFramesDelay';
import {flush, report, startFrameDropMonitor, stopFrameDropMonitor} from '@libs/telemetry/frameDrops/frameDropMonitor';
import {clear, recordPress, recordScreen, startOperation} from '@libs/telemetry/frameDrops/frameDropTimeline';

import CONST from '@src/CONST';

import type {AppStateStatus} from 'react-native';

import * as Sentry from '@sentry/react-native';
import {AppState} from 'react-native';

jest.mock('@libs/telemetry/frameDrops/fetchFramesDelay', () => ({
    __esModule: true,
    default: jest.fn(),
    isFramesDelayAvailable: () => true,
}));
jest.mock('@sentry/react-native', () => ({
    metrics: {count: jest.fn(), distribution: jest.fn()},
}));

const FRAME_DROPS = CONST.TELEMETRY.FRAME_DROPS;
const PRESS_LABEL = CONST.SENTRY_LABEL.BULK_ACTION_BAR.MORE;
// Date.now() - performance.now(), so timeline times map to Unix seconds as (time + offset) / 1000.
const CLOCK_OFFSET_MS = 1_000_000;

const mockFetchFramesDelay = jest.mocked(fetchFramesDelay);
const mockCount = jest.mocked(Sentry.metrics.count);
const mockDistribution = jest.mocked(Sentry.metrics.distribution);

let now = 0;
let appStateListener: ((state: AppStateStatus) => void) | undefined;
let longTaskCallback: ((list: {getEntries: () => Array<{startTime: number; duration: number}>}) => void) | undefined;

/** React Native reports long tasks through PerformanceObserver, which the Jest environment doesn't have. */
class FakePerformanceObserver {
    static supportedEntryTypes = ['longtask'];

    constructor(callback: typeof longTaskCallback) {
        longTaskCallback = callback;
    }

    observe() {}

    disconnect() {}
}

function toTimelineTime(unixSeconds: number): number {
    return unixSeconds * 1000 - CLOCK_OFFSET_MS;
}

/** Makes the mocked native store return `delays` for a query that exactly matches a [start, end) window in timeline time. */
function mockDelays(delays: Array<{start: number; end: number; delaySeconds: number | undefined}>, fallback = 0) {
    mockFetchFramesDelay.mockImplementation((startSeconds, endSeconds) => {
        const match = delays.find(({start, end}) => Math.abs(toTimelineTime(startSeconds) - start) < 1e-3 && Math.abs(toTimelineTime(endSeconds) - end) < 1e-3);
        return Promise.resolve(match ? match.delaySeconds : fallback);
    });
}

function getCountCalls(metric: string) {
    return mockCount.mock.calls.filter(([name]) => name === metric).map(([, value, options]) => ({value, attributes: options?.attributes}));
}

function sumCounts(metric: string) {
    return getCountCalls(metric).reduce((sum, {value}) => sum + (value ?? 0), 0);
}

beforeEach(() => {
    now = 0;
    appStateListener = undefined;
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    jest.spyOn(Date, 'now').mockImplementation(() => now + CLOCK_OFFSET_MS);
    jest.spyOn(AppState, 'currentState', 'get').mockReturnValue('active');
    jest.spyOn(AppState, 'addEventListener').mockImplementation((type, listener) => {
        appStateListener = listener as (state: AppStateStatus) => void;
        return {remove: jest.fn()};
    });
    mockFetchFramesDelay.mockReset();
    mockCount.mockReset();
    mockDistribution.mockReset();
    longTaskCallback = undefined;
    (globalThis as {PerformanceObserver?: unknown}).PerformanceObserver = FakePerformanceObserver;
    clear();
    startFrameDropMonitor();
});

afterEach(() => {
    stopFrameDropMonitor();
    clear();
    delete (globalThis as {PerformanceObserver?: unknown}).PerformanceObserver;
    jest.restoreAllMocks();
});

describe('frameDropMonitor', () => {
    it('reports active time with a single native query when no frame dropped', async () => {
        // Given a screen and a press during a window in which nothing dropped
        mockDelays([], 0);
        recordScreen('Home');
        now = 100;
        recordPress(PRESS_LABEL);

        // When the window is flushed and reported
        now = 5_000;
        await flush(5_000);
        report();

        // Then the native store is asked only once, for the whole window, and the press is counted without a delay sample
        expect(mockFetchFramesDelay).toHaveBeenCalledTimes(1);
        expect(getCountCalls(FRAME_DROPS.METRIC_ACTIVE_TIME)).toEqual([
            {value: 4_000, attributes: {screen: 'Home', interaction: FRAME_DROPS.NONE, operation: FRAME_DROPS.NONE}},
            {value: 1_000, attributes: {screen: 'Home', interaction: PRESS_LABEL, operation: FRAME_DROPS.NONE}},
        ]);
        expect(getCountCalls(FRAME_DROPS.METRIC_FRAME_DELAY)).toEqual([]);
        expect(mockDistribution).not.toHaveBeenCalled();
        expect(getCountCalls(FRAME_DROPS.METRIC_INTERACTION_COUNT)).toEqual([{value: 1, attributes: {screen: 'Home', interaction: PRESS_LABEL}}]);
    });

    it('attributes dropped frames to the context they happened in', async () => {
        // Given an API response being applied while frames dropped
        recordScreen('Search_Root');
        now = 1_000;
        startOperation(`${FRAME_DROPS.OPERATION_API_PREFIX}Search`);
        mockDelays([
            {start: 0, end: 5_000, delaySeconds: 0.3},
            {start: 0, end: 1_000, delaySeconds: 0.05},
        ]);

        // When the window is flushed and reported
        now = 5_000;
        await flush(5_000);
        report();

        // Then each part of the delay goes to the context that was active when the frames dropped
        expect(getCountCalls(FRAME_DROPS.METRIC_FRAME_DELAY)).toEqual([
            {value: 50, attributes: {screen: 'Search_Root', interaction: FRAME_DROPS.NONE, operation: FRAME_DROPS.NONE}},
            {value: 250, attributes: {screen: 'Search_Root', interaction: FRAME_DROPS.NONE, operation: 'api.Search'}},
        ]);
    });

    it('finds a single drop among many segments with a binary search', async () => {
        // Given four screens in one window, and frames that dropped only on the last one
        recordScreen('A');
        now = 1_000;
        recordScreen('B');
        now = 2_000;
        recordScreen('C');
        now = 3_000;
        recordScreen('D');
        mockDelays([
            {start: 0, end: 4_000, delaySeconds: 0.2},
            {start: 0, end: 2_000, delaySeconds: 0},
            {start: 2_000, end: 3_000, delaySeconds: 0},
        ]);

        // When the window is flushed and reported
        now = 4_000;
        await flush(4_000);
        report();

        // Then the whole window, the empty left half and one quarter are queried, and the rest is derived by subtraction
        expect(mockFetchFramesDelay).toHaveBeenCalledTimes(3);
        expect(getCountCalls(FRAME_DROPS.METRIC_FRAME_DELAY)).toEqual([{value: 200, attributes: {screen: 'D', interaction: FRAME_DROPS.NONE, operation: FRAME_DROPS.NONE}}]);
    });

    it('gives segments it could not resolve within the query budget to "unattributed", time and delay alike', async () => {
        // Given 20 screens of 100ms each, every one with 10ms of delay, so resolving all of them needs more queries than allowed
        for (let i = 0; i < 20; i++) {
            now = i * 100;
            recordScreen(`Screen${i}`);
        }
        mockFetchFramesDelay.mockImplementation((startSeconds, endSeconds) => Promise.resolve((toTimelineTime(endSeconds) - toTimelineTime(startSeconds)) / 10_000));

        // When the window is flushed and reported
        now = 2_000;
        await flush(2_000);
        report();

        // Then the budget holds, nothing is lost, and the unresolved part isn't credited to the screens as healthy time
        expect(mockFetchFramesDelay.mock.calls.length).toBeLessThanOrEqual(1 + FRAME_DROPS.MAX_QUERIES_PER_FLUSH);
        expect(sumCounts(FRAME_DROPS.METRIC_FRAME_DELAY)).toBe(200);
        expect(sumCounts(FRAME_DROPS.METRIC_ACTIVE_TIME)).toBe(2_000);
        const unattributed = {screen: FRAME_DROPS.UNATTRIBUTED, interaction: FRAME_DROPS.UNATTRIBUTED, operation: FRAME_DROPS.UNATTRIBUTED};
        const unattributedTime = getCountCalls(FRAME_DROPS.METRIC_ACTIVE_TIME).find(({attributes}) => attributes?.screen === FRAME_DROPS.UNATTRIBUTED);
        expect(unattributedTime?.attributes).toEqual(unattributed);
        expect(unattributedTime?.value).toBeGreaterThan(0);
    });

    it('reports the frame delay of a press that spans two flushes once its window has ended', async () => {
        // Given a press shortly before the first flush, with frames dropping after that flush
        recordScreen('Home');
        now = 4_500;
        recordPress(PRESS_LABEL);
        mockDelays([
            {start: 0, end: 5_000, delaySeconds: 0},
            {start: 5_000, end: 10_000, delaySeconds: 0.12},
            {start: 5_000, end: 5_500, delaySeconds: 0.12},
        ]);

        // When both windows are flushed
        now = 5_000;
        await flush(5_000);
        const distributionCallsAfterFirstFlush = mockDistribution.mock.calls.length;
        now = 10_000;
        await flush(10_000);

        // Then the press is reported once, after its window ended, with the delay from both windows
        expect(distributionCallsAfterFirstFlush).toBe(0);
        expect(mockDistribution).toHaveBeenCalledTimes(1);
        expect(mockDistribution).toHaveBeenCalledWith(FRAME_DROPS.METRIC_INTERACTION_FRAME_DELAY, 120, {
            unit: 'millisecond',
            attributes: {screen: 'Home', interaction: PRESS_LABEL},
        });
    });

    it('never reports a press label that is not a static Sentry label', async () => {
        // Given a press whose label was built at runtime from user data, like Switch does with its accessibility label
        mockDelays([], 0);
        recordScreen('Home');
        recordPress('Enable tag: Client ACME Corp');

        // When the window is flushed and reported
        now = 5_000;
        await flush(5_000);
        report();

        // Then the label never leaves the device; the press is still counted as a generic press
        expect(JSON.stringify(mockCount.mock.calls)).not.toContain('ACME');
        expect(getCountCalls(FRAME_DROPS.METRIC_INTERACTION_COUNT)).toEqual([{value: 1, attributes: {screen: 'Home', interaction: FRAME_DROPS.INTERACTION_UNLABELED_PRESS}}]);
    });

    it('attributes a long task to the context it overlaps most, not to the one before it', async () => {
        // Given a long task that started just before the press it was running (the press is recorded from inside the task)
        mockDelays([], 0);
        recordScreen('Home');
        now = 1_000;
        recordPress(PRESS_LABEL);

        // When the long task is observed and attributed during the flush
        now = 5_000;
        longTaskCallback?.({getEntries: () => [{startTime: 990, duration: 300}]});
        await flush(5_000);
        report();

        // Then it lands on the press rather than on the idle time before it
        expect(getCountCalls(FRAME_DROPS.METRIC_LONG_TASK_COUNT)).toEqual([{value: 1, attributes: {screen: 'Home', interaction: PRESS_LABEL, operation: FRAME_DROPS.NONE}}]);
    });

    it('still measures the last window when the app goes to the background during a flush', async () => {
        // Given a flush that is waiting for its first native answer
        recordScreen('Home');
        let resolveFirstQuery: (delaySeconds: number) => void = () => {};
        mockFetchFramesDelay.mockImplementationOnce(
            () =>
                new Promise<number>((resolve) => {
                    resolveFirstQuery = resolve;
                }),
        );
        mockFetchFramesDelay.mockResolvedValue(0);
        now = 5_000;
        const firstFlush = flush(5_000);
        while (!mockFetchFramesDelay.mock.calls.length) {
            // The flush is queued, so its first query starts a few microtasks later.
            await Promise.resolve();
        }

        // When the app goes to the background before the answer arrives
        now = 8_000;
        appStateListener?.('background');
        resolveFirstQuery(0);
        await firstFlush;
        await flush(8_000);

        // Then the window up to the moment the app left is queried too, and everything is reported once
        expect(mockFetchFramesDelay).toHaveBeenCalledTimes(2);
        expect(sumCounts(FRAME_DROPS.METRIC_ACTIVE_TIME)).toBe(8_000);
    });

    it('turns itself off when native frame tracking never answers', async () => {
        // Given a native store that can't answer, e.g. native Sentry isn't initialized in a development build
        mockFetchFramesDelay.mockResolvedValue(undefined);
        recordScreen('Home');

        // When it stays unanswered for the allowed number of flushes
        for (let i = 1; i <= FRAME_DROPS.MAX_UNMEASURED_FLUSHES; i++) {
            now = i * 30_000;
            await flush(now);
        }
        report();
        mockFetchFramesDelay.mockClear();
        now += 30_000;
        recordPress(PRESS_LABEL);
        await flush(now);

        // Then nothing unmeasured is reported and the monitor stops recording and querying
        expect(mockCount).not.toHaveBeenCalled();
        expect(mockFetchFramesDelay).not.toHaveBeenCalled();
    });
});
