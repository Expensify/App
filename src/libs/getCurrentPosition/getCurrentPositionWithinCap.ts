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
