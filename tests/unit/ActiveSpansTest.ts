import {endSpan, startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

jest.mock('@sentry/react-native', () => ({
    startInactiveSpan: () => ({
        setAttribute: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
    }),
    spanToJSON: () => ({data: {}}),
}));

afterEach(() => {
    jest.restoreAllMocks();
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
});
