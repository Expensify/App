import getCurrentPosition from '@libs/getCurrentPosition';
import getCurrentPositionWithinCap from '@libs/getCurrentPosition/getCurrentPositionWithinCap';

import CONST from '@src/CONST';

import type {LocationObject} from 'expo-location';
import type {ValueOf} from 'type-fest';

jest.mock('@libs/getCurrentPosition');

type LocationSource = ValueOf<typeof CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE>;

const LATE_POSITION = {
    coords: {
        latitude: 40.7128,
        longitude: -74.006,
        altitude: null,
        accuracy: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
    },
    timestamp: 0,
} as LocationObject;

describe('getCurrentPositionWithinCap', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.mocked(getCurrentPosition).mockReset();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('settles without coordinates exactly at the cap when the device stays silent, and drops a position that arrives later', () => {
        // Given a location read the device never answers in time
        let lateSuccess: Parameters<typeof getCurrentPosition>[0] | undefined;
        jest.mocked(getCurrentPosition).mockImplementation(async (success) => {
            lateSuccess = success;
        });
        const onSettled = jest.fn<void, [{lat: number; long: number} | undefined, LocationSource]>();

        // When the submit asks for the position and the device stays silent up to the cap
        getCurrentPositionWithinCap(onSettled);
        jest.advanceTimersByTime(CONST.GPS.SUBMIT_WAIT_TIMEOUT - 1);
        expect(onSettled).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);

        // Then the submit is released without coordinates rather than waiting for the device
        expect(onSettled).toHaveBeenCalledTimes(1);
        expect(onSettled).toHaveBeenCalledWith(undefined, CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.TIMED_OUT);

        // And when the device finally answers, nothing settles a second time
        lateSuccess?.(LATE_POSITION);
        expect(onSettled).toHaveBeenCalledTimes(1);
    });
});
