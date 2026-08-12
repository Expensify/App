import {endSpan, startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import {AppState} from 'react-native';

const mockLogBenchmarkSpanEnd = jest.fn();
const mockIsBenchmarkSpanEnabled = jest.fn<boolean, [string]>(() => false);
const mockStartInactiveSpan = jest.fn<
    {
        setAttribute: jest.Mock;
        setStatus: jest.Mock;
        end: jest.Mock;
    },
    [unknown]
>(() => ({
    setAttribute: jest.fn(),
    setStatus: jest.fn(),
    end: jest.fn(),
}));

jest.mock('@libs/telemetry/logBenchmarkSpanEnd', () => ({
    __esModule: true,
    default: (...args: unknown[]) => {
        mockLogBenchmarkSpanEnd(...args);
    },
    isBenchmarkSpanEnabled: (spanName: string) => mockIsBenchmarkSpanEnabled(spanName),
}));

jest.mock('@sentry/react-native', () => ({
    startInactiveSpan: (options: unknown) => mockStartInactiveSpan(options),
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
