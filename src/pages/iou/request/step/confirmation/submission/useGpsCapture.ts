import useOnyx from '@hooks/useOnyx';

import type {WriteReadyBarrier} from '@libs/API';
import getCurrentPosition from '@libs/getCurrentPosition';
import Log from '@libs/Log';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import markSubmitExpenseEnd from '@libs/telemetry/markSubmitExpenseEnd';

import type {GPSPoint as GpsPoint} from '@userActions/IOU/types/TrackExpenseTransactionParams';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function getCurrentPositionWithGeolocationSpan(onPosition: (gpsCoords?: {lat: number; long: number}) => void) {
    const parentSpan = getSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE);
    markSubmitExpenseEnd();

    startSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT, {
        name: CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT,
        op: CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT,
        parentSpan,
    });

    getCurrentPosition(
        (successData) => {
            onPosition({lat: successData.coords.latitude, long: successData.coords.longitude});
            endSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT);
        },
        (errorData) => {
            Log.info('[useGpsCapture] getCurrentPosition failed', false, errorData);
            onPosition();
            endSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT);
        },
    );
}

type SubmitWithGpsPointParams = {
    shouldCaptureGpsPoint: boolean;
    shouldHandleNavigation: boolean;
    writeBarrier: WriteReadyBarrier | undefined;
    write: (shouldHandleNavigation: boolean, gpsPoint: GpsPoint | undefined, writeBarrier: WriteReadyBarrier | undefined) => void;
};

/** Hook that captures a GPS point (from cached user location or a live geolocation read) before running an expense write. `submitWithGpsPoint` returns true when the write is handed off to a live geolocation read. */
function useGpsCapture() {
    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION);

    function submitWithGpsPoint({shouldCaptureGpsPoint, shouldHandleNavigation, writeBarrier, write}: SubmitWithGpsPointParams): boolean {
        if (!shouldCaptureGpsPoint) {
            write(shouldHandleNavigation, undefined, writeBarrier);
            markSubmitExpenseEnd();
            return false;
        }

        if (userLocation) {
            write(shouldHandleNavigation, {lat: userLocation.latitude, long: userLocation.longitude}, writeBarrier);
            markSubmitExpenseEnd();
            return false;
        }

        // No markSubmitExpenseEnd() here - getCurrentPositionWithGeolocationSpan ends the span itself before
        // opening the geolocation one, and the write runs in its callback.
        getCurrentPositionWithGeolocationSpan((gpsCoords) => write(shouldHandleNavigation, gpsCoords, writeBarrier));
        return true;
    }

    return {submitWithGpsPoint};
}

type SubmitWithGpsPoint = ReturnType<typeof useGpsCapture>['submitWithGpsPoint'];

export default useGpsCapture;
export type {SubmitWithGpsPoint};
