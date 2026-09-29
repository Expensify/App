import fetchFramesDelay from '@libs/telemetry/frameDrops/fetchFramesDelay';
import {flush, report, startFrameDropMonitor, stopFrameDropMonitor} from '@libs/telemetry/frameDrops/frameDropMonitor';
import {clear, recordPress, recordScreen, startOperation} from '@libs/telemetry/frameDrops/frameDropTimeline';

import CONST from '@src/CONST';

import * as Sentry from '@sentry/react-native';
import {AppState} from 'react-native';

jest.mock('@libs/telemetry/frameDrops/fetchFramesDelay', () => ({
    __esModule: true,
    default: jest.fn(),
}));
jest.mock('@sentry/react-native', () => ({
    metrics: {count: jest.fn(), distribution: jest.fn()},
}));

const FRAME_DROPS = CONST.TELEMETRY.FRAME_DROPS;
// Date.now() - performance.now(), so timeline times map to Unix seconds as (time + offset) / 1000.
const CLOCK_OFFSET_MS = 1_000_000;

const mockFetchFramesDelay = jest.mocked(fetchFramesDelay);
const mockCount = jest.mocked(Sentry.metrics.count);
const mockDistribution = jest.mocked(Sentry.metrics.distribution);

let now = 0;

/** Makes the mocked native store return `delays` for a query that exactly matches a [start, end) window in timeline time. */
function mockDelays(delays: Array<{start: number; end: number; delaySeconds: number | undefined}>, fallback = 0) {
    mockFetchFramesDelay.mockImplementation((startSeconds, endSeconds) => {
        const match = delays.find(({start, end}) => Math.abs((start + CLOCK_OFFSET_MS) / 1000 - startSeconds) < 1e-6 && Math.abs((end + CLOCK_OFFSET_MS) / 1000 - endSeconds) < 1e-6);
        return Promise.resolve(match ? match.delaySeconds : fallback);
    });
}

function getCountCalls(metric: string) {
    return mockCount.mock.calls.filter(([name]) => name === metric).map(([, value, options]) => ({value, attributes: options?.attributes}));
}

beforeEach(() => {
    now = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    jest.spyOn(Date, 'now').mockImplementation(() => now + CLOCK_OFFSET_MS);
    jest.spyOn(AppState, 'currentState', 'get').mockReturnValue('active');
    mockFetchFramesDelay.mockReset();
    mockCount.mockReset();
    mockDistribution.mockReset();
    clear();
    startFrameDropMonitor();
});

afterEach(() => {
    stopFrameDropMonitor();
    clear();
    jest.restoreAllMocks();
});

describe('frameDropMonitor', () => {
    it('reports active time with a single native query when no frame dropped', async () => {
        // Given a screen and a press during a window in which nothing dropped
        mockDelays([], 0);
        recordScreen('Home');
        now = 100;
        recordPress('FAB');

        // When the window is flushed and reported
        now = 5_000;
        await flush(5_000);
        report();

        // Then the native store is asked only once, for the whole window, and the press needs no query of its own
        expect(mockFetchFramesDelay).toHaveBeenCalledTimes(1);
        expect(getCountCalls(FRAME_DROPS.METRIC_ACTIVE_TIME)).toEqual([
            {value: 4_000, attributes: {screen: 'Home', interaction: FRAME_DROPS.NONE, operation: FRAME_DROPS.NONE}},
            {value: 1_000, attributes: {screen: 'Home', interaction: 'FAB', operation: FRAME_DROPS.NONE}},
        ]);
        expect(getCountCalls(FRAME_DROPS.METRIC_FRAME_DELAY)).toEqual([]);
        expect(mockDistribution).toHaveBeenCalledWith(FRAME_DROPS.METRIC_INTERACTION_FRAME_DELAY, 0, {
            unit: 'millisecond',
            attributes: {screen: 'Home', interaction: 'FAB'},
        });
    });

    it('attributes dropped frames to the context they happened in', async () => {
        // Given an API response being applied while frames dropped
        recordScreen('Search_Root');
        now = 1_000;
        startOperation(`${FRAME_DROPS.OPERATION_API_PREFIX}Search`);
        mockDelays([
            {start: 0, end: 5_000, delaySeconds: 0.3},
            {start: 0, end: 1_000, delaySeconds: 0.05},
            {start: 1_000, end: 5_000, delaySeconds: 0.25},
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

    it('reports the frame delay of a press that spans two flushes once its window has ended', async () => {
        // Given a press shortly before the first flush, with frames dropping after that flush
        recordScreen('Home');
        now = 4_500;
        recordPress('FAB');
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
            attributes: {screen: 'Home', interaction: 'FAB'},
        });
    });

    it('does not count time the native store could not measure', async () => {
        // Given a native store that can't answer, e.g. frame tracking is not running
        mockFetchFramesDelay.mockResolvedValue(undefined);
        recordScreen('Home');

        // When the window is flushed and reported
        now = 5_000;
        await flush(5_000);
        report();

        // Then nothing is reported, so unmeasured time can't dilute the delay per active second
        expect(mockCount).not.toHaveBeenCalled();
    });

    it('does not record anything when the monitor is not running', async () => {
        // Given a stopped monitor
        stopFrameDropMonitor();
        mockDelays([], 0);

        // When the app navigates and the user presses something
        recordScreen('Home');
        recordPress('FAB');

        // Then there is nothing to flush
        now = 5_000;
        await flush(5_000);
        expect(mockFetchFramesDelay).not.toHaveBeenCalled();
    });
});
