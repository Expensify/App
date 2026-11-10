import {cancelSpan, endSpan, startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import type {Span, StartSpanOptions} from '@sentry/core';

import {AppState} from 'react-native';

type MockInactiveSpan = {
    setAttribute: jest.Mock<void, Parameters<Span['setAttribute']>>;
    setStatus: jest.Mock<void, Parameters<Span['setStatus']>>;
    end: jest.Mock<void, Parameters<Span['end']>>;
};

const mockLogBenchmarkSpanEnd = jest.fn<void, [string, number]>();
const mockIsBenchmarkSpanEnabled = jest.fn<boolean, [string]>(() => false);
const mockStartInactiveSpan = jest.fn<MockInactiveSpan, [StartSpanOptions]>(() => ({
    setAttribute: jest.fn<void, Parameters<Span['setAttribute']>>(),
    setStatus: jest.fn<void, Parameters<Span['setStatus']>>(),
    end: jest.fn<void, Parameters<Span['end']>>(),
}));

jest.mock('@libs/telemetry/logBenchmarkSpanEnd', () => ({
    __esModule: true,
    default: (spanName: string, durationMs: number) => {
        mockLogBenchmarkSpanEnd(spanName, durationMs);
    },
    isBenchmarkSpanEnabled: (spanName: string) => mockIsBenchmarkSpanEnabled(spanName),
}));

jest.mock('@sentry/react-native', () => ({
    startInactiveSpan: (options: StartSpanOptions) => mockStartInactiveSpan(options),
    spanToJSON: () => ({data: {}}),
}));

const originalDev = __DEV__;

afterEach(() => {
    // eslint-disable-next-line no-underscore-dangle -- __DEV__ is the React Native global the code under test reads
    (global as Record<string, unknown>).__DEV__ = originalDev;
    jest.restoreAllMocks();
    mockLogBenchmarkSpanEnd.mockClear();
    mockIsBenchmarkSpanEnabled.mockReset().mockReturnValue(false);
    mockStartInactiveSpan.mockClear();
});

describe('activeSpans benchmark logging', () => {
    it('logs the Sentry span name instead of its unique tracking ID', () => {
        jest.spyOn(performance, 'now').mockReturnValueOnce(100).mockReturnValueOnce(250);

        startSpan('ManualOpenReport_123', {name: 'ManualOpenReport'});
        endSpan('ManualOpenReport_123');

        expect(mockLogBenchmarkSpanEnd).toHaveBeenCalledWith('ManualOpenReport', 150);
    });

    it('starts an enabled benchmark span while iOS is still transitioning to active', () => {
        jest.spyOn(AppState, 'currentState', 'get').mockReturnValue(CONST.APP_STATE.INACTIVE);
        mockIsBenchmarkSpanEnabled.mockReturnValue(true);

        startSpan('ManualAppStartup', {name: 'ManualAppStartup'});
        endSpan('ManualAppStartup');

        expect(mockStartInactiveSpan).toHaveBeenCalledWith({name: 'ManualAppStartup', forceTransaction: true});
        expect(mockLogBenchmarkSpanEnd).toHaveBeenCalledWith('ManualAppStartup', expect.any(Number));
    });

    it('still skips a regular span while the app is inactive', () => {
        jest.spyOn(AppState, 'currentState', 'get').mockReturnValue(CONST.APP_STATE.INACTIVE);

        startSpan('ManualOpenReport', {name: 'ManualOpenReport'});

        expect(mockStartInactiveSpan).not.toHaveBeenCalled();
    });

    it('still logs the benchmark line only for spans that were not canceled when logging is off', () => {
        // Given a production build, where endSpan skips the console log and never reads the span's attributes,
        // so the canceled state has to come from the tracked entry
        // eslint-disable-next-line no-underscore-dangle -- __DEV__ is the React Native global the code under test reads
        (global as Record<string, unknown>).__DEV__ = false;
        startSpan('ManualOpenReport', {name: 'ManualOpenReport'});
        startSpan('ManualOpenSearchRouter', {name: 'ManualOpenSearchRouter'});

        // When one span ends normally and the other is canceled, as a navigation the user abandons is
        endSpan('ManualOpenReport');
        cancelSpan('ManualOpenSearchRouter');

        // Then only the ended span reaches the benchmark log, because a canceled span's duration does not measure a finished navigation
        expect(mockLogBenchmarkSpanEnd).toHaveBeenCalledTimes(1);
        expect(mockLogBenchmarkSpanEnd).toHaveBeenCalledWith('ManualOpenReport', expect.any(Number));
    });
});
