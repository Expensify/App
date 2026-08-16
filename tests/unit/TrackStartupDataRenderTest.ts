import trackStartupDataRender from '@libs/telemetry/trackStartupDataRender';

import CONST from '@src/CONST';

import * as Sentry from '@sentry/react-native';

const mockSpan = {
    setAttribute: jest.fn(),
    setAttributes: jest.fn(),
    setStatus: jest.fn(),
    end: jest.fn(),
};

jest.mock('@sentry/react-native', () => ({
    startInactiveSpan: jest.fn(() => mockSpan),
    spanToJSON: () => ({data: {}}),
}));

let now = 0;
let frameQueue: FrameRequestCallback[] = [];

/** Run the next scheduled frame callback, pretending `frameMs` elapsed since the previous one. */
function tick(frameMs: number) {
    now += frameMs;
    frameQueue.shift()?.(now);
}

beforeEach(() => {
    now = 0;
    frameQueue = [];
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
        frameQueue.push(callback);
        return 0;
    });
});

afterEach(() => {
    jest.restoreAllMocks();
    mockSpan.setAttributes.mockClear();
    mockSpan.end.mockClear();
});

describe('trackStartupDataRender', () => {
    it('starts a span tagged with the command and the attempt', () => {
        trackStartupDataRender('OpenApp', 3);

        expect(jest.mocked(Sentry.startInactiveSpan)).toHaveBeenLastCalledWith(
            expect.objectContaining({
                name: CONST.TELEMETRY.SPAN_STARTUP_DATA.RENDER,
                attributes: {[CONST.TELEMETRY.ATTRIBUTE_COMMAND]: 'OpenApp', [CONST.TELEMETRY.ATTRIBUTE_ATTEMPT]: 3},
            }),
        );
    });

    it('ends the span after two consecutive frames within budget, reporting the longest frame', () => {
        trackStartupDataRender('OpenApp', 1);

        tick(100);
        tick(10);
        expect(mockSpan.end).not.toHaveBeenCalled();

        tick(10);

        expect(mockSpan.setAttributes).toHaveBeenCalledWith({
            [CONST.TELEMETRY.ATTRIBUTE_LONGEST_FRAME_MS]: 100,
            [CONST.TELEMETRY.ATTRIBUTE_TIMED_OUT]: false,
        });
        expect(mockSpan.end).toHaveBeenCalledTimes(1);
        expect(frameQueue).toHaveLength(0);
    });

    it('resets the healthy streak when a long frame lands between two short ones', () => {
        trackStartupDataRender('OpenApp', 1);

        tick(10);
        tick(100);
        tick(10);
        expect(mockSpan.end).not.toHaveBeenCalled();

        tick(10);

        expect(mockSpan.end).toHaveBeenCalledTimes(1);
    });

    it('ends the span as timed out once the wait exceeds the cap', () => {
        trackStartupDataRender('OpenApp', 1);

        tick(10_000);

        expect(mockSpan.setAttributes).toHaveBeenCalledWith({
            [CONST.TELEMETRY.ATTRIBUTE_LONGEST_FRAME_MS]: 10_000,
            [CONST.TELEMETRY.ATTRIBUTE_TIMED_OUT]: true,
        });
        expect(mockSpan.end).toHaveBeenCalledTimes(1);
    });
});
