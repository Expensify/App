import Log from '@libs/Log';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import getCurrentPosition from '.';

type GpsCoords = {lat: number; long: number};

type LocationSource = ValueOf<typeof CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE>;

type SettledLocation = {
    gpsCoords?: GpsCoords;
    source: LocationSource;
};

/**
 * Reads the device position once, and settles the callback exactly once within `CONST.GPS.SUBMIT_WAIT_TIMEOUT`.
 *
 * expo-location has no timeout option on any platform, so a device that never answers would hold a submit open
 * indefinitely. When the cap expires first the callback settles with no coordinates and `timed_out`, and the position
 * the device eventually returns is dropped rather than replayed into an already-created expense.
 *
 * @param onSettled runs once, with coordinates only when the device answered inside the cap
 */
function getCurrentPositionWithinCap(onSettled: (settled: SettledLocation) => void) {
    let settled = false;

    const settleOnce = (settledLocation: SettledLocation) => {
        if (settled) {
            return;
        }
        settled = true;
        onSettled(settledLocation);
    };

    const timeoutId = setTimeout(() => {
        settleOnce({source: CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.TIMED_OUT});
    }, CONST.GPS.SUBMIT_WAIT_TIMEOUT);

    getCurrentPosition(
        (position) => {
            clearTimeout(timeoutId);
            settleOnce({
                gpsCoords: {lat: position.coords.latitude, long: position.coords.longitude},
                source: CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.WAITED,
            });
        },
        (error) => {
            clearTimeout(timeoutId);
            Log.info('[getCurrentPositionWithinCap] getCurrentPosition failed', false, error);
            settleOnce({source: CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.NONE});
        },
    );
}

export type {GpsCoords, LocationSource};

export default getCurrentPositionWithinCap;
