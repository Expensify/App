import {endSpan, startSpan} from '@libs/telemetry/activeSpans';

const mockLogBenchmarkSpanEnd = jest.fn();

jest.mock('@libs/telemetry/logBenchmarkSpanEnd', () => ({
    __esModule: true,
    default: (...args: unknown[]) => {
        mockLogBenchmarkSpanEnd(...args);
    },
}));

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
    mockLogBenchmarkSpanEnd.mockClear();
});

describe('activeSpans benchmark logging', () => {
    it('logs the Sentry span name instead of its unique tracking ID', () => {
        jest.spyOn(performance, 'now').mockReturnValueOnce(100).mockReturnValueOnce(250);

        startSpan('ManualOpenReport_123', {name: 'ManualOpenReport'});
        endSpan('ManualOpenReport_123');

        expect(mockLogBenchmarkSpanEnd).toHaveBeenCalledWith('ManualOpenReport', 150);
    });
});
