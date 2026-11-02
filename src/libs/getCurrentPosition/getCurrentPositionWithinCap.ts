/**
 * Reads the device position but settles after CONST.GPS.SUBMIT_WAIT_TIMEOUT, so a submit never waits longer. A position that arrives after the cap is dropped.
 */
import Log from '@libs/Log';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import getCurrentPosition from '.';

type LocationSource = ValueOf<typeof CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE>;

function getCurrentPositionWithinCap(onSettled: (gpsCoords: {lat: number; long: number} | undefined, source: LocationSource) => void) {
    let isSettled = false;

    const settle: typeof onSettled = (gpsCoords, source) => {
        if (isSettled) {
            return;
        }
        isSettled = true;
        onSettled(gpsCoords, source);
    };

    setTimeout(() => settle(undefined, CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.TIMED_OUT), CONST.GPS.SUBMIT_WAIT_TIMEOUT);

    getCurrentPosition(
        (position) => settle({lat: position.coords.latitude, long: position.coords.longitude}, CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.WAITED),
        (error) => {
            Log.info('[getCurrentPositionWithinCap] getCurrentPosition failed', false, error);
            settle(undefined, CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.NONE);
        },
    );
}

export default getCurrentPositionWithinCap;
