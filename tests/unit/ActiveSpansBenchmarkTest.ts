import {endSpan, startSpan} from '@libs/telemetry/activeSpans';

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

afterEach(() => {
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

        expect(mockStartInactiveSpan).toHaveBeenCalledWith({name: 'ManualAppStartup'});
        expect(mockLogBenchmarkSpanEnd).toHaveBeenCalledWith('ManualAppStartup', expect.any(Number));
    });

    it('still skips a regular span while the app is inactive', () => {
        jest.spyOn(AppState, 'currentState', 'get').mockReturnValue(CONST.APP_STATE.INACTIVE);

        startSpan('ManualOpenReport', {name: 'ManualOpenReport'});

        expect(mockStartInactiveSpan).not.toHaveBeenCalled();
    });
});
