import getCurrentPosition from '@libs/getCurrentPosition';
import getCurrentPositionWithinCap from '@libs/getCurrentPosition/getCurrentPositionWithinCap';
import type {GpsCoords, LocationSource} from '@libs/getCurrentPosition/getCurrentPositionWithinCap';
import {cancelAllSpans, endSpan, startSpan} from '@libs/telemetry/activeSpans';
import markSubmitExpenseLocationSource from '@libs/telemetry/markSubmitExpenseLocationSource';

import CONST from '@src/CONST';

import type {LocationObject} from 'expo-location';

jest.mock('@libs/getCurrentPosition');

type RecordedSpan = {
    name?: string;
    attributes: Record<string, unknown>;
    setAttribute(key: string, value: unknown): void;
    setAttributes(attrs: Record<string, unknown>): void;
    setStatus(): void;
    end(): void;
};

const mockSpans: RecordedSpan[] = [];

jest.mock('@sentry/react-native', () => ({
    startInactiveSpan: (options: {name?: string}) => {
        const span: RecordedSpan = {
            name: options?.name,
            attributes: {},
            setAttribute(key: string, value: unknown) {
                this.attributes[key] = value;
            },
            setAttributes(attrs: Record<string, unknown>) {
                Object.assign(this.attributes, attrs);
            },
            setStatus() {},
            end() {},
        };
        mockSpans.push(span);
        return span;
    },
    spanToJSON: (span: RecordedSpan) => ({data: span.attributes}),
}));

type Settled = {gpsCoords?: GpsCoords; source: LocationSource};

function position(latitude: number, longitude: number): LocationObject {
    return {
        coords: {
            latitude,
            longitude,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
        },
        timestamp: 0,
    } as LocationObject;
}

function readOnce(): jest.Mock<void, [Settled]> {
    const onSettled = jest.fn<void, [Settled]>();
    getCurrentPositionWithinCap(onSettled);
    return onSettled;
}

beforeEach(() => {
    jest.useFakeTimers();
    jest.mocked(getCurrentPosition).mockReset();
});

afterEach(() => {
    jest.useRealTimers();
    cancelAllSpans();
});

describe('getCurrentPositionWithinCap', () => {
    it('settles with the device position when it answers before the cap', () => {
        // Given a location read the device answers straight away
        jest.mocked(getCurrentPosition).mockImplementation(async (success) => {
            success(position(40.7128, -74.006));
        });

        // When the submit asks for the position
        const onSettled = readOnce();

        // Then the coordinates go through and the span records that the submit waited for them
        expect(onSettled).toHaveBeenCalledTimes(1);
        expect(onSettled.mock.calls.at(0)?.at(0)).toEqual({
            gpsCoords: {lat: 40.7128, long: -74.006},
            source: CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.WAITED,
        });
    });

    it('settles without coordinates exactly at the cap when the device stays silent, and drops a position that arrives later', () => {
        // Given a location read the device never answers in time
        let lateSuccess: Parameters<typeof getCurrentPosition>[0] | undefined;
        jest.mocked(getCurrentPosition).mockImplementation(async (success) => {
            lateSuccess = success;
        });

        // When the submit asks for the position and the device stays silent up to the cap
        const onSettled = readOnce();
        jest.advanceTimersByTime(CONST.GPS.SUBMIT_WAIT_TIMEOUT - 1);
        expect(onSettled).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);

        // Then the submit is released without coordinates rather than waiting for the device
        expect(onSettled).toHaveBeenCalledTimes(1);
        expect(onSettled.mock.calls.at(0)?.at(0)).toEqual({source: CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.TIMED_OUT});

        // And when the device finally answers, nothing settles a second time
        lateSuccess?.(position(40.7128, -74.006));
        expect(onSettled).toHaveBeenCalledTimes(1);
    });

    it('settles without coordinates when the lookup fails', () => {
        // Given a location read the device refuses
        jest.mocked(getCurrentPosition).mockImplementation(async (_success, error) => {
            error({code: 1, message: 'User denied access to location.'});
        });

        // When the submit asks for the position
        const onSettled = readOnce();

        // Then the submit is released straight away without coordinates, and not as a timeout
        expect(onSettled).toHaveBeenCalledTimes(1);
        expect(onSettled.mock.calls.at(0)?.at(0)).toEqual({source: CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.NONE});
        expect(jest.getTimerCount()).toBe(0);
    });
});

describe('markSubmitExpenseLocationSource', () => {
    it('stamps which way the location went onto the open submit span', () => {
        // Given a submit span that is still open
        startSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE, {name: 'submit-expense', op: CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE});

        // When the submit attaches a cached position
        markSubmitExpenseLocationSource(CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.CACHED);

        // Then the span carries that reason, so cache hits can be counted separately from waits
        expect(mockSpans.at(-1)?.attributes[CONST.TELEMETRY.ATTRIBUTE_LOCATION_SOURCE]).toBe(CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.CACHED);
    });

    it('is quiet once the submit span has already ended', () => {
        // Given a submit span that ended before the location was known
        startSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE, {name: 'submit-expense', op: CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE});
        endSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE);

        // When a late location reason is recorded, twice, and nothing throws on the way
        expect(() => markSubmitExpenseLocationSource(CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.TIMED_OUT)).not.toThrow();

        // Then nothing is stamped onto a span that no longer exists
        expect(mockSpans.at(-1)?.attributes[CONST.TELEMETRY.ATTRIBUTE_LOCATION_SOURCE]).toBeUndefined();
    });
});
